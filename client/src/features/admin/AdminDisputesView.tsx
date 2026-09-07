import React, { useState, useEffect } from 'react';
import { Button, Input, CloseIcon } from '../../components/ui/index.js';

export default function AdminDisputesView() {
  const [disputes, setDisputes] = useState<any[]>([]);
  const [resolveModalDispute, setResolveModalDispute] = useState<any | null>(null);
  const [resolutionText, setResolutionText] = useState('');

  const loadDisputes = () => {
    fetch('http://localhost:8000/api/v1/admin/disputes')
      .then((r) => r.json())
      .then((d) => {
        if (d.success) setDisputes(d.data);
      })
      .catch(() => {});
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
          resolution: resolutionText || 'Resolved amicably between parties with 2% adjustment.',
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

  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <h1 className="text-xl font-bold text-slate-800 tracking-tight">
          Disputes & Resolution Center (Prompt 14)
        </h1>
        <p className="text-xs text-slate-500 mt-0.5">
          Mediate issues arising in order fulfillment, logistics discrepancies, or Mandi payout adjustments.
        </p>
      </div>

      {/* Disputes Cards */}
      <div className="space-y-4">
        {disputes.map((d) => (
          <div
            key={d.id}
            className={`p-6 rounded-md border shadow-sm space-y-4 ${
              d.status === 'OPEN' ? 'bg-white border-amber-300' : 'bg-slate-50 border-slate-200'
            }`}
          >
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 pb-3 border-b border-slate-100">
              <div>
                <div className="flex items-center gap-2">
                  <h3 className="text-base font-bold text-slate-800">{d.orderId}</h3>
                  <span
                    className={`px-2.5 py-0.5 rounded text-xs font-bold uppercase ${
                      d.status === 'OPEN'
                        ? 'bg-amber-100 text-amber-800 border border-amber-200'
                        : 'bg-emerald-100 text-emerald-800 border border-emerald-200'
                    }`}
                  >
                    {d.status}
                  </span>
                </div>
                <p className="text-xs text-slate-500 mt-0.5">
                  Raised by: <strong>{d.raisedBy}</strong> • Opened: {new Date(d.createdAt).toLocaleDateString()}
                </p>
              </div>

              {d.status === 'OPEN' && (
                <Button
                  className="text-xs px-4 py-1.5 bg-emerald-700 hover:bg-emerald-800 self-start"
                  onClick={() => setResolveModalDispute(d)}
                >
                  Resolve Dispute →
                </Button>
              )}
            </div>

            <div className="p-3 bg-slate-50 rounded-md border border-slate-200 text-xs">
              <span className="text-slate-400 font-bold block uppercase text-[10px]">Complaint Summary</span>
              <p className="text-slate-800 mt-0.5 leading-relaxed">{d.reason}</p>
            </div>

            {d.resolution && (
              <div className="p-3 bg-emerald-50 rounded-md border border-emerald-200 text-xs">
                <span className="text-emerald-800 font-bold block uppercase text-[10px]">Admin Resolution</span>
                <p className="text-emerald-900 mt-0.5 font-medium">{d.resolution}</p>
              </div>
            )}
          </div>
        ))}
      </div>

      {/* Resolve Modal */}
      {resolveModalDispute && (
        <div className="fixed inset-0 z-50 bg-black/50 flex items-center justify-center p-4">
          <div className="bg-white rounded-md max-w-md w-full p-6 space-y-4 shadow-xl border border-slate-200">
            <div className="flex justify-between items-center border-b pb-3">
              <h3 className="text-base font-bold text-slate-800">
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
                placeholder="e.g. Weighbridge calibration certificate accepted; agreed 2% freight credit."
                id="resolutionText"
              />
              <div className="pt-2 flex justify-end gap-2">
                <Button variant="outline" type="button" onClick={() => setResolveModalDispute(null)}>Cancel</Button>
                <Button type="submit">Submit Resolution & Close Ticket</Button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
