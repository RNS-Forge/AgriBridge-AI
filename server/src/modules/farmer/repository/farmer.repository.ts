import { db } from '../../../database/index.js';
import { users, farmers, farms, userRoles, roles } from '../../../db/schema.js';
import { eq, and, isNull } from 'drizzle-orm';

export class FarmerRepository {
  /**
   * Create a farmer, their user account, assign the 'Farmer' role, and create their farm inside a transaction.
   */
  async createFarmerWithFarm(
    userData: typeof users.$inferInsert,
    farmerData: Omit<typeof farmers.$inferInsert, 'userId'>,
    farmData: Omit<typeof farms.$inferInsert, 'farmerId'>
  ) {
    return await db.transaction(async (tx) => {
      // 1. Create User account
      const [newUser] = await tx.insert(users).values(userData).returning();

      // 2. Assign 'Farmer' role to the user
      const [farmerRole] = await tx.select().from(roles).where(eq(roles.name, 'Farmer')).limit(1);
      if (farmerRole) {
        await tx.insert(userRoles).values({
          userId: newUser.id,
          roleId: farmerRole.id,
        });
      }

      // 3. Create Farmer record
      const [newFarmer] = await tx
        .insert(farmers)
        .values({
          ...farmerData,
          userId: newUser.id,
        })
        .returning();

      // 4. Create Farm record
      const [newFarm] = await tx
        .insert(farms)
        .values({
          ...farmData,
          farmerId: newFarmer.id,
        })
        .returning();

      return { user: newUser, farmer: newFarmer, farm: newFarm };
    });
  }

  /**
   * Update farmer and farm details.
   */
  async updateFarmerAndFarm(
    farmerId: string,
    farmerUpdates: Partial<typeof farmers.$inferInsert>,
    farmUpdates: Partial<typeof farms.$inferInsert>
  ) {
    return await db.transaction(async (tx) => {
      let updatedFarmer = null;
      let updatedFarm = null;

      if (Object.keys(farmerUpdates).length > 0) {
        const [result] = await tx
          .update(farmers)
          .set({ ...farmerUpdates, updatedAt: new Date() })
          .where(eq(farmers.id, farmerId))
          .returning();
        updatedFarmer = result;
      }

      if (Object.keys(farmUpdates).length > 0) {
        // Find existing farm first to get its ID
        const existingFarm = await tx.select().from(farms).where(eq(farms.farmerId, farmerId)).limit(1);
        if (existingFarm[0]) {
          const [result] = await tx
            .update(farms)
            .set({ ...farmUpdates, updatedAt: new Date() })
            .where(eq(farms.id, existingFarm[0].id))
            .returning();
          updatedFarm = result;
        }
      }

      return { farmer: updatedFarmer, farm: updatedFarm };
    });
  }

  /**
   * Soft-delete farmer and corresponding farm/user records by setting deletedAt timestamps.
   */
  async deleteFarmer(farmerId: string) {
    return await db.transaction(async (tx) => {
      const now = new Date();
      
      // 1. Get farmer record
      const [farmer] = await tx.select().from(farmers).where(eq(farmers.id, farmerId)).limit(1);
      if (!farmer) {
        throw new Error('Farmer not found');
      }

      // 2. Soft delete farmer
      await tx.update(farmers).set({ deletedAt: now }).where(eq(farmers.id, farmerId));

      // 3. Soft delete farm
      await tx.update(farms).set({ deletedAt: now }).where(eq(farms.farmerId, farmerId));

      // 4. Soft delete associated user account
      await tx.update(users).set({ deletedAt: now, status: 'suspended' }).where(eq(users.id, farmer.userId));

      return true;
    });
  }

  /**
   * Fetch complete farmer details by ID.
   */
  async findFarmerById(farmerId: string) {
    const result = await db
      .select({
        farmer: farmers,
        user: users,
        farm: farms,
      })
      .from(farmers)
      .innerJoin(users, eq(farmers.userId, users.id))
      .leftJoin(farms, eq(farms.farmerId, farmers.id))
      .where(and(eq(farmers.id, farmerId), isNull(farmers.deletedAt)))
      .limit(1);

    return result[0] || null;
  }

  /**
   * Fetch complete farmer details by associated user ID.
   */
  async findFarmerByUserId(userId: string) {
    const result = await db
      .select({
        farmer: farmers,
        user: users,
        farm: farms,
      })
      .from(farmers)
      .innerJoin(users, eq(farmers.userId, users.id))
      .leftJoin(farms, eq(farms.farmerId, farmers.id))
      .where(and(eq(farmers.userId, userId), isNull(farmers.deletedAt)))
      .limit(1);

    return result[0] || null;
  }

  /**
   * List farmers under a specific tenant.
   */
  async listFarmersByTenant(tenantId: string) {
    return await db
      .select({
        farmer: farmers,
        user: users,
        farm: farms,
      })
      .from(farmers)
      .innerJoin(users, eq(farmers.userId, users.id))
      .leftJoin(farms, eq(farms.farmerId, farmers.id))
      .where(and(eq(farmers.tenantId, tenantId), isNull(farmers.deletedAt)));
  }
}
