import { Request, Response, NextFunction } from 'express';
import { AuthRequest } from '../../auth/types/auth.types.js';
import { SuperAdminService } from '../service/superadmin.service.js';
import { 
  updateTenantSchema, 
  updateUserSchema, 
  updatePlatformSettingsSchema, 
  updateRolePermissionsSchema 
} from '../validation/superadmin.validation.js';

export class SuperAdminController {
  private superAdminService = new SuperAdminService();

  getDashboardMetrics = async (req: Request, res: Response, next: NextFunction) => {
    try {
      const authReq = req as AuthRequest;
      const actorUserId = authReq.user?.userId || 'system';

      const result = await this.superAdminService.getDashboardMetrics(actorUserId);
      res.status(200).json({
        success: true,
        data: result,
      });
    } catch (error) {
      next(error);
    }
  };

  listTenants = async (req: Request, res: Response, next: NextFunction) => {
    try {
      const result = await this.superAdminService.listTenants();
      res.status(200).json({
        success: true,
        data: result,
      });
    } catch (error) {
      next(error);
    }
  };

  updateTenant = async (req: Request, res: Response, next: NextFunction) => {
    try {
      const authReq = req as AuthRequest;
      const { tenantId } = authReq.params;
      const validated = updateTenantSchema.parse(authReq.body);
      const actorUserId = authReq.user?.userId || 'system';

      const result = await this.superAdminService.updateTenant(tenantId, validated, actorUserId);
      res.status(200).json({
        success: true,
        message: 'Tenant updated successfully.',
        data: result,
      });
    } catch (error) {
      next(error);
    }
  };

  listUsers = async (req: Request, res: Response, next: NextFunction) => {
    try {
      const result = await this.superAdminService.listUsers();
      res.status(200).json({
        success: true,
        data: result,
      });
    } catch (error) {
      next(error);
    }
  };

  updateUser = async (req: Request, res: Response, next: NextFunction) => {
    try {
      const authReq = req as AuthRequest;
      const { userId } = authReq.params;
      const validated = updateUserSchema.parse(authReq.body);
      const actorUserId = authReq.user?.userId || 'system';

      const result = await this.superAdminService.updateUser(userId, validated, actorUserId);
      res.status(200).json({
        success: true,
        message: 'User status updated successfully.',
        data: result,
      });
    } catch (error) {
      next(error);
    }
  };

  upsertSetting = async (req: Request, res: Response, next: NextFunction) => {
    try {
      const authReq = req as AuthRequest;
      const validated = updatePlatformSettingsSchema.parse(authReq.body);
      const actorUserId = authReq.user?.userId || 'system';

      const result = await this.superAdminService.upsertSetting(validated, actorUserId);
      res.status(200).json({
        success: true,
        message: 'Platform setting saved successfully.',
        data: result,
      });
    } catch (error) {
      next(error);
    }
  };

  getSettings = async (req: Request, res: Response, next: NextFunction) => {
    try {
      const result = await this.superAdminService.getSettings();
      res.status(200).json({
        success: true,
        data: result,
      });
    } catch (error) {
      next(error);
    }
  };

  listAuditLogs = async (req: Request, res: Response, next: NextFunction) => {
    try {
      const { page, limit } = req.query;
      const pageVal = page ? parseInt(page as string) : 1;
      const limitVal = limit ? parseInt(limit as string) : 50;

      const result = await this.superAdminService.listAuditLogs(pageVal, limitVal);
      res.status(200).json({
        success: true,
        data: result,
      });
    } catch (error) {
      next(error);
    }
  };

  listRoles = async (req: Request, res: Response, next: NextFunction) => {
    try {
      const result = await this.superAdminService.listRoles();
      res.status(200).json({
        success: true,
        data: result,
      });
    } catch (error) {
      next(error);
    }
  };

  updateRolePermissions = async (req: Request, res: Response, next: NextFunction) => {
    try {
      const authReq = req as AuthRequest;
      const validated = updateRolePermissionsSchema.parse(authReq.body);
      const actorUserId = authReq.user?.userId || 'system';

      await this.superAdminService.updateRolePermissions(validated, actorUserId);
      res.status(200).json({
        success: true,
        message: 'Role permissions updated successfully.',
      });
    } catch (error) {
      next(error);
    }
  };
}
