import { Router } from 'express';
import modulesRouter from '../modules/index.js';

const apiRouter = Router();

apiRouter.use('/v1', modulesRouter);

export default apiRouter;
