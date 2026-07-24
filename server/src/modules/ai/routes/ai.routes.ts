import { Router } from 'express';
import { AiController } from '../controller/ai.controller.js';
import { authenticate } from '../../auth/middleware/index.js';

const router = Router();
const controller = new AiController();

router.use(authenticate);

// Main chat streaming assistant route
router.post('/chat', controller.streamChat);

export default router;
