import { Request, Response, NextFunction } from 'express';
import { AuthRequest } from '../types/auth.types.js';
import { AuthRepository } from '../repository/auth.repository.js';
import { redis } from '../service/auth.service.js';

const authRepository = new AuthRepository();

/**
 * Middleware to require a specific permission for the endpoint.
 * Supports Admin Override (SuperAdmin bypasses all permission checks).
 * Scalable implementation utilizes Redis caching for user permissions.
 */
export function checkPermission(requiredPermission: string) {
  return async (req: Request, res: Response, next: NextFunction) => {
    const authReq = req as AuthRequest;
    if (!authReq.user) {
      return res.status(401).json({
        success: false,
        message: 'Unauthorized. Authentication is required.',
      });
    }

    // 1. Admin Override
    const isSuperAdmin = authReq.user.roles.includes('SuperAdmin');
    if (isSuperAdmin) {
      return next();
    }

    // 2. Fetch user permissions (with Redis caching for high scalability)
    const cacheKey = `user:permissions:${authReq.user.userId}`;
    let userPermissions: string[] = [];

    try {
      const cached = await redis.get(cacheKey);
      if (cached) {
        userPermissions = JSON.parse(cached);
      } else {
        userPermissions = await authRepository.getUserPermissions(authReq.user.userId);
        await redis.set(cacheKey, JSON.stringify(userPermissions), 'EX', 300); // Cache for 5 mins
      }
    } catch (err) {
      // Fallback directly to DB if Redis/cache fails
      userPermissions = await authRepository.getUserPermissions(authReq.user.userId);
    }

    const hasPermission = userPermissions.includes(requiredPermission);
    if (!hasPermission) {
      return res.status(403).json({
        success: false,
        message: `Forbidden. You do not have the required permission: ${requiredPermission}`,
      });
    }

    next();
  };
}
