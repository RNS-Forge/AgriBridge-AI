import { useState, useEffect, useMemo } from 'react';
import {
  EnterpriseDataTable,
  DataTableColumn,
  DataTableTab,
} from '../../components/ui/index.js';

export default function AdminAuditLogsView() {
  const [logs, setLogs] = useState<any[]>([]);
  const [activeTabId, setActiveTabId] = useState<'ALL' | 'AUTH' | 'MODERATION'>('ALL');
  const [loading, setLoading] = useState(true);

  const loadLogs = () => {
    setLoading(true);
    fetch('http://localhost:8000/api/v1/admin/audit-logs')
      .then((r) => r.json())
      .then((d) => {
        if (d.success) setLogs(d.data || []);
      })
      .catch(() => {})
      .finally(() => setLoading(false));
  };

  useEffect(() => {
    loadLogs();
  }, []);

  const authLogs = useMemo(
    () =>
      logs.filter(
        (l) =>
          l.action?.includes('APPROVE') ||
          l.action?.includes('REJECT') ||
          l.action?.includes('USER') ||
          l.action?.includes('CREATE')
      ),
    [logs]
  );

  const moderationLogs = useMemo(
    () => logs.filter((l) => l.action?.includes('MODERATE') || l.action?.includes('LISTING') || l.action?.includes('DISPUTE')),
    [logs]
  );

  const filteredData = useMemo(() => {
    if (activeTabId === 'AUTH') return authLogs;
    if (activeTabId === 'MODERATION') return moderationLogs;
    return logs;
  }, [activeTabId, authLogs, moderationLogs, logs]);

  const tabs: DataTableTab[] = [
    {
      id: 'ALL',
      label: 'All Security Events',
      count: logs.length,
      badgeColor: 'bg-slate-100 text-slate-800 border border-slate-300',
    },
    {
      id: 'AUTH',
      label: 'Role & User Approvals',
      count: authLogs.length,
      badgeColor: 'bg-emerald-100 text-emerald-900 border border-emerald-300',
    },
    {
      id: 'MODERATION',
      label: 'Moderation & Disputes',
      count: moderationLogs.length,
      badgeColor: 'bg-indigo-100 text-indigo-900 border border-indigo-300',
    },
  ];

  const columns: DataTableColumn[] = [
    {
      key: 'timestamp',
      header: 'Event Timestamp',
      sortable: true,
      searchable: true,
      searchPlaceholder: 'Timestamp...',
      render: (log) => (
        <span className="text-slate-500 font-mono text-[10.5px] whitespace-nowrap">
          {log.timestamp ? new Date(log.timestamp).toLocaleString() : '—'}
        </span>
      ),
    },
    {
      key: 'action',
      header: 'Security Action',
      sortable: true,
      searchable: true,
      searchPlaceholder: 'Action...',
      render: (log) => (
        <span className="px-1.5 py-0.2 rounded bg-slate-100 text-slate-800 border border-slate-200 text-[9.5px] uppercase font-bold font-mono tracking-wide whitespace-nowrap">
          {log.action}
        </span>
      ),
    },
    {
      key: 'entityName',
      header: 'Target Entity',
      sortable: true,
      searchable: true,
      searchPlaceholder: 'Entity...',
      render: (log) => (
        <span className="font-semibold text-slate-800 text-[11px] whitespace-nowrap">
          {log.entityName || log.targetEntity || 'System'}
        </span>
      ),
    },
    {
      key: 'userName',
      header: 'Actor / User',
      sortable: true,
      searchable: true,
      searchPlaceholder: 'Actor name...',
      render: (log) => (
        <span className="text-slate-700 font-medium text-[11px] whitespace-nowrap">
          {log.userName || log.actorEmail || 'Admin'}
        </span>
      ),
    },
    {
      key: 'newValue',
      header: 'Audit Trail Details',
      searchable: true,
      searchPlaceholder: 'Details...',
      render: (log) => (
        <span
          className="text-slate-600 text-[11px] max-w-md truncate block"
          title={log.newValue || JSON.stringify(log.details || '')}
        >
          {log.newValue || JSON.stringify(log.details || '') || '—'}
        </span>
      ),
    },
  ];

  return (
    <div className="space-y-4 w-full max-w-full min-w-0">
      <EnterpriseDataTable
        title="System Compliance Audit Logs"
        subtitle="Immutable audit record of all security-sensitive actions: role approvals, user status changes, and market moderations."
        data={filteredData}
        columns={columns}
        keyExtractor={(item) => item.id || `aud-${Math.random()}`}
        tabs={tabs}
        activeTab={activeTabId}
        onTabChange={(id) => setActiveTabId(id as any)}
        onRefresh={loadLogs}
        exportFilename="AgriBridge_Security_Audit_Logs"
        loading={loading}
        selectable={false}
      />
    </div>
  );
}
