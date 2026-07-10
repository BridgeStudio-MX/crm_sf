import dotenv from 'dotenv';

import { inviteParksDemoUsers } from '../src/metadata/invite-parks-demo-users';

dotenv.config();

const main = async (): Promise<void> => {
  try {
    await inviteParksDemoUsers();
  } catch (error) {
    const message = error instanceof Error ? error.message : String(error);
    console.error('[setup:demo-users] Failed:', message);
    process.exit(1);
  }
};

main();
