import { Router } from 'express';
import { MandiController } from '../controller/mandi.controller.js';
import { authenticate, authorize } from '../../auth/middleware/index.js';

const router = Router();
const controller = new MandiController();

router.use(authenticate);

// Public query paths (All authenticated users can query prices and proximity info)
router.get('/prices', controller.getDailyPrices);
router.get('/nearby', controller.getNearbyMarkets);
router.get('/compare', controller.compareMarkets);
router.get('/markets', controller.listMarkets);

// Admin-only data feed controls
router.post('/markets', authorize(['FPO_ADMIN', 'SuperAdmin']), controller.createMarket);
router.post('/prices', authorize(['FPO_ADMIN', 'SuperAdmin']), controller.recordPrice);
router.post('/sync', authorize(['FPO_ADMIN', 'SuperAdmin']), controller.triggerSync);

export default router;
