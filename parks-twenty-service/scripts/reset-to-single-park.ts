import dotenv from 'dotenv';

import { resetToSingleParkService } from '../src/seed/reset-to-single-park.service';

dotenv.config();

const main = async (): Promise<void> => {
  try {
    await resetToSingleParkService.run();
  } catch (error) {
    const message = error instanceof Error ? error.message : String(error);
    console.error('[reset:single-park] Failed:', message);
    process.exit(1);
  }
};

main();
