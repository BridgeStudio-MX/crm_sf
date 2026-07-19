import dotenv from 'dotenv';

import { migrateBrokersToEmpresasService } from '../src/seed/migrate-brokers-to-empresas.service';

dotenv.config();

const main = async (): Promise<void> => {
  try {
    await migrateBrokersToEmpresasService.run();
  } catch (error) {
    const message = error instanceof Error ? error.message : String(error);
    console.error('[migrate:brokers-to-empresas] Failed:', message);
    process.exit(1);
  }
};

main();
