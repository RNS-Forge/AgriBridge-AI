import React, { useState, useEffect } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import { Button, Input } from '../../components/ui/index.js';
import {
  ShieldIcon,
  CheckCircleIcon,
  CloseIcon,
  AlertTriangleIcon,
} from '../../components/ui/icons/index.js';

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
        <div className="bg-white rounded-md border border-slate-200 shadow-xs p-6 space-y-4">
          <div className="border-b border-slate-100 pb-3 flex items-center justify-between">
            <div>
              <h2 className="text-sm font-bold text-slate-900">
                Initiate New Account / Role Request
              </h2>
              <p className="text-xs text-slate-500 mt-0.5">
                Fill in applicant details to propose an enterprise account.
              </p>
            </div>
            <span className="text-xs font-medium text-slate-400">
              Admin Maker Form
            </span>
          </div>

          {/* Success Banner */}
          {successMsg && (
            <div className="p-3.5 bg-emerald-50 border border-emerald-300 rounded-md text-xs text-emerald-900 space-y-2">
              <div className="flex items-center justify-between">
                <span className="font-bold flex items-center gap-1.5 text-emerald-800">
                  <CheckCircleIcon className="w-4 h-4 text-emerald-600" />
                  Request Created Successfully!
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
              <div className="pt-1 flex gap-3">
                <button
                  onClick={() => handleTabChange('REQUESTS')}
                  className="text-xs font-bold text-emerald-800 hover:underline"
                >
                  View in Requests Tracker →
                </button>
                <button
                  onClick={() => {
                    setSuccessMsg('');
                    setLastCreated(null);
                  }}
                  className="text-xs font-semibold text-slate-600 hover:text-slate-800"
                >
                  Submit Another
                </button>
              </div>
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

          <form onSubmit={handleCreateRequest} className="space-y-4 max-w-2xl">
            {/* Role Selection */}
            <div>
              <label className="block text-xs font-bold text-slate-700 mb-1 uppercase tracking-wider">
                Select Platform Role to Request *
              </label>
              <select
                value={requestedRole}
                onChange={(e) => setRequestedRole(e.target.value)}
                className="w-full text-xs px-3 py-2 border border-slate-300 rounded-md bg-white text-slate-800 font-medium focus:ring-1 focus:ring-indigo-500 focus:border-indigo-500 outline-none"
              >
                <option value="FARMER">FARMER — Cultivation, Cost Basis & Sell Produce</option>
                <option value="FARM_MANAGER">FARM_MANAGER — Farm Operations & Consumables Stock</option>
                <option value="WORKER">WORKER — Field Tasks & Operational Execution</option>
                <option value="BUYER">BUYER — Marketplace Produce Procurement & Orders</option>
                <option value="MANDI_AGENT">MANDI_AGENT — APMC Mandi Arrivals & Live Auctions</option>
                <option value="ADMIN_MAKER">ADMIN_MAKER — Secondary Maker under Admin Governance</option>
              </select>
              <p className="text-[11px] text-slate-400 mt-1 italic">
                *Admin role cannot be created or requested by Admin Maker per platform security policy.
              </p>
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
              />
              <Input
                label="Last Name *"
                value={lastName}
                onChange={(e) => setLastName(e.target.value)}
                required
                placeholder="e.g. Patel"
                id="last"
              />
            </div>

            {/* Email & Phone */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <Input
                label="Email Address *"
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required
                placeholder="applicant@agribridge.com"
                id="reqEmail"
              />
              <Input
                label="Phone Number"
                type="tel"
                value={phone}
                onChange={(e) => setPhone(e.target.value)}
                placeholder="+91 98765 43210"
                id="reqPhone"
              />
            </div>

            {/* Notes / Organization info */}
            <div>
              <Input
                label="Organization / Farm Name / Operational Notes"
                value={notes}
                onChange={(e) => setNotes(e.target.value)}
                placeholder="e.g. FPO member onboarding for Nashik Onion Cluster (Plot 4B)"
                id="reqNotes"
              />
            </div>

            {/* Submit button */}
            <div className="pt-2 flex items-center gap-3">
              <Button
                type="submit"
                loading={loading}
                className="!bg-indigo-700 hover:!bg-indigo-800 !text-white px-5 py-2 text-xs font-bold rounded-md shadow-xs"
              >
                {loading ? 'Submitting Request...' : 'Submit Request for Admin Approval'}
              </Button>
              <Button
                type="button"
                variant="outline"
                onClick={() => handleTabChange('REQUESTS')}
                className="text-xs rounded-md"
              >
                View Requests Tracker ({pendingCount} pending)
              </Button>
            </div>
          </form>
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

          <div className="divide-y divide-slate-100">
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
