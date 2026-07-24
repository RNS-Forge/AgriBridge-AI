import { useState, useEffect } from 'react';
import { useSelector } from 'react-redux';
import { RootState } from '../../store/index.js';
import { Button } from '../../components/ui/Button/index.js';

interface ExportFile {
  id: string;
  orderId: string;
  portOfLoading: string | null;
  portOfDischarge: string | null;
  customsStatus: string;
  customsDeclarationNumber: string | null;
  commercialInvoiceNumber: string | null;
  commercialInvoiceUrl: string | null;
  packingListUrl: string | null;
  eligibilityStatus: string;
  notes: string | null;
  createdAt: string;
}

interface EligibilityReport {
  exportId: string;
  eligible: boolean;
  rules: {
    apedaRegistered: { status: 'pass' | 'fail'; description: string };
    cropHsCodeValid: { status: 'pass' | 'fail'; description: string; hsCode?: string };
    phytosanitaryCertificate: { status: 'pass' | 'fail'; description: string };
    certificateOfOrigin: { status: 'pass' | 'fail'; description: string };
  };
}

export default function Exports() {
  const { token, tenantId } = useSelector((state: RootState) => state.auth);
  const [exportFiles, setExportFiles] = useState<ExportFile[]>([]);
  const [reports, setReports] = useState<Record<string, EligibilityReport>>({});
  const [loading, setLoading] = useState(false);

  // Customs update state
  const [activeExportId, setActiveExportId] = useState<string | null>(null);
  const [invoiceNum, setInvoiceNum] = useState('');
  const [invoiceUrl, setInvoiceUrl] = useState('');
  const [packingUrl, setPackingUrl] = useState('');
  const [declNum, setDeclNum] = useState('');

  // Shipping details state
  const [shippingExportId, setShippingExportId] = useState<string | null>(null);
  const [carrierName, setCarrierName] = useState('');
  const [containerNumber, setContainerNumber] = useState('');
  const [ladingNumber, setLadingNumber] = useState('');

  const fetchExports = async () => {
    setLoading(true);
    try {
      const res = await fetch(`http://localhost:8000/api/v1/export/list`, {
        headers: {
          'Authorization': `Bearer ${token}`,
          'X-Tenant-ID': tenantId || '',
        },
      });
      const data = await res.json();
      if (res.ok) {
        setExportFiles(data.data || []);
      }
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchExports();
  }, []);

  const handleRunEligibility = async (exportId: string) => {
    try {
      const res = await fetch(`http://localhost:8000/api/v1/export/${exportId}/check-eligibility`, {
        method: 'POST',
        headers: { 'Authorization': `Bearer ${token}` },
      });
      const data = await res.json();
      if (res.ok) {
        setReports(prev => ({ ...prev, [exportId]: data.data }));
        fetchExports();
      }
    } catch (err) {
      alert('Error verifying eligibility');
    }
  };

  const handleUpdateCustoms = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!activeExportId) return;

    try {
      const res = await fetch(`http://localhost:8000/api/v1/export/${activeExportId}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`,
        },
        body: JSON.stringify({
          commercialInvoiceNumber: invoiceNum,
          commercialInvoiceUrl: invoiceUrl,
          packingListUrl: packingUrl,
          customsStatus: 'approved',
          customsDeclarationNumber: declNum,
        }),
      });

      if (res.ok) {
        setActiveExportId(null);
        setInvoiceNum('');
        setInvoiceUrl('');
        setPackingUrl('');
        setDeclNum('');
        alert('Customs declarations updated and approved successfully!');
        fetchExports();
      }
    } catch (err) {
      alert('Error updating customs');
    }
  };

  const handleRegisterShipment = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!shippingExportId) return;

    try {
      const res = await fetch(`http://localhost:8000/api/v1/export/shipment`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`,
        },
        body: JSON.stringify({
          exportId: shippingExportId,
          carrierName,
          containerNumber,
          billOfLadingNumber: ladingNumber,
          originPort: 'Port of Nhava Sheva, India',
          destinationPort: 'Port of Dubai, UAE',
        }),
      });

      if (res.ok) {
        setShippingExportId(null);
        setCarrierName('');
        setContainerNumber('');
        setLadingNumber('');
        alert('International shipment registered. Bill of lading mapped!');
        fetchExports();
      } else {
        const body = await res.json();
        alert(body.message || 'Shipment registration failed');
      }
    } catch (err) {
      alert('Error registering shipment');
    }
  };

  return (
    <div className="space-y-8">
      {/* Header */}
      <div className="relative overflow-hidden bg-gradient-to-br from-slate-900 via-blue-950/30 to-slate-900 p-8 rounded-3xl border border-slate-800">
        {/* Decorative elements */}
        <div className="absolute top-0 right-0 w-64 h-64 bg-blue-600/10 rounded-full blur-3xl -translate-y-1/2 translate-x-1/2" />
        <div className="absolute bottom-0 left-0 w-48 h-48 bg-cyan-500/8 rounded-full blur-3xl translate-y-1/2 -translate-x-1/2" />
        
        <div className="relative z-10 space-y-2">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-blue-500/10 border border-blue-500/20 text-blue-400 text-xs font-medium">
            <span className="w-1.5 h-1.5 rounded-full bg-blue-400 animate-pulse" />
            Export Compliance
          </div>
          <h1 className="text-3xl font-extrabold text-slate-100">
            Export <span className="text-transparent bg-clip-text bg-gradient-to-r from-blue-400 to-cyan-300">Registry</span>
          </h1>
          <p className="text-slate-400 text-sm max-w-xl">
            Validate phytosanitary compliance, check APEDA status, and track ocean carriers
            for seamless international trade operations.
          </p>
        </div>
      </div>

      {loading ? (
        <div className="text-center py-12 text-slate-400">
          <div className="inline-block w-8 h-8 border-2 border-blue-500/30 border-t-blue-500 rounded-full animate-spin mb-4" />
          <p>Loading export cases...</p>
        </div>
      ) : (
        <div className="space-y-6">
          {exportFiles.map((file) => (
            <div key={file.id} className="bg-slate-900/60 backdrop-blur-sm border border-slate-800 rounded-2xl p-6 space-y-4 hover:border-blue-500/30 transition-all duration-300">
              <div className="flex justify-between items-start">
                <div>
                  <h3 className="text-md font-bold text-slate-200">Export Declaration case: {file.id.slice(0, 8)}</h3>
                  <p className="text-xs text-slate-500">Order ID context: {file.orderId}</p>
                </div>
                <div className="flex space-x-2">
                  <span className={`px-2.5 py-0.5 rounded text-xs font-semibold ${
                    file.eligibilityStatus === 'eligible' ? 'bg-emerald-950 text-emerald-400 border border-emerald-900/50' : 'bg-red-950/40 text-red-400 border border-red-900/50'
                  }`}>
                    {file.eligibilityStatus}
                  </span>
                  <span className={`px-2.5 py-0.5 rounded text-xs font-semibold ${
                    file.customsStatus === 'approved' ? 'bg-emerald-950 text-emerald-400 border border-emerald-900/50' : 'bg-slate-800 text-slate-400'
                  }`}>
                    Customs: {file.customsStatus}
                  </span>
                </div>
              </div>

              <div className="grid grid-cols-4 gap-4 text-xs text-slate-400 bg-slate-950 p-4 rounded-xl border border-slate-850">
                <div>
                  <span className="block text-slate-500 font-semibold mb-1">Port of Loading</span>
                  <span>{file.portOfLoading || 'N/A'}</span>
                </div>
                <div>
                  <span className="block text-slate-500 font-semibold mb-1">Port of Discharge</span>
                  <span>{file.portOfDischarge || 'N/A'}</span>
                </div>
                <div>
                  <span className="block text-slate-500 font-semibold mb-1">Commercial Invoice</span>
                  {file.commercialInvoiceNumber ? (
                    <a href={file.commercialInvoiceUrl || '#'} className="text-emerald-400 hover:underline">{file.commercialInvoiceNumber}</a>
                  ) : (
                    <span>N/A</span>
                  )}
                </div>
                <div>
                  <span className="block text-slate-500 font-semibold mb-1">Customs Declaration</span>
                  <span>{file.customsDeclarationNumber || 'N/A'}</span>
                </div>
              </div>

              {/* Action Buttons */}
              <div className="flex space-x-3 pt-2">
                <button
                  onClick={() => handleRunEligibility(file.id)}
                  className="px-3.5 py-1.5 bg-emerald-600 hover:bg-emerald-500 text-white text-xs font-semibold rounded-lg transition-colors"
                >
                  Run Eligibility Audit
                </button>

                {file.eligibilityStatus === 'eligible' && file.customsStatus !== 'approved' && (
                  <button
                    onClick={() => setActiveExportId(file.id)}
                    className="px-3.5 py-1.5 bg-slate-800 hover:bg-slate-700 text-slate-200 text-xs font-semibold rounded-lg border border-slate-700 transition-colors"
                  >
                    Provide Customs Invoices
                  </button>
                )}

                {file.customsStatus === 'approved' && (
                  <button
                    onClick={() => setShippingExportId(file.id)}
                    className="px-3.5 py-1.5 bg-slate-850 hover:bg-slate-700 text-emerald-400 text-xs font-semibold rounded-lg border border-slate-700 transition-colors"
                  >
                    Track Lading Shipment
                  </button>
                )}
              </div>

              {/* Render Eligibility Reports */}
              {reports[file.id] && (
                <div className="bg-slate-950 border border-slate-850 p-4 rounded-xl text-xs space-y-3">
                  <h4 className="font-bold text-slate-300">Regulatory Eligibility Audit Results:</h4>
                  <div className="grid grid-cols-2 gap-4">
                    <div className="flex justify-between border-b border-slate-900 pb-1.5">
                      <span className="text-slate-500">APEDA Registered Status:</span>
                      <span className={reports[file.id].rules.apedaRegistered.status === 'pass' ? 'text-emerald-400' : 'text-red-400'}>
                        {reports[file.id].rules.apedaRegistered.status.toUpperCase()}
                      </span>
                    </div>
                    <div className="flex justify-between border-b border-slate-900 pb-1.5">
                      <span className="text-slate-500">Crop HS Code status:</span>
                      <span className={reports[file.id].rules.cropHsCodeValid.status === 'pass' ? 'text-emerald-400' : 'text-red-400'}>
                        {reports[file.id].rules.cropHsCodeValid.status.toUpperCase()} ({reports[file.id].rules.cropHsCodeValid.hsCode})
                      </span>
                    </div>
                    <div className="flex justify-between border-b border-slate-900 pb-1.5">
                      <span className="text-slate-500">Phytosanitary Certification:</span>
                      <span className={reports[file.id].rules.phytosanitaryCertificate.status === 'pass' ? 'text-emerald-400' : 'text-red-400'}>
                        {reports[file.id].rules.phytosanitaryCertificate.status.toUpperCase()}
                      </span>
                    </div>
                    <div className="flex justify-between border-b border-slate-900 pb-1.5">
                      <span className="text-slate-500">Certificate of Origin:</span>
                      <span className={reports[file.id].rules.certificateOfOrigin.status === 'pass' ? 'text-emerald-400' : 'text-red-400'}>
                        {reports[file.id].rules.certificateOfOrigin.status.toUpperCase()}
                      </span>
                    </div>
                  </div>
                </div>
              )}
            </div>
          ))}
        </div>
      )}

      {/* Customs Invoice Modal */}
      {activeExportId && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-950/80 backdrop-blur-sm p-4">
          <div className="w-full max-w-md bg-slate-900 border border-slate-800 rounded-2xl overflow-hidden shadow-2xl shadow-blue-950/20">
            <div className="px-6 py-4 border-b border-slate-800 flex justify-between items-center bg-slate-900/80">
              <div className="flex items-center gap-3">
                <div className="w-8 h-8 rounded-lg bg-blue-600/20 border border-blue-500/30 flex items-center justify-center">
                  <svg className="w-4 h-4 text-blue-400" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                    <path strokeLinecap="round" strokeLinejoin="round" d="M19.5 14.25v-2.625a3.375 3.375 0 00-3.375-3.375h-1.5A1.125 1.125 0 0118 7.875h-2.25A3.375 3.375 0 006 11.625v2.625m13.5-6a3.375 3.375 0 00-3.375 3.375h-1.5A1.125 1.125 0 0118 7.875h-2.25A3.375 3.375 0 006 11.625v2.625m13.5-6V7.875c0-.621-.504-1.125-1.125-1.125h-1.5c-.621 0-1.125.504-1.125 1.125v1.5c0 .621.504 1.125 1.125 1.125h1.5c.621 0 1.125-.504 1.125-1.125v-1.5m-13.5 0v1.5c0 .621.504 1.125 1.125 1.125h1.5c.621 0 1.125-.504 1.125-1.125v-1.5m0 0h-1.5m1.5 0h1.5" />
                  </svg>
                </div>
                <h3 className="text-lg font-bold text-slate-100">Update Customs Declarations</h3>
              </div>
              <button 
                onClick={() => setActiveExportId(null)} 
                className="text-slate-400 hover:text-slate-100 transition-colors p-1 hover:bg-slate-800 rounded-lg"
              >
                <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                  <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
                </svg>
              </button>
            </div>
            <form onSubmit={handleUpdateCustoms} className="space-y-4">
              <div>
                <label className="block text-xs font-semibold text-slate-400 uppercase tracking-wider mb-2">Commercial Invoice Number</label>
                <input type="text" required value={invoiceNum} onChange={e => setInvoiceNum(e.target.value)} className="w-full bg-slate-950 border border-slate-800 rounded-lg px-3 py-2 text-slate-100" placeholder="INV-2026-992" />
              </div>
              <div>
                <label className="block text-xs font-semibold text-slate-400 uppercase tracking-wider mb-2">Invoice URL Link</label>
                <input type="text" required value={invoiceUrl} onChange={e => setInvoiceUrl(e.target.value)} className="w-full bg-slate-950 border border-slate-800 rounded-lg px-3 py-2 text-slate-100" placeholder="https://storage.googleapis.com/..." />
              </div>
              <div>
                <label className="block text-xs font-semibold text-slate-400 uppercase tracking-wider mb-2">Packing List URL Link</label>
                <input type="text" required value={packingUrl} onChange={e => setPackingUrl(e.target.value)} className="w-full bg-slate-950 border border-slate-800 rounded-lg px-3 py-2 text-slate-100" placeholder="https://storage.googleapis.com/..." />
              </div>
              <div>
                <label className="block text-xs font-semibold text-slate-400 uppercase tracking-wider mb-2">Customs Declaration Number</label>
                <input type="text" required value={declNum} onChange={e => setDeclNum(e.target.value)} className="w-full bg-slate-950 border border-slate-800 rounded-lg px-3 py-2 text-slate-100" placeholder="DEC-1092-2026" />
              </div>
              <Button type="submit">
                Submit & Approve Customs
                <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                  <path strokeLinecap="round" strokeLinejoin="round" d="M13.5 4.5L21 12m0 0l-7.5 7.5M21 12H3" />
                </svg>
              </Button>
            </form>
          </div>
        </div>
      )}

      {/* Shipment Registration Modal */}
      {shippingExportId && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-950/80 backdrop-blur-sm p-4">
          <div className="w-full max-w-md bg-slate-900 border border-slate-800 rounded-2xl overflow-hidden shadow-2xl shadow-blue-950/20">
            <div className="px-6 py-4 border-b border-slate-800 flex justify-between items-center bg-slate-900/80">
              <div className="flex items-center gap-3">
                <div className="w-8 h-8 rounded-lg bg-cyan-600/20 border border-cyan-500/30 flex items-center justify-center">
                  <svg className="w-4 h-4 text-cyan-400" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                    <path strokeLinecap="round" strokeLinejoin="round" d="M12 3c.132 0 .263 0 .393 0a7.5 7.5 0 007.92 12.446A9 9 0 1112 2.992z" />
                  </svg>
                </div>
                <h3 className="text-lg font-bold text-slate-100">Register Ocean Shipment</h3>
              </div>
              <button 
                onClick={() => setShippingExportId(null)} 
                className="text-slate-400 hover:text-slate-100 transition-colors p-1 hover:bg-slate-800 rounded-lg"
              >
                <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                  <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
                </svg>
              </button>
            </div>
            <form onSubmit={handleRegisterShipment} className="space-y-4">
              <div>
                <label className="block text-xs font-semibold text-slate-400 uppercase tracking-wider mb-2">Carrier Name</label>
                <input type="text" required value={carrierName} onChange={e => setCarrierName(e.target.value)} className="w-full bg-slate-950 border border-slate-800 rounded-lg px-3 py-2 text-slate-100" placeholder="e.g. Maersk Shipping Lines" />
              </div>
              <div>
                <label className="block text-xs font-semibold text-slate-400 uppercase tracking-wider mb-2">Container Number</label>
                <input type="text" required value={containerNumber} onChange={e => setContainerNumber(e.target.value)} className="w-full bg-slate-950 border border-slate-800 rounded-lg px-3 py-2 text-slate-100" placeholder="e.g. MSKU-9988-10" />
              </div>
              <div>
                <label className="block text-xs font-semibold text-slate-400 uppercase tracking-wider mb-2">Bill Of Lading Number</label>
                <input type="text" required value={ladingNumber} onChange={e => setLadingNumber(e.target.value)} className="w-full bg-slate-950 border border-slate-800 rounded-lg px-3 py-2 text-slate-100" placeholder="e.g. BL-10920-NHAVA" />
              </div>
              <Button type="submit">
                Confirm Lading Shipment
                <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                  <path strokeLinecap="round" strokeLinejoin="round" d="M13.5 4.5L21 12m0 0l-7.5 7.5M21 12H3" />
                </svg>
              </Button>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
