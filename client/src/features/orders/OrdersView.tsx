import React, { useState, useEffect } from 'react';
import { Button, Input, CheckCircleIcon, CloseIcon, FileTextIcon, SparklesIcon } from '../../components/ui/index.js';

export default function OrdersView() {
  const [orders, setOrders] = useState<any[]>([]);
  const [showPodModal, setShowPodModal] = useState<any | null>(null);
  const [podNote, setPodNote] = useState('');

  const loadOrders = () => {
    fetch('http://localhost:8000/api/v1/produce/orders')
      .then((r) => r.json())
      .then((d) => {
        if (d.success) setOrders(d.data);
      })
      .catch(() => {});
  };

  useEffect(() => {
    loadOrders();
  }, []);

  const handleUpdateStatus = async (orderId: string, status: string) => {
    try {
      const res = await fetch(`http://localhost:8000/api/v1/produce/orders/${orderId}/status`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ status }),
      });
      const data = await res.json();
      if (data.success) loadOrders();
    } catch {}
  };

  const handleCompleteWithPod = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!showPodModal) return;
    try {
      const res = await fetch(`http://localhost:8000/api/v1/produce/orders/${showPodModal.id}/proof-of-delivery`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          photoUrl: '/logo/sample-pod.png',
          note: podNote || 'Warehouse intake inspection grade A confirmed.',
        }),
      });
      const data = await res.json();
      if (data.success) {
        setShowPodModal(null);
        setPodNote('');
        loadOrders();
      }
    } catch {}
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <h1 className="text-xl font-bold text-slate-800 tracking-tight">
          Orders & Logistics Tracking
        </h1>
        <p className="text-xs text-slate-500 mt-0.5">
          Lifecycle: SCHEDULED → PICKED_UP → DELIVERED → COMPLETED. Completing an order automatically triggers the Profit Report engine.
        </p>
      </div>

      {/* Orders List */}
      <div className="space-y-4">
        {orders.map((order) => (
          <div
            key={order.id}
            className="bg-white p-6 rounded-md border border-slate-200 shadow-sm space-y-4"
          >
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 pb-3 border-b border-slate-100">
              <div>
                <div className="flex items-center gap-2">
                  <h3 className="text-base font-bold text-slate-800">{order.cropName}</h3>
                  <span
                    className={`px-2.5 py-0.5 rounded text-xs font-bold uppercase tracking-wider ${
                      order.status === 'COMPLETED'
                        ? 'bg-emerald-100 text-emerald-800 border border-emerald-200'
                        : order.status === 'DELIVERED'
                        ? 'bg-blue-100 text-blue-800 border border-blue-200'
                        : 'bg-amber-100 text-amber-800 border border-amber-200'
                    }`}
                  >
                    {order.status}
                  </span>
                </div>
                <p className="text-xs text-slate-500 mt-0.5">
                  Buyer: <strong>{order.buyerName}</strong> • Farmer: <strong>{order.farmerName}</strong>
                </p>
              </div>

              <div className="text-right">
                <span className="text-xs text-slate-400">Total Agreed Settlement:</span>
                <p className="text-lg font-bold text-slate-900">₹{order.totalAmount?.toLocaleString()}</p>
                <span className="text-[11px] text-slate-500">
                  {order.quantityKg?.toLocaleString()} kg @ ₹{order.agreedPricePerKg}/kg
                </span>
              </div>
            </div>

            {/* Logistics Progression Line */}
            <div className="grid grid-cols-4 gap-2 text-center text-xs">
              <div className="p-2 rounded bg-emerald-50 border border-emerald-200 font-medium text-emerald-900 inline-flex items-center justify-center gap-1">
                <span>1. ACCEPTED</span>
                <CheckCircleIcon className="w-3.5 h-3.5 text-emerald-700 inline" />
              </div>
              <div className={`p-2 rounded border font-medium ${
                ['PICKED_UP', 'DELIVERED', 'COMPLETED'].includes(order.status)
                  ? 'bg-emerald-50 border-emerald-200 text-emerald-900'
                  : 'bg-slate-50 border-slate-200 text-slate-400'
              }`}>
                2. SCHEDULED & PICKED UP
              </div>
              <div className={`p-2 rounded border font-medium ${
                ['DELIVERED', 'COMPLETED'].includes(order.status)
                  ? 'bg-emerald-50 border-emerald-200 text-emerald-900'
                  : 'bg-slate-50 border-slate-200 text-slate-400'
              }`}>
                3. DELIVERED
              </div>
              <div className={`p-2 rounded border font-medium ${
                order.status === 'COMPLETED'
                  ? 'bg-emerald-100 border-emerald-300 text-emerald-900 font-bold'
                  : 'bg-slate-50 border-slate-200 text-slate-400'
              }`}>
                4. COMPLETED & CLOSED
              </div>
            </div>

            {/* Proof of Delivery if available */}
            {order.proofOfDeliveryNote && (
              <div className="p-3 bg-slate-50 rounded-md border border-slate-200 text-xs text-slate-700 flex items-center justify-between">
                <span>Proof of Delivery: <em>"{order.proofOfDeliveryNote}"</em></span>
                <span className="text-emerald-700 font-bold text-[11px] flex items-center gap-1">
                  <CheckCircleIcon className="w-3.5 h-3.5" />
                  POD Verified
                </span>
              </div>
            )}

            {/* Actions Bar */}
            <div className="pt-2 flex items-center justify-end gap-2">
              {order.status === 'ACCEPTED' && (
                <Button
                  className="text-xs"
                  onClick={() => handleUpdateStatus(order.id, 'PICKED_UP')}
                >
                  Mark as Picked Up →
                </Button>
              )}

              {order.status === 'PICKED_UP' && (
                <Button
                  className="text-xs"
                  onClick={() => handleUpdateStatus(order.id, 'DELIVERED')}
                >
                  Confirm Delivery Received →
                </Button>
              )}

              {order.status === 'DELIVERED' && (
                <Button
                  className="text-xs bg-emerald-700 hover:bg-emerald-800"
                  onClick={() => setShowPodModal(order)}
                >
                  Submit POD & Complete Order (Generate Profit Report)
                </Button>
              )}

              {order.status === 'COMPLETED' && (
                <span className="text-xs font-semibold text-emerald-700 bg-emerald-50 px-3 py-1 rounded border border-emerald-200 inline-flex items-center gap-1.5">
                  <SparklesIcon className="w-3.5 h-3.5" />
                  Profit Report Generated
                </span>
              )}
            </div>
          </div>
        ))}
      </div>

      {/* Proof of Delivery Modal */}
      {showPodModal && (
        <div className="fixed inset-0 z-50 bg-black/50 flex items-center justify-center p-4">
          <div className="bg-white rounded-md max-w-md w-full p-6 space-y-4 shadow-xl border border-slate-200">
            <div className="flex justify-between items-center border-b pb-3">
              <h3 className="text-base font-bold text-slate-800">Complete Order & Confirm POD</h3>
              <button onClick={() => setShowPodModal(null)} className="text-slate-400 hover:text-slate-600">
                <CloseIcon className="w-4 h-4" />
              </button>
            </div>
            <form onSubmit={handleCompleteWithPod} className="space-y-3">
              <div className="p-3 bg-emerald-50 rounded-md border border-emerald-200 text-xs text-emerald-900 space-y-1">
                <span className="font-bold flex items-center gap-1.5">
                  <SparklesIcon className="w-3.5 h-3.5 text-emerald-700" />
                  Closes the loop from Cultivate → Sell:
                </span>
                <p>
                  Marking this order COMPLETED triggers the automated <strong>Profit Report Engine</strong> using the actual agreed sale price (₹{showPodModal.agreedPricePerKg}/kg) vs recorded cultivation expenses.
                </p>
              </div>

              <div className="p-3 bg-slate-50 border border-slate-200 rounded-md text-xs space-y-1">
                <span className="font-semibold text-slate-700 block">Proof of Delivery Document / Photo:</span>
                <div className="h-16 bg-white border border-dashed border-slate-300 rounded flex items-center justify-center text-xs text-emerald-700 font-semibold cursor-pointer gap-1.5">
                  <FileTextIcon className="w-4 h-4" />
                  <span>delivery-receipt-signed.pdf (Attached)</span>
                </div>
              </div>

              <Input
                label="Delivery Confirmation Note"
                value={podNote}
                onChange={(e) => setPodNote(e.target.value)}
                placeholder="e.g. Weighbridge slip & inspection grade verified at distribution center."
                id="podNote"
              />

              <div className="pt-2 flex justify-end gap-2">
                <Button variant="outline" type="button" onClick={() => setShowPodModal(null)}>Cancel</Button>
                <Button type="submit">Confirm POD & Generate Profit Report</Button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
