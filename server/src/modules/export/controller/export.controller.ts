import { Request, Response, NextFunction } from 'express';
import { AuthRequest } from '../../auth/types/auth.types.js';
import { ExportService } from '../service/export.service.js';
import { 
  createExportSchema, 
  updateExportSchema, 
  createShipmentSchema, 
  createCertificateSchema 
} from '../validation/export.validation.js';

export class ExportController {
  private exportService = new ExportService();

  initiateExport = async (req: Request, res: Response, next: NextFunction) => {
    try {
      const authReq = req as AuthRequest;
      const validated = createExportSchema.parse(authReq.body);
      const actorUserId = authReq.user?.userId || 'system';

      const result = await this.exportService.initiateExport(validated, actorUserId);
      res.status(201).json({
        success: true,
        message: 'Export file initiated successfully.',
        data: result,
      });
    } catch (error) {
      next(error);
    }
  };

  updateExport = async (req: Request, res: Response, next: NextFunction) => {
    try {
      const authReq = req as AuthRequest;
      const { exportId } = authReq.params;
      const validated = updateExportSchema.parse(authReq.body);
      const actorUserId = authReq.user?.userId || 'system';

      const result = await this.exportService.updateExport(exportId, validated, actorUserId);
      res.status(200).json({
        success: true,
        message: 'Export file updated successfully.',
        data: result,
      });
    } catch (error) {
      next(error);
    }
  };

  getExportDetails = async (req: Request, res: Response, next: NextFunction) => {
    try {
      const { exportId } = req.params;
      const result = await this.exportService.getExportDetails(exportId);
      res.status(200).json({
        success: true,
        data: result,
      });
    } catch (error) {
      next(error);
    }
  };

  listExports = async (req: Request, res: Response, next: NextFunction) => {
    try {
      const authReq = req as AuthRequest;
      const tenantId = authReq.tenantId;

      if (!tenantId) {
        return res.status(400).json({
          success: false,
          message: 'Tenant context is required.',
        });
      }

      const result = await this.exportService.listExports(tenantId);
      res.status(200).json({
        success: true,
        data: result,
      });
    } catch (error) {
      next(error);
    }
  };

  checkEligibility = async (req: Request, res: Response, next: NextFunction) => {
    try {
      const authReq = req as AuthRequest;
      const { exportId } = authReq.params;
      const actorUserId = authReq.user?.userId || 'system';

      const result = await this.exportService.checkEligibility(exportId, actorUserId);
      res.status(200).json({
        success: true,
        message: 'Export eligibility check evaluated.',
        data: result,
      });
    } catch (error) {
      next(error);
    }
  };

  registerShipment = async (req: Request, res: Response, next: NextFunction) => {
    try {
      const authReq = req as AuthRequest;
      const validated = createShipmentSchema.parse(authReq.body);
      const actorUserId = authReq.user?.userId || 'system';

      const result = await this.exportService.registerShipment(validated, actorUserId);
      res.status(201).json({
        success: true,
        message: 'International shipment registered. Bill of lading mapped.',
        data: result,
      });
    } catch (error) {
      next(error);
    }
  };

  getShipmentDetails = async (req: Request, res: Response, next: NextFunction) => {
    try {
      const { exportId } = req.params;
      const result = await this.exportService.getShipmentDetails(exportId);
      res.status(200).json({
        success: true,
        data: result,
      });
    } catch (error) {
      next(error);
    }
  };

  issueCertificate = async (req: Request, res: Response, next: NextFunction) => {
    try {
      const authReq = req as AuthRequest;
      const validated = createCertificateSchema.parse(authReq.body);
      const actorUserId = authReq.user?.userId || 'system';

      const result = await this.exportService.issueCertificate(validated, actorUserId);
      res.status(201).json({
        success: true,
        message: 'Quality or Origin certificate registered for batch.',
        data: result,
      });
    } catch (error) {
      next(error);
    }
  };
}
