import { clsx } from 'clsx';

type BadgeVariant = 'primary' | 'success' | 'warning' | 'error' | 'gray';

interface BadgeProps {
  variant?: BadgeVariant;
  children: React.ReactNode;
  className?: string;
  dot?: boolean;
}

const variants: Record<BadgeVariant, string> = {
  primary: 'bg-primary-50 text-primary-700',
  success: 'bg-success-50 text-success-700',
  warning: 'bg-warning-50 text-warning-600',
  error: 'bg-error-50 text-error-600',
  gray: 'bg-gray-100 text-gray-600',
};

export default function Badge({
  variant = 'gray',
  children,
  className,
  dot = false,
}: BadgeProps) {
  return (
    <span
      className={clsx(
        'inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-xs font-medium',
        variants[variant],
        className
      )}
    >
      {dot && (
        <span
          className={clsx('w-1.5 h-1.5 rounded-full', {
            'bg-primary-500': variant === 'primary',
            'bg-success-500': variant === 'success',
            'bg-warning-500': variant === 'warning',
            'bg-error-500': variant === 'error',
            'bg-gray-400': variant === 'gray',
          })}
        />
      )}
      {children}
    </span>
  );
}
