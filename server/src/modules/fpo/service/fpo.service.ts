import crypto from 'crypto';
import { FpoRepository } from '../repository/fpo.repository.js';
import { 
  CreateInvitationDto, 
  InvitationResponseDto, 
  ManageSharesDto, 
  SharesLedgerResponseDto, 
  DistributeProfitDto, 
  ProfitSplitResponseDto, 
  BulkUploadMemberDto, 
  BulkUploadResponseDto 
} from '../dto/fpo.dto.js';
import { db } from '../../../database/index.js';
import { users, farmers, farms, userRoles, roles, batches, harvests, fpoProfitSplits } from '../../../db/schema.js';
import { eq, inArray } from 'drizzle-orm';
import { AuditLogService } from '../../../services/audit.service.js';

export class FpoService {
  private fpoRepository = new FpoRepository();

  private formatInvitationResponse(inv: any): InvitationResponseDto {
    return {
      id: inv.id,
      tenantId: inv.tenantId,
      email: inv.email,
      role: inv.role,
      status: inv.status,
      token: inv.token,
      expiresAt: inv.expiresAt.toISOString(),
    };
  }

  private formatSharesResponse(shares: any): SharesLedgerResponseDto {
    return {
      id: shares.id,
      tenantId: shares.tenantId,
      farmerId: shares.farmerId,
      sharesCount: shares.sharesCount,
      sharePrice: shares.sharePrice,
      createdAt: shares.createdAt.toISOString(),
      updatedAt: shares.updatedAt.toISOString(),
    };
  }

  // ==========================================
  // INVITATIONS
  // ==========================================

  async createInvitation(dto: CreateInvitationDto, actorUserId: string): Promise<InvitationResponseDto> {
    const token = crypto.randomBytes(32).toString('hex');
    const expiresAt = new Date(Date.now() + 7 * 24 * 3600 * 1000); // 7 days expiry

    const invData = {
      tenantId: dto.tenantId,
      email: dto.email,
      role: dto.role,
      status: 'pending' as const,
      token,
      expiresAt,
    };

    const newInv = await this.fpoRepository.createInvitation(invData);

    AuditLogService.log({
      userId: actorUserId,
      tenantId: dto.tenantId,
      action: 'fpo.invitation.create',
      entityName: 'fpo_invitations',
      entityId: newInv.id,
      changes: { email: dto.email, role: dto.role },
    });

    return this.formatInvitationResponse(newInv);
  }

  // ==========================================
  // SHARES LEDGER
  // ==========================================

  async manageShares(dto: ManageSharesDto, actorUserId: string): Promise<SharesLedgerResponseDto> {
    const sharesData = {
      tenantId: dto.tenantId,
      farmerId: dto.farmerId,
      sharesCount: dto.sharesCount,
      sharePrice: dto.sharePrice.toString(),
    };

    const shares = await this.fpoRepository.upsertShares(sharesData);

    AuditLogService.log({
      userId: actorUserId,
      tenantId: dto.tenantId,
      action: 'fpo.shares.update',
      entityName: 'fpo_shares',
      entityId: shares.id,
      changes: dto,
    });

    return this.formatSharesResponse(shares);
  }

  async listShares(tenantId: string): Promise<any[]> {
    const list = await this.fpoRepository.listSharesByTenant(tenantId);
    return list.map((item: any) => ({
      id: item.shares.id,
      farmerId: item.shares.farmerId,
      farmerName: `${item.user.firstName || ''} ${item.user.lastName || ''}`.trim() || item.user.email,
      sharesCount: item.shares.sharesCount,
      sharePrice: item.shares.sharePrice,
      updatedAt: item.shares.updatedAt.toISOString(),
    }));
  }

  // ==========================================
  // PROFIT SPLIT MATHEMATICAL MODELS
  // ==========================================

  async distributeProfit(dto: DistributeProfitDto, actorUserId: string): Promise<ProfitSplitResponseDto> {
    const allocationsPayload: any[] = [];

    if (dto.splitType === 'by_shares') {
      // 1. Fetch all shares for this tenant FPO
      const sharesList = await this.fpoRepository.listSharesByTenant(dto.tenantId);
      if (sharesList.length === 0) {
        throw new Error('No shareholders found in FPO to distribute profit.');
      }

      const totalShares = sharesList.reduce((sum: number, item: any) => sum + item.shares.sharesCount, 0);
      if (totalShares === 0) {
        throw new Error('Total shares count in FPO is zero.');
      }

      // 2. Proportional allocation by shares
      for (const item of sharesList as any[]) {
        const ratio = item.shares.sharesCount / totalShares;
        const payout = parseFloat((ratio * dto.totalProfit).toFixed(2));

        allocationsPayload.push({
          farmerId: item.shares.farmerId,
          payoutAmount: payout.toString(),
          status: 'pending' as const,
        });
      }
    } else if (dto.splitType === 'by_pool_contribution') {
      if (!dto.poolId) {
        throw new Error('poolId is required when distributing profit by pool contribution.');
      }

      // 1. Fetch all batches mapped to this crop pool
      const poolBatches = await db
        .select({
          batch: batches,
          harvest: harvests,
        })
        .from(batches)
        .innerJoin(harvests, eq(batches.harvestId, harvests.id))
        .where(eq(batches.poolId, dto.poolId));

      if (poolBatches.length === 0) {
        throw new Error('No batches found allocated in this crop pool to distribute profit.');
      }

      // 2. Aggregate contributed weight by farmer
      const farmerWeights: Record<string, number> = {};
      let totalWeight = 0;

      for (const item of poolBatches) {
        const farmResult = await db
          .select({ farmerId: farms.farmerId })
          .from(farms)
          .where(eq(farms.id, item.harvest.farmId))
          .limit(1);

        const farmerId = farmResult[0]?.farmerId;
        if (farmerId) {
          const weight = parseFloat(item.batch.weightKg);
          farmerWeights[farmerId] = (farmerWeights[farmerId] || 0) + weight;
          totalWeight += weight;
        }
      }

      if (totalWeight === 0) {
        throw new Error('Total weight contributed in crop pool is zero.');
      }

      // 3. Proportional allocation by weight contributed
      for (const [farmerId, weight] of Object.entries(farmerWeights)) {
        const ratio = weight / totalWeight;
        const payout = parseFloat((ratio * dto.totalProfit).toFixed(2));

        allocationsPayload.push({
          farmerId,
          payoutAmount: payout.toString(),
          status: 'pending' as const,
        });
      }
    }

    const splitData = {
      tenantId: dto.tenantId,
      poolId: dto.poolId || null,
      totalProfit: dto.totalProfit.toString(),
      splitType: dto.splitType,
    };

    const splitResult = await this.fpoRepository.createProfitSplit(splitData, allocationsPayload);

    AuditLogService.log({
      userId: actorUserId,
      tenantId: dto.tenantId,
      action: 'fpo.profit.distribute',
      entityName: 'fpo_profit_splits',
      entityId: splitResult.id,
      changes: dto,
    });

    return {
      id: splitResult.id,
      tenantId: splitResult.tenantId,
      poolId: splitResult.poolId,
      totalProfit: splitResult.totalProfit,
      splitType: splitResult.splitType,
      allocatedAt: splitResult.allocatedAt.toISOString(),
      allocations: splitResult.allocations.map((a: any) => ({
        id: a.id,
        farmerId: a.farmerId,
        payoutAmount: a.payoutAmount,
        status: a.status,
      })),
    };
  }

  async listProfitSplits(tenantId: string): Promise<ProfitSplitResponseDto[]> {
    const list = await this.fpoRepository.listProfitSplitsByTenant(tenantId);
    return list.map((s) => ({
      id: s.id,
      tenantId: s.tenantId,
      poolId: s.poolId,
      totalProfit: s.totalProfit,
      splitType: s.splitType,
      allocatedAt: s.allocatedAt.toISOString(),
    }));
  }

  async getProfitSplitDetails(splitId: string): Promise<ProfitSplitResponseDto> {
    const splits = await db.select().from(fpoProfitSplits).where(eq(fpoProfitSplits.id, splitId)).limit(1);
    if (!splits[0]) {
      throw new Error('Profit split distribution record not found');
    }

    const payouts = await this.fpoRepository.getPayoutsForSplit(splitId);

    return {
      id: splits[0].id,
      tenantId: splits[0].tenantId,
      poolId: splits[0].poolId,
      totalProfit: splits[0].totalProfit,
      splitType: splits[0].splitType,
      allocatedAt: splits[0].allocatedAt.toISOString(),
      allocations: payouts.map((p) => ({
        id: p.allocation.id,
        farmerId: p.allocation.farmerId,
        farmerName: `${p.user.firstName || ''} ${p.user.lastName || ''}`.trim() || p.user.email,
        payoutAmount: p.allocation.payoutAmount,
        status: p.allocation.status,
      })),
    };
  }

  // ==========================================
  // MEMBERSHIP BULK UPLOAD
  // ==========================================

  async bulkUploadMembers(
    tenantId: string,
    members: BulkUploadMemberDto[],
    actorUserId: string
  ): Promise<BulkUploadResponseDto> {
    const responseList: any[] = [];
    let successCount = 0;
    let failedCount = 0;

    // Fetch Farmer Role ID
    const farmerRole = await db.select().from(roles).where(eq(roles.name, 'Farmer')).limit(1);
    if (!farmerRole[0]) {
      throw new Error('System setup missing: Farmer role not registered.');
    }

    const defaultPasswordHash = crypto.createHmac('sha256', 'Password@123').update('default').digest('hex');

    for (const member of members) {
      try {
        await db.transaction(async (tx) => {
          // 1. Verify email uniqueness
          const exists = await tx.select().from(users).where(eq(users.email, member.email)).limit(1);
          if (exists[0]) {
            throw new Error(`Email ${member.email} already registered.`);
          }

          // 2. Verify Aadhaar uniqueness
          const aadhaarHash = crypto.createHash('sha256').update(member.aadhaarNumber).digest('hex');
          const aadhaarExists = await tx.select().from(farmers).where(eq(farmers.aadhaarHash, aadhaarHash)).limit(1);
          if (aadhaarExists[0]) {
            throw new Error(`Farmer Aadhaar hash already exists.`);
          }

          // 3. Create User record
          const [newUser] = await tx
            .insert(users)
            .values({
              tenantId,
              email: member.email,
              passwordHash: defaultPasswordHash,
              firstName: member.firstName,
              lastName: member.lastName,
              status: 'active',
            })
            .returning();

          // 4. Assign Farmer role
          await tx.insert(userRoles).values({
            userId: newUser.id,
            roleId: farmerRole[0].id,
          });

          // 5. Create Farmer Profile
          const [newFarmer] = await tx
            .insert(farmers)
            .values({
              userId: newUser.id,
              tenantId,
              aadhaarHash,
              registrationNumber: member.registrationNumber,
              bankName: member.bankName || null,
              accountNumber: member.accountNumber || null,
              ifscCode: member.ifscCode || null,
              kycStatus: 'pending',
            })
            .returning();

          // 6. Create Farm Profile if name provided
          let farmId = null;
          if (member.farmName) {
            const [newFarm] = await tx
              .insert(farms)
              .values({
                farmerId: newFarmer.id,
                tenantId,
                name: member.farmName,
                totalAreaHectares: member.totalAreaHectares ? member.totalAreaHectares.toString() : '0.00',
              })
              .returning();
            farmId = newFarm.id;
          }

          successCount++;
          responseList.push({
            email: member.email,
            status: 'success',
            farmerId: newFarmer.id,
          });
        });
      } catch (err: any) {
        failedCount++;
        responseList.push({
          email: member.email,
          status: 'failed',
          error: err.message || err.toString(),
        });
      }
    }

    AuditLogService.log({
      userId: actorUserId,
      tenantId,
      action: 'fpo.members.bulk_upload',
      entityName: 'farmers',
      entityId: '00000000-0000-0000-0000-000000000000',
      changes: { successCount, failedCount },
    });

    return {
      successCount,
      failedCount,
      members: responseList,
    };
  }
}
