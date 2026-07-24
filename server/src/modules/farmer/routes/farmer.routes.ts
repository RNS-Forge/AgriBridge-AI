import { Router } from 'express';
import { FarmerController } from '../controller/farmer.controller.js';
import { authenticate, authorize, tenantAware } from '../../auth/middleware/index.js';

const router = Router();
const controller = new FarmerController();

// All routes require authentication
router.use(authenticate);

// Registration & Listing require FPO Admin context & Tenant validation
router.post('/register', authorize(['FPO_ADMIN', 'SuperAdmin']), tenantAware, controller.register);
router.get('/list', authorize(['FPO_ADMIN', 'SuperAdmin']), tenantAware, controller.listFarmers);

// Individual farmer details access / updates
router.get('/:farmerId', authorize(['FPO_ADMIN', 'SuperAdmin', 'QualityInspector']), controller.getFarmer);
router.put('/:farmerId', authorize(['FPO_ADMIN', 'SuperAdmin']), controller.updateFarmer);
router.delete('/:farmerId', authorize(['FPO_ADMIN', 'SuperAdmin']), controller.deleteFarmer);

export default router;
