// ---------------------------------------------------------------------------
// Central HTTP client.
//
// WHY: Every feature was calling fetch('http://localhost:8000/api/v1/...')
// directly. One env-var change now fixes the entire app instead of 30+ call
// sites. Vite exposes VITE_* vars at build time via import.meta.env.
//
// Usage:
//   import { apiGet, apiPost, apiPatch, apiPut } from '@/services/api';
//   const data = await apiGet('/farmer/list', token, tenantId);
// ---------------------------------------------------------------------------

/** Base URL read from .env → VITE_API_URL, falls back to localhost for dev */
export const API_BASE_URL: string =
  (import.meta.env.VITE_API_URL as string | undefined) ??
  'http://localhost:8000/api/v1';

// ── Internal helper ──────────────────────────────────────────────────────────

interface RequestOptions {
  token?: string | null;
  tenantId?: string | null;
  headers?: Record<string, string>;
}

async function request<T>(
  method: 'GET' | 'POST' | 'PUT' | 'PATCH' | 'DELETE',
  path: string,
  body?: unknown,
  opts: RequestOptions = {}
): Promise<T> {
  const headers: Record<string, string> = {
    'Content-Type': 'application/json',
    ...opts.headers,
  };

  if (opts.token) {
    headers['Authorization'] = `Bearer ${opts.token}`;
  }

  if (opts.tenantId) {
    headers['X-Tenant-ID'] = opts.tenantId;
  }

  const response = await fetch(`${API_BASE_URL}${path}`, {
    method,
    headers,
    body: body !== undefined ? JSON.stringify(body) : undefined,
  });

  const json = await response.json();

  if (!response.ok) {
    throw new Error(json.message ?? `HTTP ${response.status}`);
  }

  return json as T;
}

// ── Public helpers ────────────────────────────────────────────────────────────

export const apiGet = <T>(
  path: string,
  token?: string | null,
  tenantId?: string | null
): Promise<T> => request<T>('GET', path, undefined, { token, tenantId });

export const apiPost = <T>(
  path: string,
  body: unknown,
  token?: string | null,
  tenantId?: string | null,
  extraHeaders?: Record<string, string>
): Promise<T> =>
  request<T>('POST', path, body, { token, tenantId, headers: extraHeaders });

export const apiPut = <T>(
  path: string,
  body: unknown,
  token?: string | null,
  tenantId?: string | null
): Promise<T> => request<T>('PUT', path, body, { token, tenantId });

export const apiPatch = <T>(
  path: string,
  body: unknown,
  token?: string | null,
  tenantId?: string | null
): Promise<T> => request<T>('PATCH', path, body, { token, tenantId });
