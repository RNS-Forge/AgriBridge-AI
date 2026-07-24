import crypto from 'crypto';
import { FarmerRepository } from '../repository/farmer.repository.js';
import { RegisterFarmerDto, UpdateFarmerDto, FarmerResponseDto } from '../dto/farmer.dto.js';
import { AuditLogService } from '../../../services/audit.service.js';

export class FarmerService {
  private farmerRepository = new FarmerRepository();

  private hashPassword(password: string): string {
    const salt = crypto.randomBytes(16).toString('hex');
    const hash = crypto.pbkdf2Sync(password, salt, 1000, 64, 'sha512').toString('hex');
    return `${salt}:${hash}`;
  }

  private hashAadhaar(aadhaar: string): string {
    return crypto.createHash('sha256').update(aadhaar).digest('hex');
  }

  private formatResponse(data: any): FarmerResponseDto {
    const { farmer, user, farm } = data;
    return {
      farmerId: farmer.id,
      userId: user.id,
      tenantId: farmer.tenantId,
      email: user.email,
      firstName: user.firstName,
      lastName: user.lastName,
      registrationNumber: farmer.registrationNumber,
      kycStatus: farmer.kycStatus,
      kycVerifiedAt: farmer.kycVerifiedAt ? farmer.kycVerifiedAt.toISOString() : null,
      documentUrl: farmer.documentUrl,
      bankName: farmer.bankName,
      accountNumber: farmer.accountNumber,
      ifscCode: farmer.ifscCode,
      farm: farm ? {
        id: farm.id,
        name: farm.name,
        soilType: farm.soilType,
        totalAreaHectares: farm.totalAreaHectares,
        latitude: farm.latitude,
        longitude: farm.longitude,
        surveyNumber: farm.surveyNumber,
        boundaryCoordinates: farm.boundaryCoordinates,
      } : null,
    };
  }

  async registerFarmer(dto: RegisterFarmerDto, actorUserId: string): Promise<FarmerResponseDto> {
    const passwordHash = this.hashPassword(dto.password);
    const aadhaarHash = this.hashAadhaar(dto.aadhaarNumber);

    const userData = {
      tenantId: dto.tenantId,
      email: dto.email,
      passwordHash,
      firstName: dto.firstName || null,
      lastName: dto.lastName || null,
      status: 'active' as const, // Activate by default
    };

    const farmerData = {
      tenantId: dto.tenantId,
      aadhaarHash,
      registrationNumber: dto.registrationNumber,
      bankName: dto.bankName || null,
      accountNumber: dto.accountNumber || null,
      ifscCode: dto.ifscCode || null,
      documentUrl: dto.documentUrl || null,
      kycStatus: 'pending' as const,
    };

    const farmData = {
      tenantId: dto.tenantId,
      name: dto.farmName,
      soilType: dto.soilType || null,
      totalAreaHectares: dto.totalAreaHectares.toString(),
      latitude: dto.latitude ? dto.latitude.toString() : null,
      longitude: dto.longitude ? dto.longitude.toString() : null,
      surveyNumber: dto.surveyNumber || null,
      boundaryCoordinates: dto.boundaryCoordinates || null,
    };

    const result = await this.farmerRepository.createFarmerWithFarm(userData, farmerData, farmData);

    // Audit Log the registration
    AuditLogService.log({
      userId: actorUserId,
      tenantId: dto.tenantId,
      action: 'farmer.register',
      entityName: 'farmers',
      entityId: result.farmer.id,
      changes: { email: dto.email, registrationNumber: dto.registrationNumber },
    });

    return this.formatResponse(result);
  }

  async getFarmer(farmerId: string): Promise<FarmerResponseDto> {
    const data = await this.farmerRepository.findFarmerById(farmerId);
    if (!data) {
      throw new Error('Farmer not found');
    }
    return this.formatResponse(data);
  }

  async getFarmerByUserId(userId: string): Promise<FarmerResponseDto> {
    const data = await this.farmerRepository.findFarmerByUserId(userId);
    if (!data) {
      throw new Error('Farmer record not found for this user account');
    }
    return this.formatResponse(data);
  }

  async listFarmers(tenantId: string): Promise<FarmerResponseDto[]> {
    const records = await this.farmerRepository.listFarmersByTenant(tenantId);
    return records.map(r => this.formatResponse(r));
  }

  async updateFarmer(
    farmerId: string,
    dto: UpdateFarmerDto,
    actorUserId: string,
    actorTenantId: string | null
  ): Promise<FarmerResponseDto> {
    const existing = await this.farmerRepository.findFarmerById(farmerId);
    if (!existing) {
      throw new Error('Farmer not found');
    }

    // Tenant Isolation Guard
    if (actorTenantId && existing.farmer.tenantId !== actorTenantId) {
      throw new Error('Access denied to update farmer from another tenant space');
    }

    const farmerUpdates: Partial<any> = {};
    const farmUpdates: Partial<any> = {};
    const userUpdates: Partial<any> = {};

    // Map farmer modifications
    if (dto.bankName !== undefined) farmerUpdates.bankName = dto.bankName;
    if (dto.accountNumber !== undefined) farmerUpdates.accountNumber = dto.accountNumber;
    if (dto.ifscCode !== undefined) farmerUpdates.ifscCode = dto.ifscCode;
    if (dto.documentUrl !== undefined) farmerUpdates.documentUrl = dto.documentUrl;
    
    // KYC status update
    if (dto.kycStatus !== undefined) {
      farmerUpdates.kycStatus = dto.kycStatus;
      if (dto.kycStatus === 'verified') {
        farmerUpdates.kycVerifiedAt = new Date();
      } else {
        farmerUpdates.kycVerifiedAt = null;
      }
    }

    // Map farm modifications
    if (dto.farmName !== undefined) farmUpdates.name = dto.farmName;
    if (dto.soilType !== undefined) farmUpdates.soilType = dto.soilType;
    if (dto.totalAreaHectares !== undefined) farmUpdates.totalAreaHectares = dto.totalAreaHectares.toString();
    if (dto.latitude !== undefined) farmUpdates.latitude = dto.latitude.toString();
    if (dto.longitude !== undefined) farmUpdates.longitude = dto.longitude.toString();
    if (dto.surveyNumber !== undefined) farmUpdates.surveyNumber = dto.surveyNumber;
    if (dto.boundaryCoordinates !== undefined) farmUpdates.boundaryCoordinates = dto.boundaryCoordinates;

    await this.farmerRepository.updateFarmerAndFarm(farmerId, farmerUpdates, farmUpdates);

    // Fetch updated complete object
    const updatedData = await this.farmerRepository.findFarmerById(farmerId);

    // Log update audit event
    AuditLogService.log({
      userId: actorUserId,
      tenantId: existing.farmer.tenantId,
      action: 'farmer.update',
      entityName: 'farmers',
      entityId: farmerId,
      changes: dto,
    });

    return this.formatResponse(updatedData);
  }

  async deleteFarmer(farmerId: string, actorUserId: string, actorTenantId: string | null): Promise<boolean> {
    const existing = await this.farmerRepository.findFarmerById(farmerId);
    if (!existing) {
      throw new Error('Farmer not found');
    }

    // Tenant Isolation Guard
    if (actorTenantId && existing.farmer.tenantId !== actorTenantId) {
      throw new Error('Access denied to delete farmer from another tenant space');
    }

    await this.farmerRepository.deleteFarmer(farmerId);

    // Log deletion event
    AuditLogService.log({
      userId: actorUserId,
      tenantId: existing.farmer.tenantId,
      action: 'farmer.delete',
      entityName: 'farmers',
      entityId: farmerId,
    });

    return true;
  }
}
