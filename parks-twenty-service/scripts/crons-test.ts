import { isExactlyMonthsBeforeExpiry } from '../src/utils/date-months.util';
import { renovacionService } from '../src/services/renovacion.service';
import { twentyClient } from '../src/services/twenty.client';

const main = async (): Promise<void> => {
  console.log('[crons:test] Date threshold checks');
  console.log(
    '  12m alert for 2027-06-20 on 2026-06-20:',
    isExactlyMonthsBeforeExpiry('2027-06-20', 12, '2026-06-20'),
  );
  console.log(
    '  12m alert for 2027-06-20 on 2026-06-21:',
    isExactlyMonthsBeforeExpiry('2027-06-20', 12, '2026-06-21'),
  );

  console.log('[crons:test] Twenty API ping');
  const isConnected = await twentyClient.ping();
  console.log('  connected =', isConnected);

  if (isConnected) {
    console.log('[crons:test] Running renovacion daily alerts...');
    await renovacionService.runDailyAlerts();
  } else {
    console.log('  (Skipping live renovacion scan — Twenty API unavailable)');
  }

  console.log('[crons:test] Done');
};

main().catch((error) => {
  const message = error instanceof Error ? error.message : String(error);
  console.error('[crons:test] Failed:', message);
  process.exit(1);
});
