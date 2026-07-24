// ---------------------------------------------------------------------------
// TextArea — multi-line text input with char counter and resize control.
//
// ACCESSIBILITY:
//   - aria-invalid, aria-describedby for error messages
//   - aria-label for accessibility
// ---------------------------------------------------------------------------

import { forwardRef, ReactNode, useState } from 'react';

interface TextAreaProps {
  id: string;
  label?: string;
  value: string;
  onChange: (e: React.ChangeEvent<HTMLTextAreaElement>) => void;
  placeholder?: string;
  error?: string;
  disabled?: boolean;
  required?: boolean;
  maxLength?: number;
  rows?: number;
  className?: string;
  'aria-label'?: string;
}

export const TextArea = forwardRef<HTMLTextAreaElement, TextAreaProps>(
  (
    {
      id,
      label,
      value,
      onChange,
      placeholder,
      error,
      disabled = false,
      required = false,
      maxLength,
      rows = 3,
      className = '',
      'aria-label': ariaLabel,
    },
    ref
  ) => {
    const [focused, setFocused] = useState(false);

    const borderColor = error
      ? 'border-red-500/60 bg-red-950/20'
      : focused
      ? 'border-emerald-500/60 bg-slate-950/90 shadow-[0_0_0_3px_rgba(16,185,129,0.1)]'
      : 'border-slate-800 bg-slate-950/40';

    return (
      <div className={className}>
        {label && (
          <label
            htmlFor={id}
            className={`block text-xs font-semibold tracking-wide mb-1.5 transition-colors duration-200 ${
              error
                ? 'text-red-400'
                : focused
                ? 'text-emerald-400'
                : 'text-slate-400'
            }`}
          >
            {label}
            {required && <span className="text-red-400 ml-1">*</span>}
          </label>
        )}

        <div
          className={`relative rounded-xl border transition-all duration-300 overflow-hidden ${borderColor}`}
        >
          <textarea
            ref={ref}
            id={id}
            value={value}
            onChange={onChange}
            onFocus={() => setFocused(true)}
            onBlur={() => setFocused(false)}
            disabled={disabled}
            required={required}
            maxLength={maxLength}
            rows={rows}
            aria-label={ariaLabel || label}
            aria-invalid={!!error}
            aria-describedby={error ? `${id}-error` : undefined}
            className={`
              w-full bg-transparent
              px-4 py-3
              text-sm text-slate-100
              placeholder-slate-600
              focus:outline-none
              disabled:opacity-50 disabled:cursor-not-allowed
              resize-none
            `.replace(/\s+/g, ' ')}
            placeholder={placeholder}
          />
        </div>

        <div className="flex justify-between items-start mt-1.5">
          {error && (
            <p id={`${id}-error`} className="text-xs text-red-400">
              {error}
            </p>
          )}
          {maxLength && (
            <p className="text-xs text-slate-500 ml-auto">
              {value.length} / {maxLength}
            </p>
          )}
        </div>
      </div>
    );
  }
);

TextArea.displayName = 'TextArea';
