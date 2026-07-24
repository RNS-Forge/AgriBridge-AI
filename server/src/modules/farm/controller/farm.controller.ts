import { Request, Response, NextFunction } from 'express';
import { AuthRequest } from '../../auth/types/auth.types.js';
import { FarmService } from '../service/farm.service.js';
import { registerFarmSchema, updateFarmSchema } from '../validation/farm.validation.js';

export class FarmController {
  private farmService = new FarmService();

  register = async (req: Request, res: Response, next: NextFunction) => {
    try {
      const authReq = req as AuthRequest;
      const validated = registerFarmSchema.parse(authReq.body);
      const actorUserId = authReq.user?.userId || 'system';

      const result = await this.farmService.registerFarm(validated, actorUserId);
      res.status(201).json({
        success: true,
        message: 'Farm registered successfully.',
        data: result,
      });
    } catch (error) {
      next(error);
    }
  };

  getFarm = async (req: Request, res: Response, next: NextFunction) => {
    try {
      const authReq = req as AuthRequest;
      const { farmId } = authReq.params;
      const result = await this.farmService.getFarm(farmId);

      // Tenant isolation guard
      const isSuperAdmin = authReq.user?.roles.includes('SuperAdmin');
      if (!isSuperAdmin && authReq.user?.tenantId && result.tenantId !== authReq.user.tenantId) {
        return res.status(403).json({
          success: false,
          message: 'Access denied. Farm belongs to another tenant space.',
        });
      }

      res.status(200).json({
        success: true,
        data: result,
      });
    } catch (error) {
      next(error);
    }
  };

  listFarmerFarms = async (req: Request, res: Response, next: NextFunction) => {
    try {
      const authReq = req as AuthRequest;
      const { farmerId } = authReq.params;
      const result = await this.farmService.listFarmsByFarmer(farmerId);

      // Check tenant bounds for each farm if not SuperAdmin
      if (result.length > 0) {
        const isSuperAdmin = authReq.user?.roles.includes('SuperAdmin');
        if (!isSuperAdmin && authReq.user?.tenantId && result[0].tenantId !== authReq.user.tenantId) {
          return res.status(403).json({
            success: false,
            message: 'Access denied. Farmer belongs to another tenant space.',
          });
        }
      }

      res.status(200).json({
        success: true,
        data: result,
      });
    } catch (error) {
      next(error);
    }
  };

  listTenantFarms = async (req: Request, res: Response, next: NextFunction) => {
    try {
      const authReq = req as AuthRequest;
      const tenantId = authReq.tenantId;

      if (!tenantId) {
        return res.status(400).json({
          success: false,
          message: 'Tenant context is required to list farms.',
        });
      }

      const result = await this.farmService.listFarmsByTenant(tenantId);
      res.status(200).json({
        success: true,
        data: result,
      });
    } catch (error) {
      next(error);
    }
  };

  updateFarm = async (req: Request, res: Response, next: NextFunction) => {
    try {
      const authReq = req as AuthRequest;
      const { farmId } = authReq.params;
      const validated = updateFarmSchema.parse(authReq.body);
      const actorUserId = authReq.user?.userId || 'system';
      const actorTenantId = authReq.user?.roles.includes('SuperAdmin') ? null : (authReq.user?.tenantId || null);

      const result = await this.farmService.updateFarm(farmId, validated, actorUserId, actorTenantId);
      res.status(200).json({
        success: true,
        message: 'Farm records updated successfully.',
        data: result,
      });
    } catch (error) {
      next(error);
    }
  };

  deleteFarm = async (req: Request, res: Response, next: NextFunction) => {
    try {
      const authReq = req as AuthRequest;
      const { farmId } = authReq.params;
      const actorUserId = authReq.user?.userId || 'system';
      const actorTenantId = authReq.user?.roles.includes('SuperAdmin') ? null : (authReq.user?.tenantId || null);

      await this.farmService.deleteFarm(farmId, actorUserId, actorTenantId);
      res.status(200).json({
        success: true,
        message: 'Farm soft-deleted successfully.',
      });
    } catch (error) {
      next(error);
    }
  };
}
