import {
  CREATE_CASO_LEGAL,
  CREATE_EXPEDIENTE_CONTRATO,
  CREATE_HOJA_DE_ACUERDOS,
  CREATE_INQUILINO,
  CREATE_NAVE,
  CREATE_OPPORTUNITY,
  CREATE_PARQUE,
} from './demo-seed.mutations';
import { DEMO_NAVE_DEFINITIONS } from './demo-seed-naves.constants';
import { DEMO_PARQUES, DEMO_REF_PREFIX } from './demo-seed.constants';
import {
  CASO_LEGAL_ESTATUS_CERRADO,
  CASO_LEGAL_ESTATUS_ELABORACION,
  EXPEDIENTE_ESTATUS_ACTIVO,
} from '../constants/parks.constants';
import { ceoInboxStore } from '../services/ceo-inbox.store';
import { comiteStore } from '../services/comite.store';
import { expansionSignalsStore } from '../services/expansion-signals.store';
import { allocateNextFolio } from '../services/folio.store';
import { commissionApprovalService } from '../services/commission-approval.service';
import { comisionService } from '../services/comision.service';
import { twentyClient } from '../services/twenty.client';
import { twentyDataService } from '../services/twenty-data.service';
import { valorAgregadoStore } from '../services/valor-agregado.store';
import { resolveCanalOrigenStorageValue } from '../utils/commercial-field-values.util';
import { toSelectValue } from '../utils/select-value.util';

type IdRecord = { id: string };

type ScenarioLeadDefinition = {
  key: string;
  empresa: string;
  contacto: string;
  stage: string;
  giro: string;
  m2: number;
  ubicacion: string;
  canal: string;
  presupuestoMensualUsd: number;
  plazoMeses: number;
  leasingOfficer?: string;
  asignadoPor?: string;
  naveIdentificador?: string;
  precioPorM2Usd?: number;
  m2Ofertados?: number;
  aprobacionRequerida?: boolean;
  estatusAprobacion?: string;
  screenshotNote: string;
};

export const DEMO_SCENARIO_LEADS: ScenarioLeadDefinition[] = [
  {
    key: 'lead-nuevo',
    empresa: 'AeroPack México',
    contacto: 'Laura Méndez',
    stage: 'Lead recibido',
    giro: 'Manufactura',
    m2: 4_500,
    ubicacion: 'Guadalajara',
    canal: 'Página web',
    presupuestoMensualUsd: 4_200,
    plazoMeses: 60,
    screenshotNote: 'Cola CEM — lead sin asignar',
  },
  {
    key: 'lead-calificado',
    empresa: 'FreshCold Distributors',
    contacto: 'Diego Rivas',
    stage: 'Calificado',
    giro: 'Logística',
    m2: 8_000,
    ubicacion: 'Bajío',
    canal: 'LinkedIn',
    presupuestoMensualUsd: 7_500,
    plazoMeses: 84,
    leasingOfficer: 'Israel Ramírez',
    asignadoPor: 'Héctor Montelongo',
    screenshotNote: 'Prospecto calificado asignado a LO AAA',
  },
  {
    key: 'lead-tour',
    empresa: 'AutoParts Bajío',
    contacto: 'Sofía Ortega',
    stage: 'Tour / Visita',
    giro: 'Automotriz',
    m2: 6_200,
    ubicacion: 'Bajío',
    canal: 'Broker',
    presupuestoMensualUsd: 6_800,
    plazoMeses: 60,
    leasingOfficer: 'Bruyel',
    asignadoPor: 'Héctor Montelongo',
    naveIdentificador: 'Nave S-15',
    screenshotNote: 'Visita agendada — tour en Bajío',
  },
  {
    key: 'lead-cotizacion',
    empresa: 'RetailGo Commerce',
    contacto: 'Andrés Peña',
    stage: 'Cotización enviada',
    giro: 'E-commerce',
    m2: 12_000,
    ubicacion: 'Guadalajara',
    canal: 'Recomendación',
    presupuestoMensualUsd: 11_500,
    plazoMeses: 72,
    leasingOfficer: 'Israel Ramírez',
    asignadoPor: 'Héctor Montelongo',
    naveIdentificador: 'Nave GDL-M8',
    m2Ofertados: 12_000,
    precioPorM2Usd: 0.93,
    screenshotNote: 'Propuesta enviada con precio/m²',
  },
  {
    key: 'lead-negociacion',
    empresa: 'Química Delta',
    contacto: 'Patricia Núñez',
    stage: 'En negociación',
    giro: 'Manufactura',
    m2: 9_500,
    ubicacion: 'CDMX',
    canal: 'CEM',
    presupuestoMensualUsd: 9_200,
    plazoMeses: 60,
    leasingOfficer: 'UAE',
    asignadoPor: 'Héctor Montelongo',
    naveIdentificador: 'Nave D',
    m2Ofertados: 9_500,
    precioPorM2Usd: 0.88,
    screenshotNote: 'Negociación estándar (sin umbral consejo)',
  },
  {
    key: 'lead-consejo',
    empresa: 'MegaHub Logistics',
    contacto: 'Carlos Ibarra',
    stage: 'En negociación',
    giro: 'Logística',
    m2: 25_500,
    ubicacion: 'Guadalajara',
    canal: 'Broker',
    presupuestoMensualUsd: 28_000,
    plazoMeses: 120,
    leasingOfficer: 'Israel Ramírez',
    asignadoPor: 'Héctor Montelongo',
    naveIdentificador: 'Nave CON-25K',
    m2Ofertados: 25_500,
    precioPorM2Usd: 0.84,
    aprobacionRequerida: true,
    estatusAprobacion: 'Pendiente',
    screenshotNote:
      'Deal grande (>20k m²) — listo para comité / firmas consejo',
  },
  {
    key: 'lead-hoja',
    empresa: 'PackRight Industries',
    contacto: 'Elena Soto',
    stage: 'Hoja de Acuerdos firmada',
    giro: 'Manufactura',
    m2: 5_200,
    ubicacion: 'CDMX',
    canal: 'Evento',
    presupuestoMensualUsd: 5_400,
    plazoMeses: 60,
    leasingOfficer: 'Bruyel',
    asignadoPor: 'Héctor Montelongo',
    naveIdentificador: 'Nave TU-D2',
    m2Ofertados: 5_200,
    precioPorM2Usd: 0.89,
    screenshotNote: 'LOI / Hoja firmada — handoff a Legal',
  },
  {
    key: 'lead-legal',
    empresa: 'PharmaCare Latam',
    contacto: 'Miguel Torres',
    stage: 'En proceso legal',
    giro: 'Farmacéutica',
    m2: 7_200,
    ubicacion: 'Monterrey',
    canal: 'Call Center',
    presupuestoMensualUsd: 8_100,
    plazoMeses: 84,
    leasingOfficer: 'Israel Ramírez',
    asignadoPor: 'Héctor Montelongo',
    naveIdentificador: 'Nave MTY-S3',
    m2Ofertados: 7_200,
    precioPorM2Usd: 1.02,
    screenshotNote: 'Contrato en revisión legal',
  },
  {
    key: 'cliente-logimex',
    empresa: 'LogiMex',
    contacto: 'Roberto Salinas',
    stage: 'Ganado — Contrato firmado',
    giro: 'Logística',
    m2: 3_500,
    ubicacion: 'Bajío',
    canal: 'Directo',
    presupuestoMensualUsd: 3_200,
    plazoMeses: 60,
    leasingOfficer: 'Israel Ramírez',
    asignadoPor: 'Héctor Montelongo',
    naveIdentificador: 'Nave 1',
    screenshotNote: 'Cliente actual — señal de expansión IA (badge)',
  },
  {
    key: 'cliente-nestle',
    empresa: 'Nestlé México',
    contacto: 'Ana Beltrán',
    stage: 'Ganado — Contrato firmado',
    giro: 'Manufactura',
    m2: 4_200,
    ubicacion: 'Bajío',
    canal: 'Referido',
    presupuestoMensualUsd: 4_000,
    plazoMeses: 84,
    leasingOfficer: 'UAE',
    asignadoPor: 'Héctor Montelongo',
    naveIdentificador: 'Nave 4',
    screenshotNote: 'Cliente actual — señal de expansión IA (Account 360)',
  },
  {
    key: 'cliente-femsa',
    empresa: 'Coca-Cola FEMSA',
    contacto: 'Jorge Campos',
    stage: 'Ganado — Contrato firmado',
    giro: 'Distribución',
    m2: 2_787,
    ubicacion: 'Monterrey',
    canal: 'Broker',
    presupuestoMensualUsd: 3_500,
    plazoMeses: 60,
    leasingOfficer: 'Israel Ramírez',
    asignadoPor: 'Héctor Montelongo',
    naveIdentificador: 'Bodega 05AM200',
    screenshotNote: 'Cliente FUNO — señal expansión Monterrey',
  },
  {
    key: 'lead-perdido',
    empresa: 'SteelForm MX',
    contacto: 'Iván Ruiz',
    stage: 'Perdido',
    giro: 'Manufactura',
    m2: 3_000,
    ubicacion: 'Norte',
    canal: 'Otro',
    presupuestoMensualUsd: 2_800,
    plazoMeses: 36,
    leasingOfficer: 'Bruyel',
    asignadoPor: 'Héctor Montelongo',
    screenshotNote: 'Deal perdido — contraste en pipeline',
  },
];

const DESTROY_PIPELINE_MUTATIONS: Array<{
  label: string;
  mutation: string;
  mutationField: string;
}> = [
  {
    label: 'documentos checklist',
    mutation: `mutation { destroyDocumentosChecklist(filter: {}) { id } }`,
    mutationField: 'destroyDocumentosChecklist',
  },
  {
    label: 'versiones documento',
    mutation: `mutation { destroyVersionesDocumento(filter: {}) { id } }`,
    mutationField: 'destroyVersionesDocumento',
  },
  {
    label: 'flujos firmas',
    mutation: `mutation { destroyFlujosFirmas(filter: {}) { id } }`,
    mutationField: 'destroyFlujosFirmas',
  },
  {
    label: 'comisiones',
    mutation: `mutation { destroyComisiones(filter: {}) { id } }`,
    mutationField: 'destroyComisiones',
  },
  {
    label: 'expedientes de contrato',
    mutation: `mutation { destroyExpedientesContrato(filter: {}) { id } }`,
    mutationField: 'destroyExpedientesContrato',
  },
  {
    label: 'holdovers',
    mutation: `mutation { destroyHoldovers(filter: {}) { id } }`,
    mutationField: 'destroyHoldovers',
  },
  {
    label: 'casos legales',
    mutation: `mutation { destroyCasosLegales(filter: {}) { id } }`,
    mutationField: 'destroyCasosLegales',
  },
  {
    label: 'hojas de acuerdos',
    mutation: `mutation { destroyHojasDeAcuerdos(filter: {}) { id } }`,
    mutationField: 'destroyHojasDeAcuerdos',
  },
  {
    label: 'oportunidades',
    mutation: `mutation { destroyOpportunities(filter: {}) { id } }`,
    mutationField: 'destroyOpportunities',
  },
];

const isoDaysFromToday = (offsetDays: number): string => {
  const date = new Date();
  date.setDate(date.getDate() + offsetDays);
  return date.toISOString().slice(0, 10);
};

const FIND_PARQUES = `
  query FindParquesForScenarios {
    parques(first: 100) {
      edges { node { id nombre } }
    }
  }
`;

const FIND_NAVES = `
  query FindNavesForScenarios {
    naves(first: 500) {
      edges {
        node {
          id
          identificador
          estatus
          parqueId
        }
      }
    }
  }
`;

const destroyAllOf = async (
  label: string,
  mutation: string,
  mutationField: string,
): Promise<number> => {
  try {
    const response = await twentyClient.mutate<Record<string, IdRecord[]>>(
      mutation,
      {},
    );
    const deletedRecords = response[mutationField] ?? [];
    if (deletedRecords.length > 0) {
      console.log(
        `[seed:scenarios] - ${label}: ${deletedRecords.length} eliminados`,
      );
    }
    return deletedRecords.length;
  } catch (error) {
    const message = error instanceof Error ? error.message : String(error);
    console.warn(`[seed:scenarios] ${label} omitido: ${message}`);
    return 0;
  }
};

const ensureInventory = async (): Promise<{
  parqueIdByKey: Record<string, string>;
  naveIdByIdentificador: Record<string, string>;
}> => {
  const parquesResponse = await twentyClient.query<{
    parques: { edges: Array<{ node: { id: string; nombre: string } }> };
  }>(FIND_PARQUES);

  const parqueIdByNombre = new Map(
    parquesResponse.parques.edges.map((edge) => [
      edge.node.nombre,
      edge.node.id,
    ]),
  );
  const parqueIdByKey: Record<string, string> = {};

  for (const parque of DEMO_PARQUES) {
    const existingId = parqueIdByNombre.get(parque.nombre);
    if (existingId) {
      parqueIdByKey[parque.key] = existingId;
      continue;
    }

    const created = await twentyClient.mutate<{
      createParque: { id: string; nombre: string };
    }>(CREATE_PARQUE, {
      data: {
        nombre: parque.nombre,
        ubicacion: parque.ubicacion,
        m2Totales: parque.m2Totales,
        m2Rentados: parque.m2Rentados,
        estatus: toSelectValue('Activo'),
      },
    });
    parqueIdByKey[parque.key] = created.createParque.id;
    console.log(`[seed:scenarios] + parque ${parque.nombre}`);
  }

  const navesResponse = await twentyClient.query<{
    naves: {
      edges: Array<{
        node: { id: string; identificador: string; parqueId?: string };
      }>;
    };
  }>(FIND_NAVES);

  const naveIdByIdentificador: Record<string, string> = {};
  for (const edge of navesResponse.naves.edges) {
    naveIdByIdentificador[edge.node.identificador] = edge.node.id;
  }

  for (const nave of DEMO_NAVE_DEFINITIONS) {
    if (naveIdByIdentificador[nave.identificador]) {
      continue;
    }

    const parqueId = parqueIdByKey[nave.parqueKey];
    if (!parqueId) {
      continue;
    }

    const created = await twentyClient.mutate<{
      createNave: { id: string; identificador: string };
    }>(CREATE_NAVE, {
      data: {
        identificador: nave.identificador,
        m2: nave.m2,
        estatus: toSelectValue(nave.estatus),
        esPropiedadFuno: nave.esPropiedadFuno,
        precioBaseUsd: nave.precioBaseUsd,
        parqueId,
      },
    });
    naveIdByIdentificador[nave.identificador] = created.createNave.id;
    console.log(
      `[seed:scenarios] + nave ${nave.identificador} (${nave.estatus}, ${nave.m2} m²)`,
    );
  }

  return { parqueIdByKey, naveIdByIdentificador };
};

const createScenarioLead = async (
  scenario: ScenarioLeadDefinition,
  naveIdByIdentificador: Record<string, string>,
): Promise<{ opportunityId: string; inquilinoId: string; folio: string }> => {
  const isWonClient = scenario.stage === 'Ganado — Contrato firmado';
  const isLegalStage = scenario.stage === 'En proceso legal';
  const isHojaStage = scenario.stage === 'Hoja de Acuerdos firmada';
  const precioUsdM2 = scenario.precioPorM2Usd ?? 0.9;
  const m2Acordados = scenario.m2Ofertados ?? scenario.m2;
  const rentaMensualUsd = Number((precioUsdM2 * m2Acordados).toFixed(2));

  const inquilinoResponse = await twentyClient.mutate<{
    createInquilino: { id: string };
  }>(CREATE_INQUILINO, {
    data: {
      empresa: scenario.empresa,
      contactoPrincipal: scenario.contacto,
      emailContacto: `${scenario.key.replace(/-/g, '.')}@demo.parks.mx`,
      telefono: '+52 33 1000 0000',
      sector: toSelectValue(scenario.giro),
      estatus: toSelectValue(isWonClient ? 'Activo' : 'Prospecto'),
      ...(isWonClient
        ? {
            pagosAlCorriente: true,
            ultimoPagoFecha: isoDaysFromToday(-12),
            oracleClienteId: `ORC-CLI-${scenario.key.toUpperCase()}`,
          }
        : {}),
    },
  });

  const inquilinoId = inquilinoResponse.createInquilino.id;
  const folio = allocateNextFolio();
  const naveId = scenario.naveIdentificador
    ? naveIdByIdentificador[scenario.naveIdentificador]
    : undefined;

  const opportunityData: Record<string, unknown> = {
    name: `${DEMO_REF_PREFIX}${scenario.empresa} — ${scenario.stage}`,
    folio,
    stage: toSelectValue(scenario.stage),
    tipoOperacion: toSelectValue('Arrendamiento nuevo'),
    m2Requeridos: scenario.m2,
    ubicacionDeseada: toSelectValue(scenario.ubicacion),
    giroEmpresa: toSelectValue(scenario.giro),
    plazoContratoMeses: scenario.plazoMeses,
    presupuestoMensualUsd: scenario.presupuestoMensualUsd,
    canalOrigen: resolveCanalOrigenStorageValue(scenario.canal),
    inquilinoVinculadoId: inquilinoId,
    depositoGarantiaMeses: 2,
    rentasAdelantadasMeses: 2,
    escalacionAnual: toSelectValue('INPC'),
  };

  if (scenario.leasingOfficer) {
    opportunityData.leasingOfficerAsignado = scenario.leasingOfficer;
    opportunityData.asignadoPor = scenario.asignadoPor ?? 'Seed escenarios';
    opportunityData.asignadoEn = new Date().toISOString().slice(0, 10);
  }

  if (naveId) {
    opportunityData.naveVinculadaId = naveId;
  }

  if (scenario.m2Ofertados) {
    opportunityData.m2Ofertados = scenario.m2Ofertados;
  }

  if (scenario.precioPorM2Usd) {
    opportunityData.precioPorM2Usd = scenario.precioPorM2Usd;
    opportunityData.rentaMensualCalculada = rentaMensualUsd;
  }

  if (scenario.aprobacionRequerida) {
    opportunityData.aprobacionRequerida = true;
    opportunityData.estatusAprobacion = toSelectValue(
      scenario.estatusAprobacion ?? 'Pendiente',
    );
    opportunityData.nivelAprobacion = toSelectValue('CEO');
  }

  if (scenario.key === 'lead-tour') {
    opportunityData.tourFecha = new Date().toISOString().slice(0, 10);
    opportunityData.tourHora = '11:00';
    opportunityData.tourParque = 'Parques del Bajío - Silao';
  }

  if (scenario.key === 'lead-cotizacion') {
    opportunityData.cotizacionEnviadaEn = new Date().toISOString();
  }

  if (scenario.key === 'lead-calificado') {
    opportunityData.primerContactoRealizado = true;
    opportunityData.primerContactoTipo = toSelectValue('Llamada');
  }

  const opportunityResponse = await twentyClient.mutate<{
    createOpportunity: { id: string };
  }>(CREATE_OPPORTUNITY, { data: opportunityData });

  const opportunityId = opportunityResponse.createOpportunity.id;

  // Enrich Account 360 / Legal / Contratos so KPI cards match the stage story.
  if (isHojaStage || isLegalStage || isWonClient) {
    const hojaResponse = await twentyClient.mutate<{
      createHojaDeAcuerdos: { id: string };
    }>(CREATE_HOJA_DE_ACUERDOS, {
      data: {
        referencia: `${DEMO_REF_PREFIX}HOJA-${scenario.key.toUpperCase()}`,
        folio,
        fechaFirma: isoDaysFromToday(isWonClient ? -120 : -10),
        tipoContrato: toSelectValue('Arrendamiento nuevo'),
        m2Acordados,
        precioUsdM2: precioUsdM2,
        plazoMeses: scenario.plazoMeses,
        fechaInicio: isoDaysFromToday(isWonClient ? -100 : 15),
        periodoGraciaMeses: 2,
        depositoMeses: 2,
        escalacionAnualPct: 3,
        ejecutivoAsignado: scenario.leasingOfficer ?? 'Héctor Montelongo',
        estatus: toSelectValue('Firmada'),
        esquemaComision: toSelectValue('Recursos propios'),
        inquilinoId,
        oportunidadVinculadaId: opportunityId,
        ...(naveId ? { naveId } : {}),
      },
    });

    const hojaId = hojaResponse.createHojaDeAcuerdos.id;

    if (isLegalStage || isWonClient) {
      const casoResponse = await twentyClient.mutate<{
        createCasoLegal: { id: string };
      }>(CREATE_CASO_LEGAL, {
        data: {
          referencia: `${DEMO_REF_PREFIX}CASO-${scenario.key.toUpperCase()}`,
          folio,
          tipoDocumento: toSelectValue('Contrato nuevo'),
          estatus: toSelectValue(
            isWonClient
              ? CASO_LEGAL_ESTATUS_CERRADO
              : CASO_LEGAL_ESTATUS_ELABORACION,
          ),
          semaforo: toSelectValue(isWonClient ? 'Verde' : 'Azul'),
          slaDiasHabiles: 45,
          diasTranscurridos: isWonClient ? 45 : 12,
          documentacionCompleta: true,
          esPropiedadFuno: scenario.key === 'cliente-femsa',
          fechaHojaAcuerdos: isoDaysFromToday(isWonClient ? -120 : -10),
          abogadoAsignado: 'Miguel Soto',
          inquilinoId,
          hojaDeAcuerdosId: hojaId,
          ...(naveId ? { naveId } : {}),
        },
      });

      if (isWonClient) {
        await twentyClient.mutate(CREATE_EXPEDIENTE_CONTRATO, {
          data: {
            numeroExpediente: `${DEMO_REF_PREFIX}EXP-${scenario.key.toUpperCase()}`,
            fechaApertura: isoDaysFromToday(-100),
            fechaVencimiento: isoDaysFromToday(scenario.plazoMeses * 30 - 100),
            rentaMensualUsd,
            estatus: toSelectValue(EXPEDIENTE_ESTATUS_ACTIVO),
            oracleSincronizado: true,
            casoLegalId: casoResponse.createCasoLegal.id,
            inquilinoId,
            ...(naveId ? { naveId } : {}),
            ...(scenario.key === 'cliente-femsa'
              ? {
                  notas:
                    'Expediente vinculado a propiedad FUNO — validar archivo físico.',
                }
              : {}),
          },
        });
      }

      // FUNO skips internal commission; others get a pending commission by folio.
      if (scenario.key !== 'cliente-femsa') {
        try {
          await comisionService.calculateForHojaAcuerdos(hojaId);
        } catch (error) {
          console.warn(
            `[seed:scenarios] Comisión omitida para ${scenario.empresa}:`,
            error instanceof Error ? error.message : error,
          );
        }
      }
    } else if (isHojaStage) {
      try {
        await comisionService.calculateForHojaAcuerdos(hojaId);
      } catch (error) {
        console.warn(
          `[seed:scenarios] Comisión omitida para ${scenario.empresa}:`,
          error instanceof Error ? error.message : error,
        );
      }
    }
  }

  return {
    opportunityId,
    inquilinoId,
    folio,
  };
};

export const demoScenariosService = {
  run: async (): Promise<{
    leads: Array<{
      key: string;
      empresa: string;
      stage: string;
      folio: string;
      screenshotNote: string;
      opportunityId: string;
    }>;
  }> => {
    console.log('[seed:scenarios] Limpiando pipeline / firmas / comités…');

    for (const item of DESTROY_PIPELINE_MUTATIONS) {
      await destroyAllOf(item.label, item.mutation, item.mutationField);
    }

    comiteStore.clearAll();
    ceoInboxStore.dismissAllDemoItems();
    valorAgregadoStore.resetDemo();
    expansionSignalsStore.resetDemo();

    console.log('[seed:scenarios] Asegurando inventario de parques/naves…');
    const { naveIdByIdentificador } = await ensureInventory();

    console.log('[seed:scenarios] Creando leads por etapa…');
    const created: Array<{
      key: string;
      empresa: string;
      stage: string;
      folio: string;
      screenshotNote: string;
      opportunityId: string;
      inquilinoId: string;
    }> = [];

    for (const scenario of DEMO_SCENARIO_LEADS) {
      const result = await createScenarioLead(scenario, naveIdByIdentificador);
      created.push({
        key: scenario.key,
        empresa: scenario.empresa,
        stage: scenario.stage,
        folio: result.folio,
        screenshotNote: scenario.screenshotNote,
        opportunityId: result.opportunityId,
        inquilinoId: result.inquilinoId,
      });
      console.log(
        `[seed:scenarios] + ${scenario.stage} · ${scenario.empresa} (${result.folio})`,
      );
    }

    expansionSignalsStore.bindInquilinoIds(
      created
        .filter((item) => item.key.startsWith('cliente-'))
        .map((item) => ({
          inquilinoId: item.inquilinoId,
          empresa: item.empresa,
        })),
    );

    expansionSignalsStore.refreshMock();

    console.log('[seed:scenarios] Diversificando estatus de comisiones…');
    const comisiones = await twentyDataService.findAllComisiones();

    if (comisiones.length > 0) {
      const [first, second] = comisiones;

      if (first) {
        try {
          await commissionApprovalService.approve({
            comisionId: first.id,
            aprobadoPor: 'Héctor Montelongo',
          });
          await commissionApprovalService.markPaid({
            comisionId: first.id,
            pagadoPor: 'Héctor Montelongo',
          });
        } catch (error) {
          console.warn(
            '[seed:scenarios] No se pudo marcar comisión pagada:',
            error instanceof Error ? error.message : error,
          );
        }
      }

      if (second) {
        try {
          await commissionApprovalService.approve({
            comisionId: second.id,
            aprobadoPor: 'Héctor Montelongo',
          });
        } catch (error) {
          console.warn(
            '[seed:scenarios] No se pudo aprobar segunda comisión:',
            error instanceof Error ? error.message : error,
          );
        }
      }
    }

    // Extra externo (broker) for the consejo-size deal story.
    const megaHub = created.find((item) => item.key === 'lead-consejo');
    if (megaHub) {
      await twentyDataService.createComision({
        folio: megaHub.folio,
        clienteNombre: megaHub.empresa,
        leasingOfficer: 'Israel Ramírez',
        origenDeal: toSelectValue('Broker Top 10'),
        tipoContratoComision: toSelectValue('Nuevo'),
        estatusNaveComision: toSelectValue('Construida'),
        brokerTierSnapshot: toSelectValue('Top 10'),
        rentaTotalContrato: 25_500 * 0.84 * 120,
        pctAplicado: 5,
        montoUsd: 25_500 * 0.84 * 120 * 0.05,
        baseCalculo: 'Escenario consejo · broker Top 10 5%',
        estatus: toSelectValue('Pendiente'),
        tipoPago: toSelectValue('Externo'),
        tipo: toSelectValue('Broker externo'),
        beneficiario: 'CBRE Industrial Demo',
        fechaCierre: new Date().toISOString().slice(0, 10),
        aplicaFuno: false,
        opportunityId: megaHub.opportunityId,
      });
    }

    const comisionesFinales = await twentyDataService.findAllComisiones();
    console.log(
      `[seed:scenarios] Comisiones listas: ${comisionesFinales.length}`,
    );

    console.log('[seed:scenarios] Listo.');
    return {
      leads: created.map(
        ({ key, empresa, stage, folio, screenshotNote, opportunityId }) => ({
          key,
          empresa,
          stage,
          folio,
          screenshotNote,
          opportunityId,
        }),
      ),
    };
  },
};
