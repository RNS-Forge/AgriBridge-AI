import { useState, useEffect } from 'react';

export default function AdminAuditLogsView() {
  const [logs, setLogs] = useState<any[]>([]);

  useEffect(() => {
    fetch('http://localhost:8000/api/v1/admin/audit-logs')
      .then((r) => r.json())
      .then((d) => {
        if (d.success) setLogs(d.data);
      })
      .catch(() => {});
  }, []);

  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <h1 className="text-xl font-bold text-slate-800 tracking-tight">
          System Audit Logs (Prompt 14)
        </h1>
        <p className="text-xs text-slate-500 mt-0.5">
          Immutable audit record of all security-sensitive actions: role approvals, permission grants, user status toggles, and moderations.
        </p>
      </div>

      {/* Audit Logs Table */}
      <div className="bg-white rounded-2xl border border-slate-200 shadow-sm overflow-hidden">
        <div className="px-6 py-4 border-b border-slate-200 flex items-center justify-between">
          <h3 className="text-sm font-bold text-slate-800">
            Audit Trail ({logs.length} Events)
          </h3>
          <span className="text-xs text-slate-400">Append-only compliance log</span>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-xs text-left text-slate-600">
            <thead className="text-[10px] font-bold text-slate-400 uppercase bg-slate-50 border-b border-slate-200">
              <tr>
                <th className="px-6 py-3">Timestamp</th>
                <th className="px-6 py-3">Action</th>
                <th className="px-6 py-3">Target Entity</th>
                <th className="px-6 py-3">Actor</th>
                <th className="px-6 py-3">Audit Details</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 font-mono text-[11px]">
              {logs.map((log) => (
                <tr key={log.id} className="hover:bg-slate-50 transition">
                  <td className="px-6 py-3.5 text-slate-500 whitespace-nowrap">
                    {new Date(log.timestamp).toLocaleString()}
                  </td>
                  <td className="px-6 py-3.5 font-bold text-slate-800">
                    <span className="px-2 py-0.5 rounded bg-slate-100 text-slate-700 text-[10px] uppercase font-bold">
                      {log.action}
                    </span>
                  </td>
                  <td className="px-6 py-3.5 text-slate-700">
                    {log.targetEntity}
                  </td>
                  <td className="px-6 py-3.5 text-slate-600">
                    {log.actorEmail}
                  </td>
                  <td className="px-6 py-3.5 text-slate-500 font-sans text-xs max-w-sm truncate">
                    {JSON.stringify(log.details)}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
