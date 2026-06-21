import { calcularSemaforo } from '../src/services/semaforo.service';
import {
  mapWebhookRecordToCasoLegal,
  parseTwentyWebhook,
  wasFieldUpdated,
} from '../src/webhooks/webhook-payload.util';
import { toSelectValue } from '../src/utils/select-value.util';

const sampleCasoLegalCreatedPayload = {
  eventName: 'casoLegal.created',
  objectMetadata: { id: 'meta-id', nameSingular: 'casoLegal' },
  record: {
    id: 'caso-legal-test-001',
    referencia: 'Test — Contrato nuevo',
    tipoDocumento: toSelectValue('Contrato nuevo'),
    estatus: toSelectValue('Nuevo'),
    fechaHojaAcuerdos: '2026-06-01',
    slaDiasHabiles: 60,
    diasTranscurridos: 0,
    documentacionCompleta: false,
  },
};

const sampleCasoLegalUpdatedPayload = {
  eventName: 'casoLegal.updated',
  objectMetadata: { id: 'meta-id', nameSingular: 'casoLegal' },
  updatedFields: ['documentacionCompleta', 'estatus'],
  record: {
    id: 'caso-legal-test-001',
    referencia: 'Test — Contrato nuevo',
    estatus: toSelectValue('En elaboración'),
    documentacionCompleta: true,
    slaDiasHabiles: 60,
    diasTranscurridos: 3,
  },
};

const main = (): void => {
  console.log('[webhook:test] Parsing created payload');
  const created = parseTwentyWebhook(sampleCasoLegalCreatedPayload);
  console.log('  action:', created?.action);
  console.log('  object:', created?.objectNameSingular);
  console.log('  recordId:', created?.recordId);

  const casoLegal = mapWebhookRecordToCasoLegal(
    sampleCasoLegalCreatedPayload.record,
  );
  console.log('  semáforo:', calcularSemaforo(casoLegal));

  console.log('[webhook:test] Parsing updated payload');
  const updated = parseTwentyWebhook(sampleCasoLegalUpdatedPayload);
  console.log('  updatedFields:', updated?.updatedFields);
  console.log(
    '  documentacionCompleta changed:',
    updated ? wasFieldUpdated(updated, 'documentacionCompleta') : false,
  );

  console.log('[webhook:test] Done (offline parsing only)');
};

main();
