// ---------------------------------------------------------------------------
// SuperAdmin service — all /superadmin API calls.
// ---------------------------------------------------------------------------

import { apiGet, apiPost, apiPut } from './api';
import type { DashboardMetrics, Tenant, AuditLog } from '../types';

interface ApiWrapper<T> {
  success: boolean;
  data: T;
}

export async function fetchAdminMetricsApi(
  token: string
): Promise<DashboardMetrics> {
  const res = await apiGet<ApiWrapper<DashboardMetrics>>(
    '/superadmin/dashboard',
    token
  );
  return res.data;
}

export async function listTenantsApi(token: string): Promise<Tenant[]> {
  const res = await apiGet<ApiWrapper<Tenant[]>>('/superadmin/tenants', token);
  return res.data ?? [];
}

export async function listAuditLogsApi(
  token: string,
  limit = 15
): Promise<AuditLog[]> {
  const res = await apiGet<ApiWrapper<AuditLog[]>>(
    `/superadmin/audit-logs?limit=${limit}`,
    token
  );
  return res.data ?? [];
}

export async function updateTenantApi(
  tenantId: string,
  payload: { status?: string; subscriptionPlan?: string },
  token: string
): Promise<void> {
  await apiPut(`/superadmin/tenants/${tenantId}`, payload, token);
}

export async function createSettingApi(
  settingKey: string,
  settingValue: string,
  token: string
): Promise<void> {
  await apiPost('/superadmin/settings', { settingKey, settingValue }, token);
}
