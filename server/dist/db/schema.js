import { pgTable, uuid, text, timestamp, varchar, integer, numeric, uniqueIndex, primaryKey, pgEnum } from 'drizzle-orm/pg-core';
// --- ENUMS ---
export const userStatusEnum = pgEnum('user_status', ['active', 'suspended', 'pending', 'pending_approval']);
export const cropStageEnum = pgEnum('crop_stage', ['SOWING', 'GERMINATION', 'VEGETATIVE', 'FLOWERING', 'FRUIT_DEVELOPMENT', 'MATURITY', 'HARVEST']);
export const cropCycleStatusEnum = pgEnum('crop_cycle_status', ['ACTIVE', 'HARVESTED', 'ABANDONED']);
export const taskStatusEnum = pgEnum('task_status', ['TODO', 'ASSIGNED', 'IN_PROGRESS', 'COMPLETED', 'CANCELLED', 'OVERDUE']);
export const taskPriorityEnum = pgEnum('task_priority', ['LOW', 'NORMAL', 'HIGH', 'URGENT']);
export const inventoryTypeEnum = pgEnum('inventory_type', ['PURCHASE', 'CONSUMPTION']);
export const expenseSourceEnum = pgEnum('expense_source', ['MANUAL', 'INVENTORY_CONSUMPTION', 'TASK_LABOUR']);
export const produceListingStatusEnum = pgEnum('produce_listing_status', ['ACTIVE', 'OFFERED', 'SOLD', 'CANCELLED']);
export const offerStatusEnum = pgEnum('offer_status', ['PENDING', 'ACCEPTED', 'REJECTED', 'COUNTERED']);
export const produceOrderStatusEnum = pgEnum('produce_order_status', ['LISTED', 'OFFERED', 'ACCEPTED', 'SCHEDULED', 'PICKED_UP', 'DELIVERED', 'COMPLETED', 'CANCELLED']);
export const slotStatusEnum = pgEnum('slot_status', ['OPEN', 'FULL', 'CLOSED']);
export const bookingStatusEnum = pgEnum('booking_status', ['REQUESTED', 'CONFIRMED', 'COMPLETED', 'CANCELLED', 'NO_SHOW']);
export const disputeStatusEnum = pgEnum('dispute_status', ['OPEN', 'UNDER_REVIEW', 'RESOLVED']);
// --- 1. USERS, ROLES & APPROVAL QUEUE ---
export const users = pgTable('users', {
    id: uuid('id').primaryKey().defaultRandom(),
    email: varchar('email', { length: 255 }).notNull().unique(),
    passwordHash: text('password_hash').notNull(),
    firstName: varchar('first_name', { length: 100 }),
    lastName: varchar('last_name', { length: 100 }),
    phone: varchar('phone', { length: 30 }),
    status: userStatusEnum('status').default('active').notNull(),
    tenantId: uuid('tenant_id'),
    createdAt: timestamp('created_at', { withTimezone: true }).defaultNow().notNull(),
    updatedAt: timestamp('updated_at', { withTimezone: true }).defaultNow().notNull(),
    deletedAt: timestamp('deleted_at', { withTimezone: true }),
}, (table) => ({
    emailIdx: uniqueIndex('users_email_uidx').on(table.email),
}));
export const roles = pgTable('roles', {
    id: uuid('id').primaryKey().defaultRandom(),
    name: varchar('name', { length: 100 }).notNull().unique(),
    description: text('description'),
    createdAt: timestamp('created_at', { withTimezone: true }).defaultNow().notNull(),
    updatedAt: timestamp('updated_at', { withTimezone: true }).defaultNow().notNull(),
});
export const userRoles = pgTable('user_roles', {
    userId: uuid('user_id').references(() => users.id, { onDelete: 'cascade' }).notNull(),
    roleId: uuid('role_id').references(() => roles.id, { onDelete: 'cascade' }).notNull(),
}, (table) => ({
    pk: primaryKey({ columns: [table.userId, table.roleId] }),
}));
export const tenants = pgTable('tenants', {
    id: uuid('id').primaryKey().defaultRandom(),
    name: varchar('name', { length: 255 }).notNull(),
    licenseNumber: varchar('license_number', { length: 100 }),
    status: varchar('status', { length: 50 }).default('active'),
    createdAt: timestamp('created_at', { withTimezone: true }).defaultNow().notNull(),
});
export const permissions = pgTable('permissions', {
    id: uuid('id').primaryKey().defaultRandom(),
    name: varchar('name', { length: 100 }).notNull().unique(),
    description: text('description'),
    createdAt: timestamp('created_at', { withTimezone: true }).defaultNow().notNull(),
});
export const rolePermissions = pgTable('role_permissions', {
    roleId: uuid('role_id').references(() => roles.id, { onDelete: 'cascade' }).notNull(),
    permissionId: uuid('permission_id').references(() => permissions.id, { onDelete: 'cascade' }).notNull(),
}, (table) => ({
    pk: primaryKey({ columns: [table.roleId, table.permissionId] }),
}));
export const userRequests = pgTable('user_requests', {
    id: uuid('id').primaryKey().defaultRandom(),
    email: varchar('email', { length: 255 }).notNull(),
    passwordHash: text('password_hash').notNull(),
    firstName: varchar('first_name', { length: 100 }).notNull(),
    lastName: varchar('last_name', { length: 100 }).notNull(),
    phone: varchar('phone', { length: 30 }),
    requestedRole: varchar('requested_role', { length: 50 }).notNull(),
    requestedBy: varchar('requested_by', { length: 255 }).notNull(), // admin_maker user_id or 'SELF_REGISTER'
    status: varchar('status', { length: 50 }).default('PENDING_APPROVAL').notNull(), // 'PENDING_APPROVAL' | 'APPROVED' | 'REJECTED'
    notes: text('notes'),
    reviewedBy: uuid('reviewed_by').references(() => users.id),
    reviewedAt: timestamp('reviewed_at', { withTimezone: true }),
    createdAt: timestamp('created_at', { withTimezone: true }).defaultNow().notNull(),
});
export const farmPermissions = pgTable('farm_permissions', {
    id: uuid('id').primaryKey().defaultRandom(),
    userId: uuid('user_id').references(() => users.id, { onDelete: 'cascade' }).notNull(),
    farmId: uuid('farm_id').notNull(),
    role: varchar('role', { length: 50 }).notNull(), // 'FARM_MANAGER' | 'WORKER'
    grantedBy: uuid('granted_by').references(() => users.id).notNull(),
    createdAt: timestamp('created_at', { withTimezone: true }).defaultNow().notNull(),
});
// --- 2. FARMS & PLOTS ---
export const farms = pgTable('farms', {
    id: uuid('id').primaryKey().defaultRandom(),
    farmerId: uuid('farmer_id').references(() => users.id, { onDelete: 'cascade' }).notNull(),
    name: varchar('name', { length: 255 }).notNull(),
    location: text('location').notNull(),
    latitude: numeric('latitude', { precision: 10, scale: 7 }),
    longitude: numeric('longitude', { precision: 10, scale: 7 }),
    totalAreaAcres: numeric('total_area_acres', { precision: 10, scale: 2 }).notNull(),
    soilType: varchar('soil_type', { length: 100 }),
    waterSource: varchar('water_source', { length: 100 }),
    ownershipType: varchar('ownership_type', { length: 100 }).default('Owned'),
    createdAt: timestamp('created_at', { withTimezone: true }).defaultNow().notNull(),
    updatedAt: timestamp('updated_at', { withTimezone: true }).defaultNow().notNull(),
    deletedAt: timestamp('deleted_at', { withTimezone: true }),
});
export const plots = pgTable('plots', {
    id: uuid('id').primaryKey().defaultRandom(),
    farmId: uuid('farm_id').references(() => farms.id, { onDelete: 'cascade' }).notNull(),
    name: varchar('name', { length: 255 }).notNull(),
    areaAcres: numeric('area_acres', { precision: 10, scale: 2 }).notNull(),
    soilType: varchar('soil_type', { length: 100 }).notNull(),
    waterSource: varchar('water_source', { length: 100 }).notNull(),
    ownershipType: varchar('ownership_type', { length: 100 }).default('Owned').notNull(),
    notes: text('notes'),
    createdAt: timestamp('created_at', { withTimezone: true }).defaultNow().notNull(),
    updatedAt: timestamp('updated_at', { withTimezone: true }).defaultNow().notNull(),
    deletedAt: timestamp('deleted_at', { withTimezone: true }),
});
// --- 3. CROPS & CROP CYCLES ---
export const crops = pgTable('crops', {
    id: uuid('id').primaryKey().defaultRandom(),
    name: varchar('name', { length: 100 }).notNull().unique(),
    variety: varchar('variety', { length: 100 }),
    category: varchar('category', { length: 100 }),
    typicalDurationDays: integer('typical_duration_days').default(90),
    hsCode: varchar('hs_code', { length: 20 }),
});
export const cropCycles = pgTable('crop_cycles', {
    id: uuid('id').primaryKey().defaultRandom(),
    plotId: uuid('plot_id').references(() => plots.id, { onDelete: 'cascade' }).notNull(),
    farmId: uuid('farm_id').references(() => farms.id, { onDelete: 'cascade' }).notNull(),
    cropName: varchar('crop_name', { length: 150 }).notNull(),
    variety: varchar('variety', { length: 100 }),
    season: varchar('season', { length: 50 }).default('Kharif 2026'),
    sowingDate: timestamp('sowing_date', { withTimezone: true }).notNull(),
    expectedHarvestDate: timestamp('expected_harvest_date', { withTimezone: true }).notNull(),
    currentStage: cropStageEnum('current_stage').default('SOWING').notNull(),
    status: cropCycleStatusEnum('status').default('ACTIVE').notNull(),
    actualHarvestDate: timestamp('actual_harvest_date', { withTimezone: true }),
    harvestedQuantityKg: numeric('harvested_quantity_kg', { precision: 12, scale: 2 }),
    harvestGrade: varchar('harvest_grade', { length: 20 }),
    notes: text('notes'),
    createdAt: timestamp('created_at', { withTimezone: true }).defaultNow().notNull(),
    updatedAt: timestamp('updated_at', { withTimezone: true }).defaultNow().notNull(),
});
// --- 4. TASKS & WORK MANAGEMENT ---
export const tasks = pgTable('tasks', {
    id: uuid('id').primaryKey().defaultRandom(),
    cropCycleId: uuid('crop_cycle_id').references(() => cropCycles.id, { onDelete: 'cascade' }).notNull(),
    farmId: uuid('farm_id').references(() => farms.id, { onDelete: 'cascade' }).notNull(),
    plotId: uuid('plot_id').references(() => plots.id, { onDelete: 'cascade' }).notNull(),
    title: varchar('title', { length: 255 }).notNull(),
    description: text('description'),
    assignedTo: uuid('assigned_to').references(() => users.id),
    priority: taskPriorityEnum('priority').default('NORMAL').notNull(),
    dueDate: timestamp('due_date', { withTimezone: true }).notNull(),
    status: taskStatusEnum('status').default('TODO').notNull(),
    evidencePhotoUrl: text('evidence_photo_url'),
    completionNotes: text('completion_notes'),
    completedAt: timestamp('completed_at', { withTimezone: true }),
    wageAmount: numeric('wage_amount', { precision: 10, scale: 2 }),
    createdAt: timestamp('created_at', { withTimezone: true }).defaultNow().notNull(),
    updatedAt: timestamp('updated_at', { withTimezone: true }).defaultNow().notNull(),
});
// --- 5. INVENTORY & TRANSACTIONS ---
export const inventoryItems = pgTable('inventory_items', {
    id: uuid('id').primaryKey().defaultRandom(),
    farmId: uuid('farm_id').references(() => farms.id, { onDelete: 'cascade' }).notNull(),
    name: varchar('name', { length: 255 }).notNull(),
    category: varchar('category', { length: 50 }).notNull(), // 'SEEDS' | 'FERTILIZER' | 'PESTICIDE' | 'FUEL' | 'OTHER'
    unit: varchar('unit', { length: 50 }).notNull(), // 'kg' | 'litre' | 'packet'
    currentStock: numeric('current_stock', { precision: 12, scale: 2 }).default('0').notNull(),
    averageUnitCost: numeric('average_unit_cost', { precision: 10, scale: 2 }).default('0').notNull(),
    lowStockThreshold: numeric('low_stock_threshold', { precision: 12, scale: 2 }).default('10').notNull(),
    createdAt: timestamp('created_at', { withTimezone: true }).defaultNow().notNull(),
    updatedAt: timestamp('updated_at', { withTimezone: true }).defaultNow().notNull(),
});
export const inventoryTransactions = pgTable('inventory_transactions', {
    id: uuid('id').primaryKey().defaultRandom(),
    itemId: uuid('item_id').references(() => inventoryItems.id, { onDelete: 'cascade' }).notNull(),
    type: inventoryTypeEnum('type').notNull(),
    quantity: numeric('quantity', { precision: 12, scale: 2 }).notNull(),
    unitCost: numeric('unit_cost', { precision: 10, scale: 2 }).notNull(),
    totalCost: numeric('total_cost', { precision: 12, scale: 2 }).notNull(),
    cropCycleId: uuid('crop_cycle_id').references(() => cropCycles.id),
    supplierName: varchar('supplier_name', { length: 255 }),
    date: timestamp('date', { withTimezone: true }).defaultNow().notNull(),
    notes: text('notes'),
    createdAt: timestamp('created_at', { withTimezone: true }).defaultNow().notNull(),
});
// --- 6. EXPENSES & COST-BASIS ---
export const expenses = pgTable('expenses', {
    id: uuid('id').primaryKey().defaultRandom(),
    farmId: uuid('farm_id').references(() => farms.id, { onDelete: 'cascade' }).notNull(),
    plotId: uuid('plot_id').references(() => plots.id, { onDelete: 'cascade' }).notNull(),
    cropCycleId: uuid('crop_cycle_id').references(() => cropCycles.id, { onDelete: 'cascade' }).notNull(),
    category: varchar('category', { length: 50 }).notNull(), // 'SEEDS', 'FERTILIZER', 'PESTICIDE', 'LABOUR', 'MACHINERY', 'FUEL', 'ELECTRICITY', 'WATER', 'TRANSPORT', 'STORAGE', 'REPAIRS', 'OTHER'
    amount: numeric('amount', { precision: 12, scale: 2 }).notNull(),
    date: timestamp('date', { withTimezone: true }).defaultNow().notNull(),
    vendor: varchar('vendor', { length: 255 }),
    receiptUrl: text('receipt_url'),
    notes: text('notes'),
    source: expenseSourceEnum('source').default('MANUAL').notNull(),
    createdAt: timestamp('created_at', { withTimezone: true }).defaultNow().notNull(),
});
// --- 7. WEATHER ALERTS ---
export const weatherAlerts = pgTable('weather_alerts', {
    id: uuid('id').primaryKey().defaultRandom(),
    farmId: uuid('farm_id').references(() => farms.id, { onDelete: 'cascade' }).notNull(),
    alertType: varchar('alert_type', { length: 50 }).notNull(),
    severity: varchar('severity', { length: 50 }).notNull(),
    title: varchar('title', { length: 255 }).notNull(),
    actionableMessage: text('actionable_message').notNull(),
    date: timestamp('date', { withTimezone: true }).defaultNow().notNull(),
    createdAt: timestamp('created_at', { withTimezone: true }).defaultNow().notNull(),
});
// --- 8. MANDI PRICES REFERENCE ---
export const mandiPrices = pgTable('mandi_prices', {
    id: uuid('id').primaryKey().defaultRandom(),
    cropName: varchar('crop_name', { length: 150 }).notNull(),
    mandiName: varchar('mandi_name', { length: 255 }).notNull(),
    district: varchar('district', { length: 100 }).notNull(),
    state: varchar('state', { length: 100 }).notNull(),
    minPrice: numeric('min_price', { precision: 10, scale: 2 }).notNull(),
    maxPrice: numeric('max_price', { precision: 10, scale: 2 }).notNull(),
    modalPrice: numeric('modal_price', { precision: 10, scale: 2 }).notNull(),
    date: timestamp('date', { withTimezone: true }).notNull(),
    arrivalVolumeQuintals: numeric('arrival_volume_quintals', { precision: 10, scale: 2 }),
    createdAt: timestamp('created_at', { withTimezone: true }).defaultNow().notNull(),
});
// --- 9. PRODUCE MARKETPLACE, OFFERS & ORDERS ---
export const produceListings = pgTable('produce_listings', {
    id: uuid('id').primaryKey().defaultRandom(),
    cropCycleId: uuid('crop_cycle_id').references(() => cropCycles.id, { onDelete: 'cascade' }).notNull(),
    farmerId: uuid('farmer_id').references(() => users.id, { onDelete: 'cascade' }).notNull(),
    cropName: varchar('crop_name', { length: 150 }).notNull(),
    variety: varchar('variety', { length: 100 }),
    quantityKg: numeric('quantity_kg', { precision: 12, scale: 2 }).notNull(),
    askingPricePerKg: numeric('asking_price_per_kg', { precision: 10, scale: 2 }).notNull(),
    costPerKg: numeric('cost_per_kg', { precision: 10, scale: 2 }), // Private to farmer!
    nearestMandiModalPrice: numeric('nearest_mandi_modal_price', { precision: 10, scale: 2 }),
    grade: varchar('grade', { length: 20 }),
    pickupLocation: text('pickup_location').notNull(),
    availableFrom: timestamp('available_from', { withTimezone: true }).notNull(),
    availableUntil: timestamp('available_until', { withTimezone: true }).notNull(),
    photos: text('photos'), // JSON array of photo URLs
    status: produceListingStatusEnum('status').default('ACTIVE').notNull(),
    createdAt: timestamp('created_at', { withTimezone: true }).defaultNow().notNull(),
    updatedAt: timestamp('updated_at', { withTimezone: true }).defaultNow().notNull(),
});
export const produceOffers = pgTable('produce_offers', {
    id: uuid('id').primaryKey().defaultRandom(),
    listingId: uuid('listing_id').references(() => produceListings.id, { onDelete: 'cascade' }).notNull(),
    buyerId: uuid('buyer_id').references(() => users.id, { onDelete: 'cascade' }).notNull(),
    offeredPricePerKg: numeric('offered_price_per_kg', { precision: 10, scale: 2 }).notNull(),
    quantityKg: numeric('quantity_kg', { precision: 12, scale: 2 }).notNull(),
    totalOfferAmount: numeric('total_offer_amount', { precision: 15, scale: 2 }).notNull(),
    counterPricePerKg: numeric('counter_price_per_kg', { precision: 10, scale: 2 }),
    message: text('message'),
    status: offerStatusEnum('status').default('PENDING').notNull(),
    createdAt: timestamp('created_at', { withTimezone: true }).defaultNow().notNull(),
    updatedAt: timestamp('updated_at', { withTimezone: true }).defaultNow().notNull(),
});
export const produceOrders = pgTable('produce_orders', {
    id: uuid('id').primaryKey().defaultRandom(),
    listingId: uuid('listing_id').references(() => produceListings.id).notNull(),
    offerId: uuid('offer_id').references(() => produceOffers.id).notNull(),
    buyerId: uuid('buyer_id').references(() => users.id).notNull(),
    farmerId: uuid('farmer_id').references(() => users.id).notNull(),
    cropName: varchar('crop_name', { length: 150 }).notNull(),
    quantityKg: numeric('quantity_kg', { precision: 12, scale: 2 }).notNull(),
    agreedPricePerKg: numeric('agreed_price_per_kg', { precision: 10, scale: 2 }).notNull(),
    totalAmount: numeric('total_amount', { precision: 15, scale: 2 }).notNull(),
    status: produceOrderStatusEnum('status').default('LISTED').notNull(),
    scheduledPickupDate: timestamp('scheduled_pickup_date', { withTimezone: true }),
    actualPickupDate: timestamp('actual_pickup_date', { withTimezone: true }),
    actualDeliveryDate: timestamp('actual_delivery_date', { withTimezone: true }),
    proofOfDeliveryUrl: text('proof_of_delivery_url'),
    proofOfDeliveryNote: text('proof_of_delivery_note'),
    logisticsArrangedBy: varchar('logistics_arranged_by', { length: 50 }).default('BUYER').notNull(),
    createdAt: timestamp('created_at', { withTimezone: true }).defaultNow().notNull(),
    updatedAt: timestamp('updated_at', { withTimezone: true }).defaultNow().notNull(),
});
// --- 10. MANDIS, SLOTS & SALES ---
export const mandis = pgTable('mandis', {
    id: uuid('id').primaryKey().defaultRandom(),
    name: varchar('name', { length: 255 }).notNull(),
    agentId: uuid('agent_id').references(() => users.id, { onDelete: 'cascade' }).notNull(),
    location: text('location').notNull(),
    district: varchar('district', { length: 100 }).notNull(),
    state: varchar('state', { length: 100 }).notNull(),
    commoditiesTraded: text('commodities_traded'), // JSON array
    defaultCommissionRate: numeric('default_commission_rate', { precision: 5, scale: 2 }).default('2.50').notNull(),
    createdAt: timestamp('created_at', { withTimezone: true }).defaultNow().notNull(),
});
export const mandiSlots = pgTable('mandi_slots', {
    id: uuid('id').primaryKey().defaultRandom(),
    mandiId: uuid('mandi_id').references(() => mandis.id, { onDelete: 'cascade' }).notNull(),
    date: timestamp('date', { withTimezone: true }).notNull(),
    timeWindow: varchar('time_window', { length: 100 }).notNull(),
    capacityQuintals: numeric('capacity_quintals', { precision: 10, scale: 2 }).notNull(),
    bookedQuintals: numeric('booked_quintals', { precision: 10, scale: 2 }).default('0').notNull(),
    commoditiesAccepted: text('commodities_accepted'), // JSON array
    status: slotStatusEnum('status').default('OPEN').notNull(),
    createdAt: timestamp('created_at', { withTimezone: true }).defaultNow().notNull(),
});
export const slotBookings = pgTable('slot_bookings', {
    id: uuid('id').primaryKey().defaultRandom(),
    slotId: uuid('slot_id').references(() => mandiSlots.id, { onDelete: 'cascade' }).notNull(),
    mandiId: uuid('mandi_id').references(() => mandis.id, { onDelete: 'cascade' }).notNull(),
    farmerId: uuid('farmer_id').references(() => users.id, { onDelete: 'cascade' }).notNull(),
    cropCycleId: uuid('crop_cycle_id').references(() => cropCycles.id),
    cropName: varchar('crop_name', { length: 150 }).notNull(),
    expectedQuantityKg: numeric('expected_quantity_kg', { precision: 12, scale: 2 }).notNull(),
    status: bookingStatusEnum('status').default('REQUESTED').notNull(),
    rejectionReason: text('rejection_reason'),
    createdAt: timestamp('created_at', { withTimezone: true }).defaultNow().notNull(),
    updatedAt: timestamp('updated_at', { withTimezone: true }).defaultNow().notNull(),
});
export const mandiSales = pgTable('mandi_sales', {
    id: uuid('id').primaryKey().defaultRandom(),
    bookingId: uuid('booking_id').references(() => slotBookings.id, { onDelete: 'cascade' }).notNull().unique(),
    mandiId: uuid('mandi_id').references(() => mandis.id, { onDelete: 'cascade' }).notNull(),
    farmerId: uuid('farmer_id').references(() => users.id, { onDelete: 'cascade' }).notNull(),
    cropCycleId: uuid('crop_cycle_id').references(() => cropCycles.id),
    cropName: varchar('crop_name', { length: 150 }).notNull(),
    actualQuantityKg: numeric('actual_quantity_kg', { precision: 12, scale: 2 }).notNull(),
    grade: varchar('grade', { length: 20 }).notNull(),
    auctionSalePricePerKg: numeric('auction_sale_price_per_kg', { precision: 10, scale: 2 }).notNull(),
    grossRevenue: numeric('gross_revenue', { precision: 15, scale: 2 }).notNull(),
    commissionRate: numeric('commission_rate', { precision: 5, scale: 2 }).notNull(),
    commissionAmount: numeric('commission_amount', { precision: 15, scale: 2 }).notNull(),
    netPayout: numeric('net_payout', { precision: 15, scale: 2 }).notNull(),
    saleDate: timestamp('sale_date', { withTimezone: true }).defaultNow().notNull(),
    agentNotes: text('agent_notes'),
    createdAt: timestamp('created_at', { withTimezone: true }).defaultNow().notNull(),
});
// --- 11. PROFIT REPORTS ---
export const profitReports = pgTable('profit_reports', {
    id: uuid('id').primaryKey().defaultRandom(),
    cropCycleId: uuid('crop_cycle_id').references(() => cropCycles.id, { onDelete: 'cascade' }).notNull(),
    cropName: varchar('crop_name', { length: 150 }).notNull(),
    farmId: uuid('farm_id').references(() => farms.id).notNull(),
    plotId: uuid('plot_id').references(() => plots.id).notNull(),
    saleType: varchar('sale_type', { length: 50 }).notNull(), // 'DIRECT_ORDER' | 'MANDI_SALE'
    referenceId: uuid('reference_id').notNull(),
    quantitySoldKg: numeric('quantity_sold_kg', { precision: 12, scale: 2 }).notNull(),
    salePricePerKg: numeric('sale_price_per_kg', { precision: 10, scale: 2 }).notNull(),
    grossRevenue: numeric('gross_revenue', { precision: 15, scale: 2 }).notNull(),
    deductions: numeric('deductions', { precision: 15, scale: 2 }).default('0').notNull(),
    totalRevenue: numeric('total_revenue', { precision: 15, scale: 2 }).notNull(),
    totalCost: numeric('total_cost', { precision: 15, scale: 2 }).notNull(),
    netProfit: numeric('net_profit', { precision: 15, scale: 2 }).notNull(),
    marginPercent: numeric('margin_percent', { precision: 6, scale: 2 }).notNull(),
    profitPerKg: numeric('profit_per_kg', { precision: 10, scale: 2 }).notNull(),
    profitPerAcre: numeric('profit_per_acre', { precision: 12, scale: 2 }).notNull(),
    categoryBreakdown: text('category_breakdown'), // JSON representation
    generatedAt: timestamp('generated_at', { withTimezone: true }).defaultNow().notNull(),
});
// --- 12. DISPUTES & AUDIT LOGS ---
export const disputes = pgTable('disputes', {
    id: uuid('id').primaryKey().defaultRandom(),
    referenceType: varchar('reference_type', { length: 50 }).notNull(), // 'ORDER' | 'MANDI_SALE'
    referenceId: uuid('reference_id').notNull(),
    raisedBy: uuid('raised_by').references(() => users.id).notNull(),
    reason: text('reason').notNull(),
    status: disputeStatusEnum('status').default('OPEN').notNull(),
    adminNotes: text('admin_notes'),
    resolutionOutcome: text('resolution_outcome'),
    createdAt: timestamp('created_at', { withTimezone: true }).defaultNow().notNull(),
    resolvedAt: timestamp('resolved_at', { withTimezone: true }),
});
export const auditLogs = pgTable('audit_logs', {
    id: uuid('id').primaryKey().defaultRandom(),
    userId: uuid('user_id').references(() => users.id),
    action: varchar('action', { length: 150 }).notNull(),
    entityName: varchar('entity_name', { length: 100 }).notNull(),
    entityId: uuid('entity_id').notNull(),
    oldValue: text('old_value'),
    newValue: text('new_value'),
    timestamp: timestamp('timestamp', { withTimezone: true }).defaultNow().notNull(),
});
