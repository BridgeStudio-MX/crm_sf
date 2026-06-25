import dotenv from 'dotenv';

import { assignParksDemoRoles } from '../src/metadata/assign-parks-demo-roles';

dotenv.config();

const main = async (): Promise<void> => {
  try {
    await assignParksDemoRoles();
  } catch (error) {
    const message = error instanceof Error ? error.message : String(error);
    console.error('[setup:assign-roles] Failed:', message);
    process.exit(1);
  }
};

main();
