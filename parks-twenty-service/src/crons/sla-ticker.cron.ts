import cron from 'node-cron';

import { envConfig } from '../config/env.config';
import { semaforoService } from '../services/semaforo.service';
import { slaService } from '../services/sla.service';

export const registerSlaTickerCron = (): void => {
  cron.schedule(envConfig.cronSlaTicker, async () => {
    console.log('[cron] SLA ticker — starting');

    try {
      await slaService.recalculateAll();
      await semaforoService.updateAll();
      console.log('[cron] SLA ticker — completed');
    } catch (error) {
      const message = error instanceof Error ? error.message : String(error);
      console.error('[cron] SLA ticker — error:', message);
    }
  });
};
