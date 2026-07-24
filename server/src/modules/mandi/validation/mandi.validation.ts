import { z } from 'zod';

export const createMarketSchema = z.object({
  name: z.string().min(2, 'Market name is required'),
  state: z.string().min(2, 'State is required'),
  district: z.string().min(2, 'District is required'),
  latitude: z.number().min(-90).max(90).optional(),
  longitude: z.number().min(-180).max(180).optional(),
});

export const createPriceSchema = z.object({
  marketId: z.string().uuid('Invalid market ID'),
  commodityName: z.string().min(2, 'Commodity name is required'),
  variety: z.string().optional(),
  arrivalVolumeTonnes: z.number().positive().optional(),
  minPrice: z.number().positive().optional(),
  maxPrice: z.number().positive().optional(),
  modalPrice: z.number().positive().optional(),
  priceDate: z.string().datetime('Invalid price date format'),
});

export const queryPricesSchema = z.object({
  commodityName: z.string().optional(),
  state: z.string().optional(),
  district: z.string().optional(),
  priceDate: z.string().datetime().optional(),
});
