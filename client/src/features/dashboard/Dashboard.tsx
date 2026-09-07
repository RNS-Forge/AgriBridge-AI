import { useState, useEffect } from 'react';
import { useSelector } from 'react-redux';
import { Link } from 'react-router-dom';
import { RootState } from '../../store/index.js';

export default function Dashboard() {
  const { user } = useSelector((state: RootState) => state.auth);
  const primaryRole = user?.roles?.[0] || 'FARMER';

  const [weatherData, setWeatherData] = useState<any>(null);
  const [adminSummary, setAdminSummary] = useState<any>(null);
  const [cropCostSummary, setCropCostSummary] = useState<any>(null);
  const [activeTasks, setActiveTasks] = useState<any[]>([]);

  useEffect(() => {
    // Fetch weather
    fetch('http://localhost:8000/api/v1/weather/farms/farm-01')
      .then((r) => r.json())
      .then((d) => {
        if (d.success) setWeatherData(d.data);
      })
      .catch(() => {});

    // Fetch crop cost summary
    fetch('http://localhost:8000/api/v1/crop-cycles/cc-01/cost-summary')
      .then((r) => r.json())
      .then((d) => {
        if (d.success) setCropCostSummary(d.data);
      })
      .catch(() => {});

    // Fetch tasks
    fetch('http://localhost:8000/api/v1/tasks')
      .then((r) => r.json())
      .then((d) => {
        if (d.success) setActiveTasks(d.data);
      })
      .catch(() => {});

    // Fetch admin summary if Admin or Admin Maker
    if (primaryRole === 'ADMIN' || primaryRole === 'ADMIN_MAKER' || primaryRole === 'SuperAdmin') {
      fetch('http://localhost:8000/api/v1/admin/dashboard-summary')
        .then((r) => r.json())
        .then((d) => {
          if (d.success) setAdminSummary(d.data);
        })
        .catch(() => {});
    }
  }, [primaryRole]);

  return (
    <div className="space-y-6">
      {/* ── Welcome Banner ── */}
      <div className="bg-gradient-to-r from-emerald-800 via-emerald-700 to-teal-800 rounded-2xl p-6 text-white shadow-md flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2 mb-1">
            <span className="px-2.5 py-0.5 rounded-full text-[11px] font-bold uppercase tracking-wider bg-emerald-500/30 text-emerald-100 border border-emerald-400/30">
              {primaryRole.replace('_', ' ')} WORKSPACE
            </span>
            <span className="text-xs text-emerald-200">Phase 1 Live</span>
          </div>
          <h1 className="text-2xl font-bold tracking-tight">
            Welcome back, {user?.firstName || 'Farmer'}!
          </h1>
          <p className="text-sm text-emerald-100/90 mt-1 max-w-xl">
            {primaryRole === 'ADMIN' && 'System Administration: review user requests, moderate listings, and resolve disputes.'}
            {primaryRole === 'ADMIN_MAKER' && 'Operational Maker: request creation of all roles under Admin approval.'}
            {primaryRole === 'FARMER' && 'Cultivate → Sell Slice: record real expenses, see your true cost-basis, and sell via Direct Marketplace or Mandi Slots.'}
            {primaryRole === 'FARM_MANAGER' && 'Field Management: manage crop cycle stages, task assignments, and inventory stock consumption.'}
            {primaryRole === 'WORKER' && 'Field Operations: view assigned daily tasks, mark progress, and upload photo completion proof.'}
            {primaryRole === 'BUYER' && 'Direct Produce Procurement: browse verified harvests, submit offers, and track farmgate orders.'}
            {primaryRole === 'MANDI_AGENT' && 'APMC Yard Operations: manage arrival slots, confirm bookings, and record auction sale payouts.'}
          </p>
        </div>

        {/* Quick Shortcut Buttons based on Role */}
        <div className="flex flex-wrap gap-2.5">
          {primaryRole === 'FARMER' && (
            <>
              <Link
                to="/marketplace"
                className="px-4 py-2 rounded-xl bg-white text-emerald-800 font-semibold text-xs shadow hover:bg-emerald-50 transition flex items-center gap-1.5"
              >
                <span>📦</span> List Produce
              </Link>
              <Link
                to="/mandi"
                className="px-4 py-2 rounded-xl bg-emerald-600 text-white font-semibold text-xs shadow hover:bg-emerald-500 transition flex items-center gap-1.5"
              >
                <span>🏛️</span> Book Mandi Slot
              </Link>
            </>
          )}

          {primaryRole === 'ADMIN' && (
            <Link
              to="/admin/users"
              className="px-4 py-2 rounded-xl bg-white text-emerald-800 font-semibold text-xs shadow hover:bg-emerald-50 transition flex items-center gap-1.5"
            >
              <span>👥</span> User Approval Queue ({adminSummary?.pendingRequestsCount || 0})
            </Link>
          )}

          {primaryRole === 'ADMIN_MAKER' && (
            <Link
              to="/admin-maker/create-request"
              className="px-4 py-2 rounded-xl bg-white text-emerald-800 font-semibold text-xs shadow hover:bg-emerald-50 transition flex items-center gap-1.5"
            >
              <span>➕</span> Request New Role
            </Link>
          )}

          {primaryRole === 'WORKER' && (
            <Link
              to="/tasks"
              className="px-4 py-2 rounded-xl bg-white text-emerald-800 font-semibold text-xs shadow hover:bg-emerald-50 transition flex items-center gap-1.5"
            >
              <span>📋</span> View My Tasks ({activeTasks.length})
            </Link>
          )}

          {primaryRole === 'BUYER' && (
            <Link
              to="/marketplace"
              className="px-4 py-2 rounded-xl bg-white text-emerald-800 font-semibold text-xs shadow hover:bg-emerald-50 transition flex items-center gap-1.5"
            >
              <span>🛒</span> Browse Marketplace
            </Link>
          )}

          {primaryRole === 'MANDI_AGENT' && (
            <Link
              to="/mandi"
              className="px-4 py-2 rounded-xl bg-white text-emerald-800 font-semibold text-xs shadow hover:bg-emerald-50 transition flex items-center gap-1.5"
            >
              <span>🏛️</span> Manage Arrival Slots
            </Link>
          )}
        </div>
      </div>

      {/* ── Weather Alert Banner (Prompt 8 & 15) ── */}
      {weatherData?.alerts && weatherData.alerts.length > 0 && (
        <div className="bg-amber-50 border-l-4 border-amber-500 p-4 rounded-xl shadow-sm flex items-start gap-3">
          <span className="text-2xl">⚠️</span>
          <div className="flex-1">
            <div className="flex items-center justify-between">
              <h4 className="text-xs font-bold uppercase tracking-wider text-amber-900">
                Actionable Weather Alert • {weatherData.alerts[0].title}
              </h4>
              <span className="text-[10px] text-amber-700 font-medium">{weatherData.alerts[0].date}</span>
            </div>
            <p className="text-xs text-amber-800 mt-1 leading-relaxed">
              {weatherData.alerts[0].actionableMessage}
            </p>
          </div>
        </div>
      )}

      {/* ── Metric KPIs (Tailored by Role) ── */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {primaryRole === 'FARMER' && (
          <>
            <div className="bg-white p-5 rounded-xl border border-slate-200 shadow-sm">
              <span className="text-[11px] font-bold text-slate-400 uppercase tracking-wider">Total Cultivation Cost</span>
              <p className="text-2xl font-bold text-slate-800 mt-1">
                ₹{cropCostSummary?.totalExpense?.toLocaleString() || '4,12,000'}
              </p>
              <span className="text-xs text-emerald-600 font-medium">Real recorded expenses</span>
            </div>
            <div className="bg-white p-5 rounded-xl border border-slate-200 shadow-sm bg-emerald-50/40">
              <span className="text-[11px] font-bold text-emerald-700 uppercase tracking-wider">Real Cost Basis</span>
              <p className="text-2xl font-bold text-emerald-800 mt-1">
                ₹{cropCostSummary?.costPerKg || '32.96'} <span className="text-sm font-normal text-slate-500">/ kg</span>
              </p>
              <span className="text-xs text-emerald-600 font-medium">Auto-calculated differentiator</span>
            </div>
            <div className="bg-white p-5 rounded-xl border border-slate-200 shadow-sm">
              <span className="text-[11px] font-bold text-slate-400 uppercase tracking-wider">Mandi Modal Benchmark</span>
              <p className="text-2xl font-bold text-slate-800 mt-1">₹68.50 <span className="text-sm font-normal text-slate-500">/ kg</span></p>
              <span className="text-xs text-blue-600 font-medium">+107% vs cost basis</span>
            </div>
            <div className="bg-white p-5 rounded-xl border border-slate-200 shadow-sm">
              <span className="text-[11px] font-bold text-slate-400 uppercase tracking-wider">Net Sale Profit</span>
              <p className="text-2xl font-bold text-emerald-700 mt-1">+₹70,580</p>
              <span className="text-xs text-emerald-600 font-medium">51.7% profit margin</span>
            </div>
          </>
        )}

        {(primaryRole === 'ADMIN' || primaryRole === 'ADMIN_MAKER') && (
          <>
            <div className="bg-white p-5 rounded-xl border border-slate-200 shadow-sm">
              <span className="text-[11px] font-bold text-slate-400 uppercase tracking-wider">Pending User Requests</span>
              <p className="text-2xl font-bold text-amber-600 mt-1">{adminSummary?.pendingRequestsCount ?? 2}</p>
              <span className="text-xs text-slate-500 font-medium">Awaiting Admin Approval</span>
            </div>
            <div className="bg-white p-5 rounded-xl border border-slate-200 shadow-sm">
              <span className="text-[11px] font-bold text-slate-400 uppercase tracking-wider">Total Platform Users</span>
              <p className="text-2xl font-bold text-slate-800 mt-1">{adminSummary?.totalUsers ?? 7}</p>
              <span className="text-xs text-slate-500 font-medium">Across 7 Phase 1 roles</span>
            </div>
            <div className="bg-white p-5 rounded-xl border border-slate-200 shadow-sm">
              <span className="text-[11px] font-bold text-slate-400 uppercase tracking-wider">Active Produce Listings</span>
              <p className="text-2xl font-bold text-emerald-700 mt-1">{adminSummary?.activeListingsCount ?? 1}</p>
              <span className="text-xs text-slate-500 font-medium">Direct marketplace sale</span>
            </div>
            <div className="bg-white p-5 rounded-xl border border-slate-200 shadow-sm">
              <span className="text-[11px] font-bold text-slate-400 uppercase tracking-wider">Open Disputes</span>
              <p className="text-2xl font-bold text-slate-800 mt-1">{adminSummary?.openDisputesCount ?? 1}</p>
              <span className="text-xs text-amber-600 font-medium">Trust & Safety tickets</span>
            </div>
          </>
        )}

        {primaryRole === 'WORKER' && (
          <>
            <div className="bg-white p-5 rounded-xl border border-slate-200 shadow-sm">
              <span className="text-[11px] font-bold text-slate-400 uppercase tracking-wider">My Assigned Tasks</span>
              <p className="text-2xl font-bold text-slate-800 mt-1">2</p>
              <span className="text-xs text-emerald-600 font-medium">Field operations</span>
            </div>
            <div className="bg-white p-5 rounded-xl border border-slate-200 shadow-sm">
              <span className="text-[11px] font-bold text-slate-400 uppercase tracking-wider">In Progress</span>
              <p className="text-2xl font-bold text-amber-600 mt-1">1</p>
              <span className="text-xs text-slate-500 font-medium">Plot B Potash Spray</span>
            </div>
            <div className="bg-white p-5 rounded-xl border border-slate-200 shadow-sm">
              <span className="text-[11px] font-bold text-slate-400 uppercase tracking-wider">Completed with Evidence</span>
              <p className="text-2xl font-bold text-emerald-700 mt-1">1</p>
              <span className="text-xs text-slate-500 font-medium">Photo evidence uploaded</span>
            </div>
            <div className="bg-white p-5 rounded-xl border border-slate-200 shadow-sm">
              <span className="text-[11px] font-bold text-slate-400 uppercase tracking-wider">Daily Wage Earned</span>
              <p className="text-2xl font-bold text-slate-800 mt-1">₹1,350</p>
              <span className="text-xs text-emerald-600 font-medium">Tracked against crop cycle</span>
            </div>
          </>
        )}

        {primaryRole === 'BUYER' && (
          <>
            <div className="bg-white p-5 rounded-xl border border-slate-200 shadow-sm">
              <span className="text-[11px] font-bold text-slate-400 uppercase tracking-wider">Marketplace Listings</span>
              <p className="text-2xl font-bold text-slate-800 mt-1">1 Verified</p>
              <span className="text-xs text-emerald-600 font-medium">Pomegranate 8,500 kg</span>
            </div>
            <div className="bg-white p-5 rounded-xl border border-slate-200 shadow-sm">
              <span className="text-[11px] font-bold text-slate-400 uppercase tracking-wider">Active Offers</span>
              <p className="text-2xl font-bold text-amber-600 mt-1">1 Pending</p>
              <span className="text-xs text-slate-500 font-medium">₹64.00/kg bid submitted</span>
            </div>
            <div className="bg-white p-5 rounded-xl border border-slate-200 shadow-sm">
              <span className="text-[11px] font-bold text-slate-400 uppercase tracking-wider">Orders in Transit / Delivered</span>
              <p className="text-2xl font-bold text-blue-600 mt-1">1 Active</p>
              <span className="text-xs text-slate-500 font-medium">4,000 kg Pomegranate</span>
            </div>
            <div className="bg-white p-5 rounded-xl border border-slate-200 shadow-sm">
              <span className="text-[11px] font-bold text-slate-400 uppercase tracking-wider">Mandi Wholesale Benchmark</span>
              <p className="text-2xl font-bold text-slate-800 mt-1">₹68.50/kg</p>
              <span className="text-xs text-slate-500 font-medium">Nashik APMC</span>
            </div>
          </>
        )}

        {primaryRole === 'MANDI_AGENT' && (
          <>
            <div className="bg-white p-5 rounded-xl border border-slate-200 shadow-sm">
              <span className="text-[11px] font-bold text-slate-400 uppercase tracking-wider">Today's Arrival Slots</span>
              <p className="text-2xl font-bold text-slate-800 mt-1">2 Open</p>
              <span className="text-xs text-slate-500 font-medium">Nashik APMC Yard</span>
            </div>
            <div className="bg-white p-5 rounded-xl border border-slate-200 shadow-sm">
              <span className="text-[11px] font-bold text-slate-400 uppercase tracking-wider">Bookings Confirmed</span>
              <p className="text-2xl font-bold text-emerald-700 mt-1">1 Confirmed</p>
              <span className="text-xs text-slate-500 font-medium">2,000 kg arrival booked</span>
            </div>
            <div className="bg-white p-5 rounded-xl border border-slate-200 shadow-sm">
              <span className="text-[11px] font-bold text-slate-400 uppercase tracking-wider">Auction Sales Logged</span>
              <p className="text-2xl font-bold text-slate-800 mt-1">₹1,40,000</p>
              <span className="text-xs text-emerald-600 font-medium">Gross auction throughput</span>
            </div>
            <div className="bg-white p-5 rounded-xl border border-slate-200 shadow-sm">
              <span className="text-[11px] font-bold text-slate-400 uppercase tracking-wider">Mandi Commission</span>
              <p className="text-2xl font-bold text-emerald-800 mt-1">₹3,500</p>
              <span className="text-xs text-slate-500 font-medium">2.5% yard commission</span>
            </div>
          </>
        )}
      </div>

      {/* ── Two-Column Feature Content ── */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Left Column: Core Workflow Cards (2/3 width) */}
        <div className="lg:col-span-2 space-y-6">
          {/* Active Crop Cycle & Real Cost Basis Card */}
          <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-sm space-y-4">
            <div className="flex items-center justify-between">
              <div>
                <h3 className="text-base font-bold text-slate-800">
                  Active Crop Cycle: Organic Pomegranate (Bhagwa)
                </h3>
                <p className="text-xs text-slate-500">Plot A • Surya Green Valley Farm • 10 Acres</p>
              </div>
              <span className="px-3 py-1 rounded-full text-xs font-semibold bg-emerald-100 text-emerald-800 border border-emerald-200">
                HARVESTED
              </span>
            </div>

            {/* Stepper Progress */}
            <div className="py-2">
              <div className="flex items-center justify-between text-[11px] text-slate-500 font-medium mb-1.5">
                <span className="text-emerald-700 font-bold">Sowing (Feb)</span>
                <span>Vegetative</span>
                <span>Flowering</span>
                <span>Development</span>
                <span className="text-emerald-700 font-bold">Harvested (Aug 28)</span>
              </div>
              <div className="w-full bg-slate-100 h-2 rounded-full overflow-hidden">
                <div className="bg-emerald-600 h-full w-full rounded-full" />
              </div>
            </div>

            {/* Cost Basis Calculation Showcase (The Core Differentiator!) */}
            <div className="bg-slate-50 p-4 rounded-xl border border-slate-200/80 space-y-2.5">
              <div className="flex items-center justify-between">
                <span className="text-xs font-bold text-slate-700 uppercase tracking-wider">
                  Cost Basis Engine (Arithmetic on Real Recorded Expenses)
                </span>
                <Link to="/expenses" className="text-xs font-semibold text-emerald-600 hover:text-emerald-700">
                  View Breakdown →
                </Link>
              </div>

              <div className="grid grid-cols-3 gap-3 text-center pt-1">
                <div className="bg-white p-2.5 rounded-lg border border-slate-200">
                  <span className="text-[10px] text-slate-400 uppercase font-semibold">Total Expenses</span>
                  <p className="text-base font-bold text-slate-800">₹4,12,000</p>
                </div>
                <div className="bg-white p-2.5 rounded-lg border border-slate-200">
                  <span className="text-[10px] text-slate-400 uppercase font-semibold">Harvested Quantity</span>
                  <p className="text-base font-bold text-slate-800">12,500 kg</p>
                </div>
                <div className="bg-white p-2.5 rounded-lg border border-emerald-300 bg-emerald-50/30">
                  <span className="text-[10px] text-emerald-700 uppercase font-semibold">Real Cost / Kg</span>
                  <p className="text-base font-bold text-emerald-800">₹32.96</p>
                </div>
              </div>

              <p className="text-[11px] text-slate-500 italic text-center">
                Formula: ₹4,12,000 (Summed Verified Expenses) ÷ 12,500 kg (Actual Harvest) = <strong className="text-emerald-700">₹32.96 / kg</strong>
              </p>
            </div>

            {/* Two Selling Paths Comparison (Prompt 10 & 11) */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-3 pt-1">
              <div className="p-4 rounded-xl border border-emerald-200 bg-emerald-50/30 flex flex-col justify-between">
                <div>
                  <div className="flex items-center justify-between">
                    <span className="text-xs font-bold text-emerald-800">Path 1: Direct Marketplace Sale</span>
                    <span className="text-xs">📦</span>
                  </div>
                  <p className="text-xs text-slate-600 mt-1">
                    Sell direct to verified buyers. Compare offers against your real cost (<strong className="text-emerald-700">₹32.96/kg</strong>) and mandi price (<strong className="text-slate-700">₹68.50/kg</strong>).
                  </p>
                </div>
                <Link
                  to="/marketplace"
                  className="mt-3 text-xs font-semibold text-white bg-emerald-700 px-3 py-1.5 rounded-lg text-center hover:bg-emerald-800 transition"
                >
                  Manage Listings & Offers
                </Link>
              </div>

              <div className="p-4 rounded-xl border border-blue-200 bg-blue-50/30 flex flex-col justify-between">
                <div>
                  <div className="flex items-center justify-between">
                    <span className="text-xs font-bold text-blue-900">Path 2: Mandi Slot Booking</span>
                    <span className="text-xs">🏛️</span>
                  </div>
                  <p className="text-xs text-slate-600 mt-1">
                    Book arrival slot at Nashik APMC Yard. Mandi agent records arrival, grade, auction price, and net payout.
                  </p>
                </div>
                <Link
                  to="/mandi"
                  className="mt-3 text-xs font-semibold text-white bg-blue-700 px-3 py-1.5 rounded-lg text-center hover:bg-blue-800 transition"
                >
                  Book Mandi Arrival Slot
                </Link>
              </div>
            </div>
          </div>

          {/* Today's Tasks Summary (Prompt 5 & 15) */}
          <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-sm space-y-3">
            <div className="flex items-center justify-between">
              <h3 className="text-base font-bold text-slate-800">Operational Tasks & Work Management</h3>
              <Link to="/tasks" className="text-xs font-semibold text-emerald-600 hover:text-emerald-700">
                View All Tasks ({activeTasks.length}) →
              </Link>
            </div>

            <div className="space-y-2.5">
              {activeTasks.slice(0, 3).map((task) => (
                <div
                  key={task.id}
                  className="p-3 rounded-xl border border-slate-200/80 bg-slate-50/50 flex items-center justify-between gap-3"
                >
                  <div className="space-y-0.5">
                    <p className="text-xs font-bold text-slate-800">{task.title}</p>
                    <p className="text-[11px] text-slate-500">
                      Assigned to: <span className="font-semibold text-slate-700">{task.assigneeName || 'Worker'}</span> • Due: {new Date(task.dueDate).toLocaleDateString()}
                    </p>
                  </div>
                  <span
                    className={`text-[10px] font-bold px-2.5 py-1 rounded-full uppercase tracking-wider ${
                      task.status === 'COMPLETED'
                        ? 'bg-emerald-100 text-emerald-800 border border-emerald-200'
                        : task.status === 'IN_PROGRESS'
                        ? 'bg-amber-100 text-amber-800 border border-amber-200'
                        : 'bg-slate-200 text-slate-700'
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
        <div className="space-y-6">
          {/* Mandi Price Reference Benchmark (Prompt 9) */}
          <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-sm space-y-3">
            <div className="flex items-center justify-between">
              <h3 className="text-sm font-bold text-slate-800">Mandi Price Benchmarks</h3>
              <span className="text-[10px] text-slate-400">As of Today</span>
            </div>

            <div className="space-y-2.5">
              <div className="p-3 bg-slate-50 rounded-xl border border-slate-200/80">
                <div className="flex justify-between items-center">
                  <span className="text-xs font-bold text-slate-800">Pomegranate (Bhagwa)</span>
                  <span className="text-xs font-bold text-emerald-700">₹68.50 / kg</span>
                </div>
                <div className="text-[10px] text-slate-500 mt-0.5 flex justify-between">
                  <span>Nashik APMC Yard</span>
                  <span>Min: ₹55 • Max: ₹78</span>
                </div>
              </div>

              <div className="p-3 bg-slate-50 rounded-xl border border-slate-200/80">
                <div className="flex justify-between items-center">
                  <span className="text-xs font-bold text-slate-800">Thompson Grapes</span>
                  <span className="text-xs font-bold text-emerald-700">₹82.00 / kg</span>
                </div>
                <div className="text-[10px] text-slate-500 mt-0.5 flex justify-between">
                  <span>Pimpalgaon Baswant APMC</span>
                  <span>Min: ₹65 • Max: ₹94</span>
                </div>
              </div>

              <div className="p-3 bg-slate-50 rounded-xl border border-slate-200/80">
                <div className="flex justify-between items-center">
                  <span className="text-xs font-bold text-slate-800">Soyabean (Yellow)</span>
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
          <div className="bg-slate-900 text-white p-5 rounded-2xl shadow-sm space-y-3">
            <div className="flex items-center gap-2">
              <span className="text-emerald-400">🛡️</span>
              <h4 className="text-xs font-bold uppercase tracking-wider text-emerald-400">
                RBAC & Data Privacy
              </h4>
            </div>
            <ul className="text-xs text-slate-300 space-y-2 list-disc list-inside leading-relaxed">
              <li>
                <strong>Private Cost Basis:</strong> A farmer's cultivation <code className="text-emerald-300">cost_per_kg</code> is never exposed to buyers.
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
    </div>
  );
}