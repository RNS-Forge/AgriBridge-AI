import { db } from '../../../database/index.js';
import { 
  harvests, 
  batches, 
  farms, 
  farmers, 
  crops, 
  users, 
  qualityInspections, 
  orders, 
  exports as exportTable, 
  shipments,
  auditLogs
} from '../../../db/schema.js';
import { eq, and, isNull } from 'drizzle-orm';

export class BatchRepository {
  // ==========================================
  // HARVEST MANAGEMENT (harvests table)
  // ==========================================
  
  async createHarvest(harvestData: typeof harvests.$inferInsert) {
    const [newHarvest] = await db.insert(harvests).values(harvestData).returning();
    return newHarvest;
  }

  async findHarvestById(id: string) {
    const result = await db.select().from(harvests).where(eq(harvests.id, id)).limit(1);
    return result[0] || null;
  }

  async listHarvestsByTenant(tenantId: string) {
    return await db.select().from(harvests).where(eq(harvests.tenantId, tenantId));
  }

  async updateHarvestStatus(harvestId: string, status: 'unbatched' | 'batched' | 'sold') {
    await db
      .update(harvests)
      .set({ status, updatedAt: new Date() })
      .where(eq(harvests.id, harvestId));
  }

  // ==========================================
  // BATCH MANAGEMENT (batches table)
  // ==========================================

  async createBatch(batchData: typeof batches.$inferInsert) {
    return await db.transaction(async (tx) => {
      const [newBatch] = await tx.insert(batches).values(batchData).returning();
      
      // Update the harvest status to 'batched'
      await tx
        .update(harvests)
        .set({ status: 'batched', updatedAt: new Date() })
        .where(eq(harvests.id, batchData.harvestId));

      return newBatch;
    });
  }

  async updateBatch(batchId: string, updateData: Partial<typeof batches.$inferInsert>) {
    const [updated] = await db
      .update(batches)
      .set({ ...updateData, updatedAt: new Date() })
      .where(eq(batches.id, batchId))
      .returning();
    return updated;
  }

  async deleteBatch(batchId: string) {
    return await db.transaction(async (tx) => {
      const [batch] = await tx.select().from(batches).where(eq(batches.id, batchId)).limit(1);
      if (!batch) throw new Error('Batch not found');

      // Soft delete batch
      await tx
        .update(batches)
        .set({ deletedAt: new Date() })
        .where(eq(batches.id, batchId));

      // Revert harvest status back to 'unbatched'
      await tx
        .update(harvests)
        .set({ status: 'unbatched', updatedAt: new Date() })
        .where(eq(harvests.id, batch.harvestId));

      return true;
    });
  }

  async findBatchById(id: string) {
    const result = await db
      .select()
      .from(batches)
      .where(and(eq(batches.id, id), isNull(batches.deletedAt)))
      .limit(1);
    return result[0] || null;
  }

  async findBatchByTraceabilityCode(code: string) {
    const result = await db
      .select()
      .from(batches)
      .where(and(eq(batches.traceabilityCode, code), isNull(batches.deletedAt)))
      .limit(1);
    return result[0] || null;
  }

  async listBatchesByTenant(tenantId: string) {
    return await db
      .select()
      .from(batches)
      .where(and(eq(batches.tenantId, tenantId), isNull(batches.deletedAt)));
  }

  // ==========================================
  // FULL TRACEABILITY QUERY (joins)
  // ==========================================

  async getTraceabilityInfo(batchId: string) {
    // 1. Fetch batch with harvest, farm, farmer, and crop
    const result = await db
      .select({
        batch: batches,
        harvest: harvests,
        farm: farms,
        farmer: farmers,
        farmerUser: users,
        crop: crops,
      })
      .from(batches)
      .innerJoin(harvests, eq(batches.harvestId, harvests.id))
      .innerJoin(farms, eq(harvests.farmId, farms.id))
      .innerJoin(farmers, eq(farms.farmerId, farmers.id))
      .innerJoin(users, eq(farmers.userId, users.id))
      .innerJoin(crops, eq(harvests.cropId, crops.id))
      .where(and(eq(batches.id, batchId), isNull(batches.deletedAt)))
      .limit(1);

    if (result.length === 0) return null;
    const info = result[0];

    // 2. Fetch quality inspection report if it exists
    const inspection = await db
      .select({
        inspection: qualityInspections,
        inspector: users,
      })
      .from(qualityInspections)
      .innerJoin(users, eq(qualityInspections.inspectorId, users.id))
      .where(eq(qualityInspections.batchId, batchId))
      .limit(1);

    // 3. Fetch export and shipment data if pooled / ordered / shipped
    let shipmentInfo = null;
    if (info.batch.poolId) {
      const order = await db
        .select()
        .from(orders)
        .where(eq(orders.poolId, info.batch.poolId))
        .limit(1);
      
      if (order[0]) {
        const exp = await db
          .select()
          .from(exportTable)
          .where(eq(exportTable.orderId, order[0].id))
          .limit(1);
        
        if (exp[0]) {
          const ship = await db
            .select()
            .from(shipments)
            .where(eq(shipments.exportId, exp[0].id))
            .limit(1);
          
          shipmentInfo = {
            exportRecord: exp[0],
            shipmentRecord: ship[0] || null,
          };
        }
      }
    }

    // 4. Fetch custody transition audit history
    const history = await db
      .select({
        log: auditLogs,
        user: users,
      })
      .from(auditLogs)
      .leftJoin(users, eq(auditLogs.userId, users.id))
      .where(
        and(
          eq(auditLogs.entityName, 'batches'),
          eq(auditLogs.entityId, batchId)
        )
      );

    return {
      ...info,
      qualityInspection: inspection[0] || null,
      shipment: shipmentInfo,
      historyLogs: history,
    };
  }
}
