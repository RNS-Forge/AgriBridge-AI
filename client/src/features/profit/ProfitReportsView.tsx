import { useState, useEffect } from 'react';
import { BuildingIcon, PackageIcon } from '../../components/ui/index.js';

export default function ProfitReportsView() {
  const [reports, setReports] = useState<any[]>([]);

  useEffect(() => {
    fetch('http://localhost:8000/api/v1/profit-reports')
      .then((r) => r.json())
      .then((d) => {
        if (d.success) setReports(d.data);
      })
      .catch(() => {});
  }, []);

  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <div className="flex items-center gap-2 mb-1">
          <h1 className="text-xl font-bold text-slate-800 tracking-tight">
            Profit Report Engine (Prompt 13)
          </h1>
          <span className="px-2 py-0.5 rounded text-[10px] font-bold uppercase bg-emerald-100 text-emerald-800 border border-emerald-300">
            Radical Financial Transparency
          </span>
        </div>
        <p className="text-xs text-slate-500">
          Pure arithmetic on real recorded expenses and actual sale settlements — closes the loop from cultivation to sale.
        </p>
      </div>

      {/* Reports List */}
      <div className="space-y-6">
        {reports.map((report) => (
          <div
            key={report.id}
            className="bg-white p-6 rounded-md border border-slate-200 shadow-sm space-y-5"
          >
            {/* Header info */}
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-4 border-b border-slate-100">
              <div>
                <div className="flex items-center gap-2">
                  <h2 className="text-lg font-bold text-slate-800">{report.cropName}</h2>
                  <span className="px-2.5 py-0.5 rounded text-xs font-bold bg-slate-100 text-slate-700">
                    {report.saleType === 'MANDI_SALE' ? (
                      <span className="inline-flex items-center gap-1.5">
                        <BuildingIcon className="w-3.5 h-3.5" /> Mandi APMC Auction
                      </span>
                    ) : (
                      <span className="inline-flex items-center gap-1.5">
                        <PackageIcon className="w-3.5 h-3.5" /> Direct Marketplace Sale
                      </span>
                    )}
                  </span>
                </div>
                <p className="text-xs text-slate-500 mt-0.5">
                  Quantity Sold: <strong>{report.quantitySoldKg?.toLocaleString()} kg</strong> • Sold at: <strong>₹{report.salePricePerKg}/kg</strong> • Settlement Date: {new Date(report.generatedAt).toLocaleDateString()}
                </p>
              </div>

              <div className="text-right">
                <span className="text-xs text-slate-400">Net Farmer Profit:</span>
                <p className="text-2xl font-black text-emerald-700 mt-0.5">
                  +₹{report.netProfit?.toLocaleString()}
                </p>
                <span className="text-xs font-bold text-emerald-800 bg-emerald-100 px-2 py-0.5 rounded">
                  {report.marginPercent}% Profit Margin
                </span>
              </div>
            </div>

            {/* Arithmetic Breakdown ( radical transparency! ) */}
            <div className="grid grid-cols-2 md:grid-cols-4 gap-3 text-center">
              <div className="bg-slate-50 p-3.5 rounded-md border border-slate-200">
                <span className="text-[10px] font-bold text-slate-400 uppercase">Gross Revenue</span>
                <p className="text-base font-bold text-slate-800 mt-1">₹{report.grossRevenue?.toLocaleString()}</p>
                <span className="text-[10px] text-slate-400">
                  {report.deductions > 0 ? `-₹${report.deductions} comm.` : 'No commission'}
                </span>
              </div>

              <div className="bg-slate-50 p-3.5 rounded-md border border-slate-200">
                <span className="text-[10px] font-bold text-slate-400 uppercase">Verified Cultivation Cost</span>
                <p className="text-base font-bold text-red-700 mt-1">-₹{report.totalCost?.toLocaleString()}</p>
                <span className="text-[10px] text-slate-400">Prorated cultivation expenses</span>
              </div>

              <div className="bg-emerald-50 p-3.5 rounded-md border border-emerald-300">
                <span className="text-[10px] font-bold text-emerald-800 uppercase">Profit Per Kg</span>
                <p className="text-base font-bold text-emerald-900 mt-1">+₹{report.profitPerKg}</p>
                <span className="text-[10px] text-emerald-700">Over ₹32.96 cost basis</span>
              </div>

              <div className="bg-emerald-50 p-3.5 rounded-md border border-emerald-300">
                <span className="text-[10px] font-bold text-emerald-800 uppercase">Profit Per Acre</span>
                <p className="text-base font-bold text-emerald-900 mt-1">+₹{report.profitPerAcre?.toLocaleString()}</p>
                <span className="text-[10px] text-emerald-700">10 acre plot yield</span>
              </div>
            </div>

            {/* Category Expenses Deducted */}
            {report.categoryBreakdown && (
              <div className="space-y-2 pt-1 border-t border-slate-100">
                <span className="text-xs font-bold text-slate-700 uppercase tracking-wider">
                  Itemized Production Costs Deducted
                </span>
                <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-6 gap-2 text-xs">
                  {Object.entries(report.categoryBreakdown).map(([cat, amt]: [string, any]) => (
                    <div key={cat} className="p-2.5 bg-slate-50 rounded border border-slate-200">
                      <span className="text-[10px] text-slate-400 uppercase font-semibold block">{cat}</span>
                      <span className="font-bold text-slate-800 mt-0.5 block">₹{amt.toLocaleString()}</span>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>
        ))}
      </div>
    </div>
  );
}
