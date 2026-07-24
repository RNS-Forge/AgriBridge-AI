export interface CreateListingDto {
  tenantId: string;
  poolId?: string;
  batchId?: string;
  title: string;
  description?: string;
  quantityKg: number;
  pricePerKg: number;
}

export interface ListingResponseDto {
  id: string;
  tenantId: string;
  fpoName?: string;
  poolId: string | null;
  batchId: string | null;
  title: string;
  description: string | null;
  quantityKg: string;
  pricePerKg: string;
  status: string;
  createdAt: string;
  updatedAt: string;
}

export interface CreateOfferDto {
  listingId: string;
  buyerId: string;
  offerPricePerKg: number;
  quantityKg: number;
}

export interface CounterOfferDto {
  counterPricePerKg: number;
}

export interface OfferResponseDto {
  id: string;
  listingId: string;
  buyerId: string;
  buyerName?: string;
  offerPricePerKg: string;
  quantityKg: string;
  status: string;
  counterPricePerKg: string | null;
  offeredBy: string;
  createdAt: string;
  updatedAt: string;
}

export interface WishlistResponseDto {
  id: string;
  buyerId: string;
  listingId: string;
  listing?: ListingResponseDto;
  createdAt: string;
}

export interface QueryListingsParamsDto {
  search?: string;
  minPrice?: number;
  maxPrice?: number;
  minQuantity?: number;
  status?: string;
  sortBy?: 'price' | 'quantity' | 'date';
  sortOrder?: 'asc' | 'desc';
  page?: number;
  limit?: number;
}
