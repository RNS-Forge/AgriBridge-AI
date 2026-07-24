import { FarmRepository } from '../repository/farm.repository.js';
import { RegisterFarmDto, UpdateFarmDto, FarmResponseDto } from '../dto/farm.dto.js';
import { AuditLogService } from '../../../services/audit.service.js';

export class FarmService {
  private farmRepository = new FarmRepository();

  private formatResponse(farm: any): FarmResponseDto {
    return {
      id: farm.id,
      farmerId: farm.farmerId,
      tenantId: farm.tenantId,
      name: farm.name,
      soilType: farm.soilType,
      totalAreaHectares: farm.totalAreaHectares,
      latitude: farm.latitude,
      longitude: farm.longitude,
      surveyNumber: farm.surveyNumber,
      boundaryCoordinates: farm.boundaryCoordinates,
      waterSource: farm.waterSource,
      ownershipType: farm.ownershipType,
      createdAt: farm.createdAt.toISOString(),
      updatedAt: farm.updatedAt.toISOString(),
    };
  }

  /**
   * Register a new farm.
   */
  async registerFarm(dto: RegisterFarmDto, actorUserId: string): Promise<FarmResponseDto> {
    // Basic GeoJSON verification if coordinates are provided
    if (dto.boundaryCoordinates) {
      try {
        const parsed = JSON.parse(dto.boundaryCoordinates);
        if (!parsed.type || parsed.type !== 'Polygon' || !Array.isArray(parsed.coordinates)) {
          throw new Error('Invalid GeoJSON Polygon format.');
        }
      } catch {
        throw new Error('boundaryCoordinates must be a valid GeoJSON string representable of a Polygon.');
      }
    }

    const farmData = {
      farmerId: dto.farmerId,
      tenantId: dto.tenantId,
      name: dto.name,
      soilType: dto.soilType || null,
      totalAreaHectares: dto.totalAreaHectares.toString(),
      latitude: dto.latitude ? dto.latitude.toString() : null,
      longitude: dto.longitude ? dto.longitude.toString() : null,
      surveyNumber: dto.surveyNumber || null,
      boundaryCoordinates: dto.boundaryCoordinates || null,
      waterSource: dto.waterSource || null,
      ownershipType: dto.ownershipType || null,
    };

    const newFarm = await this.farmRepository.createFarm(farmData);

    // Write audit log
    AuditLogService.log({
      userId: actorUserId,
      tenantId: dto.tenantId,
      action: 'farm.register',
      entityName: 'farms',
      entityId: newFarm.id,
      changes: { name: dto.name, totalAreaHectares: dto.totalAreaHectares },
    });

    return this.formatResponse(newFarm);
  }

  async getFarm(farmId: string): Promise<FarmResponseDto> {
    const farm = await this.farmRepository.findFarmById(farmId);
    if (!farm) {
      throw new Error('Farm not found');
    }
    return this.formatResponse(farm);
  }

  async listFarmsByFarmer(farmerId: string): Promise<FarmResponseDto[]> {
    const list = await this.farmRepository.listFarmsByFarmer(farmerId);
    return list.map((f) => this.formatResponse(f));
  }

  async listFarmsByTenant(tenantId: string): Promise<FarmResponseDto[]> {
    const list = await this.farmRepository.listFarmsByTenant(tenantId);
    return list.map((f) => this.formatResponse(f));
  }

  /**
   * Update farm details.
   */
  async updateFarm(
    farmId: string,
    dto: UpdateFarmDto,
    actorUserId: string,
    actorTenantId: string | null
  ): Promise<FarmResponseDto> {
    const existing = await this.farmRepository.findFarmById(farmId);
    if (!existing) {
      throw new Error('Farm not found');
    }

    // Tenant Isolation
    if (actorTenantId && existing.tenantId !== actorTenantId) {
      throw new Error('Access denied to update farm under another tenant space.');
    }

    if (dto.boundaryCoordinates) {
      try {
        const parsed = JSON.parse(dto.boundaryCoordinates);
        if (!parsed.type || parsed.type !== 'Polygon' || !Array.isArray(parsed.coordinates)) {
          throw new Error('Invalid GeoJSON Polygon format.');
        }
      } catch {
        throw new Error('boundaryCoordinates must be a valid GeoJSON string representable of a Polygon.');
      }
    }

    const updateData: Partial<any> = {};
    if (dto.name !== undefined) updateData.name = dto.name;
    if (dto.soilType !== undefined) updateData.soilType = dto.soilType;
    if (dto.totalAreaHectares !== undefined) updateData.totalAreaHectares = dto.totalAreaHectares.toString();
    if (dto.latitude !== undefined) updateData.latitude = dto.latitude.toString();
    if (dto.longitude !== undefined) updateData.longitude = dto.longitude.toString();
    if (dto.surveyNumber !== undefined) updateData.surveyNumber = dto.surveyNumber;
    if (dto.boundaryCoordinates !== undefined) updateData.boundaryCoordinates = dto.boundaryCoordinates;
    if (dto.waterSource !== undefined) updateData.waterSource = dto.waterSource;
    if (dto.ownershipType !== undefined) updateData.ownershipType = dto.ownershipType;

    const updated = await this.farmRepository.updateFarm(farmId, updateData);

    AuditLogService.log({
      userId: actorUserId,
      tenantId: existing.tenantId,
      action: 'farm.update',
      entityName: 'farms',
      entityId: farmId,
      changes: dto,
    });

    return this.formatResponse(updated);
  }

  /**
   * Delete farm.
   */
  async deleteFarm(farmId: string, actorUserId: string, actorTenantId: string | null): Promise<boolean> {
    const existing = await this.farmRepository.findFarmById(farmId);
    if (!existing) {
      throw new Error('Farm not found');
    }

    // Tenant Isolation
    if (actorTenantId && existing.tenantId !== actorTenantId) {
      throw new Error('Access denied to delete farm under another tenant space.');
    }

    await this.farmRepository.deleteFarm(farmId);

    AuditLogService.log({
      userId: actorUserId,
      tenantId: existing.tenantId,
      action: 'farm.delete',
      entityName: 'farms',
      entityId: farmId,
    });

    return true;
  }
}
