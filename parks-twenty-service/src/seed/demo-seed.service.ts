import {
  EXPEDIENTE_ESTATUS_ACTIVO,
  EXPEDIENTE_ESTATUS_ARCHIVADO_FUNO,
  HOLDOVER_ETAPA_DETECTADO,
  HOLDOVER_RESOLUCION_ACTIVO,
  CHECKLIST_DOCUMENT_TYPES,
} from '../constants/parks.constants';
import { checklistService } from '../services/checklist.service';
import { demoCleanupService } from './demo-cleanup.service';
import { pdfService } from '../services/pdf.service';
import { twentyClient } from '../services/twenty.client';
import { toIsoDateString } from '../utils/business-days.util';
import { toSelectValue } from '../utils/select-value.util';
import {
  DEMO_BROKERS,
  DEMO_PARQUES,
  DEMO_REF_PREFIX,
} from './demo-seed.constants';
import {
  CREATE_BROKER,
  CREATE_CASO_LEGAL,
  CREATE_EXPEDIENTE_CONTRATO,
  CREATE_HOJA_DE_ACUERDOS,
  CREATE_HOLDOVER,
  CREATE_INQUILINO,
  CREATE_NAVE,
  CREATE_OPPORTUNITY,
  CREATE_PARQUE,
  FIND_ALL_DEMO_CASOS,
  FIND_DEMO_CASOS,
} from './demo-seed.mutations';

type DemoIdMap = Record<string, string>;

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

const isDemoAlreadySeeded = async (): Promise<boolean> => {
  try {
    const response = await twentyClient.query<{
      casosLegales: { edges: { node: { id: string } }[] };
    }>(FIND_DEMO_CASOS, { prefix: DEMO_REF_PREFIX });

    return (response.casosLegales.edges.length ?? 0) > 0;
  } catch {
    return false;
  }
};

const seedParques = async (ids: DemoIdMap): Promise<void> => {
  for (const parque of DEMO_PARQUES) {
    const record = await createRecord<{ id: string; nombre: string }>(
      CREATE_PARQUE,
      'createParque',
      {
        nombre: parque.nombre,
        ubicacion: parque.ubicacion,
        m2Totales: parque.m2Totales,
        m2Rentados: parque.m2Rentados,
        administrador: parque.administrador,
        estatus: toSelectValue('Activo'),
      },
    );

    ids[parque.key] = record.id;
    console.log(`[seed:demo] + parque ${parque.nombre}`);
  }
};

const seedBrokers = async (ids: DemoIdMap): Promise<void> => {
  for (const broker of DEMO_BROKERS) {
    const record = await createRecord<{ id: string }>(
      CREATE_BROKER,
      'createBroker',
      {
        empresa: broker.empresa,
        contacto: broker.contacto,
        email: broker.email,
        firma: toSelectValue(broker.firma),
        operacionesCnt: 12,
      },
    );

    ids[broker.key] = record.id;
    console.log(`[seed:demo] + broker ${broker.empresa}`);
  }
};

const seedNaves = async (ids: DemoIdMap): Promise<void> => {
  const naveDefinitions = [
    {
      key: 'naveGdl001',
      identificador: 'NVA-GDL-001',
      parqueKey: 'parqueGdl',
      m2: 4500,
      estatus: 'Rentada',
      esPropiedadFuno: false,
      precioBaseUsd: 0.85,
    },
    {
      key: 'naveGdl002',
      identificador: 'NVA-GDL-002',
      parqueKey: 'parqueGdl',
      m2: 5200,
      estatus: 'Rentada',
      esPropiedadFuno: false,
      precioBaseUsd: 0.9,
    },
    {
      key: 'naveGdl003',
      identificador: 'NVA-GDL-003',
      parqueKey: 'parqueGdl',
      m2: 3800,
      estatus: 'En negociación',
      esPropiedadFuno: false,
      precioBaseUsd: 0.82,
    },
    {
      key: 'naveGdl004',
      identificador: 'NVA-GDL-004',
      parqueKey: 'parqueGdl',
      m2: 6000,
      estatus: 'Disponible',
      esPropiedadFuno: false,
      precioBaseUsd: 0.88,
    },
    {
      key: 'naveMty001',
      identificador: 'NVA-MTY-001',
      parqueKey: 'parqueMty',
      m2: 8000,
      estatus: 'Rentada',
      esPropiedadFuno: true,
      precioBaseUsd: 1.1,
    },
    {
      key: 'naveMty002',
      identificador: 'NVA-MTY-002',
      parqueKey: 'parqueMty',
      m2: 4200,
      estatus: 'Rentada',
      esPropiedadFuno: false,
      precioBaseUsd: 0.95,
    },
    {
      key: 'naveMty003',
      identificador: 'NVA-MTY-003',
      parqueKey: 'parqueMty',
      m2: 5100,
      estatus: 'Disponible',
      esPropiedadFuno: false,
      precioBaseUsd: 0.91,
    },
    {
      key: 'naveMty004',
      identificador: 'NVA-MTY-004',
      parqueKey: 'parqueMty',
      m2: 4700,
      estatus: 'En negociación',
      esPropiedadFuno: false,
      precioBaseUsd: 0.89,
    },
  ];

  for (const nave of naveDefinitions) {
    const record = await createRecord<{ id: string }>(CREATE_NAVE, 'createNave', {
      identificador: nave.identificador,
      m2: nave.m2,
      alturaLibreM: 12,
      andenes: 4,
      estatus: toSelectValue(nave.estatus),
      esPropiedadFuno: nave.esPropiedadFuno,
      precioBaseUsd: nave.precioBaseUsd,
      parqueId: ids[nave.parqueKey],
    });

    ids[nave.key] = record.id;
    console.log(`[seed:demo] + nave ${nave.identificador}`);
  }
};

const seedInquilinos = async (ids: DemoIdMap): Promise<void> => {
  const inquilinoDefinitions = [
    {
      key: 'inquilinoLogiMex',
      empresa: 'LogiMex S.A. de C.V.',
      rfc: 'LOG850101ABC',
      estatus: 'Activo',
      sector: 'Logística',
    },
    {
      key: 'inquilinoManufactura',
      empresa: 'Manufactura GDL S.A.',
      rfc: 'MFG900215XYZ',
      estatus: 'En renovación',
      sector: 'Manufactura',
    },
    {
      key: 'inquilinoRetail',
      empresa: 'Retail México S.A.',
      rfc: 'RET770301QWE',
      estatus: 'En renovación',
      sector: 'E-commerce',
    },
    {
      key: 'inquilinoHoldover',
      empresa: 'Distribuidora Holdover S.A.',
      rfc: 'DIS650811HLD',
      estatus: 'En holdover',
      sector: 'Distribución',
    },
    {
      key: 'inquilinoTerminacion',
      empresa: 'TechSalida S.A.',
      rfc: 'TEC880505TSU',
      estatus: 'Activo',
      sector: 'Tecnología',
    },
    {
      key: 'inquilinoFuno',
      empresa: 'FUNO Logistics S.A.',
      rfc: 'FUN920101FUN',
      estatus: 'Activo',
      sector: 'Logística',
    },
  ];

  for (const inquilino of inquilinoDefinitions) {
    const record = await createRecord<{ id: string }>(
      CREATE_INQUILINO,
      'createInquilino',
      {
        empresa: inquilino.empresa,
        rfc: inquilino.rfc,
        sector: toSelectValue(inquilino.sector),
        contactoPrincipal: 'Contacto Demo',
        emailContacto: 'contacto@demo.parks.mx',
        telefono: '+52 33 1234 5678',
        estatus: toSelectValue(inquilino.estatus),
        repLegalNombre: 'Representante Legal Demo',
        pagosAlCorriente: inquilino.key !== 'inquilinoHoldover',
      },
    );

    ids[inquilino.key] = record.id;
    console.log(`[seed:demo] + inquilino ${inquilino.empresa}`);
  }
};

const seedHojasDeAcuerdos = async (ids: DemoIdMap): Promise<void> => {
  const hojaDefinitions = [
    {
      key: 'hojaLogiMex',
      referencia: `${DEMO_REF_PREFIX}HOJA-LOGIMEX`,
      inquilinoKey: 'inquilinoLogiMex',
      naveKey: 'naveGdl001',
      brokerKey: 'brokerNewmark',
      tipoContrato: 'Arrendamiento nuevo',
      m2: 4500,
      precio: 0.85,
      plazo: 60,
      ejecutivo: 'María González',
    },
    {
      key: 'hojaManufactura',
      referencia: `${DEMO_REF_PREFIX}HOJA-MFG-GDL`,
      inquilinoKey: 'inquilinoManufactura',
      naveKey: 'naveGdl002',
      brokerKey: 'brokerCbre',
      tipoContrato: 'Renovación',
      m2: 5200,
      precio: 0.9,
      plazo: 48,
      ejecutivo: 'Héctor Montelongo',
    },
    {
      key: 'hojaRetail',
      referencia: `${DEMO_REF_PREFIX}HOJA-RETAIL`,
      inquilinoKey: 'inquilinoRetail',
      naveKey: 'naveGdl003',
      brokerKey: 'brokerIndependiente',
      tipoContrato: 'Renovación',
      m2: 3800,
      precio: 0.82,
      plazo: 36,
      ejecutivo: 'Patricia López',
    },
    {
      key: 'hojaHoldover',
      referencia: `${DEMO_REF_PREFIX}HOJA-HOLDOVER`,
      inquilinoKey: 'inquilinoHoldover',
      naveKey: 'naveMty002',
      brokerKey: 'brokerNewmark',
      tipoContrato: 'Renovación',
      m2: 4200,
      precio: 0.95,
      plazo: 36,
      ejecutivo: 'Héctor Montelongo',
    },
    {
      key: 'hojaTerminacion',
      referencia: `${DEMO_REF_PREFIX}HOJA-TERMINACION`,
      inquilinoKey: 'inquilinoTerminacion',
      naveKey: 'naveGdl004',
      brokerKey: undefined,
      tipoContrato: 'Terminación anticipada',
      m2: 6000,
      precio: 0.88,
      plazo: 12,
      ejecutivo: 'María González',
    },
    {
      key: 'hojaFuno',
      referencia: `${DEMO_REF_PREFIX}HOJA-FUNO`,
      inquilinoKey: 'inquilinoFuno',
      naveKey: 'naveMty001',
      brokerKey: 'brokerCbre',
      tipoContrato: 'Arrendamiento nuevo',
      m2: 8000,
      precio: 1.1,
      plazo: 120,
      ejecutivo: 'Director Comercial',
    },
  ];

  for (const hoja of hojaDefinitions) {
    const record = await createRecord<{ id: string }>(
      CREATE_HOJA_DE_ACUERDOS,
      'createHojaDeAcuerdos',
      {
        referencia: hoja.referencia,
        fechaFirma: isoDaysFromToday(-30),
        tipoContrato: toSelectValue(hoja.tipoContrato),
        m2Acordados: hoja.m2,
        precioUsdM2: hoja.precio,
        plazoMeses: hoja.plazo,
        fechaInicio: isoDaysFromToday(-20),
        periodoGraciaMeses: 2,
        depositoMeses: 1,
        escalacionAnualPct: 3,
        brokerComisionPct: 2.5,
        ejecutivoAsignado: hoja.ejecutivo,
        inquilinoId: ids[hoja.inquilinoKey],
        naveId: ids[hoja.naveKey],
        ...(hoja.brokerKey ? { brokerId: ids[hoja.brokerKey] } : {}),
      },
    );

    ids[hoja.key] = record.id;
    console.log(`[seed:demo] + hoja ${hoja.referencia}`);
  }
};

const seedCasosLegales = async (ids: DemoIdMap): Promise<void> => {
  const casoDefinitions = [
    {
      key: 'casoLogiMex',
      referencia: `${DEMO_REF_PREFIX}CASO-LOGIMEX`,
      hojaKey: 'hojaLogiMex',
      inquilinoKey: 'inquilinoLogiMex',
      naveKey: 'naveGdl001',
      tipoDocumento: 'Contrato nuevo',
      estatus: 'En elaboración',
      semaforo: 'NARANJA',
      slaDias: 60,
      diasTranscurridos: 32,
      documentacionCompleta: true,
      esPropiedadFuno: false,
    },
    {
      key: 'casoManufactura',
      referencia: `${DEMO_REF_PREFIX}CASO-MFG-GDL`,
      hojaKey: 'hojaManufactura',
      inquilinoKey: 'inquilinoManufactura',
      naveKey: 'naveGdl002',
      tipoDocumento: 'Convenio renovación',
      estatus: 'Primera versión enviada',
      semaforo: 'AZUL',
      slaDias: 45,
      diasTranscurridos: 18,
      documentacionCompleta: true,
      esPropiedadFuno: false,
    },
    {
      key: 'casoRetail',
      referencia: `${DEMO_REF_PREFIX}CASO-RETAIL`,
      hojaKey: 'hojaRetail',
      inquilinoKey: 'inquilinoRetail',
      naveKey: 'naveGdl003',
      tipoDocumento: 'Convenio renovación',
      estatus: 'Documentación incompleta',
      semaforo: 'AMARILLO',
      slaDias: 45,
      diasTranscurridos: 0,
      documentacionCompleta: false,
      esPropiedadFuno: false,
    },
    {
      key: 'casoHoldover',
      referencia: `${DEMO_REF_PREFIX}CASO-HOLDOVER`,
      hojaKey: 'hojaHoldover',
      inquilinoKey: 'inquilinoHoldover',
      naveKey: 'naveMty002',
      tipoDocumento: 'Convenio renovación',
      estatus: 'En negociación con cliente',
      semaforo: 'ROJO',
      slaDias: 45,
      diasTranscurridos: 56,
      documentacionCompleta: true,
      esPropiedadFuno: false,
    },
    {
      key: 'casoTerminacion',
      referencia: `${DEMO_REF_PREFIX}CASO-TERMINACION`,
      hojaKey: 'hojaTerminacion',
      inquilinoKey: 'inquilinoTerminacion',
      naveKey: 'naveGdl004',
      tipoDocumento: 'Terminación anticipada',
      estatus: 'En negociación con cliente',
      semaforo: 'NARANJA',
      slaDias: 30,
      diasTranscurridos: 20,
      documentacionCompleta: true,
      esPropiedadFuno: false,
    },
    {
      key: 'casoFuno',
      referencia: `${DEMO_REF_PREFIX}CASO-FUNO`,
      hojaKey: 'hojaFuno',
      inquilinoKey: 'inquilinoFuno',
      naveKey: 'naveMty001',
      tipoDocumento: 'Contrato nuevo',
      estatus: 'Firmado — cerrado',
      semaforo: 'VERDE',
      slaDias: 60,
      diasTranscurridos: 60,
      documentacionCompleta: true,
      esPropiedadFuno: true,
      cotejoAprobado: true,
    },
  ];

  for (const caso of casoDefinitions) {
    const record = await createRecord<{ id: string }>(
      CREATE_CASO_LEGAL,
      'createCasoLegal',
      {
        referencia: caso.referencia,
        tipoDocumento: toSelectValue(caso.tipoDocumento),
        estatus: toSelectValue(caso.estatus),
        semaforo: caso.semaforo,
        abogadoAsignado: 'Catalina Moreno',
        fechaHojaAcuerdos: isoDaysFromToday(-caso.diasTranscurridos),
        slaDiasHabiles: caso.slaDias,
        diasTranscurridos: caso.diasTranscurridos,
        documentacionCompleta: caso.documentacionCompleta,
        cotejoAprobado: caso.cotejoAprobado ?? false,
        esPropiedadFuno: caso.esPropiedadFuno,
        hojaDeAcuerdosId: ids[caso.hojaKey],
        inquilinoId: ids[caso.inquilinoKey],
        naveId: ids[caso.naveKey],
        notasCatalina:
          caso.key === 'casoRetail'
            ? 'Bloqueado en Comercial — falta documentación del cliente.'
            : undefined,
      },
    );

    ids[caso.key] = record.id;
    console.log(`[seed:demo] + caso legal ${caso.referencia}`);
  }
};

const seedExpedientesAndHoldover = async (ids: DemoIdMap): Promise<void> => {
  const holdoverExpediente = await createRecord<{ id: string }>(
    CREATE_EXPEDIENTE_CONTRATO,
    'createExpedienteContrato',
    {
      numeroExpediente: `${DEMO_REF_PREFIX}EXP-2024-HOLDOVER`,
      fechaApertura: isoDaysFromToday(-400),
      fechaVencimiento: isoDaysFromToday(-56),
      rentaMensualUsd: 4200 * 0.95,
      estatus: toSelectValue(EXPEDIENTE_ESTATUS_ACTIVO),
      casoLegalId: ids.casoHoldover,
      inquilinoId: ids.inquilinoHoldover,
      naveId: ids.naveMty002,
      oracleSincronizado: true,
    },
  );

  ids.expedienteHoldover = holdoverExpediente.id;

  await createRecord(CREATE_HOLDOVER, 'createHoldover', {
    referencia: `${DEMO_REF_PREFIX}HOLDOVER-MTY-002`,
    fechaInicioHoldover: isoDaysFromToday(-56),
    rentaBaseMensualUsd: 4200 * 0.95,
    montoHoldoverMensual: 4200 * 0.95 * 2,
    facturasEmitidas: 2,
    resolucion: toSelectValue(HOLDOVER_RESOLUCION_ACTIVO),
    etapaPipeline: toSelectValue(HOLDOVER_ETAPA_DETECTADO),
    oracleNotificado: true,
    casoLegalId: ids.casoHoldover,
    inquilinoId: ids.inquilinoHoldover,
    naveId: ids.naveMty002,
  });

  await createRecord(CREATE_EXPEDIENTE_CONTRATO, 'createExpedienteContrato', {
    numeroExpediente: `${DEMO_REF_PREFIX}EXP-2025-FUNO`,
    fechaApertura: isoDaysFromToday(-90),
    fechaVencimiento: isoDaysFromToday(365 * 10),
    rentaMensualUsd: 8000 * 1.1,
    estatus: toSelectValue(EXPEDIENTE_ESTATUS_ARCHIVADO_FUNO),
    notas: 'Expediente físico archivado en FUNO — no en Parks.',
    oracleSincronizado: true,
    casoLegalId: ids.casoFuno,
    inquilinoId: ids.inquilinoFuno,
    naveId: ids.naveMty001,
  });

  await createRecord(CREATE_EXPEDIENTE_CONTRATO, 'createExpedienteContrato', {
    numeroExpediente: `${DEMO_REF_PREFIX}EXP-2026-RENOV-1`,
    fechaApertura: isoDaysFromToday(-300),
    fechaVencimiento: isoDaysFromToday(75),
    rentaMensualUsd: 5200 * 0.9,
    estatus: toSelectValue(EXPEDIENTE_ESTATUS_ACTIVO),
    casoLegalId: ids.casoManufactura,
    inquilinoId: ids.inquilinoManufactura,
    naveId: ids.naveGdl002,
  });

  await createRecord(CREATE_EXPEDIENTE_CONTRATO, 'createExpedienteContrato', {
    numeroExpediente: `${DEMO_REF_PREFIX}EXP-2026-RENOV-2`,
    fechaApertura: isoDaysFromToday(-280),
    fechaVencimiento: isoDaysFromToday(88),
    rentaMensualUsd: 3800 * 0.82,
    estatus: toSelectValue(EXPEDIENTE_ESTATUS_ACTIVO),
    casoLegalId: ids.casoRetail,
    inquilinoId: ids.inquilinoRetail,
    naveId: ids.naveGdl003,
  });

  console.log('[seed:demo] + expedientes demo y holdover activo');
};

const seedOpportunities = async (ids: DemoIdMap): Promise<void> => {
  const opportunityDefinitions = [
    {
      name: `${DEMO_REF_PREFIX}Opp — Lead LogiMex`,
      stage: 'Lead recibido',
      inquilinoKey: 'inquilinoLogiMex',
      naveKey: 'naveGdl001',
      tipoOperacion: 'Arrendamiento nuevo',
    },
    {
      name: `${DEMO_REF_PREFIX}Opp — Tour Manufactura`,
      stage: 'Tour / Visita',
      inquilinoKey: 'inquilinoManufactura',
      naveKey: 'naveGdl002',
      tipoOperacion: 'Renovación',
    },
    {
      name: `${DEMO_REF_PREFIX}Opp — Cotización Retail`,
      stage: 'Cotización enviada',
      inquilinoKey: 'inquilinoRetail',
      naveKey: 'naveGdl003',
      tipoOperacion: 'Renovación',
    },
    {
      name: `${DEMO_REF_PREFIX}Opp — Negociación Terminación`,
      stage: 'En negociación',
      inquilinoKey: 'inquilinoTerminacion',
      naveKey: 'naveGdl004',
      tipoOperacion: 'Terminación anticipada',
    },
    {
      name: `${DEMO_REF_PREFIX}Opp — Proceso legal FUNO`,
      stage: 'En proceso legal',
      inquilinoKey: 'inquilinoFuno',
      naveKey: 'naveMty001',
      tipoOperacion: 'Arrendamiento nuevo',
    },
  ];

  for (const opportunity of opportunityDefinitions) {
    await createRecord(CREATE_OPPORTUNITY, 'createOpportunity', {
      name: opportunity.name,
      stage: toSelectValue(opportunity.stage),
      tipoOperacion: toSelectValue(opportunity.tipoOperacion),
      m2Requeridos:
        opportunity.naveKey === 'naveGdl001'
          ? 4500
          : opportunity.naveKey === 'naveMty001'
            ? 8000
            : 5000,
      canalOrigen: toSelectValue('Directo'),
      inquilinoVinculadoId: ids[opportunity.inquilinoKey],
      naveVinculadaId: ids[opportunity.naveKey],
    });

    console.log(`[seed:demo] + oportunidad ${opportunity.name}`);
  }
};

export const seedDemoChecklists = async (): Promise<number> => {
  const response = await twentyClient.query<{
    casosLegales: {
      edges: { node: { id: string; referencia?: string } }[];
    };
  }>(FIND_ALL_DEMO_CASOS, { prefix: DEMO_REF_PREFIX });

  const demoCasos = response.casosLegales.edges.map((edge) => edge.node);

  for (const casoLegal of demoCasos) {
    await checklistService.generarChecklist(casoLegal);
  }

  console.log(
    `[seed:demo] + checklists demo (${demoCasos.length} casos × ${CHECKLIST_DOCUMENT_TYPES.length} docs)`,
  );

  return demoCasos.length;
};

const generateLogiMexPdf = async (ids: DemoIdMap): Promise<void> => {
  const casoLegalId = ids.casoLogiMex;

  if (!casoLegalId) {
    return;
  }

  try {
    const pdfPath = await pdfService.generateForCasoLegal(casoLegalId, 1);

    if (pdfPath) {
      console.log(`[seed:demo] + PDF borrador LogiMex → ${pdfPath}`);
    }
  } catch (error) {
    const message = error instanceof Error ? error.message : String(error);
    console.warn(`[seed:demo] PDF LogiMex skipped: ${message}`);
  }
};

export const demoSeedService = {
  seedDemoChecklists,
  run: async (options?: {
    force?: boolean;
    reset?: boolean;
  }): Promise<void> => {
    const force = options?.force === true;
    const reset =
      options?.reset === true ||
      process.env.RESET_DEMO_SEED === 'true' ||
      force;

    if (reset) {
      await demoCleanupService.clearAll();
    } else if (await isDemoAlreadySeeded()) {
      console.log(
        '[seed:demo] Demo data already exists (referencia DEMO-*). Use RESET_DEMO_SEED=true to replace.',
      );
      return;
    }

    const isConnected = await twentyClient.ping();

    if (!isConnected) {
      throw new Error('Twenty API unavailable — start Twenty on :3000 first');
    }

    console.log('[seed:demo] Loading Parks Industrial demo dataset...');

    const ids: DemoIdMap = {};

    await seedParques(ids);
    await seedBrokers(ids);
    await seedNaves(ids);
    await seedInquilinos(ids);
    await seedHojasDeAcuerdos(ids);
    await seedCasosLegales(ids);
    await seedDemoChecklists();
    await seedExpedientesAndHoldover(ids);
    await seedOpportunities(ids);
    await generateLogiMexPdf(ids);

    console.log('');
    console.log('[seed:demo] ✅ Demo seed complete — 6 casos legales + infraestructura');
    console.log('[seed:demo] Pipeline Legal esperado:');
    console.log('  🟠 LogiMex — 32/60 días — En elaboración');
    console.log('  🔵 Manufactura GDL — 18/45 días — Primera versión enviada');
    console.log('  🟡 Retail — Documentación incompleta');
    console.log('  🔴 Holdover — 56 días vencida');
    console.log('  🟠 Terminación — negociación CEO');
    console.log('  🟢 FUNO — Firmado y archivado');
  },
};
