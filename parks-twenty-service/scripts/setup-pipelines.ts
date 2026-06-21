import dotenv from 'dotenv';

import { setupParksPipelines } from '../src/metadata/setup-parks-pipelines';

dotenv.config();

const main = async (): Promise<void> => {
  try {
    await setupParksPipelines();
  } catch (error) {
    const message = error instanceof Error ? error.message : String(error);
    console.error('[setup:pipelines] Failed:', message);
    process.exit(1);
  }
};

main();
