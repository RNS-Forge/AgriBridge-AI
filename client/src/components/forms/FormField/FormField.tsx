// ---------------------------------------------------------------------------
// FormField — labelled text input with focus/fill styling.
// No import changes needed; this component has no local dependencies.
// ---------------------------------------------------------------------------

import { useState } from 'react';

interface FormFieldProps {
  id: string;
  label: string;
  type?: 'text' | 'email' | 'password' | 'number';
  value: string;
  onChange: (e: React.ChangeEvent<HTMLInputElement>) => void;
  placeholder: string;
  required?: boolean;
  icon: React.ReactNode;
  autoComplete?: string;
}

export function FormField({
  id,
  label,
  type = 'text',
  value,
  onChange,
  placeholder,
  required = true,
  icon,
  autoComplete = 'off',
}: FormFieldProps) {
  const [focused, setFocused] = useState(false);
  const isFilled = value.length > 0;

  return (
    <div>
      <label
        htmlFor={id}
        className={`block text-xs font-semibold tracking-wide mb-1.5 transition-colors duration-200 ${
          focused ? 'text-emerald-600' : 'text-slate-600'
        }`}
      >
        {label}
      </label>
      <div
        className={`relative flex items-center rounded-xl border transition-all duration-300 ${
          focused
            ? 'border-emerald-500/60 bg-white shadow-[0_0_0_3px_rgba(16,185,129,0.1)]'
            : isFilled
            ? 'border-slate-300 bg-white'
            : 'border-slate-300 bg-white'
        }`}
      >
        <span
          className={`pl-3.5 transition-colors duration-200 ${
            focused ? 'text-emerald-600' : 'text-slate-500'
          }`}
        >
          {icon}
        </span>
        <input
          id={id}
          type={type}
          required={required}
          value={value}
          onChange={onChange}
          onFocus={() => setFocused(true)}
          onBlur={() => setFocused(false)}
          className="w-full bg-transparent px-3 py-3 text-sm text-slate-900 placeholder-slate-400 focus:outline-none"
          placeholder={placeholder}
          autoComplete={autoComplete}
        />
      </div>
    </div>
  );
}
