// ---------------------------------------------------------------------------
// Marketplace service — all /marketplace API calls.
// ---------------------------------------------------------------------------

import { apiGet, apiPost } from './api';
import type { Listing } from '../types';

interface ApiWrapper<T> {
  success: boolean;
  data: T;
}

export async function listListingsApi(
  token: string,
  params: { search?: string; minPrice?: string; maxPrice?: string } = {}
): Promise<Listing[]> {
  const qs = new URLSearchParams({ status: 'active' });
  if (params.search) qs.set('search', params.search);
  if (params.minPrice) qs.set('minPrice', params.minPrice);
  if (params.maxPrice) qs.set('maxPrice', params.maxPrice);

  const res = await apiGet<ApiWrapper<Listing[]>>(
    `/marketplace/listings?${qs.toString()}`,
    token
  );
  return res.data ?? [];
}

export async function createListingApi(
  payload: {
    tenantId: string;
    title: string;
    description: string;
    quantityKg: number;
    pricePerKg: number;
  },
  token: string,
  tenantId: string
): Promise<void> {
  await apiPost('/marketplace/listings', payload, token, tenantId);
}

export async function submitOfferApi(
  payload: {
    listingId: string;
    buyerId: string;
    offerPricePerKg: number;
    quantityKg: number;
  },
  token: string
): Promise<void> {
  await apiPost('/marketplace/offer', payload, token);
}

export async function acceptOfferApi(
  offerId: string,
  token: string
): Promise<void> {
  await apiPost(`/marketplace/offer/${offerId}/accept`, {}, token);
}

export async function counterOfferApi(
  offerId: string,
  counterPricePerKg: number,
  token: string,
  tenantId: string
): Promise<void> {
  await apiPost(
    `/marketplace/offer/${offerId}/counter`,
    { counterPricePerKg },
    token,
    tenantId
  );
}
