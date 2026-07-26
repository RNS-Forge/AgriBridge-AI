import { forwardRef, ReactNode } from "react";

interface EmptyStateProps {
  title: string;
  description?: string;
  icon?: ReactNode;
  action?: ReactNode;
  className?: string;
}

export const EmptyState = forwardRef<HTMLDivElement, EmptyStateProps>(
  (
    {
      title,
      description,
      icon,
      action,
      className = "",
    },
    ref
  ) => {
    return (
      <div
        ref={ref}
        role="status"
        aria-live="polite"
        className={`
          flex flex-col items-center justify-center
          rounded-xl
          p-6
          text-center
          ${className}
        `.replace(/\s+/g, ' ')}
      >
        {/* Icon */}
        <div className="mb-4 text-gray-400">
          {icon ?? (
            <svg
              className="h-12 w-12"
              fill="none"
              stroke="currentColor"
              strokeWidth={1.6}
              viewBox="0 0 24 24"
              aria-hidden="true"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                d="M4 7h16M4 12h10M4 17h16"
              />
            </svg>
          )}
        </div>

        {/* Title */}
        <h2 className="text-base font-semibold text-gray-900">
          {title}
        </h2>

        {/* Description */}
        {description && (
          <p className="mt-2 max-w-md text-sm text-gray-500">
            {description}
          </p>
        )}

        {/* Action */}
        {action && (
          <div className="mt-4 flex justify-center">
            {action}
          </div>
        )}
      </div>
    );
  }
);

EmptyState.displayName = "EmptyState";