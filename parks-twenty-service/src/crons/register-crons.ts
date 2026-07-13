import { registerHoldoverScannerCron } from './holdover-scanner.cron';
import { registerLegalReportCron } from './legal-report.cron';
import { registerOracleSyncCron } from './oracle-sync.cron';
import { registerRenovacionAlertsCron } from './renovacion-alerts.cron';
import { registerSlaTickerCron } from './sla-ticker.cron';
import { registerVersionFollowUpCron } from './version-follow-up.cron';

export const registerCrons = (): void => {
  registerSlaTickerCron();
  registerHoldoverScannerCron();
  registerRenovacionAlertsCron();
  registerOracleSyncCron();
  registerLegalReportCron();
  registerVersionFollowUpCron();
  console.log('[crons] Registered');
};
