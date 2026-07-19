import { randomUUID } from 'crypto';

import { brokerNotificationStore } from './broker-notification.store';
import { commercialLeadService } from './commercial-lead.service';
import { asignacionInteligenteStore } from './asignacion-inteligente.store';
import { twentyDataService } from './twenty-data.service';
import {
  type AsignacionConfig,
  type AsignacionDashboard,
  type ClasificacionLead,
  type LeadScoreInput,
  type LeadTier,
  type LoNivel,
  type LoProfile,
} from '../types/asignacion-inteligente.types';

const CEM_NOMBRE = 'Héctor Montelongo';

const SECTORES_AAA = [
  'manufactura automotriz',
  'manufactura electrónica',
  'aeroespacial',
  'farmacéutica',
  'farmaceutica',
  'semiconductores',
  'energía renovable',
  'energia renovable',
];

const SECTORES_ALTO = [
  'logística y distribución',
  'logistica y distribucion',
  'e-commerce fulfillment',
  'manufactura ligera',
  'logística',
  'logistica',
  'distribución',
  'distribucion',
];

const PAISES_NEARSHORING = [
  'corea del sur',
  'japón',
  'japon',
  'alemania',
  'china',
  'taiwan',
  'estados unidos',
  'usa',
];

const normalize = (value?: string | null): string =>
  (value ?? '')
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '')
    .toLowerCase()
    .trim();

const tierToLoNivel = (tier: LeadTier): LoNivel => {
  if (tier === 'AAA — Cuenta clave') {
    return 'AAA — Senior';
  }

  if (tier === 'Junior') {
    return 'Junior';
  }

  return 'Estándar';
};

const computeFactorM2 = (
  m2: number | null | undefined,
  config: AsignacionConfig,
): { valor: number; puntos: number } => {
  const metros = m2 ?? 0;

  if (metros >= config.umbralM2Aaa) {
    return { valor: metros, puntos: 40 };
  }

  if (metros >= config.umbralM2Estandar) {
    return { valor: metros, puntos: 20 };
  }

  if (metros > 0) {
    return { valor: metros, puntos: 5 };
  }

  return { valor: metros, puntos: 0 };
};

const computeFactorPresupuesto = (
  presupuesto: number | null | undefined,
  config: AsignacionConfig,
): { valor: number | null; puntos: number } => {
  if (presupuesto == null || presupuesto <= 0) {
    return { valor: null, puntos: 0 };
  }

  if (presupuesto >= config.umbralPresupuestoAaaUsd) {
    return { valor: presupuesto, puntos: 25 };
  }

  if (presupuesto >= config.umbralPresupuestoAaaUsd * 0.5) {
    return { valor: presupuesto, puntos: 12 };
  }

  return { valor: presupuesto, puntos: 5 };
};

const computeFactorCanal = (
  canal?: string | null,
  brokerClasificacion?: string | null,
): { valor: string; puntos: number } => {
  const canalNorm = normalize(canal);
  const isTop10 = normalize(brokerClasificacion).includes('top 10');

  if (canalNorm.includes('broker') && isTop10) {
    return { valor: 'Broker Top 10', puntos: 15 };
  }

  if (
    canalNorm.includes('recomendacion') ||
    canalNorm.includes('referido')
  ) {
    return { valor: canal ?? 'Recomendación', puntos: 12 };
  }

  if (canalNorm === 'cem') {
    return { valor: 'CEM', puntos: 10 };
  }

  if (canalNorm.includes('broker')) {
    return { valor: 'Broker', puntos: 8 };
  }

  if (canalNorm.includes('linkedin')) {
    return { valor: 'LinkedIn', puntos: 6 };
  }

  if (canalNorm.includes('call')) {
    return { valor: 'Call Center', puntos: 5 };
  }

  if (canalNorm.includes('pagina') || canalNorm.includes('web')) {
    return { valor: 'Página web', puntos: 3 };
  }

  return { valor: canal ?? 'Otro', puntos: 5 };
};

const computeFactorSector = (
  giro?: string | null,
): { valor: string; puntos: number } => {
  const giroNorm = normalize(giro);

  if (!giroNorm) {
    return { valor: 'Sin giro', puntos: 0 };
  }

  if (
    SECTORES_AAA.some((sector) => {
      const sectorNorm = normalize(sector);
      return giroNorm.includes(sectorNorm) || sectorNorm.includes(giroNorm);
    })
  ) {
    return { valor: giro ?? '', puntos: 12 };
  }

  if (
    SECTORES_ALTO.some((sector) => {
      const sectorNorm = normalize(sector);
      return giroNorm.includes(sectorNorm) || sectorNorm.includes(giroNorm);
    })
  ) {
    return { valor: giro ?? '', puntos: 7 };
  }

  return { valor: giro ?? '', puntos: 3 };
};

const computeFactorInternacional = (
  paisOrigen?: string | null,
): { valor: boolean; puntos: number } => {
  const pais = normalize(paisOrigen);

  if (!pais || pais === 'mexico' || pais === 'méxico') {
    return { valor: false, puntos: 0 };
  }

  if (PAISES_NEARSHORING.some((item) => pais.includes(item))) {
    return { valor: true, puntos: 8 };
  }

  return { valor: true, puntos: 5 };
};

const resolveTierFromScore = (
  puntaje: number,
  m2: number | null | undefined,
  config: AsignacionConfig,
): LeadTier => {
  // Forced exception: m² ≥ AAA threshold always AAA
  if ((m2 ?? 0) >= config.umbralM2Aaa) {
    return 'AAA — Cuenta clave';
  }

  if (puntaje >= 70) {
    return 'AAA — Cuenta clave';
  }

  if (puntaje >= 30) {
    return 'Estándar';
  }

  return 'Junior';
};

const mockIaRecommendation = (
  input: LeadScoreInput,
  puntajeReglas: number,
): { score: number; razon: string; loRecomendado: string } => {
  const giro = normalize(input.giroEmpresa);
  const pais = normalize(input.paisOrigen);
  const prefersIsrael =
    giro.includes('electronic') ||
    pais.includes('corea') ||
    pais.includes('taiwan') ||
    pais.includes('japon');

  return {
    score: Math.min(99, Math.max(puntajeReglas, Math.round(puntajeReglas * 0.95 + 8))),
    razon: prefersIsrael
      ? 'Leads del sector electrónico / nearshoring asiático cierran al 72% con Israel Ramírez vs 45% promedio del equipo.'
      : 'Patrón histórico: este perfil de canal y m² convierte mejor con el LO Senior de menor saturación predictiva.',
    loRecomendado: prefersIsrael ? 'Israel Ramírez' : 'UAE',
  };
};

const pickCandidates = (
  tier: LeadTier,
  los: LoProfile[],
): { candidates: LoProfile[]; situacion: string } => {
  const nivel = tierToLoNivel(tier);
  const activosTier = los.filter(
    (lo) => lo.nivelLo === nivel && lo.activoParaAsignacion,
  );

  if (activosTier.length === 0) {
    return { candidates: [], situacion: 'D' };
  }

  const sorted = [...activosTier].sort((left, right) => {
    if (left.cargaActual !== right.cargaActual) {
      return left.cargaActual - right.cargaActual;
    }

    return right.tasaConversionHistorica - left.tasaConversionHistorica;
  });

  const allAtMax = sorted.every(
    (lo) => lo.cargaActual >= lo.cargaMaximaLeads,
  );

  if (allAtMax) {
    return { candidates: sorted, situacion: 'C' };
  }

  const preferred = sorted[0];

  if (preferred && preferred.cargaActual >= preferred.cargaMaximaLeads) {
    return { candidates: sorted, situacion: 'B' };
  }

  return { candidates: sorted, situacion: 'A' };
};

const buildExplicacion = (
  clasificacion: Pick<
    ClasificacionLead,
    | 'factorM2'
    | 'factorPresupuesto'
    | 'factorCanal'
    | 'factorSector'
    | 'factorInternacional'
    | 'puntajeTotal'
    | 'tierCalculado'
  >,
): string => {
  const lines = [
    `M² requeridos: ${clasificacion.factorM2.valor} (${clasificacion.factorM2.puntos} pts)`,
    `Presupuesto: ${clasificacion.factorPresupuesto.valor ?? 'sin dato'} (${clasificacion.factorPresupuesto.puntos} pts)`,
    `Canal: ${clasificacion.factorCanal.valor} (${clasificacion.factorCanal.puntos} pts)`,
    `Sector: ${clasificacion.factorSector.valor} (${clasificacion.factorSector.puntos} pts)`,
    `Internacional: ${clasificacion.factorInternacional.valor ? 'sí' : 'no'} (${clasificacion.factorInternacional.puntos} pts)`,
    `Total: ${clasificacion.puntajeTotal}/100 → ${clasificacion.tierCalculado}`,
  ];

  return lines.join('. ');
};

export const asignacionInteligenteService = {
  getDashboard: (): AsignacionDashboard => {
    if (
      asignacionInteligenteStore.listClasificaciones().length === 0
    ) {
      asignacionInteligenteService.seedDemoScenarios();
    }

    const config = asignacionInteligenteStore.getConfig();
    const los = asignacionInteligenteStore.listLos().map((lo) => {
      const pctCarga =
        lo.cargaMaximaLeads > 0
          ? Math.round((lo.cargaActual / lo.cargaMaximaLeads) * 100)
          : 0;
      let estado: 'ok' | 'cerca' | 'maximo' | 'inactivo' = 'ok';

      if (!lo.activoParaAsignacion) {
        estado = 'inactivo';
      } else if (lo.cargaActual >= lo.cargaMaximaLeads) {
        estado = 'maximo';
      } else if (pctCarga >= 75) {
        estado = 'cerca';
      }

      return { ...lo, pctCarga, estado };
    });

    const pendientes = asignacionInteligenteStore
      .listClasificaciones()
      .filter((item) => item.activa && item.pendienteAsignacion);

    const alertas: string[] = [];

    for (const lo of los) {
      if (lo.estado === 'cerca') {
        alertas.push(
          `⚠️ ${lo.nombre} está al ${lo.pctCarga}% de su carga máxima`,
        );
      }

      if (lo.estado === 'maximo') {
        alertas.push(
          `🚨 ${lo.nombre} está en carga máxima (${lo.cargaActual}/${lo.cargaMaximaLeads})`,
        );
      }
    }

    return {
      generatedAt: new Date().toISOString(),
      config,
      equipo: { los, pendientes, alertas },
      clasificacionesActivas: asignacionInteligenteStore
        .listClasificaciones()
        .filter((item) => item.activa),
    };
  },

  getConfig: () => asignacionInteligenteStore.getConfig(),

  updateConfig: (
    patch: Partial<AsignacionConfig>,
    actualizadoPor?: string,
  ) => asignacionInteligenteStore.updateConfig(patch, actualizadoPor),

  clasificarLead: (input: LeadScoreInput): ClasificacionLead => {
    const config = asignacionInteligenteStore.getConfig();
    const previous = asignacionInteligenteStore.getActivaByOpportunity(
      input.opportunityId,
    );

    const factorM2 = computeFactorM2(input.m2Requeridos, config);
    const factorPresupuesto = computeFactorPresupuesto(
      input.presupuestoMensualUsd,
      config,
    );
    const factorCanal = computeFactorCanal(
      input.canalOrigen,
      input.brokerClasificacion,
    );
    const factorSector = computeFactorSector(input.giroEmpresa);
    const factorInternacional = computeFactorInternacional(input.paisOrigen);
    const factorHistorial = {
      valor: Boolean(input.historialClienteParks),
      puntos: input.historialClienteParks ? 0 : 0,
    };

    const puntajeReglas =
      factorM2.puntos +
      factorPresupuesto.puntos +
      factorCanal.puntos +
      factorSector.puntos +
      factorInternacional.puntos +
      factorHistorial.puntos;

    const iaRecommendation = mockIaRecommendation(input, puntajeReglas);
    const useIaScoring = config.iaScoringActivo;
    const puntajeTotal = useIaScoring
      ? iaRecommendation.score
      : puntajeReglas;
    const tierCalculado = resolveTierFromScore(
      puntajeTotal,
      input.m2Requeridos,
      config,
    );

    const los = asignacionInteligenteStore.listLos();
    const { candidates, situacion } = pickCandidates(tierCalculado, los);

    let loSugerido1: string | null = null;
    let loSugerido2: string | null = null;
    let loSugerido3: string | null = null;
    let razonSugerencia1: string | null = null;
    let alertaCarga = false;
    let mensajeCarga: string | null = null;
    let asignacionProvisionalCem = false;
    let situacionFallback: string | null = situacion;

    if (situacion === 'D' || candidates.length === 0) {
      loSugerido1 = CEM_NOMBRE;
      asignacionProvisionalCem = true;
      situacionFallback = 'D';
      razonSugerencia1 = `No hay LOs ${tierToLoNivel(tierCalculado)} activos. Asignación provisional al CEM.`;
      mensajeCarga = `🚨 LEAD SIN LO DISPONIBLE — asignado provisionalmente a ${CEM_NOMBRE}. Reasignar en máximo 2 horas.`;

      brokerNotificationStore.add({
        type: 'alert',
        priority: 'high',
        title: `🚨 LEAD SIN LO DISPONIBLE — ${input.empresa}`,
        body: mensajeCarga,
        area: 'CEM',
        opportunityId: input.opportunityId,
        actionPath: '/parks/asignacion',
        actionLabel: 'Asignar ahora',
        audienceRoleLabels: [
          'Parks — Director Comercial',
          'Parks — CEO',
        ],
        audienceNames: [CEM_NOMBRE, 'Charles El-Mann'],
      });
    } else {
      const giroNorm = normalize(input.giroEmpresa);
      const especialista = candidates.find((lo) =>
        normalize(lo.especialidadSectores).includes(giroNorm),
      );
      const preferred = especialista ?? candidates[0];

      loSugerido1 = preferred.nombre;
      loSugerido2 = candidates[1]?.nombre ?? null;
      loSugerido3 = candidates[2]?.nombre ?? null;

      if (useIaScoring && iaRecommendation.loRecomendado) {
        const iaSuggestedLo = candidates.find(
          (lo) => lo.nombre === iaRecommendation.loRecomendado,
        );

        if (iaSuggestedLo) {
          loSugerido2 = loSugerido1;
          loSugerido1 = iaSuggestedLo.nombre;
        }
      }

      alertaCarga = preferred.cargaActual >= preferred.cargaMaximaLeads;
      razonSugerencia1 = especialista
        ? `LO ${tierToLoNivel(tierCalculado)} especialista en ${input.giroEmpresa}. Carga: ${preferred.cargaActual}/${preferred.cargaMaximaLeads}. Tasa histórica: ${preferred.tasaConversionHistorica}%`
        : `LO ${tierToLoNivel(tierCalculado)} con menor carga activa. Carga: ${preferred.cargaActual}/${preferred.cargaMaximaLeads}. Tasa histórica: ${preferred.tasaConversionHistorica}%`;

      if (
        useIaScoring &&
        loSugerido1 === iaRecommendation.loRecomendado
      ) {
        razonSugerencia1 = `IA recomienda: ${loSugerido1}. "${iaRecommendation.razon}" Carga: ${preferred.cargaActual}/${preferred.cargaMaximaLeads}.`;
      }

      if (alertaCarga) {
        mensajeCarga = `⚠️ ${preferred.nombre} está en carga máxima (${preferred.cargaActual}/${preferred.cargaMaximaLeads}). Se sugiere igualmente por ser el más adecuado. Alternativa: ${loSugerido2 ?? 'N/A'}.`;
      }

      if (situacion === 'C') {
        mensajeCarga = `🚨 Todos los LOs ${tierToLoNivel(tierCalculado)} están en carga máxima. Se asignó sugerencia a ${loSugerido1} (menor carga del grupo). Se requiere redistribuir o incorporar LO adicional.`;
        brokerNotificationStore.add({
          type: 'alert',
          priority: 'high',
          title: `🚨 Todos los LOs AAA en carga máxima — ${input.empresa}`,
          body: mensajeCarga,
          area: 'CEM',
          opportunityId: input.opportunityId,
          actionPath: '/parks/asignacion',
          actionLabel: 'Revisar',
          audienceRoleLabels: [
            'Parks — Director Comercial',
            'Parks — CEO',
          ],
        });
      }
    }

    const versionClasificacion = (previous?.versionClasificacion ?? 0) + 1;

    if (previous) {
      asignacionInteligenteStore.upsertClasificacion({
        ...previous,
        activa: false,
      });

      if (
        previous.tierCalculado !== 'AAA — Cuenta clave' &&
        tierCalculado === 'AAA — Cuenta clave'
      ) {
        brokerNotificationStore.add({
          type: 'alert',
          priority: 'high',
          title: `📈 Lead reclasificado a AAA — ${input.empresa}`,
          body: `Antes: ${previous.tierCalculado} (${previous.puntajeTotal} pts). Ahora: AAA (${puntajeTotal} pts). Considera reasignar a un LO Senior.`,
          area: 'CEM',
          opportunityId: input.opportunityId,
          actionPath: '/parks/asignacion',
          actionLabel: 'Revisar',
          audienceRoleLabels: ['Parks — Director Comercial'],
        });
      } else if (
        previous.tierCalculado === 'AAA — Cuenta clave' &&
        tierCalculado !== 'AAA — Cuenta clave'
      ) {
        brokerNotificationStore.add({
          type: 'alert',
          priority: 'normal',
          title: `📉 Lead reclasificado — bajó de AAA a ${tierCalculado}`,
          body: `Antes: ${previous.puntajeTotal} pts. Ahora: ${puntajeTotal} pts. Revisa si la asignación actual sigue siendo correcta.`,
          area: 'CEM',
          opportunityId: input.opportunityId,
          actionPath: '/parks/asignacion',
          actionLabel: 'Revisar',
          audienceRoleLabels: ['Parks — Director Comercial'],
        });
      }
    }

    const draft: ClasificacionLead = {
      id: `clasif-${randomUUID()}`,
      opportunityId: input.opportunityId,
      empresa: input.empresa,
      fechaClasificacion: new Date().toISOString(),
      versionClasificacion,
      activa: true,
      factorM2,
      factorPresupuesto,
      factorCanal,
      factorSector,
      factorInternacional,
      factorHistorialCliente: factorHistorial,
      puntajeTotal,
      tierCalculado,
      explicacionTier: '',
      iaScore: useIaScoring ? iaRecommendation.score : null,
      iaRazonTop: useIaScoring ? iaRecommendation.razon : null,
      scoreFinalUsado: useIaScoring ? 'IA' : 'Reglas',
      loSugerido1,
      loSugerido2,
      loSugerido3,
      razonSugerencia1,
      alertaCarga,
      mensajeCarga,
      situacionFallback,
      pendienteAsignacion: true,
      asignacionProvisionalCem,
    };

    draft.explicacionTier = buildExplicacion(draft);
    asignacionInteligenteStore.upsertClasificacion(draft);

    const horasLimite =
      tierCalculado === 'AAA — Cuenta clave'
        ? config.maxHorasSinAsignarAaa
        : config.maxHorasSinAsignarEstandar;

    brokerNotificationStore.add({
      type: 'alert',
      priority: tierCalculado === 'AAA — Cuenta clave' ? 'high' : 'normal',
      title: `📥 Lead ${tierCalculado} — ${input.empresa}`,
      body: `Score ${puntajeTotal}/100 · Sugerido: ${loSugerido1}. Asignar en máximo ${horasLimite}h. ${draft.explicacionTier}`,
      area: 'CEM',
      opportunityId: input.opportunityId,
      actionPath: '/parks/asignacion',
      actionLabel: 'Asignar',
      audienceRoleLabels: ['Parks — Director Comercial'],
      audienceNames: [CEM_NOMBRE],
    });

    return draft;
  },

  clasificarOpportunity: async (
    opportunityId: string,
  ): Promise<ClasificacionLead> => {
    const opportunity =
      await twentyDataService.getOpportunityById(opportunityId);

    if (!opportunity) {
      throw new Error('Opportunity not found');
    }

    const opportunityRecord = opportunity as {
      name?: string;
      m2Requeridos?: number;
      presupuestoMensualUsd?: number;
      canalOrigen?: string;
      giroEmpresa?: string;
      paisOrigen?: string;
    };
    const canal = String(opportunityRecord.canalOrigen ?? '');
    let brokerClasificacion: string | undefined;

    if (/top\s*10/i.test(canal)) {
      brokerClasificacion = 'Top 10';
    }

    return asignacionInteligenteService.clasificarLead({
      opportunityId,
      empresa: opportunityRecord.name ?? opportunityId,
      m2Requeridos: opportunityRecord.m2Requeridos,
      presupuestoMensualUsd: opportunityRecord.presupuestoMensualUsd,
      canalOrigen: opportunityRecord.canalOrigen,
      brokerClasificacion,
      giroEmpresa: opportunityRecord.giroEmpresa,
      paisOrigen: opportunityRecord.paisOrigen,
    });
  },

  confirmarAsignacion: async (input: {
    opportunityId: string;
    leasingOfficerName: string;
    assignedBy: string;
    razonCambio?: string;
  }): Promise<ClasificacionLead> => {
    let clasificacion =
      asignacionInteligenteStore.getActivaByOpportunity(input.opportunityId);

    if (!clasificacion) {
      clasificacion = await asignacionInteligenteService.clasificarOpportunity(
        input.opportunityId,
      );
    }

    const isDemoOpportunity = input.opportunityId.startsWith('demo-');

    if (!isDemoOpportunity) {
      await commercialLeadService.assignLead({
        opportunityId: input.opportunityId,
        leasingOfficerName: input.leasingOfficerName,
        assignedBy: input.assignedBy,
      });
    } else {
      brokerNotificationStore.add({
        type: 'task',
        priority: 'high',
        title: `Lead asignado a ${input.leasingOfficerName}`,
        body: `Asignado por ${input.assignedBy} (demo). Contactar según SLA del tier.`,
        area: 'Comercial',
        opportunityId: input.opportunityId,
        audienceNames: [input.leasingOfficerName],
        audienceRoleLabels: [],
      });
    }

    const cambio =
      Boolean(clasificacion.loSugerido1) &&
      clasificacion.loSugerido1 !== input.leasingOfficerName;

    const updated: ClasificacionLead = {
      ...clasificacion,
      loAsignadoFinal: input.leasingOfficerName,
      asignadoPor: input.assignedBy,
      fechaAsignacionFinal: new Date().toISOString(),
      pendienteAsignacion: false,
      asignacionProvisionalCem: input.leasingOfficerName === CEM_NOMBRE,
      cemCambioSugerencia: cambio,
      razonCambio: cambio
        ? input.razonCambio ?? 'CEM cambió la sugerencia del sistema'
        : null,
    };

    asignacionInteligenteStore.upsertClasificacion(updated);

    // Bump carga for assigned LO if tracked
    const lo = asignacionInteligenteStore
      .listLos()
      .find((item) => item.nombre === input.leasingOfficerName);

    if (lo) {
      asignacionInteligenteStore.setLoCarga(lo.id, lo.cargaActual + 1);
    }

    const config = asignacionInteligenteStore.getConfig();
    const horasContacto =
      clasificacion.tierCalculado === 'AAA — Cuenta clave'
        ? config.maxHorasSinContactoTrasAsignacionAaa
        : config.maxHorasSinContactoTrasAsignacionEstandar;

    try {
      await twentyDataService.createTask(
        `[LO] Primer contacto — ${clasificacion.tierCalculado}`,
        `Contactar a ${clasificacion.empresa} en máximo ${horasContacto} horas. Oportunidad: ${input.opportunityId}`,
      );
    } catch {
      // optional
    }

    return updated;
  },

  seedDemoScenarios: (): ClasificacionLead[] => {
    asignacionInteligenteStore.resetDemo();

    // Mix of AAA / Estándar / Junior before overloading AAA seats
    const samsung = asignacionInteligenteService.clasificarLead({
      opportunityId: 'demo-lead-samsung',
      empresa: 'Samsung Electronics México',
      m2Requeridos: 20_000,
      presupuestoMensualUsd: 1_700_000,
      canalOrigen: 'Broker',
      brokerClasificacion: 'Top 10',
      giroEmpresa: 'Manufactura electrónica',
      paisOrigen: 'Corea del Sur',
    });

    const foxconn = asignacionInteligenteService.clasificarLead({
      opportunityId: 'demo-lead-foxconn',
      empresa: 'Foxconn México S.A.',
      m2Requeridos: 15_000,
      presupuestoMensualUsd: 1_275_000,
      canalOrigen: 'Recomendación',
      giroEmpresa: 'Manufactura electrónica',
      paisOrigen: 'Taiwan',
    });

    const lg = asignacionInteligenteService.clasificarLead({
      opportunityId: 'demo-lead-lg',
      empresa: 'LG Electronics Guadalajara',
      m2Requeridos: 12_500,
      presupuestoMensualUsd: 980_000,
      canalOrigen: 'Broker',
      brokerClasificacion: 'Top 10',
      giroEmpresa: 'Manufactura electrónica',
      paisOrigen: 'Corea del Sur',
      historialClienteParks: true,
    });

    const catPharma = asignacionInteligenteService.clasificarLead({
      opportunityId: 'demo-lead-catalent',
      empresa: 'Catalent Pharma Solutions',
      m2Requeridos: 11_000,
      presupuestoMensualUsd: 920_000,
      canalOrigen: 'CEM',
      giroEmpresa: 'Farmacéutica',
      paisOrigen: 'Estados Unidos',
    });

    const logimex = asignacionInteligenteService.clasificarLead({
      opportunityId: 'demo-lead-logimex',
      empresa: 'LogiMex S.A. de C.V.',
      m2Requeridos: 5_000,
      presupuestoMensualUsd: 425_000,
      canalOrigen: 'Página web',
      giroEmpresa: 'Logística y distribución',
      paisOrigen: 'México',
    });

    const meli = asignacionInteligenteService.clasificarLead({
      opportunityId: 'demo-lead-meli',
      empresa: 'Mercado Libre Fulfillment MX',
      m2Requeridos: 7_200,
      presupuestoMensualUsd: 610_000,
      canalOrigen: 'Broker',
      brokerClasificacion: 'Top 10',
      giroEmpresa: 'E-commerce fulfillment',
      paisOrigen: 'México',
    });

    const dhl = asignacionInteligenteService.clasificarLead({
      opportunityId: 'demo-lead-dhl',
      empresa: 'DHL Supply Chain Bajío',
      m2Requeridos: 4_800,
      presupuestoMensualUsd: 390_000,
      canalOrigen: 'Recomendación',
      giroEmpresa: 'Logística',
      paisOrigen: 'Alemania',
    });

    const nestle = asignacionInteligenteService.clasificarLead({
      opportunityId: 'demo-lead-nestle',
      empresa: 'Nestlé Distribución Norte',
      m2Requeridos: 3_600,
      presupuestoMensualUsd: 310_000,
      canalOrigen: 'Página web',
      giroEmpresa: 'Distribución',
      paisOrigen: 'Suiza',
      historialClienteParks: true,
    });

    const callCenter = asignacionInteligenteService.clasificarLead({
      opportunityId: 'demo-lead-callcenter',
      empresa: 'Contacto Plus Call Center',
      m2Requeridos: 1_200,
      presupuestoMensualUsd: 45_000,
      canalOrigen: 'Página web',
      giroEmpresa: 'Call center',
      paisOrigen: 'México',
    });

    const coldStart = asignacionInteligenteService.clasificarLead({
      opportunityId: 'demo-lead-coldstart',
      empresa: 'FreshCold Startups MX',
      m2Requeridos: 800,
      presupuestoMensualUsd: 28_000,
      canalOrigen: 'Redes sociales',
      giroEmpresa: 'Almacenamiento en frío',
      paisOrigen: 'México',
    });

    const adsLead = asignacionInteligenteService.clasificarLead({
      opportunityId: 'demo-lead-ads-pack',
      empresa: 'PackFast Empaques',
      m2Requeridos: 1_500,
      presupuestoMensualUsd: 55_000,
      canalOrigen: 'Google Ads',
      giroEmpresa: 'Manufactura ligera',
      paisOrigen: 'México',
    });

    const solarCo = asignacionInteligenteService.clasificarLead({
      opportunityId: 'demo-lead-solarco',
      empresa: 'SolarCo Componentes',
      m2Requeridos: 9_500,
      presupuestoMensualUsd: 780_000,
      canalOrigen: 'Broker',
      brokerClasificacion: 'No top 10',
      giroEmpresa: 'Energía renovable',
      paisOrigen: 'China',
    });

    // Force carga máxima on AAA LOs for Situación C/B demo (BMW + extra AAA)
    for (const lo of asignacionInteligenteStore.listLos()) {
      if (lo.nivelLo === 'AAA — Senior') {
        asignacionInteligenteStore.setLoCarga(lo.id, lo.cargaMaximaLeads);
      }
    }

    const bmw = asignacionInteligenteService.clasificarLead({
      opportunityId: 'demo-lead-bmw',
      empresa: 'BMW Manufactura México',
      m2Requeridos: 18_000,
      presupuestoMensualUsd: 1_500_000,
      canalOrigen: 'CEM',
      giroEmpresa: 'Manufactura automotriz',
      paisOrigen: 'Alemania',
    });

    const tesla = asignacionInteligenteService.clasificarLead({
      opportunityId: 'demo-lead-tesla',
      empresa: 'Tesla Energy Storage MX',
      m2Requeridos: 14_000,
      presupuestoMensualUsd: 1_350_000,
      canalOrigen: 'Broker',
      brokerClasificacion: 'Top 10',
      giroEmpresa: 'Semiconductores',
      paisOrigen: 'Estados Unidos',
    });

    // Push Estándar LO near capacity for carga alerts on mid-tier leads
    const bruyel = asignacionInteligenteStore
      .listLos()
      .find((lo) => lo.id === 'lo-bruyel');
    if (bruyel) {
      asignacionInteligenteStore.setLoCarga(
        bruyel.id,
        Math.max(bruyel.cargaActual, bruyel.cargaMaximaLeads - 1),
      );
    }

    const autoParts = asignacionInteligenteService.clasificarLead({
      opportunityId: 'demo-lead-autoparts',
      empresa: 'AutoParts Bajío Logística',
      m2Requeridos: 4_200,
      presupuestoMensualUsd: 340_000,
      canalOrigen: 'Página web',
      giroEmpresa: 'Logística y distribución',
      paisOrigen: 'México',
    });

    // Age some classifications for SLA urgency in the UI
    const agedSamsung: ClasificacionLead = {
      ...samsung,
      fechaClasificacion: asignacionInteligenteStore.hoursAgoIso(2.5),
    };
    asignacionInteligenteStore.upsertClasificacion(agedSamsung);

    const agedLogimex: ClasificacionLead = {
      ...logimex,
      fechaClasificacion: asignacionInteligenteStore.hoursAgoIso(20),
    };
    asignacionInteligenteStore.upsertClasificacion(agedLogimex);

    const agedCallCenter: ClasificacionLead = {
      ...callCenter,
      fechaClasificacion: asignacionInteligenteStore.hoursAgoIso(18),
    };
    asignacionInteligenteStore.upsertClasificacion(agedCallCenter);

    const agedMeli: ClasificacionLead = {
      ...meli,
      fechaClasificacion: asignacionInteligenteStore.hoursAgoIso(6),
    };
    asignacionInteligenteStore.upsertClasificacion(agedMeli);

    return [
      agedSamsung,
      foxconn,
      lg,
      catPharma,
      agedLogimex,
      agedMeli,
      dhl,
      nestle,
      agedCallCenter,
      coldStart,
      adsLead,
      solarCo,
      bmw,
      tesla,
      autoParts,
    ];
  },

  runEscalationScan: async (): Promise<{ escalated: number }> => {
    const config = asignacionInteligenteStore.getConfig();
    const now = Date.now();
    let escalated = 0;

    for (const clasificacion of asignacionInteligenteStore
      .listClasificaciones()
      .filter((item) => item.activa && item.pendienteAsignacion)) {
      const hoursPending =
        (now - new Date(clasificacion.fechaClasificacion).getTime()) /
        (1000 * 60 * 60);
      const limit =
        clasificacion.tierCalculado === 'AAA — Cuenta clave'
          ? config.maxHorasSinAsignarAaa
          : config.maxHorasSinAsignarEstandar;

      if (hoursPending < limit) {
        continue;
      }

      brokerNotificationStore.add({
        type: 'alert',
        priority: 'high',
        title:
          clasificacion.tierCalculado === 'AAA — Cuenta clave'
            ? `🚨 Lead AAA sin asignar — ${clasificacion.empresa}`
            : `⚠️ Lead Estándar sin asignar — 24 horas · ${clasificacion.empresa}`,
        body: `Lleva ${Math.round(hoursPending)}h sin asignar (límite ${limit}h). Acción requerida.`,
        area: 'CEM',
        opportunityId: clasificacion.opportunityId,
        actionPath: '/parks/asignacion',
        actionLabel: 'Asignar ahora',
        audienceRoleLabels: [
          'Parks — Director Comercial',
          'Parks — CEO',
        ],
      });
      escalated += 1;
    }

    // Situación F — assigned but no first contact
    for (const clasificacion of asignacionInteligenteStore
      .listClasificaciones()
      .filter(
        (item) =>
          item.activa &&
          !item.pendienteAsignacion &&
          item.loAsignadoFinal &&
          item.fechaAsignacionFinal,
      )) {
      const primera = asignacionInteligenteStore.getPrimeraActividad(
        clasificacion.opportunityId,
      );

      if (primera) {
        continue;
      }

      const hoursSinceAssign =
        (now - new Date(clasificacion.fechaAsignacionFinal!).getTime()) /
        (1000 * 60 * 60);
      const limit =
        clasificacion.tierCalculado === 'AAA — Cuenta clave'
          ? config.maxHorasSinContactoTrasAsignacionAaa
          : config.maxHorasSinContactoTrasAsignacionEstandar;

      if (hoursSinceAssign < limit) {
        continue;
      }

      brokerNotificationStore.add({
        type: 'alert',
        priority: 'high',
        title: `⚠️ Lead ${clasificacion.tierCalculado} sin contacto tras asignación`,
        body: `${clasificacion.loAsignadoFinal} no ha registrado contacto con ${clasificacion.empresa} en ${Math.round(hoursSinceAssign)}h (límite ${limit}h).`,
        area: 'CEM',
        opportunityId: clasificacion.opportunityId,
        actionPath: `/object/opportunity/${clasificacion.opportunityId}`,
        actionLabel: 'Ver lead',
        audienceRoleLabels: ['Parks — Director Comercial'],
        audienceNames: [clasificacion.loAsignadoFinal!],
      });
      escalated += 1;
    }

    return { escalated };
  },
};
