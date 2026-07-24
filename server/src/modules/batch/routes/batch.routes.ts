import { Router } from 'express';
import { BatchController } from '../controller/batch.controller.js';
import { authenticate, authorize, tenantAware } from '../../auth/middleware/index.js';

const router = Router();
const controller = new BatchController();

router.use(authenticate);

// Traceability scanner endpoint (Guarded by authenticate, anyone with access token can scan or trace)
router.get('/trace/:codeOrId', controller.getTraceabilityReport);

// Harvest Entry paths
router.post('/harvest', authorize(['FPO_ADMIN', 'SuperAdmin', 'Farmer']), tenantAware, controller.createHarvest);
router.get('/harvest/list', authorize(['FPO_ADMIN', 'SuperAdmin', 'QualityInspector']), tenantAware, controller.listHarvests);
router.get('/harvest/:harvestId', authorize(['FPO_ADMIN', 'SuperAdmin', 'QualityInspector', 'Farmer']), controller.getHarvest);

// Batch Creation & Tracking paths
router.post('/', authorize(['FPO_ADMIN', 'SuperAdmin']), tenantAware, controller.createBatch);
router.get('/list', authorize(['FPO_ADMIN', 'SuperAdmin', 'QualityInspector']), tenantAware, controller.listBatches);
router.get('/:batchId', authorize(['FPO_ADMIN', 'SuperAdmin', 'QualityInspector']), controller.getBatch);
router.put('/:batchId', authorize(['FPO_ADMIN', 'SuperAdmin', 'QualityInspector']), controller.updateBatch);
router.delete('/:batchId', authorize(['FPO_ADMIN', 'SuperAdmin']), controller.deleteBatch);

export default router;
