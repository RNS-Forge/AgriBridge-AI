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
      <div className="flex flex-col h-[calc(100%-95px)] relative">
        {/* Header containing Logo & Toggle Button */}
        <div className="h-16 flex items-center justify-between px-3 border-b border-emerald-800 relative flex-shrink-0">
          {sidebarOpen ? (
            <div className="flex items-center gap-2 min-w-0">
              <img
                src="/logos/logo-option3.jpg"
                alt="AgriBridge AI"
                className="w-7 h-7 object-contain rounded-md shadow-md shadow-black/40 border border-emerald-400/50 bg-white flex-shrink-0"
              />
              <span className="text-sm font-bold text-emerald-100 tracking-tight whitespace-nowrap">
                AgriBridge AI
              </span>
            </div>
          ) : (
            <div className="mx-auto flex items-center justify-center">
              <button
                onClick={onToggle}
                className="focus:outline-none cursor-pointer flex items-center justify-center group"
                title="Click to expand sidebar"
              >
                <img
                  src="/logos/logo-option3.jpg"
                  alt="AgriBridge AI"
                  className="w-7 h-7 object-contain rounded-md shadow-md shadow-black/40 border border-emerald-400/50 bg-white group-hover:scale-105 transition-transform"
                />
              </button>
            </div>
          )}

          {/* Toggle collapse button when sidebar is open */}
          {sidebarOpen ? (
            <button
              onClick={onToggle}
              className="p-1 rounded-md bg-emerald-800 hover:bg-emerald-700 text-emerald-100 hover:text-white border border-emerald-700 transition-colors focus:outline-none cursor-pointer flex-shrink-0"
              title="Collapse Sidebar"
              aria-label="Collapse Sidebar"
            >
              <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.5}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M15 19l-7-7 7-7" />
              </svg>
            </button>
          ) : (
            /* Toggle expand button when sidebar is collapsed - Positioned cleanly on border line, never clipped */
            <button
              onClick={onToggle}
              className="absolute -right-4 top-5 z-50 p-1 rounded-md bg-emerald-800 hover:bg-emerald-700 text-emerald-100 hover:text-white border border-emerald-700 shadow-md transition-colors focus:outline-none cursor-pointer flex items-center justify-center"
              title="Expand Sidebar"
              aria-label="Expand Sidebar"
            >
              <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.5}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M9 5l7 7-7 7" />
              </svg>
            </button>
          )}
        </div>

        {/* Navigation links - Smoothly scrollable with classic design */}
        <nav className="p-2.5 space-y-1.5 flex-1 overflow-y-auto min-h-0 sidebar-scroll">
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
      <div className={`p-2.5 border-t border-emerald-800 bg-emerald-950/40 flex-shrink-0 ${sidebarOpen ? '' : 'flex flex-col items-center'}`}>
        {sidebarOpen ? (
          <>
            <Link
              to="/profile"
              className="flex items-center space-x-2 mb-2.5 hover:bg-emerald-800/40 p-1.5 rounded-lg transition-colors group cursor-pointer"
              title="View & Edit Profile"
            >
              {user?.profilePicture ? (
                <img
                  src={user.profilePicture}
                  alt="Avatar"
                  className="w-8 h-8 rounded-full object-cover border border-emerald-400/60 flex-shrink-0 shadow-2xs group-hover:scale-105 transition-transform"
                />
              ) : (
                <div className="w-8 h-8 rounded-full bg-emerald-800 border border-emerald-700 flex items-center justify-center font-bold text-xs text-emerald-100 flex-shrink-0 group-hover:scale-105 transition-transform">
                  {getInitials(user?.firstName, user?.lastName) || 'U'}
                </div>
              )}
              <div className="truncate min-w-0">
                <p className="text-xs font-semibold text-emerald-50 truncate group-hover:text-white transition-colors">
                  {user?.firstName} {user?.lastName}
                </p>
                <span className="inline-block text-[9px] bg-emerald-800/50 text-emerald-200 font-mono px-1.5 py-0.5 rounded border border-emerald-700">
                  {user?.roles?.[0]?.replace('_', ' ') || 'USER'}
                </span>
              </div>
            </Link>
            <button
              onClick={onLogout}
              className="w-full py-1.5 bg-emerald-800/40 hover:bg-red-700/80 hover:text-white hover:border-red-600 rounded-md text-[10px] font-semibold text-emerald-100 border border-emerald-700 transition-colors duration-200 cursor-pointer"
            >
              Sign Out
            </button>
          </>
        ) : (
          <div className="space-y-2.5 flex flex-col items-center">
            <Link
              to="/profile"
              className="group cursor-pointer block"
              title={`${user?.firstName} ${user?.lastName} - View Profile`}
            >
              {user?.profilePicture ? (
                <img
                  src={user.profilePicture}
                  alt="Avatar"
                  className="w-8 h-8 rounded-full object-cover border border-emerald-400/60 shadow-2xs group-hover:scale-110 transition-transform"
                />
              ) : (
                <div className="w-8 h-8 rounded-full bg-emerald-800 border border-emerald-700 flex items-center justify-center font-bold text-xs text-emerald-100 group-hover:scale-110 transition-transform">
                  {getInitials(user?.firstName, user?.lastName) || 'U'}
                </div>
              )}
            </Link>
            <button
              onClick={onLogout}
              className="p-1.5 bg-emerald-800/40 hover:bg-red-700/80 hover:text-white hover:border-red-600 rounded-md text-emerald-100 border border-emerald-700 transition-colors cursor-pointer"
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
