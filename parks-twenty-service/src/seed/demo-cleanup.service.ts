import { twentyClient } from '../services/twenty.client';
import {
  DEMO_BROKERS,
  DEMO_PARQUES,
  DEMO_REF_PREFIX,
} from './demo-cleanup.constants';
import { DEMO_NAVE_DEFINITIONS } from './demo-seed-naves.constants';
import {
  DESTROY_BROKERS,
  DESTROY_CASOS_LEGALES,
  DESTROY_COMISIONES,
  DESTROY_DOCUMENTOS_CHECKLIST,
  DESTROY_EXPEDIENTES_CONTRATO,
  DESTROY_FLUJOS_FIRMAS,
  DESTROY_HOLDOVERS,
  DESTROY_HOJAS_DE_ACUERDOS,
  DESTROY_INQUILINOS,
  DESTROY_NAVES,
  DESTROY_OPPORTUNITIES,
  DESTROY_PARQUES,
  DESTROY_VERSIONES_DOCUMENTO,
} from './demo-cleanup.mutations';

const DEMO_CASO_FILTER = {
  referencia: { startsWith: DEMO_REF_PREFIX },
};

const DEMO_REFERENCIA_FILTER = {
  referencia: { startsWith: DEMO_REF_PREFIX },
};

const DEMO_NUMERO_EXPEDIENTE_FILTER = {
  numeroExpediente: { startsWith: DEMO_REF_PREFIX },
};

const DEMO_OPPORTUNITY_FILTER = {
  name: { startsWith: DEMO_REF_PREFIX },
};

const DEMO_NAVE_IDENTIFICADORES = DEMO_NAVE_DEFINITIONS.map(
  (nave) => nave.identificador,
);

const DEMO_NAVE_FILTER = {
  or: [
    { identificador: { startsWith: 'NVA-' } },
    { identificador: { in: DEMO_NAVE_IDENTIFICADORES } },
  ],
};

const destroyRecords = async (
  label: string,
  mutation: string,
  mutationField: string,
  filter: Record<string, unknown>,
): Promise<number> => {
  try {
    const response = await twentyClient.mutate<
      Record<string, { id: string }[]>
    >(mutation, { filter });

    const deletedRecords = response[mutationField] ?? [];

    if (deletedRecords.length > 0) {
      console.log(`[seed:cleanup] - ${label}: ${deletedRecords.length}`);
    }

    return deletedRecords.length;
  } catch (error) {
    const message = error instanceof Error ? error.message : String(error);
    console.warn(`[seed:cleanup] ${label} skipped: ${message}`);
    return 0;
  }
};

const destroyByCasoLegalRelation = async (
  label: string,
  mutation: string,
  mutationField: string,
): Promise<number> =>
  destroyRecords(label, mutation, mutationField, {
    casoLegal: DEMO_CASO_FILTER,
  });

const destroyInquilinosDemo = async (): Promise<number> => {
  const demoEmpresas = [
    'LogiMex S.A. de C.V.',
    'Manufactura GDL S.A.',
    'Retail México S.A.',
    'Distribuidora Holdover S.A.',
    'TechSalida S.A.',
    'FUNO Logistics S.A.',
  ];

  return destroyRecords(
    'inquilinos demo',
    DESTROY_INQUILINOS,
    'destroyInquilinos',
    { empresa: { in: demoEmpresas } },
  );
};

const destroyBrokersDemo = async (): Promise<number> =>
  destroyRecords(
    'brokers demo',
    DESTROY_BROKERS,
    'destroyBrokers',
    { empresa: { in: DEMO_BROKERS.map((broker) => broker.empresa) } },
  );

const destroyParquesDemo = async (): Promise<number> =>
  destroyRecords(
    'parques demo',
    DESTROY_PARQUES,
    'destroyParques',
    { nombre: { in: DEMO_PARQUES.map((parque) => parque.nombre) } },
  );

export const demoCleanupService = {
  clearAll: async (): Promise<void> => {
    console.log('[seed:cleanup] Removing previous DEMO dataset...');

    await destroyByCasoLegalRelation(
      'documentos checklist',
      DESTROY_DOCUMENTOS_CHECKLIST,
      'destroyDocumentosChecklist',
    );
    await destroyByCasoLegalRelation(
      'versiones documento',
      DESTROY_VERSIONES_DOCUMENTO,
      'destroyVersionesDocumento',
    );
    await destroyByCasoLegalRelation(
      'flujos firmas',
      DESTROY_FLUJOS_FIRMAS,
      'destroyFlujosFirmas',
    );
    await destroyByCasoLegalRelation(
      'comisiones',
      DESTROY_COMISIONES,
      'destroyComisiones',
    );
    await destroyRecords(
      'expedientes',
      DESTROY_EXPEDIENTES_CONTRATO,
      'destroyExpedientesContrato',
      DEMO_NUMERO_EXPEDIENTE_FILTER,
    );
    await destroyRecords(
      'holdovers',
      DESTROY_HOLDOVERS,
      'destroyHoldovers',
      DEMO_REFERENCIA_FILTER,
    );
    await destroyRecords(
      'casos legales',
      DESTROY_CASOS_LEGALES,
      'destroyCasosLegales',
      DEMO_CASO_FILTER,
    );
    await destroyRecords(
      'hojas de acuerdos',
      DESTROY_HOJAS_DE_ACUERDOS,
      'destroyHojasDeAcuerdos',
      DEMO_REFERENCIA_FILTER,
    );
    await destroyRecords(
      'oportunidades',
      DESTROY_OPPORTUNITIES,
      'destroyOpportunities',
      DEMO_OPPORTUNITY_FILTER,
    );
    await destroyRecords(
      'naves demo',
      DESTROY_NAVES,
      'destroyNaves',
      DEMO_NAVE_FILTER,
    );
    await destroyInquilinosDemo();
    await destroyBrokersDemo();
    await destroyParquesDemo();

    console.log('[seed:cleanup] Done');
  },
};
