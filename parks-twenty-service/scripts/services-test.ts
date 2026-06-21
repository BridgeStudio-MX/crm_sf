import { calcularSemaforo } from '../src/services/semaforo.service';
import { slaService } from '../src/services/sla.service';
import { twentyClient } from '../src/services/twenty.client';
import {
  addBusinessDays,
  countBusinessDaysBetween,
  isBusinessDay,
} from '../src/utils/business-days.util';
import { toSelectValue } from '../src/utils/select-value.util';

const main = async (): Promise<void> => {
  console.log('[services:test] Business days utilities');
  const startDate = new Date('2026-06-01');
  const limitDate = addBusinessDays(startDate, 5);
  console.log('  addBusinessDays(2026-06-01, 5) =', limitDate.toISOString().slice(0, 10));
  console.log(
    '  countBusinessDaysBetween =',
    countBusinessDaysBetween(startDate, new Date('2026-06-10')),
  );
  console.log('  isBusinessDay(Saturday) =', isBusinessDay(new Date('2026-06-06')));

  console.log('[services:test] Select value mapping');
  console.log('  Firmado — cerrado =>', toSelectValue('Firmado — cerrado'));
  console.log('  En holdover =>', toSelectValue('En holdover'));

  console.log('[services:test] Semáforo sample cases');
  const sampleCases = [
    {
      id: '1',
      estatus: toSelectValue('Nuevo'),
      diasTranscurridos: 10,
      slaDiasHabiles: 60,
      holdoverActivo: false,
      clienteNoRenueva: false,
    },
    {
      id: '2',
      estatus: toSelectValue('En elaboración'),
      diasTranscurridos: 50,
      slaDiasHabiles: 60,
      holdoverActivo: false,
      clienteNoRenueva: false,
    },
    {
      id: '3',
      estatus: toSelectValue('Firmado — cerrado'),
      diasTranscurridos: 60,
      slaDiasHabiles: 60,
      holdoverActivo: false,
      clienteNoRenueva: false,
    },
  ];

  for (const sampleCase of sampleCases) {
    console.log(`  caso ${sampleCase.id}:`, calcularSemaforo(sampleCase));
  }

  console.log('[services:test] SLA resolver');
  console.log('  Contrato nuevo =>', slaService.resolveSlaDiasHabiles('Contrato nuevo'));
  console.log(
    '  Convenio renovación =>',
    slaService.resolveSlaDiasHabiles('Convenio renovación'),
  );

  console.log('[services:test] Twenty API ping');
  const isConnected = await twentyClient.ping();
  console.log('  connected =', isConnected);

  if (isConnected) {
    await slaService.recalculateAll();
  } else {
    console.log('  (Skipping live SLA recalc — Twenty API unavailable)');
  }

  console.log('[services:test] Done');
};

main().catch((error) => {
  const message = error instanceof Error ? error.message : String(error);
  console.error('[services:test] Failed:', message);
  process.exit(1);
});
