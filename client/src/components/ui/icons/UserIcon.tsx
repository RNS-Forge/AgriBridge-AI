import { forwardRef } from 'react';

export const UserIcon = forwardRef<SVGSVGElement>((_props, ref) => (
  <svg
    ref={ref}
    className="w-4 h-4"
    fill="none"
    viewBox="0 0 24 24"
    stroke="currentColor"
    strokeWidth={1.8}
  >
    <path strokeLinecap="round" strokeLinejoin="round" d="M15.75 6a3.75 3.75 0 11-7.5 0 3.75 3.75 0 017.5 0zM4.501 20.118a7.5 7.5 0 0114.998 0" />
  </svg>
));

UserIcon.displayName = 'UserIcon';
