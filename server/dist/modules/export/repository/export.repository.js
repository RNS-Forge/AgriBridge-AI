import { db } from '../../../database/index.js';
import { exports as exportTable, shipments, certificates, orders, pools, batches } from '../../../db/schema.js';
import { eq, and } from 'drizzle-orm';
export class ExportRepository {
    // ==========================================
    // EXPORTS
    // ==========================================
    async createExport(exportData) {
        const [newExport] = await db.insert(exportTable).values(exportData).returning();
        return newExport;
    }
    async findExportById(id) {
        const result = await db.select().from(exportTable).where(eq(exportTable.id, id)).limit(1);
        return result[0] || null;
    }
    async findExportByOrderId(orderId) {
        const result = await db.select().from(exportTable).where(eq(exportTable.orderId, orderId)).limit(1);
        return result[0] || null;
    }
    async updateExport(id, updateData) {
        const [updated] = await db
            .update(exportTable)
            .set({ ...updateData, updatedAt: new Date() })
            .where(eq(exportTable.id, id))
            .returning();
        return updated;
    }
    async listExportsByTenant(tenantId) {
        return await db
            .select({
            export: exportTable,
            order: orders,
        })
            .from(exportTable)
            .innerJoin(orders, eq(exportTable.orderId, orders.id))
            .innerJoin(pools, eq(orders.poolId, pools.id))
            .where(eq(pools.tenantId, tenantId));
    }
    // ==========================================
    // SHIPMENTS
    // ==========================================
    async createShipment(shipmentData) {
        const [newShipment] = await db.insert(shipments).values(shipmentData).returning();
        return newShipment;
    }
    async findShipmentByExportId(exportId) {
        const result = await db.select().from(shipments).where(eq(shipments.exportId, exportId)).limit(1);
        return result[0] || null;
    }
    async updateShipment(id, updateData) {
        const [updated] = await db
            .update(shipments)
            .set(updateData)
            .where(eq(shipments.id, id))
            .returning();
        return updated;
    }
    // ==========================================
    // CERTIFICATES
    // ==========================================
    async createCertificate(certData) {
        const [newCert] = await db.insert(certificates).values(certData).returning();
        return newCert;
    }
    async getCertificatesByBatchId(batchId) {
        return await db.select().from(certificates).where(eq(certificates.batchId, batchId));
    }
    async findCertificatesByBatchIdAndType(batchId, certificateType) {
        return await db
            .select()
            .from(certificates)
            .where(and(eq(certificates.batchId, batchId), eq(certificates.certificateType, certificateType), eq(certificates.status, 'valid')));
    }
    // Resolve pool details to extract FPO/Tenant registry and batch certificates
    async getExportContextDetails(exportId) {
        const exp = await db
            .select({
            export: exportTable,
            order: orders,
            pool: pools,
        })
            .from(exportTable)
            .innerJoin(orders, eq(exportTable.orderId, orders.id))
            .innerJoin(pools, eq(orders.poolId, pools.id))
            .where(eq(exportTable.id, exportId))
            .limit(1);
        if (exp.length === 0)
            return null;
        const info = exp[0];
        // Find all batches allocated to this pool
        const poolBatches = await db
            .select()
            .from(batches)
            .where(eq(batches.poolId, info.pool.id));
        return {
            ...info,
            batches: poolBatches,
        };
    }
}
