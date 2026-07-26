import { ReactNode, forwardRef, useId } from 'react';

type CardVariant = 'default' | 'elevated' | 'outlined';

interface CardProps {
  children: ReactNode;
  variant?: CardVariant;
  padding?: 'none' | 'sm' | 'md' | 'lg';
  className?: string;
  title?: string;
  description?: string;
  onClick?: () => void;
  as?: 'div' | 'article' | 'section';
}

const variantStyles: Record<CardVariant, string> = {
  default: `
    bg-white
    border border-gray-200
    rounded-xl
  `,
  elevated: `
    bg-white
    border border-gray-200
    rounded-xl
    shadow-sm
    hover:shadow-md
    transition-all duration-200
  `,
  outlined: `
    bg-white
    border-2 border-gray-300
    rounded-xl
  `,
};

const paddingStyles: Record<'none' | 'sm' | 'md' | 'lg', string> = {
  none: '',
  sm: 'p-4',
  md: 'p-5',
  lg: 'p-6',
};

export const Card = forwardRef<HTMLDivElement, CardProps>(
  (
    {
      children,
      variant = 'default',
      padding = 'md',
      className = '',
      title,
      description,
      onClick,
      as: Component = 'div',
    },
    ref
  ) => {
    const titleId = useId();
    const isInteractive = !!onClick;

    return (
      <Component
        ref={ref}
        role={title ? 'region' : undefined}
        aria-labelledby={title ? titleId : undefined}
        onClick={onClick}
        tabIndex={isInteractive ? 0 : undefined}
        onKeyDown={
          isInteractive
            ? (e) => {
                if (e.key === 'Enter' || e.key === ' ') {
                  e.preventDefault();
                  onClick?.();
                }
              }
            : undefined
        }
        className={`
          ${variantStyles[variant]}
          ${paddingStyles[padding]}
          ${className}
        `.replace(/\s+/g, ' ')}
      >
        {/* Header */}
        {(title || description) && (
          <div className="mb-4">
            {title && (
              <h3 id={titleId} className="text-base font-semibold text-gray-900">
                {title}
              </h3>
            )}
            {description && (
              <p className="text-sm text-gray-500 mt-1">{description}</p>
            )}
          </div>
        )}

        {/* Content */}
        <div>{children}</div>
      </Component>
    );
  }
);

Card.displayName = 'Card';

// ── Card subcomponents ───────────────────────────────────────────────────────
export function CardHeader({ children }: { children: ReactNode }) {
  return <div className="mb-4">{children}</div>;
}

export function CardTitle({ children }: { children: ReactNode }) {
  return <h3 className="text-base font-semibold text-gray-900">{children}</h3>;
}

export function CardDescription({ children }: { children: ReactNode }) {
  return <p className="text-sm text-gray-500 mt-1">{children}</p>;
}

export function CardContent({ children }: { children: ReactNode }) {
  return <div>{children}</div>;
}

export function CardFooter({ children }: { children: ReactNode }) {
  return (
    <div className="mt-4 pt-4 border-t border-gray-200">{children}</div>
  );
}