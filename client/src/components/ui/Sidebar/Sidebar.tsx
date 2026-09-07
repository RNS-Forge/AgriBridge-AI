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
      className={`fixed left-0 top-0 h-screen bg-emerald-950 text-white flex flex-col z-40 transition-all duration-300 ease-in-out border-r border-emerald-800/70 shadow-xl ${
        sidebarOpen ? 'w-64' : 'w-16'
      }`}
    >
      {/* ── Fixed Header: Logo & Toggle Button ── */}
      <div className="h-16 flex items-center justify-between px-4 border-b border-emerald-800/80 bg-emerald-950/80 backdrop-blur flex-shrink-0 relative">
        {sidebarOpen ? (
          <div className="flex items-center gap-2.5 min-w-0">
            <div className="w-8 h-8 rounded-xl bg-gradient-to-tr from-emerald-600 to-teal-500 flex items-center justify-center text-white font-bold text-sm shadow-md flex-shrink-0">
              🌱
            </div>
            <div className="truncate min-w-0">
              <span className="text-base font-extrabold text-white tracking-tight leading-none block">
                AgriBridge<span className="text-emerald-400">AI</span>
              </span>
              <span className="text-[10px] text-emerald-300/70 font-semibold tracking-wide uppercase block mt-0.5">
                Phase 1 Enterprise
              </span>
            </div>
          </div>
        ) : (
          <div className="mx-auto w-8 h-8 rounded-xl bg-gradient-to-tr from-emerald-600 to-teal-500 flex items-center justify-center text-white font-bold text-sm shadow-md">
            🌱
          </div>
        )}

        {/* Toggle Collapse Button */}
        <button
          onClick={onToggle}
          className={`p-1.5 rounded-lg bg-emerald-900/90 hover:bg-emerald-800 text-emerald-200 hover:text-white border border-emerald-700/80 transition-all focus:outline-none shadow-xs ${
            sidebarOpen ? '' : 'absolute -right-3 top-5 z-50 shadow-md bg-emerald-900 ring-2 ring-emerald-950'
          }`}
          title={sidebarOpen ? 'Collapse Sidebar' : 'Expand Sidebar'}
          aria-label={sidebarOpen ? 'Collapse Sidebar' : 'Expand Sidebar'}
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

      {/* ── Scrollable Navigation Area ── */}
      <div className="flex-1 overflow-y-auto min-h-0 py-3 px-2.5 space-y-1 sidebar-scroll">
        {sidebarOpen && (
          <div className="px-2 pb-1.5 pt-0.5">
            <span className="text-[10px] font-bold tracking-wider text-emerald-300/50 uppercase">
              Platform Navigation
            </span>
          </div>
        )}

        <nav className="space-y-1">
          {visibleNav.map((item) => {
            const isActive = location.pathname === item.path;
            const Icon = icons[item.icon];
            return (
              <Link
                key={item.path}
                to={item.path}
                className={`group flex items-center rounded-xl text-xs font-medium transition-all duration-150 ${
                  sidebarOpen ? 'px-3 py-2.5' : 'p-2.5 justify-center'
                } ${
                  isActive
                    ? 'bg-gradient-to-r from-emerald-800 to-emerald-700 text-white font-semibold shadow-sm border border-emerald-600/50 ring-1 ring-emerald-400/20'
                    : 'text-emerald-100/80 hover:bg-emerald-900/60 hover:text-white border border-transparent'
                }`}
                title={!sidebarOpen ? item.label : undefined}
              >
                <span
                  className={`flex-shrink-0 transition-transform group-hover:scale-110 ${
                    isActive ? 'text-emerald-300' : 'text-emerald-300/70 group-hover:text-emerald-200'
                  } ${sidebarOpen ? 'mr-3' : ''}`}
                >
                  {Icon}
                </span>
                {sidebarOpen && (
                  <span className="truncate leading-tight font-medium text-[12.5px]">
                    {item.label}
                  </span>
                )}
                {sidebarOpen && isActive && (
                  <span className="ml-auto w-1.5 h-1.5 rounded-full bg-emerald-300 shadow-xs" />
                )}
              </Link>
            );
          })}
        </nav>
      </div>

      {/* ── Fixed Bottom User Profile & Sign Out ── */}
      <div className={`p-3 border-t border-emerald-800/80 bg-emerald-950/90 backdrop-blur flex-shrink-0 ${sidebarOpen ? '' : 'flex flex-col items-center'}`}>
        {sidebarOpen ? (
          <div className="space-y-3">
            <div className="flex items-center gap-2.5">
              <div className="w-9 h-9 rounded-xl bg-gradient-to-tr from-emerald-700 to-emerald-600 border border-emerald-600 flex items-center justify-center font-bold text-xs text-white shadow-xs flex-shrink-0">
                {getInitials(user?.firstName, user?.lastName) || 'U'}
              </div>
              <div className="truncate min-w-0">
                <p className="text-xs font-bold text-white truncate leading-tight">
                  {user?.firstName} {user?.lastName}
                </p>
                <div className="flex items-center gap-1.5 mt-0.5">
                  <span className="inline-block text-[9px] font-bold uppercase tracking-wider bg-emerald-800/80 text-emerald-200 px-1.5 py-0.5 rounded border border-emerald-700/80">
                    {user?.roles?.[0]?.replace('_', ' ') || 'USER'}
                  </span>
                  <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse" title="Online" />
                </div>
              </div>
            </div>

            <button
              onClick={onLogout}
              className="w-full py-2 px-3 bg-emerald-900/40 hover:bg-rose-900/60 hover:text-white hover:border-rose-700/80 rounded-xl text-xs font-semibold text-emerald-200/90 border border-emerald-800 transition-all duration-150 flex items-center justify-center gap-1.5"
            >
              <svg className="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1" />
              </svg>
              <span>Sign Out</span>
            </button>
          </div>
        ) : (
          <div className="space-y-2 flex flex-col items-center">
            <div
              className="w-8 h-8 rounded-xl bg-gradient-to-tr from-emerald-700 to-emerald-600 border border-emerald-600 flex items-center justify-center font-bold text-xs text-white shadow-xs"
              title={`${user?.firstName} ${user?.lastName} (${user?.roles?.[0]})`}
            >
              {getInitials(user?.firstName, user?.lastName) || 'U'}
            </div>
            <button
              onClick={onLogout}
              className="p-2 bg-emerald-900/50 hover:bg-rose-900/80 hover:text-white hover:border-rose-600 rounded-lg text-emerald-200 border border-emerald-800 transition-colors"
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
