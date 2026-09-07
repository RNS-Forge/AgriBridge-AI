// ---------------------------------------------------------------------------
// AgriBridge Phase 1: Shared TypeScript Definitions
// ---------------------------------------------------------------------------

// ── Roles & RBAC ─────────────────────────────────────────────────────────────

export type UserRole =
  | 'ADMIN'
  | 'ADMIN_MAKER'
  | 'FARMER'
  | 'FARM_MANAGER'
  | 'WORKER'
  | 'BUYER'
  | 'MANDI_AGENT';

export type UserStatus = 'active' | 'suspended' | 'pending' | 'pending_approval';

export interface User {
  id: string;
  email: string;
  firstName?: string | null;
  lastName?: string | null;
  roles: UserRole[];
  status: UserStatus;
  tenantId?: string | null;
  phone?: string | null;
  createdAt?: string;
}

export interface UserPayload {
  userId: string;
  id?: string;
  email: string;
  roles: UserRole[];
  tenantId?: string | null;
}

export interface UserRequest {
  id: string;
  email: string;
  firstName: string;
  lastName: string;
  phone?: string;
  requestedRole: UserRole;
  requestedBy: string; // admin_maker user_id or 'SELF_REGISTER'
  requesterName?: string;
  status: 'PENDING_APPROVAL' | 'APPROVED' | 'REJECTED';
  notes?: string;
  createdAt: string;
  reviewedAt?: string;
  reviewedBy?: string;
}

export interface FarmPermission {
  id: string;
  userId: string;
  farmId: string;
  role: 'FARM_MANAGER' | 'WORKER';
  grantedBy: string;
  createdAt: string;
}

// ── Farm & Plot ──────────────────────────────────────────────────────────────

export type SoilType = 'Loamy' | 'Clay' | 'Sandy' | 'Black' | 'Red' | 'Alluvial' | 'Other';
export type WaterSource = 'Borewell' | 'Canal' | 'Rainfed' | 'Drip Irrigation' | 'River' | 'Other';
export type OwnershipType = 'Owned' | 'Leased' | 'Shared';

export interface Plot {
  id: string;
  farmId: string;
  name: string;
  areaAcres: number;
  soilType: SoilType | string;
  waterSource: WaterSource | string;
  ownershipType: OwnershipType | string;
  notes?: string;
  activeCropCycle?: CropCycle;
  createdAt?: string;
  updatedAt?: string;
}

export interface Farm {
  id: string;
  farmerId: string;
  name: string;
  location: string;
  latitude?: number | null;
  longitude?: number | null;
  totalAreaAcres: number;
  managerIds?: string[];
  plots?: Plot[];
  createdAt?: string;
  updatedAt?: string;
}

// ── Crop Lifecycle ───────────────────────────────────────────────────────────

export type CropGrowthStage =
  | 'SOWING'
  | 'GERMINATION'
  | 'VEGETATIVE'
  | 'FLOWERING'
  | 'FRUIT_DEVELOPMENT'
  | 'MATURITY'
  | 'HARVEST';

export type CropCycleStatus = 'ACTIVE' | 'HARVESTED' | 'ABANDONED';

export interface CropCycle {
  id: string;
  plotId: string;
  farmId: string;
  cropName: string;
  variety?: string;
  season?: string;
  sowingDate: string;
  expectedHarvestDate: string;
  currentStage: CropGrowthStage;
  status: CropCycleStatus;
  // Harvest tracking
  actualHarvestDate?: string | null;
  harvestedQuantityKg?: number | null;
  harvestGrade?: string | null;
  notes?: string | null;
  createdAt?: string;
  updatedAt?: string;
}

// ── Task & Work Management ───────────────────────────────────────────────────

export type TaskStatus =
  | 'TODO'
  | 'ASSIGNED'
  | 'IN_PROGRESS'
  | 'COMPLETED'
  | 'CANCELLED'
  | 'OVERDUE';

export type TaskPriority = 'LOW' | 'NORMAL' | 'HIGH' | 'URGENT';

export interface Task {
  id: string;
  cropCycleId: string;
  farmId: string;
  plotId: string;
  title: string;
  description?: string;
  assignedTo?: string | null; // user_id (worker or farm manager)
  assigneeName?: string;
  priority: TaskPriority;
  dueDate: string;
  status: TaskStatus;
  evidencePhotoUrl?: string | null;
  completionNotes?: string | null;
  completedAt?: string | null;
  wageAmount?: number | null;
  createdAt?: string;
  updatedAt?: string;
}

// ── Inventory Management ─────────────────────────────────────────────────────

export type InventoryCategory =
  | 'SEEDS'
  | 'FERTILIZER'
  | 'PESTICIDE'
  | 'FUEL'
  | 'PACKAGING'
  | 'OTHER';

export interface InventoryItem {
  id: string;
  farmId: string;
  name: string;
  category: InventoryCategory;
  unit: string; // kg, litre, packet, bag
  currentStock: number;
  averageUnitCost: number;
  lowStockThreshold: number;
  createdAt?: string;
  updatedAt?: string;
}

export type InventoryTxType = 'PURCHASE' | 'CONSUMPTION';

export interface InventoryTransaction {
  id: string;
  itemId: string;
  itemName?: string;
  type: InventoryTxType;
  quantity: number;
  unitCost: number;
  totalCost: number;
  cropCycleId?: string | null;
  supplierName?: string | null;
  date: string;
  notes?: string;
  createdAt?: string;
}

// ── Expense Management & Cost Basis ──────────────────────────────────────────

export type ExpenseCategory =
  | 'SEEDS'
  | 'FERTILIZER'
  | 'PESTICIDE'
  | 'LABOUR'
  | 'MACHINERY'
  | 'FUEL'
  | 'ELECTRICITY'
  | 'WATER'
  | 'TRANSPORT'
  | 'STORAGE'
  | 'REPAIRS'
  | 'OTHER';

export interface Expense {
  id: string;
  farmId: string;
  plotId: string;
  cropCycleId: string;
  category: ExpenseCategory;
  amount: number;
  date: string;
  vendor?: string | null;
  receiptUrl?: string | null;
  notes?: string | null;
  source: 'MANUAL' | 'INVENTORY_CONSUMPTION' | 'TASK_LABOUR';
  createdAt?: string;
}

export interface CropCostSummary {
  cropCycleId: string;
  cropName: string;
  totalExpense: number;
  harvestQuantityKg: number | null;
  costPerKg: number | null; // null if not yet harvested
  costPerAcre: number;
  isHarvested: boolean;
  categoryBreakdown: Record<ExpenseCategory | string, number>;
  expensesCount: number;
}

// ── Weather & Alerts ─────────────────────────────────────────────────────────

export type WeatherSeverity = 'INFO' | 'WARNING' | 'ALERT' | 'CRITICAL';

export interface WeatherAlert {
  id: string;
  farmId: string;
  farmName?: string;
  alertType: 'HEAVY_RAIN' | 'EXTREME_HEAT' | 'FROST' | 'HIGH_WIND' | 'DROUGHT_RISK';
  severity: WeatherSeverity;
  title: string;
  actionableMessage: string;
  date: string;
  createdAt?: string;
}

export interface WeatherForecastDay {
  date: string;
  tempMin: number;
  tempMax: number;
  condition: string;
  rainProbability: number;
  humidity: number;
  windSpeedKmH: number;
  icon: string;
}

// ── Mandi Price Reference ────────────────────────────────────────────────────

export interface MarketPrice {
  id: string;
  cropName: string;
  mandiName: string;
  district: string;
  state: string;
  minPrice: number;
  maxPrice: number;
  modalPrice: number; // reference modal price per kg
  date: string; // As of date
  arrivalVolumeQuintals?: number;
}

// ── Produce Marketplace (Direct Sale) ────────────────────────────────────────

export type ProduceListingStatus = 'ACTIVE' | 'OFFERED' | 'SOLD' | 'CANCELLED';

export interface ProduceListing {
  id: string;
  cropCycleId: string;
  farmerId: string;
  farmerName?: string;
  farmerPhone?: string;
  cropName: string;
  variety?: string;
  quantityKg: number;
  askingPricePerKg: number;
  // Private to farmer only - stripped from buyer responses!
  costPerKg?: number | null;
  nearestMandiModalPrice?: number | null;
  grade?: string;
  pickupLocation: string;
  availableFrom: string;
  availableUntil: string;
  photos?: string[];
  status: ProduceListingStatus;
  createdAt?: string;
  updatedAt?: string;
}

export type OfferStatus = 'PENDING' | 'ACCEPTED' | 'REJECTED' | 'COUNTERED';

export interface ProduceOffer {
  id: string;
  listingId: string;
  buyerId: string;
  buyerName?: string;
  buyerCompany?: string;
  offeredPricePerKg: number;
  quantityKg: number;
  totalOfferAmount: number;
  counterPricePerKg?: number | null;
  message?: string;
  status: OfferStatus;
  createdAt?: string;
  updatedAt?: string;
}

export type OrderStatus =
  | 'LISTED'
  | 'OFFERED'
  | 'ACCEPTED'
  | 'SCHEDULED'
  | 'PICKED_UP'
  | 'DELIVERED'
  | 'COMPLETED'
  | 'CANCELLED';

export interface ProduceOrder {
  id: string;
  listingId: string;
  offerId: string;
  buyerId: string;
  buyerName?: string;
  farmerId: string;
  farmerName?: string;
  cropName: string;
  quantityKg: number;
  agreedPricePerKg: number;
  totalAmount: number;
  status: OrderStatus;
  scheduledPickupDate?: string | null;
  actualPickupDate?: string | null;
  actualDeliveryDate?: string | null;
  proofOfDeliveryUrl?: string | null;
  proofOfDeliveryNote?: string | null;
  logisticsArrangedBy: 'BUYER' | 'FARMER' | 'SELF';
  createdAt?: string;
  updatedAt?: string;
}

// ── Mandi Agent & Slot Booking ───────────────────────────────────────────────

export interface MandiYard {
  id: string;
  name: string;
  agentId: string;
  agentName?: string;
  agentPhone?: string;
  location: string;
  district: string;
  state: string;
  commoditiesTraded: string[];
  defaultCommissionRate: number; // e.g. 2.5%
  createdAt?: string;
}

export type SlotStatus = 'OPEN' | 'FULL' | 'CLOSED';

export interface MandiSlot {
  id: string;
  mandiId: string;
  mandiName?: string;
  date: string;
  timeWindow: string; // e.g. "08:00 AM - 12:00 PM"
  capacityQuintals: number;
  bookedQuintals: number;
  commoditiesAccepted: string[];
  status: SlotStatus;
  createdAt?: string;
}

export type BookingStatus = 'REQUESTED' | 'CONFIRMED' | 'COMPLETED' | 'CANCELLED' | 'NO_SHOW';

export interface SlotBooking {
  id: string;
  slotId: string;
  mandiId: string;
  mandiName?: string;
  farmerId: string;
  farmerName?: string;
  cropCycleId?: string;
  cropName: string;
  expectedQuantityKg: number;
  status: BookingStatus;
  rejectionReason?: string;
  createdAt?: string;
  updatedAt?: string;
}

export interface MandiSale {
  id: string;
  bookingId: string;
  mandiId: string;
  farmerId: string;
  cropCycleId?: string;
  cropName: string;
  actualQuantityKg: number;
  grade: string;
  auctionSalePricePerKg: number;
  grossRevenue: number;
  commissionRate: number; // percentage
  commissionAmount: number;
  netPayout: number;
  saleDate: string;
  agentNotes?: string;
  createdAt?: string;
}

// ── Profit Report Engine ─────────────────────────────────────────────────────

export interface ProfitReport {
  id: string;
  cropCycleId: string;
  cropName: string;
  farmId: string;
  plotId: string;
  saleType: 'DIRECT_ORDER' | 'MANDI_SALE';
  referenceId: string; // orderId or mandiSaleId
  quantitySoldKg: number;
  salePricePerKg: number;
  grossRevenue: number;
  deductions: number; // commission or logistics
  totalRevenue: number;
  totalCost: number;
  netProfit: number;
  marginPercent: number;
  profitPerKg: number;
  profitPerAcre: number;
  categoryBreakdown: Record<string, number>;
  generatedAt: string;
}

// ── Admin, Disputes & Audit ──────────────────────────────────────────────────

export type DisputeStatus = 'OPEN' | 'UNDER_REVIEW' | 'RESOLVED';

export interface Dispute {
  id: string;
  referenceType: 'ORDER' | 'MANDI_SALE';
  referenceId: string;
  raisedBy: string;
  raisedByName?: string;
  reason: string;
  status: DisputeStatus;
  adminNotes?: string;
  resolutionOutcome?: string;
  createdAt: string;
  resolvedAt?: string;
}

export interface AuditLog {
  id: string;
  userId: string | null;
  userName?: string;
  action: string;
  entityName: string;
  entityId: string;
  oldValue?: string | null;
  newValue?: string | null;
  timestamp: string;
}
