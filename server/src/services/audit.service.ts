import { db } from '../database/index.js';
import { auditLogs } from '../db/schema.js';

export interface AuditLogPayload {
  userId?: string | null;
  tenantId?: string | null;
  action: string;
  entityName: string;
  entityId: string;
  changes?: any;
  ipAddress?: string;
}

export class AuditLogService {
  /**
   * Log an audit event asynchronously (non-blocking) to optimize database transactions
   * and ensure maximum API performance.
   */
  static log(payload: AuditLogPayload): void {
    const data = {
      userId: payload.userId || null,
      tenantId: payload.tenantId || null,
      action: payload.action,
      entityName: payload.entityName,
      entityId: payload.entityId,
      changes: payload.changes ? JSON.stringify(payload.changes) : null,
      ipAddress: payload.ipAddress || null,
    };

    db.insert(auditLogs)
      .values(data)
      .then(() => {
        // Success
      })
      .catch((err) => {
        // Fail-safe: Log error locally. Do not let auditing crash main business transactions.
        console.error('[Audit Logging Failure]:', err, 'Data:', data);
      });
  }
}
