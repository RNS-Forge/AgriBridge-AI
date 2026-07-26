import { forwardRef } from "react";

interface PaginationProps {
  currentPage: number;
  totalPages: number;
  onPageChange: (page: number) => void;
  maxButtons?: number;
  showFirstLast?: boolean;
  className?: string;
}

export const Pagination = forwardRef<HTMLDivElement, PaginationProps>(
  (
    {
      currentPage,
      totalPages,
      onPageChange,
      maxButtons = 5,
      showFirstLast = true,
      className = "",
    },
    ref
  ) => {
    if (totalPages <= 1) return null;

    const getPages = () => {
      const pages: (number | "...")[] = [];
      const half = Math.floor(maxButtons / 2);

      let start = Math.max(1, currentPage - half);
      let end = Math.min(totalPages, start + maxButtons - 1);

      if (end - start + 1 < maxButtons) {
        start = Math.max(1, end - maxButtons + 1);
      }

      if (start > 1) {
        pages.push(1);
        if (start > 2) pages.push("...");
      }

      for (let i = start; i <= end; i++) {
        pages.push(i);
      }

      if (end < totalPages) {
        if (end < totalPages - 1) pages.push("...");
        pages.push(totalPages);
      }

      return pages;
    };

    const pages = getPages();

    const buttonClass = `
      flex h-10 min-w-[40px] items-center justify-center
      rounded-lg border
      px-3 text-sm
      transition-colors
      focus:outline-none
      focus:ring-2
      focus:ring-blue-500
      focus:ring-offset-2
      disabled:opacity-50 disabled:cursor-not-allowed
    `;

    return (
      <nav
        ref={ref}
        aria-label="Pagination"
        className={`flex flex-wrap items-center justify-center gap-2 ${className}`}
      >
        {showFirstLast && (
          <button
            type="button"
            disabled={currentPage === 1}
            onClick={() => onPageChange(1)}
            className={`
              ${buttonClass}
              border-gray-300 bg-white text-gray-700 hover:bg-gray-50
            `}
          >
            «
          </button>
        )}

        <button
          type="button"
          disabled={currentPage === 1}
          onClick={() => onPageChange(currentPage - 1)}
          className={`
            ${buttonClass}
            border-gray-300 bg-white text-gray-700 hover:bg-gray-50
          `}
        >
          ←
        </button>

        {pages.map((page, index) =>
          page === "..." ? (
            <span
              key={index}
              className="flex h-10 min-w-[40px] items-center justify-center text-gray-500"
            >
              ...
            </span>
          ) : (
            <button
              key={page}
              type="button"
              aria-current={page === currentPage ? "page" : undefined}
              onClick={() => onPageChange(page)}
              className={`
                ${buttonClass}
                ${
                  page === currentPage
                    ? "border-blue-600 bg-blue-600 text-white"
                    : "border-gray-300 bg-white text-gray-700 hover:bg-gray-50"
                }
              `}
            >
              {page}
            </button>
          )
        )}

        <button
          type="button"
          disabled={currentPage === totalPages}
          onClick={() => onPageChange(currentPage + 1)}
          className={`
            ${buttonClass}
            border-gray-300 bg-white text-gray-700 hover:bg-gray-50
          `}
        >
          →
        </button>

        {showFirstLast && (
          <button
            type="button"
            disabled={currentPage === totalPages}
            onClick={() => onPageChange(totalPages)}
            className={`
              ${buttonClass}
              border-gray-300 bg-white text-gray-700 hover:bg-gray-50
            `}
          >
            »
          </button>
        )}
      </nav>
    );
  }
);

Pagination.displayName = "Pagination";