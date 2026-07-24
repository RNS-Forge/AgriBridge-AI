import { z } from 'zod';

export const createListingSchema = z.object({
  tenantId: z.string().uuid('Invalid tenant ID'),
  poolId: z.string().uuid('Invalid pool ID').optional(),
  batchId: z.string().uuid('Invalid batch ID').optional(),
  title: z.string().min(3, 'Title must be at least 3 characters'),
  description: z.string().optional(),
  quantityKg: z.number().positive('Quantity must be positive'),
  pricePerKg: z.number().positive('Price per kg must be positive'),
});

export const createOfferSchema = z.object({
  listingId: z.string().uuid('Invalid listing ID'),
  buyerId: z.string().uuid('Invalid buyer ID'),
  offerPricePerKg: z.number().positive('Offer price must be positive'),
  quantityKg: z.number().positive('Quantity must be positive'),
});

export const counterOfferSchema = z.object({
  counterPricePerKg: z.number().positive('Counter price must be positive'),
});
