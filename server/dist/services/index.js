export class BaseService {
    logInfo(message) {
        console.log(`[Service Info]: ${message}`);
    }
    logError(message) {
        console.error(`[Service Error]: ${message}`);
    }
}
