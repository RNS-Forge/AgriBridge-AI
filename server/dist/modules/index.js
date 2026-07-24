import { Router } from 'express';
import authRouter from './auth/routes/auth.routes.js';
const modulesRouter = Router();
modulesRouter.use('/auth', authRouter);
export default modulesRouter;
