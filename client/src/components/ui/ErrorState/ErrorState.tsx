import { forwardRef, ReactNode } from "react";

interface ErrorStateProps {
  title: string;
  message?: string;
  details?: string;
  onRetry?: () => void;
  retryText?: string;
  action?: ReactNode;
  icon?: ReactNode;
  className?: string;
}

export const ErrorState = forwardRef<HTMLDivElement, ErrorStateProps>(
  (
    {
      title,
      message,
      details,
      onRetry,
      retryText = "Try Again",
      action,
      icon,
      className = "",
    },
    ref
  ) => {
    return (
      <div
        ref={ref}
        role="alert"
        aria-live="assertive"
        className={`
          flex flex-col items-center justify-center
          rounded-xl
          border border-red-200
          bg-red-50
          p-6
          text-center
          ${className}
        `.replace(/\s+/g, ' ')}
      >
        {/* Icon */}
        <div className="mb-4">
          {icon ?? (
            <svg
              className="h-12 w-12 text-red-600"
              fill="none"
              stroke="currentColor"
              strokeWidth={1.8}
              viewBox="0 0 24 24"
              aria-hidden="true"
            >
              <circle cx="12" cy="12" r="9" />
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                d="M12 8v4m0 4h.01"
              />
            </svg>
          )}
        </div>

        {/* Title */}
        <h2 className="text-base font-semibold text-red-700">
          {title}
        </h2>

        {/* Message */}
        {message && (
          <p className="mt-2 max-w-md text-sm text-gray-500">
            {message}
          </p>
        )}

        {/* Details */}
        {details && (
          <pre className="mt-4 max-w-full overflow-auto rounded-lg bg-gray-100 p-3 text-left text-xs text-gray-600">
            {details}
          </pre>
        )}

        {/* Actions */}
        {(onRetry || action) && (
          <div className="mt-6 flex flex-wrap justify-center gap-3">
            {onRetry && (
              <button
                type="button"
                onClick={onRetry}
                className={`
                  rounded-lg
                  bg-red-600
                  px-4
                  py-2
                  text-sm
                  font-medium
                  text-white
                  transition-colors
                  hover:bg-red-700
                  focus:outline-none
                  focus:ring-2
                  focus:ring-red-500
                  focus:ring-offset-2
                `.replace(/\s+/g, ' ')}
              >
                {retryText}
              </button>
            )}

            {action}
          </div>
        )}
      </div>
    );
  }
);

ErrorState.displayName = "ErrorState";