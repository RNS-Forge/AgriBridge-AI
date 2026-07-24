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
    <div className="space-y-8">
      {/* Header */}
      <div className="relative overflow-hidden bg-gradient-to-br from-slate-900 via-emerald-950/30 to-slate-900 p-8 rounded-3xl border border-slate-800">
        {/* Decorative elements */}
        <div className="absolute top-0 right-0 w-64 h-64 bg-emerald-600/10 rounded-full blur-3xl -translate-y-1/2 translate-x-1/2" />
        <div className="absolute bottom-0 left-0 w-48 h-48 bg-teal-500/8 rounded-full blur-3xl translate-y-1/2 -translate-x-1/2" />
        
        <div className="relative z-10 flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
          <div className="space-y-2">
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-emerald-500/10 border border-emerald-500/20 text-emerald-400 text-xs font-medium">
              <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse" />
              Farmers Registry
            </div>
            <h1 className="text-3xl font-extrabold text-slate-100">
              Manage <span className="text-transparent bg-clip-text bg-gradient-to-r from-emerald-400 to-teal-300">Member Farmers</span>
            </h1>
            <p className="text-slate-400 text-sm max-w-xl">
              Register FPO member farmers, record geographical farm coordinates, verify KYC statuses,
              and manage bank details for seamless agricultural operations.
            </p>
          </div>
          <Button
            onClick={() => setShowAddModal(true)}
          >
            <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M12 4.5v15m7.5-7.5h-15" />
            </svg>
            Add Farmer Member
          </Button>
        </div>
      </div>

      {loading ? (
        <div className="text-center py-12 text-slate-400">
          <div className="inline-block w-8 h-8 border-2 border-emerald-500/30 border-t-emerald-500 rounded-full animate-spin mb-4" />
          <p>Loading farmer records...</p>
        </div>
      ) : (
        <div className="bg-slate-900/60 backdrop-blur-sm border border-slate-800 rounded-2xl overflow-hidden">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="border-b border-slate-800 bg-slate-900/80 text-xs font-semibold text-slate-400 uppercase tracking-wider">
                <th className="px-6 py-4">Name</th>
                <th className="px-6 py-4">Reg Number</th>
                <th className="px-6 py-4">Farm Detail</th>
                <th className="px-6 py-4">Bank Detail</th>
                <th className="px-6 py-4">KYC Status</th>
                <th className="px-6 py-4">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-800 text-sm text-slate-300">
              {farmers.map((farmer) => (
                <tr key={farmer.id} className="hover:bg-slate-800/30 transition-colors">
                  <td className="px-6 py-4">
                    <div className="flex items-center gap-3">
                      <div className="w-8 h-8 rounded-full bg-gradient-to-br from-emerald-500 to-teal-600 flex items-center justify-center text-white text-xs font-bold">
                        {farmer.user?.firstName?.[0]}{farmer.user?.lastName?.[0]}
                      </div>
                      <div>
                        <p className="font-semibold text-slate-100">
                          {farmer.user?.firstName} {farmer.user?.lastName}
                        </p>
                        <p className="text-xs text-slate-500">{farmer.user?.email}</p>
                      </div>
                    </div>
                  </td>
                  <td className="px-6 py-4 font-mono text-xs text-slate-400">{farmer.registrationNumber}</td>
                  <td className="px-6 py-4">
                    <p className="font-medium text-slate-200">{farmer.farm?.name || 'No Farm registered'}</p>
                    <p className="text-xs text-slate-500">
                      {farmer.farm?.totalAreaHectares ? `${farmer.farm.totalAreaHectares} Hectares` : ''}
                    </p>
                  </td>
                  <td className="px-6 py-4">
                    <p className="font-medium text-slate-200">{farmer.bankName}</p>
                    <p className="text-xs text-slate-500 font-mono">{farmer.accountNumber}</p>
                  </td>
                  <td className="px-6 py-4">
                    <span className={`inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-semibold border ${
                      farmer.kycStatus === 'verified'
                        ? 'bg-emerald-950/50 text-emerald-400 border-emerald-500/30'
                        : 'bg-yellow-950/50 text-yellow-400 border-yellow-500/30'
                    }`}>
                      <span className={`w-1.5 h-1.5 rounded-full ${
                        farmer.kycStatus === 'verified' ? 'bg-emerald-400' : 'bg-yellow-400'
                      }`} />
                      {farmer.kycStatus}
                    </span>
                  </td>
                  <td className="px-6 py-4">
                    {farmer.kycStatus !== 'verified' && (
                      <button
                        onClick={() => handleApproveKYC(farmer.id)}
                        className="px-3 py-1.5 bg-slate-800/80 hover:bg-emerald-950/50 hover:text-emerald-400 hover:border-emerald-500/30 text-xs font-semibold rounded-lg border border-slate-700 transition-all duration-200"
                      >
                        Approve KYC
                      </button>
                    )}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
          {farmers.length === 0 && (
            <div className="text-center py-12 text-slate-500">
              <svg className="w-12 h-12 mx-auto mb-4 text-slate-600" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
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
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-950/80 backdrop-blur-sm p-4">
          <div className="w-full max-w-2xl bg-slate-900 border border-slate-800 rounded-2xl overflow-hidden max-h-[90vh] overflow-y-auto shadow-2xl shadow-emerald-950/20">
            <div className="px-6 py-4 border-b border-slate-800 flex justify-between items-center bg-slate-900/80">
              <div className="flex items-center gap-3">
                <div className="w-8 h-8 rounded-lg bg-emerald-600/20 border border-emerald-500/30 flex items-center justify-center">
                  <svg className="w-4 h-4 text-emerald-400" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                    <path strokeLinecap="round" strokeLinejoin="round" d="M12 4.5v15m7.5-7.5h-15" />
                  </svg>
                </div>
                <h3 className="text-lg font-bold text-slate-100">Onboard New Farmer</h3>
              </div>
              <button 
                onClick={() => setShowAddModal(false)} 
                className="text-slate-400 hover:text-slate-100 transition-colors p-1 hover:bg-slate-800 rounded-lg"
              >
                <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                  <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
                </svg>
              </button>
            </div>
            <form onSubmit={handleRegisterFarmer} className="p-6 space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-semibold text-slate-400 uppercase tracking-wider mb-2">First Name</label>
                  <input 
                    type="text" 
                    required 
                    value={firstName} 
                    onChange={e => setFirstName(e.target.value)} 
                    className="w-full bg-slate-950 border border-slate-800 focus:border-emerald-500/60 rounded-lg px-3 py-2.5 text-slate-100 placeholder-slate-600 focus:outline-none transition-colors" 
                    placeholder="Rajesh"
                  />
                </div>
                <div>
                  <label className="block text-xs font-semibold text-slate-400 uppercase tracking-wider mb-2">Last Name</label>
                  <input 
                    type="text" 
                    required 
                    value={lastName} 
                    onChange={e => setLastName(e.target.value)} 
                    className="w-full bg-slate-950 border border-slate-800 focus:border-emerald-500/60 rounded-lg px-3 py-2.5 text-slate-100 placeholder-slate-600 focus:outline-none transition-colors" 
                    placeholder="Sharma"
                  />
                </div>
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-semibold text-slate-400 uppercase tracking-wider mb-2">Email</label>
                  <input 
                    type="email" 
                    required 
                    value={email} 
                    onChange={e => setEmail(e.target.value)} 
                    className="w-full bg-slate-950 border border-slate-800 focus:border-emerald-500/60 rounded-lg px-3 py-2.5 text-slate-100 placeholder-slate-600 focus:outline-none transition-colors" 
                    placeholder="farmer@example.com"
                  />
                </div>
                <div>
                  <label className="block text-xs font-semibold text-slate-400 uppercase tracking-wider mb-2">Password</label>
                  <input 
                    type="password" 
                    required 
                    value={password} 
                    onChange={e => setPassword(e.target.value)} 
                    className="w-full bg-slate-950 border border-slate-800 focus:border-emerald-500/60 rounded-lg px-3 py-2.5 text-slate-100 placeholder-slate-600 focus:outline-none transition-colors" 
                    placeholder="••••••••"
                  />
                </div>
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-semibold text-slate-400 uppercase tracking-wider mb-2">Aadhaar Number</label>
                  <input 
                    type="text" 
                    required 
                    value={aadhaarNumber} 
                    onChange={e => setAadhaarNumber(e.target.value)} 
                    className="w-full bg-slate-950 border border-slate-800 focus:border-emerald-500/60 rounded-lg px-3 py-2.5 text-slate-100 placeholder-slate-600 focus:outline-none transition-colors" 
                    placeholder="1234-5678-9012"
                  />
                </div>
                <div>
                  <label className="block text-xs font-semibold text-slate-400 uppercase tracking-wider mb-2">Registration Number</label>
                  <input 
                    type="text" 
                    required 
                    value={registrationNumber} 
                    onChange={e => setRegistrationNumber(e.target.value)} 
                    className="w-full bg-slate-950 border border-slate-800 focus:border-emerald-500/60 rounded-lg px-3 py-2.5 text-slate-100 placeholder-slate-600 focus:outline-none transition-colors" 
                    placeholder="REG-001"
                  />
                </div>
              </div>
              <div className="grid grid-cols-3 gap-4">
                <div>
                  <label className="block text-xs font-semibold text-slate-400 uppercase tracking-wider mb-2">Bank Name</label>
                  <input 
                    type="text" 
                    required 
                    value={bankName} 
                    onChange={e => setBankName(e.target.value)} 
                    className="w-full bg-slate-950 border border-slate-800 focus:border-emerald-500/60 rounded-lg px-3 py-2.5 text-slate-100 placeholder-slate-600 focus:outline-none transition-colors" 
                    placeholder="State Bank"
                  />
                </div>
                <div>
                  <label className="block text-xs font-semibold text-slate-400 uppercase tracking-wider mb-2">Account Number</label>
                  <input 
                    type="text" 
                    required 
                    value={accountNumber} 
                    onChange={e => setAccountNumber(e.target.value)} 
                    className="w-full bg-slate-950 border border-slate-800 focus:border-emerald-500/60 rounded-lg px-3 py-2.5 text-slate-100 placeholder-slate-600 focus:outline-none transition-colors" 
                    placeholder="1234567890"
                  />
                </div>
                <div>
                  <label className="block text-xs font-semibold text-slate-400 uppercase tracking-wider mb-2">IFSC Code</label>
                  <input 
                    type="text" 
                    required 
                    value={ifscCode} 
                    onChange={e => setIfscCode(e.target.value)} 
                    className="w-full bg-slate-950 border border-slate-800 focus:border-emerald-500/60 rounded-lg px-3 py-2.5 text-slate-100 placeholder-slate-600 focus:outline-none transition-colors" 
                    placeholder="SBIN0001234"
                  />
                </div>
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-semibold text-slate-400 uppercase tracking-wider mb-2">Farm Name</label>
                  <input 
                    type="text" 
                    required 
                    value={farmName} 
                    onChange={e => setFarmName(e.target.value)} 
                    className="w-full bg-slate-950 border border-slate-800 focus:border-emerald-500/60 rounded-lg px-3 py-2.5 text-slate-100 placeholder-slate-600 focus:outline-none transition-colors" 
                    placeholder="Green Valley Farm"
                  />
                </div>
                <div>
                  <label className="block text-xs font-semibold text-slate-400 uppercase tracking-wider mb-2">Total Area (Hectares)</label>
                  <input 
                    type="number" 
                    required 
                    value={totalAreaHectares} 
                    onChange={e => setTotalAreaHectares(Number(e.target.value))} 
                    className="w-full bg-slate-950 border border-slate-800 focus:border-emerald-500/60 rounded-lg px-3 py-2.5 text-slate-100 placeholder-slate-600 focus:outline-none transition-colors" 
                    placeholder="5"
                  />
                </div>
              </div>
              <Button type="submit">
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
