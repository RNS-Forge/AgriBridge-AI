// ---------------------------------------------------------------------------
// Export service — all /export API calls.
// ---------------------------------------------------------------------------

import { apiGet, apiPost, apiPut } from './api';
import type { ExportFile, EligibilityReport } from '../types';

interface ApiWrapper<T> {
  success: boolean;
  data: T;
}

export async function listExportsApi(
  token: string,
  tenantId: string
): Promise<ExportFile[]> {
  const res = await apiGet<ApiWrapper<ExportFile[]>>(
    '/export/list',
    token,
    tenantId
  );
  return res.data ?? [];
}

export async function runEligibilityApi(
  exportId: string,
  token: string
): Promise<EligibilityReport> {
  const res = await apiPost<ApiWrapper<EligibilityReport>>(
    `/export/${exportId}/check-eligibility`,
    {},
    token
  );
  return res.data;
}

export async function updateCustomsApi(
  exportId: string,
  payload: {
    commercialInvoiceNumber: string;
    commercialInvoiceUrl: string;
    packingListUrl: string;
    customsStatus: string;
    customsDeclarationNumber: string;
  },
  token: string
): Promise<void> {
  await apiPut(`/export/${exportId}`, payload, token);
}

export async function registerShipmentApi(
  payload: {
    exportId: string;
    carrierName: string;
    containerNumber: string;
    billOfLadingNumber: string;
    originPort: string;
    destinationPort: string;
  },
  token: string
): Promise<void> {
  await apiPost('/export/shipment', payload, token);
}
