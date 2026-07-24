import { z } from 'zod';

export const registerFarmSchema = z.object({
  farmerId: z.string().uuid('Invalid farmer ID'),
  tenantId: z.string().uuid('Invalid tenant ID'),
  name: z.string().min(2, 'Farm name must be at least 2 characters'),
  soilType: z.string().optional(),
  totalAreaHectares: z.number().positive('Area must be positive'),
  latitude: z.number().min(-90).max(90).optional(),
  longitude: z.number().min(-180).max(180).optional(),
  surveyNumber: z.string().optional(),
  boundaryCoordinates: z.string().optional(), // geojson
  waterSource: z.string().optional(),
  ownershipType: z.string().optional(),
});

export const updateFarmSchema = z.object({
  name: z.string().min(2, 'Farm name must be at least 2 characters').optional(),
  soilType: z.string().optional(),
  totalAreaHectares: z.number().positive().optional(),
  latitude: z.number().min(-90).max(90).optional(),
  longitude: z.number().min(-180).max(180).optional(),
  surveyNumber: z.string().optional(),
  boundaryCoordinates: z.string().optional(),
  waterSource: z.string().optional(),
  ownershipType: z.string().optional(),
});
