import { Router } from 'express';
import { ExportController } from '../controller/export.controller.js';
import { authenticate, authorize, tenantAware } from '../../auth/middleware/index.js';

const router = Router();
const controller = new ExportController();

router.use(authenticate);
router.use(authorize(['FPO_ADMIN', 'SuperAdmin'])); // Admin-only controls

// Certificates onboarding
router.post('/certificate', controller.issueCertificate);

// Exports Lifecycle
router.post('/initiate', controller.initiateExport);
router.get('/list', tenantAware, controller.listExports);
router.get('/:exportId', controller.getExportDetails);
router.put('/:exportId', controller.updateExport);

// Eligibility compliance triggers
router.post('/:exportId/check-eligibility', controller.checkEligibility);

// Shipments logistics
router.post('/shipment', controller.registerShipment);
router.get('/:exportId/shipment', controller.getShipmentDetails);

export default router;
