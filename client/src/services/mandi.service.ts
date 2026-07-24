// ---------------------------------------------------------------------------
// Mandi service — all /mandi API calls.
// ---------------------------------------------------------------------------

import { apiGet } from './api';
import type { MandiPrice } from '../types';

interface ApiWrapper<T> {
  success: boolean;
  data: T;
}

export async function listMandiPricesApi(
  token: string,
  params: { commodity?: string; state?: string; limit?: number } = {}
): Promise<MandiPrice[]> {
  const qs = new URLSearchParams();
  qs.set('limit', String(params.limit ?? 25));
  if (params.commodity) qs.set('commodity', params.commodity);
  if (params.state) qs.set('state', params.state);

  const res = await apiGet<ApiWrapper<MandiPrice[]>>(
    `/mandi/prices?${qs.toString()}`,
    token
  );
  return res.data ?? [];
}
