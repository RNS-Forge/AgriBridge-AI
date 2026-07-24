export interface CreateInvitationDto {
  tenantId: string;
  email: string;
  role: 'Farmer' | 'QualityInspector' | 'FPO_ADMIN';
}

export interface InvitationResponseDto {
  id: string;
  tenantId: string;
  email: string;
  role: string;
  status: string;
  token: string;
  expiresAt: string;
}

export interface ManageSharesDto {
  tenantId: string;
  farmerId: string;
  sharesCount: number;
  sharePrice: number;
}

export interface SharesLedgerResponseDto {
  id: string;
  tenantId: string;
  farmerId: string;
  sharesCount: number;
  sharePrice: string;
  createdAt: string;
  updatedAt: string;
}

export interface DistributeProfitDto {
  tenantId: string;
  poolId?: string;
  totalProfit: number;
  splitType: 'by_shares' | 'by_pool_contribution';
}

export interface ProfitSplitResponseDto {
  id: string;
  tenantId: string;
  poolId: string | null;
  totalProfit: string;
  splitType: string;
  allocatedAt: string;
  allocations?: {
    id: string;
    farmerId: string;
    payoutAmount: string;
    status: string;
  }[];
}

export interface BulkUploadMemberDto {
  email: string;
  firstName: string;
  lastName: string;
  aadhaarNumber: string;
  registrationNumber: string;
  bankName?: string;
  accountNumber?: string;
  ifscCode?: string;
  farmName?: string;
  totalAreaHectares?: number;
}

export interface BulkUploadResponseDto {
  successCount: number;
  failedCount: number;
  members: {
    email: string;
    status: 'success' | 'failed';
    error?: string;
    farmerId?: string;
  }[];
}
