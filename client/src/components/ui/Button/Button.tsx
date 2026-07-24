// ---------------------------------------------------------------------------
// Button — primary interactive element with multiple variants.
//
// VARIANTS:
//   - primary:    Gradient emerald → teal, white text (default)
//   - secondary:  Slate background
//   - outline:    Transparent with border
//   - danger:     Red/destructive actions
//   - ghost:      Minimal, no background
//
// SIZES:
//   - sm:   py-2 px-3 text-xs
//   - md:   py-3.5 px-4 text-sm (default)
//   - lg:   py-4 px-6 text-base
//
// ACCESSIBILITY:
//   - focus:ring for keyboard navigation
//   - disabled state with opacity
//   - aria-disabled attribute
//   - loading spinner with aria-busy
// ---------------------------------------------------------------------------

import { forwardRef, ReactNode } from 'react';

type ButtonVariant = 'primary' | 'secondary' | 'outline' | 'danger' | 'ghost';
type ButtonSize = 'sm' | 'md' | 'lg';

interface ButtonProps {
  children: ReactNode;
  onClick?: () => void;
  type?: 'button' | 'submit' | 'reset';
  disabled?: boolean;
  loading?: boolean;
  variant?: ButtonVariant;
  size?: ButtonSize;
  fullWidth?: boolean;
  leftIcon?: ReactNode;
  rightIcon?: ReactNode;
  className?: string;
  'aria-label'?: string;
}

const variantStyles: Record<ButtonVariant, string> = {
  primary: `
    text-white
    focus:ring-2 focus:ring-emerald-500/40 focus:ring-offset-2 focus:ring-offset-slate-950
  `,
  secondary: `
    text-slate-200
    focus:ring-2 focus:ring-slate-500/40 focus:ring-offset-2 focus:ring-offset-slate-950
  `,
  outline: `
    text-slate-300 border border-slate-700 bg-transparent
    hover:bg-slate-800/50 hover:border-slate-600
    focus:ring-2 focus:ring-slate-500/40 focus:ring-offset-2 focus:ring-offset-slate-950
  `,
  danger: `
    text-white
    focus:ring-2 focus:ring-red-500/40 focus:ring-offset-2 focus:ring-offset-slate-950
  `,
  ghost: `
    text-slate-400 bg-transparent
    hover:bg-slate-800/60 hover:text-slate-200
    focus:ring-2 focus:ring-slate-500/40
  `,
};

const sizeStyles: Record<ButtonSize, string> = {
  sm: 'py-2 px-3 text-xs rounded-lg gap-1.5',
  md: 'py-3.5 px-4 text-sm rounded-xl gap-2',
  lg: 'py-4 px-6 text-base rounded-xl gap-2.5',
};

export const Button = forwardRef<HTMLButtonElement, ButtonProps>(
  (
    {
      children,
      onClick,
      type = 'button',
      disabled = false,
      loading = false,
      variant = 'primary',
      size = 'md',
      fullWidth = true,
      leftIcon,
      rightIcon,
      className = '',
      'aria-label': ariaLabel,
    },
    ref
  ) => {
    const baseStyles = `
      relative font-semibold overflow-hidden
      transition-all duration-300
      focus:outline-none
      disabled:opacity-50 disabled:cursor-not-allowed
      inline-flex items-center justify-center
    `;

    const isDisabled = disabled || loading;

    return (
      <button
        ref={ref}
        type={type}
        onClick={onClick}
        disabled={isDisabled}
        aria-disabled={isDisabled}
        aria-busy={loading}
        aria-label={ariaLabel}
        className={`
          group
          ${baseStyles}
          ${variantStyles[variant]}
          ${sizeStyles[size]}
          ${fullWidth ? 'w-full' : ''}
          ${className}
        `.replace(/\s+/g, ' ')}
      >
        {/* Background layers for variants with fills */}
        {variant === 'primary' && (
          <>
            <span className="absolute inset-0 bg-gradient-to-r from-emerald-600 to-teal-600 transition-opacity duration-300 group-hover:opacity-90" />
            <span className="absolute inset-0 opacity-0 group-hover:opacity-100 transition-opacity duration-500 bg-gradient-to-r from-emerald-500 to-emerald-400" />
            <span className="absolute inset-0 -translate-x-full group-hover:translate-x-full transition-transform duration-700 bg-gradient-to-r from-transparent via-white/10 to-transparent" />
          </>
        )}
        {variant === 'secondary' && (
          <>
            <span className="absolute inset-0 bg-slate-800 transition-opacity duration-300 group-hover:opacity-90" />
            <span className="absolute inset-0 opacity-0 group-hover:opacity-100 transition-opacity duration-500 bg-slate-700" />
          </>
        )}
        {variant === 'danger' && (
          <>
            <span className="absolute inset-0 bg-gradient-to-r from-red-600 to-rose-600 transition-opacity duration-300 group-hover:opacity-90" />
            <span className="absolute inset-0 opacity-0 group-hover:opacity-100 transition-opacity duration-500 bg-gradient-to-r from-red-500 to-red-400" />
          </>
        )}

        {/* Content */}
        <span className="relative flex items-center justify-center gap-2">
          {loading ? (
            <>
              <LoaderIcon />
              {children}
            </>
          ) : (
            <>
              {leftIcon}
              {children}
              {rightIcon}
            </>
          )}
        </span>
      </button>
    );
  }
);

Button.displayName = 'Button';

// ── Spinner icon for loading state ────────────────────────────────────────────

function LoaderIcon() {
  return (
    <svg
      className="animate-spin h-4 w-4"
      xmlns="http://www.w3.org/2000/svg"
      fill="none"
      viewBox="0 0 24 24"
      aria-hidden="true"
    >
      <circle
        className="opacity-25"
        cx="12"
        cy="12"
        r="10"
        stroke="currentColor"
        strokeWidth="4"
      />
      <path
        className="opacity-75"
        fill="currentColor"
        d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z"
      />
    </svg>
  );
}
