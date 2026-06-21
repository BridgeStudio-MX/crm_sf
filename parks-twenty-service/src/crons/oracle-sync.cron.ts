import cron from 'node-cron';

import { envConfig } from '../config/env.config';
import { notificacionService } from '../services/notificacion.service';
import { oracleService } from '../services/oracle.service';

export const registerOracleSyncCron = (): void => {
  cron.schedule(envConfig.cronOracleSync, async () => {
    console.log('[cron] Oracle sync — starting');

    try {
      await oracleService.syncAll();
      console.log('[cron] Oracle sync — completed');
    } catch (error) {
      const message = error instanceof Error ? error.message : String(error);
      console.error('[cron] Oracle sync — error:', message);
      await notificacionService.notifyArea(
        'Operaciones',
        `Error en sincronización Oracle: ${message}`,
      );
    }
  });
};
