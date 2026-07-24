export class BaseService {
  protected logInfo(message: string) {
    console.log(`[Service Info]: ${message}`);
  }

  protected logError(message: string) {
    console.error(`[Service Error]: ${message}`);
  }
}

export { AuditLogService } from './audit.service.js';
export { emailService } from './email.service.js';
