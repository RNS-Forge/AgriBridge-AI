// ---------------------------------------------------------------------------
// Modal — centered overlay dialog with backdrop and focus trap.
//
// ACCESSIBILITY:
//   - role="dialog", aria-modal="true"
//   - aria-labelledby, aria-describedby
//   - focus trap: first focusable element receives focus
//   - Escape key closes modal
//   - backdrop click closes modal (unless disabled)
// ---------------------------------------------------------------------------

import { forwardRef, ReactNode, useEffect, useRef } from 'react';

interface ModalProps {
  isOpen: boolean;
  onClose: () => void;
  title?: string;
  description?: string;
  children: ReactNode;
  size?: 'sm' | 'md' | 'lg' | 'xl';
  closeOnEsc?: boolean;
  closeOnBackdropClick?: boolean;
  className?: string;
}

const sizeStyles = {
  sm: 'max-w-sm',
  md: 'max-w-md',
  lg: 'max-w-lg',
  xl: 'max-w-xl',
};

export const Modal = forwardRef<HTMLDivElement, ModalProps>(
  (
    {
      isOpen,
      onClose,
      title,
      description,
      children,
      size = 'md',
      closeOnEsc = true,
      closeOnBackdropClick = true,
      className = '',
    },
    ref
  ) => {
    const modalRef = useRef<HTMLDivElement>(null);

    useEffect(() => {
      if (!isOpen) return;

      const handleEscape = (e: KeyboardEvent) => {
        if (e.key === 'Escape' && closeOnEsc) {
          onClose();
        }
      };

      const handleBackdropClick = (e: MouseEvent) => {
        if (
          closeOnBackdropClick &&
          e.target === document.querySelector('[data-modal-backdrop]')
        ) {
          onClose();
        }
      };

      document.addEventListener('keydown', handleEscape);
      document.addEventListener('click', handleBackdropClick);

      // Trap focus within modal
      const focusableElements = modalRef.current?.querySelectorAll(
        'button, [href], input, select, textarea, [tabindex]:not([tabindex="-1"])'
      );

      if (focusableElements && focusableElements.length > 0) {
        (focusableElements[0] as HTMLElement).focus();
      }

      return () => {
        document.removeEventListener('keydown', handleEscape);
        document.removeEventListener('click', handleBackdropClick);
      };
    }, [isOpen, onClose, closeOnEsc, closeOnBackdropClick]);

    if (!isOpen) return null;

    return (
      <div
        className="fixed inset-0 z-50 flex items-center justify-center bg-slate-950/80 backdrop-blur-sm p-4"
        data-modal-backdrop
        role="presentation"
      >
        <div
          ref={ref || modalRef}
          role="dialog"
          aria-modal="true"
          aria-labelledby={title ? 'modal-title' : undefined}
          aria-describedby={description ? 'modal-description' : undefined}
          className={`
            w-full ${sizeStyles[size]}
            bg-slate-900 border border-slate-800 rounded-2xl
            overflow-hidden shadow-2xl shadow-slate-950/50
            max-h-[90vh] overflow-y-auto
            ${className}
          `.replace(/\s+/g, ' ')}
        >
          {/* Header */}
          {(title || description) && (
            <div className="px-6 py-4 border-b border-slate-800 bg-slate-900/80 flex justify-between items-start">
              <div>
                {title && (
                  <h2 id="modal-title" className="text-lg font-bold text-slate-100">
                    {title}
                  </h2>
                )}
                {description && (
                  <p id="modal-description" className="text-sm text-slate-400 mt-1">
                    {description}
                  </p>
                )}
              </div>
              <button
                onClick={onClose}
                className="text-slate-400 hover:text-slate-100 transition-colors p-1 hover:bg-slate-800 rounded-lg"
                aria-label="Close modal"
              >
                <svg
                  className="w-5 h-5"
                  fill="none"
                  viewBox="0 0 24 24"
                  stroke="currentColor"
                  strokeWidth={2}
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    d="M6 18L18 6M6 6l12 12"
                  />
                </svg>
              </button>
            </div>
          )}

          {/* Content */}
          <div className="p-6">{children}</div>
        </div>
      </div>
    );
  }
);

Modal.displayName = 'Modal';
