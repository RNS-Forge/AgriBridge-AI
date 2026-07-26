import { forwardRef } from "react";

type LoaderSize = "sm" | "md" | "lg";

interface LoaderProps {
  size?: LoaderSize;
  text?: string;
  fullHeight?: boolean;
  className?: string;
  colorClass?: string;
  "aria-label"?: string;
}

const sizeClasses: Record<LoaderSize, string> = {
  sm: "h-4 w-4",
  md: "h-8 w-8",
  lg: "h-12 w-12",
};

export const Loader = forwardRef<HTMLDivElement, LoaderProps>(
  (
    {
      size = "md",
      text,
      fullHeight = false,
      className = "",
      colorClass = "text-blue-600",
      "aria-label": ariaLabel = "Loading",
    },
    ref
  ) => {
    return (
      <div
        ref={ref}
        role="status"
        aria-live="polite"
        aria-label={ariaLabel}
        className={`
          flex flex-col items-center justify-center gap-3
          ${fullHeight ? "min-h-screen" : "py-8"}
          ${className}
        `.replace(/\s+/g, ' ')}
      >
        <svg
          className={`animate-spin ${sizeClasses[size]} ${colorClass}`}
          viewBox="0 0 24 24"
          fill="none"
        >
          <circle
            cx="12"
            cy="12"
            r="10"
            stroke="currentColor"
            strokeWidth="4"
            className="opacity-20"
          />

          <path
            fill="currentColor"
            className="opacity-90"
            d="M12 2a10 10 0 0 1 10 10h-4a6 6 0 0 0-6-6V2z"
          />
        </svg>

        {text && (
          <span className="text-sm text-gray-500">
            {text}
          </span>
        )}
      </div>
    );
  }
);

Loader.displayName = "Loader";