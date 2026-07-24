import { useState, useEffect } from 'react';

interface ToastProps {
  message: string;
  type?: 'warning' | 'success' | 'error' | 'info';
  onClose: () => void;
}

export function Toast({ message, type = 'warning', onClose }: ToastProps) {
  const [visible, setVisible] = useState(false);

  useEffect(() => {
    requestAnimationFrame(() => setVisible(true));
    const timer = setTimeout(() => {
      setVisible(false);
      setTimeout(onClose, 300);
    }, 3000);
    return () => clearTimeout(timer);
  }, [onClose]);

  const typeConfig = {
    warning: {
      bgColor: 'bg-amber-500/15',
      borderColor: 'border-amber-500/25',
      iconColor: 'text-amber-400',
      icon: (
        <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
          <path strokeLinecap="round" strokeLinejoin="round" d="M12 9v3.75m-9.303 3.376c-.866 1.5.217 3.374 1.948 3.374h14.71c1.73 0 2.813-1.874 1.948-3.374L13.949 3.378c-.866-1.5-3.032-1.5-3.898 0L2.697 16.126zM12 15.75h.007v.008H12v-.008z" />
        </svg>
      ),
      title: 'Under Development'
    },
    success: {
      bgColor: 'bg-emerald-500/15',
      borderColor: 'border-emerald-500/25',
      iconColor: 'text-emerald-400',
      icon: (
        <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
          <path strokeLinecap="round" strokeLinejoin="round" d="M9 12.75L11.25 15 15 9.75M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
        </svg>
      ),
      title: 'Success'
    },
    error: {
      bgColor: 'bg-red-500/15',
      borderColor: 'border-red-500/25',
      iconColor: 'text-red-400',
      icon: (
        <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
          <path strokeLinecap="round" strokeLinejoin="round" d="M12 9v3.75m9-.75a9 9 0 11-18 0 9 9 0 0118 0zm-9 3.75h.008v.008H12v-.008z" />
        </svg>
      ),
      title: 'Error'
    },
    info: {
      bgColor: 'bg-blue-500/15',
      borderColor: 'border-blue-500/25',
      iconColor: 'text-blue-400',
      icon: (
        <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
          <path strokeLinecap="round" strokeLinejoin="round" d="M11.25 11.25l.041-.02a.75.75 0 011.063.852l-.708 2.836a.75.75 0 001.063.853l.041-.021M21 12a9 9 0 11-18 0 9 9 0 0118 0zm-9-3.75h.008v.008H12V8.25z" />
        </svg>
      ),
      title: 'Information'
    }
  };

  const config = typeConfig[type];

  return (
    <div
      className={`fixed top-6 left-1/2 -translate-x-1/2 z-50 flex items-center gap-3 px-5 py-3.5 rounded-xl bg-slate-800/95 backdrop-blur-lg border border-slate-700/80 shadow-2xl shadow-black/40 transition-all duration-300 ${
        visible ? 'opacity-100 translate-y-0' : 'opacity-0 -translate-y-3 pointer-events-none'
      }`}
    >
      <div className={`w-8 h-8 rounded-lg ${config.bgColor} border ${config.borderColor} flex items-center justify-center shrink-0`}>
        <span className={config.iconColor}>{config.icon}</span>
      </div>
      <div>
        <p className="text-sm font-semibold text-slate-100">{config.title}</p>
        <p className="text-xs text-slate-400 mt-0.5">{message}</p>
      </div>
      <button
        onClick={() => { setVisible(false); setTimeout(onClose, 300); }}
        className="ml-3 text-slate-500 hover:text-slate-300 transition-colors"
      >
        <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
          <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
        </svg>
      </button>
    </div>
  );
}
