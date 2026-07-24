import { z } from 'zod';

export const createHarvestSchema = z.object({
  farmId: z.string().uuid('Invalid farm ID'),
  cropId: z.string().uuid('Invalid crop ID'),
  tenantId: z.string().uuid('Invalid tenant ID'),
  quantityKg: z.number().positive('Quantity must be positive'),
  moisturePercentage: z.number().min(0).max(100).optional(),
  harvestDate: z.string().datetime('Invalid harvest date format'),
  grade: z.string().optional(),
});

export const createBatchSchema = z.object({
  tenantId: z.string().uuid('Invalid tenant ID'),
  harvestId: z.string().uuid('Invalid harvest ID'),
  weightKg: z.number().positive('Weight must be positive'),
});

export const updateBatchSchema = z.object({
  status: z.enum(['created', 'inspected', 'pooled', 'dispatched', 'exported']).optional(),
  poolId: z.string().uuid('Invalid pool ID').nullable().optional(),
});
