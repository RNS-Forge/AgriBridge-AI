import React from 'react';

export interface SwitchProps {
  checked: boolean;
  onChange: (checked: boolean) => void;
  disabled?: boolean;
  size?: 'sm' | 'md';
  id?: string;
  ariaLabel?: string;
  className?: string;
}

export const Switch: React.FC<SwitchProps> = ({
  checked,
  onChange,
  disabled = false,
  size = 'md',
  id,
  ariaLabel = 'Toggle switch',
  className = '',
}) => {
  const isSm = size === 'sm';
  
  // Track dimensions
  const trackWidth = isSm ? 'w-8' : 'w-9';
  const trackHeight = isSm ? 'h-4.5' : 'h-5';
  

  return (
    <button
      id={id}
      type="button"
      role="switch"
      aria-checked={checked}
      aria-label={ariaLabel}
      disabled={disabled}
      onClick={(e) => {
        e.stopPropagation();
        if (!disabled) onChange(!checked);
      }}
      className={`relative inline-flex items-center shrink-0 cursor-pointer rounded-full transition-colors duration-200 ease-in-out focus:outline-none focus-visible:ring-2 focus-visible:ring-emerald-500 focus-visible:ring-offset-1 ${
        trackWidth
      } ${trackHeight} ${
        disabled ? 'opacity-50 cursor-not-allowed' : ''
      } ${
        checked
          ? 'bg-emerald-600 border border-emerald-600'
          : 'bg-slate-200 border border-slate-300 hover:bg-slate-300'
      } ${className}`}
      style={{
        width: isSm ? '32px' : '36px',
        height: isSm ? '18px' : '20px',
      }}
    >
      <span
        style={{
          width: isSm ? '12px' : '14px',
          height: isSm ? '12px' : '14px',
          transform: checked
            ? isSm ? 'translateX(16px)' : 'translateX(17px)'
            : 'translateX(2px)',
        }}
        className="pointer-events-none inline-block rounded-full bg-white shadow-sm ring-0 transition-transform duration-200 ease-in-out"
      />
    </button>
  );
};
