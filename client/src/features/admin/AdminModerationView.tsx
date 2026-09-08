import React, { useState, useEffect, useMemo } from 'react';
import {
  EnterpriseDataTable,
  DataTableColumn,
  DataTableTab,
  Button,
  Input,
  CloseIcon,
} from '../../components/ui/index.js';

export default function AdminModerationView() {
  const [listings, setListings] = useState<any[]>([]);
  const [flagModalListing, setFlagModalListing] = useState<any | null>(null);
  const [flagReason, setFlagReason] = useState('');
  const [activeTabId, setActiveTabId] = useState<'ACTIVE' | 'FLAGGED' | 'ALL'>('ACTIVE');
  const [loading, setLoading] = useState(true);

  const loadListings = () => {
    setLoading(true);
    fetch('http://localhost:8000/api/v1/produce/listings')
      .then((r) => r.json())
      .then((d) => {
        if (d.success) setListings(d.data || []);
      })
      .catch(() => {})
      .finally(() => setLoading(false));
  };

  useEffect(() => {
    loadListings();
  }, []);

  const handleModerate = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!flagModalListing) return;
    try {
      const res = await fetch(`http://localhost:8000/api/v1/admin/listings/${flagModalListing.id}/moderate`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${localStorage.getItem('token')}`,
        },
        body: JSON.stringify({
          action: 'REMOVE',
          reason: flagReason || 'Violates quality specifications or suspicious pricing',
        }),
      });
      const data = await res.json();
      if (data.success) {
        setFlagModalListing(null);
        setFlagReason('');
        loadListings();
      }
    } catch {}
  };

  const activeListings = useMemo(() => listings.filter((l) => l.status === 'ACTIVE' || l.status === 'available'), [listings]);
  const flaggedListings = useMemo(() => listings.filter((l) => l.status === 'REMOVED' || l.status === 'FLAGGED'), [listings]);

  const filteredData = useMemo(() => {
    if (activeTabId === 'ACTIVE') return activeListings;
    if (activeTabId === 'FLAGGED') return flaggedListings;
    return listings;
  }, [activeTabId, activeListings, flaggedListings, listings]);

  const tabs: DataTableTab[] = [
    {
      id: 'ACTIVE',
      label: 'Marketplace Active Listings',
      count: activeListings.length,
      badgeColor: 'bg-emerald-100 text-emerald-900 border border-emerald-300',
    },
    {
      id: 'ALL',
      label: 'All Harvest Lots',
      count: listings.length,
      badgeColor: 'bg-slate-100 text-slate-800 border border-slate-300',
    },
    {
      id: 'FLAGGED',
      label: 'Flagged / Suspended',
      count: flaggedListings.length,
      badgeColor: 'bg-rose-100 text-rose-900 border border-rose-300',
    },
  ];

  const columns: DataTableColumn[] = [
    {
      key: 'cropName',
      header: 'Produce & Grade',
      sortable: true,
      searchable: true,
      searchPlaceholder: 'Search produce...',
      render: (l) => (
        <div className="flex items-center gap-1.5 whitespace-nowrap">
          <span className="font-bold text-slate-900 text-[11.5px]">{l.cropName}</span>
          <span className="text-[9.5px] text-slate-400 font-medium">({l.grade ? `Grade ${l.grade}` : 'Grade A'})</span>
        </div>
      ),
    },
    {
      key: 'farmerName',
      header: 'Farmer / Producer',
      sortable: true,
      searchable: true,
      searchPlaceholder: 'Farmer name...',
      render: (l) => <span className="font-medium text-slate-800 text-[11px] whitespace-nowrap">{l.farmerName || 'Rajesh Sharma'}</span>,
    },
    {
      key: 'quantityKg',
      header: 'Available Qty',
      sortable: true,
      searchable: true,
      searchPlaceholder: 'Quantity...',
      render: (l) => <span className="font-mono text-[11px] whitespace-nowrap">{l.quantityKg?.toLocaleString() || '1,000'} kg</span>,
    },
    {
      key: 'askingPricePerKg',
      header: 'Asking Price',
      sortable: true,
      searchable: true,
      searchPlaceholder: 'Price...',
      render: (l) => <span className="font-bold text-slate-900 font-mono text-[11px] whitespace-nowrap">₹{l.askingPricePerKg} / kg</span>,
    },
    {
      key: 'nearestMandiModalPrice',
      header: 'Mandi Benchmark',
      sortable: true,
      searchable: true,
      searchPlaceholder: 'Benchmark...',
      render: (l) => (
        <span className="text-emerald-700 font-semibold font-mono text-[11px] whitespace-nowrap">
          ₹{l.nearestMandiModalPrice || 68.5} / kg
        </span>
      ),
    },
    {
      key: 'status',
      header: 'Status',
      sortable: true,
      searchable: true,
      searchPlaceholder: 'Status...',
      render: (l) => (
        <span
          className={`px-1.5 py-0.2 rounded text-[9.5px] font-bold uppercase border whitespace-nowrap ${
            l.status === 'ACTIVE' || l.status === 'available'
              ? 'bg-emerald-50 text-emerald-800 border-emerald-200'
              : 'bg-rose-50 text-rose-800 border-rose-200'
          }`}
        >
          {l.status}
        </span>
      ),
    },
    {
      key: 'actions',
      header: 'Moderation Action',
      width: '140px',
      align: 'center',
      render: (l) => (
        <div className="flex items-center justify-center">
          <button
            onClick={() => setFlagModalListing(l)}
            className="px-2.5 py-1 h-6.5 text-[11px] font-semibold text-rose-700 bg-white border border-rose-200 hover:bg-rose-50 rounded transition-colors cursor-pointer shadow-2xs shrink-0"
          >
            Flag / Remove
          </button>
        </div>
      ),
    },
  ];

  return (
    <div className="space-y-4 w-full max-w-full min-w-0">
      <EnterpriseDataTable
        title="Produce Listing Moderation"
        subtitle="Admin trust & safety console: inspect active market listings, flag suspicious pricing, or remove unverified yields."
        data={filteredData}
        columns={columns}
        keyExtractor={(item) => item.id}
        tabs={tabs}
        activeTab={activeTabId}
        onTabChange={(id) => setActiveTabId(id as any)}
        onRefresh={loadListings}
        exportFilename="AgriBridge_Produce_Moderation"
        loading={loading}
      />

      {/* Flag / Remove Modal */}
      {flagModalListing && (
        <div className="fixed inset-0 z-50 bg-black/50 flex items-center justify-center p-4">
          <div className="bg-white rounded-md max-w-md w-full p-5 space-y-4 shadow-xl border border-slate-200">
            <div className="flex justify-between items-center border-b pb-2">
              <h3 className="text-sm font-bold text-slate-800">
                Remove Listing: {flagModalListing.cropName}
              </h3>
              <button onClick={() => setFlagModalListing(null)} className="text-slate-400 hover:text-slate-600">
                <CloseIcon className="w-4 h-4" />
              </button>
            </div>
            <form onSubmit={handleModerate} className="space-y-3">
              <Input
                label="Reason for Removal / Moderation Action"
                value={flagReason}
                onChange={(e) => setFlagReason(e.target.value)}
                required
                placeholder="e.g. Unverified organic certificate claim, abnormal price spike"
                id="flagReason"
              />
              <div className="pt-2 flex justify-end gap-2 border-t border-slate-100">
                <Button variant="outline" type="button" onClick={() => setFlagModalListing(null)} className="text-xs">
                  Cancel
                </Button>
                <Button type="submit" className="text-xs !bg-rose-700 hover:!bg-rose-800 text-white font-bold">
                  Confirm Removal
                </Button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
