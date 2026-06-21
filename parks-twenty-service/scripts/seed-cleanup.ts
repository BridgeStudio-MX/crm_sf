import dotenv from 'dotenv';

import { demoCleanupService } from '../src/seed/demo-cleanup.service';

dotenv.config();

const main = async (): Promise<void> => {
  try {
    await demoCleanupService.clearAll();
  } catch (error) {
    const message = error instanceof Error ? error.message : String(error);
    console.error('[seed:cleanup] Failed:', message);
    process.exit(1);
  }
};

main();
