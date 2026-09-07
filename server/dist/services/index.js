export class BaseService {
    logInfo(message) {
        console.log(`[Service Info]: ${message}`);
    }
    logError(message) {
        console.error(`[Service Error]: ${message}`);
    }
}
export { AuditLogService } from './audit.service.js';
export { emailService } from './email.service.js';
