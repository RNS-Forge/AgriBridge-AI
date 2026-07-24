// ---------------------------------------------------------------------------
// Farmer service — all /farmer API calls.
// ---------------------------------------------------------------------------

import { apiGet, apiPost, apiPatch } from './api';
import type { Farmer } from '../types';

interface ApiWrapper<T> {
  success: boolean;
  data: T;
}

export async function listFarmersApi(
  token: string,
  tenantId: string
): Promise<Farmer[]> {
  const res = await apiGet<ApiWrapper<Farmer[]>>(
    '/farmer/list',
    token,
    tenantId
  );
  return res.data ?? [];
}

export async function registerFarmerApi(
  payload: {
    tenantId: string;
    email: string;
    password: string;
    firstName: string;
    lastName: string;
    aadhaarNumber: string;
    registrationNumber: string;
    bankName: string;
    accountNumber: string;
    ifscCode: string;
    farmName: string;
    totalAreaHectares: number;
  },
  token: string,
  tenantId: string
): Promise<void> {
  await apiPost('/farmer/register', payload, token, tenantId);
}

export async function approveKycApi(
  farmerId: string,
  token: string,
  tenantId: string
): Promise<void> {
  await apiPatch(`/farmer/${farmerId}/kyc`, { kycStatus: 'verified' }, token, tenantId);
}
