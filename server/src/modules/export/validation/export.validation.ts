import { z } from 'zod';

export const createExportSchema = z.object({
  orderId: z.string().uuid('Invalid order ID'),
  portOfLoading: z.string().optional(),
  portOfDischarge: z.string().optional(),
});

export const updateExportSchema = z.object({
  portOfLoading: z.string().optional(),
  portOfDischarge: z.string().optional(),
  customsStatus: z.enum(['pending', 'approved', 'rejected']).optional(),
  customsDeclarationNumber: z.string().optional(),
  commercialInvoiceNumber: z.string().optional(),
  commercialInvoiceUrl: z.string().url('Invalid invoice URL format').optional(),
  packingListUrl: z.string().url('Invalid packing list URL format').optional(),
  notes: z.string().optional(),
});

export const createShipmentSchema = z.object({
  exportId: z.string().uuid('Invalid export ID'),
  carrierName: z.string().min(2, 'Carrier name is required'),
  containerNumber: z.string().min(3, 'Container number is required'),
  billOfLadingNumber: z.string().min(5, 'Bill of lading is required'),
  originPort: z.string().min(2, 'Origin port is required'),
  destinationPort: z.string().min(2, 'Destination port is required'),
  estimatedDeparture: z.string().datetime().optional(),
  estimatedArrival: z.string().datetime().optional(),
});

export const createCertificateSchema = z.object({
  batchId: z.string().uuid('Invalid batch ID'),
  tenantId: z.string().uuid('Invalid tenant ID'),
  certificateType: z.enum(['organic', 'phytosanitary', 'origin']),
  certificateNumber: z.string().min(2, 'Certificate number is required'),
  issuedBy: z.string().min(2, 'Issuing authority is required'),
  issuedAt: z.string().datetime('Invalid issued date format'),
  expiresAt: z.string().datetime('Invalid expiration date format').optional(),
  documentUrl: z.string().url('Invalid document URL format').optional(),
});
