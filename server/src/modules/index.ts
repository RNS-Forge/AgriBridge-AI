import { Router } from 'express';
import phase1Router from './phase1/phase1.routes.js';
import authRouter from './auth/routes/auth.routes.js';

const modulesRouter = Router();

// Mount Phase 1 Engine (Handles all Prompts 1-16 + Role Auth + Admin Maker + Cost Engine)
modulesRouter.use('/', phase1Router);

// Mount fallback auth routes
modulesRouter.use('/auth', authRouter);

export default modulesRouter;
