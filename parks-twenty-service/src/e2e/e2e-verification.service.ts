import {
  CASO_LEGAL_ESTATUS_CERRADO,
  CASO_LEGAL_ESTATUS_PRIMERA_VERSION,
  CHECKLIST_DOCUMENT_TYPES,
  FLUJO_FIRMAS_ESTATUS_FIRMADO,
  OPPORTUNITY_STAGE_EN_PROCESO_LEGAL,
  OPPORTUNITY_STAGE_HOJA_FIRMADA,
} from '../constants/parks.constants';
import {
  CREATE_HOJA_DE_ACUERDOS,
  CREATE_INQUILINO,
  CREATE_NAVE,
  CREATE_OPPORTUNITY,
} from '../seed/demo-seed.mutations';
import { DEMO_BROKERS, DEMO_PARQUES, DEMO_REF_PREFIX } from '../seed/demo-seed.constants';
import { oracleService } from '../services/oracle.service';
import { twentyClient } from '../services/twenty.client';
import { twentyDataService } from '../services/twenty-data.service';
import { type TwentyWebhookPayload } from '../types/parks.types';
import { toIsoDateString } from '../utils/business-days.util';
import { isSelectValueEqual, toSelectValue } from '../utils/select-value.util';
import { handleCasoLegalWebhook } from '../webhooks/handlers/caso-legal.handler';
import { handleFlujoFirmasWebhook } from '../webhooks/handlers/flujo-firmas.handler';
import { handleOportunidadWebhook } from '../webhooks/handlers/oportunidad.handler';
import { E2E_REFERENCES, E2E_REF_PREFIX } from './e2e.constants';
import {
  E2E_KPI_SNAPSHOT,
  FIND_BROKER_BY_EMPRESA,
  FIND_CASO_BY_HOJA,
  FIND_E2E_HOJA,
  FIND_EXPEDIENTE_BY_CASO,
  FIND_PARQUE_BY_NOMBRE,
} from './e2e.queries';

type E2eStepResult = {
  step: string;
  passed: boolean;
  detail: string;
};

type E2eFixtureIds = {
  inquilinoId: string;
  naveId: string;
  hojaDeAcuerdosId: string;
  opportunityId: string;
  casoLegalId?: string;
};

const isoDaysFromToday = (daysOffset: number): string => {
  const date = new Date();
  date.setDate(date.getDate() + daysOffset);

  return toIsoDateString(date);
};

const createRecord = async <TRecord extends { id: string }>(
  mutation: string,
  mutationField: string,
  data: Record<string, unknown>,
): Promise<TRecord> => {
  const response = await twentyClient.mutate<Record<string, TRecord>>(
    mutation,
    { data },
  );

  const record = response[mutationField];

  if (!record?.id) {
    throw new Error(`Failed to create record via ${mutationField}`);
  }

  return record;
};

const buildWebhookPayload = (
  objectNameSingular: string,
  action: 'created' | 'updated',
  record: Record<string, unknown>,
  updatedFields: string[] = [],
): TwentyWebhookPayload => ({
  eventName: `${objectNameSingular}.${action}`,
  objectMetadata: { nameSingular: objectNameSingular },
  record,
  updatedFields,
});

const recordStep = (
  results: E2eStepResult[],
  step: string,
  passed: boolean,
  detail: string,
): void => {
  results.push({ step, passed, detail });
  const status = passed ? '✅' : '❌';
  console.log(`[e2e] ${status} ${step} — ${detail}`);
};

const findExistingE2eFlow = async (): Promise<{
  id: string;
  estatus?: string;
} | null> => {
  const hojaResponse = await twentyClient.query<{
    hojasDeAcuerdos: { edges: { node: { id: string } }[] };
  }>(FIND_E2E_HOJA, { referencia: E2E_REFERENCES.hoja });

  const hojaId = hojaResponse.hojasDeAcuerdos.edges[0]?.node?.id;

  if (!hojaId) {
    return null;
  }

  const casoResponse = await twentyClient.query<{
    casosLegales: { edges: { node: { id: string; estatus?: string } }[] };
  }>(FIND_CASO_BY_HOJA, { hojaDeAcuerdosId: hojaId });

  return casoResponse.casosLegales.edges[0]?.node ?? null;
};

const resolveDemoInfrastructure = async (): Promise<{
  parqueId: string;
  brokerId: string;
}> => {
  const parqueNombre = DEMO_PARQUES[0].nombre;
  const brokerEmpresa = DEMO_BROKERS[0].empresa;

  const parqueResponse = await twentyClient.query<{
    parques: { edges: { node: { id: string } }[] };
  }>(FIND_PARQUE_BY_NOMBRE, { nombre: parqueNombre });

  const brokerResponse = await twentyClient.query<{
    brokers: { edges: { node: { id: string } }[] };
  }>(FIND_BROKER_BY_EMPRESA, { empresa: brokerEmpresa });

  const parqueId = parqueResponse.parques.edges[0]?.node?.id;
  const brokerId = brokerResponse.brokers.edges[0]?.node?.id;

  if (!parqueId || !brokerId) {
    throw new Error(
      'Demo infrastructure missing — run npm run seed:demo first',
    );
  }

  return { parqueId, brokerId };
};

const setupE2eFixture = async (): Promise<E2eFixtureIds> => {
  const { parqueId, brokerId } = await resolveDemoInfrastructure();

  const inquilino = await createRecord<{ id: string }>(
    CREATE_INQUILINO,
    'createInquilino',
    {
      empresa: 'E2E Flow Test S.A.',
      rfc: 'E2E260620ABC',
      sector: toSelectValue('Logística'),
      contactoPrincipal: 'Contacto E2E',
      emailContacto: 'e2e@parks.mx',
      telefono: '+52 33 9999 0001',
      estatus: toSelectValue('Activo'),
      repLegalNombre: 'Rep. Legal E2E',
      pagosAlCorriente: true,
    },
  );

  const nave = await createRecord<{ id: string }>(
    CREATE_NAVE,
    'createNave',
    {
      identificador: E2E_REFERENCES.nave,
      m2: 3200,
      estatus: toSelectValue('Disponible'),
      esPropiedadFuno: false,
      parqueId,
    },
  );

  const hojaDeAcuerdos = await createRecord<{ id: string }>(
    CREATE_HOJA_DE_ACUERDOS,
    'createHojaDeAcuerdos',
    {
      referencia: E2E_REFERENCES.hoja,
      fechaFirma: isoDaysFromToday(-5),
      tipoContrato: toSelectValue('Arrendamiento nuevo'),
      m2Acordados: 3200,
      precioUsdM2: 0.92,
      plazoMeses: 48,
      fechaInicio: isoDaysFromToday(30),
      periodoGraciaMeses: 1,
      depositoMeses: 1,
      escalacionAnualPct: 3,
      brokerComisionPct: 2.5,
      ejecutivoAsignado: 'Ejecutivo E2E',
      inquilinoId: inquilino.id,
      naveId: nave.id,
      brokerId,
    },
  );

  const opportunity = await createRecord<{ id: string }>(
    CREATE_OPPORTUNITY,
    'createOpportunity',
    {
      name: E2E_REFERENCES.opportunity,
      stage: toSelectValue('En negociación'),
      tipoOperacion: toSelectValue('Arrendamiento nuevo'),
      m2Requeridos: 3200,
      canalOrigen: toSelectValue('Directo'),
      inquilinoVinculadoId: inquilino.id,
      naveVinculadaId: nave.id,
    },
  );

  console.log('[e2e] Fixture ready — inquilino, nave, hoja, oportunidad');

  return {
    inquilinoId: inquilino.id,
    naveId: nave.id,
    hojaDeAcuerdosId: hojaDeAcuerdos.id,
    opportunityId: opportunity.id,
  };
};

const runCommercialHandoff = async (
  fixture: E2eFixtureIds,
  results: E2eStepResult[],
): Promise<string> => {
  await twentyDataService.updateOpportunity(fixture.opportunityId, {
    stage: toSelectValue(OPPORTUNITY_STAGE_HOJA_FIRMADA),
  });

  await handleOportunidadWebhook(
    buildWebhookPayload(
      'opportunity',
      'updated',
      {
        id: fixture.opportunityId,
        stage: toSelectValue(OPPORTUNITY_STAGE_HOJA_FIRMADA),
      },
      ['stage'],
    ),
  );

  const hojaDeAcuerdos = await twentyDataService.findHojaDeAcuerdosForHandoff(
    fixture.inquilinoId,
    fixture.naveId,
  );

  const opportunity = await twentyDataService.getOpportunityById(
    fixture.opportunityId,
  );

  const casosResponse = await twentyClient.query<{
    casosLegales: {
      edges: { node: { id: string; referencia?: string } }[];
    };
  }>(FIND_CASO_BY_HOJA, { hojaDeAcuerdosId: fixture.hojaDeAcuerdosId });

  const createdCaso = casosResponse.casosLegales.edges[0]?.node;
  const handoffPassed =
    !!createdCaso &&
    isSelectValueEqual(
      opportunity?.stage,
      OPPORTUNITY_STAGE_EN_PROCESO_LEGAL,
    );

  recordStep(
    results,
    '1-2 Comercial → CasoLegal',
    handoffPassed,
    handoffPassed
      ? `Caso ${createdCaso?.referencia ?? createdCaso?.id} — opp en proceso legal`
      : `Handoff failed (hoja=${!!hojaDeAcuerdos}, opp stage=${opportunity?.stage})`,
  );

  if (!createdCaso?.id) {
    throw new Error('E2E handoff did not create caso legal');
  }

  return createdCaso.id;
};

const runChecklistAndPdf = async (
  casoLegalId: string,
  results: E2eStepResult[],
): Promise<void> => {
  const casoSnapshot = await twentyDataService.getCasoLegalById(casoLegalId);

  if (!casoSnapshot) {
    throw new Error(`Caso legal not found: ${casoLegalId}`);
  }

  await handleCasoLegalWebhook(
    buildWebhookPayload('casoLegal', 'created', {
      id: casoLegalId,
      referencia: casoSnapshot.referencia,
      tipoDocumento: casoSnapshot.tipoDocumento,
      estatus: casoSnapshot.estatus,
      fechaHojaAcuerdos: casoSnapshot.fechaHojaAcuerdos,
      slaDiasHabiles: casoSnapshot.slaDiasHabiles,
      diasTranscurridos: casoSnapshot.diasTranscurridos ?? 0,
      documentacionCompleta: false,
    }),
  );

  const checklistDocuments =
    await twentyDataService.findDocumentosChecklistByCasoLegal(casoLegalId);

  const checklistPassed =
    checklistDocuments.length >= CHECKLIST_DOCUMENT_TYPES.length;

  recordStep(
    results,
    '3a Checklist generado',
    checklistPassed,
    `${checklistDocuments.length}/${CHECKLIST_DOCUMENT_TYPES.length} documentos`,
  );

  await twentyDataService.updateCasoLegal(casoLegalId, {
    documentacionCompleta: true,
  });

  const updatedCaso = await twentyDataService.getCasoLegalById(casoLegalId);

  await handleCasoLegalWebhook(
    buildWebhookPayload(
      'casoLegal',
      'updated',
      {
        id: casoLegalId,
        referencia: updatedCaso?.referencia,
        estatus: updatedCaso?.estatus,
        documentacionCompleta: true,
        slaDiasHabiles: updatedCaso?.slaDiasHabiles,
        diasTranscurridos: updatedCaso?.diasTranscurridos,
      },
      ['documentacionCompleta'],
    ),
  );

  const casoWithPdf = await twentyDataService.getCasoLegalById(casoLegalId);
  const pdfPassed = !!casoWithPdf?.pdfBorradorUrl;

  recordStep(
    results,
    '3b PDF borrador',
    pdfPassed,
    pdfPassed
      ? `pdfBorradorUrl=${casoWithPdf?.pdfBorradorUrl}`
      : 'pdfBorradorUrl vacío',
  );
};

const runSlaAndSemaforo = async (
  casoLegalId: string,
  results: E2eStepResult[],
): Promise<void> => {
  await twentyDataService.updateCasoLegal(casoLegalId, {
    estatus: toSelectValue(CASO_LEGAL_ESTATUS_PRIMERA_VERSION),
    diasTranscurridos: 35,
  });

  const casoSnapshot = await twentyDataService.getCasoLegalById(casoLegalId);

  await handleCasoLegalWebhook(
    buildWebhookPayload(
      'casoLegal',
      'updated',
      {
        id: casoLegalId,
        estatus: casoSnapshot?.estatus,
        diasTranscurridos: 35,
        slaDiasHabiles: casoSnapshot?.slaDiasHabiles,
        documentacionCompleta: true,
      },
      ['estatus'],
    ),
  );

  const refreshedCaso = await twentyDataService.getCasoLegalById(casoLegalId);
  const slaPassed =
    !!refreshedCaso?.slaFechaLimite && refreshedCaso.slaDiasHabiles === 60;
  const semaforoPassed = refreshedCaso?.semaforo === 'NARANJA';

  recordStep(
    results,
    '4 SLA + semáforo',
    slaPassed && semaforoPassed,
    `SLA ${refreshedCaso?.diasTranscurridos}/${refreshedCaso?.slaDiasHabiles} — semáforo ${refreshedCaso?.semaforo}`,
  );
};

const runFirmasAndCierre = async (
  casoLegalId: string,
  hojaDeAcuerdosId: string,
  results: E2eStepResult[],
): Promise<void> => {
  await twentyDataService.updateCasoLegal(casoLegalId, {
    cotejoAprobado: true,
  });

  const casoBeforeFirmas =
    await twentyDataService.getCasoLegalById(casoLegalId);

  await handleCasoLegalWebhook(
    buildWebhookPayload(
      'casoLegal',
      'updated',
      {
        id: casoLegalId,
        cotejoAprobado: true,
        estatus: casoBeforeFirmas?.estatus,
        documentacionCompleta: true,
      },
      ['cotejoAprobado'],
    ),
  );

  const flujoSteps =
    await twentyDataService.findFlujosFirmasByCasoLegal(casoLegalId);
  const firmasStarted = flujoSteps.length === 3;

  recordStep(
    results,
    '5 Flujo de firmas iniciado',
    firmasStarted,
    `${flujoSteps.length} pasos de firma`,
  );

  const firmadoValue = toSelectValue(FLUJO_FIRMAS_ESTATUS_FIRMADO);

  for (const step of flujoSteps.sort(
    (leftStep, rightStep) => leftStep.orden - rightStep.orden,
  )) {
    await twentyDataService.updateFlujoFirmas(step.id, {
      estatus: firmadoValue,
    });

    await handleFlujoFirmasWebhook(
      buildWebhookPayload(
        'flujoFirmas',
        'updated',
        {
          id: step.id,
          casoLegalId,
          estatus: firmadoValue,
          orden: step.orden,
        },
        ['estatus'],
      ),
    );
  }

  const casoCerrado = await twentyDataService.getCasoLegalById(casoLegalId);

  await handleCasoLegalWebhook(
    buildWebhookPayload(
      'casoLegal',
      'updated',
      {
        id: casoLegalId,
        estatus: casoCerrado?.estatus,
        semaforo: casoCerrado?.semaforo,
        referencia: casoCerrado?.referencia,
        inquilinoId: casoCerrado?.inquilinoId,
        naveId: casoCerrado?.naveId,
        hojaDeAcuerdosId: casoCerrado?.hojaDeAcuerdosId,
      },
      ['estatus'],
    ),
  );

  const cerradoPassed = isSelectValueEqual(
    casoCerrado?.estatus,
    CASO_LEGAL_ESTATUS_CERRADO,
  );

  recordStep(
    results,
    '6a Caso cerrado',
    cerradoPassed,
    `estatus=${casoCerrado?.estatus}`,
  );

  const expedienteResponse = await twentyClient.query<{
    expedientesContrato: {
      edges: { node: { id: string; numeroExpediente?: string } }[];
    };
  }>(FIND_EXPEDIENTE_BY_CASO, { casoLegalId });

  const expediente = expedienteResponse.expedientesContrato.edges[0]?.node;
  const comisiones =
    await twentyDataService.findComisionesByHojaDeAcuerdos(hojaDeAcuerdosId);

  recordStep(
    results,
    '6b Expediente + comisiones',
    !!expediente && comisiones.length >= 2,
    `expediente=${expediente?.numeroExpediente ?? '—'}, comisiones=${comisiones.length}`,
  );

  const oracleResult = await oracleService.syncAll();

  recordStep(
    results,
    '6c Oracle mock sync',
    !!oracleResult.completedAt,
    `pagos=${oracleResult.pagosProcessed}, naves=${oracleResult.navesProcessed}`,
  );
};

const verifyDashboardKpis = async (results: E2eStepResult[]): Promise<void> => {
  const snapshot = await twentyClient.query<{
    casosLegales: {
      edges: { node: { semaforo?: string; estatus?: string } }[];
    };
    expedientesContrato: { edges: { node: { id: string } }[] };
    oportunidades: { edges: { node: { name?: string } }[] };
  }>(E2E_KPI_SNAPSHOT, { demoPrefix: DEMO_REF_PREFIX });

  const demoCasos = snapshot.casosLegales.edges.map((edge) => edge.node);
  const semaforoCounts = demoCasos.reduce<Record<string, number>>(
    (accumulator, caso) => {
      const color = caso.semaforo ?? 'SIN_COLOR';
      accumulator[color] = (accumulator[color] ?? 0) + 1;

      return accumulator;
    },
    {},
  );

  const demoCasosPassed = demoCasos.length >= 6;
  const semaforosPassed =
    (semaforoCounts.NARANJA ?? 0) >= 1 &&
    (semaforoCounts.AZUL ?? 0) >= 1 &&
    (semaforoCounts.ROJO ?? 0) >= 1 &&
    (semaforoCounts.VERDE ?? 0) >= 1;
  const expedientesPassed = snapshot.expedientesContrato.edges.length >= 3;
  const opportunitiesPassed = snapshot.oportunidades.edges.length >= 5;

  recordStep(
    results,
    '7a KPI — casos demo',
    demoCasosPassed,
    `${demoCasos.length} casos DEMO-*`,
  );

  recordStep(
    results,
    '7b KPI — semáforos',
    semaforosPassed,
    JSON.stringify(semaforoCounts),
  );

  recordStep(
    results,
    '7c KPI — expedientes + oportunidades',
    expedientesPassed && opportunitiesPassed,
    `${snapshot.expedientesContrato.edges.length} expedientes, ${snapshot.oportunidades.edges.length} oportunidades`,
  );
};

export const e2eVerificationService = {
  run: async (options?: { force?: boolean }): Promise<E2eStepResult[]> => {
    const results: E2eStepResult[] = [];
    const force = options?.force === true;

    const isConnected = await twentyClient.ping();

    if (!isConnected) {
      throw new Error('Twenty API unavailable — start Twenty on :3000 first');
    }

    const existingCaso = await findExistingE2eFlow();

    if (
      existingCaso &&
      isSelectValueEqual(existingCaso.estatus, CASO_LEGAL_ESTATUS_CERRADO) &&
      !force
    ) {
      console.log(
        '[e2e] E2E flow already completed — verifying KPIs only (FORCE_E2E_RERUN=true to re-run)',
      );
      await verifyDashboardKpis(results);
      return results;
    }

    console.log('[e2e] Starting end-to-end verification flow...');

    const fixture = await setupE2eFixture();
    const casoLegalId = await runCommercialHandoff(fixture, results);

    await runChecklistAndPdf(casoLegalId, results);
    await runSlaAndSemaforo(casoLegalId, results);
    await runFirmasAndCierre(casoLegalId, fixture.hojaDeAcuerdosId, results);
    await verifyDashboardKpis(results);

    return results;
  },
};

export type { E2eStepResult };
