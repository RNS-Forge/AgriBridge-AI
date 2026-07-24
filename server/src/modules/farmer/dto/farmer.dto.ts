export interface RegisterFarmerDto {
  tenantId: string;
  email: string;
  password: string;
  firstName?: string;
  lastName?: string;
  aadhaarNumber: string; // Plain Aadhaar number, will be hashed in service
  registrationNumber: string;
  
  // Bank details
  bankName?: string;
  accountNumber?: string;
  ifscCode?: string;

  // Land / Farm details
  farmName: string;
  soilType?: string;
  totalAreaHectares: number;
  latitude?: number;
  longitude?: number;
  surveyNumber?: string;
  boundaryCoordinates?: string; // stringified GeoJSON
  documentUrl?: string; // Verification document (e.g. proof of land/identity)
}

export interface UpdateFarmerDto {
  firstName?: string;
  lastName?: string;
  
  // Bank details
  bankName?: string;
  accountNumber?: string;
  ifscCode?: string;

  // Land / Farm details
  farmName?: string;
  soilType?: string;
  totalAreaHectares?: number;
  latitude?: number;
  longitude?: number;
  surveyNumber?: string;
  boundaryCoordinates?: string;
  documentUrl?: string;
  
  // KYC verification
  kycStatus?: 'pending' | 'verified' | 'rejected';
}

export interface FarmerResponseDto {
  farmerId: string;
  userId: string;
  tenantId: string;
  email: string;
  firstName: string | null;
  lastName: string | null;
  registrationNumber: string;
  kycStatus: string;
  kycVerifiedAt: string | null;
  documentUrl: string | null;
  bankName: string | null;
  accountNumber: string | null;
  ifscCode: string | null;
  
  farm: {
    id: string;
    name: string;
    soilType: string | null;
    totalAreaHectares: string;
    latitude: string | null;
    longitude: string | null;
    surveyNumber: string | null;
    boundaryCoordinates: string | null;
  } | null;
}
