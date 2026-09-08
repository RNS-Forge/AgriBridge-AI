import React, { useState, useEffect, useMemo } from 'react';
import {
  EnterpriseDataTable,
  DataTableColumn,
  DataTableTab,
  Button,
  Input,
  CloseIcon,
} from '../../components/ui/index.js';

export default function AdminDisputesView() {
  const [disputes, setDisputes] = useState<any[]>([]);
  const [resolveModalDispute, setResolveModalDispute] = useState<any | null>(null);
  const [resolutionText, setResolutionText] = useState('');
  const [activeTabId, setActiveTabId] = useState<'OPEN' | 'RESOLVED' | 'ALL'>('OPEN');
  const [loading, setLoading] = useState(true);

  const loadDisputes = () => {
    setLoading(true);
    fetch('http://localhost:8000/api/v1/admin/disputes')
      .then((r) => r.json())
      .then((d) => {
        if (d.success) setDisputes(d.data || []);
      })
      .catch(() => {})
      .finally(() => setLoading(false));
  };

  useEffect(() => {
    loadDisputes();
  }, []);

  const handleResolve = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!resolveModalDispute) return;
    try {
      const res = await fetch(`http://localhost:8000/api/v1/admin/disputes/${resolveModalDispute.id}/resolve`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${localStorage.getItem('token')}`,
        },
        body: JSON.stringify({
          resolution: resolutionText || 'Resolved amicably between parties with adjustment.',
        }),
      });
      const data = await res.json();
      if (data.success) {
        setResolveModalDispute(null);
        setResolutionText('');
        loadDisputes();
      }
    } catch {}
  };

  const openDisputes = useMemo(() => disputes.filter((d) => d.status === 'OPEN'), [disputes]);
  const resolvedDisputes = useMemo(() => disputes.filter((d) => d.status === 'RESOLVED'), [disputes]);

  const filteredData = useMemo(() => {
    if (activeTabId === 'OPEN') return openDisputes;
    if (activeTabId === 'RESOLVED') return resolvedDisputes;
    return disputes;
  }, [activeTabId, openDisputes, resolvedDisputes, disputes]);

  const tabs: DataTableTab[] = [
    {
      id: 'OPEN',
      label: 'Open Mediation Queue',
      count: openDisputes.length,
      badgeColor: 'bg-amber-100 text-amber-900 border border-amber-300',
    },
    {
      id: 'RESOLVED',
      label: 'Resolved Disputes',
      count: resolvedDisputes.length,
      badgeColor: 'bg-emerald-100 text-emerald-900 border border-emerald-300',
    },
    {
      id: 'ALL',
      label: 'All Arbitration Tickets',
      count: disputes.length,
      badgeColor: 'bg-slate-100 text-slate-800 border border-slate-300',
    },
  ];

  const columns: DataTableColumn[] = [
    {
      key: 'orderId',
      header: 'Dispute / Order ID',
      sortable: true,
      searchable: true,
      searchPlaceholder: 'Order ID...',
      render: (d) => (
        <div className="flex items-center gap-1.5 whitespace-nowrap">
          <span className="font-bold text-slate-900 font-mono text-[11.5px]">{d.orderId}</span>
          <span className="text-[9.5px] text-slate-400 font-mono">({d.id})</span>
        </div>
      ),
    },
    {
      key: 'raisedBy',
      header: 'Raised By',
      sortable: true,
      searchable: true,
      searchPlaceholder: 'Complainant...',
      render: (d) => <span className="font-semibold text-slate-800 text-[11px] whitespace-nowrap">{d.raisedBy}</span>,
    },
    {
      key: 'reason',
      header: 'Dispute Reason & Details',
      searchable: true,
      searchPlaceholder: 'Complaint text...',
      render: (d) => (
        <span className="text-slate-700 text-[11px] truncate max-w-[220px] block" title={d.reason}>
          {d.reason}
        </span>
      ),
    },
    {
      key: 'createdAt',
      header: 'Filed Date',
      sortable: true,
      searchable: true,
      searchPlaceholder: 'Date...',
      render: (d) => (
        <span className="text-slate-500 font-mono text-[11px] whitespace-nowrap">
          {d.createdAt ? new Date(d.createdAt).toLocaleDateString() : '—'}
        </span>
      ),
    },
    {
      key: 'status',
      header: 'Status',
      sortable: true,
      searchable: true,
      searchPlaceholder: 'Status...',
      render: (d) => (
        <span
          className={`px-1.5 py-0.2 rounded text-[9.5px] font-bold uppercase border whitespace-nowrap ${
            d.status === 'OPEN'
              ? 'bg-amber-50 text-amber-800 border-amber-300'
              : 'bg-emerald-50 text-emerald-800 border-emerald-300'
          }`}
        >
          {d.status}
        </span>
      ),
    },
    {
      key: 'actions',
      header: 'Mediation',
      width: '140px',
      align: 'center',
      render: (d) => (
        <div className="flex items-center justify-center">
          {d.status === 'OPEN' ? (
            <button
              onClick={() => setResolveModalDispute(d)}
              className="px-2.5 py-1 h-6.5 text-[11px] font-bold text-white bg-emerald-700 hover:bg-emerald-800 rounded shadow-2xs transition-colors cursor-pointer shrink-0"
            >
              Resolve Ticket
            </button>
          ) : (
            <span className="text-[10px] font-bold text-slate-400 uppercase">Closed</span>
          )}
        </div>
      ),
    },
  ];

  return (
    <div className="space-y-4 w-full max-w-full min-w-0">
      <EnterpriseDataTable
        title="Disputes & Resolution Center"
        subtitle="Mediate issues arising in order fulfillment, logistics discrepancies, or Mandi payout adjustments."
        data={filteredData}
        columns={columns}
        keyExtractor={(item) => item.id}
        tabs={tabs}
        activeTab={activeTabId}
        onTabChange={(id) => setActiveTabId(id as any)}
        onRefresh={loadDisputes}
        exportFilename="AgriBridge_Disputes_Report"
        loading={loading}
      />

      {/* Resolve Modal */}
      {resolveModalDispute && (
        <div className="fixed inset-0 z-50 bg-black/50 flex items-center justify-center p-4">
          <div className="bg-white rounded-md max-w-md w-full p-5 space-y-4 shadow-xl border border-slate-200">
            <div className="flex justify-between items-center border-b pb-2">
              <h3 className="text-sm font-bold text-slate-800">
                Resolve Dispute: {resolveModalDispute.orderId}
              </h3>
              <button onClick={() => setResolveModalDispute(null)} className="text-slate-400 hover:text-slate-600">
                <CloseIcon className="w-4 h-4" />
              </button>
            </div>
            <form onSubmit={handleResolve} className="space-y-3">
              <Input
                label="Arbitration & Resolution Details"
                value={resolutionText}
                onChange={(e) => setResolutionText(e.target.value)}
                required
                placeholder="e.g. Agreed 2% freight credit; tare weight adjustment accepted."
                id="resolutionText"
              />
              <div className="pt-2 flex justify-end gap-2 border-t border-slate-100">
                <Button variant="outline" type="button" onClick={() => setResolveModalDispute(null)} className="text-xs">
                  Cancel
                </Button>
                <Button type="submit" className="text-xs !bg-emerald-700 hover:!bg-emerald-800 text-white font-bold">
                  Submit Resolution & Close Ticket
                </Button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
