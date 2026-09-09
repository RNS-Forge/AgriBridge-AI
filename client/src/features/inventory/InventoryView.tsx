import React, { useState, useEffect } from 'react';
import { Button, Input, AlertTriangleIcon, CloseIcon, SparklesIcon } from '../../components/ui/index.js';

export default function InventoryView() {
  const [items, setItems] = useState<any[]>([]);
  const [showAddModal, setShowAddModal] = useState(false);
  const [showConsumeModal, setShowConsumeModal] = useState<any | null>(null);

  // Add Item form
  const [name, setName] = useState('');
  const [category, setCategory] = useState('FERTILIZER');
  const [unit, setUnit] = useState('Bag (25kg)');
  const [currentStock, setCurrentStock] = useState('');
  const [averageUnitCost, setAverageUnitCost] = useState('');
  const [lowStockThreshold, setLowStockThreshold] = useState('10');

  // Consume form
  const [consumeQty, setConsumeQty] = useState('');
  const [consumeCropCycle, setConsumeCropCycle] = useState('cc-01');

  const loadItems = () => {
    fetch('http://localhost:8000/api/v1/inventory/items')
      .then((r) => r.json())
      .then((d) => {
        if (d.success) setItems(d.data);
      })
      .catch(() => {});
  };

  useEffect(() => {
    loadItems();
  }, []);

  const handleAddItem = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      const res = await fetch('http://localhost:8000/api/v1/inventory/items', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          name,
          category,
          unit,
          currentStock: Number(currentStock),
          averageUnitCost: Number(averageUnitCost),
          lowStockThreshold: Number(lowStockThreshold),
        }),
      });
      const data = await res.json();
      if (data.success) {
        setShowAddModal(false);
        setName('');
        setCurrentStock('');
        setAverageUnitCost('');
        loadItems();
      }
    } catch {}
  };

  const handleConsume = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!showConsumeModal) return;
    try {
      const res = await fetch('http://localhost:8000/api/v1/inventory/transactions', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          itemId: showConsumeModal.id,
          type: 'CONSUMPTION',
          quantity: Number(consumeQty),
          unitCost: showConsumeModal.averageUnitCost,
          cropCycleId: consumeCropCycle,
        }),
      });
      const data = await res.json();
      if (data.success) {
        setShowConsumeModal(null);
        setConsumeQty('');
        loadItems();
      }
    } catch {}
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h1 className="text-xl font-bold text-slate-800 tracking-tight">
            Inventory & Consumables
          </h1>
          <p className="text-xs text-slate-500 mt-0.5">
            Track seeds, fertilizers, and pesticides. Logging consumption against a crop cycle automatically creates linked expense entries.
          </p>
        </div>
        <Button onClick={() => setShowAddModal(true)} className="text-xs">
          + Add Inventory Item
        </Button>
      </div>

      {/* Grid of Items */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {items.map((item) => (
          <div
            key={item.id}
            className={`p-5 rounded-md border shadow-sm flex flex-col justify-between space-y-3 ${
              item.isLowStock
                ? 'bg-amber-50/40 border-amber-300'
                : 'bg-white border-slate-200'
            }`}
          >
            <div>
              <div className="flex items-start justify-between gap-2">
                <h3 className="text-sm font-bold text-slate-800">{item.name}</h3>
                <span className="text-[10px] font-bold px-2 py-0.5 rounded bg-slate-100 text-slate-700">
                  {item.category}
                </span>
              </div>

              <div className="mt-3 grid grid-cols-2 gap-2 text-xs">
                <div className="p-2.5 rounded-md bg-slate-50 border border-slate-100">
                  <span className="text-[10px] text-slate-400 uppercase font-semibold">Current Stock</span>
                  <p className="text-base font-bold text-slate-800 mt-0.5">
                    {item.currentStock} <span className="text-xs font-normal text-slate-500">{item.unit}</span>
                  </p>
                </div>
                <div className="p-2.5 rounded-md bg-slate-50 border border-slate-100">
                  <span className="text-[10px] text-slate-400 uppercase font-semibold">Avg Unit Cost</span>
                  <p className="text-base font-bold text-slate-800 mt-0.5">
                    ₹{item.averageUnitCost}
                  </p>
                </div>
              </div>

              {item.isLowStock && (
                <div className="mt-2.5 p-2 bg-amber-100/70 border border-amber-300 rounded text-[11px] text-amber-900 font-semibold flex items-center gap-1.5">
                  <AlertTriangleIcon className="w-3.5 h-3.5 text-amber-700 shrink-0" />
                  <span>Low Stock Alert: Below threshold ({item.lowStockThreshold} {item.unit})</span>
                </div>
              )}
            </div>

            <div className="pt-2 border-t border-slate-100 flex items-center justify-between">
              <span className="text-[11px] text-slate-500">
                Threshold: {item.lowStockThreshold} {item.unit}
              </span>
              <Button
                variant="outline"
                className="text-xs px-3 py-1 text-emerald-700 border-emerald-300 hover:bg-emerald-50"
                onClick={() => setShowConsumeModal(item)}
              >
                Log Consumption →
              </Button>
            </div>
          </div>
        ))}
      </div>

      {/* Add Item Modal */}
      {showAddModal && (
        <div className="fixed inset-0 z-50 bg-black/50 flex items-center justify-center p-4">
          <div className="bg-white rounded-md max-w-md w-full p-6 space-y-4 shadow-xl border border-slate-200">
            <div className="flex justify-between items-center border-b pb-3">
              <h3 className="text-base font-bold text-slate-800">Add Inventory Stock</h3>
              <button onClick={() => setShowAddModal(false)} className="text-slate-400 hover:text-slate-600">
                <CloseIcon className="w-4 h-4" />
              </button>
            </div>
            <form onSubmit={handleAddItem} className="space-y-3">
              <Input label="Item Name" value={name} onChange={(e) => setName(e.target.value)} required placeholder="e.g. Soluble Sulfate of Potash 0-0-50" id="name" />
              <div className="grid grid-cols-2 gap-2">
                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1">Category</label>
                  <select value={category} onChange={(e) => setCategory(e.target.value)} className="w-full text-xs px-3 py-2 border border-slate-300 rounded-md">
                    <option value="FERTILIZER">Fertilizer</option>
                    <option value="PESTICIDE">Pesticide</option>
                    <option value="SEEDS">Seeds</option>
                    <option value="FUEL">Fuel / Diesel</option>
                    <option value="PACKAGING">Packaging</option>
                  </select>
                </div>
                <Input label="Unit" value={unit} onChange={(e) => setUnit(e.target.value)} placeholder="e.g. Bag (25kg), Litre" id="unit" />
              </div>
              <div className="grid grid-cols-3 gap-2">
                <Input label="Quantity" type="number" value={currentStock} onChange={(e) => setCurrentStock(e.target.value)} required id="currentStock" />
                <Input label="Unit Cost (₹)" type="number" value={averageUnitCost} onChange={(e) => setAverageUnitCost(e.target.value)} required id="averageUnitCost" />
                <Input label="Alert Level" type="number" value={lowStockThreshold} onChange={(e) => setLowStockThreshold(e.target.value)} id="lowStockThreshold" />
              </div>
              <div className="pt-2 flex justify-end gap-2">
                <Button variant="outline" type="button" onClick={() => setShowAddModal(false)}>Cancel</Button>
                <Button type="submit">Save Stock</Button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Log Consumption Modal (Auto Generates Expense!) */}
      {showConsumeModal && (
        <div className="fixed inset-0 z-50 bg-black/50 flex items-center justify-center p-4">
          <div className="bg-white rounded-md max-w-md w-full p-6 space-y-4 shadow-xl border border-slate-200">
            <div className="flex justify-between items-center border-b pb-3">
              <h3 className="text-base font-bold text-slate-800">
                Log Consumption: {showConsumeModal.name}
              </h3>
              <button onClick={() => setShowConsumeModal(null)} className="text-slate-400 hover:text-slate-600">
                <CloseIcon className="w-4 h-4" />
              </button>
            </div>
            <form onSubmit={handleConsume} className="space-y-3">
              <div className="p-3 bg-emerald-50 rounded-md border border-emerald-200 text-xs text-emerald-900 space-y-1">
                <span className="font-bold flex items-center gap-1.5">
                  <SparklesIcon className="w-3.5 h-3.5 text-emerald-700" />
                  Auto-Expense Integration:
                </span>
                <p className="leading-relaxed">
                  Logging consumption against a crop cycle automatically creates a linked expense entry (Quantity × Average Unit Cost: ₹{showConsumeModal.averageUnitCost}) so you never double-enter costs.
                </p>
              </div>

              <Input
                label={`Quantity to Consume (${showConsumeModal.unit})`}
                type="number"
                step="0.1"
                value={consumeQty}
                onChange={(e) => setConsumeQty(e.target.value)}
                required
                placeholder={`Max available: ${showConsumeModal.currentStock}`}
                id="consumeQty"
              />

              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">Link to Crop Cycle</label>
                <select
                  value={consumeCropCycle}
                  onChange={(e) => setConsumeCropCycle(e.target.value)}
                  className="w-full text-xs px-3 py-2 border border-slate-300 rounded-md"
                >
                  <option value="cc-01">Plot A • Organic Pomegranate (Bhagwa)</option>
                  <option value="cc-02">Plot B • Thompson Seedless Grapes</option>
                </select>
              </div>

              {consumeQty && (
                <div className="p-2 bg-slate-50 border border-slate-200 rounded text-xs flex justify-between">
                  <span className="text-slate-500">Auto-Generated Expense:</span>
                  <strong className="text-emerald-800">
                    ₹{(Number(consumeQty) * showConsumeModal.averageUnitCost).toLocaleString()}
                  </strong>
                </div>
              )}

              <div className="pt-2 flex justify-end gap-2">
                <Button variant="outline" type="button" onClick={() => setShowConsumeModal(null)}>Cancel</Button>
                <Button type="submit">Confirm Consumption & Auto-Cost</Button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
