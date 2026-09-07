import { SuperAdminRepository } from '../repository/superadmin.repository.js';
import { AuditLogService } from '../../../services/audit.service.js';
export class SuperAdminService {
    superAdminRepository = new SuperAdminRepository();
    async getDashboardMetrics(actorUserId) {
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
    async listTenants() {
        return await this.superAdminRepository.listTenants();
    }
    async updateTenant(tenantId, dto, actorUserId) {
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
    async listUsers() {
        return await this.superAdminRepository.listUsers();
    }
    async updateUser(userId, dto, actorUserId) {
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
    async upsertSetting(dto, actorUserId) {
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
    async getSettings() {
        return await this.superAdminRepository.getSettings();
    }
    // ==========================================
    // AUDIT LOGS
    // ==========================================
    async listAuditLogs(page = 1, limit = 50) {
        const offset = (page - 1) * limit;
        return await this.superAdminRepository.listAuditLogs(limit, offset);
    }
    // ==========================================
    // ROLE & PERMISSIONS
    // ==========================================
    async listRoles() {
        return await this.superAdminRepository.listRoles();
    }
    async updateRolePermissions(dto, actorUserId) {
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
