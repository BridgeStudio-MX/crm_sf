import dotenv from 'dotenv';

import { demoScenariosService } from '../src/seed/demo-scenarios.service';

dotenv.config();

const main = async (): Promise<void> => {
  try {
    const result = await demoScenariosService.run();

    console.log('\n=== Escenarios listos para screenshots ===\n');
    for (const lead of result.leads) {
      console.log(
        `${lead.folio.padEnd(16)} | ${lead.stage.padEnd(28)} | ${lead.empresa.padEnd(24)} | ${lead.screenshotNote}`,
      );
    }
    console.log('');
  } catch (error) {
    const message = error instanceof Error ? error.message : String(error);
    console.error('[seed:scenarios] Failed:', message);
    process.exit(1);
  }
};

main();
