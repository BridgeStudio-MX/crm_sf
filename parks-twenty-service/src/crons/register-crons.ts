import { registerHoldoverScannerCron } from './holdover-scanner.cron';
import { registerOracleSyncCron } from './oracle-sync.cron';
import { registerRenovacionAlertsCron } from './renovacion-alerts.cron';
import { registerSlaTickerCron } from './sla-ticker.cron';

export const registerCrons = (): void => {
  registerSlaTickerCron();
  registerHoldoverScannerCron();
  registerRenovacionAlertsCron();
  registerOracleSyncCron();
  console.log('[crons] Registered');
};
