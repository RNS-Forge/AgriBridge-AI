// ---------------------------------------------------------------------------
// Badge — small semantic label component.
//
// VARIANTS:
//   - default:   Slate/neutral
//   - primary:   Emerald/success
//   - warning:   Amber/warning
//   - danger:    Red/error
//   - info:      Blue/info
//
// SIZES:
//   - sm:  text-xs
//   - md:  text-sm (default)
// ---------------------------------------------------------------------------

import { forwardRef, ReactNode } from 'react';

type BadgeVariant = 'default' | 'primary' | 'warning' | 'danger' | 'info';
type BadgeSize = 'sm' | 'md';

interface BadgeProps {
  children: ReactNode;
  variant?: BadgeVariant;
  size?: BadgeSize;
  icon?: ReactNode;
  className?: string;
}

const variantStyles: Record<BadgeVariant, string> = {
  default: 'bg-slate-800 text-slate-300 border border-slate-700',
  primary: 'bg-emerald-950/50 text-emerald-400 border border-emerald-500/30',
  warning: 'bg-amber-950/50 text-amber-400 border border-amber-500/30',
  danger: 'bg-red-950/50 text-red-400 border border-red-500/30',
  info: 'bg-blue-950/50 text-blue-400 border border-blue-500/30',
};

const sizeStyles: Record<BadgeSize, string> = {
  sm: 'px-2 py-1 text-xs',
  md: 'px-3 py-1.5 text-sm',
};

export const Badge = forwardRef<HTMLSpanElement, BadgeProps>(
  (
    {
      children,
      variant = 'default',
      size = 'md',
      icon,
      className = '',
    },
    ref
  ) => {
    return (
      <span
        ref={ref}
        className={`
          inline-flex items-center gap-1.5
          rounded-full font-semibold
          whitespace-nowrap
          ${variantStyles[variant]}
          ${sizeStyles[size]}
          ${className}
        `.replace(/\s+/g, ' ')}
      >
        {icon}
        {children}
      </span>
    );
  }
);

Badge.displayName = 'Badge';
