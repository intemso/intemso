import { StarIcon } from '@heroicons/react/20/solid';
import { StarIcon as StarOutline } from '@heroicons/react/24/outline';
import { clsx } from 'clsx';

interface StarRatingProps {
  rating: number;
  maxRating?: number;
  size?: 'sm' | 'md' | 'lg';
  showValue?: boolean;
  count?: number;
  className?: string;
}

const iconSizes = {
  sm: 'w-3.5 h-3.5',
  md: 'w-4 h-4',
  lg: 'w-5 h-5',
};

export default function StarRating({
  rating,
  maxRating = 5,
  size = 'md',
  showValue = true,
  count,
  className,
}: StarRatingProps) {
  return (
    <div className={clsx('inline-flex items-center gap-1', className)}>
      <div className="flex items-center">
        {Array.from({ length: maxRating }, (_, i) =>
          i < Math.floor(rating) ? (
            <StarIcon
              key={i}
              className={clsx(iconSizes[size], 'text-warning-400')}
            />
          ) : (
            <StarOutline
              key={i}
              className={clsx(iconSizes[size], 'text-gray-300')}
            />
          )
        )}
      </div>
      {showValue && (
        <span
          className={clsx('font-semibold text-gray-900', {
            'text-xs': size === 'sm',
            'text-sm': size === 'md',
            'text-base': size === 'lg',
          })}
        >
          {rating.toFixed(1)}
        </span>
      )}
      {count !== undefined && (
        <span className="text-xs text-gray-400">({count})</span>
      )}
    </div>
  );
}
