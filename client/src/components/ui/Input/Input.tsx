// ---------------------------------------------------------------------------
// Input — text/email/password/number input with icon and error support.
//
// VARIANTS:
//   - default:  Standard emerald focus
//   - error:    Red border and text
//   - success:  Green border
//   - disabled: Grayed out
//
// ACCESSIBILITY:
//   - aria-invalid, aria-describedby for error messages
//   - label association via htmlFor
// ---------------------------------------------------------------------------

import { forwardRef, ReactNode, useState } from 'react';

interface InputProps {
  id: string;
  label?: string;
  type?: 'text' | 'email' | 'password' | 'number' | 'search';
  value: string;
  onChange: (e: React.ChangeEvent<HTMLInputElement>) => void;
  placeholder?: string;
  icon?: ReactNode;
  rightIcon?: ReactNode;
  error?: string;
  disabled?: boolean;
  required?: boolean;
  autoComplete?: string;
  className?: string;
}

export const Input = forwardRef<HTMLInputElement, InputProps>(
  (
    {
      id,
      label,
      type = 'text',
      value,
      onChange,
      placeholder,
      icon,
      rightIcon,
      error,
      disabled = false,
      required = false,
      autoComplete,
      className = '',
    },
    ref
  ) => {
    const [focused, setFocused] = useState(false);
    const isFilled = value.length > 0;

    const borderColor = error
      ? 'border-red-500/60 bg-red-950/20'
      : focused
      ? 'border-emerald-500/60 bg-slate-950/90 shadow-[0_0_0_3px_rgba(16,185,129,0.1)]'
      : isFilled
      ? 'border-slate-700 bg-slate-950/60'
      : 'border-slate-800 bg-slate-950/40';

    const textColor = error ? 'text-red-400' : 'text-slate-400';

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
          className={`relative flex items-center rounded-xl border transition-all duration-300 ${borderColor}`}
        >
          {icon && (
            <span
              className={`pl-3.5 transition-colors duration-200 ${
                error
                  ? 'text-red-400'
                  : focused
                  ? 'text-emerald-400'
                  : 'text-slate-600'
              }`}
            >
              {icon}
            </span>
          )}

          <input
            ref={ref}
            id={id}
            type={type}
            value={value}
            onChange={onChange}
            onFocus={() => setFocused(true)}
            onBlur={() => setFocused(false)}
            disabled={disabled}
            required={required}
            autoComplete={autoComplete}
            aria-invalid={!!error}
            aria-describedby={error ? `${id}-error` : undefined}
            className={`
              w-full bg-transparent
              ${icon ? 'px-3' : 'px-4'} py-3
              text-sm text-slate-100
              placeholder-slate-600
              focus:outline-none
              disabled:opacity-50 disabled:cursor-not-allowed
            `.replace(/\s+/g, ' ')}
            placeholder={placeholder}
          />

          {rightIcon && <span className="pr-3.5">{rightIcon}</span>}
        </div>

        {error && (
          <p id={`${id}-error`} className="text-xs text-red-400 mt-1.5">
            {error}
          </p>
        )}
      </div>
    );
  }
);

Input.displayName = 'Input';
