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
  type?: string;
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
  step?: string | number;
  maxLength?: number;
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
      step,
      maxLength,
    },
    ref
  ) => {
    const [focused, setFocused] = useState(false);
    const [showPassword, setShowPassword] = useState(false);
    const isPasswordType = type === 'password';
    const effectiveType = isPasswordType ? (showPassword ? 'text' : 'password') : type;
    const isFilled = value.length > 0;

    const borderColor = error
      ? 'border-red-500/60 bg-white'
      : focused
      ? 'border-emerald-500/60 bg-white shadow-[0_0_0_3px_rgba(16,185,129,0.1)]'
      : isFilled
      ? 'border-slate-300 bg-white'
      : 'border-slate-300 bg-white';

    return (
      <div className={className}>
        {label && (
          <label
            htmlFor={id}
            className={`block text-xs font-semibold tracking-wide mb-1.5 transition-colors duration-200 ${
              error
                ? 'text-red-500'
                : focused
                ? 'text-emerald-600'
                : 'text-slate-600'
            }`}
          >
            {label}
            {required && <span className="text-red-500 ml-1">*</span>}
          </label>
        )}

        <div
          className={`relative flex items-center rounded-md border transition-all duration-300 ${borderColor}`}
        >
          {icon && (
            <span
              className={`pl-3.5 transition-colors duration-200 ${
                error
                  ? 'text-red-500'
                  : focused
                  ? 'text-emerald-600'
                  : 'text-slate-500'
              }`}
            >
              {icon}
            </span>
          )}

          <input
            ref={ref}
            id={id}
            type={effectiveType}
            value={value}
            onChange={onChange}
            onFocus={() => setFocused(true)}
            onBlur={() => setFocused(false)}
            disabled={disabled}
            required={required}
            autoComplete={autoComplete}
            step={step}
            maxLength={maxLength}
            aria-invalid={!!error}
            aria-describedby={error ? `${id}-error` : undefined}
            className={`
              w-full bg-transparent
              ${icon ? 'px-3' : 'pl-4'}
              ${rightIcon || isPasswordType ? 'pr-2' : 'pr-4'} py-3
              text-sm text-slate-900
              placeholder-slate-400
              focus:outline-none
              disabled:opacity-50 disabled:cursor-not-allowed
            `.replace(/\s+/g, ' ')}
            placeholder={placeholder}
          />

          {/* Explicit rightIcon or automatic Password Eye Toggle Button */}
          {rightIcon ? (
            <span className="pr-3.5 flex items-center">{rightIcon}</span>
          ) : isPasswordType ? (
            <button
              type="button"
              tabIndex={-1}
              onClick={() => setShowPassword((prev) => !prev)}
              className="pr-3.5 pl-1.5 flex items-center text-slate-400 hover:text-slate-700 focus:outline-none transition-colors cursor-pointer select-none"
              title={showPassword ? 'Hide password' : 'Show password'}
              aria-label={showPassword ? 'Hide password' : 'Show password'}
            >
              {showPassword ? (
                /* Eye Slash Icon (Hide Password) */
                <svg
                  className="w-4 h-4"
                  fill="none"
                  viewBox="0 0 24 24"
                  stroke="currentColor"
                  strokeWidth={1.8}
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    d="M3.98 8.223A10.477 10.477 0 001.934 12C3.226 16.338 7.244 19.5 12 19.5c.993 0 1.953-.138 2.863-.395M6.228 6.228A10.45 10.45 0 0112 4.5c4.756 0 8.773 3.162 10.065 7.498a10.523 10.523 0 01-4.293 5.774M6.228 6.228L3 3m3.228 3.228l3.65 3.65m7.894 7.894L21 21m-3.228-3.228l-3.65-3.65m0 0a3 3 0 10-4.243-4.243m4.242 4.242L9.88 9.88"
                  />
                </svg>
              ) : (
                /* Eye Icon (Show Password) */
                <svg
                  className="w-4 h-4"
                  fill="none"
                  viewBox="0 0 24 24"
                  stroke="currentColor"
                  strokeWidth={1.8}
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    d="M2.036 12.322a1.012 1.012 0 010-.639C3.423 7.51 7.36 4.5 12 4.5c4.638 0 8.573 3.007 9.963 7.178.07.207.07.431 0 .639C20.577 16.49 16.64 19.5 12 19.5c-4.638 0-8.573-3.007-9.963-7.178z"
                  />
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    d="M15 12a3 3 0 11-6 0 3 3 0 016 0z"
                  />
                </svg>
              )}
            </button>
          ) : null}
        </div>

        {error && (
          <p id={`${id}-error`} className="text-xs text-red-500 mt-1.5">
            {error}
          </p>
        )}
      </div>
    );
  }
);

Input.displayName = 'Input';
