import { pgTable, uuid, text, timestamp, varchar, numeric, index, uniqueIndex, primaryKey, pgEnum } from 'drizzle-orm/pg-core';
import { relations } from 'drizzle-orm';
// --- ENUMS ---
export const tenantStatusEnum = pgEnum('tenant_status', ['active', 'suspended']);
export const userStatusEnum = pgEnum('user_status', ['active', 'suspended', 'pending']);
export const harvestStatusEnum = pgEnum('harvest_status', ['unbatched', 'batched', 'sold']);
export const poolStatusEnum = pgEnum('pool_status', ['collecting', 'locked', 'processing', 'dispatched']);
export const inspectionGradeEnum = pgEnum('inspection_grade', ['A', 'B', 'C', 'Reject']);
export const certificateStatusEnum = pgEnum('certificate_status', ['valid', 'expired', 'revoked']);
export const orderStatusEnum = pgEnum('order_status', ['pending', 'paid', 'transit', 'completed', 'cancelled']);
export const paymentMethodEnum = pgEnum('payment_method', ['bank_transfer', 'letter_of_credit', 'escrow']);
export const paymentStatusEnum = pgEnum('payment_status', ['pending', 'authorized', 'settled', 'failed']);
export const customsStatusEnum = pgEnum('customs_status', ['pending', 'approved', 'rejected']);
// --- 1. TENANCY & AUTHORIZATION ---
export const tenants = pgTable('tenants', {
    id: uuid('id').primaryKey().defaultRandom(),
    name: text('name').notNull(),
    licenseNumber: varchar('license_number', { length: 100 }),
    status: tenantStatusEnum('status').default('active').notNull(),
    createdAt: timestamp('created_at', { withTimezone: true }).defaultNow().notNull(),
    updatedAt: timestamp('updated_at', { withTimezone: true }).defaultNow().notNull(),
    deletedAt: timestamp('deleted_at', { withTimezone: true }),
});
export const users = pgTable('users', {
    id: uuid('id').primaryKey().defaultRandom(),
    tenantId: uuid('tenant_id').references(() => tenants.id),
    email: varchar('email', { length: 255 }).notNull(),
    passwordHash: text('password_hash').notNull(),
    firstName: varchar('first_name', { length: 100 }),
    lastName: varchar('last_name', { length: 100 }),
    status: userStatusEnum('status').default('active').notNull(),
    createdAt: timestamp('created_at', { withTimezone: true }).defaultNow().notNull(),
    updatedAt: timestamp('updated_at', { withTimezone: true }).defaultNow().notNull(),
    deletedAt: timestamp('deleted_at', { withTimezone: true }),
}, (table) => ({
    emailIdx: uniqueIndex('users_email_uidx').on(table.email),
    tenantIdx: index('users_tenant_idx').on(table.tenantId),
}));
export const roles = pgTable('roles', {
    id: uuid('id').primaryKey().defaultRandom(),
    name: varchar('name', { length: 100 }).notNull().unique(),
    description: text('description'),
    createdAt: timestamp('created_at', { withTimezone: true }).defaultNow().notNull(),
    updatedAt: timestamp('updated_at', { withTimezone: true }).defaultNow().notNull(),
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
export const userRoles = pgTable('user_roles', {
    userId: uuid('user_id').references(() => users.id, { onDelete: 'cascade' }).notNull(),
    roleId: uuid('role_id').references(() => roles.id, { onDelete: 'cascade' }).notNull(),
}, (table) => ({
    pk: primaryKey({ columns: [table.userId, table.roleId] }),
}));
// --- 2. AGRITECH CORE ---
export const farmers = pgTable('farmers', {
    id: uuid('id').primaryKey().defaultRandom(),
    userId: uuid('user_id').references(() => users.id).notNull(),
    tenantId: uuid('tenant_id').references(() => tenants.id).notNull(),
    aadhaarHash: varchar('aadhaar_hash', { length: 256 }).notNull().unique(),
    registrationNumber: varchar('registration_number', { length: 100 }).notNull(),
    createdAt: timestamp('created_at', { withTimezone: true }).defaultNow().notNull(),
    updatedAt: timestamp('updated_at', { withTimezone: true }).defaultNow().notNull(),
    deletedAt: timestamp('deleted_at', { withTimezone: true }),
}, (table) => ({
    tenantRegIdx: uniqueIndex('farmers_tenant_reg_uidx').on(table.tenantId, table.registrationNumber),
}));
export const farms = pgTable('farms', {
    id: uuid('id').primaryKey().defaultRandom(),
    farmerId: uuid('farmer_id').references(() => farmers.id).notNull(),
    tenantId: uuid('tenant_id').references(() => tenants.id).notNull(),
    name: varchar('name', { length: 255 }).notNull(),
    soilType: varchar('soil_type', { length: 100 }),
    totalAreaHectares: numeric('total_area_hectares', { precision: 10, scale: 2 }),
    createdAt: timestamp('created_at', { withTimezone: true }).defaultNow().notNull(),
    updatedAt: timestamp('updated_at', { withTimezone: true }).defaultNow().notNull(),
    deletedAt: timestamp('deleted_at', { withTimezone: true }),
}, (table) => ({
    farmerIdx: index('farms_farmer_idx').on(table.farmerId),
}));
export const crops = pgTable('crops', {
    id: uuid('id').primaryKey().defaultRandom(),
    name: varchar('name', { length: 100 }).notNull().unique(),
    variety: varchar('variety', { length: 100 }),
    scientificName: varchar('scientific_name', { length: 150 }),
    hsCode: varchar('hs_code', { length: 20 }),
});
export const harvests = pgTable('harvests', {
    id: uuid('id').primaryKey().defaultRandom(),
    farmId: uuid('farm_id').references(() => farms.id).notNull(),
    cropId: uuid('crop_id').references(() => crops.id).notNull(),
    tenantId: uuid('tenant_id').references(() => tenants.id).notNull(),
    quantityKg: numeric('quantity_kg', { precision: 12, scale: 2 }).notNull(),
    moisturePercentage: numeric('moisture_percentage', { precision: 5, scale: 2 }),
    harvestDate: timestamp('harvest_date', { withTimezone: true }).notNull(),
    grade: varchar('grade', { length: 10 }),
    status: harvestStatusEnum('status').default('unbatched').notNull(),
    createdAt: timestamp('created_at', { withTimezone: true }).defaultNow().notNull(),
    updatedAt: timestamp('updated_at', { withTimezone: true }).defaultNow().notNull(),
}, (table) => ({
    searchIdx: index('harvests_search_idx').on(table.tenantId, table.cropId, table.status),
}));
export const pools = pgTable('pools', {
    id: uuid('id').primaryKey().defaultRandom(),
    tenantId: uuid('tenant_id').references(() => tenants.id).notNull(),
    name: varchar('name', { length: 255 }).notNull(),
    targetGrade: varchar('target_grade', { length: 10 }),
    status: poolStatusEnum('status').default('collecting').notNull(),
    createdAt: timestamp('created_at', { withTimezone: true }).defaultNow().notNull(),
    updatedAt: timestamp('updated_at', { withTimezone: true }).defaultNow().notNull(),
});
export const batches = pgTable('batches', {
    id: uuid('id').primaryKey().defaultRandom(),
    poolId: uuid('pool_id').references(() => pools.id),
    tenantId: uuid('tenant_id').references(() => tenants.id).notNull(),
    harvestId: uuid('harvest_id').references(() => harvests.id).notNull().unique(),
    weightKg: numeric('weight_kg', { precision: 12, scale: 2 }).notNull(),
    assignedAt: timestamp('assigned_at', { withTimezone: true }),
    createdAt: timestamp('created_at', { withTimezone: true }).defaultNow().notNull(),
    updatedAt: timestamp('updated_at', { withTimezone: true }).defaultNow().notNull(),
});
// --- 3. QUALITY, INSPECTION & CERTIFICATE ---
export const qualityInspections = pgTable('quality_inspections', {
    id: uuid('id').primaryKey().defaultRandom(),
    batchId: uuid('batch_id').references(() => batches.id).notNull(),
    tenantId: uuid('tenant_id').references(() => tenants.id).notNull(),
    inspectorId: uuid('inspector_id').references(() => users.id).notNull(),
    moistureContentPercentage: numeric('moisture_content_percentage', { precision: 5, scale: 2 }),
    foreignMatterPercentage: numeric('foreign_matter_percentage', { precision: 5, scale: 2 }),
    damagedGrainPercentage: numeric('damaged_grain_percentage', { precision: 5, scale: 2 }),
    assignedGrade: inspectionGradeEnum('assigned_grade').notNull(),
    comments: text('comments'),
    createdAt: timestamp('created_at', { withTimezone: true }).defaultNow().notNull(),
    updatedAt: timestamp('updated_at', { withTimezone: true }).defaultNow().notNull(),
}, (table) => ({
    batchGradeIdx: index('inspections_batch_grade_idx').on(table.batchId, table.assignedGrade),
}));
export const certificates = pgTable('certificates', {
    id: uuid('id').primaryKey().defaultRandom(),
    batchId: uuid('batch_id').references(() => batches.id).notNull(),
    tenantId: uuid('tenant_id').references(() => tenants.id).notNull(),
    certificateType: varchar('certificate_type', { length: 100 }).notNull(),
    certificateNumber: varchar('certificate_number', { length: 150 }).notNull().unique(),
    issuedBy: varchar('issued_by', { length: 255 }).notNull(),
    issuedAt: timestamp('issued_at', { withTimezone: true }).notNull(),
    expiryDate: timestamp('expiry_date', { withTimezone: true }),
    fileUrl: text('file_url'),
    status: certificateStatusEnum('status').default('valid').notNull(),
    createdAt: timestamp('created_at', { withTimezone: true }).defaultNow().notNull(),
});
// --- 4. MARKETPLACE & TRANSACTIONS ---
export const buyers = pgTable('buyers', {
    id: uuid('id').primaryKey().defaultRandom(),
    userId: uuid('user_id').references(() => users.id).notNull(),
    companyName: varchar('company_name', { length: 255 }).notNull(),
    importLicenseNumber: varchar('import_license_number', { length: 150 }),
    country: varchar('country', { length: 100 }).notNull(),
    createdAt: timestamp('created_at', { withTimezone: true }).defaultNow().notNull(),
    updatedAt: timestamp('updated_at', { withTimezone: true }).defaultNow().notNull(),
});
export const orders = pgTable('orders', {
    id: uuid('id').primaryKey().defaultRandom(),
    buyerId: uuid('buyer_id').references(() => buyers.id).notNull(),
    poolId: uuid('pool_id').references(() => pools.id).notNull().unique(),
    totalPriceUsd: numeric('total_price_usd', { precision: 15, scale: 2 }).notNull(),
    currency: varchar('currency', { length: 10 }).default('USD').notNull(),
    status: orderStatusEnum('status').default('pending').notNull(),
    createdAt: timestamp('created_at', { withTimezone: true }).defaultNow().notNull(),
    updatedAt: timestamp('updated_at', { withTimezone: true }).defaultNow().notNull(),
});
export const payments = pgTable('payments', {
    id: uuid('id').primaryKey().defaultRandom(),
    orderId: uuid('order_id').references(() => orders.id).notNull(),
    amount: numeric('amount', { precision: 15, scale: 2 }).notNull(),
    paymentMethod: paymentMethodEnum('payment_method').notNull(),
    transactionReference: varchar('transaction_reference', { length: 255 }).notNull().unique(),
    status: paymentStatusEnum('status').default('pending').notNull(),
    createdAt: timestamp('created_at', { withTimezone: true }).defaultNow().notNull(),
    updatedAt: timestamp('updated_at', { withTimezone: true }).defaultNow().notNull(),
});
// --- 5. EXPORTS & LOGISTICS ---
export const exports = pgTable('exports', {
    id: uuid('id').primaryKey().defaultRandom(),
    orderId: uuid('order_id').references(() => orders.id).notNull().unique(),
    portOfLoading: varchar('port_of_loading', { length: 150 }),
    portOfDischarge: varchar('port_of_discharge', { length: 150 }),
    customsStatus: customsStatusEnum('customs_status').default('pending').notNull(),
    customsDeclarationNumber: varchar('customs_declaration_number', { length: 150 }),
    createdAt: timestamp('created_at', { withTimezone: true }).defaultNow().notNull(),
    updatedAt: timestamp('updated_at', { withTimezone: true }).defaultNow().notNull(),
});
export const shipments = pgTable('shipments', {
    id: uuid('id').primaryKey().defaultRandom(),
    exportId: uuid('export_id').references(() => exports.id).notNull(),
    carrierName: varchar('carrier_name', { length: 255 }),
    vesselNumber: varchar('vessel_number', { length: 100 }),
    containerNumber: varchar('container_number', { length: 100 }),
    estimatedDeparture: timestamp('estimated_departure', { withTimezone: true }),
    estimatedArrival: timestamp('estimated_arrival', { withTimezone: true }),
    createdAt: timestamp('created_at', { withTimezone: true }).defaultNow().notNull(),
    updatedAt: timestamp('updated_at', { withTimezone: true }).defaultNow().notNull(),
});
// --- 6. LOGS, NOTIFICATIONS & ANALYTICS ---
export const notifications = pgTable('notifications', {
    id: uuid('id').primaryKey().defaultRandom(),
    userId: uuid('user_id').references(() => users.id).notNull(),
    title: varchar('title', { length: 255 }).notNull(),
    message: text('message').notNull(),
    channel: varchar('channel', { length: 50 }).notNull(), // sms, email, push
    status: varchar('status', { length: 50 }).default('queued').notNull(), // queued, sent, failed, read
    createdAt: timestamp('created_at', { withTimezone: true }).defaultNow().notNull(),
}, (table) => ({
    userStatusIdx: index('notifications_user_status_idx').on(table.userId, table.status),
}));
export const auditLogs = pgTable('audit_logs', {
    id: uuid('id').primaryKey().defaultRandom(),
    userId: uuid('user_id').references(() => users.id),
    tenantId: uuid('tenant_id').references(() => tenants.id),
    action: varchar('action', { length: 100 }).notNull(), // e.g. "grade:batch"
    entityName: varchar('entity_name', { length: 100 }).notNull(), // e.g. "batches"
    entityId: uuid('entity_id').notNull(),
    changes: text('changes'), // JSON format changes representation
    ipAddress: varchar('ip_address', { length: 45 }),
    createdAt: timestamp('created_at', { withTimezone: true }).defaultNow().notNull(),
}, (table) => ({
    tenantActionIdx: index('audit_logs_tenant_action_idx').on(table.tenantId, table.action),
    entityIdx: index('audit_logs_entity_idx').on(table.entityName, table.entityId),
}));
export const analyticsSnapshots = pgTable('analytics_snapshots', {
    id: uuid('id').primaryKey().defaultRandom(),
    tenantId: uuid('tenant_id').references(() => tenants.id),
    metricName: varchar('metric_name', { length: 100 }).notNull(),
    metricValue: numeric('metric_value', { precision: 18, scale: 4 }).notNull(),
    snapshotDate: timestamp('snapshot_date', { withTimezone: true }).notNull(),
    createdAt: timestamp('created_at', { withTimezone: true }).defaultNow().notNull(),
}, (table) => ({
    tenantMetricDateIdx: uniqueIndex('analytics_tenant_metric_date_uidx').on(table.tenantId, table.metricName, table.snapshotDate),
}));
// --- RELATIONS ---
export const tenantsRelations = relations(tenants, ({ many }) => ({
    users: many(users),
    farmers: many(farmers),
    farms: many(farms),
    pools: many(pools),
    batches: many(batches),
}));
export const usersRelations = relations(users, ({ one, many }) => ({
    tenant: one(tenants, { fields: [users.tenantId], references: [tenants.id] }),
    userRoles: many(userRoles),
    notifications: many(notifications),
}));
export const rolesRelations = relations(roles, ({ many }) => ({
    rolePermissions: many(rolePermissions),
    userRoles: many(userRoles),
}));
export const userRolesRelations = relations(userRoles, ({ one }) => ({
    user: one(users, { fields: [userRoles.userId], references: [users.id] }),
    role: one(roles, { fields: [userRoles.roleId], references: [roles.id] }),
}));
export const farmersRelations = relations(farmers, ({ one, many }) => ({
    user: one(users, { fields: [farmers.userId], references: [users.id] }),
    tenant: one(tenants, { fields: [farmers.tenantId], references: [tenants.id] }),
    farms: many(farms),
}));
export const farmsRelations = relations(farms, ({ one, many }) => ({
    farmer: one(farmers, { fields: [farms.farmerId], references: [farmers.id] }),
    tenant: one(tenants, { fields: [farms.tenantId], references: [tenants.id] }),
    harvests: many(harvests),
}));
export const harvestsRelations = relations(harvests, ({ one }) => ({
    farm: one(farms, { fields: [harvests.farmId], references: [farms.id] }),
    crop: one(crops, { fields: [harvests.cropId], references: [crops.id] }),
    tenant: one(tenants, { fields: [harvests.tenantId], references: [tenants.id] }),
    batch: one(batches, { fields: [harvests.id], references: [batches.harvestId] }),
}));
export const poolsRelations = relations(pools, ({ one, many }) => ({
    tenant: one(tenants, { fields: [pools.tenantId], references: [tenants.id] }),
    batches: many(batches),
    order: one(orders, { fields: [pools.id], references: [orders.poolId] }),
}));
export const batchesRelations = relations(batches, ({ one, many }) => ({
    pool: one(pools, { fields: [batches.poolId], references: [pools.id] }),
    tenant: one(tenants, { fields: [batches.tenantId], references: [tenants.id] }),
    harvest: one(harvests, { fields: [batches.harvestId], references: [harvests.id] }),
    inspections: many(qualityInspections),
    certificates: many(certificates),
}));
export const ordersRelations = relations(orders, ({ one }) => ({
    buyer: one(buyers, { fields: [orders.buyerId], references: [buyers.id] }),
    pool: one(pools, { fields: [orders.poolId], references: [pools.id] }),
    payment: one(payments, { fields: [orders.id], references: [payments.orderId] }),
    export: one(exports, { fields: [orders.id], references: [exports.orderId] }),
}));
