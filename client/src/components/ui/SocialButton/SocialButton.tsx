interface SocialButtonProps {
  icon: React.ReactNode;
  label: string;
  onClick: () => void;
}

export function SocialButton({ icon, label, onClick }: SocialButtonProps) {
  return (
    <button
      type="button"
      onClick={onClick}
      className="group flex items-center justify-center gap-2.5 py-3 rounded-md border border-slate-300 bg-white text-sm text-slate-800 font-medium hover:bg-slate-50 hover:border-slate-400 transition-all duration-200 focus:outline-none focus:ring-2 focus:ring-slate-700/50 active:scale-[0.98]"
    >
      {icon}
      {label}
    </button>
  );
}
