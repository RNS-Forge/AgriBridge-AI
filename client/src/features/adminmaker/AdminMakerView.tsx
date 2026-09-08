import React, { useState, useEffect } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import { Button, Input, Logo } from '../../components/ui/index.js';
import {
  ShieldIcon,
  CheckCircleIcon,
  CloseIcon,
  AlertTriangleIcon,
  UserIcon,
  MailIcon,
} from '../../components/ui/icons/index.js';

const PhoneIcon = () => (
  <svg className="w-4 h-4 text-slate-400" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.8}>
    <path strokeLinecap="round" strokeLinejoin="round" d="M2.25 6.75c0 8.284 6.716 15 15 15h2.25a2.25 2.25 0 002.25-2.25v-1.372c0-.516-.351-.966-.852-1.091l-4.423-1.106c-.44-.11-.902.055-1.173.417l-.97 1.293c-.282.376-.769.542-1.21.38a12.035 12.035 0 01-7.143-7.143c-.162-.441.004-.928.38-1.21l1.293-.97c.363-.271.527-.734.417-1.173L6.963 3.102a1.125 1.125 0 00-1.091-.852H4.5A2.25 2.25 0 002.25 4.5v2.25z" />
  </svg>
);

export default function AdminMakerView() {
  const location = useLocation();
  const navigate = useNavigate();

  // Tab state derived from route or user selection
  const isCreateRoute = location.pathname.includes('create-request');
  const [activeTab, setActiveTab] = useState<'CREATE' | 'REQUESTS'>(
    isCreateRoute ? 'CREATE' : 'REQUESTS'
  );

  useEffect(() => {
    setActiveTab(location.pathname.includes('create-request') ? 'CREATE' : 'REQUESTS');
  }, [location.pathname]);

  const [requests, setRequests] = useState<any[]>([]);
  const [loading, setLoading] = useState(false);

  // Form state
  const [email, setEmail] = useState('');
  const [firstName, setFirstName] = useState('');
  const [lastName, setLastName] = useState('');
  const [phone, setPhone] = useState('');
  const [requestedRole, setRequestedRole] = useState('FARMER');
  const [notes, setNotes] = useState('');
  const [error, setError] = useState('');
  const [successMsg, setSuccessMsg] = useState('');
  const [lastCreated, setLastCreated] = useState<any | null>(null);

  const loadRequests = () => {
    fetch('http://localhost:8000/api/v1/auth/user-requests')
      .then((r) => r.json())
      .then((d) => {
        if (d.success) setRequests(d.data);
      })
      .catch(() => {});
  };

  useEffect(() => {
    loadRequests();
  }, []);

  const handleTabChange = (tab: 'CREATE' | 'REQUESTS') => {
    setActiveTab(tab);
    if (tab === 'CREATE') {
      navigate('/admin-maker/create-request');
    } else {
      navigate('/admin-maker/requests');
    }
  };

  const handleCreateRequest = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setSuccessMsg('');
    setLoading(true);

    // Security Rule: Admin Maker cannot request or create Admin!
    if (requestedRole === 'ADMIN') {
      setError('Admin Maker cannot create or request the ADMIN role. Only existing Admins can manage Admins.');
      setLoading(false);
      return;
    }

    try {
      const res = await fetch('http://localhost:8000/api/v1/auth/admin-maker/create-user-request', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${localStorage.getItem('token')}`,
        },
        body: JSON.stringify({
          email,
          firstName,
          lastName,
          phone,
          requestedRole,
          notes,
        }),
      });
      const data = await res.json();

      if (!res.ok || !data.success) {
        throw new Error(data.message || 'Failed to submit user creation request');
      }

      setLastCreated(data.data);
      setSuccessMsg(`User creation request for ${email} (${requestedRole}) successfully submitted! Status is PENDING_APPROVAL.`);
      setEmail('');
      setFirstName('');
      setLastName('');
      setPhone('');
      setNotes('');
      loadRequests();
    } catch (err: any) {
      setError(err.message || 'Error creating request');
    } finally {
      setLoading(false);
    }
  };

  const pendingCount = requests.filter((r) => r.status === 'PENDING_APPROVAL').length;

  return (
    <div className="space-y-5">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-3">
        <div>
          <div className="flex items-center gap-2 mb-1">
            <h1 className="text-xl font-bold text-slate-900 tracking-tight">
              Admin Maker Console
            </h1>
            <span className="px-2 py-0.5 rounded text-[10px] font-bold uppercase bg-indigo-50 text-indigo-800 border border-indigo-200">
              Maker Role (Under Admin Governance)
            </span>
          </div>
          <p className="text-xs text-slate-500">
            Provision user accounts and initiate role creation requests for platform participants. All requests are routed to Super Admin for validation and activation.
          </p>
        </div>

        {/* Quick Tab Controls */}
        <div className="flex items-center gap-1.5 bg-slate-100 p-1 rounded-md border border-slate-200">
          <button
            onClick={() => handleTabChange('CREATE')}
            className={`px-3 py-1.5 rounded text-xs font-bold transition-colors ${
              activeTab === 'CREATE'
                ? 'bg-indigo-700 text-white shadow-xs'
                : 'text-slate-600 hover:text-slate-900'
            }`}
          >
            + Create Role Request
          </button>
          <button
            onClick={() => handleTabChange('REQUESTS')}
            className={`px-3 py-1.5 rounded text-xs font-bold transition-colors flex items-center gap-1.5 ${
              activeTab === 'REQUESTS'
                ? 'bg-indigo-700 text-white shadow-xs'
                : 'text-slate-600 hover:text-slate-900'
            }`}
          >
            <span>My Requests</span>
            <span className={`text-[10px] px-1.5 py-0.2 rounded font-bold ${
              activeTab === 'REQUESTS' ? 'bg-indigo-800 text-white' : 'bg-slate-200 text-slate-700'
            }`}>
              {requests.length}
            </span>
          </button>
        </div>
      </div>

      {/* Role Policy Reminder Banner */}
      <div className="p-3.5 rounded-md bg-indigo-50/60 border border-indigo-200 text-xs text-indigo-950 space-y-1">
        <span className="font-bold block uppercase tracking-wider text-indigo-900 flex items-center gap-1.5">
          <ShieldIcon className="w-3.5 h-3.5 text-indigo-700" />
          Maker-Checker Governance Protocol:
        </span>
        <ul className="list-disc list-inside space-y-0.5 text-indigo-900/85">
          <li><strong>Permitted Roles:</strong> Farmer, Farm Manager, Worker, Buyer, Mandi Agent, or another Admin Maker.</li>
          <li><strong>Role Boundary:</strong> Admin Maker can <strong>never</strong> create or request an <code>ADMIN</code> role.</li>
          <li><strong>Dual Authorization:</strong> Accounts submitted here enter <code>PENDING_APPROVAL</code> status until activated by an Admin. Default password is pre-configured as <code>AgriBridgeAI@2026</code>.</li>
        </ul>
      </div>

      {/* VIEW 1: Direct Creation Form (Shown when on /admin-maker/create-request) */}
      {activeTab === 'CREATE' && (
        <div className="relative min-h-[calc(100vh-220px)] w-full rounded-2xl overflow-hidden border border-slate-200/90 shadow-sm bg-slate-900 flex flex-col lg:flex-row">
          {/* Static Background Artwork (Identical to Sign-In Page) */}
          <div className="absolute inset-0 z-0">
            <div
              className="w-full h-full bg-cover bg-center bg-no-repeat"
              style={{ backgroundImage: "url('/logo/bg-login.png')" }}
            />
          </div>

          {/* Smooth Gradient Overlays */}
          <div className="absolute inset-0 z-10 bg-gradient-to-r from-slate-950/80 via-slate-900/50 to-white/95 pointer-events-none hidden lg:block" />
          <div className="absolute inset-0 z-10 bg-white/90 backdrop-blur-sm pointer-events-none lg:hidden" />

          {/* Left Side: Context & Governance Info */}
          <div className="relative z-20 w-full lg:w-1/2 p-6 lg:p-8 flex flex-col justify-between text-white space-y-6">
            <div>
              <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full bg-black/40 backdrop-blur-md border border-white/20 mb-3">
                <ShieldIcon className="w-3.5 h-3.5 text-indigo-400" />
                <span className="text-[11px] font-bold tracking-wider uppercase text-indigo-300">
                  Four-Eye Principle Maker Console
                </span>
              </div>
              <h2 className="text-2xl font-extrabold text-white tracking-tight leading-tight">
                Initiate Role Creation Request
              </h2>
              <p className="text-xs lg:text-sm text-slate-200 mt-2 max-w-md leading-relaxed">
                As an Admin Maker, submit proposed accounts for platform participants. Your requests are dispatched directly to the Administrator for verification and immediate activation.
              </p>
            </div>

            <div className="bg-slate-900/70 backdrop-blur-xl rounded-xl border border-white/15 p-4 space-y-2">
              <span className="text-[10px] font-bold text-indigo-300 uppercase tracking-wider block">
                Maker Protocol Compliance
              </span>
              <ul className="text-xs text-slate-200 space-y-1.5">
                <li className="flex items-center gap-2">
                  <span className="w-1.5 h-1.5 rounded-full bg-indigo-400" />
                  <span>Propose Farmers, Managers, Workers, Buyers & Mandi Agents</span>
                </li>
                <li className="flex items-center gap-2">
                  <span className="w-1.5 h-1.5 rounded-full bg-indigo-400" />
                  <span>Dual authorization required before account activation</span>
                </li>
                <li className="flex items-center gap-2">
                  <span className="w-1.5 h-1.5 rounded-full bg-indigo-400" />
                  <span>Initial password pre-configured as <code>AgriBridgeAI@2026</code></span>
                </li>
              </ul>
            </div>

            <div className="text-xs text-slate-300 flex items-center justify-between">
              <span>Looking for past submissions?</span>
              <button
                type="button"
                onClick={() => handleTabChange('REQUESTS')}
                className="text-xs font-bold text-indigo-300 hover:text-white underline"
              >
                Go to Requests Tracker ({pendingCount} pending) →
              </button>
            </div>
          </div>

          {/* Right Side: Floating Card Matching Sign-In Page Design */}
          <div className="relative z-20 w-full lg:w-1/2 flex items-center justify-center p-4 lg:p-6">
            <div className="w-full max-w-[480px] bg-white/95 backdrop-blur-xl border border-slate-200/90 rounded-xl shadow-xl p-6 lg:p-7 space-y-4 my-auto max-h-[calc(100vh-220px)] overflow-y-auto table-scroll">
              
              {/* Brand Header */}
              <div className="flex items-center justify-between pb-3 border-b border-slate-200/60">
                <Logo variant="option3" size="md" showText={true} />
                <span className="px-2 py-0.5 rounded text-[10px] font-bold uppercase tracking-wider bg-indigo-50 text-indigo-800 border border-indigo-200 flex items-center gap-1">
                  <ShieldIcon className="w-3 h-3 text-indigo-700" />
                  Maker Request
                </span>
              </div>

              <div>
                <h3 className="text-lg font-bold text-slate-800 tracking-tight">
                  Propose New User Account
                </h3>
                <p className="text-xs text-slate-600 mt-0.5">
                  Fill in applicant identity details to submit for Admin review.
                </p>
              </div>

              {/* Success Banner */}
              {successMsg && (
                <div className="p-3 bg-emerald-50 border border-emerald-300 rounded-md text-xs text-emerald-900 space-y-2">
                  <div className="flex items-center justify-between">
                    <span className="font-bold flex items-center gap-1.5 text-emerald-800">
                      <CheckCircleIcon className="w-4 h-4 text-emerald-600" />
                      Request Submitted!
                    </span>
                    <button
                      onClick={() => setSuccessMsg('')}
                      className="text-emerald-700 hover:text-emerald-900"
                    >
                      <CloseIcon className="w-3.5 h-3.5" />
                    </button>
                  </div>
                  <p>{successMsg}</p>
                  {lastCreated && (
                    <div className="bg-white/80 p-2.5 rounded border border-emerald-200 text-[11px] font-mono text-emerald-950 flex flex-wrap gap-4">
                      <span>Request ID: <strong>{lastCreated.id}</strong></span>
                      <span>Role: <strong>{lastCreated.requestedRole}</strong></span>
                      <span>Status: <strong className="text-amber-700">{lastCreated.status}</strong></span>
                    </div>
                  )}
                  <button
                    onClick={() => handleTabChange('REQUESTS')}
                    className="text-xs font-bold text-emerald-800 underline"
                  >
                    View in Requests Tracker →
                  </button>
                </div>
              )}

              {/* Error Banner */}
              {error && (
                <div className="p-3 rounded-md bg-rose-50 border border-rose-200 text-xs text-rose-800 flex items-center justify-between">
                  <span className="flex items-center gap-1.5">
                    <AlertTriangleIcon className="w-3.5 h-3.5 text-rose-600" />
                    {error}
                  </span>
                  <button onClick={() => setError('')} className="text-rose-600 hover:text-rose-800">
                    <CloseIcon className="w-3.5 h-3.5" />
                  </button>
                </div>
              )}

              <form onSubmit={handleCreateRequest} className="space-y-3.5">
                {/* Role Selection */}
                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1">
                    Select Platform Role to Propose *
                  </label>
                  <select
                    value={requestedRole}
                    onChange={(e) => setRequestedRole(e.target.value)}
                    className="w-full text-xs px-3 py-2 border border-slate-300 rounded-md bg-white text-slate-800 font-semibold focus:ring-1 focus:ring-indigo-500 outline-none"
                  >
                    <option value="FARMER">FARMER — Cultivation, Cost Basis & Produce Sales</option>
                    <option value="FARM_MANAGER">FARM_MANAGER — Farm Operations & Consumables Stock</option>
                    <option value="WORKER">WORKER — Field Tasks & Operational Execution</option>
                    <option value="BUYER">BUYER — Marketplace Procurement & Direct Orders</option>
                    <option value="MANDI_AGENT">MANDI_AGENT — APMC Yard Arrivals & Auctions</option>
                    <option value="ADMIN_MAKER">ADMIN_MAKER — Operational Maker Account</option>
                  </select>
                </div>

                {/* Name Fields */}
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  <Input
                    label="First Name *"
                    value={firstName}
                    onChange={(e) => setFirstName(e.target.value)}
                    required
                    placeholder="e.g. Ramesh"
                    id="first"
                    icon={<UserIcon />}
                  />
                  <Input
                    label="Last Name *"
                    value={lastName}
                    onChange={(e) => setLastName(e.target.value)}
                    required
                    placeholder="e.g. Patel"
                    id="last"
                    icon={<UserIcon />}
                  />
                </div>

                {/* Email & Phone */}
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  <Input
                    label="Official Email Address *"
                    type="email"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    required
                    placeholder="applicant@agribridge.com"
                    id="reqEmail"
                    icon={<MailIcon />}
                  />
                  <Input
                    label="Phone Number"
                    type="tel"
                    value={phone}
                    onChange={(e) => setPhone(e.target.value)}
                    placeholder="+91 98765 43210"
                    id="reqPhone"
                    icon={<PhoneIcon />}
                  />
                </div>

                {/* Notes / Organization info */}
                <Input
                  label="Organization / Farm Cluster Notes"
                  value={notes}
                  onChange={(e) => setNotes(e.target.value)}
                  placeholder="e.g. Nashik Onion Cluster (Plot 4B)"
                  id="reqNotes"
                />

                {/* Submit button */}
                <Button
                  type="submit"
                  loading={loading}
                  fullWidth
                  className="!bg-indigo-700 hover:!bg-indigo-800 text-white font-bold py-2.5 shadow-xs"
                >
                  {loading ? 'Submitting Request...' : 'Submit Request for Admin Approval'}
                </Button>
              </form>
            </div>
          </div>
        </div>
      )}

      {/* VIEW 2: Requests History / Tracker */}
      {activeTab === 'REQUESTS' && (
        <div className="bg-white rounded-md border border-slate-200 shadow-xs overflow-hidden">
          <div className="px-5 py-3.5 border-b border-slate-200 flex flex-col sm:flex-row sm:items-center justify-between gap-2">
            <div>
              <h3 className="text-sm font-bold text-slate-800">
                Submitted Role Requests ({requests.length})
              </h3>
              <p className="text-xs text-slate-500">
                Real-time tracking of requests submitted for Admin review.
              </p>
            </div>
            <Button
              onClick={() => handleTabChange('CREATE')}
              className="text-xs !bg-indigo-700 hover:!bg-indigo-800 !text-white self-start sm:self-auto rounded-md"
            >
              + Create New Request
            </Button>
          </div>

          <div className="divide-y divide-slate-100 max-h-[calc(100vh-270px)] overflow-y-auto table-scroll">
            {requests.length === 0 ? (
              <div className="p-8 text-center space-y-3">
                <p className="text-xs text-slate-500">No role requests found.</p>
                <Button
                  onClick={() => handleTabChange('CREATE')}
                  className="text-xs !bg-indigo-700 hover:!bg-indigo-800 !text-white rounded-md"
                >
                  Create Your First Request
                </Button>
              </div>
            ) : (
              requests.map((r) => (
                <div
                  key={r.id}
                  className="p-4 flex flex-col sm:flex-row sm:items-center justify-between gap-3 hover:bg-slate-50 transition-colors"
                >
                  <div className="space-y-1">
                    <div className="flex items-center gap-2">
                      <h4 className="text-xs font-bold text-slate-900">
                        {r.firstName} {r.lastName}
                      </h4>
                      <span className="px-2 py-0.5 rounded text-[10px] font-bold uppercase bg-slate-100 text-slate-700 border border-slate-200">
                        Role: {r.requestedRole}
                      </span>
                    </div>
                    <p className="text-xs text-slate-500">
                      Email: <strong className="text-slate-700">{r.email}</strong> • Submitted: {new Date(r.createdAt).toLocaleDateString()}
                    </p>
                    {r.notes && (
                      <p className="text-[11px] text-slate-600 italic">
                        Notes: "{r.notes}"
                      </p>
                    )}
                  </div>

                  <div className="text-right sm:min-w-[180px]">
                    <span
                      className={`px-2.5 py-0.5 rounded text-[10px] font-bold uppercase tracking-wider inline-block border ${
                        r.status === 'PENDING_APPROVAL'
                          ? 'bg-amber-50 text-amber-800 border-amber-200'
                          : r.status === 'APPROVED'
                          ? 'bg-emerald-50 text-emerald-800 border-emerald-200'
                          : 'bg-rose-50 text-rose-800 border-rose-200'
                      }`}
                    >
                      {r.status}
                    </span>
                    <p className="text-[10px] text-slate-400 mt-1">
                      {r.status === 'PENDING_APPROVAL' ? 'Awaiting Admin Approval' : 'Processed by Admin'}
                    </p>
                  </div>
                </div>
              ))
            )}
          </div>
        </div>
      )}
    </div>
  );
}
