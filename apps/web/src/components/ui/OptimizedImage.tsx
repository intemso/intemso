'use client';

import { useState, useRef, useEffect, ImgHTMLAttributes } from 'react';
import { clsx } from 'clsx';

interface OptimizedImageProps extends Omit<ImgHTMLAttributes<HTMLImageElement>, 'src' | 'placeholder'> {
  /** Primary image URL */
  src: string;
  /** Base64 blur data URI for placeholder */
  blurDataUri?: string;
  /** Dominant color hex for background while loading */
  dominantColor?: string;
  /** srcSet variants — [{url, width}] */
  variants?: { url: string; width: number }[];
  /** Fallback URL if primary fails */
  fallbackSrc?: string;
  /** Whether to lazy-load via IntersectionObserver (default true) */
  lazy?: boolean;
  /** Aspect ratio for skeleton (e.g. "16/9", "1/1") */
  aspectRatio?: string;
  /** Whether to show a fade-in animation (default true) */
  animate?: boolean;
}

/**
 * OptimizedImage — progressive-loading image component with:
 *  - IntersectionObserver-based lazy loading
 *  - Blur placeholder → full image fade-in
 *  - Dominant color background while loading
 *  - srcSet from optimizer variants for responsive sizing
 *  - Error fallback to initials/placeholder
 */
export default function OptimizedImage({
  src,
  blurDataUri,
  dominantColor,
  variants,
  fallbackSrc,
  lazy = true,
  aspectRatio,
  animate = true,
  alt = '',
  className,
  style,
  ...rest
}: OptimizedImageProps) {
  const [loaded, setLoaded] = useState(false);
  const [error, setError] = useState(false);
  const [inView, setInView] = useState(!lazy);
  const imgRef = useRef<HTMLDivElement>(null);

  // IntersectionObserver for lazy loading
  useEffect(() => {
    if (!lazy || inView) return;
    const el = imgRef.current;
    if (!el) return;

    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
          setInView(true);
          observer.disconnect();
        }
      },
      { rootMargin: '200px' }
    );
    observer.observe(el);
    return () => observer.disconnect();
  }, [lazy, inView]);

  // Build srcSet from variants
  const srcSet = variants?.length
    ? variants.map((v) => `${v.url} ${v.width}w`).join(', ')
    : undefined;

  const sizes = variants?.length
    ? variants
        .sort((a, b) => a.width - b.width)
        .map((v, i, arr) =>
          i < arr.length - 1
            ? `(max-width: ${v.width * 1.5}px) ${v.width}px`
            : `${v.width}px`
        )
        .join(', ')
    : undefined;

  const handleLoad = () => setLoaded(true);
  const handleError = () => {
    setError(true);
    setLoaded(true);
  };

  const effectiveSrc = error && fallbackSrc ? fallbackSrc : src;

  return (
    <div
      ref={imgRef}
      className={clsx('relative overflow-hidden', className)}
      style={{
        aspectRatio,
        backgroundColor: dominantColor || '#e5e7eb',
        ...style,
      }}
    >
      {/* Blur placeholder layer */}
      {blurDataUri && !loaded && (
        <img
          src={blurDataUri}
          alt=""
          aria-hidden
          className="absolute inset-0 w-full h-full object-cover"
          style={{ filter: 'blur(20px)', transform: 'scale(1.1)' }}
        />
      )}

      {/* Full image — only starts loading when in viewport */}
      {inView && (
        <img
          src={effectiveSrc}
          srcSet={!error ? srcSet : undefined}
          sizes={!error ? sizes : undefined}
          alt={alt}
          onLoad={handleLoad}
          onError={handleError}
          className={clsx(
            'w-full h-full object-cover',
            animate && 'transition-opacity duration-500',
            loaded ? 'opacity-100' : 'opacity-0'
          )}
          loading={lazy ? 'lazy' : 'eager'}
          decoding="async"
          {...rest}
        />
      )}
    </div>
  );
}

/**
 * Build OptimizedImage props from an UploadedFile's optimized field
 */
export function optimizedImageProps(optimized?: {
  primaryUrl: string;
  blurDataUri: string;
  dominantColor: string;
  variants: { url: string; width: number }[];
}) {
  if (!optimized) return {};
  return {
    blurDataUri: optimized.blurDataUri,
    dominantColor: optimized.dominantColor,
    variants: optimized.variants?.map((v) => ({ url: v.url, width: v.width })),
  };
}
