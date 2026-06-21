import dotenv from 'dotenv';

import { setupParksDashboards } from '../src/metadata/setup-parks-dashboards';

dotenv.config();

const main = async (): Promise<void> => {
  try {
    await setupParksDashboards();
  } catch (error) {
    const message = error instanceof Error ? error.message : String(error);
    console.error('[setup:dashboards] Failed:', message);
    process.exit(1);
  }
};

main();
