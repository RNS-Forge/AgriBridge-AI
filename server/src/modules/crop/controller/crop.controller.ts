import { Request, Response, NextFunction } from 'express';
import { AuthRequest } from '../../auth/types/auth.types.js';
import { CropService } from '../service/crop.service.js';
import { 
  createCropSchema, 
  updateCropSchema, 
  mapFarmerCropSchema, 
  updateFarmerCropSchema 
} from '../validation/crop.validation.js';

export class CropController {
  private cropService = new CropService();

  // ==========================================
  // CROP MASTER (crops table)
  // ==========================================

  createCrop = async (req: Request, res: Response, next: NextFunction) => {
    try {
      const authReq = req as AuthRequest;
      const validated = createCropSchema.parse(authReq.body);
      const actorUserId = authReq.user?.userId || 'system';

      const result = await this.cropService.createCrop(validated, actorUserId);
      res.status(201).json({
        success: true,
        message: 'Crop master record created successfully.',
        data: result,
      });
    } catch (error) {
      next(error);
    }
  };

  updateCrop = async (req: Request, res: Response, next: NextFunction) => {
    try {
      const authReq = req as AuthRequest;
      const { cropId } = authReq.params;
      const validated = updateCropSchema.parse(authReq.body);
      const actorUserId = authReq.user?.userId || 'system';

      const result = await this.cropService.updateCrop(cropId, validated, actorUserId);
      res.status(200).json({
        success: true,
        message: 'Crop master record updated successfully.',
        data: result,
      });
    } catch (error) {
      next(error);
    }
  };

  getCrop = async (req: Request, res: Response, next: NextFunction) => {
    try {
      const { cropId } = req.params;
      const result = await this.cropService.getCrop(cropId);
      res.status(200).json({
        success: true,
        data: result,
      });
    } catch (error) {
      next(error);
    }
  };

  listCrops = async (req: Request, res: Response, next: NextFunction) => {
    try {
      const result = await this.cropService.listCrops();
      res.status(200).json({
        success: true,
        data: result,
      });
    } catch (error) {
      next(error);
    }
  };

  deleteCrop = async (req: Request, res: Response, next: NextFunction) => {
    try {
      const authReq = req as AuthRequest;
      const { cropId } = authReq.params;
      const actorUserId = authReq.user?.userId || 'system';

      await this.cropService.deleteCrop(cropId, actorUserId);
      res.status(200).json({
        success: true,
        message: 'Crop master record deleted successfully.',
      });
    } catch (error) {
      next(error);
    }
  };

  // ==========================================
  // FARMER CROP MAPPING (farmer_crops table)
  // ==========================================

  mapFarmerCrop = async (req: Request, res: Response, next: NextFunction) => {
    try {
      const authReq = req as AuthRequest;
      const validated = mapFarmerCropSchema.parse(authReq.body);
      const actorUserId = authReq.user?.userId || 'system';

      const result = await this.cropService.mapFarmerCrop(validated, actorUserId);
      res.status(201).json({
        success: true,
        message: 'Crop mapped to farmer and farm sowing records successfully.',
        data: result,
      });
    } catch (error) {
      next(error);
    }
  };

  getFarmerCrop = async (req: Request, res: Response, next: NextFunction) => {
    try {
      const authReq = req as AuthRequest;
      const { mappingId } = authReq.params;
      const result = await this.cropService.getFarmerCrop(mappingId);

      // Tenant isolation guard
      const isSuperAdmin = authReq.user?.roles.includes('SuperAdmin');
      if (!isSuperAdmin && authReq.user?.tenantId && result.tenantId !== authReq.user.tenantId) {
        return res.status(403).json({
          success: false,
          message: 'Access denied. Mapping belongs to another tenant space.',
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

  listFarmerCrops = async (req: Request, res: Response, next: NextFunction) => {
    try {
      const authReq = req as AuthRequest;
      const { farmerId } = authReq.params;
      const result = await this.cropService.listFarmerCropsByFarmer(farmerId);

      // Check tenant isolation
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

  listTenantFarmerCrops = async (req: Request, res: Response, next: NextFunction) => {
    try {
      const authReq = req as AuthRequest;
      const tenantId = authReq.tenantId;

      if (!tenantId) {
        return res.status(400).json({
          success: false,
          message: 'Tenant context is required to list crops.',
        });
      }

      const result = await this.cropService.listFarmerCropsByTenant(tenantId);
      res.status(200).json({
        success: true,
        data: result,
      });
    } catch (error) {
      next(error);
    }
  };

  updateFarmerCrop = async (req: Request, res: Response, next: NextFunction) => {
    try {
      const authReq = req as AuthRequest;
      const { mappingId } = authReq.params;
      const validated = updateFarmerCropSchema.parse(authReq.body);
      const actorUserId = authReq.user?.userId || 'system';
      const actorTenantId = authReq.user?.roles.includes('SuperAdmin') ? null : (authReq.user?.tenantId || null);

      const result = await this.cropService.updateFarmerCrop(mappingId, validated, actorUserId, actorTenantId);
      res.status(200).json({
        success: true,
        message: 'Farmer crop sowing parameters updated successfully.',
        data: result,
      });
    } catch (error) {
      next(error);
    }
  };

  deleteFarmerCrop = async (req: Request, res: Response, next: NextFunction) => {
    try {
      const authReq = req as AuthRequest;
      const { mappingId } = authReq.params;
      const actorUserId = authReq.user?.userId || 'system';
      const actorTenantId = authReq.user?.roles.includes('SuperAdmin') ? null : (authReq.user?.tenantId || null);

      await this.cropService.deleteFarmerCrop(mappingId, actorUserId, actorTenantId);
      res.status(200).json({
        success: true,
        message: 'Farmer crop mapping deleted successfully.',
      });
    } catch (error) {
      next(error);
    }
  };
}
