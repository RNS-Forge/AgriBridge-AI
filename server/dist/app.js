import express from 'express';
import cors from 'cors';
import helmet from 'helmet';
import apiRouter from './routes/index.js';
import { errorHandler } from './middlewares/index.js';
const app = express();
app.use(helmet());
app.use(cors());
app.use(express.json());
app.use('/api', apiRouter);
app.get('/health', (req, res) => {
    res.json({ status: 'OK', service: 'AgriBridge API' });
});
app.use(errorHandler);
export default app;
