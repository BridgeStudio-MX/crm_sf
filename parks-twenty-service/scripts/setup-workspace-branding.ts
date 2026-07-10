import dotenv from 'dotenv';

import { setupParksWorkspaceBranding } from '../src/metadata/setup-parks-workspace-branding';

dotenv.config();

const main = async (): Promise<void> => {
  try {
    await setupParksWorkspaceBranding();
  } catch (error) {
    const message = error instanceof Error ? error.message : String(error);
    console.error('[setup:workspace-branding] Failed:', message);
    process.exit(1);
  }
};

main();
