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
    <div className="p-6 md:p-8 space-y-8">
      {/* Header */}
      <div className="bg-white rounded-xl border border-gray-200 p-6">
        <div className="flex justify-between items-center mb-6">
          <div>
            <h1 className="text-2xl font-semibold tracking-tight text-gray-900">
              Export Registry
            </h1>
            <p className="text-sm text-gray-500 mt-1">
              Validate phytosanitary compliance, check APEDA status, and track ocean carriers
              for seamless international trade operations.
            </p>
          </div>
        </div>
      </div>

      {loading ? (
        <div className="text-center py-12 text-gray-500">
          <div className="inline-block w-8 h-8 border-2 border-blue-500 border-t-transparent rounded-full animate-spin mb-4" />
          <p>Loading export cases...</p>
        </div>
      ) : (
        <div className="space-y-6">
          {exportFiles.map((file) => (
            <div
              key={file.id}
              className="bg-white rounded-xl border border-gray-200 p-6 space-y-4 hover:shadow-sm transition-all duration-200"
            >
              <div className="flex justify-between items-start">
                <div>
                  <h3 className="text-base font-semibold text-gray-900">
                    Export Declaration case: {file.id.slice(0, 8)}
                  </h3>
                  <p className="text-sm text-gray-500">Order ID context: {file.orderId}</p>
                </div>
                <div className="flex space-x-2">
                  <span
                    className={`px-2.5 py-0.5 rounded-md text-xs font-semibold ${
                      file.eligibilityStatus === 'eligible'
                        ? 'bg-emerald-600/10 text-emerald-600 border border-emerald-600/20'
                        : 'bg-red-600/10 text-red-600 border border-red-600/20'
                    }`}
                  >
                    {file.eligibilityStatus}
                  </span>
                  <span
                    className={`px-2.5 py-0.5 rounded-md text-xs font-semibold ${
                      file.customsStatus === 'approved'
                        ? 'bg-emerald-600/10 text-emerald-600 border border-emerald-600/20'
                        : 'bg-gray-200 text-gray-600'
                    }`}
                  >
                    Customs: {file.customsStatus}
                  </span>
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-4 text-sm text-gray-500 bg-gray-50 p-4 rounded-lg border border-gray-200">
                <div>
                  <span className="block text-gray-600 font-medium mb-1">Port of Loading</span>
                  <span>{file.portOfLoading || 'N/A'}</span>
                </div>
                <div>
                  <span className="block text-gray-600 font-medium mb-1">Port of Discharge</span>
                  <span>{file.portOfDischarge || 'N/A'}</span>
                </div>
                <div>
                  <span className="block text-gray-600 font-medium mb-1">Commercial Invoice</span>
                  {file.commercialInvoiceNumber ? (
                    <a href={file.commercialInvoiceUrl || '#'} className="text-blue-600 hover:underline">
                      {file.commercialInvoiceNumber}
                    </a>
                  ) : (
                    <span>N/A</span>
                  )}
                </div>
                <div>
                  <span className="block text-gray-600 font-medium mb-1">Customs Declaration</span>
                  <span>{file.customsDeclarationNumber || 'N/A'}</span>
                </div>
              </div>

              {/* Action Buttons */}
              <div className="flex space-x-3 pt-2">
                <Button
                  onClick={() => handleRunEligibility(file.id)}
                  className="px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white text-sm font-semibold rounded-lg transition-colors duration-200"
                >
                  Run Eligibility Audit
                </Button>

                {file.eligibilityStatus === 'eligible' && file.customsStatus !== 'approved' && (
                  <Button
                    onClick={() => setActiveExportId(file.id)}
                    className="px-4 py-2 bg-white border border-gray-200 text-gray-700 text-sm font-semibold rounded-lg hover:bg-gray-50 transition-colors duration-200"
                  >
                    Provide Customs Invoices
                  </Button>
                )}

                {file.customsStatus === 'approved' && (
                  <Button
                    onClick={() => setShippingExportId(file.id)}
                    className="px-4 py-2 bg-white border border-gray-200 text-emerald-600 text-sm font-semibold rounded-lg hover:bg-gray-50 transition-colors duration-200"
                  >
                    Track Lading Shipment
                  </Button>
                )}
              </div>

              {/* Eligibility Reports */}
              {reports[file.id] && (
                <div className="bg-gray-50 border border-gray-200 p-4 rounded-lg text-sm space-y-3">
                  <h4 className="font-semibold text-gray-900">Regulatory Eligibility Audit Results:</h4>
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <div className="flex justify-between border-b border-gray-200 pb-1.5">
                      <span className="text-gray-600">APEDA Registered Status:</span>
                      <span className={reports[file.id].rules.apedaRegistered.status === 'pass' ? 'text-emerald-600' : 'text-red-600'}>
                        {reports[file.id].rules.apedaRegistered.status.toUpperCase()}
                      </span>
                    </div>
                    <div className="flex justify-between border-b border-gray-200 pb-1.5">
                      <span className="text-gray-600">Crop HS Code status:</span>
                      <span className={reports[file.id].rules.cropHsCodeValid.status === 'pass' ? 'text-emerald-600' : 'text-red-600'}>
                        {reports[file.id].rules.cropHsCodeValid.status.toUpperCase()} ({reports[file.id].rules.cropHsCodeValid.hsCode})
                      </span>
                    </div>
                    <div className="flex justify-between border-b border-gray-200 pb-1.5">
                      <span className="text-gray-600">Phytosanitary Certification:</span>
                      <span className={reports[file.id].rules.phytosanitaryCertificate.status === 'pass' ? 'text-emerald-600' : 'text-red-600'}>
                        {reports[file.id].rules.phytosanitaryCertificate.status.toUpperCase()}
                      </span>
                    </div>
                    <div className="flex justify-between border-b border-gray-200 pb-1.5">
                      <span className="text-gray-600">Certificate of Origin:</span>
                      <span className={reports[file.id].rules.certificateOfOrigin.status === 'pass' ? 'text-emerald-600' : 'text-red-600'}>
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
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-gray-900/50 backdrop-blur-sm p-4">
          <div className="w-full max-w-md bg-white border border-gray-200 rounded-xl overflow-hidden shadow-sm">
            <div className="px-6 py-4 border-b border-gray-200 flex justify-between items-center">
              <div className="flex items-center gap-3">
                <h3 className="text-lg font-semibold text-gray-900">Update Customs Declarations</h3>
              </div>
              <button
                onClick={() => setActiveExportId(null)}
                className="text-gray-400 hover:text-gray-600 transition-colors p-1 hover:bg-gray-100 rounded-lg"
                aria-label="Close modal"
              >
                <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                  <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
                </svg>
              </button>
            </div>
            <form onSubmit={handleUpdateCustoms} className="space-y-4 p-6">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Commercial Invoice Number</label>
                <input
                  type="text"
                  required
                  value={invoiceNum}
                  onChange={e => setInvoiceNum(e.target.value)}
                  className="w-full bg-white border border-gray-300 rounded-lg px-3 py-2 text-gray-900 focus:border-blue-500 focus:ring-blue-500"
                  placeholder="INV-2026-992"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Invoice URL Link</label>
                <input
                  type="text"
                  required
                  value={invoiceUrl}
                  onChange={e => setInvoiceUrl(e.target.value)}
                  className="w-full bg-white border border-gray-300 rounded-lg px-3 py-2 text-gray-900 focus:border-blue-500 focus:ring-blue-500"
                  placeholder="https://storage.googleapis.com/..."
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Packing List URL Link</label>
                <input
                  type="text"
                  required
                  value={packingUrl}
                  onChange={e => setPackingUrl(e.target.value)}
                  className="w-full bg-white border border-gray-300 rounded-lg px-3 py-2 text-gray-900 focus:border-blue-500 focus:ring-blue-500"
                  placeholder="https://storage.googleapis.com/..."
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Customs Declaration Number</label>
                <input
                  type="text"
                  required
                  value={declNum}
                  onChange={e => setDeclNum(e.target.value)}
                  className="w-full bg-white border border-gray-300 rounded-lg px-3 py-2 text-gray-900 focus:border-blue-500 focus:ring-blue-500"
                  placeholder="DEC-1092-2026"
                />
              </div>
              <Button
                type="submit"
                className="w-full px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white text-sm font-semibold rounded-lg transition-colors duration-200"
              >
                Submit & Approve Customs
              </Button>
            </form>
          </div>
        </div>
      )}

      {/* Shipment Registration Modal */}
      {shippingExportId && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-gray-900/50 backdrop-blur-sm p-4">
          <div className="w-full max-w-md bg-white border border-gray-200 rounded-xl overflow-hidden shadow-sm">
            <div className="px-6 py-4 border-b border-gray-200 flex justify-between items-center">
              <div className="flex items-center gap-3">
                <h3 className="text-lg font-semibold text-gray-900">Register Ocean Shipment</h3>
              </div>
              <button
                onClick={() => setShippingExportId(null)}
                className="text-gray-400 hover:text-gray-600 transition-colors p-1 hover:bg-gray-100 rounded-lg"
                aria-label="Close modal"
              >
                <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                  <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
                </svg>
              </button>
            </div>
            <form onSubmit={handleRegisterShipment} className="space-y-4 p-6">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Carrier Name</label>
                <input
                  type="text"
                  required
                  value={carrierName}
                  onChange={e => setCarrierName(e.target.value)}
                  className="w-full bg-white border border-gray-300 rounded-lg px-3 py-2 text-gray-900 focus:border-blue-500 focus:ring-blue-500"
                  placeholder="e.g. Maersk Shipping Lines"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Container Number</label>
                <input
                  type="text"
                  required
                  value={containerNumber}
                  onChange={e => setContainerNumber(e.target.value)}
                  className="w-full bg-white border border-gray-300 rounded-lg px-3 py-2 text-gray-900 focus:border-blue-500 focus:ring-blue-500"
                  placeholder="e.g. MSKU-9988-10"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Bill Of Lading Number</label>
                <input
                  type="text"
                  required
                  value={ladingNumber}
                  onChange={e => setLadingNumber(e.target.value)}
                  className="w-full bg-white border border-gray-300 rounded-lg px-3 py-2 text-gray-900 focus:border-blue-500 focus:ring-blue-500"
                  placeholder="e.g. BL-10920-NHAVA"
                />
              </div>
              <Button
                type="submit"
                className="w-full px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white text-sm font-semibold rounded-lg transition-colors duration-200"
              >
                Confirm Lading Shipment
              </Button>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}