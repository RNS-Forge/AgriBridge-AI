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
    bg-blue-600 text-white
    hover:bg-blue-700
    focus:ring-2 focus:ring-blue-500 focus:ring-offset-2
  `,
  secondary: `
    bg-white text-gray-700 border border-gray-200
    hover:bg-gray-50
    focus:ring-2 focus:ring-blue-500 focus:ring-offset-2
  `,
  outline: `
    bg-transparent text-gray-700 border border-gray-300
    hover:bg-gray-50
    focus:ring-2 focus:ring-blue-500 focus:ring-offset-2
  `,
  danger: `
    bg-red-600 text-white
    hover:bg-red-700
    focus:ring-2 focus:ring-red-500 focus:ring-offset-2
  `,
  ghost: `
    bg-transparent text-gray-700
    hover:bg-gray-100
    focus:ring-2 focus:ring-blue-500 focus:ring-offset-2
  `,
};

const sizeStyles: Record<ButtonSize, string> = {
  sm: 'py-2 px-3 text-xs rounded-lg gap-1.5',
  md: 'py-2.5 px-4 text-sm rounded-lg gap-2',
  lg: 'py-3 px-6 text-base rounded-lg gap-2.5',
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
      transition-colors duration-200
      focus:outline-none
      disabled:opacity-50 disabled:cursor-not-allowed
      inline-flex items-center justify-center
      shadow-sm hover:shadow-md
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
      className="animate-spin h-4 w-4 text-gray-500"
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