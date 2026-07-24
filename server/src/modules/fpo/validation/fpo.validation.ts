import { z } from 'zod';

export const createInvitationSchema = z.object({
  tenantId: z.string().uuid('Invalid tenant ID'),
  email: z.string().email('Invalid email address'),
  role: z.enum(['Farmer', 'QualityInspector', 'FPO_ADMIN']),
});

export const manageSharesSchema = z.object({
  tenantId: z.string().uuid('Invalid tenant ID'),
  farmerId: z.string().uuid('Invalid farmer ID'),
  sharesCount: z.number().int().positive('Shares count must be a positive integer'),
  sharePrice: z.number().positive('Share price must be positive'),
});

export const distributeProfitSchema = z.object({
  tenantId: z.string().uuid('Invalid tenant ID'),
  poolId: z.string().uuid('Invalid pool ID').optional(),
  totalProfit: z.number().positive('Total profit must be positive'),
  splitType: z.enum(['by_shares', 'by_pool_contribution']),
});

export const bulkUploadMembersSchema = z.object({
  tenantId: z.string().uuid('Invalid tenant ID'),
  members: z.array(
    z.object({
      email: z.string().email('Invalid email address'),
      firstName: z.string().min(2, 'First name required'),
      lastName: z.string().min(2, 'Last name required'),
      aadhaarNumber: z.string().length(12, 'Aadhaar must be exactly 12 digits'),
      registrationNumber: z.string().min(2, 'Registration number required'),
      bankName: z.string().optional(),
      accountNumber: z.string().optional(),
      ifscCode: z.string().optional(),
      farmName: z.string().optional(),
      totalAreaHectares: z.number().positive().optional(),
    })
  ).min(1, 'At least one member is required for bulk upload'),
});
