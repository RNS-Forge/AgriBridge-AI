import { db } from '../../../database/index.js';
import { 
  tenants, 
  users, 
  harvests, 
  orders, 
  platformSettings, 
  auditLogs,
  roles,
  rolePermissions
} from '../../../db/schema.js';
import { eq, sql, desc } from 'drizzle-orm';

export class SuperAdminRepository {
  // ==========================================
  // DASHBOARD & ANALYTICS
  // ==========================================

  async getDashboardMetrics() {
    const tenantsCount = await db.select({ count: sql<number>`count(*)` }).from(tenants);
    const usersCount = await db.select({ count: sql<number>`count(*)` }).from(users);
    const ordersCount = await db.select({ count: sql<number>`count(*)` }).from(orders);

    const premiumCount = await db
      .select({ count: sql<number>`count(*)` })
      .from(tenants)
      .where(eq(tenants.subscriptionPlan, 'premium'));

    const harvestSum = await db
      .select({ totalKg: sql<string>`sum(cast(quantity_kg as numeric))` })
      .from(harvests);

    const activeSettings = await db.select().from(platformSettings);

    return {
      totalTenants: Number(tenantsCount[0]?.count || 0),
      totalUsers: Number(usersCount[0]?.count || 0),
      totalHarvestsKg: Number(harvestSum[0]?.totalKg || 0),
      totalOrdersCount: Number(ordersCount[0]?.count || 0),
      premiumSubscriptionsCount: Number(premiumCount[0]?.count || 0),
      activeSettings: activeSettings.map((s) => ({
        settingKey: s.settingKey,
        settingValue: s.settingValue,
      })),
    };
  }

  // ==========================================
  // TENANT MANAGEMENT
  // ==========================================

  async listTenants() {
    return await db.select().from(tenants).orderBy(desc(tenants.createdAt));
  }

  async updateTenant(id: string, updateData: Partial<typeof tenants.$inferInsert>) {
    const [updated] = await db
      .update(tenants)
      .set({ ...updateData, updatedAt: new Date() })
      .where(eq(tenants.id, id))
      .returning();
    return updated;
  }

  // ==========================================
  // USER MANAGEMENT
  // ==========================================

  async listUsers() {
    return await db
      .select({
        id: users.id,
        email: users.email,
        firstName: users.firstName,
        lastName: users.lastName,
        status: users.status,
        tenantId: users.tenantId,
        createdAt: users.createdAt,
      })
      .from(users)
      .orderBy(desc(users.createdAt));
  }

  async updateUser(id: string, updateData: Partial<typeof users.$inferInsert>) {
    const [updated] = await db
      .update(users)
      .set(updateData)
      .where(eq(users.id, id))
      .returning();
    return updated;
  }

  // ==========================================
  // PLATFORM SETTINGS
  // ==========================================

  async upsertSetting(settingKey: string, settingValue: string) {
    const existing = await db
      .select()
      .from(platformSettings)
      .where(eq(platformSettings.settingKey, settingKey))
      .limit(1);

    if (existing[0]) {
      const [updated] = await db
        .update(platformSettings)
        .set({ settingValue, updatedAt: new Date() })
        .where(eq(platformSettings.id, existing[0].id))
        .returning();
      return updated;
    } else {
      const [inserted] = await db
        .insert(platformSettings)
        .values({ settingKey, settingValue })
        .returning();
      return inserted;
    }
  }

  async getSettings() {
    return await db.select().from(platformSettings);
  }

  // ==========================================
  // AUDIT LOGS
  // ==========================================

  async listAuditLogs(limitVal = 50, offsetVal = 0) {
    return await db
      .select()
      .from(auditLogs)
      .orderBy(desc(auditLogs.createdAt))
      .limit(limitVal)
      .offset(offsetVal);
  }

  // ==========================================
  // ROLE & PERMISSION MANAGEMENT
  // ==========================================

  async listRoles() {
    return await db.select().from(roles);
  }

  async updateRolePermissions(roleId: string, permissionIds: string[]) {
    await db.transaction(async (tx) => {
      // 1. Delete existing associations
      await tx.delete(rolePermissions).where(eq(rolePermissions.roleId, roleId));

      // 2. Insert new associations
      if (permissionIds.length > 0) {
        const values = permissionIds.map((pId) => ({
          roleId,
          permissionId: pId,
        }));
        await tx.insert(rolePermissions).values(values);
      }
    });
    return true;
  }
}
