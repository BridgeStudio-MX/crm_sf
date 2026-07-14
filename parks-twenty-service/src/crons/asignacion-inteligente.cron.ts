import cron from 'node-cron';

import { envConfig } from '../config/env.config';
import { asignacionInteligenteService } from '../services/asignacion-inteligente.service';

export const registerAsignacionInteligenteCron = (): void => {
  cron.schedule(envConfig.cronAsignacionEscalation, async () => {
    console.log('[cron] Asignación inteligente escalation — starting');

    try {
      const result = await asignacionInteligenteService.runEscalationScan();
      console.log(
        '[cron] Asignación inteligente escalation — completed',
        result,
      );
    } catch (error) {
      const message = error instanceof Error ? error.message : String(error);
      console.error(
        '[cron] Asignación inteligente escalation — error:',
        message,
      );
    }
  });
};
