import dotenv from 'dotenv';

import { demoSeedService } from '../src/seed/demo-seed.service';

dotenv.config();

const main = async (): Promise<void> => {
  try {
    const casoCount = await demoSeedService.seedDemoChecklists();
    console.log(`[seed:checklists] Done — ${casoCount} casos procesados`);
  } catch (error) {
    const message = error instanceof Error ? error.message : String(error);
    console.error('[seed:checklists] Failed:', message);
    process.exit(1);
  }
};

main();
