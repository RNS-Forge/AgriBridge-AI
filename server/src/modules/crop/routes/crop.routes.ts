import { Router } from 'express';
import { CropController } from '../controller/crop.controller.js';
import { authenticate, authorize, tenantAware } from '../../auth/middleware/index.js';

const router = Router();
const controller = new CropController();

// Crop Master paths (SuperAdmins & FPO Admins can manage crop definitions, standard authenticated users can read them)
router.get('/master', authenticate, controller.listCrops);
router.get('/master/:cropId', authenticate, controller.getCrop);
router.post('/master', authenticate, authorize(['FPO_ADMIN', 'SuperAdmin']), controller.createCrop);
router.put('/master/:cropId', authenticate, authorize(['FPO_ADMIN', 'SuperAdmin']), controller.updateCrop);
router.delete('/master/:cropId', authenticate, authorize(['FPO_ADMIN', 'SuperAdmin']), controller.deleteCrop);

// Farmer Crop Mapping paths (Requires FPO_ADMIN/SuperAdmin to create/edit/delete; can list by farmer or tenant)
router.post('/map', authenticate, authorize(['FPO_ADMIN', 'SuperAdmin']), tenantAware, controller.mapFarmerCrop);
router.get('/list', authenticate, authorize(['FPO_ADMIN', 'SuperAdmin']), tenantAware, controller.listTenantFarmerCrops);
router.get('/farmer/:farmerId', authenticate, authorize(['FPO_ADMIN', 'SuperAdmin', 'QualityInspector']), controller.listFarmerCrops);

router.get('/:mappingId', authenticate, authorize(['FPO_ADMIN', 'SuperAdmin', 'QualityInspector']), controller.getFarmerCrop);
router.put('/:mappingId', authenticate, authorize(['FPO_ADMIN', 'SuperAdmin']), controller.updateFarmerCrop);
router.delete('/:mappingId', authenticate, authorize(['FPO_ADMIN', 'SuperAdmin']), controller.deleteFarmerCrop);

export default router;
