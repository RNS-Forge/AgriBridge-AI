import { Request, Response, NextFunction } from 'express';
import { AuthRequest } from '../../auth/types/auth.types.js';
import { BatchService } from '../service/batch.service.js';
import { createHarvestSchema, createBatchSchema, updateBatchSchema } from '../validation/batch.validation.js';

export class BatchController {
  private batchService = new BatchService();

  // ==========================================
  // HARVEST MANAGEMENT
  // ==========================================

  createHarvest = async (req: Request, res: Response, next: NextFunction) => {
    try {
      const authReq = req as AuthRequest;
      const validated = createHarvestSchema.parse(authReq.body);
      const actorUserId = authReq.user?.userId || 'system';

      const result = await this.batchService.createHarvest(validated, actorUserId);
      res.status(201).json({
        success: true,
        message: 'Harvest entry recorded successfully.',
        data: result,
      });
    } catch (error) {
      next(error);
    }
  };

  getHarvest = async (req: Request, res: Response, next: NextFunction) => {
    try {
      const authReq = req as AuthRequest;
      const { harvestId } = authReq.params;
      const result = await this.batchService.getHarvest(harvestId);

      // Tenant isolation guard
      const isSuperAdmin = authReq.user?.roles.includes('SuperAdmin');
      if (!isSuperAdmin && authReq.user?.tenantId && result.tenantId !== authReq.user.tenantId) {
        return res.status(403).json({
          success: false,
          message: 'Access denied. Harvest belongs to another tenant space.',
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

  listHarvests = async (req: Request, res: Response, next: NextFunction) => {
    try {
      const authReq = req as AuthRequest;
      const tenantId = authReq.tenantId;

      if (!tenantId) {
        return res.status(400).json({
          success: false,
          message: 'Tenant context is required to list harvests.',
        });
      }

      const result = await this.batchService.listHarvests(tenantId);
      res.status(200).json({
        success: true,
        data: result,
      });
    } catch (error) {
      next(error);
    }
  };

  // ==========================================
  // BATCH MANAGEMENT
  // ==========================================

  createBatch = async (req: Request, res: Response, next: NextFunction) => {
    try {
      const authReq = req as AuthRequest;
      const validated = createBatchSchema.parse(authReq.body);
      const actorUserId = authReq.user?.userId || 'system';

      const result = await this.batchService.createBatch(validated, actorUserId);
      res.status(201).json({
        success: true,
        message: 'Harvest batch created successfully. QR code trace code registered.',
        data: result,
      });
    } catch (error) {
      next(error);
    }
  };

  getBatch = async (req: Request, res: Response, next: NextFunction) => {
    try {
      const authReq = req as AuthRequest;
      const { batchId } = authReq.params;
      const result = await this.batchService.getBatch(batchId);

      // Tenant isolation guard
      const isSuperAdmin = authReq.user?.roles.includes('SuperAdmin');
      if (!isSuperAdmin && authReq.user?.tenantId && result.tenantId !== authReq.user.tenantId) {
        return res.status(403).json({
          success: false,
          message: 'Access denied. Batch belongs to another tenant space.',
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

  listBatches = async (req: Request, res: Response, next: NextFunction) => {
    try {
      const authReq = req as AuthRequest;
      const tenantId = authReq.tenantId;

      if (!tenantId) {
        return res.status(400).json({
          success: false,
          message: 'Tenant context is required to list batches.',
        });
      }

      const result = await this.batchService.listBatches(tenantId);
      res.status(200).json({
        success: true,
        data: result,
      });
    } catch (error) {
      next(error);
    }
  };

  updateBatch = async (req: Request, res: Response, next: NextFunction) => {
    try {
      const authReq = req as AuthRequest;
      const { batchId } = authReq.params;
      const validated = updateBatchSchema.parse(authReq.body);
      const actorUserId = authReq.user?.userId || 'system';
      const actorTenantId = authReq.user?.roles.includes('SuperAdmin') ? null : (authReq.user?.tenantId || null);

      const result = await this.batchService.updateBatch(batchId, validated, actorUserId, actorTenantId);
      res.status(200).json({
        success: true,
        message: 'Batch updated successfully.',
        data: result,
      });
    } catch (error) {
      next(error);
    }
  };

  deleteBatch = async (req: Request, res: Response, next: NextFunction) => {
    try {
      const authReq = req as AuthRequest;
      const { batchId } = authReq.params;
      const actorUserId = authReq.user?.userId || 'system';
      const actorTenantId = authReq.user?.roles.includes('SuperAdmin') ? null : (authReq.user?.tenantId || null);

      await this.batchService.deleteBatch(batchId, actorUserId, actorTenantId);
      res.status(200).json({
        success: true,
        message: 'Batch deleted successfully and corresponding harvest released.',
      });
    } catch (error) {
      next(error);
    }
  };

  // ==========================================
  // TRACEABILITY REPORT RESOLUTION
  // ==========================================

  getTraceabilityReport = async (req: Request, res: Response, next: NextFunction) => {
    try {
      const authReq = req as AuthRequest;
      const { codeOrId } = authReq.params;

      const result = await this.batchService.getTraceabilityReport(codeOrId);

      // Tenant isolation guard (Unless SuperAdmin)
      const isSuperAdmin = authReq.user?.roles.includes('SuperAdmin');
      if (!isSuperAdmin && authReq.user?.tenantId && result.tenantId !== authReq.user.tenantId) {
        return res.status(403).json({
          success: false,
          message: 'Access denied. Traceability records belong to another tenant space.',
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
}
