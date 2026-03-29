import { Injectable, Logger } from '@nestjs/common';
import sharp = require('sharp');
import * as fs from 'fs';
import * as path from 'path';
import * as crypto from 'crypto';

/**
 * Image variant presets — each defines a max dimension + quality ceiling.
 * The optimizer adaptively lowers quality until the result is under the target size.
 */
export interface ImageVariant {
  suffix: string;
  maxWidth: number;
  maxHeight: number;
  /** Max quality ceiling (optimizer may go lower to hit target) */
  quality: number;
  /** Target file size in bytes — optimizer iterates to hit this */
  targetBytes: number;
}

export interface OptimizedResult {
  /** Original file info */
  original: { size: number; width: number; height: number; format: string };
  /** All generated variants */
  variants: Array<{
    suffix: string;
    fileName: string;
    format: 'webp' | 'avif';
    width: number;
    height: number;
    size: number;
    url: string;
  }>;
  /** Primary variant URL (smallest webp that meets quality threshold) */
  primaryUrl: string;
  /** Tiny blur placeholder (base64 data URI, ~200 bytes) */
  blurDataUri: string;
  /** Dominant color hex */
  dominantColor: string;
  /** Compression ratio achieved */
  compressionRatio: number;
}

/** Predefined variant presets for different use cases */
const VARIANT_PRESETS: Record<string, ImageVariant[]> = {
  avatar: [
    { suffix: 'sm', maxWidth: 48, maxHeight: 48, quality: 70, targetBytes: 3_000 },
    { suffix: 'md', maxWidth: 96, maxHeight: 96, quality: 72, targetBytes: 5_000 },
    { suffix: 'lg', maxWidth: 256, maxHeight: 256, quality: 75, targetBytes: 10_000 },
  ],
  portfolio: [
    { suffix: 'thumb', maxWidth: 200, maxHeight: 200, quality: 65, targetBytes: 6_000 },
    { suffix: 'md', maxWidth: 600, maxHeight: 600, quality: 70, targetBytes: 10_000 },
    { suffix: 'lg', maxWidth: 1200, maxHeight: 900, quality: 75, targetBytes: 40_000 },
  ],
  general: [
    { suffix: 'sm', maxWidth: 320, maxHeight: 320, quality: 65, targetBytes: 6_000 },
    { suffix: 'md', maxWidth: 640, maxHeight: 640, quality: 70, targetBytes: 10_000 },
    { suffix: 'lg', maxWidth: 1280, maxHeight: 960, quality: 75, targetBytes: 35_000 },
  ],
};

@Injectable()
export class ImageOptimizerService {
  private readonly logger = new Logger(ImageOptimizerService.name);

  /**
   * Core optimization pipeline — processes a raw image buffer through:
   *
   * 1. **Metadata extraction** — dimensions, format, dominant color
   * 2. **Blur placeholder generation** — 16px wide JPEG, base64-encoded (~200B)
   * 3. **Multi-variant generation** with adaptive quality:
   *    - Resize to variant dimensions (cover fit, Lanczos3 kernel)
   *    - Apply subtle sharpening post-resize (unsharp mask)
   *    - Convert to WebP (primary) with chroma subsampling
   *    - Binary-search quality to hit target file size
   *    - If WebP overshoots, try AVIF (20-40% smaller than WebP)
   *    - Strip all EXIF/metadata to save bytes
   * 4. **Returns** all variant URLs + blur placeholder + compression stats
   */
  async optimize(
    buffer: Buffer,
    outputDir: string,
    baseUrl: string,
    subfolder: string,
    preset: keyof typeof VARIANT_PRESETS = 'general',
  ): Promise<OptimizedResult> {
    const variants = VARIANT_PRESETS[preset] || VARIANT_PRESETS.general;
    const image = sharp(buffer);
    const metadata = await image.metadata();

    const width = metadata.width || 0;
    const height = metadata.height || 0;
    const format = metadata.format || 'unknown';
    const originalSize = buffer.length;

    // ── Step 1: Extract dominant color ──
    const dominantColor = await this.extractDominantColor(buffer);

    // ── Step 2: Generate blur placeholder (tiny 16px WebP → base64 data URI) ──
    const blurDataUri = await this.generateBlurPlaceholder(buffer);

    // ── Step 3: Generate optimized variants ──
    const hash = crypto.randomBytes(12).toString('hex');
    const generatedVariants: OptimizedResult['variants'] = [];

    for (const variant of variants) {
      const result = await this.generateVariant(
        buffer,
        variant,
        hash,
        outputDir,
        baseUrl,
        subfolder,
      );
      generatedVariants.push(result);
    }

    // Primary URL = smallest variant that's labeled 'md' or the first one
    const primary =
      generatedVariants.find((v) => v.suffix === 'md') || generatedVariants[0];

    const totalOptimizedSize = generatedVariants.reduce((sum, v) => sum + v.size, 0);
    const avgVariantSize = totalOptimizedSize / generatedVariants.length;

    this.logger.log(
      `Optimized: ${(originalSize / 1024).toFixed(1)}KB → variants [${generatedVariants.map((v) => `${v.suffix}:${(v.size / 1024).toFixed(1)}KB`).join(', ')}] | ratio: ${(originalSize / avgVariantSize).toFixed(1)}x`,
    );

    return {
      original: { size: originalSize, width, height, format },
      variants: generatedVariants,
      primaryUrl: primary.url,
      blurDataUri,
      dominantColor,
      compressionRatio: parseFloat((originalSize / avgVariantSize).toFixed(1)),
    };
  }

  /**
   * Generates a single optimized variant using adaptive quality binary search.
   *
   * Algorithm:
   * 1. Resize image to variant's max dimensions (preserving aspect ratio)
   * 2. Apply post-resize sharpening (unsharp mask: sigma 0.5, flat 1.0)
   * 3. Try WebP first at ceiling quality
   * 4. If output > targetBytes, binary-search quality downward (min quality: 20)
   * 5. If WebP at min quality still exceeds target, switch to AVIF
   * 6. If AVIF also fails, reduce dimensions by 25% and retry
   * 7. Strip all metadata throughout
   */
  private async generateVariant(
    buffer: Buffer,
    variant: ImageVariant,
    hash: string,
    outputDir: string,
    baseUrl: string,
    subfolder: string,
  ): Promise<OptimizedResult['variants'][0]> {
    let targetWidth = variant.maxWidth;
    let targetHeight = variant.maxHeight;
    const targetBytes = variant.targetBytes;
    let attempts = 0;
    const maxAttempts = 4;

    while (attempts < maxAttempts) {
      attempts++;

      // ── Try WebP with adaptive quality ──
      const webpResult = await this.compressToTarget(
        buffer,
        targetWidth,
        targetHeight,
        'webp',
        variant.quality,
        targetBytes,
      );

      if (webpResult.size <= targetBytes) {
        const fileName = `${hash}_${variant.suffix}.webp`;
        const filePath = path.join(outputDir, subfolder, fileName);
        await fs.promises.writeFile(filePath, webpResult.buffer);
        return {
          suffix: variant.suffix,
          fileName,
          format: 'webp',
          width: webpResult.width,
          height: webpResult.height,
          size: webpResult.size,
          url: `${baseUrl}/api/v1/uploads/${subfolder}/${fileName}`,
        };
      }

      // ── WebP failed — try AVIF (typically 20-40% smaller) ──
      const avifResult = await this.compressToTarget(
        buffer,
        targetWidth,
        targetHeight,
        'avif',
        Math.min(variant.quality, 60),
        targetBytes,
      );

      if (avifResult.size <= targetBytes) {
        const fileName = `${hash}_${variant.suffix}.avif`;
        const filePath = path.join(outputDir, subfolder, fileName);
        await fs.promises.writeFile(filePath, avifResult.buffer);
        return {
          suffix: variant.suffix,
          fileName,
          format: 'avif',
          width: avifResult.width,
          height: avifResult.height,
          size: avifResult.size,
          url: `${baseUrl}/api/v1/uploads/${subfolder}/${fileName}`,
        };
      }

      // ── Both formats failed — reduce dimensions by 25% ──
      targetWidth = Math.round(targetWidth * 0.75);
      targetHeight = Math.round(targetHeight * 0.75);
    }

    // ── Absolute fallback: force smallest possible ──
    const fallback = await this.forceCompress(buffer, targetWidth, targetHeight);
    const fileName = `${hash}_${variant.suffix}.webp`;
    const filePath = path.join(outputDir, subfolder, fileName);
    await fs.promises.writeFile(filePath, fallback.buffer);

    return {
      suffix: variant.suffix,
      fileName,
      format: 'webp',
      width: fallback.width,
      height: fallback.height,
      size: fallback.size,
      url: `${baseUrl}/api/v1/uploads/${subfolder}/${fileName}`,
    };
  }

  /**
   * Binary-search compression: finds the optimal quality that produces output
   * closest to (but under) the target byte size.
   *
   * Steps:
   * 1. Start at `maxQuality`, compress, check size
   * 2. If over target: low = current, quality = (current + low) / 2
   * 3. If under target with margin: high = current, quality = (current + high) / 2
   * 4. Converge in ~5-7 iterations (log2(quality range))
   */
  private async compressToTarget(
    buffer: Buffer,
    maxWidth: number,
    maxHeight: number,
    format: 'webp' | 'avif',
    maxQuality: number,
    targetBytes: number,
  ): Promise<{ buffer: Buffer; size: number; width: number; height: number }> {
    const MIN_QUALITY = 15;
    let lo = MIN_QUALITY;
    let hi = maxQuality;
    let bestResult: Buffer | null = null;
    let bestMeta = { width: 0, height: 0 };

    // Start with max quality to check if we're already under target
    const initial = await this.processImage(buffer, maxWidth, maxHeight, format, hi);
    if (initial.buffer.length <= targetBytes) {
      return {
        buffer: initial.buffer,
        size: initial.buffer.length,
        width: initial.info.width,
        height: initial.info.height,
      };
    }

    // Binary search for optimal quality
    let iterations = 0;
    while (lo <= hi && iterations < 8) {
      iterations++;
      const mid = Math.round((lo + hi) / 2);
      const result = await this.processImage(buffer, maxWidth, maxHeight, format, mid);

      if (result.buffer.length <= targetBytes) {
        bestResult = result.buffer;
        bestMeta = { width: result.info.width, height: result.info.height };
        lo = mid + 1; // Try higher quality
      } else {
        hi = mid - 1; // Need lower quality
      }
    }

    // If we found a good result, use it; otherwise use the lowest quality attempt
    if (bestResult) {
      return {
        buffer: bestResult,
        size: bestResult.length,
        ...bestMeta,
      };
    }

    // Lowest quality attempt
    const lowest = await this.processImage(buffer, maxWidth, maxHeight, format, MIN_QUALITY);
    return {
      buffer: lowest.buffer,
      size: lowest.buffer.length,
      width: lowest.info.width,
      height: lowest.info.height,
    };
  }

  /**
   * Core image processing pipeline for a single quality level.
   *
   * Pipeline:
   * 1. Resize with Lanczos3 kernel (sharpest downscaling algorithm)
   * 2. Apply unsharp mask (compensates for softening from resize)
   * 3. Strip all EXIF/ICC/IPTC metadata
   * 4. Encode to target format with specific optimizations:
   *    - WebP: smartSubsample for chroma, effort 6 (balance of speed/compression)
   *    - AVIF: effort 4 (faster than max), chroma subsampling 4:2:0
   */
  private async processImage(
    buffer: Buffer,
    maxWidth: number,
    maxHeight: number,
    format: 'webp' | 'avif',
    quality: number,
  ): Promise<{ buffer: Buffer; info: sharp.OutputInfo }> {
    let pipeline = sharp(buffer)
      .resize(maxWidth, maxHeight, {
        fit: 'inside',
        withoutEnlargement: true,
        kernel: sharp.kernel.lanczos3,
      })
      .sharpen({ sigma: 0.5, m1: 1.0, m2: 0.7 })
      .removeAlpha() // Remove alpha for photos (saves bytes)
      .toColorspace('srgb');

    if (format === 'webp') {
      pipeline = pipeline.webp({
        quality,
        smartSubsample: true,
        effort: 6,
        preset: 'photo',
      });
    } else {
      pipeline = pipeline.avif({
        quality,
        effort: 4,
        chromaSubsampling: '4:2:0',
      });
    }

    const { data, info } = await pipeline.toBuffer({ resolveWithObject: true });
    return { buffer: data, info };
  }

  /**
   * Absolute fallback: aggressive compression for when nothing else works.
   * Forces 30x30px WebP at quality 15 with heavy chroma subsampling.
   */
  private async forceCompress(
    buffer: Buffer,
    maxWidth: number,
    maxHeight: number,
  ): Promise<{ buffer: Buffer; size: number; width: number; height: number }> {
    const finalWidth = Math.min(maxWidth, 30);
    const finalHeight = Math.min(maxHeight, 30);

    const { data, info } = await sharp(buffer)
      .resize(finalWidth, finalHeight, {
        fit: 'cover',
        kernel: sharp.kernel.lanczos3,
      })
      .removeAlpha()
      .webp({ quality: 15, smartSubsample: true, effort: 6 })
      .toBuffer({ resolveWithObject: true });

    return { buffer: data, size: data.length, width: info.width, height: info.height };
  }

  /**
   * Generates a tiny blur placeholder for progressive loading.
   * Creates a 16px-wide image → encodes as minimal WebP → base64 data URI.
   * Result is typically 200-400 bytes — embeddable inline in HTML/JSON.
   */
  private async generateBlurPlaceholder(buffer: Buffer): Promise<string> {
    const tiny = await sharp(buffer)
      .resize(16, 16, { fit: 'inside', kernel: sharp.kernel.nearest })
      .blur(2)
      .removeAlpha()
      .webp({ quality: 20, effort: 0 })
      .toBuffer();

    return `data:image/webp;base64,${tiny.toString('base64')}`;
  }

  /**
   * Extracts the dominant color from an image by:
   * 1. Resizing to 1x1 pixel (average color)
   * 2. Reading the raw RGB values
   * 3. Converting to hex
   */
  private async extractDominantColor(buffer: Buffer): Promise<string> {
    const { data } = await sharp(buffer)
      .resize(1, 1, { fit: 'cover' })
      .removeAlpha()
      .raw()
      .toBuffer({ resolveWithObject: true });

    const r = data[0].toString(16).padStart(2, '0');
    const g = data[1].toString(16).padStart(2, '0');
    const b = data[2].toString(16).padStart(2, '0');
    return `#${r}${g}${b}`;
  }

  /**
   * Quick single-image optimization — processes a buffer and returns
   * the smallest possible output (single variant, no multi-size).
   * Used for inline optimization where only one output is needed.
   */
  async optimizeSingle(
    buffer: Buffer,
    maxWidth: number,
    maxHeight: number,
    targetBytes = 10_000,
  ): Promise<{ buffer: Buffer; format: 'webp' | 'avif'; width: number; height: number; size: number }> {
    // Try WebP first
    const webp = await this.compressToTarget(buffer, maxWidth, maxHeight, 'webp', 80, targetBytes);
    if (webp.size <= targetBytes) {
      return { ...webp, format: 'webp' };
    }

    // Try AVIF
    const avif = await this.compressToTarget(buffer, maxWidth, maxHeight, 'avif', 60, targetBytes);
    if (avif.size <= targetBytes) {
      return { ...avif, format: 'avif' };
    }

    // Return whichever is smaller
    return webp.size <= avif.size
      ? { ...webp, format: 'webp' }
      : { ...avif, format: 'avif' };
  }

  /**
   * Checks if a file is an image type that can be optimized.
   */
  isOptimizableImage(mimetype: string): boolean {
    return ['image/jpeg', 'image/png', 'image/webp', 'image/gif', 'image/avif', 'image/tiff', 'image/bmp'].includes(mimetype);
  }

  /**
   * Get variant presets for a given category.
   */
  getPresets(): Record<string, ImageVariant[]> {
    return VARIANT_PRESETS;
  }
}
