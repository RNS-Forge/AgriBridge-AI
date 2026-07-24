// ---------------------------------------------------------------------------
// DashboardLayout — sidebar + top-bar shell for all protected pages.
// Imports updated: store/hooks from their new barrel paths.
// ---------------------------------------------------------------------------

import React from 'react';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import { useAppSelector, useAppDispatch } from '../hooks';
import { logout } from '../store';
import type { NavItem } from '../types';
import { getInitials, truncateId } from '../utils';

interface DashboardLayoutProps {
  children: React.ReactNode;
}

const BASE_NAV_ITEMS: NavItem[] = [
  { label: 'Platform Hub',     path: '/dashboard',  roles: ['FPO_ADMIN', 'SuperAdmin', 'Farmer', 'Buyer'] },
  { label: 'Farmers & Farms',  path: '/farmers',    roles: ['FPO_ADMIN', 'SuperAdmin'] },
  { label: 'Mandi Pricing',    path: '/mandi',      roles: ['FPO_ADMIN', 'SuperAdmin', 'Farmer'] },
  { label: 'Marketplace',      path: '/marketplace',roles: ['FPO_ADMIN', 'SuperAdmin', 'Buyer'] },
  { label: 'Export Clearances',path: '/exports',    roles: ['FPO_ADMIN', 'SuperAdmin'] },
  { label: 'AI Assistant',     path: '/ai',         roles: ['FPO_ADMIN', 'SuperAdmin', 'Farmer', 'Buyer'] },
];

const SUPERADMIN_NAV_ITEM: NavItem = {
  label: 'Super Control',
  path: '/superadmin',
  roles: ['SuperAdmin'],
};

export function DashboardLayout({ children }: DashboardLayoutProps) {
  const { user } = useAppSelector((s) => s.auth);
  const dispatch   = useAppDispatch();
  const navigate   = useNavigate();
  const location   = useLocation();

  const isSuperAdmin = user?.roles.includes('SuperAdmin') ?? false;

  const navItems: NavItem[] = isSuperAdmin
    ? [...BASE_NAV_ITEMS, SUPERADMIN_NAV_ITEM]
    : BASE_NAV_ITEMS;

  const visibleNav = navItems.filter((item) =>
    item.roles.some((r) => user?.roles.includes(r))
  );

  const currentPageLabel =
    navItems.find((item) => item.path === location.pathname)?.label ??
    'Dashboard';

  const handleLogout = () => {
    dispatch(logout());
    navigate('/login');
  };

  return (
    <div className="flex min-h-screen bg-slate-950 text-slate-100 font-sans">
      {/* ── Sidebar ─────────────────────────────────────────────────────── */}
      <aside className="w-64 bg-slate-900/80 backdrop-blur-md border-r border-slate-800 flex flex-col justify-between">
        <div>
          {/* Logo */}
          <div className="h-16 flex items-center px-6 border-b border-slate-800">
            <span className="text-xl font-bold bg-gradient-to-r from-emerald-400 to-teal-400 bg-clip-text text-transparent">
              AgriBridge AI
            </span>
          </div>

          {/* Nav links */}
          <nav className="p-4 space-y-2">
            {visibleNav.map((item) => {
              const isActive = location.pathname === item.path;
              return (
                <Link
                  key={item.path}
                  to={item.path}
                  className={`flex items-center px-4 py-2.5 rounded-lg text-sm font-medium transition-all ${
                    isActive
                      ? 'bg-emerald-600 text-white shadow-lg shadow-emerald-600/30'
                      : 'text-slate-400 hover:bg-slate-800 hover:text-slate-100'
                  }`}
                >
                  {item.label}
                </Link>
              );
            })}
          </nav>
        </div>

        {/* ── User card ──────────────────────────────────────────────────── */}
        <div className="p-4 border-t border-slate-800 bg-slate-900/50">
          <div className="flex items-center space-x-3 mb-3">
            <div className="w-10 h-10 rounded-full bg-emerald-500/20 border border-emerald-500/30 flex items-center justify-center font-bold text-emerald-400">
              {getInitials(user?.firstName, user?.lastName) || 'U'}
            </div>
            <div className="truncate">
              <p className="text-sm font-semibold text-slate-100 truncate">
                {user?.firstName} {user?.lastName}
              </p>
              <span className="inline-block text-[10px] bg-slate-800 text-emerald-400 font-mono px-2 py-0.5 rounded border border-slate-700">
                {user?.roles[0]}
              </span>
            </div>
          </div>
          <button
            onClick={handleLogout}
            className="w-full py-2 bg-slate-800 hover:bg-red-950/40 hover:text-red-400 hover:border-red-900/50 rounded-lg text-xs font-semibold text-slate-300 border border-slate-700 transition-all"
          >
            Sign Out
          </button>
        </div>
      </aside>

      {/* ── Main area ───────────────────────────────────────────────────── */}
      <div className="flex-1 flex flex-col overflow-hidden">
        {/* Top bar */}
        <header className="h-16 bg-slate-900/50 border-b border-slate-800 flex items-center justify-between px-8">
          <h2 className="text-lg font-bold text-slate-100">{currentPageLabel}</h2>
          <div className="flex items-center space-x-4">
            <div className="text-xs text-slate-400 bg-slate-800 px-3 py-1.5 rounded-lg border border-slate-700 font-mono">
              FPO Space ID:{' '}
              {user?.tenantId ? truncateId(user.tenantId) : 'Global'}
            </div>
          </div>
        </header>

        {/* Page content */}
        <main className="flex-1 overflow-y-auto p-8 bg-slate-950">
          {children}
        </main>
      </div>
    </div>
  );
}
