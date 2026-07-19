import dotenv from 'dotenv';

import { seedBrokersMockService } from '../src/seed/seed-brokers-mock.service';

dotenv.config();

const main = async (): Promise<void> => {
  console.log(
    '[seed:brokers-mock] Cargando empresas, brokers y comisiones mock…',
  );

  try {
    const result = await seedBrokersMockService.run();

    console.log(
      `[seed:brokers-mock] Listo — empresas +${result.empresasCreated} (skip ${result.skippedEmpresas}) · brokers +${result.brokersCreated} (skip ${result.skippedBrokers}) · comisiones +${result.comisionesCreated}`,
    );
  } catch (error) {
    const message = error instanceof Error ? error.message : String(error);
    console.error('[seed:brokers-mock] Failed:', message);
    process.exit(1);
  }
};

main();
