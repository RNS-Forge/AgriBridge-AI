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
    <div className="p-6 md:p-8 space-y-8">
      {/* Header */}
      <div className="bg-white rounded-xl border border-gray-200 p-6">
        <div className="space-y-2">
          <h1 className="text-2xl font-semibold tracking-tight text-gray-900">
            Super Control Center
          </h1>
          <p className="text-sm text-gray-500 max-w-xl">
            Global system dashboard stats, subscription tiers adjustments, and audit streams.
            Manage platform-wide configuration and monitor system health.
          </p>
        </div>
      </div>

      {loading ? (
        <div className="text-center py-12 text-gray-500">
          <div className="inline-block w-8 h-8 border-2 border-blue-500 border-t-transparent rounded-full animate-spin mb-4" />
          <p>Loading admin data...</p>
        </div>
      ) : (
        <div className="space-y-8">
          {/* Metrics Grid */}
          <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
            <div className="bg-white rounded-xl border border-gray-200 p-5 hover:shadow-sm transition-all duration-200">
              <span className="block text-xs font-semibold text-gray-500 uppercase tracking-wider mb-2">Total Tenants</span>
              <span className="text-3xl font-bold text-gray-900">{metrics?.totalTenants || 0}</span>
            </div>
            <div className="bg-white rounded-xl border border-gray-200 p-5 hover:shadow-sm transition-all duration-200">
              <span className="block text-xs font-semibold text-gray-500 uppercase tracking-wider mb-2">Platform Users</span>
              <span className="text-3xl font-bold text-gray-900">{metrics?.totalUsers || 0}</span>
            </div>
            <div className="bg-white rounded-xl border border-gray-200 p-5 hover:shadow-sm transition-all duration-200">
              <span className="block text-xs font-semibold text-gray-500 uppercase tracking-wider mb-2">Harvests Logged</span>
              <span className="text-3xl font-bold text-gray-900">{metrics?.totalHarvestsKg || 0} kg</span>
            </div>
            <div className="bg-white rounded-xl border border-gray-200 p-5 hover:shadow-sm transition-all duration-200">
              <span className="block text-xs font-semibold text-gray-500 uppercase tracking-wider mb-2">Commercial POs</span>
              <span className="text-3xl font-bold text-gray-900">{metrics?.totalOrdersCount || 0}</span>
            </div>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
            {/* Tenants List Panel */}
            <div className="lg:col-span-2 bg-white rounded-xl border border-gray-200 p-6 space-y-4">
              <h3 className="font-semibold text-gray-900">Tenant Workspace Management</h3>
              <div className="space-y-4 overflow-y-auto max-h-[400px]">
                {tenants.map((ten) => (
                  <div
                    key={ten.id}
                    className="bg-gray-50 p-4 rounded-lg border border-gray-200 flex justify-between items-center text-sm hover:border-blue-500/30 transition-colors"
                  >
                    <div>
                      <p className="font-semibold text-gray-900">{ten.name}</p>
                      <p className="text-gray-500 font-mono text-xs">ID: {ten.id.slice(0, 8)} | Plan: {ten.subscriptionPlan}</p>
                    </div>
                    <div className="flex space-x-2">
                      <select
                        value={ten.subscriptionPlan}
                        onChange={(e) => handleUpdateTenant(ten.id, undefined, e.target.value)}
                        className="bg-white border border-gray-300 focus:border-blue-500 rounded px-2 py-1.5 text-gray-700 focus:outline-none transition-colors text-sm"
                      >
                        <option value="free">Free</option>
                        <option value="premium">Premium</option>
                        <option value="enterprise">Enterprise</option>
                      </select>
                      <Button
                        onClick={() => handleUpdateTenant(ten.id, ten.status === 'active' ? 'suspended' : 'active')}
                        className={`px-3 py-1.5 text-sm font-semibold rounded-lg transition-colors ${
                          ten.status === 'active'
                            ? 'bg-red-600/10 text-red-600 border border-red-600/20 hover:bg-red-600/20'
                            : 'bg-emerald-600/10 text-emerald-600 border border-emerald-600/20 hover:bg-emerald-600/20'
                        }`}
                      >
                        {ten.status === 'active' ? 'Suspend' : 'Activate'}
                      </Button>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* Platform Settings Panel */}
            <div className="bg-white rounded-xl border border-gray-200 p-6 space-y-4">
              <h3 className="font-semibold text-gray-900">Global Configuration</h3>
              <form onSubmit={handleCreateSetting} className="space-y-3">
                <div>
                  <label className="block text-xs font-semibold text-gray-500 uppercase tracking-wider mb-1">Key Name</label>
                  <input
                    type="text"
                    required
                    value={newKey}
                    onChange={(e) => setNewKey(e.target.value)}
                    className="w-full bg-white border border-gray-300 rounded-lg px-3 py-2 text-sm text-gray-900 placeholder-gray-500 focus:border-blue-500 focus:ring-blue-500"
                    placeholder="ALLOW_EXPORTS_GLOBAL"
                  />
                </div>
                <div>
                  <label className="block text-xs font-semibold text-gray-500 uppercase tracking-wider mb-1">Setting Value</label>
                  <input
                    type="text"
                    required
                    value={newVal}
                    onChange={(e) => setNewVal(e.target.value)}
                    className="w-full bg-white border border-gray-300 rounded-lg px-3 py-2 text-sm text-gray-900 placeholder-gray-500 focus:border-blue-500 focus:ring-blue-500"
                    placeholder="true"
                  />
                </div>
                <Button
                  type="submit"
                  className="w-full px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white text-sm font-semibold rounded-lg transition-colors duration-200"
                >
                  Save Setting
                  <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                    <path strokeLinecap="round" strokeLinejoin="round" d="M13.5 4.5L21 12m0 0l-7.5 7.5M21 12H3" />
                  </svg>
                </Button>
              </form>

              <div className="border-t border-gray-200 pt-4 space-y-2 max-h-[160px] overflow-y-auto text-xs text-gray-500">
                {metrics?.activeSettings.map((s) => (
                  <div key={s.settingKey} className="flex justify-between font-mono bg-gray-50 p-2 rounded">
                    <span className="text-gray-600">{s.settingKey}:</span>
                    <span className="text-emerald-600 font-bold">{s.settingValue}</span>
                  </div>
                ))}
              </div>
            </div>
          </div>

          {/* Audit Logs Panel */}
          <div className="bg-white rounded-xl border border-gray-200 p-6 space-y-4">
            <h3 className="font-semibold text-gray-900">Security Audit Logs Trail</h3>
            <div className="space-y-3 max-h-[300px] overflow-y-auto">
              {logs.map((log) => (
                <div
                  key={log.id}
                  className="bg-gray-50 p-3 rounded-lg border border-gray-200 text-xs font-mono flex justify-between items-center text-gray-600 hover:border-blue-500/30 transition-colors"
                >
                  <div>
                    <span className="text-rose-600 font-bold mr-3">[{log.action}]</span>
                    <span>Entity: {log.entityName} ({log.entityId.slice(0, 8)})</span>
                  </div>
                  <div className="text-gray-500">
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