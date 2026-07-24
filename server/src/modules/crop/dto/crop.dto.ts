// Crop Master DTOs
export interface CreateCropDto {
  name: string;
  variety?: string;
  scientificName?: string;
  hsCode?: string;
}

export interface UpdateCropDto {
  name?: string;
  variety?: string;
  scientificName?: string;
  hsCode?: string;
}

export interface CropResponseDto {
  id: string;
  name: string;
  variety: string | null;
  scientificName: string | null;
  hsCode: string | null;
}

// Farmer Crop Mapping DTOs
export interface MapFarmerCropDto {
  farmerId: string;
  farmId: string;
  cropId: string;
  tenantId: string;
  sowingDate?: string;
  expectedHarvestDate?: string;
  expectedYieldKg?: number;
  season?: string;
}

export interface UpdateFarmerCropDto {
  sowingDate?: string;
  expectedHarvestDate?: string;
  expectedYieldKg?: number;
  season?: string;
}

export interface FarmerCropResponseDto {
  id: string;
  farmerId: string;
  farmId: string;
  cropId: string;
  tenantId: string;
  sowingDate: string | null;
  expectedHarvestDate: string | null;
  expectedYieldKg: string | null;
  season: string | null;
  createdAt: string;
  updatedAt: string;
  
  // Relations
  crop?: CropResponseDto;
  farm?: {
    id: string;
    name: string;
  };
  farmer?: {
    id: string;
    registrationNumber: string;
  };
}
