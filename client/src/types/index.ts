// ---------------------------------------------------------------------------
// Shared TypeScript interfaces used across the entire frontend.
// Centralising here means one import path for all consumers:
//   import type { User, NavItem } from '@/types'
// ---------------------------------------------------------------------------

// ── Auth / User ──────────────────────────────────────────────────────────────

export interface User {
  id: string;
  email: string;
  firstName?: string;
  lastName?: string;
  roles: string[];
  tenantId?: string;
}

export interface AuthState {
  token: string | null;
  user: User | null;
  tenantId: string | null;
}

// ── Navigation ───────────────────────────────────────────────────────────────

export interface NavItem {
  label: string;
  path: string;
  roles: string[];
}

// ── Farmer / Farm ────────────────────────────────────────────────────────────

export interface Farm {
  id: string;
  name: string;
  soilType: string;
  totalAreaHectares: string;
}

export interface Farmer {
  id: string;
  userId: string;
  tenantId: string;
  registrationNumber: string;
  bankName: string;
  accountNumber: string;
  ifscCode: string;
  kycStatus: 'pending' | 'verified' | 'rejected';
  createdAt: string;
  user?: {
    email: string;
    firstName: string;
    lastName: string;
  };
  farm?: Farm;
}

// ── Mandi ────────────────────────────────────────────────────────────────────

export interface MandiPrice {
  id: string;
  marketId: string;
  commodityName: string;
  variety: string;
  arrivalVolumeTonnes: string;
  minPrice: string;
  maxPrice: string;
  modalPrice: string;
  priceDate: string;
  market?: {
    marketName: string;
    district: string;
    state: string;
  };
}

// ── Marketplace ──────────────────────────────────────────────────────────────

export interface Listing {
  id: string;
  tenantId: string;
  fpoName?: string;
  poolId: string | null;
  batchId: string | null;
  title: string;
  description: string | null;
  quantityKg: string;
  pricePerKg: string;
  status: string;
  createdAt: string;
}

export interface Offer {
  id: string;
  listingId: string;
  buyerId: string;
  buyerName?: string;
  offerPricePerKg: string;
  quantityKg: string;
  status: 'pending' | 'accepted' | 'countered' | 'rejected' | 'cancelled';
  counterPricePerKg: string | null;
  offeredBy: 'buyer' | 'fpo';
  updatedAt: string;
}

// ── Exports / Shipment ───────────────────────────────────────────────────────

export interface ExportFile {
  id: string;
  orderId: string;
  portOfLoading: string | null;
  portOfDischarge: string | null;
  customsStatus: 'pending' | 'approved' | 'rejected';
  customsDeclarationNumber: string | null;
  commercialInvoiceNumber: string | null;
  commercialInvoiceUrl: string | null;
  packingListUrl: string | null;
  eligibilityStatus: string;
  notes: string | null;
  createdAt: string;
}

export type EligibilityRuleStatus = 'pass' | 'fail';

export interface EligibilityRule {
  status: EligibilityRuleStatus;
  description: string;
  hsCode?: string;
}

export interface EligibilityReport {
  exportId: string;
  eligible: boolean;
  rules: {
    apedaRegistered: EligibilityRule;
    cropHsCodeValid: EligibilityRule;
    phytosanitaryCertificate: EligibilityRule;
    certificateOfOrigin: EligibilityRule;
  };
}

// ── Super Admin ──────────────────────────────────────────────────────────────

export interface DashboardMetrics {
  totalTenants: number;
  totalUsers: number;
  totalHarvestsKg: number;
  totalOrdersCount: number;
  premiumSubscriptionsCount: number;
  activeSettings: Array<{ settingKey: string; settingValue: string }>;
}

export interface Tenant {
  id: string;
  name: string;
  licenseNumber: string | null;
  status: 'active' | 'suspended';
  subscriptionPlan: string;
  createdAt: string;
}

export interface AuditLog {
  id: string;
  userId: string | null;
  tenantId: string | null;
  action: string;
  entityName: string;
  entityId: string;
  createdAt: string;
}

// ── AI Chat ──────────────────────────────────────────────────────────────────

export interface ChatMessage {
  role: 'system' | 'user' | 'assistant';
  content: string;
}

export type AiMode =
  | 'export_coach'
  | 'price_recommendation'
  | 'farmer_assistant'
  | 'document_generator';

export type AiProvider = 'groq' | 'gemini' | 'claude' | 'openai' | 'mistral';
