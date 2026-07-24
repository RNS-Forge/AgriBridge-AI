import { z } from 'zod';

export const createCropSchema = z.object({
  name: z.string().min(2, 'Crop name must be at least 2 characters'),
  variety: z.string().optional(),
  scientificName: z.string().optional(),
  hsCode: z.string().max(20, 'HS Code cannot exceed 20 characters').optional(),
});

export const updateCropSchema = z.object({
  name: z.string().min(2, 'Crop name must be at least 2 characters').optional(),
  variety: z.string().optional(),
  scientificName: z.string().optional(),
  hsCode: z.string().max(20, 'HS Code cannot exceed 20 characters').optional(),
});

export const mapFarmerCropSchema = z.object({
  farmerId: z.string().uuid('Invalid farmer ID'),
  farmId: z.string().uuid('Invalid farm ID'),
  cropId: z.string().uuid('Invalid crop ID'),
  tenantId: z.string().uuid('Invalid tenant ID'),
  sowingDate: z.string().datetime('Invalid sowing date format').optional(),
  expectedHarvestDate: z.string().datetime('Invalid expected harvest date format').optional(),
  expectedYieldKg: z.number().positive('Expected yield must be positive').optional(),
  season: z.string().optional(),
});

export const updateFarmerCropSchema = z.object({
  sowingDate: z.string().datetime().optional(),
  expectedHarvestDate: z.string().datetime().optional(),
  expectedYieldKg: z.number().positive().optional(),
  season: z.string().optional(),
});
