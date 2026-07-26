import React, { useState } from 'react';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import { useAppSelector, useAppDispatch } from '../hooks';
import { logout } from '../store';
import type { NavItem } from '../types';
import { getInitials, truncateId } from '../utils';

interface DashboardLayoutProps {
  children: React.ReactNode;
}

const BASE_NAV_ITEMS: NavItem[] = [
  { label: 'Platform Hub',     path: '/dashboard',  roles: ['FPO_ADMIN', 'SuperAdmin', 'Farmer', 'Buyer'], icon: 'HomeIcon' },
  { label: 'Farmers & Farms',  path: '/farmers',    roles: ['FPO_ADMIN', 'SuperAdmin'], icon: 'FarmersIcon' },
  { label: 'Mandi Pricing',    path: '/mandi',      roles: ['FPO_ADMIN', 'SuperAdmin', 'Farmer'], icon: 'PricingIcon' },
  { label: 'Marketplace',      path: '/marketplace', roles: ['FPO_ADMIN', 'SuperAdmin', 'Buyer'], icon: 'MarketplaceIcon' },
  { label: 'Export Clearances', path: '/exports',    roles: ['FPO_ADMIN', 'SuperAdmin'], icon: 'ExportIcon' },
  { label: 'AI Assistant',     path: '/ai',         roles: ['FPO_ADMIN', 'SuperAdmin', 'Farmer', 'Buyer'], icon: 'AIIcon' },
];

const SUPERADMIN_NAV_ITEM: NavItem = {
  label: 'Super Control',
  path: '/superadmin',
  roles: ['SuperAdmin'],
  icon: 'AdminIcon',
};

// Icons for nav items
const Icons = {
  HomeIcon: (
    <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
      <path strokeLinecap="round" strokeLinejoin="round" d="M3 12l2-2m0 0l7-7 7 7M5 10v10a1 1 0 001 1h3m10-11l2 2m-2-2v10a1 1 0 01-1 1h-3m-6 0a1 1 0 001-1v-4a1 1 0 011-1h2a1 1 0 011 1v4a1 1 0 001 1m-6 0h6" />
    </svg>
  ),
  FarmersIcon: (
    <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
      <path strokeLinecap="round" strokeLinejoin="round" d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z" />
    </svg>
  ),
  PricingIcon: (
    <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
      <path strokeLinecap="round" strokeLinejoin="round" d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
    </svg>
  ),
  MarketplaceIcon: (
    <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
      <path strokeLinecap="round" strokeLinejoin="round" d="M16 11V7a4 4 0 00-8 0v4M5 9h14l1 12H4L5 9z" />
    </svg>
  ),
  ExportIcon: (
    <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
      <path strokeLinecap="round" strokeLinejoin="round" d="M12 19l9 2-9-18-9 18 9-2zm0 0v-8" />
    </svg>
  ),
  AIIcon: (
    <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
      <path strokeLinecap="round" strokeLinejoin="round" d="M9.663 17h4.673M12 3v1m6.364 1.636l-.707.707M21 12h-1M4 12H3m3.343-5.657l-.707-.707m2.828 9.9a5 5 0 117.072 0l-.548.547A3.374 3.374 0 0014 18.469V19a2 2 0 11-4 0v-.531c0-.895-.356-1.754-.988-2.386l-.548-.547z" />
    </svg>
  ),
  AdminIcon: (
    <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
      <path strokeLinecap="round" strokeLinejoin="round" d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4" />
    </svg>
  ),
};

// Compact logo icon (visible when sidebar is collapsed)
const CompactLogoIcon = (
  <svg className="w-8 h-8 text-emerald-600" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
    <path strokeLinecap="round" strokeLinejoin="round" d="M14.828 14.828a4 4 0 01-5.656 0M9 10h.01M15 10h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
  </svg>
);

export function DashboardLayout({ children }: DashboardLayoutProps) {
  const { user } = useAppSelector((s) => s.auth);
  const dispatch = useAppDispatch();
  const navigate = useNavigate();
  const location = useLocation();
  const [sidebarOpen, setSidebarOpen] = useState(true);

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

  const toggleSidebar = () => {
    setSidebarOpen(!sidebarOpen);
  };

  return (
    <div className="flex min-h-screen bg-gray-50 text-gray-900 font-sans">
      {/* Static Sidebar */}
      <aside
        className={`fixed left-0 top-0 h-full bg-white border-r border-emerald-200 flex flex-col justify-between z-40 transition-all duration-300 ease-in-out ${
          sidebarOpen ? 'w-64' : 'w-16'
        }`}
      >
        <div>
          {/* Logo (clickable to toggle sidebar) */}
          <div
            onClick={toggleSidebar}
            className="h-16 flex items-center justify-center px-6 border-b border-emerald-200 cursor-pointer hover:bg-emerald-50 transition-colors duration-200"
          >
            {sidebarOpen ? (
              <span className="text-xl font-bold text-emerald-600">
                AgriBridge AI
              </span>
            ) : (
              CompactLogoIcon
            )}
          </div>

          {/* Nav links */}
          <nav className="p-4 space-y-2">
            {visibleNav.map((item) => {
              const isActive = location.pathname === item.path;
              const Icon = Icons[item.icon as keyof typeof Icons];
              return (
                <Link
                  key={item.path}
                  to={item.path}
                  className={`flex items-center px-4 py-2.5 rounded-lg text-sm font-medium transition-colors duration-200 ${
                    isActive
                      ? 'bg-emerald-50 text-emerald-600 border-l-4 border-emerald-600'
                      : 'text-gray-600 hover:bg-emerald-50 hover:text-emerald-600'
                  }`}
                >
                  <span className="mr-3">{Icon}</span>
                  {sidebarOpen && item.label}
                </Link>
              );
            })}
          </nav>
        </div>

        {/* User card */}
        {sidebarOpen && (
          <div className="p-4 border-t border-emerald-200 bg-emerald-50">
            <div className="flex items-center space-x-3 mb-3">
              <div className="w-10 h-10 rounded-full bg-emerald-100 border border-emerald-200 flex items-center justify-center font-bold text-emerald-600">
                {getInitials(user?.firstName, user?.lastName) || 'U'}
              </div>
              <div className="truncate">
                <p className="text-sm font-semibold text-gray-900 truncate">
                  {user?.firstName} {user?.lastName}
                </p>
                <span className="inline-block text-[10px] bg-emerald-100 text-emerald-600 font-mono px-2 py-0.5 rounded border border-emerald-200">
                  {user?.roles[0]}
                </span>
              </div>
            </div>
            <button
              onClick={handleLogout}
              className="w-full py-2 bg-white hover:bg-red-50 hover:text-red-600 hover:border-red-200 rounded-lg text-xs font-semibold text-gray-600 border border-emerald-200 transition-colors duration-200"
            >
              Sign Out
            </button>
          </div>
        )}
      </aside>

      {/* Main area */}
      <div className={`flex-1 flex flex-col min-h-screen ${sidebarOpen ? 'ml-64' : 'ml-16'} transition-all duration-300 ease-in-out`}>
        {/* Top bar */}
        <header className="h-16 bg-white border-b border-emerald-200 flex items-center justify-between px-8">
          <h2 className="text-lg font-bold text-gray-900">{currentPageLabel}</h2>
          <div className="flex items-center space-x-4">
            <div className="text-xs text-gray-500 bg-emerald-50 px-3 py-1.5 rounded-lg border border-emerald-200 font-mono">
              FPO Space ID:{" "}
              {user?.tenantId ? truncateId(user.tenantId) : 'Global'}
            </div>
          </div>
        </header>

        {/* Scrollable Page content */}
        <main className="flex-1 overflow-y-auto p-8 bg-gray-50">
          {children}
        </main>
      </div>
    </div>
  );
}