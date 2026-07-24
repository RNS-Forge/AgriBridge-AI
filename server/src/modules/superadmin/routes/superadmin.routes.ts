import { Router } from 'express';
import { SuperAdminController } from '../controller/superadmin.controller.js';
import { authenticate, authorize } from '../../auth/middleware/index.js';

const router = Router();
const controller = new SuperAdminController();

router.use(authenticate);
router.use(authorize(['SuperAdmin'])); // Strictly restricted to platform SuperAdmins

// Analytics & Dashboard
router.get('/dashboard', controller.getDashboardMetrics);

// Tenant Actions
router.get('/tenants', controller.listTenants);
router.put('/tenants/:tenantId', controller.updateTenant);

// User Actions
router.get('/users', controller.listUsers);
router.put('/users/:userId', controller.updateUser);

// Platform Settings
router.get('/settings', controller.getSettings);
router.post('/settings', controller.upsertSetting);

// Global Audit logs
router.get('/audit-logs', controller.listAuditLogs);

// Role & Permission Management
router.get('/roles', controller.listRoles);
router.post('/role-permissions', controller.updateRolePermissions);

export default router;
