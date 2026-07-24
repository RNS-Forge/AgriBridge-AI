// ---------------------------------------------------------------------------
// Card — container component for grouping content.
//
// VARIANTS:
//   - default:   Slate-900/60 with blur, border-slate-800
//   - elevated:  Adds shadow and hover effects
//   - outlined:  Transparent bg, stronger border
//   - gradient:  Colored gradient overlay (emerald/teal)
//
// ACCESSIBILITY:
//   - role="region" with aria-labelledby when title provided
// ---------------------------------------------------------------------------

import { ReactNode, forwardRef, useId } from 'react';

type CardVariant = 'default' | 'elevated' | 'outlined' | 'gradient';

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
    bg-slate-900/60 backdrop-blur-sm
    border border-slate-800
    rounded-2xl
  `,
  elevated: `
    bg-slate-900/80 backdrop-blur-md
    border border-slate-800
    rounded-2xl
    shadow-lg shadow-slate-950/30
    hover:border-slate-700 hover:shadow-xl hover:shadow-slate-950/40
    transition-all duration-300
  `,
  outlined: `
    bg-transparent
    border-2 border-slate-700
    rounded-2xl
    hover:border-slate-600
    transition-colors duration-200
  `,
  gradient: `
    relative overflow-hidden
    bg-gradient-to-br from-slate-900 via-emerald-950/30 to-slate-900
    border border-slate-800
    rounded-2xl
  `,
};

const paddingStyles: Record<'none' | 'sm' | 'md' | 'lg', string> = {
  none: '',
  sm: 'p-4',
  md: 'p-6',
  lg: 'p-8',
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

    const interactiveStyles = isInteractive
      ? 'cursor-pointer hover:scale-[1.01] active:scale-[0.99]'
      : '';

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
          ${interactiveStyles}
          ${className}
        `.replace(/\s+/g, ' ')}
      >
        {/* Decorative orbs for gradient variant */}
        {variant === 'gradient' && (
          <>
            <div className="absolute top-0 right-0 w-64 h-64 bg-emerald-600/10 rounded-full blur-3xl -translate-y-1/2 translate-x-1/2 pointer-events-none" />
            <div className="absolute bottom-0 left-0 w-48 h-48 bg-teal-500/8 rounded-full blur-3xl translate-y-1/2 -translate-x-1/2 pointer-events-none" />
          </>
        )}

        {/* Header */}
        {(title || description) && (
          <div className="relative z-10 mb-4">
            {title && (
              <h3 id={titleId} className="text-lg font-bold text-slate-100">
                {title}
              </h3>
            )}
            {description && (
              <p className="text-sm text-slate-400 mt-1">{description}</p>
            )}
          </div>
        )}

        {/* Content */}
        <div className="relative z-10">{children}</div>
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
  return <h3 className="text-lg font-bold text-slate-100">{children}</h3>;
}

export function CardDescription({ children }: { children: ReactNode }) {
  return <p className="text-sm text-slate-400 mt-1">{children}</p>;
}

export function CardContent({ children }: { children: ReactNode }) {
  return <div>{children}</div>;
}

export function CardFooter({ children }: { children: ReactNode }) {
  return <div className="mt-4 pt-4 border-t border-slate-800">{children}</div>;
}
