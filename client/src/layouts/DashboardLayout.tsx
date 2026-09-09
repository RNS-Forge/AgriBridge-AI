import React, { useState } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { useAppSelector, useAppDispatch } from '../hooks';
import { logout } from '../store';
import { Sidebar, LogoSelectorModal } from '../components/ui';

interface DashboardLayoutProps {
  children: React.ReactNode;
}

interface ComponentNavItem {
  label: string;
  path: string;
  roles: string[];
  icon: string;
}

const ALL_NAV_ITEMS: ComponentNavItem[] = [
  // Platform Overview for all roles
  {
    label: 'Dashboard Hub',
    path: '/dashboard',
    roles: ['ADMIN', 'ADMIN_MAKER', 'FARMER', 'FARM_MANAGER', 'WORKER', 'BUYER', 'MANDI_AGENT', 'SuperAdmin', 'FPO_ADMIN'],
    icon: 'HomeIcon',
  },

  // ── FARMER & FARM MANAGER ──
  {
    label: 'Farms & Plots',
    path: '/farms',
    roles: ['FARMER', 'FARM_MANAGER'],
    icon: 'FarmIcon',
  },
  {
    label: 'Crop Lifecycle',
    path: '/crops',
    roles: ['FARMER', 'FARM_MANAGER'],
    icon: 'CropIcon',
  },
  {
    label: 'Field Tasks',
    path: '/tasks',
    roles: ['FARMER', 'FARM_MANAGER', 'WORKER'],
    icon: 'TasksIcon',
  },
  {
    label: 'Cost Basis & Expenses',
    path: '/expenses',
    roles: ['FARMER', 'FARM_MANAGER'],
    icon: 'ExpenseIcon',
  },
  {
    label: 'Consumables & Stock',
    path: '/inventory',
    roles: ['FARM_MANAGER', 'FARMER'],
    icon: 'InventoryIcon',
  },
  {
    label: 'Produce Marketplace',
    path: '/marketplace',
    roles: ['FARMER', 'BUYER'],
    icon: 'MarketplaceIcon',
  },
  {
    label: 'Mandi Slot Booking',
    path: '/mandi',
    roles: ['FARMER', 'MANDI_AGENT'],
    icon: 'MandiIcon',
  },
  {
    label: 'Orders & Logistics',
    path: '/orders',
    roles: ['FARMER', 'BUYER'],
    icon: 'OrdersIcon',
  },
  {
    label: 'Profit Reports',
    path: '/profit-reports',
    roles: ['FARMER'],
    icon: 'ProfitIcon',
  },

  // ── ADMIN_MAKER SPECIFIC ──
  {
    label: 'Request Role / User',
    path: '/admin-maker/create-request',
    roles: ['ADMIN_MAKER'],
    icon: 'UserPlusIcon',
  },
  {
    label: 'My Role Requests',
    path: '/admin-maker/requests',
    roles: ['ADMIN_MAKER'],
    icon: 'QueueIcon',
  },

  // ── ADMIN SPECIFIC (Governance, User Management & Main Functions Alone) ──
  {
    label: 'Live Price Monitor',
    path: '/admin/live-prices',
    roles: ['ADMIN', 'SuperAdmin'],
    icon: 'LivePriceIcon',
  },
  {
    label: 'User Management',
    path: '/admin/users',
    roles: ['ADMIN', 'SuperAdmin'],
    icon: 'UsersIcon',
  },
  {
    label: 'Create User',
    path: '/admin/create-user',
    roles: ['ADMIN', 'SuperAdmin'],
    icon: 'UserPlusIcon',
  },
  {
    label: 'Produce Moderation',
    path: '/admin/moderation',
    roles: ['ADMIN', 'SuperAdmin'],
    icon: 'ShieldIcon',
  },
  {
    label: 'Disputes Center',
    path: '/admin/disputes',
    roles: ['ADMIN', 'SuperAdmin'],
    icon: 'DisputeIcon',
  },
  {
    label: 'Audit Logs',
    path: '/admin/audit-logs',
    roles: ['ADMIN', 'SuperAdmin'],
    icon: 'AuditIcon',
  },
];

// Icons map
const Icons = {
  HomeIcon: (
    <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
      <path strokeLinecap="round" strokeLinejoin="round" d="M3 12l2-2m0 0l7-7 7 7M5 10v10a1 1 0 001 1h3m10-11l2 2m-2-2v10a1 1 0 01-1 1h-3m-6 0a1 1 0 001-1v-4a1 1 0 011-1h2a1 1 0 011 1v4a1 1 0 001 1m-6 0h6" />
    </svg>
  ),
  FarmIcon: (
    <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
      <path strokeLinecap="round" strokeLinejoin="round" d="M3.75 6A2.25 2.25 0 016 3.75h2.25A2.25 2.25 0 0110.5 6v2.25a2.25 2.25 0 01-2.25 2.25H6a2.25 2.25 0 01-2.25-2.25V6zM3.75 15.75A2.25 2.25 0 016 13.5h2.25a2.25 2.25 0 012.25 2.25V18a2.25 2.25 0 01-2.25 2.25H6A2.25 2.25 0 013.75 18v-2.25zM13.5 6a2.25 2.25 0 012.25-2.25H18A2.25 2.25 0 0120.25 6v2.25A2.25 2.25 0 0118 10.5h-2.25a2.25 2.25 0 01-2.25-2.25V6zM13.5 15.75a2.25 2.25 0 012.25-2.25H18a2.25 2.25 0 012.25 2.25V18A2.25 2.25 0 0118 20.25h-2.25A2.25 2.25 0 0113.5 18v-2.25z" />
    </svg>
  ),
  CropIcon: (
    <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
      <path strokeLinecap="round" strokeLinejoin="round" d="M12 6.042A8.967 8.967 0 006 3.75c-1.052 0-2.062.18-3 .512v14.25A8.987 8.987 0 016 18c2.305 0 4.408.867 6 2.292m0-14.25a8.966 8.966 0 016-2.292c1.052 0 2.062.18 3 .512v14.25A8.987 8.987 0 0018 18a8.967 8.967 0 00-6 2.292m0-14.25v14.25" />
    </svg>
  ),
  TasksIcon: (
    <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
      <path strokeLinecap="round" strokeLinejoin="round" d="M9 12.75L11.25 15 15 9.75M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
    </svg>
  ),
  ExpenseIcon: (
    <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
      <path strokeLinecap="round" strokeLinejoin="round" d="M12 6v12m-3-2.818l.879.659c1.171.879 3.07.879 4.242 0 1.172-.879 1.172-2.303 0-3.182C13.536 12.219 12.768 12 12 12c-.725 0-1.45-.22-2.003-.659-1.106-.879-1.106-2.303 0-3.182s2.9-.879 4.006 0l.415.33M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
    </svg>
  ),
  InventoryIcon: (
    <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
      <path strokeLinecap="round" strokeLinejoin="round" d="M20.25 7.5l-.625 10.632a2.25 2.25 0 01-2.247 2.118H6.622a2.25 2.25 0 01-2.247-2.118L3.75 7.5M10 11.25h4M3.375 7.5h17.25c.621 0 1.125-.504 1.125-1.125v-1.5c0-.621-.504-1.125-1.125-1.125H3.375c-.621 0-1.125.504-1.125 1.125v1.5c0 .621.504 1.125 1.125 1.125z" />
    </svg>
  ),
  MarketplaceIcon: (
    <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
      <path strokeLinecap="round" strokeLinejoin="round" d="M15.75 10.5V6a3.75 3.75 0 10-7.5 0v4.5m11.356-1.993l1.263 12c.07.665-.45 1.243-1.119 1.243H4.25a1.125 1.125 0 01-1.12-1.243l1.264-12A1.125 1.125 0 015.513 7.5h12.974c.576 0 1.059.435 1.119 1.007zM8.625 10.5a.375.375 0 11-.75 0 .375.375 0 01.75 0zm7.5 0a.375.375 0 11-.75 0 .375.375 0 01.75 0z" />
    </svg>
  ),
  MandiIcon: (
    <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
      <path strokeLinecap="round" strokeLinejoin="round" d="M12 6v6h4.5m4.5 0a9 9 0 11-18 0 9 9 0 0118 0z" />
    </svg>
  ),
  OrdersIcon: (
    <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
      <path strokeLinecap="round" strokeLinejoin="round" d="M8.25 18.75a1.5 1.5 0 01-3 0m3 0a1.5 1.5 0 00-3 0m3 0h6m-9 0H3.375a1.125 1.125 0 01-1.125-1.125V14.25m17.25 4.5a1.5 1.5 0 01-3 0m3 0a1.5 1.5 0 00-3 0m3 0h1.125c.621 0 1.129-.504 1.09-1.124a17.902 17.902 0 00-3.213-9.193 2.056 2.056 0 00-1.58-.86H14.25M16.5 18.75h-2.25m0-11.177v-.958c0-.568-.422-1.048-.987-1.106a48.554 48.554 0 00-10.026 0 1.106 1.106 0 00-.987 1.106v7.635m12-6.677v6.677m0 4.5v-4.5m0 0h-12" />
    </svg>
  ),
  ProfitIcon: (
    <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
      <path strokeLinecap="round" strokeLinejoin="round" d="M2.25 18L9 11.25l4.306 4.307a11.95 11.95 0 015.814-5.519l2.74-1.22m0 0l-5.94-2.28m5.94 2.28l-2.28 5.941" />
    </svg>
  ),
  UsersIcon: (
    <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
      <path strokeLinecap="round" strokeLinejoin="round" d="M15 19.128a9.38 9.38 0 002.625.372 9.337 9.337 0 004.121-.952 4.125 4.125 0 00-7.533-2.493M15 19.128v-.003c0-1.113-.285-2.16-.786-3.07M15 19.128v.106A12.318 12.318 0 018.624 21c-2.331 0-4.512-.645-6.374-1.766l-.001-.109a6.375 6.375 0 0111.964-3.07M12 6.375a3.375 3.375 0 11-6.75 0 3.375 3.375 0 016.75 0zm8.25 2.25a2.625 2.625 0 11-5.25 0 2.625 2.625 0 015.25 0z" />
    </svg>
  ),
  UserPlusIcon: (
    <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
      <path strokeLinecap="round" strokeLinejoin="round" d="M19 7.5v3m0 0v3m0-3h3m-3 0h-3m-2.25-4.125a3.375 3.375 0 11-6.75 0 3.375 3.375 0 016.75 0zM4 19.235v-.11a6.375 6.375 0 0112.75 0v.109A12.318 12.318 0 0110.374 21c-2.331 0-4.512-.645-6.374-1.765z" />
    </svg>
  ),
  QueueIcon: (
    <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
      <path strokeLinecap="round" strokeLinejoin="round" d="M3.75 12h16.5m-16.5 3.75h16.5M3.75 19.5h16.5M5.625 4.5h12.75a1.875 1.875 0 010 3.75H5.625a1.875 1.875 0 010-3.75z" />
    </svg>
  ),
  ShieldIcon: (
    <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
      <path strokeLinecap="round" strokeLinejoin="round" d="M9 12.75L11.25 15 15 9.75m-3-7.036A11.959 11.959 0 013.598 6 11.99 11.99 0 003 9.749c0 5.592 3.824 10.29 9 11.623 5.176-1.332 9-6.03 9-11.622 0-1.31-.21-2.571-.598-3.751h-.152c-3.196 0-6.1-1.248-8.25-3.285z" />
    </svg>
  ),
  DisputeIcon: (
    <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
      <path strokeLinecap="round" strokeLinejoin="round" d="M12 9v3.75m9-.75a9 9 0 11-18 0 9 9 0 0118 0zm-9 3.75h.008v.008H12v-.008z" />
    </svg>
  ),
  LivePriceIcon: (
    <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
      <path strokeLinecap="round" strokeLinejoin="round" d="M2.25 18L9 11.25l4.306 4.307a11.95 11.95 0 015.814-5.519l2.74-1.22m0 0l-5.94-2.281m5.94 2.28l-2.28 5.941" />
    </svg>
  ),
  AuditIcon: (
    <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
      <path strokeLinecap="round" strokeLinejoin="round" d="M19.5 14.25v-2.625a3.375 3.375 0 00-3.375-3.375h-1.5A1.125 1.125 0 0113.5 7.125v-1.5a3.375 3.375 0 00-3.375-3.375H8.25m0 12.75h7.5m-7.5 3H12M10.5 2.25H5.625c-.621 0-1.125.504-1.125 1.125v17.25c0 .621.504 1.125 1.125 1.125h12.75c.621 0 1.125-.504 1.125-1.125V11.25a9 9 0 00-9-9z" />
    </svg>
  ),
};

export function DashboardLayout({ children }: DashboardLayoutProps) {
  const { user } = useAppSelector((s) => s.auth);
  const dispatch = useAppDispatch();
  const navigate = useNavigate();
  const location = useLocation();
  const [sidebarOpen, setSidebarOpen] = useState(true);
  const [showLogoModal, setShowLogoModal] = useState(false);

  // User's active roles
  const userRoles = user?.roles || ['FARMER'];

  // Filter visible nav items matching user's roles
  const visibleNav = ALL_NAV_ITEMS.filter((item) =>
    item.roles.some((r) => userRoles.includes(r))
  );

  const currentPageLabel =
    ALL_NAV_ITEMS.find((item) => item.path === location.pathname)?.label ??
    'Platform Workspace';

  const handleLogout = () => {
    dispatch(logout());
    navigate('/login');
  };

  const primaryRole = userRoles[0] || 'User';

  return (
    <div className="flex h-screen max-h-screen overflow-hidden bg-slate-50 text-gray-900 font-sans w-full max-w-full">
      {/* Sidebar Component */}
      <Sidebar
        user={user}
        sidebarOpen={sidebarOpen}
        onToggle={() => setSidebarOpen(!sidebarOpen)}
        onLogout={handleLogout}
        visibleNav={visibleNav}
        icons={Icons}
      />

      {/* Main Area with margin synced to sidebar */}
      <div className={`flex-1 flex flex-col h-screen max-h-screen min-w-0 max-w-full overflow-hidden ${sidebarOpen ? 'ml-48' : 'ml-14'} transition-all duration-300 ease-in-out`}>
        {/* Top bar with emerald accent border */}
        <header className="h-16 bg-white border-b border-emerald-200/80 flex items-center justify-between px-6 sticky top-0 z-30 shadow-xs flex-shrink-0">
          <div className="flex items-center gap-3">
            <div className="flex items-center gap-2 text-xs font-semibold text-slate-500">
              <span className="text-slate-800 font-bold text-sm tracking-tight">AgriBridge AI</span>
              <span className="text-slate-300">/</span>
              <span className="text-emerald-800 font-bold text-sm">{currentPageLabel}</span>
            </div>
          </div>

          <div className="flex items-center space-x-3">
            {/* Role Badge */}
            <div className="flex items-center gap-1.5 px-2.5 py-1 bg-emerald-50 rounded-md border border-emerald-200 text-xs">
              <span className="text-emerald-700 text-[10px] font-medium">Role:</span>
              <span className="font-bold text-emerald-900 uppercase tracking-wide text-[10px]">
                {primaryRole.replace('_', ' ')}
              </span>
            </div>

            {/* User Profile avatar trigger */}
            <button
              onClick={() => navigate('/profile')}
              className="flex items-center gap-2.5 pl-2.5 pr-2 py-1 border-l border-emerald-200 hover:bg-emerald-50/80 rounded-lg transition-all duration-150 cursor-pointer group text-left border border-transparent hover:border-emerald-200 focus:outline-none"
              title="Click to view & edit your profile"
            >
              {user?.profilePicture ? (
                <img
                  src={user.profilePicture}
                  alt="Profile Avatar"
                  className="w-7 h-7 rounded-md object-cover border border-emerald-700 shadow-xs group-hover:scale-105 transition-transform"
                />
              ) : (
                <div className="w-7 h-7 rounded-md bg-emerald-800 border border-emerald-700 text-white font-bold text-xs flex items-center justify-center shadow-xs group-hover:scale-105 transition-transform">
                  {user?.firstName?.[0] || 'U'}
                </div>
              )}
              <div className="hidden sm:block text-left text-xs">
                <p className="font-bold text-slate-800 leading-tight group-hover:text-emerald-950 flex items-center gap-1">
                  <span>{user?.firstName} {user?.lastName}</span>
                  <span className="text-[10px] text-slate-400 group-hover:text-emerald-700 transition-colors">⚙</span>
                </p>
                <p className="text-[10px] text-slate-500 truncate max-w-[140px]">{user?.email}</p>
              </div>
            </button>
          </div>
        </header>

        {/* Brand Logo Selector Modal */}
        <LogoSelectorModal isOpen={showLogoModal} onClose={() => setShowLogoModal(false)} />

        {/* Page Content */}
        <main className="flex-1 min-h-0 min-w-0 max-w-full overflow-y-auto overflow-x-auto p-4 md:p-5 bg-slate-50 flex flex-col">
          {children}
        </main>
      </div>
    </div>
  );
}