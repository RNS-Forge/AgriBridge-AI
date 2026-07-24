import { UserPayload } from '@agribridge/shared';

declare global {
  namespace Express {
    interface Request {
      user?: UserPayload;
      tenantId?: string;
    }
  }
}
