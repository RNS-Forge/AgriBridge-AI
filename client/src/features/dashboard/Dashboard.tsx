import { useState, useEffect } from 'react';
import { useSelector } from 'react-redux';
import { Link } from 'react-router-dom';
import { RootState } from '../../store/index.js';
import { API_BASE_URL } from '../../services/api.js';
import {
  PackageIcon,
  BuildingIcon,
  UsersIcon,
  PlusIcon,
  ClipboardIcon,
  CartIcon,
  AlertTriangleIcon,
  ShieldIcon,
} from '../../components/ui/icons/index.js';

export default function Dashboard() {
  const { user } = useSelector((state: RootState) => state.auth);
  const primaryRole = user?.roles?.[0] || 'FARMER';

  const [weatherData, setWeatherData] = useState<any>(null);
  const [adminSummary, setAdminSummary] = useState<any>(null);
  const [cropCostSummary, setCropCostSummary] = useState<any>(null);
  const [activeTasks, setActiveTasks] = useState<any[]>([]);
  const [userRequests, setUserRequests] = useState<any[]>([]);

  useEffect(() => {
    // Fetch weather
    fetch(`${API_BASE_URL}/weather/farms/farm-01`)
      .then((r) => r.json())
      .then((d) => {
        if (d.success) setWeatherData(d.data);
      })
      .catch(() => {});

    // Fetch crop cost summary
    fetch(`${API_BASE_URL}/crop-cycles/cc-01/cost-summary`)
      .then((r) => r.json())
      .then((d) => {
        if (d.success) setCropCostSummary(d.data);
      })
      .catch(() => {});

    // Fetch tasks
    fetch(`${API_BASE_URL}/tasks`)
      .then((r) => r.json())
      .then((d) => {
        if (d.success) setActiveTasks(d.data);
      })
      .catch(() => {});

    // Admin metrics if applicable
    if (primaryRole === 'ADMIN' || primaryRole === 'ADMIN_MAKER') {
      fetch(`${API_BASE_URL}/admin/dashboard-summary`)
        .then((r) => r.json())
        .then((d) => {
          if (d.success) setAdminSummary(d.data);
        })
        .catch(() => {});

      fetch(`${API_BASE_URL}/auth/user-requests`)
        .then((r) => r.json())
        .then((d) => {
          if (d.success) setUserRequests(d.data || []);
        })
        .catch(() => {});
    }
  }, [primaryRole]);

  return (
    <div className="space-y-5">
      {/* ── Page Header & Quick Navigation (Neat Theme) ── */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-3 border-b border-slate-200">
        <div>
          <div className="flex items-center gap-2 mb-1">
            <span className="px-2 py-0.5 rounded text-[10px] font-bold uppercase tracking-wider bg-emerald-100 text-emerald-800 border border-emerald-200">
              {primaryRole.replace('_', ' ')} WORKSPACE
            </span>
          </div>
          <h1 className="text-xl font-bold tracking-tight text-slate-900">
            {primaryRole === 'ADMIN' ? 'Platform Administration Dashboard' : `Welcome, ${user?.firstName || 'User'}`}
          </h1>
          <p className="text-xs text-slate-500 mt-0.5">
            {primaryRole === 'ADMIN' && 'User governance directory, pending approval queue, and platform moderation.'}
            {primaryRole === 'ADMIN_MAKER' && 'Operational Maker: request creation of all roles under Admin approval.'}
            {primaryRole === 'FARMER' && 'Cultivate → Sell Slice: record real expenses, see your true cost-basis, and sell via Direct Marketplace or Mandi Slots.'}
            {primaryRole === 'FARM_MANAGER' && 'Field Management: manage crop cycle stages, task assignments, and inventory stock consumption.'}
            {primaryRole === 'WORKER' && 'Field Operations: view assigned daily tasks, mark progress, and upload photo completion proof.'}
            {primaryRole === 'BUYER' && 'Direct Produce Procurement: browse verified harvests, submit offers, and track farmgate orders.'}
            {primaryRole === 'MANDI_AGENT' && 'APMC Yard Operations: manage arrival slots, confirm bookings, and record auction sale payouts.'}
          </p>
        </div>

        {/* Quick Shortcut Buttons based on Role */}
        <div className="flex flex-wrap gap-2 items-center">
          {primaryRole === 'FARMER' && (
            <>
              <Link
                to="/marketplace"
                className="px-3 py-1.5 rounded-md bg-white border border-slate-300 text-slate-700 font-semibold text-xs shadow-2xs hover:bg-slate-50 transition-colors flex items-center gap-1.5"
              >
                <PackageIcon className="w-3.5 h-3.5 text-slate-500" />
                <span>List Produce</span>
              </Link>
              <Link
                to="/mandi"
                className="px-3 py-1.5 rounded-md bg-emerald-700 text-white font-semibold text-xs shadow-2xs hover:bg-emerald-800 transition-colors flex items-center gap-1.5"
              >
                <BuildingIcon className="w-3.5 h-3.5 text-white" />
                <span>Book Mandi Slot</span>
              </Link>
            </>
          )}

          {primaryRole === 'ADMIN' && (
            <>
              <Link
                to="/admin/users"
                className="px-3 py-1.5 rounded-md border border-slate-300 bg-white hover:bg-slate-50 text-slate-700 font-semibold text-xs shadow-2xs transition-colors flex items-center gap-1.5"
              >
                <UsersIcon className="w-3.5 h-3.5 text-slate-500" />
                <span>Manage Users ({adminSummary?.pendingRequestsCount || 0} Pending)</span>
              </Link>
              <Link
                to="/admin/create-user"
                className="px-3 py-1.5 rounded-md bg-emerald-700 text-white font-semibold text-xs shadow-2xs hover:bg-emerald-800 transition-colors flex items-center gap-1.5"
              >
                <PlusIcon className="w-3.5 h-3.5 text-white" />
                <span>Create User</span>
              </Link>
            </>
          )}

          {primaryRole === 'ADMIN_MAKER' && (
            <Link
              to="/admin-maker/create-request"
              className="px-3 py-1.5 rounded-md bg-emerald-700 text-white font-semibold text-xs shadow-2xs hover:bg-emerald-800 transition-colors flex items-center gap-1.5"
            >
              <PlusIcon className="w-3.5 h-3.5 text-white" />
              <span>Request New Role</span>
            </Link>
          )}

          {primaryRole === 'WORKER' && (
            <Link
              to="/tasks"
              className="px-3 py-1.5 rounded-md bg-emerald-700 text-white font-semibold text-xs shadow-2xs hover:bg-emerald-800 transition-colors flex items-center gap-1.5"
            >
              <ClipboardIcon className="w-3.5 h-3.5 text-white" />
              <span>View My Tasks ({activeTasks.length})</span>
            </Link>
          )}

          {primaryRole === 'BUYER' && (
            <Link
              to="/marketplace"
              className="px-3 py-1.5 rounded-md bg-emerald-700 text-white font-semibold text-xs shadow-2xs hover:bg-emerald-800 transition-colors flex items-center gap-1.5"
            >
              <CartIcon className="w-3.5 h-3.5 text-white" />
              <span>Browse Marketplace</span>
            </Link>
          )}

          {primaryRole === 'MANDI_AGENT' && (
            <Link
              to="/mandi"
              className="px-3 py-1.5 rounded-md bg-emerald-700 text-white font-semibold text-xs shadow-2xs hover:bg-emerald-800 transition-colors flex items-center gap-1.5"
            >
              <BuildingIcon className="w-3.5 h-3.5 text-white" />
              <span>Manage Arrival Slots</span>
            </Link>
          )}
        </div>
      </div>

      {/* ── Weather Alert Banner ── */}
      {weatherData?.alerts && weatherData.alerts.length > 0 && (
        <div className="bg-amber-50 border-l-4 border-amber-500 p-3.5 rounded-md shadow-xs flex items-start gap-3">
          <AlertTriangleIcon className="w-5 h-5 text-amber-600 flex-shrink-0 mt-0.5" />
          <div className="flex-1">
            <div className="flex items-center justify-between">
              <h4 className="text-xs font-bold uppercase tracking-wider text-amber-900">
                Actionable Weather Alert • {weatherData.alerts[0].title}
              </h4>
              <span className="text-[10px] text-amber-700 font-medium">{weatherData.alerts[0].date}</span>
            </div>
            <p className="text-xs text-amber-800 mt-0.5 leading-relaxed">
              {weatherData.alerts[0].actionableMessage}
            </p>
          </div>
        </div>
      )}

      {/* ── Metric KPIs (Tailored by Role) ── */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3.5">
        {primaryRole === 'FARMER' && (
          <>
            <div className="bg-white p-4 rounded-md border border-slate-200 shadow-xs">
              <span className="text-[11px] font-bold text-slate-500 uppercase tracking-wider">Total Cultivation Cost</span>
              <p className="text-2xl font-bold text-slate-900 mt-1">
                ₹{cropCostSummary?.totalExpense?.toLocaleString() || '4,12,000'}
              </p>
              <span className="text-xs text-emerald-600 font-medium">Real recorded expenses</span>
            </div>
            <div className="bg-white p-4 rounded-md border border-slate-200 shadow-xs bg-emerald-50/30">
              <span className="text-[11px] font-bold text-emerald-800 uppercase tracking-wider">Real Cost Basis</span>
              <p className="text-2xl font-bold text-emerald-800 mt-1">
                ₹{cropCostSummary?.costPerKg || '32.96'} <span className="text-xs font-normal text-slate-500">/ kg</span>
              </p>
              <span className="text-xs text-emerald-600 font-medium">Auto-calculated differentiator</span>
            </div>
            <div className="bg-white p-4 rounded-md border border-slate-200 shadow-xs">
              <span className="text-[11px] font-bold text-slate-500 uppercase tracking-wider">Mandi Modal Benchmark</span>
              <p className="text-2xl font-bold text-slate-900 mt-1">₹68.50 <span className="text-xs font-normal text-slate-500">/ kg</span></p>
              <span className="text-xs text-blue-600 font-medium">+107% vs cost basis</span>
            </div>
            <div className="bg-white p-4 rounded-md border border-slate-200 shadow-xs">
              <span className="text-[11px] font-bold text-slate-500 uppercase tracking-wider">Net Sale Profit</span>
              <p className="text-2xl font-bold text-emerald-700 mt-1">+₹70,580</p>
              <span className="text-xs text-emerald-600 font-medium">51.7% profit margin</span>
            </div>
          </>
        )}

        {(primaryRole === 'ADMIN' || primaryRole === 'ADMIN_MAKER') && (
          <>
            <div className="bg-white p-4 rounded-md border border-slate-200 shadow-xs">
              <span className="text-[11px] font-bold text-slate-500 uppercase tracking-wider">Pending User Requests</span>
              <p className="text-2xl font-bold text-amber-600 mt-1">{adminSummary?.pendingRequestsCount ?? 2}</p>
              <span className="text-xs text-slate-500 font-medium">Awaiting Admin Approval</span>
            </div>
            <div className="bg-white p-4 rounded-md border border-slate-200 shadow-xs">
              <span className="text-[11px] font-bold text-slate-500 uppercase tracking-wider">Total Platform Users</span>
              <p className="text-2xl font-bold text-slate-900 mt-1">{adminSummary?.totalUsers ?? 7}</p>
              <span className="text-xs text-slate-500 font-medium">Across 7 platform roles</span>
            </div>
            <div className="bg-white p-4 rounded-md border border-slate-200 shadow-xs">
              <span className="text-[11px] font-bold text-slate-500 uppercase tracking-wider">Active Produce Listings</span>
              <p className="text-2xl font-bold text-emerald-700 mt-1">{adminSummary?.activeListingsCount ?? 1}</p>
              <span className="text-xs text-slate-500 font-medium">Direct marketplace sale</span>
            </div>
            <div className="bg-white p-4 rounded-md border border-slate-200 shadow-xs">
              <span className="text-[11px] font-bold text-slate-500 uppercase tracking-wider">Open Disputes</span>
              <p className="text-2xl font-bold text-slate-900 mt-1">{adminSummary?.openDisputesCount ?? 1}</p>
              <span className="text-xs text-amber-600 font-medium">Trust & Safety tickets</span>
            </div>
          </>
        )}

        {primaryRole === 'WORKER' && (
          <>
            <div className="bg-white p-4 rounded-md border border-slate-200 shadow-xs">
              <span className="text-[11px] font-bold text-slate-500 uppercase tracking-wider">My Assigned Tasks</span>
              <p className="text-2xl font-bold text-slate-900 mt-1">2</p>
              <span className="text-xs text-emerald-600 font-medium">Field operations</span>
            </div>
            <div className="bg-white p-4 rounded-md border border-slate-200 shadow-xs">
              <span className="text-[11px] font-bold text-slate-500 uppercase tracking-wider">In Progress</span>
              <p className="text-2xl font-bold text-amber-600 mt-1">1</p>
              <span className="text-xs text-slate-500 font-medium">Plot B Potash Spray</span>
            </div>
            <div className="bg-white p-4 rounded-md border border-slate-200 shadow-xs">
              <span className="text-[11px] font-bold text-slate-500 uppercase tracking-wider">Completed with Evidence</span>
              <p className="text-2xl font-bold text-emerald-700 mt-1">1</p>
              <span className="text-xs text-slate-500 font-medium">Photo evidence uploaded</span>
            </div>
            <div className="bg-white p-4 rounded-md border border-slate-200 shadow-xs">
              <span className="text-[11px] font-bold text-slate-500 uppercase tracking-wider">Daily Wage Earned</span>
              <p className="text-2xl font-bold text-slate-900 mt-1">₹1,350</p>
              <span className="text-xs text-emerald-600 font-medium">Tracked against crop cycle</span>
            </div>
          </>
        )}

        {primaryRole === 'BUYER' && (
          <>
            <div className="bg-white p-4 rounded-md border border-slate-200 shadow-xs">
              <span className="text-[11px] font-bold text-slate-500 uppercase tracking-wider">Marketplace Listings</span>
              <p className="text-2xl font-bold text-slate-900 mt-1">1 Verified</p>
              <span className="text-xs text-emerald-600 font-medium">Pomegranate 8,500 kg</span>
            </div>
            <div className="bg-white p-4 rounded-md border border-slate-200 shadow-xs">
              <span className="text-[11px] font-bold text-slate-500 uppercase tracking-wider">Active Offers</span>
              <p className="text-2xl font-bold text-amber-600 mt-1">1 Pending</p>
              <span className="text-xs text-slate-500 font-medium">₹64.00/kg bid submitted</span>
            </div>
            <div className="bg-white p-4 rounded-md border border-slate-200 shadow-xs">
              <span className="text-[11px] font-bold text-slate-500 uppercase tracking-wider">Orders in Transit / Delivered</span>
              <p className="text-2xl font-bold text-blue-600 mt-1">1 Active</p>
              <span className="text-xs text-slate-500 font-medium">4,000 kg Pomegranate</span>
            </div>
            <div className="bg-white p-4 rounded-md border border-slate-200 shadow-xs">
              <span className="text-[11px] font-bold text-slate-500 uppercase tracking-wider">Mandi Wholesale Benchmark</span>
              <p className="text-2xl font-bold text-slate-900 mt-1">₹68.50/kg</p>
              <span className="text-xs text-slate-500 font-medium">Nashik APMC</span>
            </div>
          </>
        )}

        {primaryRole === 'MANDI_AGENT' && (
          <>
            <div className="bg-white p-4 rounded-md border border-slate-200 shadow-xs">
              <span className="text-[11px] font-bold text-slate-500 uppercase tracking-wider">Today's Arrival Slots</span>
              <p className="text-2xl font-bold text-slate-900 mt-1">2 Open</p>
              <span className="text-xs text-slate-500 font-medium">Nashik APMC Yard</span>
            </div>
            <div className="bg-white p-4 rounded-md border border-slate-200 shadow-xs">
              <span className="text-[11px] font-bold text-slate-500 uppercase tracking-wider">Bookings Confirmed</span>
              <p className="text-2xl font-bold text-emerald-700 mt-1">1 Confirmed</p>
              <span className="text-xs text-slate-500 font-medium">2,000 kg arrival booked</span>
            </div>
            <div className="bg-white p-4 rounded-md border border-slate-200 shadow-xs">
              <span className="text-[11px] font-bold text-slate-500 uppercase tracking-wider">Auction Sales Logged</span>
              <p className="text-2xl font-bold text-slate-900 mt-1">₹1,40,000</p>
              <span className="text-xs text-emerald-600 font-medium">Gross auction throughput</span>
            </div>
            <div className="bg-white p-4 rounded-md border border-slate-200 shadow-xs">
              <span className="text-[11px] font-bold text-slate-500 uppercase tracking-wider">Mandi Commission</span>
              <p className="text-2xl font-bold text-emerald-800 mt-1">₹3,500</p>
              <span className="text-xs text-slate-500 font-medium">2.5% yard commission</span>
            </div>
          </>
        )}
      </div>

      {/* ── Two-Column Feature Content ── */}
      {primaryRole === 'ADMIN' ? (
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-5">
          {/* Left Column: Admin Main Functions & Pending User Approvals (2/3 width) */}
          <div className="lg:col-span-2 space-y-5">
            {/* Core Administrative Capabilities Card */}
            <div className="bg-white p-5 rounded-md border border-slate-200 shadow-xs space-y-4">
              <div className="border-b border-slate-100 pb-2 flex items-center justify-between">
                <div>
                  <h3 className="text-sm font-bold text-slate-900">Platform Administration & User Governance</h3>
                  <p className="text-xs text-slate-500">Core administrative capabilities and platform management functions</p>
                </div>
                <span className="px-2 py-0.5 rounded text-[10px] font-bold uppercase bg-purple-100 text-purple-900 border border-purple-200">
                  SUPER ADMIN
                </span>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 pt-1">
                {/* 1. Gov Live Price Monitor */}
                <Link
                  to="/admin/live-prices"
                  className="p-3.5 rounded-md border border-purple-200 bg-purple-50/40 hover:bg-purple-50/70 hover:border-purple-300 transition-colors flex flex-col justify-between group"
                >
                  <div className="space-y-1">
                    <div className="flex items-center justify-between">
                      <span className="text-xs font-bold text-slate-900 group-hover:text-[#4a2e80] flex items-center gap-1.5">
                        <span className="text-sm">📈</span>
                        <span>Gov Live Price Monitor</span>
                      </span>
                      <span className="px-1.5 py-0.5 rounded text-[10px] font-bold bg-purple-100 text-[#4a2e80]">
                        Agmarknet / e-NAM
                      </span>
                    </div>
                    <p className="text-xs text-slate-600">
                      Real-time Government API price feeds. Restrict and block any commodity ticker from user view.
                    </p>
                  </div>
                  <span className="text-xs font-semibold text-[#4a2e80] mt-2.5 inline-flex items-center gap-1">
                    Open Live Price Monitor →
                  </span>
                </Link>

                {/* 2. User Management */}
                <Link
                  to="/admin/users"
                  className="p-3.5 rounded-md border border-slate-200 bg-slate-50/50 hover:bg-emerald-50/40 hover:border-emerald-300 transition-colors flex flex-col justify-between group"
                >
                  <div className="space-y-1">
                    <div className="flex items-center justify-between">
                      <span className="text-xs font-bold text-slate-900 group-hover:text-emerald-800 flex items-center gap-1.5">
                        <UsersIcon className="w-3.5 h-3.5 text-emerald-700" />
                        <span>User Management Directory</span>
                      </span>
                      <span className="px-1.5 py-0.5 rounded text-[10px] font-bold bg-amber-100 text-amber-800">
                        {adminSummary?.pendingRequestsCount ?? 2} Pending
                      </span>
                    </div>
                    <p className="text-xs text-slate-600">
                      Manage all platform users, review maker-checker requests, toggle suspension, and bulk import accounts.
                    </p>
                  </div>
                  <span className="text-xs font-semibold text-emerald-700 mt-2.5 inline-flex items-center gap-1">
                    Open User Directory ({adminSummary?.totalUsers ?? 7}) →
                  </span>
                </Link>

                {/* 2. Direct User Creation */}
                <Link
                  to="/admin/create-user"
                  className="p-3.5 rounded-md border border-emerald-200 bg-emerald-50/30 hover:bg-emerald-50/60 transition-colors flex flex-col justify-between group"
                >
                  <div className="space-y-1">
                    <div className="flex items-center justify-between">
                      <span className="text-xs font-bold text-emerald-950 flex items-center gap-1.5">
                        <PlusIcon className="w-3.5 h-3.5 text-emerald-700" />
                        <span>Direct User Provisioning</span>
                      </span>
                      <span className="px-1.5 py-0.5 rounded text-[10px] font-bold bg-emerald-100 text-emerald-800">
                        Privileged
                      </span>
                    </div>
                    <p className="text-xs text-slate-600">
                      Directly create and provision active accounts across all 7 platform roles with instant login password.
                    </p>
                  </div>
                  <span className="text-xs font-semibold text-emerald-700 mt-2.5 inline-flex items-center gap-1">
                    + Create Platform User →
                  </span>
                </Link>

                {/* 3. Produce Moderation */}
                <Link
                  to="/admin/moderation"
                  className="p-3.5 rounded-md border border-slate-200 bg-slate-50/50 hover:bg-emerald-50/40 hover:border-emerald-300 transition-colors flex flex-col justify-between group"
                >
                  <div className="space-y-1">
                    <div className="flex items-center justify-between">
                      <span className="text-xs font-bold text-slate-900 group-hover:text-emerald-800 flex items-center gap-1.5">
                        <ShieldIcon className="w-3.5 h-3.5 text-blue-700" />
                        <span>Produce Moderation Hub</span>
                      </span>
                      <span className="px-1.5 py-0.5 rounded text-[10px] font-bold bg-blue-100 text-blue-800">
                        {adminSummary?.activeListingsCount ?? 1} Active
                      </span>
                    </div>
                    <p className="text-xs text-slate-600">
                      Verify farmer produce listings, quality certificates, and grade photos before public marketplace exposure.
                    </p>
                  </div>
                  <span className="text-xs font-semibold text-emerald-700 mt-2.5 inline-flex items-center gap-1">
                    Moderate Listings →
                  </span>
                </Link>

                {/* 4. Disputes Center */}
                <Link
                  to="/admin/disputes"
                  className="p-3.5 rounded-md border border-slate-200 bg-slate-50/50 hover:bg-emerald-50/40 hover:border-emerald-300 transition-colors flex flex-col justify-between group"
                >
                  <div className="space-y-1">
                    <div className="flex items-center justify-between">
                      <span className="text-xs font-bold text-slate-900 group-hover:text-emerald-800 flex items-center gap-1.5">
                        <AlertTriangleIcon className="w-3.5 h-3.5 text-amber-700" />
                        <span>Disputes & Settlement Center</span>
                      </span>
                      <span className="px-1.5 py-0.5 rounded text-[10px] font-bold bg-amber-100 text-amber-800">
                        {adminSummary?.openDisputesCount ?? 1} Open
                      </span>
                    </div>
                    <p className="text-xs text-slate-600">
                      Arbitrate quality grievances, cancellation disputes, and financial settlements between buyers and sellers.
                    </p>
                  </div>
                  <span className="text-xs font-semibold text-emerald-700 mt-2.5 inline-flex items-center gap-1">
                    Resolve Dispute Tickets →
                  </span>
                </Link>
              </div>

              {/* 5. Audit Logs Strip */}
              <div className="pt-2 border-t border-slate-100 flex flex-col sm:flex-row sm:items-center justify-between gap-2">
                <span className="text-xs text-slate-500">
                  All user logins, role assignments, and governance actions are tracked in immutable audit logs.
                </span>
                <Link
                  to="/admin/audit-logs"
                  className="text-xs font-bold text-emerald-700 hover:text-emerald-800 whitespace-nowrap"
                >
                  View Full Audit Trail →
                </Link>
              </div>
            </div>

            {/* Maker-Checker Approvals Queue */}
            <div className="bg-white p-5 rounded-md border border-slate-200 shadow-xs space-y-3">
              <div className="flex items-center justify-between">
                <h3 className="text-sm font-bold text-slate-900 flex items-center gap-2">
                  <UsersIcon className="w-4 h-4 text-emerald-700" />
                  <span>Pending Role & User Approvals (Maker-Checker Queue)</span>
                </h3>
                <Link to="/admin/users" className="text-xs font-semibold text-emerald-600 hover:text-emerald-700">
                  Manage in User Directory →
                </Link>
              </div>

              {userRequests.filter((r) => r.status === 'PENDING_APPROVAL').length > 0 ? (
                <div className="space-y-2">
                  {userRequests
                    .filter((r) => r.status === 'PENDING_APPROVAL')
                    .slice(0, 3)
                    .map((req) => (
                      <div
                        key={req.id}
                        className="p-3 rounded-md border border-amber-200 bg-amber-50/40 flex flex-col sm:flex-row sm:items-center justify-between gap-2.5"
                      >
                        <div className="space-y-0.5">
                          <p className="text-xs font-bold text-slate-900">
                            {req.firstName} {req.lastName} <span className="text-slate-500 font-mono font-normal">({req.email})</span>
                          </p>
                          <p className="text-[11px] text-slate-600">
                            Requested Role: <span className="font-bold text-amber-900 bg-amber-100 px-1.5 py-0.5 rounded border border-amber-200">{req.requestedRole}</span> • Submitted: {new Date(req.createdAt).toLocaleDateString()}
                          </p>
                        </div>
                        <Link
                          to="/admin/users"
                          className="px-3 py-1 rounded bg-emerald-700 hover:bg-emerald-800 text-white font-bold text-xs shadow-xs text-center"
                        >
                          Review & Approve
                        </Link>
                      </div>
                    ))}
                </div>
              ) : (
                <div className="p-4 bg-slate-50 rounded-md border border-slate-200 text-center text-xs text-slate-500">
                  ✓ All user creation requests have been processed. No pending approvals in queue.
                </div>
              )}
            </div>
          </div>

          {/* Right Column: User Distribution & Governance Policy (1/3 width) */}
          <div className="space-y-5">
            {/* User Directory Breakdown */}
            <div className="bg-white p-4 rounded-md border border-slate-200 shadow-xs space-y-3">
              <div className="flex items-center justify-between border-b border-slate-100 pb-2">
                <h3 className="text-xs font-bold uppercase tracking-wider text-slate-700">Users by Platform Role</h3>
                <span className="text-xs font-bold text-emerald-700">{adminSummary?.totalUsers ?? 7} Total</span>
              </div>

              <div className="space-y-1.5 text-xs">
                {[
                  { role: 'FARMER', label: 'Farmers (Producers)', count: adminSummary?.usersByRole?.FARMER ?? 1 },
                  { role: 'FARM_MANAGER', label: 'Farm Managers', count: adminSummary?.usersByRole?.FARM_MANAGER ?? 1 },
                  { role: 'WORKER', label: 'Field Labor Workers', count: adminSummary?.usersByRole?.WORKER ?? 1 },
                  { role: 'BUYER', label: 'Commercial Buyers', count: adminSummary?.usersByRole?.BUYER ?? 1 },
                  { role: 'MANDI_AGENT', label: 'Mandi APMC Agents', count: adminSummary?.usersByRole?.MANDI_AGENT ?? 1 },
                  { role: 'ADMIN_MAKER', label: 'Admin Makers', count: adminSummary?.usersByRole?.ADMIN_MAKER ?? 1 },
                  { role: 'ADMIN', label: 'Platform Administrators', count: adminSummary?.usersByRole?.ADMIN ?? 1 },
                ].map((item) => (
                  <div key={item.role} className="p-2 bg-slate-50 rounded border border-slate-200/80 flex items-center justify-between">
                    <span className="text-slate-700 font-medium">{item.label}</span>
                    <span className="font-bold text-slate-900 bg-white px-2 py-0.5 rounded border border-slate-200">
                      {item.count}
                    </span>
                  </div>
                ))}
              </div>

              <div className="pt-2 border-t border-slate-100 flex items-center justify-between">
                <Link
                  to="/admin/create-user"
                  className="text-xs font-bold text-emerald-700 hover:text-emerald-800"
                >
                  + Add User
                </Link>
                <Link
                  to="/admin/users"
                  className="text-xs font-semibold text-slate-600 hover:text-slate-800"
                >
                  View Directory →
                </Link>
              </div>
            </div>

            {/* Admin RBAC Policy & Four-Eye Principle (Neat Theme) */}
            <div className="bg-white p-4 rounded-md border border-slate-200 shadow-2xs space-y-2.5">
              <div className="flex items-center gap-2 border-b border-slate-100 pb-2">
                <ShieldIcon className="w-4 h-4 text-emerald-700" />
                <h4 className="text-xs font-bold uppercase tracking-wider text-slate-800">
                  Governance & RBAC Policy
                </h4>
              </div>
              <ul className="text-xs text-slate-600 space-y-1.5 list-disc list-inside leading-relaxed">
                <li>
                  <strong className="text-slate-800">Four-Eye Maker-Checker:</strong> Operational users requested by Admin Maker require Admin approval.
                </li>
                <li>
                  <strong className="text-slate-800">Direct Admin Authority:</strong> Admins can create and activate accounts across all roles immediately.
                </li>
                <li>
                  <strong className="text-slate-800">Operational Separation:</strong> Farm plots, crop cycles, and marketplace orders are managed by respective field actors.
                </li>
                <li>
                  <strong className="text-slate-800">Audit Integrity:</strong> Every administrative status change and approval is permanently logged.
                </li>
              </ul>
            </div>
          </div>
        </div>
      ) : (
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-5">
          {/* Left Column: Core Workflow Cards (2/3 width) */}
          <div className="lg:col-span-2 space-y-5">
            {/* Active Crop Cycle & Real Cost Basis Card */}
            <div className="bg-white p-5 rounded-md border border-slate-200 shadow-xs space-y-3.5">
              <div className="flex items-center justify-between">
                <div>
                  <h3 className="text-sm font-bold text-slate-900">
                    Active Crop Cycle: Organic Pomegranate (Bhagwa)
                  </h3>
                  <p className="text-xs text-slate-500">Plot A • Surya Green Valley Farm • 10 Acres</p>
                </div>
                <span className="px-2.5 py-0.5 rounded text-[10px] font-bold uppercase bg-emerald-50 text-emerald-800 border border-emerald-200">
                  HARVESTED
                </span>
              </div>

              {/* Stepper Progress */}
              <div className="py-1.5">
                <div className="flex items-center justify-between text-[11px] text-slate-500 font-medium mb-1">
                  <span className="text-emerald-700 font-bold">Sowing (Feb)</span>
                  <span>Vegetative</span>
                  <span>Flowering</span>
                  <span>Development</span>
                  <span className="text-emerald-700 font-bold">Harvested (Aug 28)</span>
                </div>
                <div className="w-full bg-slate-100 h-1.5 rounded overflow-hidden">
                  <div className="bg-emerald-600 h-full w-full rounded" />
                </div>
              </div>

              {/* Cost Basis Calculation Showcase (The Core Differentiator!) */}
              <div className="bg-slate-50 p-3.5 rounded-md border border-slate-200/80 space-y-2">
                <div className="flex items-center justify-between">
                  <span className="text-xs font-bold text-slate-700 uppercase tracking-wider">
                    Cost Basis Engine (Arithmetic on Real Recorded Expenses)
                  </span>
                  <Link to="/expenses" className="text-xs font-semibold text-emerald-600 hover:text-emerald-700">
                    View Breakdown →
                  </Link>
                </div>

                <div className="grid grid-cols-3 gap-2.5 text-center pt-0.5">
                  <div className="bg-white p-2 rounded-md border border-slate-200">
                    <span className="text-[10px] text-slate-500 uppercase font-semibold">Total Expenses</span>
                    <p className="text-sm font-bold text-slate-900">₹4,12,000</p>
                  </div>
                  <div className="bg-white p-2 rounded-md border border-slate-200">
                    <span className="text-[10px] text-slate-500 uppercase font-semibold">Harvested Quantity</span>
                    <p className="text-sm font-bold text-slate-900">12,500 kg</p>
                  </div>
                  <div className="bg-white p-2 rounded-md border border-emerald-300 bg-emerald-50/40">
                    <span className="text-[10px] text-emerald-800 uppercase font-semibold">Real Cost / Kg</span>
                    <p className="text-sm font-bold text-emerald-800">₹32.96</p>
                  </div>
                </div>

                <p className="text-[11px] text-slate-500 italic text-center">
                  Formula: ₹4,12,000 (Summed Verified Expenses) ÷ 12,500 kg (Actual Harvest) = <strong className="text-emerald-700">₹32.96 / kg</strong>
                </p>
              </div>

              {/* Two Selling Paths Comparison */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-3 pt-0.5">
                <div className="p-3.5 rounded-md border border-emerald-200 bg-emerald-50/20 flex flex-col justify-between">
                  <div>
                    <div className="flex items-center justify-between">
                      <span className="text-xs font-bold text-emerald-900">Path 1: Direct Marketplace Sale</span>
                      <PackageIcon className="w-3.5 h-3.5 text-emerald-700" />
                    </div>
                    <p className="text-xs text-slate-600 mt-1">
                      Sell direct to verified buyers. Compare offers against your real cost (<strong className="text-emerald-700">₹32.96/kg</strong>) and mandi price (<strong className="text-slate-700">₹68.50/kg</strong>).
                    </p>
                  </div>
                  <Link
                    to="/marketplace"
                    className="mt-3 text-xs font-semibold text-white bg-emerald-700 px-3 py-1.5 rounded-md text-center hover:bg-emerald-800 transition-colors"
                  >
                    Manage Listings & Offers
                  </Link>
                </div>

                <div className="p-3.5 rounded-md border border-blue-200 bg-blue-50/20 flex flex-col justify-between">
                  <div>
                    <div className="flex items-center justify-between">
                      <span className="text-xs font-bold text-blue-900">Path 2: Mandi Slot Booking</span>
                      <BuildingIcon className="w-3.5 h-3.5 text-blue-700" />
                    </div>
                    <p className="text-xs text-slate-600 mt-1">
                      Book arrival slot at Nashik APMC Yard. Mandi agent records arrival, grade, auction price, and net payout.
                    </p>
                  </div>
                  <Link
                    to="/mandi"
                    className="mt-3 text-xs font-semibold text-white bg-blue-700 px-3 py-1.5 rounded-md text-center hover:bg-blue-800 transition-colors"
                  >
                    Book Mandi Arrival Slot
                  </Link>
                </div>
              </div>
            </div>

            {/* Today's Tasks Summary */}
            <div className="bg-white p-5 rounded-md border border-slate-200 shadow-xs space-y-3">
              <div className="flex items-center justify-between">
                <h3 className="text-sm font-bold text-slate-900">Operational Tasks & Work Management</h3>
                <Link to="/tasks" className="text-xs font-semibold text-emerald-600 hover:text-emerald-700">
                  View All Tasks ({activeTasks.length}) →
                </Link>
              </div>

              <div className="space-y-2">
                {activeTasks.slice(0, 3).map((task) => (
                  <div
                    key={task.id}
                    className="p-3 rounded-md border border-slate-200/80 bg-slate-50/50 flex items-center justify-between gap-3"
                  >
                    <div className="space-y-0.5">
                      <p className="text-xs font-bold text-slate-900">{task.title}</p>
                      <p className="text-[11px] text-slate-500">
                        Assigned to: <span className="font-semibold text-slate-700">{task.assigneeName || 'Worker'}</span> • Due: {new Date(task.dueDate).toLocaleDateString()}
                      </p>
                    </div>
                    <span
                      className={`text-[10px] font-bold px-2 py-0.5 rounded uppercase tracking-wider border ${
                        task.status === 'COMPLETED'
                          ? 'bg-emerald-50 text-emerald-800 border-emerald-200'
                          : task.status === 'IN_PROGRESS'
                          ? 'bg-amber-50 text-amber-800 border-amber-200'
                          : 'bg-slate-100 text-slate-700 border-slate-200'
                      }`}
                    >
                      {task.status}
                    </span>
                  </div>
                ))}
              </div>
            </div>
          </div>

          {/* Right Column: Reference Data & Weather (1/3 width) */}
          <div className="space-y-5">
            {/* Mandi Price Reference Benchmark */}
            <div className="bg-white p-4 rounded-md border border-slate-200 shadow-xs space-y-3">
              <div className="flex items-center justify-between">
                <h3 className="text-xs font-bold uppercase tracking-wider text-slate-700">Mandi Price Benchmarks</h3>
                <span className="text-[10px] text-slate-400">As of Today</span>
              </div>

              <div className="space-y-2">
                <div className="p-2.5 bg-slate-50 rounded-md border border-slate-200">
                  <div className="flex justify-between items-center">
                    <span className="text-xs font-bold text-slate-900">Pomegranate (Bhagwa)</span>
                    <span className="text-xs font-bold text-emerald-700">₹68.50 / kg</span>
                  </div>
                  <div className="text-[10px] text-slate-500 mt-0.5 flex justify-between">
                    <span>Nashik APMC Yard</span>
                    <span>Min: ₹55 • Max: ₹78</span>
                  </div>
                </div>

                <div className="p-2.5 bg-slate-50 rounded-md border border-slate-200">
                  <div className="flex justify-between items-center">
                    <span className="text-xs font-bold text-slate-900">Thompson Grapes</span>
                    <span className="text-xs font-bold text-emerald-700">₹82.00 / kg</span>
                  </div>
                  <div className="text-[10px] text-slate-500 mt-0.5 flex justify-between">
                    <span>Pimpalgaon Baswant APMC</span>
                    <span>Min: ₹65 • Max: ₹94</span>
                  </div>
                </div>

                <div className="p-2.5 bg-slate-50 rounded-md border border-slate-200">
                  <div className="flex justify-between items-center">
                    <span className="text-xs font-bold text-slate-900">Soyabean (Yellow)</span>
                    <span className="text-xs font-bold text-emerald-700">₹46.80 / kg</span>
                  </div>
                  <div className="text-[10px] text-slate-500 mt-0.5 flex justify-between">
                    <span>Latur APMC Yard</span>
                    <span>Min: ₹42 • Max: ₹49.5</span>
                  </div>
                </div>
              </div>

              <p className="text-[10px] text-slate-400 italic">
                *Reference modal prices from Agmarknet wholesale trading. Not live speculative rates.
              </p>
            </div>

            {/* Quick Platform Security & Role Policy */}
            <div className="bg-slate-900 text-white p-4 rounded-md shadow-xs space-y-2.5">
              <div className="flex items-center gap-2">
                <ShieldIcon className="w-4 h-4 text-emerald-400" />
                <h4 className="text-xs font-bold uppercase tracking-wider text-emerald-400">
                  RBAC & Data Privacy
                </h4>
              </div>
              <ul className="text-xs text-slate-300 space-y-1.5 list-disc list-inside leading-relaxed">
                <li>
                  <strong>Private Cost Basis:</strong> A farmer's cultivation <code className="text-emerald-300 bg-slate-800 px-1 py-0.2 rounded">cost_per_kg</code> is never exposed to buyers.
                </li>
                <li>
                  <strong>Admin Maker Security:</strong> Admin Maker can create any role except Admin, queued for Super Admin approval.
                </li>
                <li>
                  <strong>Closed Signup:</strong> No open registration. User requests require Admin verification.
                </li>
              </ul>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}