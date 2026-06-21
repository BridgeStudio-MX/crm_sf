import { oracleService } from '../src/services/oracle.service';

const demoExpediente = {
  id: 'expediente-demo-001',
  numeroExpediente: 'EXP-2026-001',
  fechaVencimiento: '2028-06-01',
  rentaMensualUsd: 12500,
  oracleContratoId: 'ORC-CON-001',
  nave: {
    oracleNaveId: 'ORC-NAV-GDL-001',
    identificador: 'NVA-GDL-001',
  },
  inquilino: {
    oracleClienteId: 'ORC-CLI-LOGIMEX-001',
    empresa: 'LogiMex S.A. de C.V.',
  },
  casoLegal: {
    hojaDeAcuerdos: {
      fechaInicio: '2026-07-01',
    },
  },
};

const demoHoldover = {
  id: 'holdover-demo-001',
  fechaInicioHoldover: '2026-06-01',
  montoHoldoverMensual: 25000,
  nave: {
    oracleNaveId: 'ORC-NAV-GDL-003',
    identificador: 'NVA-GDL-003',
  },
  inquilino: {
    oracleClienteId: 'ORC-CLI-RETAIL-002',
    empresa: 'Empresa Retail',
  },
};

const main = async (): Promise<void> => {
  console.log('[oracle:test] === Oracle mock test suite ===');
  console.log('[oracle:test] Status:', oracleService.getSyncStatus());

  const syncResult = await oracleService.syncAll();
  console.log('[oracle:test] syncAll result:', syncResult);

  await oracleService.notifyContratoFirmado(demoExpediente);
  await oracleService.notifyHoldoverIniciado(demoHoldover);
  await oracleService.notifyRenovacionFirmada(demoExpediente);

  console.log('[oracle:test] Final status:', oracleService.getSyncStatus());
  console.log('[oracle:test] Done');
};

main();
