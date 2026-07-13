import cron from 'node-cron';

import { versionFollowUpService } from '../services/version-follow-up.service';

export const registerVersionFollowUpCron = (): void => {
  cron.schedule('0 9 * * 1-5', async () => {
    try {
      await versionFollowUpService.scanPendingResponses();
    } catch (error) {
      console.error('[version-follow-up.cron] Failed:', error);
    }
  });
};
