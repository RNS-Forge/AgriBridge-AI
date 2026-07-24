import { Router } from 'express';
import { FarmController } from '../controller/farm.controller.js';
import { authenticate, authorize, tenantAware } from '../../auth/middleware/index.js';

const router = Router();
const controller = new FarmController();

router.use(authenticate);

// Registration & Listings (Guarded by FPO_ADMIN / SuperAdmin & Tenant aware validation)
router.post('/register', authorize(['FPO_ADMIN', 'SuperAdmin']), tenantAware, controller.register);
router.get('/list', authorize(['FPO_ADMIN', 'SuperAdmin']), tenantAware, controller.listTenantFarms);
router.get('/farmer/:farmerId', authorize(['FPO_ADMIN', 'SuperAdmin', 'QualityInspector']), controller.listFarmerFarms);

// Single farm access, update, delete
router.get('/:farmId', authorize(['FPO_ADMIN', 'SuperAdmin', 'QualityInspector']), controller.getFarm);
router.put('/:farmId', authorize(['FPO_ADMIN', 'SuperAdmin']), controller.updateFarm);
router.delete('/:farmId', authorize(['FPO_ADMIN', 'SuperAdmin']), controller.deleteFarm);

export default router;
