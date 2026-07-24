import { useState, useEffect } from 'react';
import { useSelector } from 'react-redux';
import { RootState } from '../../store/index.js';
import { Button } from '../../components/ui/Button/index.js';

interface DashboardMetrics {
  totalTenants: number;
  totalUsers: number;
  totalHarvestsKg: number;
  totalOrdersCount: number;
  premiumSubscriptionsCount: number;
  activeSettings: Array<{ settingKey: string; settingValue: string }>;
}

interface Tenant {
  id: string;
  name: string;
  licenseNumber: string | null;
  status: string;
  subscriptionPlan: string;
  createdAt: string;
}

interface AuditLog {
  id: string;
  userId: string | null;
  tenantId: string | null;
  action: string;
  entityName: string;
  entityId: string;
  createdAt: string;
}

export default function SuperAdmin() {
  const { token } = useSelector((state: RootState) => state.auth);
  const [metrics, setMetrics] = useState<DashboardMetrics | null>(null);
  const [tenants, setTenants] = useState<Tenant[]>([]);
  const [logs, setLogs] = useState<AuditLog[]>([]);
  const [loading, setLoading] = useState(false);

  // Platform setting inputs
  const [newKey, setNewKey] = useState('');
  const [newVal, setNewVal] = useState('');

  const fetchData = async () => {
    setLoading(true);
    try {
      // Fetch Dashboard Metrics
      const mRes = await fetch('http://localhost:8000/api/v1/superadmin/dashboard', {
        headers: { 'Authorization': `Bearer ${token}` },
      });
      const mData = await mRes.json();
      if (mRes.ok) setMetrics(mData.data);

      // Fetch Tenants list
      const tRes = await fetch('http://localhost:8000/api/v1/superadmin/tenants', {
        headers: { 'Authorization': `Bearer ${token}` },
      });
      const tData = await tRes.json();
      if (tRes.ok) setTenants(tData.data || []);

      // Fetch Audit logs
      const aRes = await fetch('http://localhost:8000/api/v1/superadmin/audit-logs?limit=15', {
        headers: { 'Authorization': `Bearer ${token}` },
      });
      const aData = await aRes.json();
      if (aRes.ok) setLogs(aData.data || []);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, []);

  const handleUpdateTenant = async (tenantId: string, status?: string, plan?: string) => {
    try {
      const res = await fetch(`http://localhost:8000/api/v1/superadmin/tenants/${tenantId}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`,
        },
        body: JSON.stringify({
          ...(status ? { status } : {}),
          ...(plan ? { subscriptionPlan: plan } : {}),
        }),
      });

      if (res.ok) {
        alert('Tenant updated successfully.');
        fetchData();
      }
    } catch (err) {
      alert('Error updating tenant');
    }
  };

  const handleCreateSetting = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      const res = await fetch('http://localhost:8000/api/v1/superadmin/settings', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`,
        },
        body: JSON.stringify({ settingKey: newKey, settingValue: newVal }),
      });

      if (res.ok) {
        setNewKey('');
        setNewVal('');
        alert('Platform setting saved successfully.');
        fetchData();
      }
    } catch (err) {
      alert('Error saving setting');
    }
  };

  return (
    <div className="space-y-8">
      {/* Header */}
      <div className="relative overflow-hidden bg-gradient-to-br from-slate-900 via-rose-950/30 to-slate-900 p-8 rounded-3xl border border-slate-800">
        {/* Decorative elements */}
        <div className="absolute top-0 right-0 w-64 h-64 bg-rose-600/10 rounded-full blur-3xl -translate-y-1/2 translate-x-1/2" />
        <div className="absolute bottom-0 left-0 w-48 h-48 bg-pink-500/8 rounded-full blur-3xl translate-y-1/2 -translate-x-1/2" />
        
        <div className="relative z-10 space-y-2">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-rose-500/10 border border-rose-500/20 text-rose-400 text-xs font-medium">
            <span className="w-1.5 h-1.5 rounded-full bg-rose-400 animate-pulse" />
            Platform Administration
          </div>
          <h1 className="text-3xl font-extrabold text-slate-100">
            Super <span className="text-transparent bg-clip-text bg-gradient-to-r from-rose-400 to-pink-300">Control Center</span>
          </h1>
          <p className="text-slate-400 text-sm max-w-xl">
            Global system dashboard stats, subscription tiers adjustments, and audit streams.
            Manage platform-wide configuration and monitor system health.
          </p>
        </div>
      </div>

      {loading ? (
        <div className="text-center py-12 text-slate-400">
          <div className="inline-block w-8 h-8 border-2 border-rose-500/30 border-t-rose-500 rounded-full animate-spin mb-4" />
          <p>Loading admin data...</p>
        </div>
      ) : (
        <div className="space-y-8">
          {/* Metrics grids */}
          <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
            <div className="bg-slate-900/60 backdrop-blur-sm border border-slate-800 rounded-2xl p-5 hover:border-rose-500/30 transition-all duration-300">
              <span className="block text-xs font-semibold text-slate-500 uppercase tracking-wider mb-2">Total Tenants</span>
              <span className="text-3xl font-extrabold text-slate-100">{metrics?.totalTenants || 0}</span>
            </div>
            <div className="bg-slate-900/60 backdrop-blur-sm border border-slate-800 rounded-2xl p-5 hover:border-rose-500/30 transition-all duration-300">
              <span className="block text-xs font-semibold text-slate-500 uppercase tracking-wider mb-2">Platform Users</span>
              <span className="text-3xl font-extrabold text-slate-100">{metrics?.totalUsers || 0}</span>
            </div>
            <div className="bg-slate-900/60 backdrop-blur-sm border border-slate-800 rounded-2xl p-5 hover:border-rose-500/30 transition-all duration-300">
              <span className="block text-xs font-semibold text-slate-500 uppercase tracking-wider mb-2">Harvests Logged</span>
              <span className="text-3xl font-extrabold text-slate-100">{metrics?.totalHarvestsKg || 0} kg</span>
            </div>
            <div className="bg-slate-900/60 backdrop-blur-sm border border-slate-800 rounded-2xl p-5 hover:border-rose-500/30 transition-all duration-300">
              <span className="block text-xs font-semibold text-slate-500 uppercase tracking-wider mb-2">Commercial POs</span>
              <span className="text-3xl font-extrabold text-slate-100">{metrics?.totalOrdersCount || 0}</span>
            </div>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
            {/* Tenants list panel */}
            <div className="lg:col-span-2 bg-slate-900/60 backdrop-blur-sm border border-slate-800 rounded-2xl p-6 space-y-4">
              <h3 className="font-bold text-slate-200">Tenant Workspace Management</h3>
              <div className="space-y-4 overflow-y-auto max-h-[400px]">
                {tenants.map((ten) => (
                  <div key={ten.id} className="bg-slate-950 p-4 rounded-xl border border-slate-850 flex justify-between items-center text-xs hover:border-rose-500/30 transition-colors">
                    <div>
                      <p className="font-bold text-slate-200 text-sm">{ten.name}</p>
                      <p className="text-slate-500 font-mono">ID: {ten.id.slice(0, 8)} | Plan: {ten.subscriptionPlan}</p>
                    </div>
                    <div className="flex space-x-2">
                      <select
                        value={ten.subscriptionPlan}
                        onChange={(e) => handleUpdateTenant(ten.id, undefined, e.target.value)}
                        className="bg-slate-900 border border-slate-850 focus:border-rose-500/60 rounded px-2 py-1.5 text-slate-300 focus:outline-none transition-colors"
                      >
                        <option value="free">Free</option>
                        <option value="premium">Premium</option>
                        <option value="enterprise">Enterprise</option>
                      </select>
                      <button
                        onClick={() => handleUpdateTenant(ten.id, ten.status === 'active' ? 'suspended' : 'active')}
                        className={`px-3 py-1.5 font-semibold rounded-lg transition-colors ${
                          ten.status === 'active'
                            ? 'bg-red-950/20 text-red-400 border border-red-900/50 hover:bg-red-900/30'
                            : 'bg-emerald-950/50 text-emerald-400 border border-emerald-900/50 hover:bg-emerald-900/30'
                        }`}
                      >
                        {ten.status === 'active' ? 'Suspend' : 'Activate'}
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* Platform settings panel */}
            <div className="bg-slate-900/60 backdrop-blur-sm border border-slate-800 rounded-2xl p-6 space-y-4">
              <h3 className="font-bold text-slate-200">Global Configuration</h3>
              <form onSubmit={handleCreateSetting} className="space-y-3">
                <div>
                  <label className="block text-[10px] font-semibold text-slate-500 uppercase tracking-wider mb-1">Key Name</label>
                  <input
                    type="text"
                    required
                    value={newKey}
                    onChange={(e) => setNewKey(e.target.value)}
                    className="w-full bg-slate-950 border border-slate-850 focus:border-rose-500/60 rounded px-3 py-2 text-xs text-slate-100 placeholder-slate-600 focus:outline-none transition-colors"
                    placeholder="ALLOW_EXPORTS_GLOBAL"
                  />
                </div>
                <div>
                  <label className="block text-[10px] font-semibold text-slate-500 uppercase tracking-wider mb-1">Setting Value</label>
                  <input
                    type="text"
                    required
                    value={newVal}
                    onChange={(e) => setNewVal(e.target.value)}
                    className="w-full bg-slate-950 border border-slate-850 focus:border-rose-500/60 rounded px-3 py-2 text-xs text-slate-100 placeholder-slate-600 focus:outline-none transition-colors"
                    placeholder="true"
                  />
                </div>
                <Button type="submit">
                  Save Setting
                  <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                    <path strokeLinecap="round" strokeLinejoin="round" d="M13.5 4.5L21 12m0 0l-7.5 7.5M21 12H3" />
                  </svg>
                </Button>
              </form>

              <div className="border-t border-slate-800/80 pt-4 space-y-2 max-h-[160px] overflow-y-auto text-[11px] text-slate-400">
                {metrics?.activeSettings.map((s) => (
                  <div key={s.settingKey} className="flex justify-between font-mono bg-slate-950 p-2 rounded">
                    <span className="text-slate-500">{s.settingKey}:</span>
                    <span className="text-emerald-400 font-bold">{s.settingValue}</span>
                  </div>
                ))}
              </div>
            </div>
          </div>

          {/* Audit Logs stream */}
          <div className="bg-slate-900/60 backdrop-blur-sm border border-slate-800 rounded-2xl p-6 space-y-4">
            <h3 className="font-bold text-slate-200">Security Audit Logs Trail</h3>
            <div className="space-y-3 max-h-[300px] overflow-y-auto">
              {logs.map((log) => (
                <div key={log.id} className="bg-slate-950 p-3 rounded-xl border border-slate-850/80 text-[11px] font-mono flex justify-between items-center text-slate-400 hover:border-rose-500/30 transition-colors">
                  <div>
                    <span className="text-rose-400 font-bold mr-3">[{log.action}]</span>
                    <span>Entity: {log.entityName} ({log.entityId.slice(0, 8)})</span>
                  </div>
                  <div className="text-slate-600">
                    {new Date(log.createdAt).toLocaleString()}
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
