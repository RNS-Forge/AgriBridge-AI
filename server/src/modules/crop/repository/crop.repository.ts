import { db } from '../../../database/index.js';
import { crops, farmerCrops, farms, farmers } from '../../../db/schema.js';
import { eq, and, isNull } from 'drizzle-orm';

export class CropRepository {
  // ==========================================
  // CROP MASTER (crops table)
  // ==========================================
  
  async createCrop(cropData: typeof crops.$inferInsert) {
    const [newCrop] = await db.insert(crops).values(cropData).returning();
    return newCrop;
  }

  async updateCrop(cropId: string, updateData: Partial<typeof crops.$inferInsert>) {
    const [updatedCrop] = await db
      .update(crops)
      .set(updateData)
      .where(eq(crops.id, cropId))
      .returning();
    return updatedCrop;
  }

  async findCropById(id: string) {
    const result = await db.select().from(crops).where(eq(crops.id, id)).limit(1);
    return result[0] || null;
  }

  async listCrops() {
    return await db.select().from(crops);
  }

  async deleteCrop(id: string) {
    await db.delete(crops).where(eq(crops.id, id));
    return true;
  }

  // ==========================================
  // FARMER CROP MAPPING (farmer_crops table)
  // ==========================================

  async createFarmerCrop(mappingData: typeof farmerCrops.$inferInsert) {
    const [newMapping] = await db.insert(farmerCrops).values(mappingData).returning();
    return newMapping;
  }

  async updateFarmerCrop(mappingId: string, updateData: Partial<typeof farmerCrops.$inferInsert>) {
    const [updatedMapping] = await db
      .update(farmerCrops)
      .set({ ...updateData, updatedAt: new Date() })
      .where(eq(farmerCrops.id, mappingId))
      .returning();
    return updatedMapping;
  }

  async deleteFarmerCrop(mappingId: string) {
    await db
      .update(farmerCrops)
      .set({ deletedAt: new Date() })
      .where(eq(farmerCrops.id, mappingId));
    return true;
  }

  async findFarmerCropById(id: string) {
    const result = await db
      .select({
        farmerCrop: farmerCrops,
        crop: crops,
        farm: farms,
        farmer: farmers,
      })
      .from(farmerCrops)
      .innerJoin(crops, eq(farmerCrops.cropId, crops.id))
      .innerJoin(farms, eq(farmerCrops.farmId, farms.id))
      .innerJoin(farmers, eq(farmerCrops.farmerId, farmers.id))
      .where(and(eq(farmerCrops.id, id), isNull(farmerCrops.deletedAt)))
      .limit(1);
    return result[0] || null;
  }

  async listFarmerCropsByFarmer(farmerId: string) {
    return await db
      .select({
        farmerCrop: farmerCrops,
        crop: crops,
        farm: farms,
        farmer: farmers,
      })
      .from(farmerCrops)
      .innerJoin(crops, eq(farmerCrops.cropId, crops.id))
      .innerJoin(farms, eq(farmerCrops.farmId, farms.id))
      .innerJoin(farmers, eq(farmerCrops.farmerId, farmers.id))
      .where(and(eq(farmerCrops.farmerId, farmerId), isNull(farmerCrops.deletedAt)));
  }

  async listFarmerCropsByTenant(tenantId: string) {
    return await db
      .select({
        farmerCrop: farmerCrops,
        crop: crops,
        farm: farms,
        farmer: farmers,
      })
      .from(farmerCrops)
      .innerJoin(crops, eq(farmerCrops.cropId, crops.id))
      .innerJoin(farms, eq(farmerCrops.farmId, farms.id))
      .innerJoin(farmers, eq(farmerCrops.farmerId, farmers.id))
      .where(and(eq(farmerCrops.tenantId, tenantId), isNull(farmerCrops.deletedAt)));
  }
}
