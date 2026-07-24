export interface RegisterFarmDto {
  farmerId: string;
  tenantId: string;
  name: string;
  soilType?: string;
  totalAreaHectares: number;
  latitude?: number;
  longitude?: number;
  surveyNumber?: string;
  boundaryCoordinates?: string; // stringified GeoJSON
  waterSource?: string;
  ownershipType?: string;
}

export interface UpdateFarmDto {
  name?: string;
  soilType?: string;
  totalAreaHectares?: number;
  latitude?: number;
  longitude?: number;
  surveyNumber?: string;
  boundaryCoordinates?: string;
  waterSource?: string;
  ownershipType?: string;
}

export interface FarmResponseDto {
  id: string;
  farmerId: string;
  tenantId: string;
  name: string;
  soilType: string | null;
  totalAreaHectares: string;
  latitude: string | null;
  longitude: string | null;
  surveyNumber: string | null;
  boundaryCoordinates: string | null;
  waterSource: string | null;
  ownershipType: string | null;
  createdAt: string;
  updatedAt: string;
}
