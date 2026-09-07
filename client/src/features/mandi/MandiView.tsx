import React, { useState, useEffect } from 'react';
import { useSelector } from 'react-redux';
import { RootState } from '../../store/index.js';
import { Button, Input, ScaleIcon, CloseIcon } from '../../components/ui/index.js';

export default function MandiView() {
  const { user } = useSelector((state: RootState) => state.auth);
  const isAgent = user?.roles?.includes('MANDI_AGENT') || user?.roles?.includes('ADMIN');

  const [slots, setSlots] = useState<any[]>([]);
  const [bookings, setBookings] = useState<any[]>([]);
  const [sales, setSales] = useState<any[]>([]);
  const [showBookModal, setShowBookModal] = useState<any | null>(null);
  const [showSaleModal, setShowSaleModal] = useState<any | null>(null);
  const [showCreateSlotModal, setShowCreateSlotModal] = useState(false);

  // Farmer book slot form
  const [bookCrop, setBookCrop] = useState('Organic Pomegranate (Bhagwa)');
  const [bookQty, setBookQty] = useState('2000');

  // Agent record sale form
  const [actualQty, setActualQty] = useState('');
  const [salePrice, setSalePrice] = useState('70');
  const [grade, setGrade] = useState('Grade A');
  const [commRate, setCommRate] = useState('2.5');
  const [agentNotes, setAgentNotes] = useState('Active bidder participation at auction.');

  // Agent create slot form
  const [slotDate, setSlotDate] = useState('');
  const [slotWindow, setSlotWindow] = useState('08:00 AM — 12:00 PM');
  const [slotCap, setSlotCap] = useState('500');

  const loadMandiData = () => {
    fetch('http://localhost:8000/api/v1/mandi/slots')
      .then((r) => r.json())
      .then((d) => {
        if (d.success) setSlots(d.data);
      })
      .catch(() => {});

    fetch('http://localhost:8000/api/v1/mandi/bookings')
      .then((r) => r.json())
      .then((d) => {
        if (d.success) setBookings(d.data);
      })
      .catch(() => {});

    fetch('http://localhost:8000/api/v1/mandi/sales')
      .then((r) => r.json())
      .then((d) => {
        if (d.success) setSales(d.data);
      })
      .catch(() => {});
  };

  useEffect(() => {
    loadMandiData();
  }, []);

  const handleBookSlot = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!showBookModal) return;
    try {
      const res = await fetch(`http://localhost:8000/api/v1/mandi/slots/${showBookModal.id}/bookings`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${localStorage.getItem('token')}`,
        },
        body: JSON.stringify({
          cropName: bookCrop,
          expectedQuantityKg: Number(bookQty),
        }),
      });
      const data = await res.json();
      if (data.success) {
        setShowBookModal(null);
        loadMandiData();
      }
    } catch {}
  };

  const handleCreateSlot = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      const res = await fetch('http://localhost:8000/api/v1/mandi/slots', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${localStorage.getItem('token')}`,
        },
        body: JSON.stringify({
          mandiId: 'mandi-01',
          date: slotDate || new Date(Date.now() + 86400000).toISOString(),
          timeWindow: slotWindow,
          capacityQuintals: Number(slotCap),
        }),
      });
      const data = await res.json();
      if (data.success) {
        setShowCreateSlotModal(false);
        loadMandiData();
      }
    } catch {}
  };

  const handleConfirmBooking = async (bookingId: string, status: string) => {
    try {
      const res = await fetch(`http://localhost:8000/api/v1/mandi/bookings/${bookingId}/status`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ status }),
      });
      const data = await res.json();
      if (data.success) loadMandiData();
    } catch {}
  };

  const handleRecordSale = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!showSaleModal) return;
    try {
      const res = await fetch(`http://localhost:8000/api/v1/mandi/bookings/${showSaleModal.id}/sale`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          actualQuantityKg: Number(actualQty) || showSaleModal.expectedQuantityKg,
          auctionSalePricePerKg: Number(salePrice),
          grade,
          commissionRate: Number(commRate),
          agentNotes,
        }),
      });
      const data = await res.json();
      if (data.success) {
        setShowSaleModal(null);
        loadMandiData();
      }
    } catch {}
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h1 className="text-xl font-bold text-slate-800 tracking-tight">
            Mandi Agent & Slot Booking (Prompt 11)
          </h1>
          <p className="text-xs text-slate-500 mt-0.5">
            The alternative selling path alongside direct-to-buyer. Book arrival slots, record APMC auction price, and deduct commission.
          </p>
        </div>

        {isAgent && (
          <Button onClick={() => setShowCreateSlotModal(true)} className="text-xs">
            + Publish Arrival Slot
          </Button>
        )}
      </div>

      {/* Available Slots */}
      <div className="space-y-3">
        <h2 className="text-xs font-bold uppercase tracking-wider text-slate-500">
          Available Mandi Arrival Windows ({slots.length})
        </h2>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {slots.map((slot) => (
            <div
              key={slot.id}
              className="bg-white p-5 rounded-md border border-slate-200 shadow-sm space-y-3"
            >
              <div className="flex items-start justify-between">
                <div>
                  <h3 className="text-sm font-bold text-slate-800">
                    Nashik APMC Market Yard
                  </h3>
                  <p className="text-xs text-slate-500 mt-0.5">
                    Date: <strong>{new Date(slot.date).toLocaleDateString()}</strong> • Window: {slot.timeWindow}
                  </p>
                </div>
                <span className="text-xs font-bold text-emerald-800 bg-emerald-100 px-2.5 py-0.5 rounded">
                  {slot.status}
                </span>
              </div>

              <div className="p-3 bg-slate-50 rounded-md border border-slate-200 text-xs flex justify-between items-center">
                <span>Capacity: <strong>{slot.capacityQuintals} Quintals</strong></span>
                <span>Booked: <strong>{slot.bookedQuintals} Q</strong></span>
                <span className="text-emerald-700 font-bold">
                  Available: {slot.capacityQuintals - slot.bookedQuintals} Q
                </span>
              </div>

              <div className="flex items-center justify-between pt-1">
                <span className="text-[11px] text-slate-500">
                  Accepted: {slot.commoditiesAccepted?.join(', ') || 'Pomegranate, Grapes'}
                </span>
                <Button
                  className="text-xs px-3 py-1 bg-emerald-700 hover:bg-emerald-800"
                  onClick={() => setShowBookModal(slot)}
                >
                  Book Slot →
                </Button>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Slot Bookings & Auction Sales Management */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 pt-2">
        {/* Bookings Queue */}
        <div className="bg-white p-5 rounded-md border border-slate-200 shadow-sm space-y-3">
          <h2 className="text-sm font-bold text-slate-800 flex items-center justify-between">
            <span>Arrival Bookings ({bookings.length})</span>
            <span className="text-xs font-normal text-slate-400">Nashik Yard Gate</span>
          </h2>

          <div className="space-y-3">
            {bookings.map((b) => (
              <div
                key={b.id}
                className="p-4 rounded-md border border-slate-200 bg-slate-50/50 space-y-2.5"
              >
                <div className="flex items-center justify-between">
                  <div>
                    <h4 className="text-xs font-bold text-slate-800">{b.cropName}</h4>
                    <p className="text-[11px] text-slate-500">
                      Farmer: <strong>{b.farmerName}</strong> • {b.expectedQuantityKg?.toLocaleString()} kg
                    </p>
                  </div>
                  <span
                    className={`text-[10px] font-bold px-2 py-0.5 rounded uppercase ${
                      b.status === 'COMPLETED'
                        ? 'bg-emerald-100 text-emerald-800'
                        : b.status === 'CONFIRMED'
                        ? 'bg-blue-100 text-blue-800'
                        : 'bg-amber-100 text-amber-800'
                    }`}
                  >
                    {b.status}
                  </span>
                </div>

                {isAgent && b.status === 'REQUESTED' && (
                  <div className="flex items-center gap-2 pt-1">
                    <Button
                      className="text-xs px-3 py-1 bg-emerald-700 hover:bg-emerald-800"
                      onClick={() => handleConfirmBooking(b.id, 'CONFIRMED')}
                    >
                      Confirm Booking
                    </Button>
                    <Button
                      variant="outline"
                      className="text-xs px-3 py-1 text-red-600 border-red-200"
                      onClick={() => handleConfirmBooking(b.id, 'CANCELLED')}
                    >
                      Decline
                    </Button>
                  </div>
                )}

                {isAgent && b.status === 'CONFIRMED' && (
                  <div className="pt-1 flex justify-end">
                    <Button
                      className="text-xs bg-emerald-700 hover:bg-emerald-800 inline-flex items-center gap-1.5"
                      onClick={() => {
                        setShowSaleModal(b);
                        setActualQty(String(b.expectedQuantityKg));
                      }}
                    >
                      <ScaleIcon className="w-3.5 h-3.5" />
                      Record Actual Arrival & Auction Sale →
                    </Button>
                  </div>
                )}
              </div>
            ))}
          </div>
        </div>

        {/* Recorded Ground-Truth Sales & Payouts */}
        <div className="bg-white p-5 rounded-md border border-slate-200 shadow-sm space-y-3">
          <h2 className="text-sm font-bold text-slate-800 flex items-center justify-between">
            <span>Ground-Truth Mandi Sales ({sales.length})</span>
            <span className="text-xs font-normal text-emerald-700">Net Payouts Disbursed</span>
          </h2>

          <div className="space-y-3">
            {sales.map((s) => (
              <div
                key={s.id}
                className="p-4 rounded-md border border-emerald-200 bg-emerald-50/40 space-y-2"
              >
                <div className="flex items-center justify-between">
                  <span className="text-xs font-bold text-slate-800">{s.cropName}</span>
                  <span className="text-xs font-bold text-emerald-800 bg-white px-2 py-0.5 rounded border border-emerald-200">
                    Net Payout: ₹{s.netPayout?.toLocaleString()}
                  </span>
                </div>

                <div className="grid grid-cols-3 gap-2 text-[11px] text-slate-600 pt-1">
                  <div>
                    <span className="text-slate-400 block">Actual Qty:</span>
                    <strong>{s.actualQuantityKg} kg</strong>
                  </div>
                  <div>
                    <span className="text-slate-400 block">Auction Price:</span>
                    <strong>₹{s.auctionSalePricePerKg} / kg</strong>
                  </div>
                  <div>
                    <span className="text-slate-400 block">Commission:</span>
                    <strong>₹{s.commissionAmount} ({s.commissionRate}%)</strong>
                  </div>
                </div>

                <p className="text-[10px] text-slate-500 italic pt-1 border-t border-emerald-200/60">
                  Agent Note: "{s.agentNotes}" • Feeds Profit Report Engine directly.
                </p>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Book Slot Modal (Farmer side with cost comparison!) */}
      {showBookModal && (
        <div className="fixed inset-0 z-50 bg-black/50 flex items-center justify-center p-4">
          <div className="bg-white rounded-md max-w-md w-full p-6 space-y-4 shadow-xl border border-slate-200">
            <div className="flex justify-between items-center border-b pb-3">
              <h3 className="text-base font-bold text-slate-800">Book Mandi Arrival Slot</h3>
              <button onClick={() => setShowBookModal(null)} className="text-slate-400 hover:text-slate-600">
                <CloseIcon className="w-4 h-4" />
              </button>
            </div>
            <form onSubmit={handleBookSlot} className="space-y-3">
              {/* Cost Basis Context Banner (Prompt 11.6 - Informed Decision, Not Blind Booking!) */}
              <div className="p-3 bg-emerald-50 rounded-md border border-emerald-200 text-xs text-emerald-900 space-y-1">
                <span className="font-bold flex items-center gap-1.5">
                  <ScaleIcon className="w-3.5 h-3.5 text-emerald-700" />
                  Informed Booking Decision:
                </span>
                <p>
                  Your Cultivation Cost Basis: <strong className="text-emerald-800">₹32.96 / kg</strong>. Expected Mandi Modal Wholesale Price:{' '}
                  <strong className="text-blue-800">₹68.50 / kg</strong>.
                </p>
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">Select Harvested Crop</label>
                <select
                  value={bookCrop}
                  onChange={(e) => setBookCrop(e.target.value)}
                  className="w-full text-xs px-3 py-2 border border-slate-300 rounded-md"
                >
                  <option value="Organic Pomegranate (Bhagwa)">Organic Pomegranate (Bhagwa) — Plot A</option>
                  <option value="Thompson Seedless Grapes">Thompson Seedless Grapes — Plot B</option>
                </select>
              </div>

              <Input
                label="Expected Arrival Quantity (kg)"
                type="number"
                value={bookQty}
                onChange={(e) => setBookQty(e.target.value)}
                required
                placeholder="e.g. 2000"
                id="bookQty"
              />

              <div className="p-2.5 bg-slate-50 border border-slate-200 rounded text-xs text-slate-500">
                <span>Yard Window: {showBookModal.timeWindow} • Commission: 2.5%</span>
              </div>

              <div className="pt-2 flex justify-end gap-2">
                <Button variant="outline" type="button" onClick={() => setShowBookModal(null)}>Cancel</Button>
                <Button type="submit">Submit Slot Booking</Button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Record Mandi Sale Modal (Mandi Agent side) */}
      {showSaleModal && (
        <div className="fixed inset-0 z-50 bg-black/50 flex items-center justify-center p-4">
          <div className="bg-white rounded-md max-w-md w-full p-6 space-y-4 shadow-xl border border-slate-200">
            <div className="flex justify-between items-center border-b pb-3">
              <h3 className="text-base font-bold text-slate-800">Record Arrival & Auction Sale</h3>
              <button onClick={() => setShowSaleModal(null)} className="text-slate-400 hover:text-slate-600">
                <CloseIcon className="w-4 h-4" />
              </button>
            </div>
            <form onSubmit={handleRecordSale} className="space-y-3">
              <div className="grid grid-cols-2 gap-2">
                <Input label="Actual Quantity Delivered (kg)" type="number" value={actualQty} onChange={(e) => setActualQty(e.target.value)} required id="actualQty" />
                <Input label="Final Auction Price (₹/kg)" type="number" step="0.5" value={salePrice} onChange={(e) => setSalePrice(e.target.value)} required id="salePrice" />
              </div>

              <div className="grid grid-cols-2 gap-2">
                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1">Grading</label>
                  <select value={grade} onChange={(e) => setGrade(e.target.value)} className="w-full text-xs px-3 py-2 border border-slate-300 rounded-md">
                    <option value="Grade A">Grade A</option>
                    <option value="Grade B">Grade B</option>
                    <option value="Grade C">Grade C</option>
                  </select>
                </div>
                <Input label="Commission Rate (%)" type="number" step="0.1" value={commRate} onChange={(e) => setCommRate(e.target.value)} id="commRate" />
              </div>

              {actualQty && salePrice && (
                <div className="p-3 bg-emerald-50 rounded-md border border-emerald-200 text-xs space-y-1">
                  <div className="flex justify-between">
                    <span className="text-slate-500">Gross Auction Value:</span>
                    <strong className="text-slate-800">
                      ₹{(Number(actualQty) * Number(salePrice)).toLocaleString()}
                    </strong>
                  </div>
                  <div className="flex justify-between text-emerald-800 font-bold">
                    <span>Farmer Net Payout (Post-Commission):</span>
                    <span>
                      ₹{(Number(actualQty) * Number(salePrice) * (1 - Number(commRate) / 100)).toLocaleString()}
                    </span>
                  </div>
                </div>
              )}

              <Input label="Auction Remarks" value={agentNotes} onChange={(e) => setAgentNotes(e.target.value)} id="agentNotes" />

              <div className="pt-2 flex justify-end gap-2">
                <Button variant="outline" type="button" onClick={() => setShowSaleModal(null)}>Cancel</Button>
                <Button type="submit">Record Sale & Generate Profit Report</Button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Publish Slot Modal (Agent) */}
      {showCreateSlotModal && (
        <div className="fixed inset-0 z-50 bg-black/50 flex items-center justify-center p-4">
          <div className="bg-white rounded-md max-w-md w-full p-6 space-y-4 shadow-xl border border-slate-200">
            <div className="flex justify-between items-center border-b pb-3">
              <h3 className="text-base font-bold text-slate-800">Publish Mandi Arrival Slot</h3>
              <button onClick={() => setShowCreateSlotModal(false)} className="text-slate-400 hover:text-slate-600">
                <CloseIcon className="w-4 h-4" />
              </button>
            </div>
            <form onSubmit={handleCreateSlot} className="space-y-3">
              <Input label="Slot Date" type="date" value={slotDate} onChange={(e) => setSlotDate(e.target.value)} required id="slotDate" />
              <Input label="Arrival Window" value={slotWindow} onChange={(e) => setSlotWindow(e.target.value)} required placeholder="e.g. 07:30 AM — 11:30 AM" id="slotWindow" />
              <Input label="Total Capacity (Quintals)" type="number" value={slotCap} onChange={(e) => setSlotCap(e.target.value)} required placeholder="e.g. 500" id="slotCap" />

              <div className="pt-2 flex justify-end gap-2">
                <Button variant="outline" type="button" onClick={() => setShowCreateSlotModal(false)}>Cancel</Button>
                <Button type="submit">Publish Window</Button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
