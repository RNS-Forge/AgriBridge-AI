import { forwardRef, useState } from "react";

type AvatarSize = "xs" | "sm" | "md" | "lg" | "xl";

interface AvatarProps {
  src?: string;
  alt?: string;
  initials?: string;
  size?: AvatarSize;
  className?: string;
  bordered?: boolean;
}

const sizeClasses: Record<
  AvatarSize,
  {
    container: string;
    text: string;
  }
> = {
  xs: {
    container: "h-6 w-6",
    text: "text-[10px]",
  },
  sm: {
    container: "h-8 w-8",
    text: "text-xs",
  },
  md: {
    container: "h-10 w-10",
    text: "text-sm",
  },
  lg: {
    container: "h-12 w-12",
    text: "text-base",
  },
  xl: {
    container: "h-16 w-16",
    text: "text-lg",
  },
};

export const Avatar = forwardRef<HTMLDivElement, AvatarProps>(
  (
    {
      src,
      alt = "User avatar",
      initials,
      size = "md",
      bordered = false,
      className = "",
    },
    ref
  ) => {
    const [imageError, setImageError] = useState(false);

    const styles = sizeClasses[size];

    const showImage = src && !imageError;
    const showInitials = !showImage && initials;

    return (
      <div
        ref={ref}
        className={`
          ${styles.container}
          inline-flex
          items-center
          justify-center
          overflow-hidden
          rounded-full
          bg-gray-200
          shadow-sm
          ${bordered ? "border-2 border-gray-300" : ""}
          ${className}
        `}
      >
        {showImage ? (
          <img
            src={src}
            alt={alt}
            loading="lazy"
            className="h-full w-full object-cover"
            onError={() => setImageError(true)}
          />
        ) : showInitials ? (
          <span
            className={`font-semibold uppercase ${styles.text} text-gray-700`}
            aria-label={alt}
          >
            {initials.slice(0, 2)}
          </span>
        ) : (
          <svg
            className="h-1/2 w-1/2 text-gray-500"
            fill="none"
            viewBox="0 0 24 24"
            aria-hidden="true"
            aria-label="User avatar fallback icon"
          >
            <path
              stroke="currentColor"
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z"
            />
          </svg>
        )}
      </div>
    );
  }
);

Avatar.displayName = "Avatar";