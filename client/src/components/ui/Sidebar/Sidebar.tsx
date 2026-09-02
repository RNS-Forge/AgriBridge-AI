import React from 'react';
import { Link, useLocation } from 'react-router-dom';
import type { User } from '../../../types';
import { getInitials } from '../../../utils';

interface NavItem {
  label: string;
  path: string;
  roles: string[];
  icon: string;
}

interface SidebarProps {
  user: User | null;
  sidebarOpen: boolean;
  onToggle: () => void;
  onLogout: () => void;
  visibleNav: NavItem[];
  icons: Record<string, React.ReactNode>;
}

export function Sidebar({
  user,
  sidebarOpen,
  onToggle,
  onLogout,
  visibleNav,
  icons,
}: SidebarProps) {
  const location = useLocation();

  return (
    <aside
      className={`fixed left-0 top-0 h-full bg-emerald-900 text-white flex flex-col justify-between z-40 transition-all duration-300 ease-in-out border-r border-emerald-800 ${
        sidebarOpen ? 'w-48' : 'w-14'
      }`}
    >
      <div>
        {/* Header containing Logo & Toggle Button */}
        <div className="h-16 flex items-center justify-between px-4 border-b border-emerald-800 relative">
          {sidebarOpen ? (
            <span className="text-base font-bold text-emerald-100 tracking-wide truncate">
              AgriBridge AI
            </span>
          ) : (
            <div className="mx-auto text-emerald-300">
              <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M14.828 14.828a4 4 0 01-5.656 0M9 10h.01M15 10h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
            </div>
          )}

          {/* Clean toggle button positioned perfectly on/near the header border */}
          <button
            onClick={onToggle}
            className={`p-1 rounded-md bg-emerald-800 hover:bg-emerald-700 text-emerald-100 hover:text-white border border-emerald-700 transition-colors focus:outline-none ${
              sidebarOpen ? '' : 'absolute -right-3 top-5 z-50 shadow-md bg-emerald-900'
            }`}
            title={sidebarOpen ? 'Collapse Sidebar' : 'Expand Sidebar'}
          >
            {sidebarOpen ? (
              <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.5}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M15 19l-7-7 7-7" />
              </svg>
            ) : (
              <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.5}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M9 5l7 7-7 7" />
              </svg>
            )}
          </button>
        </div>

        {/* Navigation links */}
        <nav className="p-2.5 space-y-1.5">
          {visibleNav.map((item) => {
            const isActive = location.pathname === item.path;
            const Icon = icons[item.icon];
            return (
              <Link
                key={item.path}
                to={item.path}
                className={`flex items-center rounded-lg text-xs font-medium transition-all duration-200 ${
                  sidebarOpen ? 'px-3 py-2' : 'p-2 justify-center'
                } ${
                  isActive
                    ? 'bg-emerald-800 text-white border-l-4 border-emerald-400 font-semibold shadow-sm'
                    : 'text-emerald-100 hover:bg-emerald-800/40 hover:text-white'
                }`}
                title={!sidebarOpen ? item.label : undefined}
              >
                <span className={`${isActive ? 'text-emerald-400' : 'text-emerald-200'} ${sidebarOpen ? 'mr-2.5' : ''}`}>
                  {Icon}
                </span>
                {sidebarOpen && <span className="truncate">{item.label}</span>}
              </Link>
            );
          })}
        </nav>
      </div>

      {/* User Section at the bottom */}
      <div className={`p-2.5 border-t border-emerald-800 bg-emerald-950/40 ${sidebarOpen ? '' : 'flex flex-col items-center'}`}>
        {sidebarOpen ? (
          <>
            <div className="flex items-center space-x-2 mb-2.5">
              <div className="w-8 h-8 rounded-full bg-emerald-800 border border-emerald-700 flex items-center justify-center font-bold text-xs text-emerald-100 flex-shrink-0">
                {getInitials(user?.firstName, user?.lastName) || 'U'}
              </div>
              <div className="truncate min-w-0">
                <p className="text-xs font-semibold text-emerald-50 truncate">
                  {user?.firstName} {user?.lastName}
                </p>
                <span className="inline-block text-[9px] bg-emerald-800/50 text-emerald-200 font-mono px-1.5 py-0.5 rounded border border-emerald-700">
                  {user?.roles[0]}
                </span>
              </div>
            </div>
            <button
              onClick={onLogout}
              className="w-full py-1.5 bg-emerald-800/40 hover:bg-red-700/80 hover:text-white hover:border-red-600 rounded-md text-[10px] font-semibold text-emerald-100 border border-emerald-700 transition-colors duration-200"
            >
              Sign Out
            </button>
          </>
        ) : (
          <div className="space-y-2.5">
            <div
              className="w-8 h-8 rounded-full bg-emerald-800 border border-emerald-700 flex items-center justify-center font-bold text-xs text-emerald-100"
              title={`${user?.firstName} ${user?.lastName} (${user?.roles[0]})`}
            >
              {getInitials(user?.firstName, user?.lastName) || 'U'}
            </div>
            <button
              onClick={onLogout}
              className="p-1.5 bg-emerald-800/40 hover:bg-red-700/80 hover:text-white hover:border-red-600 rounded-md text-emerald-100 border border-emerald-700 transition-colors"
              title="Sign Out"
            >
              <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1" />
              </svg>
            </button>
          </div>
        )}
      </div>
    </aside>
  );
}
