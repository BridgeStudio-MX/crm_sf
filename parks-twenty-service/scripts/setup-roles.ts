import dotenv from 'dotenv';

import { setupParksRoles } from '../src/metadata/setup-parks-roles';

dotenv.config();

const main = async (): Promise<void> => {
  try {
    await setupParksRoles();
  } catch (error) {
    const message = error instanceof Error ? error.message : String(error);
    console.error('[setup:roles] Failed:', message);
    process.exit(1);
  }
};

main();
