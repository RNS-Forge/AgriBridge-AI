import { SuperAdminRepository } from '../repository/superadmin.repository.js';
import { 
  TenantUpdateDto, 
  UserUpdateDto, 
  PlatformSettingsUpdateDto, 
  SuperAdminDashboardDto,
  RolePermissionMappingDto
} from '../dto/superadmin.dto.js';
import { AuditLogService } from '../../../services/audit.service.js';

export class SuperAdminService {
  private superAdminRepository = new SuperAdminRepository();

  async getDashboardMetrics(actorUserId: string): Promise<SuperAdminDashboardDto> {
    const metrics = await this.superAdminRepository.getDashboardMetrics();

    AuditLogService.log({
      userId: actorUserId,
      action: 'superadmin.dashboard.view',
      entityName: 'tenants',
      entityId: '00000000-0000-0000-0000-000000000000',
    });

    return metrics;
  }

  // ==========================================
  // TENANT MANAGEMENT
  // ==========================================

  async listTenants(): Promise<any[]> {
    return await this.superAdminRepository.listTenants();
  }

  async updateTenant(tenantId: string, dto: TenantUpdateDto, actorUserId: string): Promise<any> {
    const updated = await this.superAdminRepository.updateTenant(tenantId, dto);

    AuditLogService.log({
      userId: actorUserId,
      action: 'superadmin.tenant.update',
      entityName: 'tenants',
      entityId: tenantId,
      changes: dto,
    });

    return updated;
  }

  // ==========================================
  // USER MANAGEMENT
  // ==========================================

  async listUsers(): Promise<any[]> {
    return await this.superAdminRepository.listUsers();
  }

  async updateUser(userId: string, dto: UserUpdateDto, actorUserId: string): Promise<any> {
    const updated = await this.superAdminRepository.updateUser(userId, dto);

    AuditLogService.log({
      userId: actorUserId,
      action: 'superadmin.user.update',
      entityName: 'users',
      entityId: userId,
      changes: dto,
    });

    return updated;
  }

  // ==========================================
  // PLATFORM SETTINGS
  // ==========================================

  async upsertSetting(dto: PlatformSettingsUpdateDto, actorUserId: string): Promise<any> {
    const updated = await this.superAdminRepository.upsertSetting(dto.settingKey, dto.settingValue);

    AuditLogService.log({
      userId: actorUserId,
      action: 'superadmin.settings.update',
      entityName: 'platform_settings',
      entityId: updated.id,
      changes: dto,
    });

    return updated;
  }

  async getSettings(): Promise<any[]> {
    return await this.superAdminRepository.getSettings();
  }

  // ==========================================
  // AUDIT LOGS
  // ==========================================

  async listAuditLogs(page = 1, limit = 50): Promise<any[]> {
    const offset = (page - 1) * limit;
    return await this.superAdminRepository.listAuditLogs(limit, offset);
  }

  // ==========================================
  // ROLE & PERMISSIONS
  // ==========================================

  async listRoles(): Promise<any[]> {
    return await this.superAdminRepository.listRoles();
  }

  async updateRolePermissions(dto: RolePermissionMappingDto, actorUserId: string): Promise<boolean> {
    const success = await this.superAdminRepository.updateRolePermissions(dto.roleId, dto.permissionIds);

    AuditLogService.log({
      userId: actorUserId,
      action: 'superadmin.role_permissions.update',
      entityName: 'role_permissions',
      entityId: dto.roleId,
      changes: { permissionIdsCount: dto.permissionIds.length },
    });

    return success;
  }
}
