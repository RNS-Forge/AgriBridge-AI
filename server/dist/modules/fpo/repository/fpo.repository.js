import { db } from '../../../database/index.js';
import { fpoShares, fpoProfitSplits, fpoProfitAllocations, fpoInvitations, farmers, users } from '../../../db/schema.js';
import { eq, and } from 'drizzle-orm';
export class FpoRepository {
    // ==========================================
    // INVITATIONS
    // ==========================================
    async createInvitation(invData) {
        const [newInv] = await db.insert(fpoInvitations).values(invData).returning();
        return newInv;
    }
    async findInvitationByToken(token) {
        const result = await db.select().from(fpoInvitations).where(eq(fpoInvitations.token, token)).limit(1);
        return result[0] || null;
    }
    async updateInvitationStatus(id, status) {
        await db
            .update(fpoInvitations)
            .set({ status })
            .where(eq(fpoInvitations.id, id));
    }
    // ==========================================
    // SHARES
    // ==========================================
    async upsertShares(sharesData) {
        // Check if farmer already has shares record
        const existing = await db
            .select()
            .from(fpoShares)
            .where(and(eq(fpoShares.farmerId, sharesData.farmerId), eq(fpoShares.tenantId, sharesData.tenantId)))
            .limit(1);
        if (existing[0]) {
            const [updated] = await db
                .update(fpoShares)
                .set({
                sharesCount: sharesData.sharesCount,
                sharePrice: sharesData.sharePrice,
                updatedAt: new Date(),
            })
                .where(eq(fpoShares.id, existing[0].id))
                .returning();
            return updated;
        }
        else {
            const [inserted] = await db.insert(fpoShares).values(sharesData).returning();
            return inserted;
        }
    }
    async findSharesByFarmer(farmerId) {
        const result = await db.select().from(fpoShares).where(eq(fpoShares.farmerId, farmerId)).limit(1);
        return result[0] || null;
    }
    async listSharesByTenant(tenantId) {
        return await db
            .select({
            shares: fpoShares,
            farmer: farmers,
            user: users,
        })
            .from(fpoShares)
            .innerJoin(farmers, eq(fpoShares.farmerId, farmers.id))
            .innerJoin(users, eq(farmers.userId, users.id))
            .where(eq(fpoShares.tenantId, tenantId));
    }
    // ==========================================
    // PROFIT SPLITS
    // ==========================================
    async createProfitSplit(splitData, allocationsData) {
        return await db.transaction(async (tx) => {
            const [newSplit] = await tx.insert(fpoProfitSplits).values(splitData).returning();
            const payloadWithSplitId = allocationsData.map((a) => ({
                ...a,
                splitId: newSplit.id,
            }));
            let allocations = [];
            if (payloadWithSplitId.length > 0) {
                allocations = await tx.insert(fpoProfitAllocations).values(payloadWithSplitId).returning();
            }
            return {
                ...newSplit,
                allocations,
            };
        });
    }
    async listProfitSplitsByTenant(tenantId) {
        return await db.select().from(fpoProfitSplits).where(eq(fpoProfitSplits.tenantId, tenantId));
    }
    async getPayoutsForSplit(splitId) {
        return await db
            .select({
            allocation: fpoProfitAllocations,
            farmer: farmers,
            user: users,
        })
            .from(fpoProfitAllocations)
            .innerJoin(farmers, eq(fpoProfitAllocations.farmerId, farmers.id))
            .innerJoin(users, eq(farmers.userId, users.id))
            .where(eq(fpoProfitAllocations.splitId, splitId));
    }
}
