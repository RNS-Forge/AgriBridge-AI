import { SuperAdminService } from '../service/superadmin.service.js';
import { updateTenantSchema, updateUserSchema, updatePlatformSettingsSchema, updateRolePermissionsSchema } from '../validation/superadmin.validation.js';
export class SuperAdminController {
    superAdminService = new SuperAdminService();
    getDashboardMetrics = async (req, res, next) => {
        try {
            const authReq = req;
            const actorUserId = authReq.user?.userId || 'system';
            const result = await this.superAdminService.getDashboardMetrics(actorUserId);
            res.status(200).json({
                success: true,
                data: result,
            });
        }
        catch (error) {
            next(error);
        }
    };
    listTenants = async (req, res, next) => {
        try {
            const result = await this.superAdminService.listTenants();
            res.status(200).json({
                success: true,
                data: result,
            });
        }
        catch (error) {
            next(error);
        }
    };
    updateTenant = async (req, res, next) => {
        try {
            const authReq = req;
            const { tenantId } = authReq.params;
            const validated = updateTenantSchema.parse(authReq.body);
            const actorUserId = authReq.user?.userId || 'system';
            const result = await this.superAdminService.updateTenant(tenantId, validated, actorUserId);
            res.status(200).json({
                success: true,
                message: 'Tenant updated successfully.',
                data: result,
            });
        }
        catch (error) {
            next(error);
        }
    };
    listUsers = async (req, res, next) => {
        try {
            const result = await this.superAdminService.listUsers();
            res.status(200).json({
                success: true,
                data: result,
            });
        }
        catch (error) {
            next(error);
        }
    };
    updateUser = async (req, res, next) => {
        try {
            const authReq = req;
            const { userId } = authReq.params;
            const validated = updateUserSchema.parse(authReq.body);
            const actorUserId = authReq.user?.userId || 'system';
            const result = await this.superAdminService.updateUser(userId, validated, actorUserId);
            res.status(200).json({
                success: true,
                message: 'User status updated successfully.',
                data: result,
            });
        }
        catch (error) {
            next(error);
        }
    };
    upsertSetting = async (req, res, next) => {
        try {
            const authReq = req;
            const validated = updatePlatformSettingsSchema.parse(authReq.body);
            const actorUserId = authReq.user?.userId || 'system';
            const result = await this.superAdminService.upsertSetting(validated, actorUserId);
            res.status(200).json({
                success: true,
                message: 'Platform setting saved successfully.',
                data: result,
            });
        }
        catch (error) {
            next(error);
        }
    };
    getSettings = async (req, res, next) => {
        try {
            const result = await this.superAdminService.getSettings();
            res.status(200).json({
                success: true,
                data: result,
            });
        }
        catch (error) {
            next(error);
        }
    };
    listAuditLogs = async (req, res, next) => {
        try {
            const { page, limit } = req.query;
            const pageVal = page ? parseInt(page) : 1;
            const limitVal = limit ? parseInt(limit) : 50;
            const result = await this.superAdminService.listAuditLogs(pageVal, limitVal);
            res.status(200).json({
                success: true,
                data: result,
            });
        }
        catch (error) {
            next(error);
        }
    };
    listRoles = async (req, res, next) => {
        try {
            const result = await this.superAdminService.listRoles();
            res.status(200).json({
                success: true,
                data: result,
            });
        }
        catch (error) {
            next(error);
        }
    };
    updateRolePermissions = async (req, res, next) => {
        try {
            const authReq = req;
            const validated = updateRolePermissionsSchema.parse(authReq.body);
            const actorUserId = authReq.user?.userId || 'system';
            await this.superAdminService.updateRolePermissions(validated, actorUserId);
            res.status(200).json({
                success: true,
                message: 'Role permissions updated successfully.',
            });
        }
        catch (error) {
            next(error);
        }
    };
}
