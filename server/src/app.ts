import express from 'express';
import cors from 'cors';
import helmet from 'helmet';
import swaggerUi from 'swagger-ui-express';
import { readFileSync } from 'fs';
import { join, dirname } from 'path';
import { fileURLToPath } from 'url';

import apiRouter from './routes/index.js';
import { errorHandler } from './middlewares/index.js';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);
const swaggerDocument = JSON.parse(
  readFileSync(join(__dirname, '../swagger.json'), 'utf8')
);

const app = express();

app.use(helmet({
  contentSecurityPolicy: false, // Turn off CSP headers for Swagger UI static scripts execution
}));
app.use(cors());
app.use(express.json());

app.use('/api-docs', swaggerUi.serve, swaggerUi.setup(swaggerDocument));
app.use('/api', apiRouter);

app.get('/health', (req, res) => {
  res.json({ status: 'OK', service: 'AgriBridge API' });
});

app.use(errorHandler);

export default app;
