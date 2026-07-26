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
      ? 'border-red-600 bg-red-50'
      : focused
      ? 'border-blue-500 bg-white shadow-sm'
      : 'border-gray-300 bg-white';

    return (
      <div className={className}>
        {label && (
          <label
            htmlFor={id}
            className={`block text-sm font-semibold mb-1.5 transition-colors duration-200 ${
              error
                ? 'text-red-600'
                : focused
                ? 'text-blue-600'
                : 'text-gray-700'
            }`}
          >
            {label}
            {required && <span className="text-red-600 ml-1">*</span>}
          </label>
        )}

        <div
          className={`relative rounded-lg border transition-all duration-200 overflow-hidden ${borderColor}`}
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
              text-sm text-gray-900
              placeholder-gray-500
              focus:outline-none
              disabled:opacity-50 disabled:cursor-not-allowed
              resize-none
            `.replace(/\s+/g, ' ')}
            placeholder={placeholder}
          />
        </div>

        <div className="flex justify-between items-start mt-1.5">
          {error && (
            <p id={`${id}-error`} className="text-xs text-red-600">
              {error}
            </p>
          )}
          {maxLength && (
            <p className="text-xs text-gray-500 ml-auto">
              {value.length} / {maxLength}
            </p>
          )}
        </div>
      </div>
    );
  }
);

TextArea.displayName = 'TextArea';