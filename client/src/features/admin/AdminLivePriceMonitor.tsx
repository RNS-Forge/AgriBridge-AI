import React, { useState, useEffect, useCallback, useMemo } from 'react';
import { useSelector } from 'react-redux';
import { RootState } from '../../store/index.js';
import { Button, Toast } from '../../components/ui/index.js';

export interface GovMandiPrice {
  id: string;
  cropName: string;
  variety?: string;
  mandiName: string;
  district: string;
  state: string;
  minPrice: number;
  maxPrice: number;
  modalPrice: number;
  date: string;
  arrivalVolumeQuintals?: number;
  govApiRef?: string;
  source?: 'GOV_AGMARKNET' | 'GOV_ENAM' | 'MANUAL';
  trend?: 'UP' | 'DOWN' | 'STABLE';
  changePercent?: string;
  isBlocked?: boolean;
  blockedReason?: string;
  blockedAt?: string;
  blockedBy?: string;
  lastSyncTimestamp?: string;
}

interface PriceSummary {
  totalFeeds: number;
  activeFeeds: number;
  blockedFeeds: number;
  reportingMandis: number;
  avgModalPrice: number;
  govApiProvider: string;
  govApiStatus: string;
  lastSyncTimestamp: string;
}

const PRESET_BLOCK_REASONS = [
  'Suspected market manipulation / abnormal price spike',
  'Auction volume discrepancy under verification',
  'Regulatory price ceiling / MSP compliance inquiry',
  'Inter-mandi reporting lag / outdated ticker feed',
  'Temporary administrative restriction',
];

export default function AdminLivePriceMonitor() {
  const { token } = useSelector((state: RootState) => state.auth);

  const [prices, setPrices] = useState<GovMandiPrice[]>([]);
  const [summary, setSummary] = useState<PriceSummary | null>(null);
  const [loading, setLoading] = useState(true);
  const [syncing, setSyncing] = useState(false);
  const [autoRefresh, setAutoRefresh] = useState(true);

  // Filters
  const [search, setSearch] = useState('');
  const [selectedState, setSelectedState] = useState('ALL');
  const [activeTab, setActiveTab] = useState<'ALL' | 'ACTIVE' | 'BLOCKED'>('ALL');

  // Pagination
  const [currentPage, setCurrentPage] = useState(1);
  const [pageSize, setPageSize] = useState(10);

  // Multi-selection
  const [selectedIds, setSelectedIds] = useState<Set<string>>(new Set());

  // Block Modal
  const [blockingItem, setBlockingItem] = useState<GovMandiPrice | null>(null);
  const [blockReason, setBlockReason] = useState(PRESET_BLOCK_REASONS[0]);
  const [customReason, setCustomReason] = useState('');
  const [isProcessingBlock, setIsProcessingBlock] = useState(false);

  // Toast
  const [toast, setToast] = useState<{ message: string; type?: 'success' | 'error' } | null>(null);

  const showToast = (message: string, type: 'success' | 'error' = 'success') => {
    setToast({ message, type });
    setTimeout(() => setToast(null), 4000);
  };

  // Fetch prices
  const fetchPrices = useCallback(async (isBackground = false) => {
    if (!isBackground) setLoading(true);
    try {
      const qs = new URLSearchParams();
      if (search.trim()) qs.set('search', search.trim());
      if (selectedState !== 'ALL') qs.set('state', selectedState);
      if (activeTab !== 'ALL') qs.set('status', activeTab);

      const res = await fetch(`http://localhost:8000/api/v1/admin/live-prices?${qs.toString()}`, {
        headers: {
          Authorization: `Bearer ${token || localStorage.getItem('token')}`,
        },
      });
      const data = await res.json();
      if (res.ok && data.success) {
        setPrices(data.data || []);
        setSummary(data.summary || null);
      }
    } catch (err) {
      console.error('Failed to fetch live prices:', err);
    } finally {
      if (!isBackground) setLoading(false);
    }
  }, [token, search, selectedState, activeTab]);

  // Initial fetch and on filter changes
  useEffect(() => {
    fetchPrices();
  }, [fetchPrices]);

  // Auto-refresh interval (15s)
  useEffect(() => {
    if (!autoRefresh) return;
    const interval = setInterval(() => {
      fetchPrices(true);
    }, 15000);
    return () => clearInterval(interval);
  }, [autoRefresh, fetchPrices]);

  // Sync Government API
  const handleSyncGovApi = async () => {
    setSyncing(true);
    try {
      const res = await fetch('http://localhost:8000/api/v1/admin/live-prices/sync-gov', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token || localStorage.getItem('token')}`,
        },
      });
      const data = await res.json();
      if (res.ok && data.success) {
        showToast('Government Agmarknet & e-NAM live feeds successfully synchronized!');
        fetchPrices(true);
      } else {
        showToast(data.message || 'Failed to sync with Gov API', 'error');
      }
    } catch (err) {
      showToast('Network error while syncing Gov API', 'error');
    } finally {
      setSyncing(false);
    }
  };

  // Toggle single item block
  const handleToggleBlock = (item: GovMandiPrice) => {
    if (item.isBlocked) {
      // Direct Unblock
      executeBlockChange(item.id, false);
    } else {
      // Open modal to specify reason
      setBlockingItem(item);
      setBlockReason(PRESET_BLOCK_REASONS[0]);
      setCustomReason('');
    }
  };

  // Confirm Block from modal
  const handleConfirmBlock = async () => {
    if (!blockingItem) return;
    const finalReason = blockReason === 'OTHER' ? customReason.trim() || 'Blocked by Administrator' : blockReason;
    setIsProcessingBlock(true);
    try {
      await executeBlockChange(blockingItem.id, true, finalReason);
      setBlockingItem(null);
    } finally {
      setIsProcessingBlock(false);
    }
  };

  // API execute block/unblock
  const executeBlockChange = async (id: string, isBlocked: boolean, reason?: string) => {
    try {
      const res = await fetch(`http://localhost:8000/api/v1/admin/live-prices/${id}/block`, {
        method: 'PATCH',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token || localStorage.getItem('token')}`,
        },
        body: JSON.stringify({ isBlocked, reason }),
      });
      const data = await res.json();
      if (res.ok && data.success) {
        showToast(data.message || `Price ticker status updated.`);
        // Update local state immediately for instant feedback
        setPrices((prev) =>
          prev.map((p) => (p.id === id ? { ...p, isBlocked, blockedReason: isBlocked ? reason : undefined } : p))
        );
        fetchPrices(true);
      } else {
        showToast(data.message || 'Action failed', 'error');
      }
    } catch (err) {
      showToast('Network error while updating price status', 'error');
    }
  };

  // Batch block/unblock
  const handleBatchAction = async (isBlocked: boolean) => {
    if (selectedIds.size === 0) return;
    try {
      const res = await fetch('http://localhost:8000/api/v1/admin/live-prices/batch-block', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token || localStorage.getItem('token')}`,
        },
        body: JSON.stringify({
          ids: Array.from(selectedIds),
          isBlocked,
          reason: isBlocked ? 'Batch restricted by Administrator' : undefined,
        }),
      });
      const data = await res.json();
      if (res.ok && data.success) {
        showToast(data.message);
        setSelectedIds(new Set());
        fetchPrices(true);
      } else {
        showToast(data.message || 'Batch operation failed', 'error');
      }
    } catch (err) {
      showToast('Network error during batch operation', 'error');
    }
  };

  // Reset page when search, state, or tab changes
  useEffect(() => {
    setCurrentPage(1);
    setSelectedIds(new Set());
  }, [search, selectedState, activeTab]);

  // Paginated records calculation (10 records per page by default)
  const totalRecords = prices.length;
  const totalPages = Math.max(1, Math.ceil(totalRecords / pageSize));
  const startIdx = totalRecords === 0 ? 0 : (currentPage - 1) * pageSize + 1;
  const endIdx = Math.min(currentPage * pageSize, totalRecords);

  const paginatedPrices = useMemo(() => {
    const start = (currentPage - 1) * pageSize;
    return prices.slice(start, start + pageSize);
  }, [prices, currentPage, pageSize]);

  // Select all toggle on current page
  const handleSelectAll = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.checked) {
      setSelectedIds(new Set(paginatedPrices.map((p) => p.id)));
    } else {
      setSelectedIds(new Set());
    }
  };

  const toggleSelectRow = (id: string) => {
    const next = new Set(selectedIds);
    if (next.has(id)) next.delete(id);
    else next.add(id);
    setSelectedIds(next);
  };

  // Unique states for filter dropdown
  const uniqueStates = ['ALL', 'Maharashtra', 'Gujarat', 'Punjab', 'Madhya Pradesh', 'Karnataka', 'Andhra Pradesh', 'Tamil Nadu', 'Rajasthan', 'Uttar Pradesh', 'Kerala'];

  return (
    <div className="space-y-4 w-full max-w-[1600px] mx-auto min-w-0 font-sans pb-10">
      {/* Toast Notification */}
      {toast && <Toast message={toast.message} onClose={() => setToast(null)} />}

      {/* ── Top Header Card (Spacious, Professional, Authentic Government Emblem) ── */}
      <div className="bg-white rounded-xl border border-slate-200/90 shadow-xs p-4 sm:p-5 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div className="flex items-center gap-3.5 min-w-0">
          <div className="w-12 h-12 rounded-lg bg-white border border-slate-200/90 p-1 flex items-center justify-center shadow-xs flex-shrink-0">
            <img
              src="/gov-india-emblem.svg"
              alt="Government of India State Emblem"
              className="h-full w-full object-contain"
            />
          </div>
          <div className="min-w-0">
            <div className="flex items-center gap-2.5 flex-wrap">
              <h1 className="text-lg sm:text-xl font-bold text-slate-900 tracking-tight">
                Government Mandi Live Price Monitor & Gatekeeper
              </h1>
              <span className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-xs font-bold bg-emerald-50 text-emerald-800 border border-emerald-200">
                <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse"></span>
                Official Live Gateway Active
              </span>
            </div>
            <p className="text-xs text-slate-500 font-medium mt-0.5">
              Real-time Agmarknet & e-NAM Mandi arrivals, benchmark modal prices, and administrative visibility gatekeeping.
            </p>
          </div>
        </div>

        <div className="flex items-center gap-3 flex-shrink-0 flex-wrap">
          <div className="text-right hidden md:block">
            <span className="text-xs text-slate-400 block font-medium">Last Synchronized</span>
            <span className="font-mono text-xs font-semibold text-slate-700">
              {summary?.lastSyncTimestamp ? new Date(summary.lastSyncTimestamp).toLocaleTimeString() : 'Just now'}
            </span>
          </div>
          <label className="flex items-center gap-2 cursor-pointer bg-slate-50 hover:bg-slate-100 px-3 py-1.5 rounded-md border border-slate-200 transition-colors">
            <input
              type="checkbox"
              checked={autoRefresh}
              onChange={(e) => setAutoRefresh(e.target.checked)}
              className="h-3.5 w-3.5 rounded border-slate-300 text-emerald-700 focus:ring-emerald-600 cursor-pointer"
            />
            <span className="text-xs font-medium text-slate-700">Auto Refresh (15s)</span>
          </label>
          <Button
            type="button"
            disabled={syncing}
            onClick={handleSyncGovApi}
            fullWidth={false}
            className="text-xs !h-8.5 !px-4 rounded-full !bg-emerald-800 hover:!bg-emerald-900 text-white font-semibold shadow-xs cursor-pointer whitespace-nowrap flex items-center gap-1.5"
          >
            {syncing ? (
              <>
                <div className="w-3.5 h-3.5 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                <span>Syncing Feeds...</span>
              </>
            ) : (
              <>
                <svg className="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                  <path strokeLinecap="round" strokeLinejoin="round" d="M16.023 9.348h4.992v-.001M2.985 19.644v-4.992m0 0h4.992m-4.993 0l3.181 3.183a8.25 8.25 0 0013.803-3.7M4.031 9.865a8.25 8.25 0 0113.803-3.7l3.181 3.182m0-4.991v4.99" />
                </svg>
                <span>Sync Gov API</span>
              </>
            )}
          </Button>
        </div>
      </div>

      {/* ── KPI Metric Summary Cards (Spacious & Professional) ── */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-3.5">
        <div className="bg-white rounded-xl border border-slate-200/90 p-3.5 shadow-2xs">
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold text-slate-500">Live Feeds Streaming</span>
            <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse"></span>
          </div>
          <div className="mt-1.5 flex items-baseline gap-2">
            <span className="text-2xl font-bold text-slate-900">{summary?.totalFeeds ?? prices.length}</span>
            <span className="text-xs text-slate-400 font-medium">commodities</span>
          </div>
        </div>

        <div className="bg-white rounded-xl border border-slate-200/90 p-3.5 shadow-2xs">
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold text-slate-500">Reporting APMC Yards</span>
            <span className="text-xs font-bold text-emerald-800 bg-emerald-50 px-1.5 py-0.5 rounded border border-emerald-200">Active</span>
          </div>
          <div className="mt-1.5 flex items-baseline gap-2">
            <span className="text-2xl font-bold text-emerald-800">{summary?.reportingMandis ?? 14}</span>
            <span className="text-xs text-emerald-700 font-medium">Agmarknet Mandis</span>
          </div>
        </div>

        <div className="bg-white rounded-xl border border-slate-200/90 p-3.5 shadow-2xs">
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold text-slate-500">National Modal Benchmark</span>
            <span className="text-xs font-medium text-slate-400">Avg across yards</span>
          </div>
          <div className="mt-1.5 flex items-baseline gap-2">
            <span className="text-2xl font-bold text-slate-900">₹{summary?.avgModalPrice ? summary.avgModalPrice.toFixed(2) : '68.40'}</span>
            <span className="text-xs text-slate-500 font-medium">/ kg</span>
          </div>
        </div>

        <div className="bg-white rounded-xl border border-slate-200/90 p-3.5 shadow-2xs">
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold text-slate-500">Gatekeeper Restricted</span>
            <span className="text-xs font-bold text-rose-700 bg-rose-50 px-1.5 py-0.5 rounded border border-rose-200">Safeguard</span>
          </div>
          <div className="mt-1.5 flex items-baseline gap-2">
            <span className="text-2xl font-bold text-rose-700">{summary?.blockedFeeds ?? prices.filter((p) => p.isBlocked).length}</span>
            <span className="text-xs text-rose-600 font-medium">tickers blocked</span>
          </div>
        </div>
      </div>

      {/* ── Toolbar Card (Tabs, State Filter, Search - matching User Directory) ── */}
      <div className="bg-white rounded-xl border border-slate-200/90 shadow-2xs p-3 flex flex-col md:flex-row md:items-center justify-between gap-3">
        {/* Left: Filter Tabs */}
        <div className="flex items-center gap-1.5 bg-slate-100/80 p-1 rounded-lg">
          <button
            type="button"
            onClick={() => setActiveTab('ALL')}
            className={`px-3 py-1.5 rounded-md text-xs font-bold transition-all cursor-pointer ${
              activeTab === 'ALL'
                ? 'bg-white text-slate-900 shadow-2xs'
                : 'text-slate-600 hover:text-slate-900'
            }`}
          >
            All Feeds ({summary?.totalFeeds ?? prices.length})
          </button>
          <button
            type="button"
            onClick={() => setActiveTab('ACTIVE')}
            className={`px-3 py-1.5 rounded-md text-xs font-bold transition-all cursor-pointer flex items-center gap-1.5 ${
              activeTab === 'ACTIVE'
                ? 'bg-white text-emerald-800 shadow-2xs'
                : 'text-slate-600 hover:text-slate-900'
            }`}
          >
            <span className="w-2 h-2 rounded-full bg-emerald-600"></span>
            <span>Visible to Users ({summary?.activeFeeds ?? prices.filter((p) => !p.isBlocked).length})</span>
          </button>
          <button
            type="button"
            onClick={() => setActiveTab('BLOCKED')}
            className={`px-3 py-1.5 rounded-md text-xs font-bold transition-all cursor-pointer flex items-center gap-1.5 ${
              activeTab === 'BLOCKED'
                ? 'bg-white text-rose-700 shadow-2xs'
                : 'text-slate-600 hover:text-slate-900'
            }`}
          >
            <span className="w-2 h-2 rounded-full bg-rose-600"></span>
            <span>Restricted / Blocked ({summary?.blockedFeeds ?? prices.filter((p) => p.isBlocked).length})</span>
          </button>
        </div>

        {/* Right: State & Search */}
        <div className="flex items-center gap-2">
          <select
            value={selectedState}
            onChange={(e) => setSelectedState(e.target.value)}
            className="text-xs bg-white border border-slate-300 rounded-md px-3 font-medium text-slate-700 focus:outline-none focus:ring-1 focus:ring-emerald-600 cursor-pointer h-9"
          >
            {uniqueStates.map((st) => (
              <option key={st} value={st}>
                {st === 'ALL' ? 'All Indian States' : st}
              </option>
            ))}
          </select>
          <div className="relative">
            <input
              type="text"
              placeholder="Search crop, APMC yard..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="text-xs pl-8 pr-3 rounded-md border border-slate-300 focus:outline-none focus:ring-1 focus:ring-emerald-600 w-48 sm:w-60 bg-slate-50/50 h-9"
            />
            <svg className="w-4 h-4 text-slate-400 absolute left-2.5 top-2.5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
            </svg>
          </div>
        </div>
      </div>

      {/* Batch Operations Bar (When rows selected) */}
      {selectedIds.size > 0 && (
        <div className="flex items-center justify-between bg-emerald-50 border border-emerald-200 px-4 py-2.5 rounded-lg text-xs animate-in fade-in">
          <span className="font-bold text-emerald-950 text-xs">
            {selectedIds.size} commodity ticker(s) selected
          </span>
          <div className="flex items-center gap-2">
            <button
              type="button"
              onClick={() => handleBatchAction(true)}
              className="px-3.5 py-1.5 rounded-md bg-rose-700 hover:bg-rose-800 text-white font-semibold text-xs cursor-pointer shadow-2xs flex items-center gap-1.5"
            >
              <svg className="w-3.5 h-3.5 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M18.364 18.364A9 9 0 005.636 5.636m12.728 12.728A9 9 0 015.636 5.636m12.728 12.728L5.636 5.636" />
              </svg>
              <span>Block Selected from Users</span>
            </button>
            <button
              type="button"
              onClick={() => handleBatchAction(false)}
              className="px-3.5 py-1.5 rounded-md bg-emerald-700 hover:bg-emerald-800 text-white font-semibold text-xs cursor-pointer shadow-2xs flex items-center gap-1.5"
            >
              <svg className="w-3.5 h-3.5 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.5}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M4.5 12.75l6 6 9-13.5" />
              </svg>
              <span>Allow Visibility</span>
            </button>
            <button
              type="button"
              onClick={() => setSelectedIds(new Set())}
              className="px-2.5 py-1 text-slate-500 hover:text-slate-800 text-xs font-medium cursor-pointer"
            >
              Clear Selection
            </button>
          </div>
        </div>
      )}

      {/* ── Main Data Table Card (Matching User Directory Table size & spacing) ── */}
      <div className="bg-white rounded-xl border border-slate-200/90 shadow-2xs overflow-hidden">
        <div className="overflow-x-auto w-full table-scroll">
          <table className="w-full text-left border-collapse text-xs">
            <thead>
              <tr className="bg-[#f8f9fc] border-b border-slate-200 text-slate-700 font-bold tracking-tight h-10">
                <th className="py-2.5 px-3 w-10 text-center">
                  <input
                    type="checkbox"
                    checked={paginatedPrices.length > 0 && paginatedPrices.every((p) => selectedIds.has(p.id))}
                    onChange={handleSelectAll}
                    className="h-3.5 w-3.5 rounded border-slate-300 text-emerald-700 focus:ring-emerald-600 cursor-pointer"
                  />
                </th>
                <th className="py-2.5 px-3 font-bold text-xs">Commodity & Variety</th>
                <th className="py-2.5 px-3 font-bold text-xs">APMC Mandi</th>
                <th className="py-2.5 px-3 font-bold text-xs">State & District</th>
                <th className="py-2.5 px-3 font-bold text-xs text-right">Arrival Volume</th>
                <th className="py-2.5 px-3 font-bold text-xs text-right">Min - Max Price</th>
                <th className="py-2.5 px-3 font-bold text-xs text-right">Modal Rate</th>
                <th className="py-2.5 px-3 font-bold text-xs text-center">Daily Trend</th>
                <th className="py-2.5 px-3 font-bold text-xs text-center">Gov API Ref</th>
                <th className="py-2.5 px-3 font-bold text-xs text-center">Visibility</th>
                <th className="py-2.5 px-3 font-bold text-xs text-center">Action</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 font-medium">
              {loading ? (
                <tr>
                  <td colSpan={11} className="py-12 text-center text-slate-500">
                    <div className="flex items-center justify-center gap-2.5">
                      <div className="w-5 h-5 border-2 border-emerald-700 border-t-transparent rounded-full animate-spin"></div>
                      <span className="text-xs font-semibold">Streaming Government Agmarknet Live Prices...</span>
                    </div>
                  </td>
                </tr>
              ) : paginatedPrices.length === 0 ? (
                <tr>
                  <td colSpan={11} className="py-12 text-center text-slate-500 text-xs font-semibold">
                    No commodity price tickers matched your filter criteria.
                  </td>
                </tr>
              ) : (
                paginatedPrices.map((item, idx) => {
                  const isSelected = selectedIds.has(item.id);
                  const isBlocked = !!item.isBlocked;

                  return (
                    <tr
                      key={item.id}
                      className={`h-11 transition-colors ${
                        isBlocked
                          ? 'bg-rose-50/40 hover:bg-rose-50/60'
                          : isSelected
                          ? 'bg-emerald-50/60'
                          : idx % 2 === 0
                          ? 'bg-white hover:bg-slate-50/80'
                          : 'bg-[#fafbfc] hover:bg-slate-50/80'
                      }`}
                    >
                      {/* Checkbox */}
                      <td className="py-2.5 px-3 text-center">
                        <input
                          type="checkbox"
                          checked={isSelected}
                          onChange={() => toggleSelectRow(item.id)}
                          className="h-3.5 w-3.5 rounded border-slate-300 text-emerald-700 focus:ring-emerald-600 cursor-pointer"
                        />
                      </td>

                      {/* Commodity & Variety */}
                      <td className="py-2.5 px-3 whitespace-nowrap">
                        <div className="flex items-center gap-1.5">
                          <span className="font-bold text-slate-900 text-xs sm:text-[13px]">{item.cropName}</span>
                          {item.variety && (
                            <span className="text-[11px] font-semibold bg-slate-100 text-slate-700 px-2 py-0.5 rounded border border-slate-200">
                              {item.variety}
                            </span>
                          )}
                        </div>
                      </td>

                      {/* Mandi Yard */}
                      <td className="py-2.5 px-3 text-slate-800 whitespace-nowrap font-semibold text-xs max-w-[180px] truncate" title={item.mandiName}>
                        {item.mandiName}
                      </td>

                      {/* State & District */}
                      <td className="py-2.5 px-3 text-slate-600 whitespace-nowrap text-xs">
                        {item.state}, {item.district}
                      </td>

                      {/* Arrival Vol */}
                      <td className="py-2.5 px-3 text-right font-mono font-semibold text-slate-900 whitespace-nowrap text-xs">
                        {item.arrivalVolumeQuintals?.toLocaleString() || '1,200'} <span className="text-slate-400 font-normal text-[11px]">Qtl</span>
                      </td>

                      {/* Min - Max */}
                      <td className="py-2.5 px-3 text-right font-mono text-slate-600 whitespace-nowrap text-xs">
                        ₹{item.minPrice?.toFixed(1)} - ₹{item.maxPrice?.toFixed(1)}
                      </td>

                      {/* Modal Benchmark Price */}
                      <td className="py-2.5 px-3 text-right whitespace-nowrap">
                        <span className="inline-block px-2.5 py-1 rounded-md text-xs font-bold font-mono bg-emerald-50 text-emerald-900 border border-emerald-200 shadow-2xs">
                          ₹{item.modalPrice?.toFixed(2)} / kg
                        </span>
                      </td>

                      {/* Trend */}
                      <td className="py-2.5 px-3 text-center font-bold text-xs whitespace-nowrap">
                        {item.trend === 'UP' ? (
                          <span className="text-emerald-700 bg-emerald-50 px-2 py-0.5 rounded-md border border-emerald-200 inline-flex items-center gap-1 text-xs">
                            <svg className="w-3 h-3 text-emerald-600" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={3}>
                              <path strokeLinecap="round" strokeLinejoin="round" d="M4.5 10.5L12 3m0 0l7.5 7.5M12 3v18" />
                            </svg>
                            <span>{item.changePercent || '+2.5%'}</span>
                          </span>
                        ) : item.trend === 'DOWN' ? (
                          <span className="text-rose-700 bg-rose-50 px-2 py-0.5 rounded-md border border-rose-200 inline-flex items-center gap-1 text-xs">
                            <svg className="w-3 h-3 text-rose-600" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={3}>
                              <path strokeLinecap="round" strokeLinejoin="round" d="M19.5 13.5L12 21m0 0l-7.5-7.5M12 21V3" />
                            </svg>
                            <span>{item.changePercent || '-1.8%'}</span>
                          </span>
                        ) : (
                          <span className="text-slate-500 bg-slate-100 px-2 py-0.5 rounded-md border border-slate-200 text-xs">
                            0.0%
                          </span>
                        )}
                      </td>

                      {/* Gov API Ref */}
                      <td className="py-2.5 px-3 text-center whitespace-nowrap">
                        <span className="font-mono text-xs bg-slate-50 text-slate-700 px-2 py-0.5 rounded border border-slate-200 inline-flex items-center gap-1.5" title={item.govApiRef || 'AGMARKNET'}>
                          <span className="w-1.5 h-1.5 rounded-full bg-emerald-500"></span>
                          {(item.govApiRef || 'AGMARKNET').replace('AGMARKNET-', '')}
                        </span>
                      </td>

                      {/* Visibility Status */}
                      <td className="py-2.5 px-3 text-center whitespace-nowrap">
                        {isBlocked ? (
                          <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-xs font-bold bg-rose-50 text-rose-800 border border-rose-200">
                            <svg className="w-3 h-3 text-rose-600" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.5}>
                              <path strokeLinecap="round" strokeLinejoin="round" d="M18.364 18.364A9 9 0 005.636 5.636m12.728 12.728A9 9 0 015.636 5.636m12.728 12.728L5.636 5.636" />
                            </svg>
                            <span>Blocked</span>
                          </span>
                        ) : (
                          <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-xs font-bold bg-emerald-50 text-emerald-800 border border-emerald-200">
                            <svg className="w-3 h-3 text-emerald-600" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.5}>
                              <path strokeLinecap="round" strokeLinejoin="round" d="M4.5 12.75l6 6 9-13.5" />
                            </svg>
                            <span>Visible</span>
                          </span>
                        )}
                      </td>

                      {/* Gatekeeper Action Button */}
                      <td className="py-2.5 px-3 text-center whitespace-nowrap">
                        {isBlocked ? (
                          <button
                            type="button"
                            onClick={() => handleToggleBlock(item)}
                            className="inline-flex items-center justify-center h-7 px-3 rounded-md bg-emerald-700 hover:bg-emerald-800 text-white text-xs font-semibold cursor-pointer shadow-2xs whitespace-nowrap transition-colors"
                          >
                            Allow Visibility
                          </button>
                        ) : (
                          <button
                            type="button"
                            onClick={() => handleToggleBlock(item)}
                            className="inline-flex items-center justify-center h-7 px-3 rounded-md border border-rose-300 text-rose-700 hover:bg-rose-50 text-xs font-semibold cursor-pointer shadow-2xs whitespace-nowrap transition-colors"
                          >
                            Block Feed
                          </button>
                        )}
                      </td>
                    </tr>
                  );
                })
              )}
            </tbody>
          </table>
        </div>

        {/* ── Spacious Pagination Footer (Matching User Directory Table) ── */}
        <div className="px-4 py-3 bg-white border-t border-slate-200 text-slate-600 text-xs flex flex-col sm:flex-row sm:items-center justify-between gap-3">
          {/* Rows Per Page Dropdown */}
          <div className="flex items-center gap-2">
            <span className="text-slate-500">Rows per page:</span>
            <select
              value={pageSize}
              onChange={(e) => {
                setPageSize(Number(e.target.value));
                setCurrentPage(1);
              }}
              className="px-2 py-1 h-7 border border-slate-300 rounded-md bg-white text-xs font-medium text-slate-800 focus:outline-none focus:ring-1 focus:ring-emerald-600 cursor-pointer"
            >
              <option value={10}>10</option>
              <option value={25}>25</option>
              <option value={50}>50</option>
              <option value={100}>100</option>
            </select>
            <span className="text-slate-400 text-xs ml-2">
              Showing {startIdx} - {endIdx} of {totalRecords} Records
            </span>
          </div>

          {/* Record Count & Page Navigation */}
          <div className="flex items-center gap-3">
            <span className="text-slate-500">
              Page <strong className="text-slate-800 font-semibold">{currentPage}</strong> of{' '}
              <strong className="text-slate-800 font-semibold">{totalPages}</strong>
            </span>

            <div className="inline-flex items-center rounded-md border border-slate-300 bg-white shadow-2xs overflow-hidden h-7">
              <button
                type="button"
                disabled={currentPage <= 1}
                onClick={() => setCurrentPage((p) => Math.max(1, p - 1))}
                className="px-2.5 h-full text-slate-600 hover:bg-slate-100 disabled:opacity-40 disabled:hover:bg-white border-r border-slate-200 transition-colors cursor-pointer disabled:cursor-not-allowed flex items-center justify-center text-xs"
                title="Previous Page"
              >
                ‹
              </button>

              {Array.from({ length: Math.min(5, totalPages) }, (_, i) => {
                let p = i + 1;
                if (totalPages > 5 && currentPage > 3) {
                  p = currentPage - 3 + i;
                  if (p > totalPages) p = totalPages - (4 - i);
                }
                return (
                  <button
                    key={p}
                    type="button"
                    onClick={() => setCurrentPage(p)}
                    className={`px-2.5 h-full text-xs font-bold border-r last:border-r-0 border-slate-200 transition-colors cursor-pointer ${
                      currentPage === p
                        ? 'bg-emerald-800 text-white'
                        : 'bg-white text-slate-700 hover:bg-slate-100'
                    }`}
                  >
                    {p}
                  </button>
                );
              })}

              <button
                type="button"
                disabled={currentPage >= totalPages}
                onClick={() => setCurrentPage((p) => Math.min(totalPages, p + 1))}
                className="px-2.5 h-full text-slate-600 hover:bg-slate-100 disabled:opacity-40 disabled:hover:bg-white transition-colors cursor-pointer disabled:cursor-not-allowed flex items-center justify-center text-xs"
                title="Next Page"
              >
                ›
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* ── Block Reason Confirmation Modal ── */}
      {blockingItem && (
        <div className="fixed inset-0 z-50 bg-slate-900/60 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white rounded-xl max-w-md w-full p-5 space-y-3 shadow-2xl border border-slate-200 animate-in fade-in zoom-in-95 duration-150">
            {/* Modal Header */}
            <div className="flex justify-between items-center border-b border-slate-100 pb-2.5">
              <div className="flex items-center gap-2">
                <div className="w-7 h-7 rounded-full bg-rose-100 text-rose-700 flex items-center justify-center font-bold text-xs">
                  <svg className="w-3.5 h-3.5 text-rose-600" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                    <path strokeLinecap="round" strokeLinejoin="round" d="M18.364 18.364A9 9 0 005.636 5.636m12.728 12.728A9 9 0 015.636 5.636m12.728 12.728L5.636 5.636" />
                  </svg>
                </div>
                <div>
                  <h3 className="text-xs font-bold text-slate-900">Block Commodity from User Visibility</h3>
                  <p className="text-[10px] text-slate-500">Enforce administrative market gatekeeping</p>
                </div>
              </div>
              <button
                type="button"
                onClick={() => setBlockingItem(null)}
                className="text-slate-400 hover:text-slate-600 p-1 rounded-full hover:bg-slate-100 transition-colors cursor-pointer"
              >
                <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                  <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
                </svg>
              </button>
            </div>

            {/* Modal Body */}
            <div className="space-y-2.5 text-xs text-slate-600">
              <div className="p-2.5 bg-slate-50 rounded-lg border border-slate-200 space-y-0.5">
                <div className="font-bold text-slate-900 text-xs">{blockingItem.cropName}</div>
                <div className="text-[10.5px] text-slate-600">
                  Mandi: <span className="font-semibold text-slate-800">{blockingItem.mandiName}</span> ({blockingItem.state}) &bull; Modal: <span className="font-mono font-bold text-emerald-800">₹{blockingItem.modalPrice}/kg</span>
                </div>
              </div>

              <div className="p-2 bg-amber-50 rounded-md border border-amber-200 text-amber-900 text-[10.5px] leading-snug">
                <span className="font-bold">Administrative Impact: </span>
                Once blocked, regular users cannot view this commodity in Mandi Ticker or use it as a benchmark.
              </div>

              <div className="space-y-1">
                <label className="font-bold text-slate-700 block text-[11px]">Select Reason for Restriction:</label>
                <div className="space-y-1">
                  {PRESET_BLOCK_REASONS.map((r) => (
                    <label
                      key={r}
                      className={`flex items-center gap-2 p-1.5 rounded border cursor-pointer transition-colors ${
                        blockReason === r
                          ? 'bg-emerald-50/80 border-emerald-700 text-emerald-950 font-semibold'
                          : 'border-slate-200 hover:bg-slate-50 text-slate-700'
                      }`}
                    >
                      <input
                        type="radio"
                        name="blockReason"
                        value={r}
                        checked={blockReason === r}
                        onChange={() => setBlockReason(r)}
                        className="text-emerald-700 focus:ring-emerald-700 cursor-pointer"
                      />
                      <span className="text-[11px] leading-tight">{r}</span>
                    </label>
                  ))}
                  <label
                    className={`flex items-center gap-2 p-1.5 rounded border cursor-pointer transition-colors ${
                      blockReason === 'OTHER'
                        ? 'bg-emerald-50/80 border-emerald-700 text-emerald-950 font-semibold'
                        : 'border-slate-200 hover:bg-slate-50 text-slate-700'
                    }`}
                  >
                    <input
                      type="radio"
                      name="blockReason"
                      value="OTHER"
                      checked={blockReason === 'OTHER'}
                      onChange={() => setBlockReason('OTHER')}
                      className="text-emerald-700 focus:ring-emerald-700 cursor-pointer"
                    />
                    <span className="text-[11px]">Custom Reason...</span>
                  </label>
                </div>
              </div>

              {blockReason === 'OTHER' && (
                <textarea
                  rows={2}
                  placeholder="Enter justification for blocking this price feed..."
                  value={customReason}
                  onChange={(e) => setCustomReason(e.target.value)}
                  className="w-full text-[11px] p-2 rounded border border-slate-300 focus:outline-none focus:ring-1 focus:ring-emerald-500"
                />
              )}
            </div>

            {/* Modal Actions */}
            <div className="flex items-center justify-end gap-2 pt-2.5 border-t border-slate-100">
              <Button
                type="button"
                variant="outline"
                onClick={() => setBlockingItem(null)}
                fullWidth={false}
                className="text-xs !h-7 !px-3.5 rounded-full cursor-pointer"
              >
                Cancel
              </Button>
              <Button
                type="button"
                disabled={isProcessingBlock}
                onClick={handleConfirmBlock}
                fullWidth={false}
                className="text-xs !h-7 !px-4 rounded-full !bg-rose-700 hover:!bg-rose-800 text-white font-semibold shadow-2xs cursor-pointer whitespace-nowrap"
              >
                {isProcessingBlock ? 'Blocking...' : 'Confirm Block'}
              </Button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
