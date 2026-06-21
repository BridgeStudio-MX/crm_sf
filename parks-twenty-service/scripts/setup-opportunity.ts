import dotenv from 'dotenv';

import { setupOpportunityExtensions } from '../src/metadata/setup-opportunity-extensions';

dotenv.config();

const main = async (): Promise<void> => {
  try {
    await setupOpportunityExtensions();
  } catch (error) {
    const message = error instanceof Error ? error.message : String(error);
    console.error('[setup:opportunity] Failed:', message);
    process.exit(1);
  }
};

main();
