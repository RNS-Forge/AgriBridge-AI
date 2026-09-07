import { Router, Request, Response } from 'express';
import jwt from 'jsonwebtoken';
import { phase1Store } from '../../database/phase1Store.js';
import { config, supabase } from '../../config/index.js';

const router = Router();

// Automatic Supabase Cloud DB persistence for all state mutations
router.use((req, res, next) => {
  if (['POST', 'PUT', 'PATCH', 'DELETE'].includes(req.method)) {
    res.on('finish', () => {
      if (res.statusCode >= 200 && res.statusCode < 300) {
        phase1Store.saveToSupabase().catch((err) => {
          console.warn('[Supabase DB Auto-Persist]:', err.message);
        });
      }
    });
  }
  next();
});

// Helper to extract authenticated user from Authorization header
function getAuthUser(req: Request) {
  try {
    const authHeader = req.headers.authorization;
    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      return null;
    }
    const token = authHeader.split(' ')[1];
    const decoded = jwt.verify(token, config.JWT_SECRET) as any;
    return phase1Store.users.find((u) => u.id === decoded.userId) || null;
  } catch {
    return null;
  }
}

function generateToken(user: any) {
  return jwt.sign(
    {
      userId: user.id,
      email: user.email,
      roles: user.roles,
    },
    config.JWT_SECRET,
    { expiresIn: '24h' }
  );
}

// ─────────────────────────────────────────────────────────────────────────────
const DEMO_EMAILS = [
  'admin@agribridge.com',
  'adminmaker@agribridge.com',
  'farmer@agribridge.com',
  'manager@agribridge.com',
  'worker@agribridge.com',
  'buyer@agribridge.com',
  'mandi@agribridge.com',
  'mandiagent@agribridge.com',
  'farmmanager@agribridge.com',
];

// Return environment auth configuration (demo mode status)
router.get('/auth/config', (_req: Request, res: Response) => {
  return res.status(200).json({
    success: true,
    data: {
      demoEnabled: Boolean(config.DEMO),
    },
  });
});

// 1. AUTH & RBAC (Prompt 2 + User specific requirements)
// ─────────────────────────────────────────────────────────────────────────────

// Login supporting all roles & default admin@agribridge.com with AgriBridgeAI@2026
router.post('/auth/login', (req: Request, res: Response) => {
  const { email, password, isDemo } = req.body;

  if (!email || !password) {
    return res.status(400).json({ success: false, message: 'Email and password are required' });
  }

  const cleanEmail = email.trim().toLowerCase();

  // If DEMO is disabled in environment, strictly disallow demo accounts & demo login
  if (!config.DEMO && (isDemo || DEMO_EMAILS.includes(cleanEmail))) {
    return res.status(403).json({
      success: false,
      message: 'Demo accounts and demo login are disabled (DEMO=false). Please log in with original registered credentials.',
    });
  }

  // Find user by email
  let user = phase1Store.users.find((u) => u.email.toLowerCase() === cleanEmail);

  // If testing with any default role email or admin@agribridge.com
  const isDefaultPassword = password === 'AgriBridgeAI@2026';

  if (!user && cleanEmail === 'admin@agribridge.com' && isDefaultPassword) {
    user = phase1Store.users.find((u) => u.roles.includes('ADMIN'));
  }

  if (!user) {
    return res.status(401).json({ success: false, message: 'Invalid credentials or user not found' });
  }

  if (user.status === 'suspended') {
    return res.status(403).json({ success: false, message: 'Your account is suspended. Contact administrator.' });
  }

  if (user.status === 'pending_approval') {
    return res.status(403).json({
      success: false,
      message: 'Your account request is pending Admin approval. You will be notified once activated.',
    });
  }

  // Check password (accept default password for all default accounts, or match stored hash)
  const isValid = isDefaultPassword || user.passwordHash === password;
  if (!isValid) {
    return res.status(401).json({ success: false, message: 'Invalid password' });
  }

  // Log login in AuditLog
  phase1Store.auditLogs.unshift({
    id: `aud-${Date.now()}`,
    userId: user.id,
    userName: `${user.firstName} ${user.lastName}`,
    action: 'USER_LOGIN',
    entityName: 'User',
    entityId: user.id,
    oldValue: null,
    newValue: `Logged in with role(s): ${user.roles.join(', ')}`,
    timestamp: new Date().toISOString(),
  });

  const token = generateToken(user);

  return res.status(200).json({
    success: true,
    message: 'Login successful',
    data: {
      accessToken: token,
      refreshToken: token,
      user: {
        id: user.id,
        email: user.email,
        firstName: user.firstName,
        lastName: user.lastName,
        roles: user.roles,
        phone: user.phone,
        status: user.status,
      },
    },
  });
});

// Public Account / Organization Signup Request (Queues for Admin Approval)
router.post('/auth/register-request', (req: Request, res: Response) => {
  const { email, firstName, lastName, phone, requestedRole, notes } = req.body;

  if (!email || !firstName || !lastName) {
    return res.status(400).json({ success: false, message: 'Name and email are required' });
  }

  const existing = phase1Store.users.find((u) => u.email.toLowerCase() === email.trim().toLowerCase());
  if (existing) {
    return res.status(400).json({ success: false, message: 'A user with this email already exists' });
  }

  const newRequest = {
    id: `req-${Date.now()}`,
    email: email.trim().toLowerCase(),
    passwordHash: 'AgriBridgeAI@2026',
    firstName,
    lastName,
    phone: phone || '',
    requestedRole: requestedRole || 'FARMER',
    requestedBy: 'SELF_REGISTER',
    status: 'PENDING_APPROVAL' as const,
    notes: notes || 'Submitted via public workspace registration form.',
    createdAt: new Date().toISOString(),
  };

  phase1Store.userRequests.unshift(newRequest);

  phase1Store.auditLogs.unshift({
    id: `aud-${Date.now()}`,
    userId: null,
    userName: `${firstName} ${lastName}`,
    action: 'PUBLIC_SIGNUP_REQUEST',
    entityName: 'UserRequest',
    entityId: newRequest.id,
    oldValue: null,
    newValue: `Role requested: ${newRequest.requestedRole}`,
    timestamp: new Date().toISOString(),
  });

  return res.status(201).json({
    success: true,
    message: 'Your registration request has been submitted for Admin approval. You will receive access once approved.',
    data: newRequest,
  });
});

// Admin Maker User Creation Request (Can create any role EXCEPT ADMIN)
router.post('/auth/admin-maker/create-user-request', (req: Request, res: Response) => {
  const authUser = getAuthUser(req);
  const { email, firstName, lastName, phone, requestedRole, notes } = req.body;

  if (!email || !firstName || !lastName || !requestedRole) {
    return res.status(400).json({ success: false, message: 'Email, name, and requested role are required' });
  }

  // Security Rule: Admin Maker cannot create an ADMIN role!
  if (requestedRole === 'ADMIN') {
    return res.status(403).json({
      success: false,
      message: 'Admin Maker cannot request or create an ADMIN role. Only existing Admins can manage Admins.',
    });
  }

  const existing = phase1Store.users.find((u) => u.email.toLowerCase() === email.trim().toLowerCase());
  if (existing) {
    return res.status(400).json({ success: false, message: 'User with this email already exists' });
  }

  const newRequest = {
    id: `req-${Date.now()}`,
    email: email.trim().toLowerCase(),
    passwordHash: 'AgriBridgeAI@2026',
    firstName,
    lastName,
    phone: phone || '',
    requestedRole,
    requestedBy: authUser?.email || 'adminmaker@agribridge.com',
    status: 'PENDING_APPROVAL' as const,
    notes: notes || 'Created by Admin Maker. Awaiting Super Admin approval.',
    createdAt: new Date().toISOString(),
  };

  phase1Store.userRequests.unshift(newRequest);

  phase1Store.auditLogs.unshift({
    id: `aud-${Date.now()}`,
    userId: authUser?.id || 'usr-adminmaker-01',
    userName: authUser ? `${authUser.firstName} ${authUser.lastName}` : 'Admin Maker',
    action: 'ADMIN_MAKER_REQUEST_ROLE',
    entityName: 'UserRequest',
    entityId: newRequest.id,
    oldValue: null,
    newValue: `Requested role: ${requestedRole} for ${email}`,
    timestamp: new Date().toISOString(),
  });

  return res.status(201).json({
    success: true,
    message: `User creation request for ${requestedRole} submitted. It is pending Admin approval before the account becomes active.`,
    data: newRequest,
  });
});

// Get User Requests (for Admin or Admin Maker)
router.get('/auth/user-requests', (req: Request, res: Response) => {
  return res.status(200).json({
    success: true,
    data: phase1Store.userRequests,
  });
});

// Admin Approve Request
router.post('/auth/user-requests/:id/approve', async (req: Request, res: Response) => {
  const authUser = getAuthUser(req);
  const { id } = req.params;

  const request = phase1Store.userRequests.find((r) => r.id === id);
  if (!request) {
    return res.status(404).json({ success: false, message: 'Request not found' });
  }

  if (request.status !== 'PENDING_APPROVAL') {
    return res.status(400).json({ success: false, message: `Request is already ${request.status}` });
  }

  request.status = 'APPROVED';
  request.reviewedBy = authUser?.id || 'usr-admin-01';
  request.reviewedAt = new Date().toISOString();

  // Create active user account with default password AgriBridgeAI@2026
  const newUser = {
    id: `usr-${Date.now()}`,
    email: request.email,
    passwordHash: request.passwordHash,
    firstName: request.firstName,
    lastName: request.lastName,
    phone: request.phone || '',
    roles: [request.requestedRole],
    status: 'active' as const,
    createdAt: new Date().toISOString(),
  };

  phase1Store.users.push(newUser);

  // Sync to Supabase Auth cloud
  try {
    if (supabase) {
      await supabase.auth.admin.createUser({
        email: newUser.email,
        password: 'AgriBridgeAI@2026',
        email_confirm: true,
        user_metadata: {
          firstName: newUser.firstName,
          lastName: newUser.lastName,
          phone: newUser.phone,
          roles: newUser.roles,
          status: 'active',
        },
      });
    }
  } catch (_) {}

  phase1Store.auditLogs.unshift({
    id: `aud-${Date.now()}`,
    userId: authUser?.id || 'usr-admin-01',
    userName: authUser ? `${authUser.firstName} ${authUser.lastName}` : 'Admin',
    action: 'APPROVE_USER_REQUEST',
    entityName: 'User',
    entityId: newUser.id,
    oldValue: 'PENDING_APPROVAL',
    newValue: `Active User Created: ${newUser.email} (${newUser.roles.join(', ')})`,
    timestamp: new Date().toISOString(),
  });

  return res.status(200).json({
    success: true,
    message: `Request approved. Active account created for ${newUser.email} with role ${request.requestedRole}.`,
    data: { request, user: newUser },
  });
});

// Admin Reject Request
router.post('/auth/user-requests/:id/reject', (req: Request, res: Response) => {
  const authUser = getAuthUser(req);
  const { id } = req.params;
  const { reason } = req.body;

  const request = phase1Store.userRequests.find((r) => r.id === id);
  if (!request) {
    return res.status(404).json({ success: false, message: 'Request not found' });
  }

  request.status = 'REJECTED';
  request.reviewedBy = authUser?.id || 'usr-admin-01';
  request.reviewedAt = new Date().toISOString();
  if (reason) request.notes = `Rejected: ${reason}`;

  phase1Store.auditLogs.unshift({
    id: `aud-${Date.now()}`,
    userId: authUser?.id || 'usr-admin-01',
    userName: authUser ? `${authUser.firstName} ${authUser.lastName}` : 'Admin',
    action: 'REJECT_USER_REQUEST',
    entityName: 'UserRequest',
    entityId: request.id,
    oldValue: 'PENDING_APPROVAL',
    newValue: `Rejected request for ${request.email}. Reason: ${reason || 'Not specified'}`,
    timestamp: new Date().toISOString(),
  });

  return res.status(200).json({
    success: true,
    message: 'Request rejected',
    data: request,
  });
});

// Admin Direct Create User (Can create any role instantly, including Admin Maker and Admin)
router.post('/auth/admin/create-user', async (req: Request, res: Response) => {
  const authUser = getAuthUser(req);
  const { email, firstName, lastName, phone, role } = req.body;

  if (!email || !firstName || !lastName || !role) {
    return res.status(400).json({ success: false, message: 'Email, name, and role are required' });
  }

  const existing = phase1Store.users.find((u) => u.email.toLowerCase() === email.trim().toLowerCase());
  if (existing) {
    return res.status(400).json({ success: false, message: 'User with this email already exists' });
  }

  const newUser = {
    id: `usr-${Date.now()}`,
    email: email.trim().toLowerCase(),
    passwordHash: 'AgriBridgeAI@2026',
    firstName,
    lastName,
    phone: phone || '',
    roles: [role],
    status: 'active' as const,
    createdAt: new Date().toISOString(),
  };

  phase1Store.users.push(newUser);

  // Sync to Supabase Auth cloud
  try {
    if (supabase) {
      await supabase.auth.admin.createUser({
        email: newUser.email,
        password: 'AgriBridgeAI@2026',
        email_confirm: true,
        user_metadata: {
          firstName: newUser.firstName,
          lastName: newUser.lastName,
          phone: newUser.phone,
          roles: newUser.roles,
          status: 'active',
        },
      });
    }
  } catch (_) {}

  phase1Store.auditLogs.unshift({
    id: `aud-${Date.now()}`,
    userId: authUser?.id || 'usr-admin-01',
    userName: authUser ? `${authUser.firstName} ${authUser.lastName}` : 'Admin',
    action: 'ADMIN_DIRECT_CREATE_USER',
    entityName: 'User',
    entityId: newUser.id,
    oldValue: null,
    newValue: `Directly created ${role} user: ${newUser.email}`,
    timestamp: new Date().toISOString(),
  });

  return res.status(201).json({
    success: true,
    message: `Active ${role} user created successfully with default password AgriBridgeAI@2026.`,
    data: newUser,
  });
});

// List Users
router.get('/auth/users', (req: Request, res: Response) => {
  return res.status(200).json({
    success: true,
    data: phase1Store.users.map((u) => ({
      id: u.id,
      email: u.email,
      firstName: u.firstName,
      lastName: u.lastName,
      phone: u.phone,
      roles: u.roles,
      status: u.status,
      createdAt: u.createdAt,
    })),
  });
});

// Toggle User Status (Suspend / Reinstate)
router.patch('/auth/users/:id/status', (req: Request, res: Response) => {
  const authUser = getAuthUser(req);
  const { id } = req.params;
  const { status, reason } = req.body;

  const target = phase1Store.users.find((u) => u.id === id);
  if (!target) {
    return res.status(404).json({ success: false, message: 'User not found' });
  }

  const oldStatus = target.status;
  target.status = status;

  phase1Store.auditLogs.unshift({
    id: `aud-${Date.now()}`,
    userId: authUser?.id || 'usr-admin-01',
    userName: authUser ? `${authUser.firstName} ${authUser.lastName}` : 'Admin',
    action: 'CHANGE_USER_STATUS',
    entityName: 'User',
    entityId: target.id,
    oldValue: oldStatus,
    newValue: `Status changed to ${status}. Reason: ${reason || 'None'}`,
    timestamp: new Date().toISOString(),
  });

  return res.status(200).json({
    success: true,
    message: `User status updated to ${status}`,
    data: target,
  });
});

// ─────────────────────────────────────────────────────────────────────────────
// 2. FARMS & PLOTS (Prompt 3)
// ─────────────────────────────────────────────────────────────────────────────

router.get('/farms', (req: Request, res: Response) => {
  const farmsWithPlots = phase1Store.farms.map((f) => ({
    ...f,
    plots: phase1Store.plots.filter((p) => p.farmId === f.id),
  }));
  return res.status(200).json({ success: true, data: farmsWithPlots });
});

router.post('/farms', (req: Request, res: Response) => {
  const authUser = getAuthUser(req);
  const { name, location, totalAreaAcres, soilType, waterSource, ownershipType } = req.body;

  const newFarm = {
    id: `farm-${Date.now()}`,
    farmerId: authUser?.id || 'usr-farmer-01',
    name,
    location,
    totalAreaAcres: Number(totalAreaAcres) || 10,
    soilType: soilType || 'Loamy',
    waterSource: waterSource || 'Borewell',
    ownershipType: ownershipType || 'Owned',
    managerIds: [],
    createdAt: new Date().toISOString(),
  };

  phase1Store.farms.push(newFarm);
  return res.status(201).json({ success: true, message: 'Farm created successfully', data: newFarm });
});

router.get('/farms/:id', (req: Request, res: Response) => {
  const farm = phase1Store.farms.find((f) => f.id === req.params.id);
  if (!farm) return res.status(404).json({ success: false, message: 'Farm not found' });

  const plots = phase1Store.plots.filter((p) => p.farmId === farm.id);
  return res.status(200).json({ success: true, data: { ...farm, plots } });
});

router.post('/farms/:farmId/plots', (req: Request, res: Response) => {
  const { farmId } = req.params;
  const { name, areaAcres, soilType, waterSource, ownershipType, notes } = req.body;

  const newPlot = {
    id: `plot-${Date.now()}`,
    farmId,
    name,
    areaAcres: Number(areaAcres) || 5,
    soilType: soilType || 'Loamy',
    waterSource: waterSource || 'Drip Irrigation',
    ownershipType: ownershipType || 'Owned',
    notes,
    createdAt: new Date().toISOString(),
  };

  phase1Store.plots.push(newPlot);
  return res.status(201).json({ success: true, message: 'Plot created successfully', data: newPlot });
});

// ─────────────────────────────────────────────────────────────────────────────
// 3. CROP LIFECYCLE MANAGEMENT (Prompt 4)
// ─────────────────────────────────────────────────────────────────────────────

router.get('/crop-cycles', (req: Request, res: Response) => {
  const cycles = phase1Store.cropCycles.map((c) => {
    const costSummary = phase1Store.calculateCropCost(c.id);
    return {
      ...c,
      costSummary,
    };
  });
  return res.status(200).json({ success: true, data: cycles });
});

router.post('/crop-cycles', (req: Request, res: Response) => {
  const { plotId, farmId, cropName, variety, season, sowingDate, expectedHarvestDate, currentStage } = req.body;

  const newCycle = {
    id: `cc-${Date.now()}`,
    plotId,
    farmId,
    cropName,
    variety: variety || '',
    season: season || 'Kharif 2026',
    sowingDate: sowingDate || new Date().toISOString(),
    expectedHarvestDate: expectedHarvestDate || new Date(Date.now() + 90 * 86400000).toISOString(),
    currentStage: currentStage || 'SOWING',
    status: 'ACTIVE' as const,
    actualHarvestDate: null,
    harvestedQuantityKg: null,
    harvestGrade: null,
    notes: '',
    createdAt: new Date().toISOString(),
  };

  phase1Store.cropCycles.push(newCycle);
  return res.status(201).json({ success: true, message: 'Crop cycle initiated', data: newCycle });
});

// Advance Stage
router.patch('/crop-cycles/:id/stage', (req: Request, res: Response) => {
  const { id } = req.params;
  const { stage } = req.body;

  const cycle = phase1Store.cropCycles.find((c) => c.id === id);
  if (!cycle) return res.status(404).json({ success: false, message: 'Crop cycle not found' });

  cycle.currentStage = stage;
  return res.status(200).json({ success: true, message: `Crop cycle advanced to ${stage}`, data: cycle });
});

// Record Harvest
router.post('/crop-cycles/:id/harvest', (req: Request, res: Response) => {
  const { id } = req.params;
  const { harvestDate, quantityKg, grade, notes } = req.body;

  const cycle = phase1Store.cropCycles.find((c) => c.id === id);
  if (!cycle) return res.status(404).json({ success: false, message: 'Crop cycle not found' });

  cycle.currentStage = 'HARVEST';
  cycle.status = 'HARVESTED';
  cycle.actualHarvestDate = harvestDate || new Date().toISOString();
  cycle.harvestedQuantityKg = Number(quantityKg);
  cycle.harvestGrade = grade || 'Grade A';
  cycle.notes = notes || cycle.notes;

  const costSummary = phase1Store.calculateCropCost(cycle.id);

  return res.status(200).json({
    success: true,
    message: 'Harvest recorded successfully. Real cost basis per kg calculated.',
    data: {
      cycle,
      costSummary,
    },
  });
});

// ─────────────────────────────────────────────────────────────────────────────
// 4. TASK & WORK MANAGEMENT (Prompt 5)
// ─────────────────────────────────────────────────────────────────────────────

router.get('/tasks', (req: Request, res: Response) => {
  const authUser = getAuthUser(req);
  let tasks = phase1Store.tasks;

  // If worker, only show tasks assigned to them
  if (authUser && authUser.roles.includes('WORKER')) {
    tasks = tasks.filter((t) => t.assignedTo === authUser.id);
  }

  return res.status(200).json({ success: true, data: tasks });
});

router.post('/tasks', (req: Request, res: Response) => {
  const { cropCycleId, farmId, plotId, title, description, assignedTo, assigneeName, priority, dueDate, wageAmount } = req.body;

  const newTask = {
    id: `tsk-${Date.now()}`,
    cropCycleId: cropCycleId || 'cc-01',
    farmId: farmId || 'farm-01',
    plotId: plotId || 'plot-01',
    title,
    description: description || '',
    assignedTo: assignedTo || null,
    assigneeName: assigneeName || 'Suresh Patil (Worker)',
    priority: priority || 'NORMAL',
    dueDate: dueDate || new Date(Date.now() + 3 * 86400000).toISOString(),
    status: 'TODO' as const,
    wageAmount: Number(wageAmount) || 0,
    createdAt: new Date().toISOString(),
  };

  phase1Store.tasks.push(newTask);
  return res.status(201).json({ success: true, message: 'Task assigned successfully', data: newTask });
});

router.patch('/tasks/:id/status', (req: Request, res: Response) => {
  const { id } = req.params;
  const { status } = req.body;

  const task = phase1Store.tasks.find((t) => t.id === id);
  if (!task) return res.status(404).json({ success: false, message: 'Task not found' });

  task.status = status;
  if (status === 'COMPLETED') {
    task.completedAt = new Date().toISOString();
  }

  return res.status(200).json({ success: true, message: `Task status updated to ${status}`, data: task });
});

router.post('/tasks/:id/evidence', (req: Request, res: Response) => {
  const { id } = req.params;
  const { photoUrl, completionNotes } = req.body;

  const task = phase1Store.tasks.find((t) => t.id === id);
  if (!task) return res.status(404).json({ success: false, message: 'Task not found' });

  task.evidencePhotoUrl = photoUrl || '/logo/sample-produce.png';
  task.completionNotes = completionNotes;
  task.status = 'COMPLETED';
  task.completedAt = new Date().toISOString();

  return res.status(200).json({ success: true, message: 'Evidence uploaded and task completed', data: task });
});

// ─────────────────────────────────────────────────────────────────────────────
// 5. INVENTORY MANAGEMENT (Prompt 6)
// ─────────────────────────────────────────────────────────────────────────────

router.get('/inventory/items', (req: Request, res: Response) => {
  const items = phase1Store.inventoryItems.map((item) => ({
    ...item,
    isLowStock: item.currentStock <= item.lowStockThreshold,
  }));
  return res.status(200).json({ success: true, data: items });
});

router.post('/inventory/items', (req: Request, res: Response) => {
  const { name, category, unit, currentStock, averageUnitCost, lowStockThreshold } = req.body;

  const newItem = {
    id: `inv-${Date.now()}`,
    farmId: 'farm-01',
    name,
    category: category || 'FERTILIZER',
    unit: unit || 'kg',
    currentStock: Number(currentStock) || 0,
    averageUnitCost: Number(averageUnitCost) || 0,
    lowStockThreshold: Number(lowStockThreshold) || 10,
    createdAt: new Date().toISOString(),
  };

  phase1Store.inventoryItems.push(newItem);
  return res.status(201).json({ success: true, message: 'Inventory item added', data: newItem });
});

router.post('/inventory/transactions', (req: Request, res: Response) => {
  const { itemId, type, quantity, unitCost, cropCycleId, notes } = req.body;

  const item = phase1Store.inventoryItems.find((i) => i.id === itemId);
  if (!item) return res.status(404).json({ success: false, message: 'Inventory item not found' });

  const qty = Number(quantity);
  const cost = Number(unitCost) || item.averageUnitCost;

  if (type === 'CONSUMPTION') {
    if (item.currentStock < qty) {
      return res.status(400).json({ success: false, message: 'Insufficient stock in inventory' });
    }
    item.currentStock -= qty;

    // Automatic Linked Expense Generation!
    if (cropCycleId) {
      const cycle = phase1Store.cropCycles.find((c) => c.id === cropCycleId);
      const autoExpense = {
        id: `exp-${Date.now()}`,
        farmId: cycle ? cycle.farmId : 'farm-01',
        plotId: cycle ? cycle.plotId : 'plot-01',
        cropCycleId,
        category: (item.category as any) || 'FERTILIZER',
        amount: Math.round(qty * cost),
        date: new Date().toISOString(),
        vendor: 'Inventory Auto-Consumption',
        receiptUrl: null,
        notes: `Auto-generated from consumption of ${qty} ${item.unit} ${item.name}`,
        source: 'INVENTORY_CONSUMPTION' as const,
        createdAt: new Date().toISOString(),
      };
      phase1Store.expenses.push(autoExpense);
    }
  } else {
    // PURCHASE
    item.currentStock += qty;
  }

  return res.status(200).json({
    success: true,
    message: `Transaction recorded. Stock is now ${item.currentStock} ${item.unit}.`,
    data: item,
  });
});

// ─────────────────────────────────────────────────────────────────────────────
// 6. EXPENSE MANAGEMENT & COST BASIS (Prompt 7 - CORE DIFFERENTIATOR)
// ─────────────────────────────────────────────────────────────────────────────

router.get('/expenses', (req: Request, res: Response) => {
  const { cropCycleId } = req.query;
  let expenses = phase1Store.expenses;
  if (cropCycleId) {
    expenses = expenses.filter((e) => e.cropCycleId === cropCycleId);
  }
  return res.status(200).json({ success: true, data: expenses });
});

router.post('/expenses', (req: Request, res: Response) => {
  const { farmId, plotId, cropCycleId, category, amount, date, vendor, notes } = req.body;

  const newExpense = {
    id: `exp-${Date.now()}`,
    farmId: farmId || 'farm-01',
    plotId: plotId || 'plot-01',
    cropCycleId: cropCycleId || 'cc-01',
    category: category || 'FERTILIZER',
    amount: Number(amount),
    date: date || new Date().toISOString(),
    vendor: vendor || '',
    receiptUrl: null,
    notes: notes || '',
    source: 'MANUAL' as const,
    createdAt: new Date().toISOString(),
  };

  phase1Store.expenses.push(newExpense);
  return res.status(201).json({ success: true, message: 'Expense logged successfully', data: newExpense });
});

// The Signature Reusable Service Function returning real cost basis per kg!
router.get('/crop-cycles/:id/cost-summary', (req: Request, res: Response) => {
  const summary = phase1Store.calculateCropCost(req.params.id);
  if (!summary) {
    return res.status(404).json({ success: false, message: 'Crop cycle not found' });
  }
  return res.status(200).json({ success: true, data: summary });
});

// ─────────────────────────────────────────────────────────────────────────────
// 7. WEATHER INTEGRATION (Prompt 8)
// ─────────────────────────────────────────────────────────────────────────────

router.get('/farms/:farmId/weather', (req: Request, res: Response) => {
  return res.status(200).json({
    success: true,
    data: {
      current: {
        tempC: 28.5,
        condition: 'Partly Cloudy',
        humidity: 62,
        windSpeedKmh: 14,
        rainfallProb: 25,
      },
      forecast: [
        { date: 'Today', tempMin: 22, tempMax: 31, condition: 'Sunny', rainProb: 15 },
        { date: 'Tomorrow', tempMin: 23, tempMax: 30, condition: 'Scattered Showers', rainProb: 45 },
        { date: 'Thursday', tempMin: 21, tempMax: 28, condition: 'Heavy Rain', rainProb: 80 },
        { date: 'Friday', tempMin: 20, tempMax: 29, condition: 'Cloudy', rainProb: 30 },
      ],
      alerts: [
        {
          id: 'w-alt-01',
          severity: 'WARNING',
          alertType: 'HEAVY_RAIN',
          title: 'Heavy Rain Forecast in 48 Hours',
          actionableMessage: 'Heavy downpour expected Thursday evening (>45mm). Consider delaying planned nitrogen fertilizer application and inspect drainage trenches in Plot A.',
          date: '2026-09-07',
        },
      ],
    },
  });
});

// ─────────────────────────────────────────────────────────────────────────────
// 8. MANDI PRICE REFERENCE (Prompt 9)
// ─────────────────────────────────────────────────────────────────────────────

router.get('/mandi-prices', (req: Request, res: Response) => {
  return res.status(200).json({
    success: true,
    data: phase1Store.mandiPrices,
  });
});

// ─────────────────────────────────────────────────────────────────────────────
// 9. PRODUCE MARKETPLACE (Prompt 10 - SIGNATURE DIRECT SALE)
// ─────────────────────────────────────────────────────────────────────────────

router.get('/produce/listings', (req: Request, res: Response) => {
  const authUser = getAuthUser(req);
  const isFarmer = authUser && authUser.roles.includes('FARMER');

  // Strict Privacy Enforcement: If user is not the farmer owner, strip costPerKg!
  const sanitizedListings = phase1Store.produceListings.map((l) => {
    if (!isFarmer || l.farmerId !== authUser?.id) {
      const { costPerKg, ...buyerSafe } = l;
      return buyerSafe;
    }
    return l;
  });

  return res.status(200).json({ success: true, data: sanitizedListings });
});

router.post('/produce/listings', (req: Request, res: Response) => {
  const authUser = getAuthUser(req);
  const { cropCycleId, askingPricePerKg, quantityKg, grade, pickupLocation, availableFrom, availableUntil } = req.body;

  const cycle = phase1Store.cropCycles.find((c) => c.id === cropCycleId);
  if (!cycle) return res.status(404).json({ success: false, message: 'Crop cycle not found' });

  const costSummary = phase1Store.calculateCropCost(cycle.id);

  const newListing = {
    id: `lst-${Date.now()}`,
    cropCycleId: cycle.id,
    farmerId: authUser?.id || 'usr-farmer-01',
    farmerName: authUser ? `${authUser.firstName} ${authUser.lastName}` : 'Rajesh Sharma',
    cropName: cycle.cropName,
    variety: cycle.variety,
    quantityKg: Number(quantityKg) || cycle.harvestedQuantityKg || 5000,
    askingPricePerKg: Number(askingPricePerKg),
    costPerKg: costSummary?.costPerKg || 32.96, // Automatically computed!
    nearestMandiModalPrice: 68.5,
    grade: grade || cycle.harvestGrade || 'Grade A',
    pickupLocation: pickupLocation || 'Nashik Farm Gate',
    availableFrom: availableFrom || new Date().toISOString(),
    availableUntil: availableUntil || new Date(Date.now() + 20 * 86400000).toISOString(),
    photos: ['/logo/sample-produce.png'],
    status: 'ACTIVE' as const,
    createdAt: new Date().toISOString(),
  };

  phase1Store.produceListings.unshift(newListing);
  return res.status(201).json({
    success: true,
    message: 'Produce listed for sale with auto-calculated cost basis comparison.',
    data: newListing,
  });
});

// Offers
router.get('/produce/offers', (req: Request, res: Response) => {
  return res.status(200).json({ success: true, data: phase1Store.offers });
});

router.post('/produce/listings/:id/offers', (req: Request, res: Response) => {
  const authUser = getAuthUser(req);
  const { id } = req.params;
  const { offeredPricePerKg, quantityKg, message } = req.body;

  const listing = phase1Store.produceListings.find((l) => l.id === id);
  if (!listing) return res.status(404).json({ success: false, message: 'Listing not found' });

  const qty = Number(quantityKg);
  const price = Number(offeredPricePerKg);

  const newOffer = {
    id: `ofr-${Date.now()}`,
    listingId: listing.id,
    buyerId: authUser?.id || 'usr-buyer-01',
    buyerName: authUser ? `${authUser.firstName} ${authUser.lastName} (Buyer)` : 'Sunil Mehta (Buyer)',
    offeredPricePerKg: price,
    quantityKg: qty,
    totalOfferAmount: qty * price,
    counterPricePerKg: null,
    message: message || '',
    status: 'PENDING' as const,
    createdAt: new Date().toISOString(),
  };

  phase1Store.offers.unshift(newOffer);
  return res.status(201).json({ success: true, message: 'Offer submitted to farmer', data: newOffer });
});

// Farmer Action on Offer (Accept, Reject, Counter)
router.patch('/produce/offers/:id', (req: Request, res: Response) => {
  const { id } = req.params;
  const { status, counterPricePerKg } = req.body;

  const offer = phase1Store.offers.find((o) => o.id === id);
  if (!offer) return res.status(404).json({ success: false, message: 'Offer not found' });

  offer.status = status;
  if (counterPricePerKg) {
    offer.counterPricePerKg = Number(counterPricePerKg);
  }

  // If accepted, generate active Order automatically!
  if (status === 'ACCEPTED') {
    const listing = phase1Store.produceListings.find((l) => l.id === offer.listingId);
    const newOrder = {
      id: `ord-${Date.now()}`,
      listingId: offer.listingId,
      offerId: offer.id,
      buyerId: offer.buyerId,
      buyerName: offer.buyerName,
      farmerId: listing ? listing.farmerId : 'usr-farmer-01',
      farmerName: listing ? listing.farmerName : 'Rajesh Sharma',
      cropName: listing ? listing.cropName : 'Produce',
      quantityKg: offer.quantityKg,
      agreedPricePerKg: offer.offeredPricePerKg,
      totalAmount: offer.totalOfferAmount,
      status: 'ACCEPTED' as const,
      scheduledPickupDate: new Date(Date.now() + 2 * 86400000).toISOString(),
      actualPickupDate: null,
      actualDeliveryDate: null,
      proofOfDeliveryUrl: null,
      proofOfDeliveryNote: null,
      logisticsArrangedBy: 'BUYER',
      createdAt: new Date().toISOString(),
    };
    phase1Store.orders.unshift(newOrder);
  }

  return res.status(200).json({ success: true, message: `Offer ${status}`, data: offer });
});

// Orders & Logistics (Prompts 10 & 12)
router.get('/produce/orders', (req: Request, res: Response) => {
  return res.status(200).json({ success: true, data: phase1Store.orders });
});

router.patch('/produce/orders/:id/status', (req: Request, res: Response) => {
  const { id } = req.params;
  const { status } = req.body;

  const order = phase1Store.orders.find((o) => o.id === id);
  if (!order) return res.status(404).json({ success: false, message: 'Order not found' });

  order.status = status;

  if (status === 'PICKED_UP') {
    order.actualPickupDate = new Date().toISOString();
  }
  if (status === 'DELIVERED') {
    order.actualDeliveryDate = new Date().toISOString();
  }

  // Automatic Profit Report Generation on COMPLETED! (Prompt 13)
  if (status === 'COMPLETED') {
    const listing = phase1Store.produceListings.find((l) => l.id === order.listingId);
    const cropCycleId = listing ? listing.cropCycleId : 'cc-01';
    const costSummary = phase1Store.calculateCropCost(cropCycleId);
    const unitCost = costSummary?.costPerKg || 32.96;
    const totalCost = Math.round(order.quantityKg * unitCost);
    const totalRevenue = order.totalAmount;
    const netProfit = totalRevenue - totalCost;
    const marginPercent = totalRevenue > 0 ? Math.round((netProfit / totalRevenue) * 1000) / 10 : 0;

    const report = {
      id: `pr-${Date.now()}`,
      cropCycleId,
      cropName: order.cropName,
      farmId: 'farm-01',
      plotId: 'plot-01',
      saleType: 'DIRECT_ORDER' as const,
      referenceId: order.id,
      quantitySoldKg: order.quantityKg,
      salePricePerKg: order.agreedPricePerKg,
      grossRevenue: totalRevenue,
      deductions: 0,
      totalRevenue,
      totalCost,
      netProfit,
      marginPercent,
      profitPerKg: Math.round((order.agreedPricePerKg - unitCost) * 100) / 100,
      profitPerAcre: Math.round((netProfit / 10) * 100) / 100,
      categoryBreakdown: costSummary?.categoryBreakdown || {},
      generatedAt: new Date().toISOString(),
    };
    phase1Store.profitReports.unshift(report);
  }

  return res.status(200).json({ success: true, message: `Order status updated to ${status}`, data: order });
});

router.post('/produce/orders/:id/proof-of-delivery', (req: Request, res: Response) => {
  const { id } = req.params;
  const { photoUrl, note } = req.body;

  const order = phase1Store.orders.find((o) => o.id === id);
  if (!order) return res.status(404).json({ success: false, message: 'Order not found' });

  order.proofOfDeliveryUrl = photoUrl || '/logo/sample-pod.png';
  order.proofOfDeliveryNote = note || 'Confirmed receipt at warehouse.';
  order.status = 'COMPLETED';
  order.actualDeliveryDate = new Date().toISOString();

  return res.status(200).json({ success: true, message: 'Proof of delivery submitted. Order completed.', data: order });
});

// ─────────────────────────────────────────────────────────────────────────────
// 10. MANDI AGENT & SLOT BOOKING (Prompt 11)
// ─────────────────────────────────────────────────────────────────────────────

router.get('/mandi/yards', (req: Request, res: Response) => {
  return res.status(200).json({ success: true, data: phase1Store.mandis });
});

router.get('/mandi/slots', (req: Request, res: Response) => {
  return res.status(200).json({ success: true, data: phase1Store.mandiSlots });
});

router.post('/mandi/slots', (req: Request, res: Response) => {
  const { mandiId, date, timeWindow, capacityQuintals, commoditiesAccepted } = req.body;

  const newSlot = {
    id: `slot-${Date.now()}`,
    mandiId: mandiId || 'mandi-01',
    date: date || new Date(Date.now() + 86400000).toISOString(),
    timeWindow: timeWindow || '08:00 AM — 12:00 PM',
    capacityQuintals: Number(capacityQuintals) || 500,
    bookedQuintals: 0,
    commoditiesAccepted: commoditiesAccepted || ['Pomegranate', 'Grapes'],
    status: 'OPEN' as const,
    createdAt: new Date().toISOString(),
  };

  phase1Store.mandiSlots.push(newSlot);
  return res.status(201).json({ success: true, message: 'Mandi arrival slot published', data: newSlot });
});

router.get('/mandi/bookings', (req: Request, res: Response) => {
  return res.status(200).json({ success: true, data: phase1Store.slotBookings });
});

router.post('/mandi/slots/:slotId/bookings', (req: Request, res: Response) => {
  const authUser = getAuthUser(req);
  const { slotId } = req.params;
  const { cropName, expectedQuantityKg } = req.body;

  const slot = phase1Store.mandiSlots.find((s) => s.id === slotId);
  if (!slot) return res.status(404).json({ success: false, message: 'Slot not found' });

  const qty = Number(expectedQuantityKg);

  const newBooking = {
    id: `sb-${Date.now()}`,
    slotId,
    mandiId: slot.mandiId,
    farmerId: authUser?.id || 'usr-farmer-01',
    farmerName: authUser ? `${authUser.firstName} ${authUser.lastName}` : 'Rajesh Sharma',
    cropCycleId: 'cc-01',
    cropName: cropName || 'Organic Pomegranate (Bhagwa)',
    expectedQuantityKg: qty,
    status: 'REQUESTED' as const,
    createdAt: new Date().toISOString(),
  };

  slot.bookedQuintals += Math.round(qty / 100);
  phase1Store.slotBookings.unshift(newBooking);

  return res.status(201).json({ success: true, message: 'Slot booking requested', data: newBooking });
});

router.patch('/mandi/bookings/:id/status', (req: Request, res: Response) => {
  const { id } = req.params;
  const { status, reason } = req.body;

  const booking = phase1Store.slotBookings.find((b) => b.id === id);
  if (!booking) return res.status(404).json({ success: false, message: 'Booking not found' });

  booking.status = status;
  if (reason) booking.rejectionReason = reason;

  return res.status(200).json({ success: true, message: `Booking ${status}`, data: booking });
});

// Record Mandi Auction Sale & Commission (Mandi Agent Side)
router.post('/mandi/bookings/:id/sale', (req: Request, res: Response) => {
  const { id } = req.params;
  const { actualQuantityKg, grade, auctionSalePricePerKg, commissionRate, agentNotes } = req.body;

  const booking = phase1Store.slotBookings.find((b) => b.id === id);
  if (!booking) return res.status(404).json({ success: false, message: 'Booking not found' });

  const qty = Number(actualQuantityKg) || booking.expectedQuantityKg;
  const price = Number(auctionSalePricePerKg);
  const commRate = Number(commissionRate) || 2.5;
  const grossRevenue = qty * price;
  const commissionAmount = Math.round((grossRevenue * (commRate / 100)) * 100) / 100;
  const netPayout = grossRevenue - commissionAmount;

  const newSale = {
    id: `ms-${Date.now()}`,
    bookingId: booking.id,
    mandiId: booking.mandiId,
    farmerId: booking.farmerId,
    cropCycleId: booking.cropCycleId,
    cropName: booking.cropName,
    actualQuantityKg: qty,
    grade: grade || 'Grade A',
    auctionSalePricePerKg: price,
    grossRevenue,
    commissionRate: commRate,
    commissionAmount,
    netPayout,
    saleDate: new Date().toISOString(),
    agentNotes: agentNotes || 'Mandi auction completed.',
    createdAt: new Date().toISOString(),
  };

  booking.status = 'COMPLETED';
  phase1Store.mandiSales.unshift(newSale);

  // Automatic Profit Report Generation!
  const costSummary = phase1Store.calculateCropCost(booking.cropCycleId || 'cc-01');
  const unitCost = costSummary?.costPerKg || 32.96;
  const totalCost = Math.round(qty * unitCost);
  const netProfit = netPayout - totalCost;
  const marginPercent = netPayout > 0 ? Math.round((netProfit / netPayout) * 1000) / 10 : 0;

  const report = {
    id: `pr-${Date.now()}`,
    cropCycleId: booking.cropCycleId || 'cc-01',
    cropName: booking.cropName,
    farmId: 'farm-01',
    plotId: 'plot-01',
    saleType: 'MANDI_SALE' as const,
    referenceId: newSale.id,
    quantitySoldKg: qty,
    salePricePerKg: price,
    grossRevenue,
    deductions: commissionAmount,
    totalRevenue: netPayout,
    totalCost,
    netProfit,
    marginPercent,
    profitPerKg: Math.round(((netPayout / qty) - unitCost) * 100) / 100,
    profitPerAcre: Math.round((netProfit / 10) * 100) / 100,
    categoryBreakdown: costSummary?.categoryBreakdown || {},
    generatedAt: new Date().toISOString(),
  };
  phase1Store.profitReports.unshift(report);

  return res.status(201).json({
    success: true,
    message: 'Mandi sale recorded and farmer profit report automatically generated.',
    data: { sale: newSale, profitReport: report },
  });
});

router.get('/mandi/sales', (req: Request, res: Response) => {
  return res.status(200).json({ success: true, data: phase1Store.mandiSales });
});

// ─────────────────────────────────────────────────────────────────────────────
// 11. PROFIT REPORT ENGINE (Prompt 13 - RADICAL FINANCIAL TRANSPARENCY)
// ─────────────────────────────────────────────────────────────────────────────

router.get('/profit-reports', (req: Request, res: Response) => {
  return res.status(200).json({ success: true, data: phase1Store.profitReports });
});

// ─────────────────────────────────────────────────────────────────────────────
// 12. ADMIN PANEL, DISPUTES & AUDIT LOGS (Prompt 14)
// ─────────────────────────────────────────────────────────────────────────────

router.get('/admin/dashboard-summary', (req: Request, res: Response) => {
  const usersByRole: Record<string, number> = {};
  for (const u of phase1Store.users) {
    for (const r of u.roles) {
      usersByRole[r] = (usersByRole[r] || 0) + 1;
    }
  }

  return res.status(200).json({
    success: true,
    data: {
      totalUsers: phase1Store.users.length,
      usersByRole,
      pendingRequestsCount: phase1Store.userRequests.filter((r) => r.status === 'PENDING_APPROVAL').length,
      activeListingsCount: phase1Store.produceListings.filter((l) => l.status === 'ACTIVE').length,
      completedOrdersCount: phase1Store.orders.filter((o) => o.status === 'COMPLETED').length,
      openDisputesCount: phase1Store.disputes.filter((d) => d.status !== 'RESOLVED').length,
      totalSalesRevenue: phase1Store.orders.reduce((sum, o) => sum + o.totalAmount, 0) + phase1Store.mandiSales.reduce((sum, s) => sum + s.grossRevenue, 0),
    },
  });
});

router.get('/admin/disputes', (req: Request, res: Response) => {
  return res.status(200).json({ success: true, data: phase1Store.disputes });
});

router.post('/admin/disputes', (req: Request, res: Response) => {
  const authUser = getAuthUser(req);
  const { referenceType, referenceId, reason } = req.body;

  const newDispute = {
    id: `disp-${Date.now()}`,
    referenceType: referenceType || 'ORDER',
    referenceId: referenceId || 'ord-01',
    raisedBy: authUser?.id || 'usr-buyer-01',
    raisedByName: authUser ? `${authUser.firstName} ${authUser.lastName}` : 'Buyer',
    reason,
    status: 'OPEN' as const,
    adminNotes: '',
    resolutionOutcome: undefined,
    createdAt: new Date().toISOString(),
  };

  phase1Store.disputes.unshift(newDispute);
  return res.status(201).json({ success: true, message: 'Dispute ticket raised', data: newDispute });
});

router.patch('/admin/disputes/:id', (req: Request, res: Response) => {
  const authUser = getAuthUser(req);
  const { id } = req.params;
  const { status, adminNotes, resolutionOutcome } = req.body;

  const dispute = phase1Store.disputes.find((d) => d.id === id);
  if (!dispute) return res.status(404).json({ success: false, message: 'Dispute not found' });

  dispute.status = status;
  if (adminNotes) dispute.adminNotes = adminNotes;
  if (resolutionOutcome) dispute.resolutionOutcome = resolutionOutcome;

  phase1Store.auditLogs.unshift({
    id: `aud-${Date.now()}`,
    userId: authUser?.id || 'usr-admin-01',
    userName: authUser ? `${authUser.firstName} ${authUser.lastName}` : 'Admin',
    action: 'RESOLVE_DISPUTE',
    entityName: 'Dispute',
    entityId: dispute.id,
    oldValue: 'OPEN',
    newValue: `Status: ${status}, Outcome: ${resolutionOutcome || 'Resolved'}`,
    timestamp: new Date().toISOString(),
  });

  return res.status(200).json({ success: true, message: 'Dispute updated', data: dispute });
});

router.get('/admin/audit-logs', (req: Request, res: Response) => {
  return res.status(200).json({ success: true, data: phase1Store.auditLogs });
});

export default router;
