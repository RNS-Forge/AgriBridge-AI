import React, { useState, useEffect } from 'react';
import { Button, Input } from '../../components/ui/index.js';

export default function AdminMakerView() {
  const [requests, setRequests] = useState<any[]>([]);
  const [showCreateModal, setShowCreateModal] = useState(false);

  // Form state
  const [email, setEmail] = useState('');
  const [firstName, setFirstName] = useState('');
  const [lastName, setLastName] = useState('');
  const [phone, setPhone] = useState('');
  const [requestedRole, setRequestedRole] = useState('FARMER');
  const [notes, setNotes] = useState('');
  const [error, setError] = useState('');
  const [successMsg, setSuccessMsg] = useState('');

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

  const handleCreateRequest = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setSuccessMsg('');

    // Rule: Admin Maker cannot request or create Admin!
    if (requestedRole === 'ADMIN') {
      setError('Admin Maker cannot create or request the ADMIN role. Only existing Admins can manage Admins.');
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

      setSuccessMsg(`User creation request for ${email} (${requestedRole}) successfully submitted! Status is PENDING_APPROVAL.`);
      setShowCreateModal(false);
      setEmail('');
      setFirstName('');
      setLastName('');
      setPhone('');
      setNotes('');
      loadRequests();
    } catch (err: any) {
      setError(err.message || 'Error creating request');
    }
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2 mb-1">
            <h1 className="text-xl font-bold text-slate-800 tracking-tight">
              Admin Maker Console (Role & User Creation)
            </h1>
            <span className="px-2 py-0.5 rounded text-[10px] font-bold uppercase bg-indigo-100 text-indigo-800 border border-indigo-200">
              Maker Role (Under Admin)
            </span>
          </div>
          <p className="text-xs text-slate-500">
            Admin Maker can initiate user creation for all platform roles except Admin. All creations are logged in PENDING_APPROVAL status for Super Admin approval.
          </p>
        </div>

        <Button onClick={() => setShowCreateModal(true)} className="text-xs bg-indigo-700 hover:bg-indigo-800">
          + Request New User Role
        </Button>
      </div>

      {/* Success Notification */}
      {successMsg && (
        <div className="p-3 bg-emerald-50 border border-emerald-300 rounded-xl text-xs text-emerald-800 flex items-center justify-between">
          <span>✓ {successMsg}</span>
          <button onClick={() => setSuccessMsg('')} className="text-emerald-600 font-bold">✕</button>
        </div>
      )}

      {/* Role Policy Reminder Banner */}
      <div className="p-4 rounded-2xl bg-indigo-50/60 border border-indigo-200 text-xs text-indigo-950 space-y-1">
        <span className="font-bold block uppercase tracking-wider text-indigo-900">
          🛡️ Maker-Checker Governance Rules:
        </span>
        <ul className="list-disc list-inside space-y-1 text-indigo-900/80">
          <li><strong>Admin Maker</strong> can create: Farmer, Farm Manager, Worker, Buyer, Mandi Agent, or another Admin Maker.</li>
          <li><strong>Strict Restriction:</strong> Admin Maker can <strong>never</strong> create or request an <code>ADMIN</code> role.</li>
          <li><strong>Approval Required:</strong> All accounts requested by Admin Maker must be reviewed and activated by an <strong>Admin</strong>. Default password will be <code>AgriBridgeAI@2026</code>.</li>
        </ul>
      </div>

      {/* Requests History */}
      <div className="bg-white rounded-2xl border border-slate-200 shadow-sm overflow-hidden">
        <div className="px-6 py-4 border-b border-slate-200 flex items-center justify-between">
          <h3 className="text-sm font-bold text-slate-800">
            Submitted Role Requests ({requests.length})
          </h3>
          <span className="text-xs text-slate-500">Live Status Tracker</span>
        </div>

        <div className="divide-y divide-slate-100">
          {requests.map((r) => (
            <div key={r.id} className="p-5 flex flex-col sm:flex-row sm:items-center justify-between gap-3 hover:bg-slate-50 transition">
              <div className="space-y-1">
                <div className="flex items-center gap-2">
                  <h4 className="text-sm font-bold text-slate-800">{r.firstName} {r.lastName}</h4>
                  <span className="px-2 py-0.5 rounded text-[10px] font-bold uppercase bg-slate-100 text-slate-700">
                    {r.requestedRole}
                  </span>
                </div>
                <p className="text-xs text-slate-500">
                  Email: <strong className="text-slate-700">{r.email}</strong> • Submitted: {new Date(r.createdAt).toLocaleDateString()}
                </p>
                {r.notes && (
                  <p className="text-[11px] text-slate-500 italic">Notes: "{r.notes}"</p>
                )}
              </div>

              <div className="text-right">
                <span
                  className={`px-3 py-1 rounded-full text-xs font-bold uppercase tracking-wider ${
                    r.status === 'PENDING_APPROVAL'
                      ? 'bg-amber-100 text-amber-800 border border-amber-200'
                      : r.status === 'APPROVED'
                      ? 'bg-emerald-100 text-emerald-800 border border-emerald-200'
                      : 'bg-red-100 text-red-800 border border-red-200'
                  }`}
                >
                  {r.status}
                </span>
                <p className="text-[10px] text-slate-400 mt-1">
                  {r.status === 'PENDING_APPROVAL' ? 'Awaiting Admin Approval' : 'Processed by Admin'}
                </p>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Create Request Modal */}
      {showCreateModal && (
        <div className="fixed inset-0 z-50 bg-black/50 flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl max-w-md w-full p-6 space-y-4 shadow-xl">
            <div className="flex justify-between items-center border-b pb-3">
              <h3 className="text-base font-bold text-slate-800">Request Role Creation</h3>
              <button onClick={() => setShowCreateModal(false)} className="text-slate-400 hover:text-slate-600">✕</button>
            </div>

            {error && (
              <div className="p-3 rounded-lg bg-red-50 border border-red-200 text-xs text-red-700">
                {error}
              </div>
            )}

            <form onSubmit={handleCreateRequest} className="space-y-3">
              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">Select Role to Request</label>
                <select
                  value={requestedRole}
                  onChange={(e) => setRequestedRole(e.target.value)}
                  className="w-full text-xs px-3 py-2 border rounded-lg bg-white"
                >
                  <option value="FARMER">FARMER (Cultivate, Cost Basis & Sell)</option>
                  <option value="FARM_MANAGER">FARM_MANAGER (Operations & Inventory)</option>
                  <option value="WORKER">WORKER (Field Tasks)</option>
                  <option value="BUYER">BUYER (Produce Procurement)</option>
                  <option value="MANDI_AGENT">MANDI_AGENT (APMC Yard & Auctions)</option>
                  <option value="ADMIN_MAKER">ADMIN_MAKER (Operational Maker under Admin)</option>
                </select>
                <p className="text-[10px] text-slate-400 mt-0.5 italic">
                  *Admin role is not available to Admin Maker per governance policy.
                </p>
              </div>

              <div className="grid grid-cols-2 gap-2">
                <Input label="First Name" value={firstName} onChange={(e) => setFirstName(e.target.value)} required id="first" />
                <Input label="Last Name" value={lastName} onChange={(e) => setLastName(e.target.value)} required id="last" />
              </div>

              <Input label="Email Address" type="email" value={email} onChange={(e) => setEmail(e.target.value)} required placeholder="user@agribridge.com" id="reqEmail" />
              <Input label="Phone" type="tel" value={phone} onChange={(e) => setPhone(e.target.value)} placeholder="+91 98765 00000" id="reqPhone" />
              <Input label="Reason / Notes for Admin" value={notes} onChange={(e) => setNotes(e.target.value)} placeholder="e.g. FPO farm manager onboarding for Plot D" id="reqNotes" />

              <div className="pt-2 flex justify-end gap-2">
                <Button variant="outline" type="button" onClick={() => setShowCreateModal(false)}>Cancel</Button>
                <Button type="submit" className="bg-indigo-700 hover:bg-indigo-800">
                  Submit Request for Admin Approval
                </Button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
