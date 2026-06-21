import cron from 'node-cron';

import { envConfig } from '../config/env.config';
import { holdoverService } from '../services/holdover.service';

export const registerHoldoverScannerCron = (): void => {
  cron.schedule(envConfig.cronHoldoverScanner, async () => {
    console.log('[cron] Holdover scanner — starting');

    try {
      await holdoverService.scanExpiringContracts();
      console.log('[cron] Holdover scanner — completed');
    } catch (error) {
      const message = error instanceof Error ? error.message : String(error);
      console.error('[cron] Holdover scanner — error:', message);
    }
  });
};
