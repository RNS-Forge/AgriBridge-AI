import React, { useState, useEffect } from 'react';
import { Button, Input } from '../../components/ui/index.js';

export default function AdminUsersView() {
  const [users, setUsers] = useState<any[]>([]);
  const [requests, setRequests] = useState<any[]>([]);
  const [activeTab, setActiveTab] = useState<'REQUESTS' | 'USERS'>('REQUESTS');
  const [showDirectCreateModal, setShowDirectCreateModal] = useState(false);
  const [rejectModalId, setRejectModalId] = useState<string | null>(null);
  const [rejectReason, setRejectReason] = useState('');

  // Direct create user form
  const [email, setEmail] = useState('');
  const [firstName, setFirstName] = useState('');
  const [lastName, setLastName] = useState('');
  const [phone, setPhone] = useState('');
  const [role, setRole] = useState('ADMIN_MAKER');

  const loadData = () => {
    fetch('http://localhost:8000/api/v1/auth/users')
      .then((r) => r.json())
      .then((d) => {
        if (d.success) setUsers(d.data);
      })
      .catch(() => {});

    fetch('http://localhost:8000/api/v1/auth/user-requests')
      .then((r) => r.json())
      .then((d) => {
        if (d.success) setRequests(d.data);
      })
      .catch(() => {});
  };

  useEffect(() => {
    loadData();
  }, []);

  const handleApprove = async (id: string) => {
    try {
      const res = await fetch(`http://localhost:8000/api/v1/auth/user-requests/${id}/approve`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${localStorage.getItem('token')}`,
        },
      });
      const data = await res.json();
      if (data.success) loadData();
    } catch {}
  };

  const handleReject = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!rejectModalId) return;
    try {
      const res = await fetch(`http://localhost:8000/api/v1/auth/user-requests/${rejectModalId}/reject`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${localStorage.getItem('token')}`,
        },
        body: JSON.stringify({ reason: rejectReason }),
      });
      const data = await res.json();
      if (data.success) {
        setRejectModalId(null);
        setRejectReason('');
        loadData();
      }
    } catch {}
  };

  const handleDirectCreateUser = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      const res = await fetch('http://localhost:8000/api/v1/auth/admin/create-user', {
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
          role,
        }),
      });
      const data = await res.json();
      if (data.success) {
        setShowDirectCreateModal(false);
        setEmail('');
        setFirstName('');
        setLastName('');
        setPhone('');
        loadData();
      }
    } catch {}
  };

  const handleToggleStatus = async (userId: string, currentStatus: string) => {
    const nextStatus = currentStatus === 'active' ? 'suspended' : 'active';
    try {
      const res = await fetch(`http://localhost:8000/api/v1/auth/users/${userId}/status`, {
        method: 'PATCH',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${localStorage.getItem('token')}`,
        },
        body: JSON.stringify({ status: nextStatus, reason: 'Admin toggle' }),
      });
      const data = await res.json();
      if (data.success) loadData();
    } catch {}
  };

  const pendingRequests = requests.filter((r) => r.status === 'PENDING_APPROVAL');

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2 mb-1">
            <h1 className="text-xl font-bold text-slate-800 tracking-tight">
              User Management & Admin Approval Queue (Prompt 14)
            </h1>
            <span className="px-2 py-0.5 rounded text-[10px] font-bold uppercase bg-purple-100 text-purple-800 border border-purple-200">
              Admin Authority
            </span>
          </div>
          <p className="text-xs text-slate-500">
            Admin can create all roles directly (including Admin Maker). Requests submitted by Admin Maker require Admin approval. Public self-registration is closed under enterprise governance.
          </p>
        </div>

        <Button onClick={() => setShowDirectCreateModal(true)} className="text-xs bg-emerald-700 hover:bg-emerald-800">
          + Direct Create User (Instant Active)
        </Button>
      </div>

      {/* Tabs */}
      <div className="flex items-center gap-3 border-b border-slate-200 pb-2">
        <button
          onClick={() => setActiveTab('REQUESTS')}
          className={`px-4 py-2 rounded-xl text-xs font-bold transition flex items-center gap-2 ${
            activeTab === 'REQUESTS'
              ? 'bg-amber-600 text-white shadow-sm'
              : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
          }`}
        >
          <span>Pending Approvals Queue</span>
          {pendingRequests.length > 0 && (
            <span className="bg-white text-amber-800 text-[10px] px-2 py-0.5 rounded-full font-extrabold">
              {pendingRequests.length}
            </span>
          )}
        </button>

        <button
          onClick={() => setActiveTab('USERS')}
          className={`px-4 py-2 rounded-xl text-xs font-bold transition flex items-center gap-2 ${
            activeTab === 'USERS'
              ? 'bg-slate-900 text-white shadow-sm'
              : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
          }`}
        >
          <span>Active User Directory</span>
          <span className="bg-slate-200 text-slate-800 text-[10px] px-2 py-0.5 rounded-full font-bold">
            {users.length}
          </span>
        </button>
      </div>

      {/* Tab 1: Pending Approvals Queue */}
      {activeTab === 'REQUESTS' && (
        <div className="space-y-4">
          {requests.length > 0 ? (
            requests.map((req) => (
              <div
                key={req.id}
                className={`p-5 rounded-2xl border shadow-sm space-y-3 ${
                  req.status === 'PENDING_APPROVAL'
                    ? 'bg-white border-amber-300 ring-1 ring-amber-300/40'
                    : 'bg-slate-50 border-slate-200 opacity-80'
                }`}
              >
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 pb-2 border-b border-slate-100">
                  <div>
                    <div className="flex items-center gap-2">
                      <h3 className="text-sm font-bold text-slate-800">
                        {req.firstName} {req.lastName}
                      </h3>
                      <span className="px-2.5 py-0.5 rounded text-[10px] font-bold uppercase bg-emerald-100 text-emerald-800">
                        Role: {req.requestedRole}
                      </span>
                    </div>
                    <p className="text-xs text-slate-500 mt-0.5">
                      Email: <strong className="text-slate-700">{req.email}</strong> • Phone: {req.phone || '—'}
                    </p>
                  </div>

                  <div className="flex items-center gap-2">
                    <span
                      className={`px-2.5 py-1 rounded-full text-[10px] font-bold uppercase ${
                        req.status === 'PENDING_APPROVAL'
                          ? 'bg-amber-100 text-amber-800 border border-amber-200'
                          : req.status === 'APPROVED'
                          ? 'bg-emerald-100 text-emerald-800 border border-emerald-200'
                          : 'bg-red-100 text-red-800 border border-red-200'
                      }`}
                    >
                      {req.status}
                    </span>
                  </div>
                </div>

                <div className="text-xs text-slate-600 grid grid-cols-1 md:grid-cols-2 gap-2">
                  <div className="bg-slate-50 p-2.5 rounded-lg border border-slate-200">
                    <span className="text-[10px] text-slate-400 block font-semibold">REQUEST CREATED BY</span>
                    <strong className="text-slate-700">{req.requestedBy}</strong>
                  </div>
                  <div className="bg-slate-50 p-2.5 rounded-lg border border-slate-200">
                    <span className="text-[10px] text-slate-400 block font-semibold">APPLICANT NOTES</span>
                    <span className="italic text-slate-700">{req.notes || 'None'}</span>
                  </div>
                </div>

                {req.status === 'PENDING_APPROVAL' && (
                  <div className="pt-2 border-t border-slate-100 flex items-center justify-end gap-2">
                    <Button
                      variant="outline"
                      className="text-xs px-3 py-1.5 text-red-600 border-red-300 hover:bg-red-50"
                      onClick={() => setRejectModalId(req.id)}
                    >
                      Reject Request
                    </Button>
                    <Button
                      className="text-xs px-4 py-1.5 bg-emerald-700 hover:bg-emerald-800"
                      onClick={() => handleApprove(req.id)}
                    >
                      ✓ Approve & Create Active User
                    </Button>
                  </div>
                )}
              </div>
            ))
          ) : (
            <div className="p-12 text-center bg-white rounded-2xl border border-slate-200">
              <p className="text-sm text-slate-500">No user requests in the queue.</p>
            </div>
          )}
        </div>
      )}

      {/* Tab 2: User Directory */}
      {activeTab === 'USERS' && (
        <div className="bg-white rounded-2xl border border-slate-200 shadow-sm overflow-hidden">
          <div className="px-6 py-4 border-b border-slate-200 flex items-center justify-between">
            <h3 className="text-sm font-bold text-slate-800">
              Platform Registered Users ({users.length})
            </h3>
            <span className="text-xs text-slate-500 font-mono">
              Default password for all: AgriBridgeAI@2026
            </span>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full text-xs text-left text-slate-600">
              <thead className="text-[10px] font-bold text-slate-400 uppercase bg-slate-50 border-b border-slate-200">
                <tr>
                  <th className="px-6 py-3">Name</th>
                  <th className="px-6 py-3">Email</th>
                  <th className="px-6 py-3">Roles</th>
                  <th className="px-6 py-3">Phone</th>
                  <th className="px-6 py-3">Status</th>
                  <th className="px-6 py-3 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {users.map((u) => (
                  <tr key={u.id} className="hover:bg-slate-50 transition">
                    <td className="px-6 py-3.5 font-bold text-slate-800">
                      {u.firstName} {u.lastName}
                    </td>
                    <td className="px-6 py-3.5 font-mono text-slate-700">
                      {u.email}
                    </td>
                    <td className="px-6 py-3.5">
                      <div className="flex flex-wrap gap-1">
                        {u.roles?.map((r: string) => (
                          <span
                            key={r}
                            className={`px-2 py-0.5 rounded text-[10px] font-bold uppercase ${
                              r === 'ADMIN'
                                ? 'bg-purple-100 text-purple-800'
                                : r === 'ADMIN_MAKER'
                                ? 'bg-indigo-100 text-indigo-800'
                                : r === 'FARMER'
                                ? 'bg-emerald-100 text-emerald-800'
                                : 'bg-slate-100 text-slate-700'
                            }`}
                          >
                            {r}
                          </span>
                        ))}
                      </div>
                    </td>
                    <td className="px-6 py-3.5 text-slate-500">
                      {u.phone || '—'}
                    </td>
                    <td className="px-6 py-3.5">
                      <span
                        className={`px-2 py-0.5 rounded text-[10px] font-bold uppercase ${
                          u.status === 'active'
                            ? 'bg-emerald-100 text-emerald-800'
                            : 'bg-red-100 text-red-800'
                        }`}
                      >
                        {u.status}
                      </span>
                    </td>
                    <td className="px-6 py-3.5 text-right">
                      <button
                        onClick={() => handleToggleStatus(u.id, u.status)}
                        className={`text-xs font-semibold hover:underline ${
                          u.status === 'active' ? 'text-red-600' : 'text-emerald-600'
                        }`}
                      >
                        {u.status === 'active' ? 'Suspend' : 'Activate'}
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* Direct Create User Modal */}
      {showDirectCreateModal && (
        <div className="fixed inset-0 z-50 bg-black/50 flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl max-w-md w-full p-6 space-y-4 shadow-xl">
            <div className="flex justify-between items-center border-b pb-3">
              <h3 className="text-base font-bold text-slate-800">Directly Create Active User</h3>
              <button onClick={() => setShowDirectCreateModal(false)} className="text-slate-400 hover:text-slate-600">✕</button>
            </div>
            <form onSubmit={handleDirectCreateUser} className="space-y-3">
              <div className="p-3 bg-purple-50 rounded-xl border border-purple-200 text-xs text-purple-900">
                <strong>Super Admin Privilege:</strong> Admin can create any role directly (including Admin Maker and Admin) without going through approval. Password will be set to default <code>AgriBridgeAI@2026</code>.
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">Assign Role</label>
                <select
                  value={role}
                  onChange={(e) => setRole(e.target.value)}
                  className="w-full text-xs px-3 py-2 border rounded-lg bg-white"
                >
                  <option value="ADMIN_MAKER">ADMIN_MAKER (Under Admin; can request roles)</option>
                  <option value="ADMIN">ADMIN (Super Administrator)</option>
                  <option value="FARMER">FARMER (Cultivate & Sell)</option>
                  <option value="FARM_MANAGER">FARM_MANAGER (Operations)</option>
                  <option value="WORKER">WORKER (Field tasks)</option>
                  <option value="BUYER">BUYER (Produce Procurement)</option>
                  <option value="MANDI_AGENT">MANDI_AGENT (APMC Yard)</option>
                </select>
              </div>

              <div className="grid grid-cols-2 gap-2">
                <Input label="First Name" value={firstName} onChange={(e) => setFirstName(e.target.value)} required id="firstName" />
                <Input label="Last Name" value={lastName} onChange={(e) => setLastName(e.target.value)} required id="lastName" />
              </div>

              <Input label="Email Address" type="email" value={email} onChange={(e) => setEmail(e.target.value)} required placeholder="user@agribridge.com" id="email" />
              <Input label="Phone Number" type="tel" value={phone} onChange={(e) => setPhone(e.target.value)} placeholder="+91 98765 00000" id="phone" />

              <div className="pt-2 flex justify-end gap-2">
                <Button variant="outline" type="button" onClick={() => setShowDirectCreateModal(false)}>Cancel</Button>
                <Button type="submit">Create Active User</Button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Reject Request Modal */}
      {rejectModalId && (
        <div className="fixed inset-0 z-50 bg-black/50 flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl max-w-md w-full p-6 space-y-4 shadow-xl">
            <div className="flex justify-between items-center border-b pb-3">
              <h3 className="text-base font-bold text-slate-800">Reject User Request</h3>
              <button onClick={() => setRejectModalId(null)} className="text-slate-400 hover:text-slate-600">✕</button>
            </div>
            <form onSubmit={handleReject} className="space-y-3">
              <Input
                label="Rejection Reason"
                value={rejectReason}
                onChange={(e) => setRejectReason(e.target.value)}
                placeholder="e.g. Incomplete farm documents, invalid jurisdiction"
                required
                id="rejectReason"
              />
              <div className="pt-2 flex justify-end gap-2">
                <Button variant="outline" type="button" onClick={() => setRejectModalId(null)}>Cancel</Button>
                <Button type="submit" className="bg-red-600 hover:bg-red-700 text-white">Confirm Rejection</Button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
