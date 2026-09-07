import { db } from '../../../database/index.js';
import { farms } from '../../../db/schema.js';
import { eq, and, isNull } from 'drizzle-orm';
export class FarmRepository {
    async createFarm(farmData) {
        const [newFarm] = await db.insert(farms).values(farmData).returning();
        return newFarm;
    }
    async updateFarm(farmId, updateData) {
        const [updatedFarm] = await db
            .update(farms)
            .set({ ...updateData, updatedAt: new Date() })
            .where(eq(farms.id, farmId))
            .returning();
        return updatedFarm;
    }
    async deleteFarm(farmId) {
        await db
            .update(farms)
            .set({ deletedAt: new Date() })
            .where(eq(farms.id, farmId));
        return true;
    }
    async findFarmById(id) {
        const result = await db
            .select()
            .from(farms)
            .where(and(eq(farms.id, id), isNull(farms.deletedAt)))
            .limit(1);
        return result[0] || null;
    }
    async listFarmsByFarmer(farmerId) {
        return await db
            .select()
            .from(farms)
            .where(and(eq(farms.farmerId, farmerId), isNull(farms.deletedAt)));
    }
    async listFarmsByTenant(tenantId) {
        return await db
            .select()
            .from(farms)
            .where(and(eq(farms.tenantId, tenantId), isNull(farms.deletedAt)));
    }
}
