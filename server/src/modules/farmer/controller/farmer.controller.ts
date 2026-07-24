import { Request, Response, NextFunction } from 'express';
import { AuthRequest } from '../../auth/types/auth.types.js';
import { FarmerService } from '../service/farmer.service.js';
import { registerFarmerSchema, updateFarmerSchema } from '../validation/farmer.validation.js';

export class FarmerController {
  private farmerService = new FarmerService();

  register = async (req: Request, res: Response, next: NextFunction) => {
    try {
      const authReq = req as AuthRequest;
      const validated = registerFarmerSchema.parse(authReq.body);
      const actorUserId = authReq.user?.userId || 'system';
      
      const result = await this.farmerService.registerFarmer(validated, actorUserId);
      res.status(201).json({
        success: true,
        message: 'Farmer registration complete and farm record initialized.',
        data: result,
      });
    } catch (error) {
      next(error);
    }
  };

  getFarmer = async (req: Request, res: Response, next: NextFunction) => {
    try {
      const authReq = req as AuthRequest;
      const { farmerId } = authReq.params;
      const result = await this.farmerService.getFarmer(farmerId);
      
      // Tenant Isolation check for non-SuperAdmin
      const isSuperAdmin = authReq.user?.roles.includes('SuperAdmin');
      if (!isSuperAdmin && authReq.user?.tenantId && result.tenantId !== authReq.user.tenantId) {
        return res.status(403).json({
          success: false,
          message: 'Access denied. Farmer belongs to another tenant space.',
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

  listFarmers = async (req: Request, res: Response, next: NextFunction) => {
    try {
      const authReq = req as AuthRequest;
      // Must have tenant context (automatically injected by tenantAware middleware)
      const tenantId = authReq.tenantId;
      if (!tenantId) {
        return res.status(400).json({
          success: false,
          message: 'Tenant context is required to list farmers.',
        });
      }

      const result = await this.farmerService.listFarmers(tenantId);
      res.status(200).json({
        success: true,
        data: result,
      });
    } catch (error) {
      next(error);
    }
  };

  updateFarmer = async (req: Request, res: Response, next: NextFunction) => {
    try {
      const authReq = req as AuthRequest;
      const { farmerId } = authReq.params;
      const validated = updateFarmerSchema.parse(authReq.body);
      const actorUserId = authReq.user?.userId || 'system';
      const actorTenantId = authReq.user?.roles.includes('SuperAdmin') ? null : (authReq.user?.tenantId || null);

      // Prevent non-admins from changing KYC status
      if (validated.kycStatus && !authReq.user?.roles.includes('FPO_ADMIN') && !authReq.user?.roles.includes('SuperAdmin')) {
        return res.status(403).json({
          success: false,
          message: 'Only authorized FPO Administrators or SuperAdmins can modify KYC verification status.',
        });
      }

      const result = await this.farmerService.updateFarmer(farmerId, validated, actorUserId, actorTenantId);
      res.status(200).json({
        success: true,
        message: 'Farmer and farm records updated successfully.',
        data: result,
      });
    } catch (error) {
      next(error);
    }
  };

  deleteFarmer = async (req: Request, res: Response, next: NextFunction) => {
    try {
      const authReq = req as AuthRequest;
      const { farmerId } = authReq.params;
      const actorUserId = authReq.user?.userId || 'system';
      const actorTenantId = authReq.user?.roles.includes('SuperAdmin') ? null : (authReq.user?.tenantId || null);

      await this.farmerService.deleteFarmer(farmerId, actorUserId, actorTenantId);
      res.status(200).json({
        success: true,
        message: 'Farmer, farm, and associated user account soft-deleted successfully.',
      });
    } catch (error) {
      next(error);
    }
  };
}
