import crypto from 'crypto';
import { supabase } from '../config/index.js';

// ---------------------------------------------------------------------------
// AgriBridge: In-Memory Resilient Store & State Engine
// Seeded with realistic data for all 7 roles, farms, crop cycles, expenses,
// mandi prices, marketplace listings, offers, orders, and profit reports.
// ---------------------------------------------------------------------------

export interface InternalUser {
  id: string;
  firstName: string;
  lastName: string;
  designation: string;
  email: string;
  isActive: boolean;
  createdAt: string;
}

export interface StoredUser {
  id: string;
  email: string;
  passwordHash: string; // SHA-256
  firstName: string;
  lastName: string;
  phone: string;
  roles: string[];
  status: 'active' | 'suspended' | 'pending' | 'pending_approval';
  tenantId?: string | null;
  companyName?: string;
  country?: string;
  recentActivityAt?: string;
  permissions?: string[];
  internalUsers?: InternalUser[];
  profilePicture?: string;
  designation?: string;
  isEmailVerified?: boolean;
  twoFactorEnabled?: boolean;
  emailOtp?: string;
  createdAt: string;
}

export interface StoredUserRequest {
  id: string;
  email: string;
  passwordHash: string;
  firstName: string;
  lastName: string;
  phone?: string;
  requestedRole: string;
  requestedBy: string; // 'adminmaker@agribridge.com' or 'SELF_REGISTER'
  status: 'PENDING_APPROVAL' | 'APPROVED' | 'REJECTED';
  notes?: string;
  profilePicture?: string;
  reviewedBy?: string;
  reviewedAt?: string;
  createdAt: string;
}

export interface StoredFarm {
  id: string;
  farmerId: string;
  name: string;
  location: string;
  totalAreaAcres: number;
  soilType: string;
  waterSource: string;
  ownershipType: string;
  latitude?: number;
  longitude?: number;
  managerIds?: string[];
  createdAt: string;
}

export interface StoredPlot {
  id: string;
  farmId: string;
  name: string;
  areaAcres: number;
  soilType: string;
  waterSource: string;
  ownershipType: string;
  notes?: string;
  createdAt: string;
}

export interface StoredCropCycle {
  id: string;
  plotId: string;
  farmId: string;
  cropName: string;
  variety?: string;
  season: string;
  sowingDate: string;
  expectedHarvestDate: string;
  currentStage: 'SOWING' | 'GERMINATION' | 'VEGETATIVE' | 'FLOWERING' | 'FRUIT_DEVELOPMENT' | 'MATURITY' | 'HARVEST';
  status: 'ACTIVE' | 'HARVESTED' | 'ABANDONED';
  actualHarvestDate?: string | null;
  harvestedQuantityKg?: number | null;
  harvestGrade?: string | null;
  notes?: string | null;
  createdAt: string;
}

export interface StoredTask {
  id: string;
  cropCycleId: string;
  farmId: string;
  plotId: string;
  title: string;
  description?: string;
  assignedTo?: string | null; // user_id (worker or manager)
  assigneeName?: string;
  priority: 'LOW' | 'NORMAL' | 'HIGH' | 'URGENT';
  dueDate: string;
  status: 'TODO' | 'ASSIGNED' | 'IN_PROGRESS' | 'COMPLETED' | 'CANCELLED' | 'OVERDUE';
  evidencePhotoUrl?: string | null;
  completionNotes?: string | null;
  completedAt?: string | null;
  wageAmount?: number | null;
  createdAt: string;
}

export interface StoredInventoryItem {
  id: string;
  farmId: string;
  name: string;
  category: 'SEEDS' | 'FERTILIZER' | 'PESTICIDE' | 'FUEL' | 'PACKAGING' | 'OTHER';
  unit: string;
  currentStock: number;
  averageUnitCost: number;
  lowStockThreshold: number;
  createdAt: string;
}

export interface StoredExpense {
  id: string;
  farmId: string;
  plotId: string;
  cropCycleId: string;
  category: 'SEEDS' | 'FERTILIZER' | 'PESTICIDE' | 'LABOUR' | 'MACHINERY' | 'FUEL' | 'ELECTRICITY' | 'WATER' | 'TRANSPORT' | 'STORAGE' | 'REPAIRS' | 'OTHER';
  amount: number;
  date: string;
  vendor?: string | null;
  receiptUrl?: string | null;
  notes?: string | null;
  source: 'MANUAL' | 'INVENTORY_CONSUMPTION' | 'TASK_LABOUR';
  createdAt: string;
}

export interface StoredMarketPrice {
  id: string;
  cropName: string;
  variety?: string;
  mandiName: string;
  district: string;
  state: string;
  minPrice: number;
  maxPrice: number;
  modalPrice: number; // Rs/kg reference
  date: string; // As of date
  arrivalVolumeQuintals?: number;
  govApiRef?: string;
  source?: 'GOV_AGMARKNET' | 'GOV_ENAM' | 'MANUAL';
  trend?: 'UP' | 'DOWN' | 'STABLE';
  changePercent?: string;
  isBlocked?: boolean; // When true, blocked by admin, completely hidden from non-admin users
  blockedReason?: string;
  blockedAt?: string;
  blockedBy?: string;
  lastSyncTimestamp?: string;
}

export interface StoredProduceListing {
  id: string;
  cropCycleId: string;
  farmerId: string;
  farmerName?: string;
  cropName: string;
  variety?: string;
  quantityKg: number;
  askingPricePerKg: number;
  costPerKg?: number | null; // Real cultivation cost basis (Private to farmer!)
  nearestMandiModalPrice?: number | null;
  grade?: string;
  pickupLocation: string;
  availableFrom: string;
  availableUntil: string;
  photos?: string[];
  status: 'ACTIVE' | 'OFFERED' | 'SOLD' | 'CANCELLED';
  createdAt: string;
}

export interface StoredOffer {
  id: string;
  listingId: string;
  buyerId: string;
  buyerName?: string;
  offeredPricePerKg: number;
  quantityKg: number;
  totalOfferAmount: number;
  counterPricePerKg?: number | null;
  message?: string;
  status: 'PENDING' | 'ACCEPTED' | 'REJECTED' | 'COUNTERED';
  createdAt: string;
}

export interface StoredOrder {
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
  status: 'LISTED' | 'OFFERED' | 'ACCEPTED' | 'SCHEDULED' | 'PICKED_UP' | 'DELIVERED' | 'COMPLETED' | 'CANCELLED';
  scheduledPickupDate?: string | null;
  actualPickupDate?: string | null;
  actualDeliveryDate?: string | null;
  proofOfDeliveryUrl?: string | null;
  proofOfDeliveryNote?: string | null;
  logisticsArrangedBy: string;
  createdAt: string;
}

export interface StoredMandiYard {
  id: string;
  name: string;
  agentId: string;
  location: string;
  district: string;
  state: string;
  commoditiesTraded: string[];
  defaultCommissionRate: number;
  createdAt: string;
}

export interface StoredMandiSlot {
  id: string;
  mandiId: string;
  date: string;
  timeWindow: string;
  capacityQuintals: number;
  bookedQuintals: number;
  commoditiesAccepted: string[];
  status: 'OPEN' | 'FULL' | 'CLOSED';
  createdAt: string;
}

export interface StoredSlotBooking {
  id: string;
  slotId: string;
  mandiId: string;
  farmerId: string;
  farmerName?: string;
  cropCycleId?: string;
  cropName: string;
  expectedQuantityKg: number;
  status: 'REQUESTED' | 'CONFIRMED' | 'COMPLETED' | 'CANCELLED' | 'NO_SHOW';
  rejectionReason?: string;
  createdAt: string;
}

export interface StoredMandiSale {
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
  commissionRate: number;
  commissionAmount: number;
  netPayout: number;
  saleDate: string;
  agentNotes?: string;
  createdAt: string;
}

export interface StoredProfitReport {
  id: string;
  cropCycleId: string;
  cropName: string;
  farmId: string;
  plotId: string;
  saleType: 'DIRECT_ORDER' | 'MANDI_SALE';
  referenceId: string;
  quantitySoldKg: number;
  salePricePerKg: number;
  grossRevenue: number;
  deductions: number;
  totalRevenue: number;
  totalCost: number;
  netProfit: number;
  marginPercent: number;
  profitPerKg: number;
  profitPerAcre: number;
  categoryBreakdown: Record<string, number>;
  generatedAt: string;
}

export interface StoredAuditLog {
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

export interface StoredDispute {
  id: string;
  referenceType: 'ORDER' | 'MANDI_SALE';
  referenceId: string;
  raisedBy: string;
  raisedByName: string;
  reason: string;
  status: 'OPEN' | 'UNDER_REVIEW' | 'RESOLVED';
  adminNotes?: string;
  resolutionOutcome?: string;
  createdAt: string;
}

function hash(pwd: string): string {
  return crypto.createHash('sha256').update(pwd).digest('hex');
}

const DEFAULT_HASH = hash('AgriBridgeAI@2026');

// ---------------------------------------------------------------------------
// Store Implementation
// ---------------------------------------------------------------------------

class Phase1Store {
  users: StoredUser[] = [];
  userRequests: StoredUserRequest[] = [];
  farms: StoredFarm[] = [];
  plots: StoredPlot[] = [];
  cropCycles: StoredCropCycle[] = [];
  tasks: StoredTask[] = [];
  inventoryItems: StoredInventoryItem[] = [];
  expenses: StoredExpense[] = [];
  mandiPrices: StoredMarketPrice[] = [];
  produceListings: StoredProduceListing[] = [];
  offers: StoredOffer[] = [];
  orders: StoredOrder[] = [];
  mandis: StoredMandiYard[] = [];
  mandiSlots: StoredMandiSlot[] = [];
  slotBookings: StoredSlotBooking[] = [];
  mandiSales: StoredMandiSale[] = [];
  profitReports: StoredProfitReport[] = [];
  auditLogs: StoredAuditLog[] = [];
  disputes: StoredDispute[] = [];

  constructor() {
    this.seedDefaults();
    this.initSupabase().catch((err) => {
      console.warn('[Supabase DB Sync]:', err.message);
    });
  }

  seedDefaults() {
    // 1. Users for each of the 7 roles (Password: AgriBridgeAI@2026)
    const ALL_PERMISSIONS = [
      'farm_overview', 'plots_manage', 'crop_cycles', 'growth_stages', 'harvest_log', 'weather_radar',
      'task_schedule', 'labor_assign', 'proof_photos', 'wage_attendance',
      'expense_entry', 'cost_basis_engine', 'fertilizer_cost', 'profit_loss_reports',
      'inventory_ledger', 'reorder_alerts', 'stock_adjust', 'vendor_depot',
      'produce_listings', 'buyer_bids', 'sales_orders', 'logistics_dispatch',
      'mandi_ticker', 'slot_booking', 'auction_verify', 'payout_settlement',
      'user_management', 'role_requests', 'moderation', 'disputes_desk', 'audit_logs',
      'profile_view', 'profile_edit', 'bank_details', 'doc_vault', 'entity_masters'
    ];

    this.users = [
      {
        id: 'usr-admin-01',
        email: 'admin@agribridge.com',
        passwordHash: DEFAULT_HASH,
        firstName: 'System',
        lastName: 'Administrator',
        phone: '+91 98765 00001',
        roles: ['ADMIN'],
        status: 'active',
        companyName: 'AgriBridge AI HQ',
        country: 'INDIA',
        recentActivityAt: 'Sep 8, 2026 3:10 PM',
        profilePicture: '/avatars/avatar_admin.jpg',
        permissions: ALL_PERMISSIONS,
        internalUsers: [
          { id: 'sub-01', firstName: 'Anita', lastName: 'Rao', designation: 'Compliance Auditor', email: 'anita.rao@agribridge.com', isActive: true, createdAt: 'Aug 15, 2026 11:20 AM' },
          { id: 'sub-02', firstName: 'Kiran', lastName: 'Kumar', designation: 'Technical Operations', email: 'kiran.ops@agribridge.com', isActive: true, createdAt: 'Aug 20, 2026 04:30 PM' },
        ],
        createdAt: '2026-08-01T10:00:00Z',
      },
      {
        id: 'usr-adminmaker-01',
        email: 'adminmaker@agribridge.com',
        passwordHash: DEFAULT_HASH,
        firstName: 'Vikram',
        lastName: 'Maker',
        phone: '+91 98765 00002',
        roles: ['ADMIN_MAKER'],
        status: 'active',
        companyName: 'AgriBridge Regional Governance',
        country: 'INDIA',
        recentActivityAt: 'Sep 8, 2026 12:10 PM',
        profilePicture: '/avatars/avatar_admin_maker.svg',
        permissions: ['role_requests', 'profile_view', 'profile_edit', 'audit_logs'],
        internalUsers: [
          { id: 'sub-07', firstName: 'Rupesh', lastName: 'More', designation: 'Application Verifier', email: 'rupesh.more@agribridge.com', isActive: true, createdAt: 'Aug 22, 2026 10:15 AM' },
        ],
        createdAt: '2026-08-02T11:00:00Z',
      },
      {
        id: 'usr-farmer-01',
        email: 'farmer@agribridge.com',
        passwordHash: DEFAULT_HASH,
        firstName: 'Rajesh',
        lastName: 'Sharma',
        phone: '+91 98765 11111',
        roles: ['FARMER'],
        status: 'active',
        companyName: 'GreenValley Agro Farms',
        country: 'INDIA',
        recentActivityAt: 'Sep 8, 2026 1:45 PM',
        profilePicture: '/avatars/avatar_farmer.jpg',
        permissions: [
          'farm_overview', 'plots_manage', 'crop_cycles', 'growth_stages', 'harvest_log', 'weather_radar',
          'task_schedule', 'labor_assign', 'proof_photos', 'wage_attendance',
          'expense_entry', 'cost_basis_engine', 'fertilizer_cost', 'profit_loss_reports',
          'produce_listings', 'sales_orders', 'mandi_ticker', 'slot_booking',
          'profile_view', 'profile_edit', 'bank_details'
        ],
        internalUsers: [
          { id: 'sub-03', firstName: 'Ravi', lastName: 'Sharma', designation: 'Farm Supervisor', email: 'ravi.sharma@greenvalley.in', isActive: true, createdAt: 'Aug 10, 2026 09:00 AM' },
          { id: 'sub-08', firstName: 'Devendra', lastName: 'Patil', designation: 'Plot Agronomist', email: 'devendra@greenvalley.in', isActive: false, createdAt: 'Aug 18, 2026 02:40 PM' },
        ],
        createdAt: '2026-08-05T09:30:00Z',
      },
      {
        id: 'usr-manager-01',
        email: 'farmmanager@agribridge.com',
        passwordHash: DEFAULT_HASH,
        firstName: 'Amit',
        lastName: 'Verma',
        phone: '+91 98765 22222',
        roles: ['FARM_MANAGER'],
        status: 'active',
        companyName: 'Sahyadri Agronomy Estates',
        country: 'INDIA',
        recentActivityAt: 'Sep 8, 2026 11:30 AM',
        profilePicture: '/avatars/avatar_farm_manager.jpg',
        permissions: [
          'farm_overview', 'plots_manage', 'crop_cycles', 'growth_stages', 'harvest_log', 'weather_radar',
          'task_schedule', 'labor_assign', 'proof_photos',
          'inventory_ledger', 'reorder_alerts', 'stock_adjust', 'vendor_depot',
          'expense_entry', 'fertilizer_cost', 'profile_view'
        ],
        internalUsers: [
          { id: 'sub-05', firstName: 'Manoj', lastName: 'Kadam', designation: 'Inventory Storekeeper', email: 'manoj@sahyadriagro.com', isActive: true, createdAt: 'Aug 14, 2026 10:00 AM' },
        ],
        createdAt: '2026-08-06T10:00:00Z',
      },
      {
        id: 'usr-worker-01',
        email: 'worker@agribridge.com',
        passwordHash: DEFAULT_HASH,
        firstName: 'Suresh',
        lastName: 'Patil',
        phone: '+91 98765 33333',
        roles: ['WORKER'],
        status: 'active',
        companyName: 'Field Operations Unit 3',
        country: 'INDIA',
        recentActivityAt: 'Sep 5, 2026 06:20 PM',
        profilePicture: '/avatars/avatar_worker.svg',
        permissions: ['task_schedule', 'proof_photos', 'wage_attendance', 'profile_view'],
        internalUsers: [],
        createdAt: '2026-08-07T08:00:00Z',
      },
      {
        id: 'usr-buyer-01',
        email: 'buyer@agribridge.com',
        passwordHash: DEFAULT_HASH,
        firstName: 'Sunil',
        lastName: 'Mehta',
        phone: '+91 98765 44444',
        roles: ['BUYER'],
        status: 'active',
        companyName: 'BigBasket Wholesale Hub',
        country: 'INDIA',
        recentActivityAt: 'Sep 7, 2026 5:12 PM',
        profilePicture: '/avatars/avatar_buyer.svg',
        permissions: ['produce_listings', 'buyer_bids', 'sales_orders', 'logistics_dispatch', 'profile_view', 'bank_details'],
        internalUsers: [
          { id: 'sub-04', firstName: 'Priya', lastName: 'Nair', designation: 'Category Manager', email: 'priya.nair@bigbasket.in', isActive: true, createdAt: 'Aug 12, 2026 02:15 PM' },
          { id: 'sub-09', firstName: 'Rohit', lastName: 'Desai', designation: 'Logistics Inspector', email: 'rohit.desai@bigbasket.in', isActive: true, createdAt: 'Aug 25, 2026 11:00 AM' },
        ],
        createdAt: '2026-08-08T12:00:00Z',
      },
      {
        id: 'usr-agent-01',
        email: 'mandiagent@agribridge.com',
        passwordHash: DEFAULT_HASH,
        firstName: 'Ganesh',
        lastName: 'Shinde',
        phone: '+91 98765 55555',
        roles: ['MANDI_AGENT'],
        status: 'active',
        companyName: 'Apex APMC Commission Agency',
        country: 'INDIA',
        recentActivityAt: 'Sep 6, 2026 04:00 PM',
        profilePicture: '/avatars/avatar_mandi_agent.svg',
        permissions: ['mandi_ticker', 'slot_booking', 'auction_verify', 'payout_settlement', 'profile_view', 'bank_details'],
        internalUsers: [
          { id: 'sub-06', firstName: 'Sachin', lastName: 'Jadhav', designation: 'Weighbridge Clerk', email: 'sachin.apmc@apex.in', isActive: true, createdAt: 'Aug 18, 2026 03:00 PM' },
        ],
        createdAt: '2026-08-09T07:30:00Z',
      },
    ];

    // 2. User Requests (Approval Queue)
    this.userRequests = [
      {
        id: 'req-001',
        email: 'kiran.deshmukh@gmail.com',
        passwordHash: DEFAULT_HASH,
        firstName: 'Kiran',
        lastName: 'Deshmukh',
        phone: '+91 98220 12345',
        requestedRole: 'FARMER',
        requestedBy: 'adminmaker@agribridge.com',
        status: 'PENDING_APPROVAL',
        notes: 'Owns 15 acres pomegranate orchard in Niphad, Nashik. Verified local documents.',
        createdAt: '2026-09-02T14:20:00Z',
      },
      {
        id: 'req-002',
        email: 'sahil.procure@bigbasket.in',
        passwordHash: DEFAULT_HASH,
        firstName: 'Sahil',
        lastName: 'Kapoor',
        phone: '+91 98110 54321',
        requestedRole: 'BUYER',
        requestedBy: 'SELF_REGISTER',
        status: 'PENDING_APPROVAL',
        notes: 'Institutional wholesale procurement request for western Maharashtra hub.',
        createdAt: '2026-09-03T09:15:00Z',
      },
    ];

    // 3. Farms & Plots (Owned by Farmer Rajesh Sharma)
    this.farms = [
      {
        id: 'farm-01',
        farmerId: 'usr-farmer-01',
        name: 'Surya Green Valley Farm',
        location: 'Dindori Taluka, Nashik District, Maharashtra',
        totalAreaAcres: 25.0,
        soilType: 'Black Loamy',
        waterSource: 'Borewell & Drip Irrigation',
        ownershipType: 'Owned',
        latitude: 20.0889,
        longitude: 73.8344,
        managerIds: ['usr-manager-01'],
        createdAt: '2026-08-10T08:00:00Z',
      },
      {
        id: 'farm-02',
        farmerId: 'usr-farmer-01',
        name: 'Krishna Riverbed Plot',
        location: 'Pimpalgaon Baswant, Nashik, Maharashtra',
        totalAreaAcres: 12.5,
        soilType: 'Alluvial Riverbed',
        waterSource: 'River Canal & Pump',
        ownershipType: 'Leased',
        latitude: 20.1704,
        longitude: 73.9877,
        managerIds: ['usr-manager-01'],
        createdAt: '2026-08-12T09:00:00Z',
      },
    ];

    this.plots = [
      {
        id: 'plot-01',
        farmId: 'farm-01',
        name: 'Plot A — Pomegranate Orchard (Bhagwa)',
        areaAcres: 10.0,
        soilType: 'Black Loamy',
        waterSource: 'Drip Irrigation',
        ownershipType: 'Owned',
        notes: 'High-density plantation, 6th year fruiting.',
        createdAt: '2026-08-10T08:30:00Z',
      },
      {
        id: 'plot-02',
        farmId: 'farm-01',
        name: 'Plot B — Export Thompson Grapes',
        areaAcres: 8.0,
        soilType: 'Sandy Loam',
        waterSource: 'Borewell + Drip',
        ownershipType: 'Owned',
        notes: 'Y-trellis system, GlobalGAP compliant.',
        createdAt: '2026-08-10T08:45:00Z',
      },
      {
        id: 'plot-03',
        farmId: 'farm-01',
        name: 'Plot C — Soya & Pulses Rotation',
        areaAcres: 7.0,
        soilType: 'Black Cotton',
        waterSource: 'Rainfed & Sprinklers',
        ownershipType: 'Owned',
        notes: 'Crop rotation block.',
        createdAt: '2026-08-10T09:00:00Z',
      },
    ];

    // 4. Crop Cycles
    this.cropCycles = [
      {
        id: 'cc-01',
        plotId: 'plot-01',
        farmId: 'farm-01',
        cropName: 'Organic Pomegranate (Bhagwa)',
        variety: 'Bhagwa Super Red',
        season: 'Monsoon-Kharif 2026',
        sowingDate: '2026-02-15T00:00:00Z',
        expectedHarvestDate: '2026-08-25T00:00:00Z',
        currentStage: 'HARVEST',
        status: 'HARVESTED',
        actualHarvestDate: '2026-08-28T00:00:00Z',
        harvestedQuantityKg: 12500,
        harvestGrade: 'Grade A+ (Export Ready)',
        notes: 'Harvest completed with 12,500 kg yield. Exceptional color and brix index (16.5).',
        createdAt: '2026-02-15T08:00:00Z',
      },
      {
        id: 'cc-02',
        plotId: 'plot-02',
        farmId: 'farm-01',
        cropName: 'Thompson Seedless Grapes',
        variety: 'Thompson White',
        season: 'Kharif 2026',
        sowingDate: '2026-04-10T00:00:00Z',
        expectedHarvestDate: '2026-09-20T00:00:00Z',
        currentStage: 'MATURITY',
        status: 'ACTIVE',
        actualHarvestDate: null,
        harvestedQuantityKg: null,
        harvestGrade: null,
        notes: 'Berry softening stage, awaiting final brix check.',
        createdAt: '2026-04-10T08:00:00Z',
      },
    ];

    // 5. Tasks (Assigned to Worker Suresh Patil or Manager Amit Verma)
    this.tasks = [
      {
        id: 'tsk-01',
        cropCycleId: 'cc-02',
        farmId: 'farm-01',
        plotId: 'plot-02',
        title: 'Apply Potash & Micro-nutrients Foliar Spray',
        description: 'Spray Soluble Sulfate of Potash 0-0-50 for berry sizing and sugar accumulation.',
        assignedTo: 'usr-worker-01',
        assigneeName: 'Suresh Patil',
        priority: 'HIGH',
        dueDate: '2026-09-09T18:00:00Z',
        status: 'IN_PROGRESS',
        wageAmount: 450,
        createdAt: '2026-09-05T08:00:00Z',
      },
      {
        id: 'tsk-02',
        cropCycleId: 'cc-01',
        farmId: 'farm-01',
        plotId: 'plot-01',
        title: 'Post-Harvest Sorting & Crating for Despatch',
        description: 'Sort harvested pomegranates into export cartons (4.5kg) and domestic crates (20kg).',
        assignedTo: 'usr-worker-01',
        assigneeName: 'Suresh Patil',
        priority: 'NORMAL',
        dueDate: '2026-08-30T18:00:00Z',
        status: 'COMPLETED',
        evidencePhotoUrl: '/logo/sample-produce.png',
        completionNotes: 'Completed 620 export crates sorted and packed in cold storage.',
        completedAt: '2026-08-29T16:45:00Z',
        wageAmount: 900,
        createdAt: '2026-08-28T09:00:00Z',
      },
      {
        id: 'tsk-03',
        cropCycleId: 'cc-02',
        farmId: 'farm-01',
        plotId: 'plot-02',
        title: 'Irrigation Filter Backwash & Line Inspection',
        description: 'Clean disk filters and check dripper emitters in rows 1 to 24.',
        assignedTo: 'usr-manager-01',
        assigneeName: 'Amit Verma',
        priority: 'NORMAL',
        dueDate: '2026-09-12T17:00:00Z',
        status: 'TODO',
        wageAmount: 0,
        createdAt: '2026-09-06T10:00:00Z',
      },
    ];

    // 6. Inventory Items
    this.inventoryItems = [
      {
        id: 'inv-01',
        farmId: 'farm-01',
        name: 'NPK 19-19-19 Water Soluble Fertilizer',
        category: 'FERTILIZER',
        unit: 'Bag (25kg)',
        currentStock: 42,
        averageUnitCost: 1450,
        lowStockThreshold: 10,
        createdAt: '2026-08-01T08:00:00Z',
      },
      {
        id: 'inv-02',
        farmId: 'farm-01',
        name: 'Organic Bio-Fungicide (Trichoderma)',
        category: 'PESTICIDE',
        unit: 'Litre',
        currentStock: 16,
        averageUnitCost: 680,
        lowStockThreshold: 5,
        createdAt: '2026-08-01T08:00:00Z',
      },
      {
        id: 'inv-03',
        farmId: 'farm-01',
        name: 'Drip Emitter Flush Chemical',
        category: 'OTHER',
        unit: 'Can (5L)',
        currentStock: 4,
        averageUnitCost: 850,
        lowStockThreshold: 6, // Low stock warning!
        createdAt: '2026-08-01T08:00:00Z',
      },
    ];

    // 7. Expenses (Source of Truth for Cost Basis Calculation!)
    // Total for cc-01 (12,500 kg harvested):
    // Seeds/Saplings: 110,000 | Fertilizer: 85,000 | Pesticide: 42,000 | Labour: 96,000 | Irrigation/Electricity: 34,000 | Packaging: 45,000
    // Total = Rs 412,000
    // Real Cost Basis = 412,000 / 12,500 = Rs 32.96 per kg!
    this.expenses = [
      {
        id: 'exp-01',
        farmId: 'farm-01',
        plotId: 'plot-01',
        cropCycleId: 'cc-01',
        category: 'SEEDS',
        amount: 110000,
        date: '2026-02-18T10:00:00Z',
        vendor: 'Jain Tissue Culture Labs',
        receiptUrl: null,
        notes: 'High-density Bhagwa grafts (600 saplings @ Rs 183)',
        source: 'MANUAL',
        createdAt: '2026-02-18T10:00:00Z',
      },
      {
        id: 'exp-02',
        farmId: 'farm-01',
        plotId: 'plot-01',
        cropCycleId: 'cc-01',
        category: 'FERTILIZER',
        amount: 85000,
        date: '2026-04-12T11:00:00Z',
        vendor: 'Nashik Agro Inputs Depot',
        receiptUrl: null,
        notes: 'Organic vermicompost + water-soluble NPK foliar nutrients',
        source: 'INVENTORY_CONSUMPTION',
        createdAt: '2026-04-12T11:00:00Z',
      },
      {
        id: 'exp-03',
        farmId: 'farm-01',
        plotId: 'plot-01',
        cropCycleId: 'cc-01',
        category: 'PESTICIDE',
        amount: 42000,
        date: '2026-05-20T09:30:00Z',
        vendor: 'BioCare Solutions Ltd',
        receiptUrl: null,
        notes: 'Pheromone traps and botanical neem oil sprays',
        source: 'MANUAL',
        createdAt: '2026-05-20T09:30:00Z',
      },
      {
        id: 'exp-04',
        farmId: 'farm-01',
        plotId: 'plot-01',
        cropCycleId: 'cc-01',
        category: 'LABOUR',
        amount: 96000,
        date: '2026-07-15T18:00:00Z',
        vendor: 'Local Farm Labour Gang',
        receiptUrl: null,
        notes: 'Manual pruning, weed clearing, and harvesting labour',
        source: 'TASK_LABOUR',
        createdAt: '2026-07-15T18:00:00Z',
      },
      {
        id: 'exp-05',
        farmId: 'farm-01',
        plotId: 'plot-01',
        cropCycleId: 'cc-01',
        category: 'ELECTRICITY',
        amount: 34000,
        date: '2026-08-10T12:00:00Z',
        vendor: 'MSEDCL Maharashtra',
        receiptUrl: null,
        notes: 'Solar & grid agricultural pump consumption',
        source: 'MANUAL',
        createdAt: '2026-08-10T12:00:00Z',
      },
      {
        id: 'exp-06',
        farmId: 'farm-01',
        plotId: 'plot-01',
        cropCycleId: 'cc-01',
        category: 'STORAGE',
        amount: 45000,
        date: '2026-08-29T14:00:00Z',
        vendor: 'Pimpalgaon Cold Chain Hub',
        receiptUrl: null,
        notes: 'Corrugated boxes + pre-cooling facility storage (3 days)',
        source: 'MANUAL',
        createdAt: '2026-08-29T14:00:00Z',
      },
    ];

    // 8. Mandi Prices Reference (Government Agmarknet & e-NAM Wholesale Feeds)
    const todayStr = new Date().toISOString().split('T')[0];
    const nowIso = new Date().toISOString();

    this.mandiPrices = [
      {
        id: 'gov-mp-01',
        cropName: 'Organic Pomegranate',
        variety: 'Bhagwa Super Red',
        mandiName: 'Nashik APMC Yard',
        district: 'Nashik',
        state: 'Maharashtra',
        minPrice: 55.0,
        maxPrice: 78.0,
        modalPrice: 68.5,
        date: todayStr,
        arrivalVolumeQuintals: 1450,
        govApiRef: 'AGMARKNET-MH-NSK-0908',
        source: 'GOV_AGMARKNET',
        trend: 'UP',
        changePercent: '+3.4%',
        isBlocked: false,
        lastSyncTimestamp: nowIso,
      },
      {
        id: 'gov-mp-02',
        cropName: 'Thompson Seedless Grapes',
        variety: 'Export Grade-A',
        mandiName: 'Pimpalgaon Baswant APMC',
        district: 'Nashik',
        state: 'Maharashtra',
        minPrice: 65.0,
        maxPrice: 94.0,
        modalPrice: 82.0,
        date: todayStr,
        arrivalVolumeQuintals: 2100,
        govApiRef: 'AGMARKNET-MH-PMP-0908',
        source: 'GOV_AGMARKNET',
        trend: 'UP',
        changePercent: '+4.1%',
        isBlocked: false,
        lastSyncTimestamp: nowIso,
      },
      {
        id: 'gov-mp-03',
        cropName: 'Yellow Soyabean',
        variety: 'JS-335 FAQ',
        mandiName: 'Latur APMC Yard',
        district: 'Latur',
        state: 'Maharashtra',
        minPrice: 42.0,
        maxPrice: 49.5,
        modalPrice: 46.8,
        date: todayStr,
        arrivalVolumeQuintals: 3200,
        govApiRef: 'AGMARKNET-MH-LTR-0908',
        source: 'GOV_ENAM',
        trend: 'STABLE',
        changePercent: '0.0%',
        isBlocked: false,
        lastSyncTimestamp: nowIso,
      },
      {
        id: 'gov-mp-04',
        cropName: 'Red Onion',
        variety: 'Nashik Special Red',
        mandiName: 'Lasalgaon APMC Yard',
        district: 'Nashik',
        state: 'Maharashtra',
        minPrice: 22.0,
        maxPrice: 34.5,
        modalPrice: 28.0,
        date: todayStr,
        arrivalVolumeQuintals: 8400,
        govApiRef: 'AGMARKNET-MH-LSL-0908',
        source: 'GOV_AGMARKNET',
        trend: 'DOWN',
        changePercent: '-2.1%',
        isBlocked: false,
        lastSyncTimestamp: nowIso,
      },
      {
        id: 'gov-mp-05',
        cropName: 'Sharbati Wheat',
        variety: 'Sehore Premium',
        mandiName: 'Indore Krishi Upaj Mandi',
        district: 'Indore',
        state: 'Madhya Pradesh',
        minPrice: 31.0,
        maxPrice: 38.5,
        modalPrice: 35.2,
        date: todayStr,
        arrivalVolumeQuintals: 4600,
        govApiRef: 'AGMARKNET-MP-IND-0908',
        source: 'GOV_ENAM',
        trend: 'UP',
        changePercent: '+1.7%',
        isBlocked: false,
        lastSyncTimestamp: nowIso,
      },
      {
        id: 'gov-mp-06',
        cropName: 'Basmati Paddy',
        variety: 'Pusa 1121 Supreme',
        mandiName: 'Amritsar Grain Market',
        district: 'Amritsar',
        state: 'Punjab',
        minPrice: 38.0,
        maxPrice: 46.0,
        modalPrice: 43.5,
        date: todayStr,
        arrivalVolumeQuintals: 5800,
        govApiRef: 'AGMARKNET-PB-ASR-0908',
        source: 'GOV_AGMARKNET',
        trend: 'UP',
        changePercent: '+2.8%',
        isBlocked: false,
        lastSyncTimestamp: nowIso,
      },
      {
        id: 'gov-mp-07',
        cropName: 'Raw Cotton (Kapas)',
        variety: 'Shankar-6 Long Staple',
        mandiName: 'Rajkot Market Yard',
        district: 'Rajkot',
        state: 'Gujarat',
        minPrice: 68.0,
        maxPrice: 77.5,
        modalPrice: 73.0,
        date: todayStr,
        arrivalVolumeQuintals: 2900,
        govApiRef: 'AGMARKNET-GJ-RJK-0908',
        source: 'GOV_ENAM',
        trend: 'DOWN',
        changePercent: '-1.4%',
        isBlocked: false,
        lastSyncTimestamp: nowIso,
      },
      {
        id: 'gov-mp-08',
        cropName: 'Guntur Red Chilli',
        variety: 'Sannam S4 Dry',
        mandiName: 'Guntur Mirchi Yard',
        district: 'Guntur',
        state: 'Andhra Pradesh',
        minPrice: 175.0,
        maxPrice: 225.0,
        modalPrice: 198.0,
        date: todayStr,
        arrivalVolumeQuintals: 1850,
        govApiRef: 'AGMARKNET-AP-GNT-0908',
        source: 'GOV_AGMARKNET',
        trend: 'UP',
        changePercent: '+5.2%',
        isBlocked: false,
        lastSyncTimestamp: nowIso,
      },
      {
        id: 'gov-mp-09',
        cropName: 'Fresh Ginger',
        variety: 'Green Fresh Grade-1',
        mandiName: 'Shimoga APMC Market',
        district: 'Shimoga',
        state: 'Karnataka',
        minPrice: 52.0,
        maxPrice: 70.0,
        modalPrice: 62.5,
        date: todayStr,
        arrivalVolumeQuintals: 1100,
        govApiRef: 'AGMARKNET-KA-SHM-0908',
        source: 'GOV_AGMARKNET',
        trend: 'UP',
        changePercent: '+1.9%',
        isBlocked: false,
        lastSyncTimestamp: nowIso,
      },
      {
        id: 'gov-mp-10',
        cropName: 'Tomato Hybrid',
        variety: 'Abhinav Firm Red',
        mandiName: 'Kolar APMC Yard',
        district: 'Kolar',
        state: 'Karnataka',
        minPrice: 16.0,
        maxPrice: 26.0,
        modalPrice: 21.0,
        date: todayStr,
        arrivalVolumeQuintals: 7200,
        govApiRef: 'AGMARKNET-KA-KLR-0908',
        source: 'GOV_ENAM',
        trend: 'DOWN',
        changePercent: '-3.8%',
        isBlocked: false,
        lastSyncTimestamp: nowIso,
      },
      {
        id: 'gov-mp-11',
        cropName: 'Turmeric Fingers',
        variety: 'Salem Gold Unpolished',
        mandiName: 'Erode APMC Market',
        district: 'Erode',
        state: 'Tamil Nadu',
        minPrice: 118.0,
        maxPrice: 154.0,
        modalPrice: 136.0,
        date: todayStr,
        arrivalVolumeQuintals: 1400,
        govApiRef: 'AGMARKNET-TN-ERD-0908',
        source: 'GOV_AGMARKNET',
        trend: 'UP',
        changePercent: '+3.1%',
        isBlocked: false,
        lastSyncTimestamp: nowIso,
      },
      {
        id: 'gov-mp-12',
        cropName: 'Mustard Seed (Sarson)',
        variety: 'Black Bold 42% Oil',
        mandiName: 'Kota Krishi Mandi',
        district: 'Kota',
        state: 'Rajasthan',
        minPrice: 52.5,
        maxPrice: 61.0,
        modalPrice: 57.5,
        date: todayStr,
        arrivalVolumeQuintals: 3600,
        govApiRef: 'AGMARKNET-RJ-KOT-0908',
        source: 'GOV_ENAM',
        trend: 'STABLE',
        changePercent: '0.0%',
        isBlocked: false,
        lastSyncTimestamp: nowIso,
      },
      {
        id: 'gov-mp-13',
        cropName: 'Bengal Gram (Chana)',
        variety: 'Desi Chana Grade-A',
        mandiName: 'Bhopal Central Mandi',
        district: 'Bhopal',
        state: 'Madhya Pradesh',
        minPrice: 58.0,
        maxPrice: 66.5,
        modalPrice: 62.0,
        date: todayStr,
        arrivalVolumeQuintals: 2400,
        govApiRef: 'AGMARKNET-MP-BHP-0908',
        source: 'GOV_AGMARKNET',
        trend: 'UP',
        changePercent: '+2.0%',
        isBlocked: false,
        lastSyncTimestamp: nowIso,
      },
      {
        id: 'gov-mp-14',
        cropName: 'Potato',
        variety: 'Jyoti Table Potato',
        mandiName: 'Agra Mandi Samiti',
        district: 'Agra',
        state: 'Uttar Pradesh',
        minPrice: 14.0,
        maxPrice: 21.0,
        modalPrice: 17.5,
        date: todayStr,
        arrivalVolumeQuintals: 9500,
        govApiRef: 'AGMARKNET-UP-AGR-0908',
        source: 'GOV_AGMARKNET',
        trend: 'DOWN',
        changePercent: '-1.5%',
        isBlocked: false,
        lastSyncTimestamp: nowIso,
      },
      {
        id: 'gov-mp-15',
        cropName: 'Green Cardamom',
        variety: '8mm Bold Extra Green',
        mandiName: 'Vandanmedu Spices Yard',
        district: 'Idukki',
        state: 'Kerala',
        minPrice: 1850.0,
        maxPrice: 2400.0,
        modalPrice: 2120.0,
        date: todayStr,
        arrivalVolumeQuintals: 120,
        govApiRef: 'AGMARKNET-KL-IDK-0908',
        source: 'GOV_AGMARKNET',
        trend: 'UP',
        changePercent: '+6.4%',
        isBlocked: true,
        blockedReason: 'Admin Quality & Auction Discrepancy Review',
        blockedAt: '2026-09-08T10:15:00Z',
        blockedBy: 'admin@agribridge.com',
        lastSyncTimestamp: nowIso,
      },
      {
        id: 'gov-mp-16',
        cropName: 'Alphonso Mango',
        variety: 'Ratnagiri GI Tagged',
        mandiName: 'Ratnagiri APMC Market',
        district: 'Ratnagiri',
        state: 'Maharashtra',
        minPrice: 180.0,
        maxPrice: 260.0,
        modalPrice: 220.0,
        date: todayStr,
        arrivalVolumeQuintals: 310,
        govApiRef: 'AGMARKNET-MH-RTN-0908',
        source: 'GOV_AGMARKNET',
        trend: 'DOWN',
        changePercent: '-4.2%',
        isBlocked: true,
        blockedReason: 'End of harvest seasonal price volatility safeguard',
        blockedAt: '2026-09-08T11:30:00Z',
        blockedBy: 'admin@agribridge.com',
        lastSyncTimestamp: nowIso,
      },
    ];

    // 9. Produce Marketplace Listing (Direct Sale)
    // Farmer's real cost_per_kg = Rs 32.96! Asking price = Rs 74.00!
    this.produceListings = [
      {
        id: 'lst-01',
        cropCycleId: 'cc-01',
        farmerId: 'usr-farmer-01',
        farmerName: 'Rajesh Sharma',
        cropName: 'Organic Pomegranate (Bhagwa)',
        variety: 'Bhagwa Super Red',
        quantityKg: 8500,
        askingPricePerKg: 74.0,
        costPerKg: 32.96, // PRIVATE TO FARMER! Never shown to Buyer
        nearestMandiModalPrice: 68.5,
        grade: 'Grade A+ (Export Ready)',
        pickupLocation: 'Surya Green Valley Farm, Dindori, Nashik',
        availableFrom: '2026-09-01T00:00:00Z',
        availableUntil: '2026-09-25T00:00:00Z',
        photos: ['/logo/bg-login.png'],
        status: 'ACTIVE',
        createdAt: '2026-09-01T10:00:00Z',
      },
    ];

    // 10. Offers (Buyer सुनील Mehta makes an offer)
    this.offers = [
      {
        id: 'ofr-01',
        listingId: 'lst-01',
        buyerId: 'usr-buyer-01',
        buyerName: 'Sunil Mehta (FreshMart Retailing)',
        offeredPricePerKg: 64.0,
        quantityKg: 5000,
        totalOfferAmount: 320000,
        counterPricePerKg: null,
        message: 'Ready to dispatch refrigerated carrier for direct farmgate pickup within 48 hours.',
        status: 'PENDING',
        createdAt: '2026-09-03T11:20:00Z',
      },
    ];

    // 11. Orders (Already accepted direct sale progressing through logistics)
    this.orders = [
      {
        id: 'ord-01',
        listingId: 'lst-01',
        offerId: 'ofr-prior-01',
        buyerId: 'usr-buyer-01',
        buyerName: 'Sunil Mehta (FreshMart Retailing)',
        farmerId: 'usr-farmer-01',
        farmerName: 'Rajesh Sharma',
        cropName: 'Organic Pomegranate (Bhagwa)',
        quantityKg: 4000,
        agreedPricePerKg: 71.5,
        totalAmount: 286000,
        status: 'DELIVERED', // Can be marked COMPLETED by buyer/farmer!
        scheduledPickupDate: '2026-09-02T10:00:00Z',
        actualPickupDate: '2026-09-02T11:30:00Z',
        actualDeliveryDate: '2026-09-03T16:00:00Z',
        proofOfDeliveryUrl: '/logo/sample-pod.png',
        proofOfDeliveryNote: 'Received in sound condition at cold hub dock 3. Inspection grade A verified.',
        logisticsArrangedBy: 'BUYER',
        createdAt: '2026-09-01T15:00:00Z',
      },
    ];

    // 12. Mandi Yard & Slots
    this.mandis = [
      {
        id: 'mandi-01',
        name: 'Nashik Central APMC Market Yard',
        agentId: 'usr-agent-01',
        location: 'Market Yard Road, Panchavati, Nashik, Maharashtra',
        district: 'Nashik',
        state: 'Maharashtra',
        commoditiesTraded: ['Pomegranate', 'Grapes', 'Onion', 'Tomato', 'Capsicum'],
        defaultCommissionRate: 2.5,
        createdAt: '2026-08-15T08:00:00Z',
      },
    ];

    this.mandiSlots = [
      {
        id: 'slot-01',
        mandiId: 'mandi-01',
        date: '2026-09-10T00:00:00Z',
        timeWindow: '07:30 AM — 11:30 AM (Early Auction Window)',
        capacityQuintals: 450,
        bookedQuintals: 210,
        commoditiesAccepted: ['Pomegranate', 'Grapes'],
        status: 'OPEN',
        createdAt: '2026-09-01T08:00:00Z',
      },
      {
        id: 'slot-02',
        mandiId: 'mandi-01',
        date: '2026-09-12T00:00:00Z',
        timeWindow: '08:00 AM — 12:00 PM (Standard Window)',
        capacityQuintals: 600,
        bookedQuintals: 120,
        commoditiesAccepted: ['Pomegranate', 'Grapes', 'Onion'],
        status: 'OPEN',
        createdAt: '2026-09-01T08:00:00Z',
      },
    ];

    this.slotBookings = [
      {
        id: 'sb-01',
        slotId: 'slot-01',
        mandiId: 'mandi-01',
        farmerId: 'usr-farmer-01',
        farmerName: 'Rajesh Sharma',
        cropCycleId: 'cc-01',
        cropName: 'Organic Pomegranate (Bhagwa)',
        expectedQuantityKg: 2000,
        status: 'CONFIRMED',
        createdAt: '2026-09-04T12:00:00Z',
      },
    ];

    // 13. Completed Mandi Sale
    this.mandiSales = [
      {
        id: 'ms-01',
        bookingId: 'sb-prior-01',
        mandiId: 'mandi-01',
        farmerId: 'usr-farmer-01',
        cropCycleId: 'cc-01',
        cropName: 'Organic Pomegranate (Bhagwa)',
        actualQuantityKg: 2000,
        grade: 'Grade A',
        auctionSalePricePerKg: 70.0,
        grossRevenue: 140000,
        commissionRate: 2.5,
        commissionAmount: 3500,
        netPayout: 136500,
        saleDate: '2026-08-30T11:00:00Z',
        agentNotes: 'High bidder competition. Payout disbursed via RTGS.',
        createdAt: '2026-08-30T11:30:00Z',
      },
    ];

    // 14. Profit Reports (Radical Transparency - arithmetic on real recorded numbers!)
    this.profitReports = [
      {
        id: 'pr-01',
        cropCycleId: 'cc-01',
        cropName: 'Organic Pomegranate (Bhagwa)',
        farmId: 'farm-01',
        plotId: 'plot-01',
        saleType: 'MANDI_SALE',
        referenceId: 'ms-01',
        quantitySoldKg: 2000,
        salePricePerKg: 70.0,
        grossRevenue: 140000,
        deductions: 3500,
        totalRevenue: 136500,
        totalCost: 65920, // 2000kg * Rs 32.96 cost_per_kg
        netProfit: 70580,
        marginPercent: 51.7,
        profitPerKg: 35.29,
        profitPerAcre: 7058,
        categoryBreakdown: {
          SEEDS: 17600,
          FERTILIZER: 13600,
          PESTICIDE: 6720,
          LABOUR: 15360,
          ELECTRICITY: 5440,
          STORAGE: 7200,
        },
        generatedAt: '2026-08-30T12:00:00Z',
      },
    ];

    // 15. Audit Logs
    this.auditLogs = [
      {
        id: 'aud-01',
        userId: 'usr-admin-01',
        userName: 'System Administrator',
        action: 'USER_ROLE_SEED',
        entityName: 'Role',
        entityId: 'ALL',
        oldValue: null,
        newValue: '7 Roles Initialized',
        timestamp: '2026-08-01T10:00:00Z',
      },
      {
        id: 'aud-02',
        userId: 'usr-adminmaker-01',
        userName: 'Vikram Maker',
        action: 'REQUEST_USER_CREATION',
        entityName: 'UserRequest',
        entityId: 'req-001',
        oldValue: null,
        newValue: 'Role: FARMER, Email: kiran.deshmukh@gmail.com',
        timestamp: '2026-09-02T14:20:00Z',
      },
    ];

    // 16. Disputes
    this.disputes = [
      {
        id: 'disp-01',
        referenceType: 'ORDER',
        referenceId: 'ord-prior-99',
        raisedBy: 'usr-buyer-01',
        raisedByName: 'Sunil Mehta (Buyer)',
        reason: 'Carrier arrived 3 hours late at pickup point due to road block. Produce temperature was maintained, requesting rescheduled delivery receipt.',
        status: 'UNDER_REVIEW',
        adminNotes: 'Carrier logs reviewed. GPS shows vehicle stuck at highway toll bottleneck. Extension granted.',
        resolutionOutcome: undefined,
        createdAt: '2026-09-03T18:00:00Z',
      },
    ];
  }

  // Cost Aggregation Engine: Given a crop_cycle_id, returns total expense, breakdown, and cost_per_kg
  calculateCropCost(cropCycleId: string) {
    const cycle = this.cropCycles.find((c) => c.id === cropCycleId);
    if (!cycle) return null;

    const cycleExpenses = this.expenses.filter((e) => e.cropCycleId === cropCycleId);
    const totalExpense = cycleExpenses.reduce((sum, e) => sum + e.amount, 0);

    const categoryBreakdown: Record<string, number> = {};
    for (const exp of cycleExpenses) {
      categoryBreakdown[exp.category] = (categoryBreakdown[exp.category] || 0) + exp.amount;
    }

    const plot = this.plots.find((p) => p.id === cycle.plotId);
    const areaAcres = plot ? plot.areaAcres : 1;
    const costPerAcre = areaAcres > 0 ? Math.round((totalExpense / areaAcres) * 100) / 100 : totalExpense;

    const harvestQuantityKg = cycle.harvestedQuantityKg || null;
    const isHarvested = Boolean(harvestQuantityKg && harvestQuantityKg > 0);
    const costPerKg = isHarvested && harvestQuantityKg
      ? Math.round((totalExpense / harvestQuantityKg) * 100) / 100
      : null;

    return {
      cropCycleId,
      cropName: cycle.cropName,
      totalExpense,
      harvestQuantityKg,
      costPerKg,
      costPerAcre,
      isHarvested,
      categoryBreakdown,
      expensesCount: cycleExpenses.length,
    };
  }

  private isSaving = false;
  private savePending = false;
  public initialized = false;

  async initSupabase() {
    try {
      if (!supabase) return;
      const { data: buckets } = await supabase.storage.listBuckets();
      if (!buckets?.some((b) => b.name === 'agribridge-data')) {
        await supabase.storage.createBucket('agribridge-data', { public: false });
      }

      const { data: fileBlob, error } = await supabase.storage
        .from('agribridge-data')
        .download('phase1_state.json');

      if (fileBlob && !error) {
        const text = await fileBlob.text();
        const state = JSON.parse(text);
        if (state) {
          if (Array.isArray(state.users) && state.users.length) this.users = state.users;
          if (Array.isArray(state.userRequests)) this.userRequests = state.userRequests;
          if (Array.isArray(state.farms) && state.farms.length) this.farms = state.farms;
          if (Array.isArray(state.plots)) this.plots = state.plots;
          if (Array.isArray(state.cropCycles)) this.cropCycles = state.cropCycles;
          if (Array.isArray(state.tasks)) this.tasks = state.tasks;
          if (Array.isArray(state.inventoryItems)) this.inventoryItems = state.inventoryItems;
          if (Array.isArray(state.expenses)) this.expenses = state.expenses;
          if (Array.isArray(state.mandiPrices)) this.mandiPrices = state.mandiPrices;
          if (Array.isArray(state.produceListings)) this.produceListings = state.produceListings;
          if (Array.isArray(state.offers)) this.offers = state.offers;
          if (Array.isArray(state.orders)) this.orders = state.orders;
          if (Array.isArray(state.mandis)) this.mandis = state.mandis;
          if (Array.isArray(state.mandiSlots)) this.mandiSlots = state.mandiSlots;
          if (Array.isArray(state.slotBookings)) this.slotBookings = state.slotBookings;
          if (Array.isArray(state.mandiSales)) this.mandiSales = state.mandiSales;
          if (Array.isArray(state.profitReports)) this.profitReports = state.profitReports;
          if (Array.isArray(state.auditLogs)) this.auditLogs = state.auditLogs;
          if (Array.isArray(state.disputes)) this.disputes = state.disputes;
          console.log('[Supabase DB] Synced state snapshot from Supabase Storage (agribridge-data)');
        }
      } else {
        await this.saveToSupabase();
        console.log('[Supabase DB] Seeded initial state snapshot to Supabase Storage (agribridge-data)');
      }

      this.initialized = true;
    } catch (err: any) {
      console.warn('[Supabase DB Init Warning]:', err.message);
    }
  }

  async saveToSupabase(): Promise<void> {
    if (this.isSaving) {
      this.savePending = true;
      return;
    }
    this.isSaving = true;
    try {
      if (!supabase) return;
      const snapshot = {
        updatedAt: new Date().toISOString(),
        users: this.users,
        userRequests: this.userRequests,
        farms: this.farms,
        plots: this.plots,
        cropCycles: this.cropCycles,
        tasks: this.tasks,
        inventoryItems: this.inventoryItems,
        expenses: this.expenses,
        mandiPrices: this.mandiPrices,
        produceListings: this.produceListings,
        offers: this.offers,
        orders: this.orders,
        mandis: this.mandis,
        mandiSlots: this.mandiSlots,
        slotBookings: this.slotBookings,
        mandiSales: this.mandiSales,
        profitReports: this.profitReports,
        auditLogs: this.auditLogs,
        disputes: this.disputes,
      };

      const payload = JSON.stringify(snapshot, null, 2);
      await supabase.storage
        .from('agribridge-data')
        .upload('phase1_state.json', payload, { upsert: true, contentType: 'application/json' });
    } catch (err: any) {
      console.warn('[Supabase Save Warning]:', err.message);
    } finally {
      this.isSaving = false;
      if (this.savePending) {
        this.savePending = false;
        this.saveToSupabase();
      }
    }
  }
}

export const phase1Store = new Phase1Store();
