import dotenv from 'dotenv';

import { setupParksObjects } from '../src/metadata/setup-parks-objects';

dotenv.config();

const main = async (): Promise<void> => {
  try {
    await setupParksObjects();
  } catch (error) {
    const message = error instanceof Error ? error.message : String(error);
    console.error('[setup:objects] Failed:', message);
    process.exit(1);
  }
};

main();
