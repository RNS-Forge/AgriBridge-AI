import { Router } from 'express';
import authRouter from './auth/routes/auth.routes.js';
import farmerRouter from './farmer/routes/farmer.routes.js';
import farmRouter from './farm/routes/farm.routes.js';
import cropRouter from './crop/routes/crop.routes.js';
import batchRouter from './batch/routes/batch.routes.js';
import mandiRouter from './mandi/routes/mandi.routes.js';
import fpoRouter from './fpo/routes/fpo.routes.js';
import marketplaceRouter from './marketplace/routes/marketplace.routes.js';
import exportRouter from './export/routes/export.routes.js';
import aiRouter from './ai/routes/ai.routes.js';
import superadminRouter from './superadmin/routes/superadmin.routes.js';

const modulesRouter = Router();

modulesRouter.use('/auth', authRouter);
modulesRouter.use('/farmer', farmerRouter);
modulesRouter.use('/farm', farmRouter);
modulesRouter.use('/crop', cropRouter);
modulesRouter.use('/batch', batchRouter);
modulesRouter.use('/mandi', mandiRouter);
modulesRouter.use('/fpo', fpoRouter);
modulesRouter.use('/marketplace', marketplaceRouter);
modulesRouter.use('/export', exportRouter);
modulesRouter.use('/ai', aiRouter);
modulesRouter.use('/superadmin', superadminRouter);

export default modulesRouter;
