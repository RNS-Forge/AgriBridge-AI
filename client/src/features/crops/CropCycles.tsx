import React, { useState, useEffect } from 'react';
import { Button, Input, PlantIcon, CheckCircleIcon, CloseIcon } from '../../components/ui/index.js';

const STAGES = [
  'SOWING',
  'GERMINATION',
  'VEGETATIVE',
  'FLOWERING',
  'FRUIT_DEVELOPMENT',
  'MATURITY',
  'HARVEST',
];

export default function CropCycles() {
  const [cropCycles, setCropCycles] = useState<any[]>([]);
  const [selectedCycle, setSelectedCycle] = useState<any | null>(null);
  const [showStartModal, setShowStartModal] = useState(false);
  const [showHarvestModal, setShowHarvestModal] = useState(false);

  // New cycle form
  const [cropName, setCropName] = useState('');
  const [variety, setVariety] = useState('');
  const [season, setSeason] = useState('Kharif 2026');
  const [sowingDate, setSowingDate] = useState('');
  const [expectedHarvestDate, setExpectedHarvestDate] = useState('');

  // Harvest form
  const [harvestDate, setHarvestDate] = useState('');
  const [quantityKg, setQuantityKg] = useState('');
  const [harvestGrade, setHarvestGrade] = useState('Grade A+ (Export Ready)');
  const [harvestNotes, setHarvestNotes] = useState('');

  const loadCycles = () => {
    fetch('http://localhost:8000/api/v1/crop-cycles')
      .then((r) => r.json())
      .then((d) => {
        if (d.success) {
          setCropCycles(d.data);
          if (!selectedCycle && d.data.length > 0) {
            setSelectedCycle(d.data[0]);
          } else if (selectedCycle) {
            const updated = d.data.find((c: any) => c.id === selectedCycle.id);
            if (updated) setSelectedCycle(updated);
          }
        }
      })
      .catch(() => {});
  };

  useEffect(() => {
    loadCycles();
  }, []);

  const handleAdvanceStage = async (cycleId: string, nextStage: string) => {
    try {
      const res = await fetch(`http://localhost:8000/api/v1/crop-cycles/${cycleId}/stage`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ stage: nextStage }),
      });
      const data = await res.json();
      if (data.success) {
        loadCycles();
      }
    } catch {}
  };

  const handleStartCycle = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      const res = await fetch('http://localhost:8000/api/v1/crop-cycles', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          plotId: 'plot-01',
          farmId: 'farm-01',
          cropName,
          variety,
          season,
          sowingDate,
          expectedHarvestDate,
        }),
      });
      const data = await res.json();
      if (data.success) {
        setShowStartModal(false);
        setCropName('');
        setVariety('');
        loadCycles();
      }
    } catch {}
  };

  const handleRecordHarvest = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedCycle) return;
    try {
      const res = await fetch(`http://localhost:8000/api/v1/crop-cycles/${selectedCycle.id}/harvest`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          harvestDate,
          quantityKg: Number(quantityKg),
          grade: harvestGrade,
          notes: harvestNotes,
        }),
      });
      const data = await res.json();
      if (data.success) {
        setShowHarvestModal(false);
        setQuantityKg('');
        setHarvestNotes('');
        loadCycles();
      }
    } catch {}
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h1 className="text-xl font-bold text-slate-800 tracking-tight">
            Crop Lifecycle & Harvest Tracking (Prompt 4)
          </h1>
          <p className="text-xs text-slate-500 mt-0.5">
            Stage progression and harvest records feed directly into real-time cost-per-kg calculations.
          </p>
        </div>
        <Button onClick={() => setShowStartModal(true)} className="text-xs">
          + Start New Crop Cycle
        </Button>
      </div>

      {/* Grid: Left list of cycles, Right stage tracker & harvest recording */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Cycles list */}
        <div className="space-y-3">
          <h2 className="text-xs font-bold uppercase tracking-wider text-slate-500">
            Recorded Cycles ({cropCycles.length})
          </h2>
          {cropCycles.map((c) => {
            const isSelected = selectedCycle?.id === c.id;
            return (
              <div
                key={c.id}
                onClick={() => setSelectedCycle(c)}
                className={`p-4 rounded-md border cursor-pointer transition ${
                  isSelected
                    ? 'bg-emerald-50/80 border-emerald-500 shadow-sm ring-1 ring-emerald-500/30'
                    : 'bg-white border-slate-200 hover:border-slate-300'
                }`}
              >
                <div className="flex items-center justify-between">
                  <h3 className="text-sm font-bold text-slate-800">{c.cropName}</h3>
                  <span
                    className={`text-[10px] font-bold px-2 py-0.5 rounded uppercase ${
                      c.status === 'HARVESTED'
                        ? 'bg-emerald-100 text-emerald-800'
                        : 'bg-blue-100 text-blue-800'
                    }`}
                  >
                    {c.status}
                  </span>
                </div>
                <p className="text-xs text-slate-500 mt-1">
                  Variety: <strong>{c.variety || 'Standard'}</strong> • Season: {c.season}
                </p>
                <div className="flex items-center justify-between text-[11px] text-slate-600 mt-3 pt-2 border-t border-slate-100">
                  <span>Stage: <strong className="text-emerald-700">{c.currentStage}</strong></span>
                  {c.costSummary?.costPerKg ? (
                    <span className="font-bold text-emerald-800 bg-emerald-100/70 px-2 py-0.5 rounded">
                      ₹{c.costSummary.costPerKg} / kg
                    </span>
                  ) : (
                    <span className="text-slate-400">Harvest Pending</span>
                  )}
                </div>
              </div>
            );
          })}
        </div>

        {/* Selected Cycle Detail */}
        <div className="lg:col-span-2 space-y-4">
          {selectedCycle ? (
            <div className="bg-white p-6 rounded-md border border-slate-200 shadow-sm space-y-6">
              {/* Header */}
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-3 border-b border-slate-100">
                <div>
                  <div className="flex items-center gap-2">
                    <h2 className="text-lg font-bold text-slate-800">{selectedCycle.cropName}</h2>
                    <span className="text-xs font-semibold text-slate-500">({selectedCycle.variety})</span>
                  </div>
                  <p className="text-xs text-slate-500 mt-0.5">
                    Plot A • Sown: {new Date(selectedCycle.sowingDate).toLocaleDateString()} • Exp. Harvest: {new Date(selectedCycle.expectedHarvestDate).toLocaleDateString()}
                  </p>
                </div>
                {selectedCycle.status !== 'HARVESTED' && (
                  <Button
                    onClick={() => setShowHarvestModal(true)}
                    className="text-xs bg-emerald-700 hover:bg-emerald-800 self-start inline-flex items-center gap-1.5"
                  >
                    <PlantIcon className="w-3.5 h-3.5" />
                    Record Actual Harvest
                  </Button>
                )}
              </div>

              {/* Visual Stage Progression Stepper */}
              <div className="space-y-3 bg-slate-50 p-4 rounded-md border border-slate-200">
                <div className="flex items-center justify-between">
                  <h3 className="text-xs font-bold uppercase tracking-wider text-slate-700">
                    Growth Stage Stepper (Manual Timestamp Progression)
                  </h3>
                  <span className="text-xs font-bold text-emerald-800 bg-emerald-100 px-2.5 py-0.5 rounded">
                    Current: {selectedCycle.currentStage}
                  </span>
                </div>

                {/* Horizontal Stepper */}
                <div className="grid grid-cols-7 gap-1.5 pt-2 text-center">
                  {STAGES.map((stg, idx) => {
                    const currentIdx = STAGES.indexOf(selectedCycle.currentStage);
                    const isPassed = idx <= currentIdx;
                    const isCurrent = idx === currentIdx;
                    return (
                      <div key={stg} className="flex flex-col items-center space-y-1">
                        <div
                          className={`w-7 h-7 rounded text-[11px] font-bold flex items-center justify-center transition-all ${
                            isCurrent
                              ? 'bg-emerald-700 text-white ring-2 ring-emerald-200 scale-105'
                              : isPassed
                              ? 'bg-emerald-500 text-white'
                              : 'bg-slate-200 text-slate-500'
                          }`}
                        >
                          {isPassed && !isCurrent ? <CheckCircleIcon className="w-3.5 h-3.5" /> : idx + 1}
                        </div>
                        <span
                          className={`text-[9px] uppercase font-semibold leading-tight line-clamp-2 ${
                            isCurrent ? 'text-emerald-800 font-bold' : isPassed ? 'text-slate-700' : 'text-slate-400'
                          }`}
                        >
                          {stg.replace('_', ' ')}
                        </span>
                      </div>
                    );
                  })}
                </div>

                {/* Next Stage Button */}
                {selectedCycle.status !== 'HARVESTED' && (
                  <div className="pt-2 flex justify-end">
                    {(() => {
                      const curIdx = STAGES.indexOf(selectedCycle.currentStage);
                      if (curIdx < STAGES.length - 1) {
                        const nextStage = STAGES[curIdx + 1];
                        return (
                          <Button
                            variant="secondary"
                            className="text-xs"
                            onClick={() => handleAdvanceStage(selectedCycle.id, nextStage)}
                          >
                            Advance to {nextStage.replace('_', ' ')} →
                          </Button>
                        );
                      }
                      return null;
                    })()}
                  </div>
                )}
              </div>

              {/* Harvest Record & Cost Differentiator Summary */}
              {selectedCycle.status === 'HARVESTED' ? (
                <div className="p-4 rounded-md bg-emerald-50/60 border border-emerald-300 space-y-3">
                  <div className="flex items-center justify-between">
                    <h4 className="text-xs font-bold text-emerald-900 uppercase tracking-wider">
                      Verified Harvest Record & Cost Basis
                    </h4>
                    <span className="text-xs font-bold text-emerald-800">
                      Harvested on: {new Date(selectedCycle.actualHarvestDate).toLocaleDateString()}
                    </span>
                  </div>

                  <div className="grid grid-cols-3 gap-3 text-center">
                    <div className="bg-white p-3 rounded border border-slate-200">
                      <span className="text-[10px] text-slate-400 uppercase font-bold">Total Harvest Yield</span>
                      <p className="text-lg font-bold text-slate-800">
                        {selectedCycle.harvestedQuantityKg?.toLocaleString()} kg
                      </p>
                    </div>
                    <div className="bg-white p-3 rounded border border-slate-200">
                      <span className="text-[10px] text-slate-400 uppercase font-bold">Quality Grade</span>
                      <p className="text-sm font-bold text-emerald-800 mt-1">{selectedCycle.harvestGrade}</p>
                    </div>
                    <div className="bg-white p-3 rounded border border-emerald-400 bg-emerald-50">
                      <span className="text-[10px] text-emerald-700 uppercase font-bold">Derived Cost Per Kg</span>
                      <p className="text-lg font-bold text-emerald-900">
                        ₹{selectedCycle.costSummary?.costPerKg}
                      </p>
                    </div>
                  </div>

                  {selectedCycle.notes && (
                    <p className="text-xs text-slate-600 bg-white p-2.5 rounded border border-emerald-200 italic">
                      "{selectedCycle.notes}"
                    </p>
                  )}
                </div>
              ) : (
                <div className="p-4 rounded-md bg-slate-50 border border-slate-200 text-xs text-slate-600 flex items-center justify-between">
                  <span>
                    Running expenses to-date:{' '}
                    <strong>₹{selectedCycle.costSummary?.totalExpense?.toLocaleString()}</strong>
                  </span>
                  <span className="text-slate-400 italic">Record harvest to unlock exact cost-per-kg</span>
                </div>
              )}
            </div>
          ) : (
            <div className="p-8 text-center bg-white rounded-md border border-slate-200">
              <p className="text-sm text-slate-500">Select a crop cycle to view its growth stages and harvest data.</p>
            </div>
          )}
        </div>
      </div>

      {/* Start New Cycle Modal */}
      {showStartModal && (
        <div className="fixed inset-0 z-50 bg-black/50 flex items-center justify-center p-4">
          <div className="bg-white rounded-md max-w-md w-full p-6 space-y-4 shadow-xl border border-slate-200">
            <div className="flex justify-between items-center border-b pb-3">
              <h3 className="text-base font-bold text-slate-800">Start New Crop Cycle</h3>
              <button onClick={() => setShowStartModal(false)} className="text-slate-400 hover:text-slate-600">
                <CloseIcon className="w-4 h-4" />
              </button>
            </div>
            <form onSubmit={handleStartCycle} className="space-y-3">
              <Input label="Crop Name" value={cropName} onChange={(e) => setCropName(e.target.value)} required placeholder="e.g. Thompson Grapes, Soyabean" id="cropName" />
              <Input label="Variety / Cultivar" value={variety} onChange={(e) => setVariety(e.target.value)} placeholder="e.g. Export White Seedless" id="variety" />
              <Input label="Season" value={season} onChange={(e) => setSeason(e.target.value)} placeholder="e.g. Kharif 2026" id="season" />
              <div className="grid grid-cols-2 gap-2">
                <Input label="Sowing Date" type="date" value={sowingDate} onChange={(e) => setSowingDate(e.target.value)} required id="sowingDate" />
                <Input label="Exp. Harvest Date" type="date" value={expectedHarvestDate} onChange={(e) => setExpectedHarvestDate(e.target.value)} required id="expectedHarvestDate" />
              </div>
              <div className="pt-2 flex justify-end gap-2">
                <Button variant="outline" type="button" onClick={() => setShowStartModal(false)}>Cancel</Button>
                <Button type="submit">Start Cycle</Button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Record Harvest Modal */}
      {showHarvestModal && (
        <div className="fixed inset-0 z-50 bg-black/50 flex items-center justify-center p-4">
          <div className="bg-white rounded-md max-w-md w-full p-6 space-y-4 shadow-xl border border-slate-200">
            <div className="flex justify-between items-center border-b pb-3">
              <h3 className="text-base font-bold text-slate-800">Record Harvest for {selectedCycle?.cropName}</h3>
              <button onClick={() => setShowHarvestModal(false)} className="text-slate-400 hover:text-slate-600">
                <CloseIcon className="w-4 h-4" />
              </button>
            </div>
            <form onSubmit={handleRecordHarvest} className="space-y-3">
              <Input label="Harvest Date" type="date" value={harvestDate} onChange={(e) => setHarvestDate(e.target.value)} required id="harvestDate" />
              <Input label="Total Actual Quantity Harvested (kg)" type="number" step="1" value={quantityKg} onChange={(e) => setQuantityKg(e.target.value)} required placeholder="e.g. 12500" id="quantityKg" />
              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">Quality Grade</label>
                <select value={harvestGrade} onChange={(e) => setHarvestGrade(e.target.value)} className="w-full text-xs px-3 py-2 border border-slate-300 rounded-md">
                  <option value="Grade A+ (Export Ready)">Grade A+ (Export Ready)</option>
                  <option value="Grade A (Domestic Premium)">Grade A (Domestic Premium)</option>
                  <option value="Grade B (Local Mandi)">Grade B (Local Mandi)</option>
                </select>
              </div>
              <Input label="Harvest & Quality Notes" value={harvestNotes} onChange={(e) => setHarvestNotes(e.target.value)} placeholder="e.g. Excellent color, Brix 16.5, sorted into export cartons" id="harvestNotes" />
              <div className="pt-2 flex justify-end gap-2">
                <Button variant="outline" type="button" onClick={() => setShowHarvestModal(false)}>Cancel</Button>
                <Button type="submit">Save Harvest & Compute Cost</Button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
