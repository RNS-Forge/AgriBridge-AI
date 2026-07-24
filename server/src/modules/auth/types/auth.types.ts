import { Request } from 'express';

export interface JwtPayload {
  userId: string;
  tenantId: string | null;
  email: string;
  roles: string[];
}

export interface AuthRequest extends Omit<Request, 'user'> {
  user?: JwtPayload;
}
