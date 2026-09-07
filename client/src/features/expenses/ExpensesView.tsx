import React, { useState, useEffect } from 'react';
import { Button, Input } from '../../components/ui/index.js';

export default function ExpensesView() {
  const [expenses, setExpenses] = useState<any[]>([]);
  const [costSummary, setCostSummary] = useState<any | null>(null);
  const [showAddModal, setShowAddModal] = useState(false);

  // Form state
  const [category, setCategory] = useState('FERTILIZER');
  const [amount, setAmount] = useState('');
  const [date, setDate] = useState(new Date().toISOString().split('T')[0]);
  const [vendor, setVendor] = useState('');
  const [notes, setNotes] = useState('');

  const loadData = () => {
    fetch('http://localhost:8000/api/v1/expenses')
      .then((r) => r.json())
      .then((d) => {
        if (d.success) setExpenses(d.data);
      })
      .catch(() => {});

    fetch('http://localhost:8000/api/v1/crop-cycles/cc-01/cost-summary')
      .then((r) => r.json())
      .then((d) => {
        if (d.success) setCostSummary(d.data);
      })
      .catch(() => {});
  };

  useEffect(() => {
    loadData();
  }, []);

  const handleAddExpense = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      const res = await fetch('http://localhost:8000/api/v1/expenses', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          cropCycleId: 'cc-01',
          farmId: 'farm-01',
          plotId: 'plot-01',
          category,
          amount: Number(amount),
          date,
          vendor,
          notes,
        }),
      });
      const data = await res.json();
      if (data.success) {
        setShowAddModal(false);
        setAmount('');
        setVendor('');
        setNotes('');
        loadData();
      }
    } catch {}
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2 mb-1">
            <h1 className="text-xl font-bold text-slate-800 tracking-tight">
              Expense Management & Cost Basis Engine (Prompt 7)
            </h1>
            <span className="px-2 py-0.5 rounded text-[10px] font-bold uppercase bg-emerald-100 text-emerald-800 border border-emerald-300">
              Core Differentiator
            </span>
          </div>
          <p className="text-xs text-slate-500">
            Real-time derivation: Total verified cultivation expenses ÷ harvest yield = actual cost-per-kg.
          </p>
        </div>
        <Button onClick={() => setShowAddModal(true)} className="text-xs">
          + Log Field Expense
        </Button>
      </div>

      {/* Hero: The Cost Basis Aggregation Card */}
      {costSummary && (
        <div className="bg-gradient-to-br from-white to-emerald-50/40 p-6 rounded-2xl border-2 border-emerald-300 shadow-sm space-y-4">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 pb-3 border-b border-emerald-200">
            <div>
              <span className="text-[10px] font-bold uppercase tracking-wider text-emerald-800">
                Shared Cost-Basis Service Output • Plot A (Bhagwa Pomegranate)
              </span>
              <h2 className="text-xl font-extrabold text-slate-800 mt-0.5">
                Real Cultivation Cost Basis:{' '}
                <span className="text-emerald-700">₹{costSummary.costPerKg}</span>
                <span className="text-xs font-normal text-slate-500"> / kg</span>
              </h2>
            </div>
            <div className="text-right">
              <span className="text-xs text-slate-500">Harvested Quantity:</span>
              <p className="text-sm font-bold text-slate-800">{costSummary.harvestQuantityKg?.toLocaleString()} kg</p>
            </div>
          </div>

          {/* 4 Stat Cards */}
          <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 text-center">
            <div className="bg-white p-3 rounded-xl border border-slate-200 shadow-xs">
              <span className="text-[10px] font-bold text-slate-400 uppercase">Summed Cultivation Cost</span>
              <p className="text-lg font-bold text-slate-800 mt-1">₹{costSummary.totalExpense?.toLocaleString()}</p>
            </div>
            <div className="bg-white p-3 rounded-xl border border-slate-200 shadow-xs">
              <span className="text-[10px] font-bold text-slate-400 uppercase">Cost Per Acre</span>
              <p className="text-lg font-bold text-slate-800 mt-1">₹{costSummary.costPerAcre?.toLocaleString()}</p>
            </div>
            <div className="bg-white p-3 rounded-xl border border-emerald-400 bg-emerald-50/50 shadow-xs">
              <span className="text-[10px] font-bold text-emerald-800 uppercase">Verified Cost Basis</span>
              <p className="text-lg font-bold text-emerald-900 mt-1">₹{costSummary.costPerKg} / kg</p>
            </div>
            <div className="bg-white p-3 rounded-xl border border-slate-200 shadow-xs">
              <span className="text-[10px] font-bold text-slate-400 uppercase">Mandi Benchmark</span>
              <p className="text-lg font-bold text-blue-700 mt-1">₹68.50 / kg</p>
            </div>
          </div>

          {/* Category breakdown bars */}
          {costSummary.categoryBreakdown && (
            <div className="space-y-2 pt-1">
              <span className="text-xs font-bold text-slate-700 uppercase tracking-wider">
                Cost Breakdown by Category
              </span>
              <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-6 gap-2">
                {Object.entries(costSummary.categoryBreakdown).map(([cat, amt]: [string, any]) => {
                  const pct = Math.round((amt / costSummary.totalExpense) * 100);
                  return (
                    <div key={cat} className="bg-white p-2.5 rounded-lg border border-slate-200 text-xs">
                      <div className="flex justify-between items-center text-[10px] text-slate-500 font-semibold uppercase">
                        <span>{cat}</span>
                        <span>{pct}%</span>
                      </div>
                      <p className="text-sm font-bold text-slate-800 mt-0.5">₹{amt.toLocaleString()}</p>
                    </div>
                  );
                })}
              </div>
            </div>
          )}
        </div>
      )}

      {/* Expenses Table */}
      <div className="bg-white rounded-2xl border border-slate-200 shadow-sm overflow-hidden">
        <div className="px-6 py-4 border-b border-slate-200 flex items-center justify-between">
          <h3 className="text-sm font-bold text-slate-800">
            Recorded Cultivation Expenses ({expenses.length} Entries)
          </h3>
          <span className="text-xs text-slate-500">
            Source of Truth for Listing Cost-Per-Kg
          </span>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-xs text-left text-slate-600">
            <thead className="text-[10px] font-bold text-slate-400 uppercase bg-slate-50 border-b border-slate-200">
              <tr>
                <th className="px-6 py-3">Category</th>
                <th className="px-6 py-3">Amount</th>
                <th className="px-6 py-3">Date</th>
                <th className="px-6 py-3">Vendor / Depot</th>
                <th className="px-6 py-3">Source</th>
                <th className="px-6 py-3">Notes</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {expenses.map((exp) => (
                <tr key={exp.id} className="hover:bg-slate-50/80 transition">
                  <td className="px-6 py-3.5 font-bold text-slate-800 flex items-center gap-2">
                    <span className="w-2 h-2 rounded-full bg-emerald-500" />
                    {exp.category}
                  </td>
                  <td className="px-6 py-3.5 font-bold text-slate-900">
                    ₹{exp.amount.toLocaleString()}
                  </td>
                  <td className="px-6 py-3.5">
                    {new Date(exp.date).toLocaleDateString()}
                  </td>
                  <td className="px-6 py-3.5 text-slate-700">
                    {exp.vendor || '—'}
                  </td>
                  <td className="px-6 py-3.5">
                    <span
                      className={`px-2 py-0.5 rounded text-[10px] font-bold uppercase ${
                        exp.source === 'INVENTORY_CONSUMPTION'
                          ? 'bg-blue-100 text-blue-800'
                          : exp.source === 'TASK_LABOUR'
                          ? 'bg-amber-100 text-amber-800'
                          : 'bg-slate-100 text-slate-700'
                      }`}
                    >
                      {exp.source.replace('_', ' ')}
                    </span>
                  </td>
                  <td className="px-6 py-3.5 text-slate-500 truncate max-w-xs">
                    {exp.notes || '—'}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* Add Expense Modal */}
      {showAddModal && (
        <div className="fixed inset-0 z-50 bg-black/50 flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl max-w-md w-full p-6 space-y-4 shadow-xl">
            <div className="flex justify-between items-center border-b pb-3">
              <h3 className="text-base font-bold text-slate-800">Log Field Expense</h3>
              <button onClick={() => setShowAddModal(false)} className="text-slate-400 hover:text-slate-600">✕</button>
            </div>
            <form onSubmit={handleAddExpense} className="space-y-3">
              <div className="grid grid-cols-2 gap-2">
                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1">Category</label>
                  <select
                    value={category}
                    onChange={(e) => setCategory(e.target.value)}
                    className="w-full text-xs px-3 py-2 border rounded-lg"
                  >
                    <option value="SEEDS">Seeds / Saplings</option>
                    <option value="FERTILIZER">Fertilizer & Nutrients</option>
                    <option value="PESTICIDE">Pesticides & Bio-control</option>
                    <option value="LABOUR">Field Labour</option>
                    <option value="MACHINERY">Machinery & Tractor</option>
                    <option value="FUEL">Diesel & Fuel</option>
                    <option value="ELECTRICITY">Electricity & Pump</option>
                    <option value="WATER">Water / Canal Charges</option>
                    <option value="STORAGE">Storage & Crates</option>
                    <option value="TRANSPORT">Transport & Freight</option>
                    <option value="OTHER">Other Expense</option>
                  </select>
                </div>
                <Input label="Expense Amount (₹)" type="number" value={amount} onChange={(e) => setAmount(e.target.value)} required placeholder="e.g. 25000" id="amount" />
              </div>

              <div className="grid grid-cols-2 gap-2">
                <Input label="Date" type="date" value={date} onChange={(e) => setDate(e.target.value)} required id="date" />
                <Input label="Vendor / Supplier" value={vendor} onChange={(e) => setVendor(e.target.value)} placeholder="e.g. Nashik Agro Depot" id="vendor" />
              </div>

              <Input label="Description & Notes" value={notes} onChange={(e) => setNotes(e.target.value)} placeholder="e.g. 10 bags organic manure applied to rows 1-20" id="notes" />

              <div className="pt-2 flex justify-end gap-2">
                <Button variant="outline" type="button" onClick={() => setShowAddModal(false)}>Cancel</Button>
                <Button type="submit">Log & Recalculate Cost</Button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
