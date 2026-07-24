import { MandiService } from '../service/mandi.service.js';

export class MandiJobs {
  private static mandiService = new MandiService();
  private static intervalId: NodeJS.Timeout | null = null;

  /**
   * Start a simulated background job runner.
   * Runs the Agmarknet Sync every 24 hours (simulated daily update cron).
   */
  static startScheduler() {
    if (this.intervalId) return;

    console.log('[Mandi Background Worker] Initialized Agmarknet Sync daily cron schedule.');
    
    // Run immediately on boot to ensure fresh sync data
    this.runSyncTask();

    // Schedule every 24 hours
    const twentyFourHoursMs = 24 * 60 * 60 * 1000;
    this.intervalId = setInterval(() => {
      this.runSyncTask();
    }, twentyFourHoursMs);
  }

  static stopScheduler() {
    if (this.intervalId) {
      clearInterval(this.intervalId);
      this.intervalId = null;
      console.log('[Mandi Background Worker] Stopped Agmarknet Sync worker.');
    }
  }

  private static async runSyncTask() {
    try {
      console.log('[Mandi Background Worker] Starting scheduled Agmarknet Daily Price Sync...');
      const result = await this.mandiService.syncAgmarknetData('background-worker');
      console.log(`[Mandi Background Worker] Completed Agmarknet Sync. Synced ${result.syncedCount} market price entries.`);
    } catch (error) {
      console.error('[Mandi Background Worker] Error during scheduled sync execution:', error);
    }
  }
}
