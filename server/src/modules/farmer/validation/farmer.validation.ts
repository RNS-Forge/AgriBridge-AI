import { z } from 'zod';

export const registerFarmerSchema = z.object({
  tenantId: z.string().uuid('Invalid tenant ID'),
  email: z.string().email('Invalid email address'),
  password: z.string().min(8, 'Password must be at least 8 characters'),
  firstName: z.string().min(1, 'First name is required').optional(),
  lastName: z.string().min(1, 'Last name is required').optional(),
  aadhaarNumber: z.string().length(12, 'Aadhaar must be exactly 12 digits').regex(/^\d+$/, 'Aadhaar must contain only digits'),
  registrationNumber: z.string().min(3, 'Registration number must be at least 3 characters'),
  
  // Bank details
  bankName: z.string().optional(),
  accountNumber: z.string().min(9, 'Bank account must be at least 9 characters').optional(),
  ifscCode: z.string().min(4, 'IFSC code must be at least 4 characters').optional(),

  // Farm details
  farmName: z.string().min(2, 'Farm name must be at least 2 characters'),
  soilType: z.string().optional(),
  totalAreaHectares: z.number().positive('Area must be positive'),
  latitude: z.number().min(-90).max(90).optional(),
  longitude: z.number().min(-180).max(180).optional(),
  surveyNumber: z.string().optional(),
  boundaryCoordinates: z.string().optional(), // geojson
  documentUrl: z.string().url('Invalid document URL').optional(),
});

export const updateFarmerSchema = z.object({
  firstName: z.string().optional(),
  lastName: z.string().optional(),
  
  // Bank details
  bankName: z.string().optional(),
  accountNumber: z.string().optional(),
  ifscCode: z.string().optional(),

  // Farm details
  farmName: z.string().optional(),
  soilType: z.string().optional(),
  totalAreaHectares: z.number().positive().optional(),
  latitude: z.number().min(-90).max(90).optional(),
  longitude: z.number().min(-180).max(180).optional(),
  surveyNumber: z.string().optional(),
  boundaryCoordinates: z.string().optional(),
  documentUrl: z.string().url().optional(),

  // KYC validation
  kycStatus: z.enum(['pending', 'verified', 'rejected']).optional(),
});
