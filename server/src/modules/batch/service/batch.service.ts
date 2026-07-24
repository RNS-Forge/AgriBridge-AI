import crypto from 'crypto';
import { BatchRepository } from '../repository/batch.repository.js';
import { 
  CreateHarvestDto, 
  HarvestResponseDto, 
  CreateBatchDto, 
  UpdateBatchDto, 
  BatchResponseDto, 
  TraceabilityPayloadDto 
} from '../dto/batch.dto.js';
import { AuditLogService } from '../../../services/audit.service.js';

export class BatchService {
  private batchRepository = new BatchRepository();

  private formatHarvestResponse(harvest: any): HarvestResponseDto {
    return {
      id: harvest.id,
      farmId: harvest.farmId,
      cropId: harvest.cropId,
      tenantId: harvest.tenantId,
      quantityKg: harvest.quantityKg,
      moisturePercentage: harvest.moisturePercentage,
      harvestDate: harvest.harvestDate.toISOString(),
      grade: harvest.grade,
      status: harvest.status,
      createdAt: harvest.createdAt.toISOString(),
    };
  }

  private formatBatchResponse(batch: any): BatchResponseDto {
    return {
      id: batch.id,
      poolId: batch.poolId,
      tenantId: batch.tenantId,
      harvestId: batch.harvestId,
      weightKg: batch.weightKg,
      traceabilityCode: batch.traceabilityCode,
      status: batch.status,
      qrCodeUrl: batch.qrCodeUrl,
      assignedAt: batch.assignedAt ? batch.assignedAt.toISOString() : null,
      createdAt: batch.createdAt.toISOString(),
    };
  }

  // ==========================================
  // HARVESTS
  // ==========================================

  async createHarvest(dto: CreateHarvestDto, actorUserId: string): Promise<HarvestResponseDto> {
    const data = {
      farmId: dto.farmId,
      cropId: dto.cropId,
      tenantId: dto.tenantId,
      quantityKg: dto.quantityKg.toString(),
      moisturePercentage: dto.moisturePercentage ? dto.moisturePercentage.toString() : null,
      harvestDate: new Date(dto.harvestDate),
      grade: dto.grade || null,
      status: 'unbatched' as const,
    };

    const newHarvest = await this.batchRepository.createHarvest(data);

    AuditLogService.log({
      userId: actorUserId,
      tenantId: dto.tenantId,
      action: 'harvest.create',
      entityName: 'harvests',
      entityId: newHarvest.id,
      changes: dto,
    });

    return this.formatHarvestResponse(newHarvest);
  }

  async getHarvest(harvestId: string): Promise<HarvestResponseDto> {
    const harvest = await this.batchRepository.findHarvestById(harvestId);
    if (!harvest) {
      throw new Error('Harvest entry not found');
    }
    return this.formatHarvestResponse(harvest);
  }

  async listHarvests(tenantId: string): Promise<HarvestResponseDto[]> {
    const list = await this.batchRepository.listHarvestsByTenant(tenantId);
    return list.map((h) => this.formatHarvestResponse(h));
  }

  // ==========================================
  // BATCHES
  // ==========================================

  async createBatch(dto: CreateBatchDto, actorUserId: string): Promise<BatchResponseDto> {
    // 1. Generate unique traceability code
    const dateStr = new Date().toISOString().slice(0, 10).replace(/-/g, '');
    const randomHex = crypto.randomBytes(4).toString('hex').toUpperCase();
    const traceabilityCode = `AB-BATCH-${dateStr}-${randomHex}`;

    // 2. Generate QR Code URL using a zero-dependency QR code generator API
    const traceabilityUrl = `https://agribridge.ai/trace/${traceabilityCode}`;
    const qrCodeUrl = `https://api.qrserver.com/v1/create-qr-code/?size=250x250&data=${encodeURIComponent(traceabilityUrl)}`;

    const batchData = {
      tenantId: dto.tenantId,
      harvestId: dto.harvestId,
      weightKg: dto.weightKg.toString(),
      traceabilityCode,
      status: 'created' as const,
      qrCodeUrl,
    };

    const newBatch = await this.batchRepository.createBatch(batchData);

    AuditLogService.log({
      userId: actorUserId,
      tenantId: dto.tenantId,
      action: 'batch.create',
      entityName: 'batches',
      entityId: newBatch.id,
      changes: { traceabilityCode, weightKg: dto.weightKg },
    });

    return this.formatBatchResponse(newBatch);
  }

  async updateBatch(
    batchId: string,
    dto: UpdateBatchDto,
    actorUserId: string,
    actorTenantId: string | null
  ): Promise<BatchResponseDto> {
    const existing = await this.batchRepository.findBatchById(batchId);
    if (!existing) {
      throw new Error('Batch not found');
    }

    // Tenant Isolation Guard
    if (actorTenantId && existing.tenantId !== actorTenantId) {
      throw new Error('Access denied to modify batch from another tenant space');
    }

    const updateData: Partial<any> = {};
    if (dto.status !== undefined) updateData.status = dto.status;
    if (dto.poolId !== undefined) {
      updateData.poolId = dto.poolId;
      updateData.assignedAt = dto.poolId ? new Date() : null;
    }

    const updated = await this.batchRepository.updateBatch(batchId, updateData);

    AuditLogService.log({
      userId: actorUserId,
      tenantId: existing.tenantId,
      action: 'batch.update',
      entityName: 'batches',
      entityId: batchId,
      changes: dto,
    });

    return this.formatBatchResponse(updated);
  }

  async getBatch(batchId: string): Promise<BatchResponseDto> {
    const batch = await this.batchRepository.findBatchById(batchId);
    if (!batch) {
      throw new Error('Batch not found');
    }
    return this.formatBatchResponse(batch);
  }

  async listBatches(tenantId: string): Promise<BatchResponseDto[]> {
    const list = await this.batchRepository.listBatchesByTenant(tenantId);
    return list.map((b) => this.formatBatchResponse(b));
  }

  async deleteBatch(batchId: string, actorUserId: string, actorTenantId: string | null): Promise<boolean> {
    const existing = await this.batchRepository.findBatchById(batchId);
    if (!existing) {
      throw new Error('Batch not found');
    }

    // Tenant Isolation
    if (actorTenantId && existing.tenantId !== actorTenantId) {
      throw new Error('Access denied to delete batch from another tenant space');
    }

    await this.batchRepository.deleteBatch(batchId);

    AuditLogService.log({
      userId: actorUserId,
      tenantId: existing.tenantId,
      action: 'batch.delete',
      entityName: 'batches',
      entityId: batchId,
    });

    return true;
  }

  // ==========================================
  // TRACEABILITY REPORT RESOLUTION
  // ==========================================

  async getTraceabilityReport(codeOrId: string): Promise<TraceabilityPayloadDto> {
    const isUuid = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i.test(codeOrId);
    let rawInfo = null;

    if (isUuid) {
      rawInfo = await this.batchRepository.getTraceabilityInfo(codeOrId);
    } else {
      const batchByCode = await this.batchRepository.findBatchByTraceabilityCode(codeOrId);
      if (batchByCode) {
        rawInfo = await this.batchRepository.getTraceabilityInfo(batchByCode.id);
      }
    }

    if (!rawInfo) {
      throw new Error('Traceability record not found for this batch ID or traceability code');
    }

    const { batch, harvest, farm, farmer, farmerUser, crop, qualityInspection, shipment, historyLogs } = rawInfo;

    // Map custody logs history
    const ownerHistory = historyLogs.map((h: any) => ({
      userId: h.user ? h.user.id : null,
      userName: h.user ? `${h.user.firstName || ''} ${h.user.lastName || ''}`.trim() || h.user.email : 'System',
      action: h.log.action,
      timestamp: h.log.createdAt.toISOString(),
    }));

    return {
      batchId: batch.id,
      tenantId: batch.tenantId,
      traceabilityCode: batch.traceabilityCode || '',
      status: batch.status,
      weightKg: batch.weightKg,
      createdAt: batch.createdAt.toISOString(),
      
      harvest: {
        quantityKg: harvest.quantityKg,
        harvestDate: harvest.harvestDate.toISOString(),
        grade: harvest.grade,
      },

      farm: {
        name: farm.name,
        surveyNumber: farm.surveyNumber,
        soilType: farm.soilType,
      },

      farmer: {
        firstName: farmerUser.firstName,
        lastName: farmerUser.lastName,
        registrationNumber: farmer.registrationNumber,
      },

      crop: {
        name: crop.name,
        variety: crop.variety,
      },

      quality: {
        inspected: qualityInspection !== null,
        inspectorName: qualityInspection ? `${qualityInspection.inspector.firstName || ''} ${qualityInspection.inspector.lastName || ''}`.trim() || qualityInspection.inspector.email : null,
        grade: qualityInspection ? qualityInspection.inspection.assignedGrade : null,
        moistureContent: qualityInspection ? qualityInspection.inspection.moistureContentPercentage : null,
        foreignMatter: qualityInspection ? qualityInspection.inspection.foreignMatterPercentage : null,
        inspectionDate: qualityInspection ? qualityInspection.inspection.createdAt.toISOString() : null,
      },

      export: shipment ? {
        status: shipment.exportRecord.customsStatus,
        customsDeclarationNumber: shipment.exportRecord.customsDeclarationNumber,
        carrierName: shipment.shipmentRecord ? shipment.shipmentRecord.carrierName : null,
        containerNumber: shipment.shipmentRecord ? shipment.shipmentRecord.containerNumber : null,
      } : null,

      ownerHistory,
    };
  }
}
