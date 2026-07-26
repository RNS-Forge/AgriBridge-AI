import { useState, useEffect } from 'react';
import { useSelector } from 'react-redux';
import { RootState } from '../../store/index.js';
import { Button } from '../../components/ui/Button/index.js';

interface Farmer {
  id: string;
  userId: string;
  tenantId: string;
  registrationNumber: string;
  bankName: string;
  accountNumber: string;
  ifscCode: string;
  kycStatus: string;
  createdAt: string;
  user?: {
    email: string;
    firstName: string;
    lastName: string;
  };
  farm?: {
    id: string;
    name: string;
    soilType: string;
    totalAreaHectares: string;
  };
}

export default function Farmers() {
  const { token, tenantId } = useSelector((state: RootState) => state.auth);
  const [farmers, setFarmers] = useState<Farmer[]>([]);
  const [loading, setLoading] = useState(false);

  // Register farmer modal inputs
  const [showAddModal, setShowAddModal] = useState(false);
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [firstName, setFirstName] = useState('');
  const [lastName, setLastName] = useState('');
  const [aadhaarNumber, setAadhaarNumber] = useState('');
  const [registrationNumber, setRegistrationNumber] = useState('');
  const [bankName, setBankName] = useState('');
  const [accountNumber, setAccountNumber] = useState('');
  const [ifscCode, setIfscCode] = useState('');
  const [farmName, setFarmName] = useState('');
  const [totalAreaHectares, setTotalAreaHectares] = useState(1);

  const fetchFarmers = async () => {
    setLoading(true);
    try {
      const res = await fetch('http://localhost:8000/api/v1/farmer/list', {
        headers: {
          'Authorization': `Bearer ${token}`,
          'X-Tenant-ID': tenantId || '',
        },
      });
      const data = await res.json();
      if (res.ok) {
        setFarmers(data.data || []);
      }
    } catch (err: any) {
      console.error('Could not fetch farmers:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchFarmers();
  }, []);

  const handleRegisterFarmer = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      const res = await fetch('http://localhost:8000/api/v1/farmer/register', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`,
          'X-Tenant-ID': tenantId || '',
        },
        body: JSON.stringify({
          tenantId,
          email,
          password,
          firstName,
          lastName,
          aadhaarNumber,
          registrationNumber,
          bankName,
          accountNumber,
          ifscCode,
          farmName,
          totalAreaHectares: Number(totalAreaHectares),
        }),
      });

      if (res.ok) {
        setShowAddModal(false);
        fetchFarmers();
        // Clear fields
        setEmail('');
        setPassword('');
        setFirstName('');
        setLastName('');
        setAadhaarNumber('');
        setRegistrationNumber('');
        setBankName('');
        setAccountNumber('');
        setIfscCode('');
        setFarmName('');
        setTotalAreaHectares(1);
      } else {
        const body = await res.json();
        alert(body.message || 'Registration failed');
      }
    } catch (err) {
      alert('Error registering farmer');
    }
  };

  const handleApproveKYC = async (farmerId: string) => {
    try {
      const res = await fetch(`http://localhost:8000/api/v1/farmer/${farmerId}/kyc`, {
        method: 'PATCH',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`,
          'X-Tenant-ID': tenantId || '',
        },
        body: JSON.stringify({ kycStatus: 'verified' }),
      });
      if (res.ok) {
        fetchFarmers();
      }
    } catch (err) {
      alert('Error updating KYC');
    }
  };

  return (
    <div className="p-6 md:p-8 space-y-8">
      {/* Header */}
      <div className="bg-white rounded-xl border border-gray-200 p-6">
        <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
          <div className="space-y-2">
            <h1 className="text-2xl font-semibold tracking-tight text-gray-900">
              Manage Member Farmers
            </h1>
            <p className="text-sm text-gray-500 max-w-xl">
              Register FPO member farmers, record geographical farm coordinates, verify KYC statuses,
              and manage bank details for seamless agricultural operations.
            </p>
          </div>
          <Button
            onClick={() => setShowAddModal(true)}
            className="px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white text-sm font-semibold rounded-lg transition-colors duration-200"
          >
            <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M12 4.5v15m7.5-7.5h-15" />
            </svg>
            Add Farmer Member
          </Button>
        </div>
      </div>

      {loading ? (
        <div className="text-center py-12 text-gray-500">
          <div className="inline-block w-8 h-8 border-2 border-blue-500 border-t-transparent rounded-full animate-spin mb-4" />
          <p>Loading farmer records...</p>
        </div>
      ) : (
        <div className="bg-white rounded-xl border border-gray-200 overflow-hidden">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="border-b border-gray-200 bg-gray-50 text-xs font-semibold text-gray-600 uppercase tracking-wider">
                <th className="px-6 py-4">Name</th>
                <th className="px-6 py-4">Reg Number</th>
                <th className="px-6 py-4">Farm Detail</th>
                <th className="px-6 py-4">Bank Detail</th>
                <th className="px-6 py-4">KYC Status</th>
                <th className="px-6 py-4">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-200 text-sm text-gray-600">
              {farmers.map((farmer) => (
                <tr key={farmer.id} className="hover:bg-gray-50 transition-colors">
                  <td className="px-6 py-4">
                    <div className="flex items-center gap-3">
                      <div className="w-8 h-8 rounded-full bg-blue-600 flex items-center justify-center text-white text-xs font-bold">
                        {farmer.user?.firstName?.[0]}{farmer.user?.lastName?.[0]}
                      </div>
                      <div>
                        <p className="font-semibold text-gray-900">
                          {farmer.user?.firstName} {farmer.user?.lastName}
                        </p>
                        <p className="text-xs text-gray-500">{farmer.user?.email}</p>
                      </div>
                    </div>
                  </td>
                  <td className="px-6 py-4 font-mono text-xs text-gray-500">{farmer.registrationNumber}</td>
                  <td className="px-6 py-4">
                    <p className="font-medium text-gray-900">{farmer.farm?.name || 'No Farm registered'}</p>
                    <p className="text-xs text-gray-500">
                      {farmer.farm?.totalAreaHectares ? `${farmer.farm.totalAreaHectares} Hectares` : ''}
                    </p>
                  </td>
                  <td className="px-6 py-4">
                    <p className="font-medium text-gray-900">{farmer.bankName}</p>
                    <p className="text-xs text-gray-500 font-mono">{farmer.accountNumber}</p>
                  </td>
                  <td className="px-6 py-4">
                    <span
                      className={`inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-semibold border ${
                        farmer.kycStatus === 'verified'
                          ? 'bg-emerald-600/10 text-emerald-600 border-emerald-600/20'
                          : 'bg-amber-600/10 text-amber-600 border-amber-600/20'
                      }`}
                    >
                      <span
                        className={`w-1.5 h-1.5 rounded-full ${
                          farmer.kycStatus === 'verified' ? 'bg-emerald-600' : 'bg-amber-600'
                        }`}
                      />
                      {farmer.kycStatus}
                    </span>
                  </td>
                  <td className="px-6 py-4">
                    {farmer.kycStatus !== 'verified' && (
                      <Button
                        onClick={() => handleApproveKYC(farmer.id)}
                        className="px-3 py-1.5 bg-white border border-gray-200 text-gray-700 text-xs font-semibold rounded-lg hover:bg-gray-50 transition-colors duration-200"
                      >
                        Approve KYC
                      </Button>
                    )}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
          {farmers.length === 0 && (
            <div className="text-center py-12 text-gray-500">
              <svg className="w-12 h-12 mx-auto mb-4 text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M15.75 6a3.75 3.75 0 11-7.5 0 3.75 3.75 0 017.5 0zM4.501 20.118a7.5 7.5 0 0114.998 0" />
              </svg>
              <p>No farmers registered yet</p>
              <p className="text-xs mt-1">Click "Add Farmer Member" to get started</p>
            </div>
          )}
        </div>
      )}

      {/* Add Farmer Modal */}
      {showAddModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-gray-900/50 backdrop-blur-sm p-4">
          <div className="w-full max-w-2xl bg-white border border-gray-200 rounded-xl overflow-hidden max-h-[90vh] overflow-y-auto shadow-sm">
            <div className="px-6 py-4 border-b border-gray-200 flex justify-between items-center">
              <div className="flex items-center gap-3">
                <h3 className="text-lg font-semibold text-gray-900">Onboard New Farmer</h3>
              </div>
              <button
                onClick={() => setShowAddModal(false)}
                className="text-gray-400 hover:text-gray-600 transition-colors p-1 hover:bg-gray-100 rounded-lg"
                aria-label="Close modal"
              >
                <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                  <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
                </svg>
              </button>
            </div>
            <form onSubmit={handleRegisterFarmer} className="p-6 space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">First Name</label>
                  <input
                    type="text"
                    required
                    value={firstName}
                    onChange={e => setFirstName(e.target.value)}
                    className="w-full bg-white border border-gray-300 rounded-lg px-3 py-2 text-gray-900 focus:border-blue-500 focus:ring-blue-500"
                    placeholder="Rajesh"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Last Name</label>
                  <input
                    type="text"
                    required
                    value={lastName}
                    onChange={e => setLastName(e.target.value)}
                    className="w-full bg-white border border-gray-300 rounded-lg px-3 py-2 text-gray-900 focus:border-blue-500 focus:ring-blue-500"
                    placeholder="Sharma"
                  />
                </div>
              </div>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Email</label>
                  <input
                    type="email"
                    required
                    value={email}
                    onChange={e => setEmail(e.target.value)}
                    className="w-full bg-white border border-gray-300 rounded-lg px-3 py-2 text-gray-900 focus:border-blue-500 focus:ring-blue-500"
                    placeholder="farmer@example.com"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Password</label>
                  <input
                    type="password"
                    required
                    value={password}
                    onChange={e => setPassword(e.target.value)}
                    className="w-full bg-white border border-gray-300 rounded-lg px-3 py-2 text-gray-900 focus:border-blue-500 focus:ring-blue-500"
                    placeholder="••••••••"
                  />
                </div>
              </div>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Aadhaar Number</label>
                  <input
                    type="text"
                    required
                    value={aadhaarNumber}
                    onChange={e => setAadhaarNumber(e.target.value)}
                    className="w-full bg-white border border-gray-300 rounded-lg px-3 py-2 text-gray-900 focus:border-blue-500 focus:ring-blue-500"
                    placeholder="1234-5678-9012"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Registration Number</label>
                  <input
                    type="text"
                    required
                    value={registrationNumber}
                    onChange={e => setRegistrationNumber(e.target.value)}
                    className="w-full bg-white border border-gray-300 rounded-lg px-3 py-2 text-gray-900 focus:border-blue-500 focus:ring-blue-500"
                    placeholder="REG-001"
                  />
                </div>
              </div>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Bank Name</label>
                  <input
                    type="text"
                    required
                    value={bankName}
                    onChange={e => setBankName(e.target.value)}
                    className="w-full bg-white border border-gray-300 rounded-lg px-3 py-2 text-gray-900 focus:border-blue-500 focus:ring-blue-500"
                    placeholder="State Bank"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Account Number</label>
                  <input
                    type="text"
                    required
                    value={accountNumber}
                    onChange={e => setAccountNumber(e.target.value)}
                    className="w-full bg-white border border-gray-300 rounded-lg px-3 py-2 text-gray-900 focus:border-blue-500 focus:ring-blue-500"
                    placeholder="1234567890"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">IFSC Code</label>
                  <input
                    type="text"
                    required
                    value={ifscCode}
                    onChange={e => setIfscCode(e.target.value)}
                    className="w-full bg-white border border-gray-300 rounded-lg px-3 py-2 text-gray-900 focus:border-blue-500 focus:ring-blue-500"
                    placeholder="SBIN0001234"
                  />
                </div>
              </div>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Farm Name</label>
                  <input
                    type="text"
                    required
                    value={farmName}
                    onChange={e => setFarmName(e.target.value)}
                    className="w-full bg-white border border-gray-300 rounded-lg px-3 py-2 text-gray-900 focus:border-blue-500 focus:ring-blue-500"
                    placeholder="Green Valley Farm"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Total Area (Hectares)</label>
                  <input
                    type="number"
                    required
                    value={totalAreaHectares}
                    onChange={e => setTotalAreaHectares(Number(e.target.value))}
                    className="w-full bg-white border border-gray-300 rounded-lg px-3 py-2 text-gray-900 focus:border-blue-500 focus:ring-blue-500"
                    placeholder="5"
                  />
                </div>
              </div>
              <Button
                type="submit"
                className="w-full px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white text-sm font-semibold rounded-lg transition-colors duration-200"
              >
                Register Farmer
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