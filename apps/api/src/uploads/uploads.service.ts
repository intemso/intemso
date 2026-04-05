/// <reference types="multer" />
import { Injectable, BadRequestException, Logger, OnModuleInit } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { v2 as cloudinary, UploadApiResponse } from 'cloudinary';
import * as crypto from 'crypto';

export interface UploadedFile {
  originalName: string;
  fileName: string;
  mimeType: string;
  size: number;
  url: string;
  publicId: string;
  /** Optimized image data — only present for image uploads */
  optimized?: {
    primaryUrl: string;
    blurDataUri: string;
    dominantColor: string;
    variants: Array<{
      suffix: string;
      width: number;
      url: string;
    }>;
  };
}

const ALLOWED_IMAGE_TYPES = ['image/jpeg', 'image/png', 'image/webp', 'image/gif'];
const ALLOWED_DOCUMENT_TYPES = [
  'application/pdf',
  'application/msword',
  'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
  'application/vnd.ms-excel',
  'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
  'text/plain',
  'text/csv',
];
const ALLOWED_ARCHIVE_TYPES = [
  'application/zip',
  'application/x-zip-compressed',
  'application/gzip',
];

const ALL_ALLOWED_TYPES = [...ALLOWED_IMAGE_TYPES, ...ALLOWED_DOCUMENT_TYPES, ...ALLOWED_ARCHIVE_TYPES];

const MAX_FILE_SIZE = 10 * 1024 * 1024; // 10 MB
const MAX_AVATAR_SIZE = 2 * 1024 * 1024; // 2 MB

// Magic byte signatures for real file type validation
const MAGIC_BYTES: Record<string, { offset: number; bytes: number[] }[]> = {
  'image/jpeg': [{ offset: 0, bytes: [0xFF, 0xD8, 0xFF] }],
  'image/png': [{ offset: 0, bytes: [0x89, 0x50, 0x4E, 0x47] }],
  'image/gif': [{ offset: 0, bytes: [0x47, 0x49, 0x46, 0x38] }],
  'image/webp': [{ offset: 8, bytes: [0x57, 0x45, 0x42, 0x50] }],
  'application/pdf': [{ offset: 0, bytes: [0x25, 0x50, 0x44, 0x46] }],
  'application/zip': [{ offset: 0, bytes: [0x50, 0x4B, 0x03, 0x04] }],
  'application/x-zip-compressed': [{ offset: 0, bytes: [0x50, 0x4B, 0x03, 0x04] }],
  'application/gzip': [{ offset: 0, bytes: [0x1F, 0x8B] }],
};

@Injectable()
export class UploadsService implements OnModuleInit {
  private readonly logger = new Logger(UploadsService.name);

  constructor(private config: ConfigService) {}

  onModuleInit() {
    cloudinary.config({
      cloud_name: this.config.get<string>('CLOUDINARY_CLOUD_NAME'),
      api_key: this.config.get<string>('CLOUDINARY_API_KEY'),
      api_secret: this.config.get<string>('CLOUDINARY_API_SECRET'),
      secure: true,
    });
    this.logger.log('Cloudinary configured');
  }

  async uploadAvatar(file: Express.Multer.File): Promise<UploadedFile> {
    this.validateFile(file, ALLOWED_IMAGE_TYPES, MAX_AVATAR_SIZE);
    return this.uploadToCloudinary(file, 'intemso/avatars', {
      transformation: [{ width: 256, height: 256, crop: 'fill', gravity: 'face' }],
    });
  }

  async uploadPortfolio(file: Express.Multer.File): Promise<UploadedFile> {
    this.validateFile(file, [...ALLOWED_IMAGE_TYPES, ...ALLOWED_DOCUMENT_TYPES], MAX_FILE_SIZE);
    return this.uploadToCloudinary(file, 'intemso/portfolios');
  }

  async uploadDeliverable(file: Express.Multer.File): Promise<UploadedFile> {
    this.validateFile(file, ALL_ALLOWED_TYPES, MAX_FILE_SIZE);
    return this.uploadToCloudinary(file, 'intemso/deliverables');
  }

  async uploadAttachment(file: Express.Multer.File): Promise<UploadedFile> {
    this.validateFile(file, ALL_ALLOWED_TYPES, MAX_FILE_SIZE);
    return this.uploadToCloudinary(file, 'intemso/attachments');
  }

  async uploadBlogImage(file: Express.Multer.File): Promise<UploadedFile> {
    this.validateFile(file, ALLOWED_IMAGE_TYPES, MAX_FILE_SIZE);
    return this.uploadToCloudinary(file, 'intemso/blog', {
      transformation: [{ width: 1200, crop: 'limit', quality: 'auto:good' }],
    });
  }

  async deleteFile(publicId: string): Promise<void> {
    try {
      await cloudinary.uploader.destroy(publicId);
    } catch (err) {
      this.logger.error(`Failed to delete Cloudinary asset: ${publicId}`, err);
    }
  }

  private validateFile(file: Express.Multer.File, allowedTypes: string[], maxSize: number): void {
    if (!file) {
      throw new BadRequestException('No file provided');
    }
    if (!allowedTypes.includes(file.mimetype)) {
      throw new BadRequestException(
        `File type ${file.mimetype} is not allowed. Allowed: ${allowedTypes.join(', ')}`,
      );
    }
    if (file.size > maxSize) {
      throw new BadRequestException(
        `File size ${(file.size / 1024 / 1024).toFixed(1)}MB exceeds the maximum of ${(maxSize / 1024 / 1024).toFixed(0)}MB`,
      );
    }

    // Validate magic bytes to prevent MIME spoofing
    const signatures = MAGIC_BYTES[file.mimetype];
    if (signatures && file.buffer) {
      const isValid = signatures.some((sig) => {
        if (file.buffer.length < sig.offset + sig.bytes.length) return false;
        return sig.bytes.every((byte, i) => file.buffer[sig.offset + i] === byte);
      });
      if (!isValid) {
        throw new BadRequestException(
          `File content does not match declared type ${file.mimetype}`,
        );
      }
    }
  }

  private async uploadToCloudinary(
    file: Express.Multer.File,
    folder: string,
    options: Record<string, any> = {},
  ): Promise<UploadedFile> {
    const hash = crypto.randomBytes(8).toString('hex');
    const isImage = ALLOWED_IMAGE_TYPES.includes(file.mimetype);

    const result: UploadApiResponse = await new Promise((resolve, reject) => {
      const stream = cloudinary.uploader.upload_stream(
        {
          folder,
          public_id: hash,
          resource_type: isImage ? 'image' : 'raw',
          ...(isImage && {
            format: 'webp',
            quality: 'auto:good',
          }),
          ...options,
        },
        (error, result) => {
          if (error || !result) return reject(error || new Error('Upload failed'));
          resolve(result);
        },
      );
      stream.end(file.buffer);
    });

    const uploadedFile: UploadedFile = {
      originalName: file.originalname,
      fileName: result.public_id,
      mimeType: file.mimetype,
      size: result.bytes,
      url: result.secure_url,
      publicId: result.public_id,
    };

    // Generate image variants via Cloudinary URL transforms
    if (isImage) {
      const baseUrl = result.secure_url.replace(/\/upload\//, '/upload/');
      const variants = [
        { suffix: 'sm', width: 200 },
        { suffix: 'md', width: 640 },
        { suffix: 'lg', width: 1200 },
      ].map((v) => ({
        suffix: v.suffix,
        width: v.width,
        url: result.secure_url.replace('/upload/', `/upload/w_${v.width},c_limit,f_auto,q_auto/`),
      }));

      // Blur placeholder via Cloudinary transform
      const blurUrl = result.secure_url.replace(
        '/upload/',
        '/upload/w_16,h_16,c_fill,e_blur:1000,f_webp,q_10/',
      );

      // Dominant color from Cloudinary (available in result.colors if requested)
      const dominantColor = result.colors?.[0]?.[0] || '#666666';

      uploadedFile.optimized = {
        primaryUrl: result.secure_url.replace('/upload/', '/upload/f_auto,q_auto/'),
        blurDataUri: blurUrl,
        dominantColor,
        variants,
      };

      // Use the auto-optimized URL as primary
      uploadedFile.url = uploadedFile.optimized.primaryUrl;
    }

    this.logger.log(`Uploaded to Cloudinary: ${result.public_id} (${(result.bytes / 1024).toFixed(1)}KB)`);
    return uploadedFile;
  }
}
