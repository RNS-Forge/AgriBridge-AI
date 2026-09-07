import React, { useState, useEffect } from 'react';
import { Button, Input, CloseIcon } from '../../components/ui/index.js';

export default function FarmsPlots() {
  const [farms, setFarms] = useState<any[]>([]);
  const [selectedFarm, setSelectedFarm] = useState<any | null>(null);
  const [showAddFarmModal, setShowAddFarmModal] = useState(false);
  const [showAddPlotModal, setShowAddPlotModal] = useState(false);

  // New Farm form state
  const [farmName, setFarmName] = useState('');
  const [location, setLocation] = useState('');
  const [totalAreaAcres, setTotalAreaAcres] = useState('');
  const [soilType, setSoilType] = useState('Black Loamy');
  const [waterSource, setWaterSource] = useState('Borewell & Drip');
  const [ownershipType, setOwnershipType] = useState('Owned');

  // New Plot form state
  const [plotName, setPlotName] = useState('');
  const [plotArea, setPlotArea] = useState('');
  const [plotSoil, setPlotSoil] = useState('Black Loamy');
  const [plotWater, setPlotWater] = useState('Drip Irrigation');
  const [plotOwnership, setPlotOwnership] = useState('Owned');
  const [plotNotes, setPlotNotes] = useState('');

  const loadFarms = () => {
    fetch('http://localhost:8000/api/v1/farms')
      .then((r) => r.json())
      .then((d) => {
        if (d.success) {
          setFarms(d.data);
          if (!selectedFarm && d.data.length > 0) {
            setSelectedFarm(d.data[0]);
          } else if (selectedFarm) {
            const updated = d.data.find((f: any) => f.id === selectedFarm.id);
            if (updated) setSelectedFarm(updated);
          }
        }
      })
      .catch(() => {});
  };

  useEffect(() => {
    loadFarms();
  }, []);

  const handleCreateFarm = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      const res = await fetch('http://localhost:8000/api/v1/farms', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          name: farmName,
          location,
          totalAreaAcres: Number(totalAreaAcres),
          soilType,
          waterSource,
          ownershipType,
        }),
      });
      const data = await res.json();
      if (data.success) {
        setShowAddFarmModal(false);
        setFarmName('');
        setLocation('');
        setTotalAreaAcres('');
        loadFarms();
      }
    } catch {}
  };

  const handleCreatePlot = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedFarm) return;
    try {
      const res = await fetch(`http://localhost:8000/api/v1/farms/${selectedFarm.id}/plots`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          name: plotName,
          areaAcres: Number(plotArea),
          soilType: plotSoil,
          waterSource: plotWater,
          ownershipType: plotOwnership,
          notes: plotNotes,
        }),
      });
      const data = await res.json();
      if (data.success) {
        setShowAddPlotModal(false);
        setPlotName('');
        setPlotArea('');
        setPlotNotes('');
        loadFarms();
      }
    } catch {}
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h1 className="text-xl font-bold text-slate-800 tracking-tight">
            Farms & Plots Management (Prompt 3)
          </h1>
          <p className="text-xs text-slate-500 mt-0.5">
            Every crop cycle, task, and cultivation expense traces back to a specific Plot.
          </p>
        </div>
        <Button onClick={() => setShowAddFarmModal(true)} className="text-xs">
          + Add New Farm
        </Button>
      </div>

      {/* Main Grid: Left list of Farms, Right drill-down into Plots */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Farms List */}
        <div className="space-y-3">
          <h2 className="text-xs font-bold uppercase tracking-wider text-slate-500">
            My Registered Farms ({farms.length})
          </h2>
          {farms.map((farm) => {
            const isSelected = selectedFarm?.id === farm.id;
            return (
              <div
                key={farm.id}
                onClick={() => setSelectedFarm(farm)}
                className={`p-4 rounded-md border cursor-pointer transition-all duration-150 ${
                  isSelected
                    ? 'bg-emerald-50/80 border-emerald-500 shadow-sm ring-1 ring-emerald-500/30'
                    : 'bg-white border-slate-200 hover:border-slate-300'
                }`}
              >
                <div className="flex items-center justify-between">
                  <h3 className="text-sm font-bold text-slate-800">{farm.name}</h3>
                  <span className="text-[11px] font-semibold text-emerald-700 bg-emerald-100/60 px-2 py-0.5 rounded">
                    {farm.totalAreaAcres} Acres
                  </span>
                </div>
                <p className="text-xs text-slate-500 mt-1 truncate">{farm.location}</p>
                <div className="flex items-center gap-3 text-[11px] text-slate-500 mt-2.5 pt-2 border-t border-slate-100">
                  <span>Soil: <strong>{farm.soilType || 'Loamy'}</strong></span>
                  <span>Plots: <strong>{farm.plots?.length || 0}</strong></span>
                  <span>Type: <strong>{farm.ownershipType || 'Owned'}</strong></span>
                </div>
              </div>
            );
          })}
        </div>

        {/* Selected Farm Detail & Plot List */}
        <div className="lg:col-span-2 space-y-4">
          {selectedFarm ? (
            <div className="bg-white p-6 rounded-md border border-slate-200 shadow-sm space-y-5">
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-3 border-b border-slate-100">
                <div>
                  <div className="flex items-center gap-2">
                    <h2 className="text-lg font-bold text-slate-800">{selectedFarm.name}</h2>
                    <span className="px-2 py-0.5 text-[10px] font-bold uppercase tracking-wider rounded bg-emerald-100 text-emerald-800">
                      {selectedFarm.ownershipType}
                    </span>
                  </div>
                  <p className="text-xs text-slate-500 mt-0.5">{selectedFarm.location}</p>
                </div>
                <Button onClick={() => setShowAddPlotModal(true)} variant="secondary" className="text-xs self-start">
                  + Add Plot to Farm
                </Button>
              </div>

              {/* Plots Table / Cards */}
              <div className="space-y-3">
                <div className="flex items-center justify-between">
                  <h3 className="text-xs font-bold uppercase tracking-wider text-slate-500">
                    Cultivable Plots ({selectedFarm.plots?.length || 0})
                  </h3>
                  <span className="text-xs text-slate-500">
                    Allocated:{' '}
                    <strong>
                      {selectedFarm.plots?.reduce((sum: number, p: any) => sum + Number(p.areaAcres), 0) || 0}
                    </strong>{' '}
                    / {selectedFarm.totalAreaAcres} Acres
                  </span>
                </div>

                {selectedFarm.plots && selectedFarm.plots.length > 0 ? (
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                    {selectedFarm.plots.map((plot: any) => (
                      <div
                        key={plot.id}
                        className="p-4 rounded-md border border-slate-200 bg-slate-50/60 hover:bg-slate-50 transition space-y-2"
                      >
                        <div className="flex items-center justify-between">
                          <h4 className="text-sm font-bold text-slate-800">{plot.name}</h4>
                          <span className="text-xs font-bold text-emerald-800 bg-emerald-100 px-2 py-0.5 rounded">
                            {plot.areaAcres} Acres
                          </span>
                        </div>
                        <div className="grid grid-cols-2 gap-2 text-[11px] text-slate-600 pt-1">
                          <div>
                            <span className="text-slate-400 block">Soil Type:</span>
                            <span className="font-medium text-slate-700">{plot.soilType}</span>
                          </div>
                          <div>
                            <span className="text-slate-400 block">Water Source:</span>
                            <span className="font-medium text-slate-700">{plot.waterSource}</span>
                          </div>
                        </div>
                        {plot.notes && (
                          <p className="text-[11px] text-slate-500 italic bg-white p-2 rounded border border-slate-100 mt-1">
                            "{plot.notes}"
                          </p>
                        )}
                      </div>
                    ))}
                  </div>
                ) : (
                  <div className="p-8 text-center bg-slate-50 rounded-md border border-dashed border-slate-300">
                    <p className="text-xs text-slate-500">No cultivable plots defined for this farm yet.</p>
                    <button
                      onClick={() => setShowAddPlotModal(true)}
                      className="mt-2 text-xs font-semibold text-emerald-600 hover:text-emerald-700"
                    >
                      Click here to create the first plot
                    </button>
                  </div>
                )}
              </div>
            </div>
          ) : (
            <div className="p-8 text-center bg-white rounded-md border border-slate-200">
              <p className="text-sm text-slate-500">Select a farm on the left to view its cultivable plots.</p>
            </div>
          )}
        </div>
      </div>

      {/* Add Farm Modal */}
      {showAddFarmModal && (
        <div className="fixed inset-0 z-50 bg-black/50 flex items-center justify-center p-4">
          <div className="bg-white rounded-md max-w-md w-full p-6 space-y-4 shadow-xl border border-slate-200">
            <div className="flex justify-between items-center border-b pb-3">
              <h3 className="text-base font-bold text-slate-800">Add New Farm</h3>
              <button onClick={() => setShowAddFarmModal(false)} className="text-slate-400 hover:text-slate-600">
                <CloseIcon className="w-4 h-4" />
              </button>
            </div>
            <form onSubmit={handleCreateFarm} className="space-y-3">
              <Input label="Farm Name" value={farmName} onChange={(e) => setFarmName(e.target.value)} required placeholder="e.g. Krishna Riverbed Farm" id="farmName" />
              <Input label="Location (Address / Taluka)" value={location} onChange={(e) => setLocation(e.target.value)} required placeholder="e.g. Pimpalgaon, Nashik" id="location" />
              <Input label="Total Area (Acres)" type="number" step="0.1" value={totalAreaAcres} onChange={(e) => setTotalAreaAcres(e.target.value)} required placeholder="e.g. 15.5" id="totalAreaAcres" />
              <div className="grid grid-cols-2 gap-2">
                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1">Soil Type</label>
                  <select value={soilType} onChange={(e) => setSoilType(e.target.value)} className="w-full text-xs px-3 py-2 border border-slate-300 rounded-md">
                    <option value="Black Loamy">Black Loamy</option>
                    <option value="Sandy Loam">Sandy Loam</option>
                    <option value="Alluvial">Alluvial</option>
                    <option value="Red Soil">Red Soil</option>
                  </select>
                </div>
                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1">Ownership</label>
                  <select value={ownershipType} onChange={(e) => setOwnershipType(e.target.value)} className="w-full text-xs px-3 py-2 border border-slate-300 rounded-md">
                    <option value="Owned">Owned</option>
                    <option value="Leased">Leased</option>
                  </select>
                </div>
              </div>
              <Input label="Primary Water Source" value={waterSource} onChange={(e) => setWaterSource(e.target.value)} placeholder="e.g. Borewell + Drip" id="waterSource" />
              <div className="pt-2 flex justify-end gap-2">
                <Button variant="outline" type="button" onClick={() => setShowAddFarmModal(false)}>Cancel</Button>
                <Button type="submit">Save Farm</Button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Add Plot Modal */}
      {showAddPlotModal && (
        <div className="fixed inset-0 z-50 bg-black/50 flex items-center justify-center p-4">
          <div className="bg-white rounded-md max-w-md w-full p-6 space-y-4 shadow-xl border border-slate-200">
            <div className="flex justify-between items-center border-b pb-3">
              <h3 className="text-base font-bold text-slate-800">Add Plot to {selectedFarm?.name}</h3>
              <button onClick={() => setShowAddPlotModal(false)} className="text-slate-400 hover:text-slate-600">
                <CloseIcon className="w-4 h-4" />
              </button>
            </div>
            <form onSubmit={handleCreatePlot} className="space-y-3">
              <Input label="Plot Name / Identifier" value={plotName} onChange={(e) => setPlotName(e.target.value)} required placeholder="e.g. Plot D - Guava Grove" id="plotName" />
              <Input label="Area (Acres)" type="number" step="0.1" value={plotArea} onChange={(e) => setPlotArea(e.target.value)} required placeholder="e.g. 4.0" id="plotArea" />
              <div className="grid grid-cols-2 gap-2">
                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1">Soil Type</label>
                  <select value={plotSoil} onChange={(e) => setPlotSoil(e.target.value)} className="w-full text-xs px-3 py-2 border border-slate-300 rounded-md">
                    <option value="Black Loamy">Black Loamy</option>
                    <option value="Sandy Loam">Sandy Loam</option>
                    <option value="Alluvial">Alluvial</option>
                    <option value="Red Soil">Red Soil</option>
                  </select>
                </div>
                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1">Water Source</label>
                  <select value={plotWater} onChange={(e) => setPlotWater(e.target.value)} className="w-full text-xs px-3 py-2 border border-slate-300 rounded-md">
                    <option value="Drip Irrigation">Drip Irrigation</option>
                    <option value="Borewell Sprinkler">Borewell Sprinkler</option>
                    <option value="Canal Flood">Canal Flood</option>
                    <option value="Rainfed">Rainfed</option>
                  </select>
                </div>
              </div>
              <div className="grid grid-cols-2 gap-2">
                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1">Plot Ownership</label>
                  <select value={plotOwnership} onChange={(e) => setPlotOwnership(e.target.value)} className="w-full text-xs px-3 py-2 border border-slate-300 rounded-md">
                    <option value="Owned">Owned</option>
                    <option value="Leased">Leased</option>
                  </select>
                </div>
                <Input label="Cultivation Notes" value={plotNotes} onChange={(e) => setPlotNotes(e.target.value)} placeholder="e.g. Certified organic" id="plotNotes" />
              </div>
              <div className="pt-2 flex justify-end gap-2">
                <Button variant="outline" type="button" onClick={() => setShowAddPlotModal(false)}>Cancel</Button>
                <Button type="submit">Create Plot</Button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
