import dotenv from 'dotenv';

import { demoSeedService } from '../src/seed/demo-seed.service';

dotenv.config();

const main = async (): Promise<void> => {
  const force = process.env.FORCE_DEMO_SEED === 'true';

  try {
    await demoSeedService.run({ force });
  } catch (error) {
    const message = error instanceof Error ? error.message : String(error);
    console.error('[seed:demo] Failed:', message);
    process.exit(1);
  }
};

main();
