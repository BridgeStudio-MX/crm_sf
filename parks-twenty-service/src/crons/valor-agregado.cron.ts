import cron from 'node-cron';

import { envConfig } from '../config/env.config';
import { valorAgregadoService } from '../services/valor-agregado.service';

export const registerValorAgregadoCron = (): void => {
  cron.schedule(envConfig.cronValorAgregadoDaily, async () => {
    console.log('[cron] Valor agregado daily — starting');

    try {
      const result = await valorAgregadoService.runDailyJobs();
      console.log('[cron] Valor agregado daily — completed', result);
    } catch (error) {
      const message = error instanceof Error ? error.message : String(error);
      console.error('[cron] Valor agregado daily — error:', message);
    }
  });

  cron.schedule(envConfig.cronValorAgregadoWeekly, async () => {
    console.log('[cron] Valor agregado weekly — starting');

    try {
      const result = await valorAgregadoService.runWeeklyJobs();
      console.log('[cron] Valor agregado weekly — completed', result);
    } catch (error) {
      const message = error instanceof Error ? error.message : String(error);
      console.error('[cron] Valor agregado weekly — error:', message);
    }
  });

  cron.schedule(envConfig.cronValorAgregadoMonthly, async () => {
    console.log('[cron] Valor agregado monthly — starting');

    try {
      const result = await valorAgregadoService.runMonthlyJobs();
      console.log('[cron] Valor agregado monthly — completed', result);
    } catch (error) {
      const message = error instanceof Error ? error.message : String(error);
      console.error('[cron] Valor agregado monthly — error:', message);
    }
  });
};
