export interface CreateHarvestDto {
  farmId: string;
  cropId: string;
  tenantId: string;
  quantityKg: number;
  moisturePercentage?: number;
  harvestDate: string;
  grade?: string;
}

export interface HarvestResponseDto {
  id: string;
  farmId: string;
  cropId: string;
  tenantId: string;
  quantityKg: string;
  moisturePercentage: string | null;
  harvestDate: string;
  grade: string | null;
  status: string;
  createdAt: string;
}

export interface CreateBatchDto {
  tenantId: string;
  harvestId: string;
  weightKg: number;
}

export interface UpdateBatchDto {
  status?: 'created' | 'inspected' | 'pooled' | 'dispatched' | 'exported';
  poolId?: string | null;
}

export interface BatchResponseDto {
  id: string;
  poolId: string | null;
  tenantId: string;
  harvestId: string;
  weightKg: string;
  traceabilityCode: string | null;
  status: string;
  qrCodeUrl: string | null;
  assignedAt: string | null;
  createdAt: string;
}

export interface OwnerHistoryDto {
  userId: string | null;
  userName: string | null;
  action: string;
  timestamp: string;
}

export interface TraceabilityPayloadDto {
  batchId: string;
  tenantId: string;
  traceabilityCode: string;
  status: string;
  weightKg: string;
  createdAt: string;
  
  // Harvest Details
  harvest: {
    quantityKg: string;
    harvestDate: string;
    grade: string | null;
  };

  // Farmer & Farm Details
  farm: {
    name: string;
    surveyNumber: string | null;
    soilType: string | null;
  };
  farmer: {
    firstName: string | null;
    lastName: string | null;
    registrationNumber: string;
  };

  // Crop Details
  crop: {
    name: string;
    variety: string | null;
  };

  // Quality Verification details
  quality: {
    inspected: boolean;
    inspectorName?: string | null;
    grade?: string | null;
    moistureContent?: string | null;
    foreignMatter?: string | null;
    inspectionDate?: string | null;
  };

  // Export Tracking details
  export: {
    status: string; // e.g. "pending", "approved", "shipped"
    customsDeclarationNumber?: string | null;
    carrierName?: string | null;
    containerNumber?: string | null;
  } | null;

  // Audit Logs / Custody transitions
  ownerHistory: OwnerHistoryDto[];
}
