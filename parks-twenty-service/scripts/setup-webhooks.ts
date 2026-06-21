import dotenv from 'dotenv';

import { setupParksWebhooks } from '../src/metadata/setup-parks-webhooks';

dotenv.config();

const main = async (): Promise<void> => {
  try {
    await setupParksWebhooks();
  } catch (error) {
    const message = error instanceof Error ? error.message : String(error);
    console.error('[setup:webhooks] Failed:', message);
    process.exit(1);
  }
};

main();
