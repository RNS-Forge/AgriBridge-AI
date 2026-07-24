import { Request, Response, NextFunction } from 'express';
import { AuthRequest } from '../types/auth.types.js';

export function authorize(allowedRoles: string[]) {
  return (req: Request, res: Response, next: NextFunction) => {
    const authReq = req as AuthRequest;
    if (!authReq.user) {
      return res.status(401).json({
        success: false,
        message: 'Unauthorized. Authentication is required.',
      });
    }

    // Admin Override: SuperAdmin can bypass any role check
    const isSuperAdmin = authReq.user.roles.includes('SuperAdmin');
    if (isSuperAdmin) {
      return next();
    }

    const hasRole = authReq.user.roles.some((role) => allowedRoles.includes(role));
    if (!hasRole) {
      return res.status(403).json({
        success: false,
        message: `Forbidden. You do not have permission to access this resource. Allowed roles: ${allowedRoles.join(', ')}`,
      });
    }

    next();
  };
}
