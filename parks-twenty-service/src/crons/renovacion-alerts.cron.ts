import cron from 'node-cron';

import { envConfig } from '../config/env.config';
import { renovacionService } from '../services/renovacion.service';

export const registerRenovacionAlertsCron = (): void => {
  cron.schedule(envConfig.cronRenovacionAlerts, async () => {
    console.log('[cron] Renovacion alerts — starting');

    try {
      await renovacionService.runDailyAlerts();
      console.log('[cron] Renovacion alerts — completed');
    } catch (error) {
      const message = error instanceof Error ? error.message : String(error);
      console.error('[cron] Renovacion alerts — error:', message);
    }
  });
};
