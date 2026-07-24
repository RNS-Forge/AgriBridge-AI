import { Request, Response, NextFunction } from 'express';
import { AuthRequest } from '../types/auth.types.js';

export function tenantAware(req: Request, res: Response, next: NextFunction) {
  const authReq = req as AuthRequest;
  // Try to get tenantId from headers, query parameters, or route parameters
  const headerTenantId = authReq.headers['x-tenant-id'] as string;
  const queryTenantId = authReq.query.tenantId as string;
  const paramTenantId = authReq.params.tenantId as string;

  const tenantId = headerTenantId || queryTenantId || paramTenantId;

  if (!tenantId) {
    return res.status(400).json({
      success: false,
      message: 'Tenant identity is required. Provide X-Tenant-ID header, tenantId query parameter, or route parameter.',
    });
  }

  // If user is authenticated, verify tenant mismatch
  if (authReq.user) {
    // SuperAdmin or system-wide roles can bypass tenant restriction if they need to access cross-tenant resources.
    const isSuperAdmin = authReq.user.roles.includes('SuperAdmin');
    if (!isSuperAdmin && authReq.user.tenantId && authReq.user.tenantId !== tenantId) {
      return res.status(403).json({
        success: false,
        message: 'Forbidden. Access to this tenant space is denied.',
      });
    }
  }

  authReq.tenantId = tenantId;
  next();
}
