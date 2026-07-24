export interface CreateExportDto {
  orderId: string;
  portOfLoading?: string;
  portOfDischarge?: string;
}

export interface UpdateExportDto {
  portOfLoading?: string;
  portOfDischarge?: string;
  customsStatus?: 'pending' | 'approved' | 'rejected';
  customsDeclarationNumber?: string;
  commercialInvoiceNumber?: string;
  commercialInvoiceUrl?: string;
  packingListUrl?: string;
  notes?: string;
}

export interface ExportResponseDto {
  id: string;
  orderId: string;
  portOfLoading: string | null;
  portOfDischarge: string | null;
  customsStatus: string;
  customsDeclarationNumber: string | null;
  commercialInvoiceNumber: string | null;
  commercialInvoiceUrl: string | null;
  packingListUrl: string | null;
  eligibilityStatus: string;
  notes: string | null;
  createdAt: string;
  updatedAt: string;
}

export interface ExportEligibilityReportDto {
  exportId: string;
  eligible: boolean;
  rules: {
    apedaRegistered: {
      status: 'pass' | 'fail';
      description: string;
    };
    cropHsCodeValid: {
      status: 'pass' | 'fail';
      description: string;
      hsCode?: string | null;
    };
    phytosanitaryCertificate: {
      status: 'pass' | 'fail';
      description: string;
      certificateNumber?: string | null;
    };
    certificateOfOrigin: {
      status: 'pass' | 'fail';
      description: string;
      certificateNumber?: string | null;
    };
  };
}

export interface CreateShipmentDto {
  exportId: string;
  carrierName: string;
  containerNumber: string;
  billOfLadingNumber: string;
  originPort: string;
  destinationPort: string;
  estimatedDeparture?: string;
  estimatedArrival?: string;
}

export interface ShipmentResponseDto {
  id: string;
  exportId: string;
  carrierName: string | null;
  containerNumber: string | null;
  billOfLadingNumber: string | null;
  originPort: string | null;
  destinationPort: string | null;
  estimatedDeparture: string | null;
  estimatedArrival: string | null;
}

export interface CreateCertificateDto {
  batchId: string;
  tenantId: string;
  certificateType: 'organic' | 'phytosanitary' | 'origin';
  certificateNumber: string;
  issuedBy: string;
  issuedAt: string;
  expiresAt?: string;
  documentUrl?: string;
}

export interface CertificateResponseDto {
  id: string;
  batchId: string;
  tenantId: string;
  certificateType: string;
  certificateNumber: string;
  issuedBy: string;
  issuedAt: string;
  expiresAt: string | null;
  documentUrl: string | null;
  status: string;
  createdAt: string;
}
