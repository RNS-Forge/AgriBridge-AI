import { useState, useEffect } from 'react';

export type LogoOptionId = 'option1' | 'option2' | 'option3';

export interface LogoProps {
  variant?: LogoOptionId;
  size?: 'xs' | 'sm' | 'md' | 'lg' | 'xl';
  showText?: boolean;
  className?: string;
  textClassName?: string;
  light?: boolean;
  useImage?: boolean;
}

export const LOGO_DETAILS: Record<
  LogoOptionId,
  {
    id: LogoOptionId;
    title: string;
    subtitle: string;
    description: string;
    imageSrc: string;
    accentColor: string;
  }
> = {
  option1: {
    id: 'option1',
    title: 'Option 1: The Sprout Bridge & Neural Circuit',
    subtitle: 'Organic Growth meets Tech Connectivity',
    description:
      'Seamlessly blends vibrant agricultural leaves arching over a suspension bridge span, integrated with golden neural AI circuit paths to symbolize intelligence-driven market access.',
    imageSrc: '/logos/logo-option1.jpg',
    accentColor: '#10b981',
  },
  option2: {
    id: 'option2',
    title: 'Option 2: The Geo-Hex Field Shield',
    subtitle: 'Enterprise Security & Supply Chain Precision',
    description:
      'A geometric hexagon framing twin crop leaves that bridge across fertile field furrow rows, crowned with an AI apex star to represent institutional trust and certified trade.',
    imageSrc: '/logos/logo-option2.jpg',
    accentColor: '#059669',
  },
  option3: {
    id: 'option3',
    title: "Option 3: The 'A' Monogram Arch",
    subtitle: 'Silicon Valley Minimalist Identity',
    description:
      "A bold, modern monogram 'A' where the crossbar forms an upward-curving suspension bridge deck with vertical cables, culminating in a fresh crop sprout. Iconic, clean, and memorable.",
    imageSrc: '/logos/logo-option3.jpg',
    accentColor: '#34d399',
  },
};

/**
 * Option 1 SVG: Sprout Bridge & Neural Circuit
 */
export function LogoIconOption1({ className = 'w-6 h-6' }: { className?: string }) {
  return (
    <svg viewBox="0 0 48 48" fill="none" xmlns="http://www.w3.org/2000/svg" className={className}>
      {/* Background soft glow */}
      <circle cx="24" cy="24" r="22" fill="#047857" fillOpacity="0.08" />
      {/* Bridge Arch */}
      <path
        d="M8 36C8 24.9543 15.1634 16 24 16C32.8366 16 40 24.9543 40 36"
        stroke="#047857"
        strokeWidth="3.5"
        strokeLinecap="round"
      />
      {/* Inner Bridge Span */}
      <path
        d="M14 36C14 28.5 18.5 22 24 22C29.5 22 34 28.5 34 36"
        stroke="#10b981"
        strokeWidth="2"
        strokeLinecap="round"
      />
      {/* Vertical Cables */}
      <line x1="20" y1="20" x2="20" y2="36" stroke="#047857" strokeWidth="1.5" strokeOpacity="0.7" />
      <line x1="24" y1="18" x2="24" y2="36" stroke="#10b981" strokeWidth="1.5" strokeOpacity="0.7" />
      <line x1="28" y1="20" x2="28" y2="36" stroke="#047857" strokeWidth="1.5" strokeOpacity="0.7" />
      {/* Left Leaf Sprout */}
      <path
        d="M23 18C20 12 12 11 11 11C11 11 11 19 18 21C21 21.8 22.5 19.5 23 18Z"
        fill="#059669"
      />
      {/* Right / Center Ascending Leaf Sprout */}
      <path
        d="M24 18C26 10 35 6 36 6C36 6 38 15 30 19C26.5 20.7 24.8 19.2 24 18Z"
        fill="#10b981"
      />
      {/* Neural AI Nodes */}
      <circle cx="24" cy="18" r="2.5" fill="#f59e0b" />
      <circle cx="16" cy="27" r="1.5" fill="#f59e0b" />
      <circle cx="32" cy="27" r="1.5" fill="#f59e0b" />
      {/* Baseline Roadway */}
      <path d="M6 36H42" stroke="#065f46" strokeWidth="2.5" strokeLinecap="round" />
    </svg>
  );
}

/**
 * Option 2 SVG: Geo-Hex Field Shield
 */
export function LogoIconOption2({ className = 'w-6 h-6' }: { className?: string }) {
  return (
    <svg viewBox="0 0 48 48" fill="none" xmlns="http://www.w3.org/2000/svg" className={className}>
      {/* Hexagon Shield */}
      <path
        d="M24 3L41.3205 13V33L24 43L6.67949 33V13L24 3Z"
        stroke="#064e3b"
        strokeWidth="2.5"
        strokeLinejoin="round"
        fill="#064e3b"
        fillOpacity="0.04"
      />
      {/* Field Furrows */}
      <path d="M12 33C16 31 20 31 24 33C28 35 32 35 36 33" stroke="#059669" strokeWidth="1.5" strokeLinecap="round" />
      <path d="M14 36C18 34.5 21 34.5 24 36C27 37.5 30 37.5 34 36" stroke="#10b981" strokeWidth="1.2" strokeLinecap="round" />
      {/* Bridge Arch Span */}
      <path
        d="M11 26C15 22 20 20 24 20C28 20 33 22 37 26"
        stroke="#0f766e"
        strokeWidth="2.5"
        strokeLinecap="round"
      />
      {/* Twin Leaves */}
      <path
        d="M24 20C21 14 15 13 14 13C14 13 14 19 19 21C21.5 22 23.5 20.8 24 20Z"
        fill="#059669"
      />
      <path
        d="M24 20C27 14 33 13 34 13C34 13 34 19 29 21C26.5 22 24.5 20.8 24 20Z"
        fill="#10b981"
      />
      {/* Apex AI Crown */}
      <circle cx="24" cy="9" r="2" fill="#84cc16" />
      <path d="M24 4V7" stroke="#84cc16" strokeWidth="1.5" strokeLinecap="round" />
      <path d="M21 8L19 6" stroke="#84cc16" strokeWidth="1.5" strokeLinecap="round" />
      <path d="M27 8L29 6" stroke="#84cc16" strokeWidth="1.5" strokeLinecap="round" />
    </svg>
  );
}

/**
 * Option 3 SVG: Monogram 'A' Bridge & Sprout
 */
export function LogoIconOption3({ className = 'w-6 h-6' }: { className?: string }) {
  return (
    <svg viewBox="0 0 48 48" fill="none" xmlns="http://www.w3.org/2000/svg" className={className}>
      {/* Left Strong Leg of A */}
      <path
        d="M11 39L22 10C22.5 8.8 24 8.8 24.5 10L35.5 39"
        stroke="#064e3b"
        strokeWidth="3.5"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
      {/* Bridge Suspension Crossbar */}
      <path
        d="M15 28C19 23 27 23 32 28"
        stroke="#10b981"
        strokeWidth="3"
        strokeLinecap="round"
      />
      {/* Suspension Cables */}
      <line x1="20" y1="25.5" x2="20" y2="30" stroke="#059669" strokeWidth="1.5" strokeLinecap="round" />
      <line x1="23.5" y1="24" x2="23.5" y2="30" stroke="#059669" strokeWidth="1.5" strokeLinecap="round" />
      <line x1="27" y1="25.5" x2="27" y2="30" stroke="#059669" strokeWidth="1.5" strokeLinecap="round" />
      {/* Sprout Leaves at Top Right of A */}
      <path
        d="M24 10C24 6 29 4 30 4C30 4 31 9 27 11C25.5 11.7 24.5 10.8 24 10Z"
        fill="#34d399"
      />
      <path
        d="M23 12C20 9 17 9.5 16 10C16 10 17 14 21 13.5C22 13.3 22.8 12.6 23 12Z"
        fill="#10b981"
      />
      {/* Roadway Footers */}
      <circle cx="11" cy="39" r="2" fill="#064e3b" />
      <circle cx="36" cy="39" r="2" fill="#064e3b" />
    </svg>
  );
}

export function LogoIcon({
  variant,
  className = 'w-6 h-6',
}: {
  variant?: LogoOptionId;
  className?: string;
}) {
  const activeVariant = variant || (typeof window !== 'undefined' ? (localStorage.getItem('agribridge_logo_choice') as LogoOptionId) || 'option3' : 'option3');

  switch (activeVariant) {
    case 'option1':
      return <LogoIconOption1 className={className} />;
    case 'option2':
      return <LogoIconOption2 className={className} />;
    case 'option3':
    default:
      return <LogoIconOption3 className={className} />;
  }
}

export interface LogoImageProps {
  size?: 'xs' | 'sm' | 'md' | 'lg' | 'xl';
  className?: string;
  light?: boolean;
}

export function LogoImage({ size = 'md', className = '', light = false }: LogoImageProps) {
  const sizeClasses = {
    xs: 'w-6 h-6',
    sm: 'w-8 h-8',
    md: 'w-9 h-9',
    lg: 'w-11 h-11',
    xl: 'w-14 h-14',
  }[size];

  return (
    <img
      src="/logos/logo-option3.jpg"
      alt="AgriBridge AI"
      className={`${sizeClasses} object-contain rounded-md shadow-md ${
        light
          ? 'shadow-black/40 border border-emerald-400/50 bg-white'
          : 'shadow-emerald-950/20 border border-emerald-600/30 bg-white'
      } flex-shrink-0 transition-transform duration-200 hover:scale-105 ${className}`}
    />
  );
}

export function Logo({
  variant = 'option3',
  size = 'md',
  showText = true,
  className = '',
  textClassName = '',
  light = false,
  useImage = true,
}: LogoProps) {
  const [activeVariant, setActiveVariant] = useState<LogoOptionId>(
    variant ||
      (typeof window !== 'undefined'
        ? (localStorage.getItem('agribridge_logo_choice') as LogoOptionId) || 'option3'
        : 'option3')
  );

  useEffect(() => {
    if (variant) {
      setActiveVariant(variant);
    } else {
      const handleStorage = () => {
        const stored = (localStorage.getItem('agribridge_logo_choice') as LogoOptionId) || 'option3';
        setActiveVariant(stored);
      };
      window.addEventListener('agribridge_logo_changed', handleStorage);
      return () => window.removeEventListener('agribridge_logo_changed', handleStorage);
    }
  }, [variant]);

  const sizeClasses = {
    xs: { img: 'w-6 h-6', text: 'text-xs', sub: 'text-[8px]' },
    sm: { img: 'w-8 h-8', text: 'text-sm', sub: 'text-[9px]' },
    md: { img: 'w-9 h-9', text: 'text-base', sub: 'text-[10px]' },
    lg: { img: 'w-11 h-11', text: 'text-lg', sub: 'text-xs' },
    xl: { img: 'w-14 h-14', text: 'text-2xl', sub: 'text-sm' },
  }[size];

  return (
    <div className={`flex items-center gap-2.5 ${className}`}>
      {useImage ? (
        <img
          src="/logos/logo-option3.jpg"
          alt="AgriBridge AI Logo"
          className={`${sizeClasses.img} object-contain rounded-md shadow-md ${
            light
              ? 'shadow-black/40 border border-emerald-400/50 bg-white'
              : 'shadow-emerald-950/20 border border-emerald-600/30 bg-white'
          } flex-shrink-0 transition-transform duration-200`}
        />
      ) : (
        <div className="flex-shrink-0 flex items-center justify-center">
          <LogoIcon variant={activeVariant} className={sizeClasses.img} />
        </div>
      )}

      {showText && (
        <div className="flex flex-col min-w-0">
          <span
            className={`font-bold tracking-tight leading-none ${
              light ? 'text-white' : 'text-slate-900'
            } ${sizeClasses.text} ${textClassName}`}
          >
            AgriBridge<span className={light ? 'text-emerald-400' : 'text-emerald-600'}>AI</span>
          </span>
          <span
            className={`font-semibold tracking-wider uppercase mt-0.5 ${
              light ? 'text-emerald-300/80' : 'text-slate-500'
            } ${sizeClasses.sub}`}
          >
            Agricultural Intelligence
          </span>
        </div>
      )}
    </div>
  );
}

/**
 * Utility helper to set and broadcast the logo selection across all components
 */
export function setGlobalLogoChoice(choice: LogoOptionId) {
  if (typeof window !== 'undefined') {
    localStorage.setItem('agribridge_logo_choice', choice);
    window.dispatchEvent(new Event('agribridge_logo_changed'));
  }
}

