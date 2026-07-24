// ---------------------------------------------------------------------------
// Auth service — all /auth API calls in one place.
// Features import these functions instead of writing raw fetch calls.
// ---------------------------------------------------------------------------

import { apiPost } from './api';
import type { AuthResponseDto } from '../types';

// ── Types ────────────────────────────────────────────────────────────────────

// What the server returns on successful login / register
export interface AuthResponseDto {
  accessToken: string;
  refreshToken: string;
  user: {
    id: string;
    email: string;
    firstName?: string;
    lastName?: string;
    tenantId?: string;
    roles: string[];
  };
}

interface ApiWrapper<T> {
  success: boolean;
  message: string;
  data: T;
}

// ── API calls ─────────────────────────────────────────────────────────────────

export async function loginApi(
  email: string,
  password: string
): Promise<AuthResponseDto> {
  const res = await apiPost<ApiWrapper<AuthResponseDto>>('/auth/login', {
    email,
    password,
  });
  return res.data;
}

export async function registerTenantApi(payload: {
  tenantName: string;
  email: string;
  password: string;
  firstName?: string;
  lastName?: string;
  licenseNumber?: string;
}): Promise<AuthResponseDto> {
  const res = await apiPost<ApiWrapper<AuthResponseDto>>(
    '/auth/register/tenant',
    payload
  );
  return res.data;
}

export async function verifyEmailApi(
  email: string,
  otp: string
): Promise<void> {
  await apiPost('/auth/verify-email', { email, otp });
}

export async function forgotPasswordApi(email: string): Promise<void> {
  await apiPost('/auth/forgot-password', { email });
}

export async function resetPasswordApi(
  email: string,
  otp: string,
  newPassword: string
): Promise<void> {
  await apiPost('/auth/reset-password', { email, otp, newPassword });
}

export async function refreshTokensApi(
  refreshToken: string
): Promise<{ accessToken: string; refreshToken: string }> {
  const res = await apiPost<
    ApiWrapper<{ accessToken: string; refreshToken: string }>
  >('/auth/refresh', { refreshToken });
  return res.data;
}

export async function logoutApi(refreshToken: string): Promise<void> {
  await apiPost('/auth/logout', { refreshToken });
}
