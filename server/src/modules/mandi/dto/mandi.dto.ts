export interface CreateMarketDto {
  name: string;
  state: string;
  district: string;
  latitude?: number;
  longitude?: number;
}

export interface MarketResponseDto {
  id: string;
  name: string;
  state: string;
  district: string;
  latitude: string | null;
  longitude: string | null;
  createdAt: string;
}

export interface CreatePriceDto {
  marketId: string;
  commodityName: string;
  variety?: string;
  arrivalVolumeTonnes?: number;
  minPrice?: number;
  maxPrice?: number;
  modalPrice?: number;
  priceDate: string;
}

export interface PriceResponseDto {
  id: string;
  marketId: string;
  marketName?: string;
  state?: string;
  district?: string;
  commodityName: string;
  variety: string | null;
  arrivalVolumeTonnes: string | null;
  minPrice: string | null;
  maxPrice: string | null;
  modalPrice: string | null;
  priceDate: string;
  createdAt: string;
}

export interface MarketComparisonDto {
  commodityName: string;
  comparisonDate: string;
  marketsData: {
    marketId: string;
    marketName: string;
    state: string;
    district: string;
    modalPrice: string | null;
    minPrice: string | null;
    maxPrice: string | null;
    arrivalVolumeTonnes: string | null;
  }[];
}
