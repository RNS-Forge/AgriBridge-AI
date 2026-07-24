import { CropRepository } from '../repository/crop.repository.js';
import { 
  CreateCropDto, 
  UpdateCropDto, 
  CropResponseDto,
  MapFarmerCropDto, 
  UpdateFarmerCropDto, 
  FarmerCropResponseDto 
} from '../dto/crop.dto.js';
import { AuditLogService } from '../../../services/audit.service.js';

export class CropService {
  private cropRepository = new CropRepository();

  private formatCropResponse(crop: any): CropResponseDto {
    return {
      id: crop.id,
      name: crop.name,
      variety: crop.variety,
      scientificName: crop.scientificName,
      hsCode: crop.hsCode,
    };
  }

  private formatFarmerCropResponse(data: any): FarmerCropResponseDto {
    const { farmerCrop, crop, farm, farmer } = data;
    return {
      id: farmerCrop.id,
      farmerId: farmerCrop.farmerId,
      farmId: farmerCrop.farmId,
      cropId: farmerCrop.cropId,
      tenantId: farmerCrop.tenantId,
      sowingDate: farmerCrop.sowingDate ? farmerCrop.sowingDate.toISOString() : null,
      expectedHarvestDate: farmerCrop.expectedHarvestDate ? farmerCrop.expectedHarvestDate.toISOString() : null,
      expectedYieldKg: farmerCrop.expectedYieldKg,
      season: farmerCrop.season,
      createdAt: farmerCrop.createdAt.toISOString(),
      updatedAt: farmerCrop.updatedAt.toISOString(),
      crop: crop ? this.formatCropResponse(crop) : undefined,
      farm: farm ? { id: farm.id, name: farm.name } : undefined,
      farmer: farmer ? { id: farmer.id, registrationNumber: farmer.registrationNumber } : undefined,
    };
  }

  // ==========================================
  // CROP MASTER (crops table)
  // ==========================================

  async createCrop(dto: CreateCropDto, actorUserId: string): Promise<CropResponseDto> {
    const data = {
      name: dto.name,
      variety: dto.variety || null,
      scientificName: dto.scientificName || null,
      hsCode: dto.hsCode || null,
    };

    const newCrop = await this.cropRepository.createCrop(data);

    AuditLogService.log({
      userId: actorUserId,
      action: 'crop.create',
      entityName: 'crops',
      entityId: newCrop.id,
      changes: dto,
    });

    return this.formatCropResponse(newCrop);
  }

  async updateCrop(cropId: string, dto: UpdateCropDto, actorUserId: string): Promise<CropResponseDto> {
    const existing = await this.cropRepository.findCropById(cropId);
    if (!existing) {
      throw new Error('Crop not found');
    }

    const data: Partial<any> = {};
    if (dto.name !== undefined) data.name = dto.name;
    if (dto.variety !== undefined) data.variety = dto.variety;
    if (dto.scientificName !== undefined) data.scientificName = dto.scientificName;
    if (dto.hsCode !== undefined) data.hsCode = dto.hsCode;

    const updated = await this.cropRepository.updateCrop(cropId, data);

    AuditLogService.log({
      userId: actorUserId,
      action: 'crop.update',
      entityName: 'crops',
      entityId: cropId,
      changes: dto,
    });

    return this.formatCropResponse(updated);
  }

  async getCrop(cropId: string): Promise<CropResponseDto> {
    const crop = await this.cropRepository.findCropById(cropId);
    if (!crop) {
      throw new Error('Crop not found');
    }
    return this.formatCropResponse(crop);
  }

  async listCrops(): Promise<CropResponseDto[]> {
    const list = await this.cropRepository.listCrops();
    return list.map((c) => this.formatCropResponse(c));
  }

  async deleteCrop(cropId: string, actorUserId: string): Promise<boolean> {
    const existing = await this.cropRepository.findCropById(cropId);
    if (!existing) {
      throw new Error('Crop not found');
    }

    await this.cropRepository.deleteCrop(cropId);

    AuditLogService.log({
      userId: actorUserId,
      action: 'crop.delete',
      entityName: 'crops',
      entityId: cropId,
    });

    return true;
  }

  // ==========================================
  // FARMER CROP MAPPING (farmer_crops table)
  // ==========================================

  async mapFarmerCrop(dto: MapFarmerCropDto, actorUserId: string): Promise<FarmerCropResponseDto> {
    let sowing: Date | null = null;
    let harvest: Date | null = null;

    if (dto.sowingDate) {
      sowing = new Date(dto.sowingDate);
    }
    if (dto.expectedHarvestDate) {
      harvest = new Date(dto.expectedHarvestDate);
    }

    if (sowing && harvest && harvest < sowing) {
      throw new Error('Expected harvest date must be after the sowing date.');
    }

    const mappingData = {
      farmerId: dto.farmerId,
      farmId: dto.farmId,
      cropId: dto.cropId,
      tenantId: dto.tenantId,
      sowingDate: sowing,
      expectedHarvestDate: harvest,
      expectedYieldKg: dto.expectedYieldKg ? dto.expectedYieldKg.toString() : null,
      season: dto.season || null,
    };

    const newMapping = await this.cropRepository.createFarmerCrop(mappingData);
    
    // Fetch complete object with joins
    const fullData = await this.cropRepository.findFarmerCropById(newMapping.id);

    AuditLogService.log({
      userId: actorUserId,
      tenantId: dto.tenantId,
      action: 'farmer_crop.map',
      entityName: 'farmer_crops',
      entityId: newMapping.id,
      changes: dto,
    });

    return this.formatFarmerCropResponse(fullData);
  }

  async getFarmerCrop(mappingId: string): Promise<FarmerCropResponseDto> {
    const data = await this.cropRepository.findFarmerCropById(mappingId);
    if (!data) {
      throw new Error('Farmer crop mapping not found');
    }
    return this.formatFarmerCropResponse(data);
  }

  async listFarmerCropsByFarmer(farmerId: string): Promise<FarmerCropResponseDto[]> {
    const list = await this.cropRepository.listFarmerCropsByFarmer(farmerId);
    return list.map((m) => this.formatFarmerCropResponse(m));
  }

  async listFarmerCropsByTenant(tenantId: string): Promise<FarmerCropResponseDto[]> {
    const list = await this.cropRepository.listFarmerCropsByTenant(tenantId);
    return list.map((m) => this.formatFarmerCropResponse(m));
  }

  async updateFarmerCrop(
    mappingId: string,
    dto: UpdateFarmerCropDto,
    actorUserId: string,
    actorTenantId: string | null
  ): Promise<FarmerCropResponseDto> {
    const existing = await this.cropRepository.findFarmerCropById(mappingId);
    if (!existing) {
      throw new Error('Farmer crop mapping not found');
    }

    // Tenant Isolation
    if (actorTenantId && existing.farmerCrop.tenantId !== actorTenantId) {
      throw new Error('Access denied to update farmer crop mapping under another tenant space.');
    }

    const updateData: Partial<any> = {};
    if (dto.sowingDate !== undefined) updateData.sowingDate = dto.sowingDate ? new Date(dto.sowingDate) : null;
    if (dto.expectedHarvestDate !== undefined) updateData.expectedHarvestDate = dto.expectedHarvestDate ? new Date(dto.expectedHarvestDate) : null;
    if (dto.expectedYieldKg !== undefined) updateData.expectedYieldKg = dto.expectedYieldKg.toString();
    if (dto.season !== undefined) updateData.season = dto.season;

    // Sowing vs harvest dates check
    const newSowing = updateData.sowingDate !== undefined ? updateData.sowingDate : existing.farmerCrop.sowingDate;
    const newHarvest = updateData.expectedHarvestDate !== undefined ? updateData.expectedHarvestDate : existing.farmerCrop.expectedHarvestDate;
    
    if (newSowing && newHarvest && newHarvest < newSowing) {
      throw new Error('Expected harvest date must be after the sowing date.');
    }

    await this.cropRepository.updateFarmerCrop(mappingId, updateData);

    const updatedData = await this.cropRepository.findFarmerCropById(mappingId);

    AuditLogService.log({
      userId: actorUserId,
      tenantId: existing.farmerCrop.tenantId,
      action: 'farmer_crop.update',
      entityName: 'farmer_crops',
      entityId: mappingId,
      changes: dto,
    });

    return this.formatFarmerCropResponse(updatedData);
  }

  async deleteFarmerCrop(mappingId: string, actorUserId: string, actorTenantId: string | null): Promise<boolean> {
    const existing = await this.cropRepository.findFarmerCropById(mappingId);
    if (!existing) {
      throw new Error('Farmer crop mapping not found');
    }

    // Tenant Isolation
    if (actorTenantId && existing.farmerCrop.tenantId !== actorTenantId) {
      throw new Error('Access denied to delete farmer crop mapping under another tenant space.');
    }

    await this.cropRepository.deleteFarmerCrop(mappingId);

    AuditLogService.log({
      userId: actorUserId,
      tenantId: existing.farmerCrop.tenantId,
      action: 'farmer_crop.delete',
      entityName: 'farmer_crops',
      entityId: mappingId,
    });

    return true;
  }
}
