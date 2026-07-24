import { Request, Response, NextFunction } from 'express';
import { AuthRequest } from '../../auth/types/auth.types.js';
import { FpoService } from '../service/fpo.service.js';
import { 
  createInvitationSchema, 
  manageSharesSchema, 
  distributeProfitSchema, 
  bulkUploadMembersSchema 
} from '../validation/fpo.validation.js';

export class FpoController {
  private fpoService = new FpoService();

  // ==========================================
  // INVITATIONS
  // ==========================================

  createInvitation = async (req: Request, res: Response, next: NextFunction) => {
    try {
      const authReq = req as AuthRequest;
      const validated = createInvitationSchema.parse(authReq.body);
      const actorUserId = authReq.user?.userId || 'system';

      const result = await this.fpoService.createInvitation(validated, actorUserId);
      res.status(201).json({
        success: true,
        message: 'Membership invitation generated successfully.',
        data: result,
      });
    } catch (error) {
      next(error);
    }
  };

  // ==========================================
  // SHARES LEDGER
  // ==========================================

  manageShares = async (req: Request, res: Response, next: NextFunction) => {
    try {
      const authReq = req as AuthRequest;
      const validated = manageSharesSchema.parse(authReq.body);
      const actorUserId = authReq.user?.userId || 'system';

      const result = await this.fpoService.manageShares(validated, actorUserId);
      res.status(200).json({
        success: true,
        message: 'Share allocation updated in FPO ledger successfully.',
        data: result,
      });
    } catch (error) {
      next(error);
    }
  };

  listShares = async (req: Request, res: Response, next: NextFunction) => {
    try {
      const authReq = req as AuthRequest;
      const tenantId = authReq.tenantId;

      if (!tenantId) {
        return res.status(400).json({
          success: false,
          message: 'Tenant context is required.',
        });
      }

      const result = await this.fpoService.listShares(tenantId);
      res.status(200).json({
        success: true,
        data: result,
      });
    } catch (error) {
      next(error);
    }
  };

  // ==========================================
  // PROFIT SPLITS
  // ==========================================

  distributeProfit = async (req: Request, res: Response, next: NextFunction) => {
    try {
      const authReq = req as AuthRequest;
      const validated = distributeProfitSchema.parse(authReq.body);
      const actorUserId = authReq.user?.userId || 'system';

      const result = await this.fpoService.distributeProfit(validated, actorUserId);
      res.status(201).json({
        success: true,
        message: 'Profit split event generated and payouts allocated successfully.',
        data: result,
      });
    } catch (error) {
      next(error);
    }
  };

  listProfitSplits = async (req: Request, res: Response, next: NextFunction) => {
    try {
      const authReq = req as AuthRequest;
      const tenantId = authReq.tenantId;

      if (!tenantId) {
        return res.status(400).json({
          success: false,
          message: 'Tenant context is required.',
        });
      }

      const result = await this.fpoService.listProfitSplits(tenantId);
      res.status(200).json({
        success: true,
        data: result,
      });
    } catch (error) {
      next(error);
    }
  };

  getProfitSplitDetails = async (req: Request, res: Response, next: NextFunction) => {
    try {
      const authReq = req as AuthRequest;
      const { splitId } = authReq.params;

      const result = await this.fpoService.getProfitSplitDetails(splitId);

      // Tenant isolation guard
      const isSuperAdmin = authReq.user?.roles.includes('SuperAdmin');
      if (!isSuperAdmin && authReq.user?.tenantId && result.tenantId !== authReq.user.tenantId) {
        return res.status(403).json({
          success: false,
          message: 'Access denied. Split belongs to another tenant space.',
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

  // ==========================================
  // MEMBERSHIP BULK UPLOAD
  // ==========================================

  bulkUploadMembers = async (req: Request, res: Response, next: NextFunction) => {
    try {
      const authReq = req as AuthRequest;
      const validated = bulkUploadMembersSchema.parse(authReq.body);
      const actorUserId = authReq.user?.userId || 'system';

      const result = await this.fpoService.bulkUploadMembers(
        validated.tenantId,
        validated.members,
        actorUserId
      );

      res.status(200).json({
        success: true,
        message: 'Bulk registration parser executed.',
        data: result,
      });
    } catch (error) {
      next(error);
    }
  };
}
