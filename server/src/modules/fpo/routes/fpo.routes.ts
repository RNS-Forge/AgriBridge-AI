import { Router } from 'express';
import { FpoController } from '../controller/fpo.controller.js';
import { authenticate, authorize, tenantAware } from '../../auth/middleware/index.js';

const router = Router();
const controller = new FpoController();

router.use(authenticate);
router.use(authorize(['FPO_ADMIN', 'SuperAdmin'])); // Admin-only controls

// Membership invitations
router.post('/invite', tenantAware, controller.createInvitation);

// Shares Ledger
router.post('/shares', tenantAware, controller.manageShares);
router.get('/shares/list', tenantAware, controller.listShares);

// Profit Distributions
router.post('/profit/distribute', tenantAware, controller.distributeProfit);
router.get('/profit/list', tenantAware, controller.listProfitSplits);
router.get('/profit/:splitId', controller.getProfitSplitDetails);

// Bulk onboarding upload
router.post('/bulk-upload', tenantAware, controller.bulkUploadMembers);

export default router;
