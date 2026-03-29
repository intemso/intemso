'use client';

import { clsx } from 'clsx';
import { useState } from 'react';

interface AvatarProps {
  src?: string | null;
  name: string;
  size?: 'xs' | 'sm' | 'md' | 'lg' | 'xl' | '2xl';
  badge?: 'online' | 'verified';
  className?: string;
  /** Base64 blur placeholder from optimizer */
  blurDataUri?: string;
  /** Dominant color for loading background */
  dominantColor?: string;
}

const sizes = {
  xs: 'w-6 h-6 text-2xs',
  sm: 'w-8 h-8 text-xs',
  md: 'w-10 h-10 text-sm',
  lg: 'w-12 h-12 text-base',
  xl: 'w-16 h-16 text-lg',
  '2xl': 'w-28 h-28 text-2xl',
};

/** Pixel width for each size — used for ?w= param */
const sizePx: Record<string, number> = {
  xs: 24,
  sm: 32,
  md: 40,
  lg: 48,
  xl: 64,
  '2xl': 112,
};

function getInitials(name: string): string {
  return name
    .split(' ')
    .map((n) => n[0])
    .filter(Boolean)
    .slice(0, 2)
    .join('')
    .toUpperCase();
}

const bgColors = [
  'bg-primary-100 text-primary-700',
  'bg-success-100 text-success-700',
  'bg-warning-100 text-warning-700',
  'bg-purple-100 text-purple-700',
  'bg-pink-100 text-pink-700',
  'bg-indigo-100 text-indigo-700',
  'bg-cyan-100 text-cyan-700',
];

function getColorFromName(name: string): string {
  let hash = 0;
  for (let i = 0; i < name.length; i++) {
    hash = name.charCodeAt(i) + ((hash << 5) - hash);
  }
  return bgColors[Math.abs(hash) % bgColors.length];
}

export default function Avatar({
  src,
  name,
  size = 'md',
  badge,
  className,
  blurDataUri,
  dominantColor,
}: AvatarProps) {
  const [loaded, setLoaded] = useState(false);
  const [error, setError] = useState(false);

  // Apply Cloudinary on-the-fly resize if it's a Cloudinary URL, or use as-is
  const targetPx = (sizePx[size] || 40) * 2; // 2x for retina
  const optimizedSrc = src && !error
    ? src.includes('res.cloudinary.com') && !src.includes('/w_')
      ? src.replace('/upload/', `/upload/w_${targetPx},h_${targetPx},c_fill,g_face,f_auto,q_auto/`)
      : src
    : null;

  const showImage = optimizedSrc && !error;

  return (
    <div className={clsx('relative inline-flex shrink-0', className)}>
      {showImage ? (
        <div
          className={clsx('relative rounded-full overflow-hidden ring-2 ring-white', sizes[size])}
          style={{ backgroundColor: dominantColor || '#e5e7eb' }}
        >
          {/* Blur placeholder */}
          {blurDataUri && !loaded && (
            <img
              src={blurDataUri}
              alt=""
              aria-hidden
              className="absolute inset-0 w-full h-full object-cover"
              style={{ filter: 'blur(12px)', transform: 'scale(1.1)' }}
            />
          )}
          <img
            src={optimizedSrc}
            alt={name}
            className={clsx(
              'w-full h-full object-cover transition-opacity duration-300',
              loaded ? 'opacity-100' : 'opacity-0'
            )}
            loading="lazy"
            decoding="async"
            onLoad={() => setLoaded(true)}
            onError={() => setError(true)}
          />
        </div>
      ) : (
        <div
          className={clsx(
            'rounded-full flex items-center justify-center font-semibold ring-2 ring-white',
            sizes[size],
            getColorFromName(name)
          )}
        >
          {getInitials(name)}
        </div>
      )}
      {badge === 'online' && (
        <span className="absolute bottom-0 right-0 w-3 h-3 bg-success-500 border-2 border-white rounded-full" />
      )}
      {badge === 'verified' && (
        <span className="absolute -bottom-0.5 -right-0.5 w-4 h-4 bg-primary-600 border-2 border-white rounded-full flex items-center justify-center">
          <svg
            className="w-2 h-2 text-white"
            fill="currentColor"
            viewBox="0 0 20 20"
          >
            <path
              fillRule="evenodd"
              d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z"
              clipRule="evenodd"
            />
          </svg>
        </span>
      )}
    </div>
  );
}
