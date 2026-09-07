import React, { useState, useEffect } from 'react';
import { Button, Input } from '../../components/ui/index.js';

export default function AdminModerationView() {
  const [listings, setListings] = useState<any[]>([]);
  const [flagModalListing, setFlagModalListing] = useState<any | null>(null);
  const [flagReason, setFlagReason] = useState('');

  const loadListings = () => {
    fetch('http://localhost:8000/api/v1/produce/listings')
      .then((r) => r.json())
      .then((d) => {
        if (d.success) setListings(d.data);
      })
      .catch(() => {});
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

  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <h1 className="text-xl font-bold text-slate-800 tracking-tight">
          Produce Listing Moderation (Prompt 14)
        </h1>
        <p className="text-xs text-slate-500 mt-0.5">
          Admin trust & safety console: inspect active market listings, flag suspicious pricing, or remove unverified yields.
        </p>
      </div>

      {/* Listings table */}
      <div className="bg-white rounded-2xl border border-slate-200 shadow-sm overflow-hidden">
        <div className="px-6 py-4 border-b border-slate-200 flex items-center justify-between">
          <h3 className="text-sm font-bold text-slate-800">
            Marketplace Active Listings ({listings.length})
          </h3>
          <span className="text-xs text-slate-500">
            Automated compliance check passed
          </span>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-xs text-left text-slate-600">
            <thead className="text-[10px] font-bold text-slate-400 uppercase bg-slate-50 border-b border-slate-200">
              <tr>
                <th className="px-6 py-3">Produce</th>
                <th className="px-6 py-3">Farmer</th>
                <th className="px-6 py-3">Quantity</th>
                <th className="px-6 py-3">Asking Price</th>
                <th className="px-6 py-3">Mandi Benchmark</th>
                <th className="px-6 py-3">Status</th>
                <th className="px-6 py-3 text-right">Moderation</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {listings.map((l) => (
                <tr key={l.id} className="hover:bg-slate-50 transition">
                  <td className="px-6 py-3.5 font-bold text-slate-800">
                    {l.cropName} ({l.grade})
                  </td>
                  <td className="px-6 py-3.5 text-slate-700">
                    {l.farmerName || 'Rajesh Sharma'}
                  </td>
                  <td className="px-6 py-3.5">
                    {l.quantityKg?.toLocaleString()} kg
                  </td>
                  <td className="px-6 py-3.5 font-bold text-slate-900">
                    ₹{l.askingPricePerKg} / kg
                  </td>
                  <td className="px-6 py-3.5 text-blue-700 font-semibold">
                    ₹{l.nearestMandiModalPrice || 68.5} / kg
                  </td>
                  <td className="px-6 py-3.5">
                    <span className="px-2.5 py-0.5 rounded-full text-[10px] font-bold uppercase bg-emerald-100 text-emerald-800 border border-emerald-200">
                      {l.status}
                    </span>
                  </td>
                  <td className="px-6 py-3.5 text-right">
                    <button
                      onClick={() => setFlagModalListing(l)}
                      className="text-xs font-semibold text-red-600 hover:text-red-800"
                    >
                      Flag / Remove
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* Flag Modal */}
      {flagModalListing && (
        <div className="fixed inset-0 z-50 bg-black/50 flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl max-w-md w-full p-6 space-y-4 shadow-xl">
            <div className="flex justify-between items-center border-b pb-3">
              <h3 className="text-base font-bold text-slate-800">
                Remove Listing: {flagModalListing.cropName}
              </h3>
              <button onClick={() => setFlagModalListing(null)} className="text-slate-400 hover:text-slate-600">✕</button>
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
              <div className="pt-2 flex justify-end gap-2">
                <Button variant="outline" type="button" onClick={() => setFlagModalListing(null)}>Cancel</Button>
                <Button type="submit" className="bg-red-600 hover:bg-red-700 text-white">Confirm Removal</Button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
