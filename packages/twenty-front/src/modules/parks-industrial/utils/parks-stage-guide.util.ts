import { t } from '@lingui/core/macro';

import {
  getNextParksPipelineStage,
  getParksPipelineStageLabel,
} from '@/parks-industrial/constants/parks-industrial.constants';
import { type ParksOpportunityRecord } from '@/parks-industrial/hooks/useParksRecords';
import { normalizeParksPipelineStageId } from '@/parks-industrial/utils/parksStageGateUtil';

export type ParksDealGuideTab =
  | 'resumen'
  | 'prospecto'
  | 'propuesta'
  | 'actividad'
  | 'decisores'
  | 'guion'
  | 'cotizacion'
  | 'aprobacion'
  | 'hoja';

export const PARKS_FLUJO_SECTION_IDS = {
  tour: 'parks-flujo-tour',
  cotizacion: 'parks-flujo-cotizacion',
  aprobacion: 'parks-flujo-aprobacion',
  hoja: 'parks-flujo-hoja',
  perdida: 'parks-flujo-perdida',
} as const;

export type ParksDealGuideChecklistItem = {
  id: string;
  label: string;
  done: boolean;
  targetTab?: ParksDealGuideTab;
  scrollTarget?: string;
};

export type ParksDealStageGuide = {
  stageId: string;
  stageLabel: string;
  nextStageId: string | null;
  nextStageLabel: string | null;
  title: string;
  description: string;
  checklist: ParksDealGuideChecklistItem[];
  recommendedTab: ParksDealGuideTab;
  primaryActionLabel: string;
  primaryActionKind: 'open-tab' | 'advance-stage' | 'none';
  primaryScrollTarget?: string;
  canAdvance: boolean;
  progressLabel: string;
};

const hasPositiveNumber = (value: unknown): boolean =>
  typeof value === 'number' && Number.isFinite(value) && value > 0;

const hasNonEmptyString = (value: unknown): boolean =>
  typeof value === 'string' && value.trim().length > 0;

const isApproved = (estatus?: string | null): boolean => {
  if (!estatus) {
    return false;
  }

  return (
    estatus === 'APROBADA' || estatus.toLowerCase().includes('aprobada')
  );
};

const countDone = (checklist: ParksDealGuideChecklistItem[]): string => {
  const doneCount = checklist.filter((item) => item.done).length;

  return t`${doneCount} de ${checklist.length} listos`;
};

export const buildParksDealStageGuide = (
  deal: ParksOpportunityRecord,
): ParksDealStageGuide => {
  const stageId = normalizeParksPipelineStageId(deal.stage);
  const nextStageId = getNextParksPipelineStage(stageId);
  const nextStageLabel = nextStageId
    ? getParksPipelineStageLabel(nextStageId)
    : null;
  const stageLabel = getParksPipelineStageLabel(stageId);

  const hasAssignment =
    hasNonEmptyString(deal.asignadoPor) ||
    hasNonEmptyString(deal.leasingOfficerAsignado);
  const hasQualification =
    hasPositiveNumber(deal.m2Requeridos) &&
    hasNonEmptyString(deal.ubicacionDeseada) &&
    hasNonEmptyString(deal.giroEmpresa) &&
    hasPositiveNumber(deal.plazoContratoMeses) &&
    hasPositiveNumber(deal.presupuestoMensualUsd);
  const hasNaves =
    hasNonEmptyString(deal.naveVinculada?.id ?? deal.naveVinculadaId) ||
    hasNonEmptyString(deal.tourNavesMostradas) ||
    hasNonEmptyString(deal.motivoSinNave);
  const hasTourScheduled = hasNonEmptyString(deal.tourFecha);
  const hasTourFeedback = hasNonEmptyString(deal.tourFeedback);
  const hasQuotationReady =
    hasPositiveNumber(deal.m2Ofertados) &&
    hasPositiveNumber(deal.precioPorM2Usd);
  const hasQuotationSent = hasNonEmptyString(deal.cotizacionEnviadaEn);
  const approvalOk =
    !deal.aprobacionRequerida || isApproved(deal.estatusAprobacion);

  if (stageId === 'LEAD_RECIBIDO') {
    const checklist: ParksDealGuideChecklistItem[] = [
      {
        id: 'asignacion',
        label: t`Lead asignado por CEM`,
        done: hasAssignment,
      },
      {
        id: 'm2',
        label: t`m² requeridos`,
        done: hasPositiveNumber(deal.m2Requeridos),
      },
      {
        id: 'ubicacion',
        label: t`Ubicación deseada`,
        done: hasNonEmptyString(deal.ubicacionDeseada),
      },
      {
        id: 'giro',
        label: t`Giro de la empresa`,
        done: hasNonEmptyString(deal.giroEmpresa),
      },
      {
        id: 'plazo',
        label: t`Plazo del contrato`,
        done: hasPositiveNumber(deal.plazoContratoMeses),
      },
      {
        id: 'presupuesto',
        label: t`Presupuesto mensual`,
        done: hasPositiveNumber(deal.presupuestoMensualUsd),
      },
    ];
    const canAdvance = hasAssignment && hasQualification;

    return {
      stageId,
      stageLabel,
      nextStageId,
      nextStageLabel,
      title: t`Califica al prospecto`,
      description: t`Completa los datos de calificación para poder pasar a Prospecto calificado.`,
      checklist,
      recommendedTab: 'prospecto',
      primaryActionLabel: canAdvance
        ? t`Avanzar a ${nextStageLabel}`
        : t`Completar calificación`,
      primaryActionKind: canAdvance ? 'advance-stage' : 'open-tab',
      canAdvance,
      progressLabel: countDone(checklist),
    };
  }

  if (stageId === 'CALIFICADO') {
    const checklist: ParksDealGuideChecklistItem[] = [
      {
        id: 'naves',
        label: t`Nave(s) seleccionadas para la visita`,
        done: hasNaves,
      },
      {
        id: 'tour',
        label: t`Tour agendado (fecha, hora y asistentes)`,
        done: hasTourScheduled,
      },
    ];
    const canAdvance = hasNaves && hasTourScheduled;

    return {
      stageId,
      stageLabel,
      nextStageId,
      nextStageLabel,
      title: t`Arma y agenda la visita`,
      description: t`Elige naves, define quién va y agenda fecha/hora en Propuesta.`,
      checklist,
      recommendedTab: 'propuesta',
      primaryActionLabel: canAdvance
        ? t`Avanzar a ${nextStageLabel}`
        : t`Ir a Propuesta`,
      primaryActionKind: canAdvance ? 'advance-stage' : 'open-tab',
      canAdvance,
      progressLabel: countDone(checklist),
    };
  }

  if (stageId === 'TOUR_VISITA') {
    const checklist: ParksDealGuideChecklistItem[] = [
      {
        id: 'feedback',
        label: t`Registrar feedback de la visita`,
        done: hasTourFeedback,
        targetTab: 'cotizacion',
        scrollTarget: PARKS_FLUJO_SECTION_IDS.tour,
      },
      {
        id: 'cotizacion-datos',
        label: t`Definir m² ofertados y precio USD/m²`,
        done: hasQuotationReady,
        targetTab: 'cotizacion',
        scrollTarget: PARKS_FLUJO_SECTION_IDS.cotizacion,
      },
      {
        id: 'cotizacion-envio',
        label: t`Enviar cotización formal`,
        done: hasQuotationSent,
        targetTab: 'cotizacion',
        scrollTarget: PARKS_FLUJO_SECTION_IDS.cotizacion,
      },
    ];
    const canAdvance = hasQuotationReady && hasQuotationSent;

    return {
      stageId,
      stageLabel,
      nextStageId,
      nextStageLabel,
      title: t`Cierra la visita y manda propuesta`,
      description: t`Registra el resultado del tour y envía la cotización.`,
      checklist,
      recommendedTab: 'cotizacion',
      primaryActionLabel: canAdvance
        ? t`Avanzar a ${nextStageLabel}`
        : t`Ir a Cotización`,
      primaryActionKind: canAdvance ? 'advance-stage' : 'open-tab',
      canAdvance,
      progressLabel: countDone(checklist),
    };
  }

  if (stageId === 'COTIZACION_ENVIADA') {
    const checklist: ParksDealGuideChecklistItem[] = [
      {
        id: 'seguimiento',
        label: t`Dar seguimiento a la cotización`,
        done: true,
        targetTab: 'cotizacion',
        scrollTarget: PARKS_FLUJO_SECTION_IDS.cotizacion,
      },
      {
        id: 'aprobacion',
        label: deal.aprobacionRequerida
          ? t`Aprobación de condiciones especiales`
          : t`Sin condiciones especiales pendientes`,
        done: approvalOk,
        targetTab: 'aprobacion',
        scrollTarget: PARKS_FLUJO_SECTION_IDS.aprobacion,
      },
      {
        id: 'hoja',
        label: t`Generar y firmar Hoja de Acuerdos (LOI)`,
        done: false,
        targetTab: 'hoja',
      },
    ];

    return {
      stageId,
      stageLabel,
      nextStageId,
      nextStageLabel,
      title: t`Negocia y avanza a LOI`,
      description: t`Si hay objeciones, ajusta cotización o pide aprobación. Cuando haya acuerdo, genera la Hoja.`,
      checklist,
      recommendedTab: 'hoja',
      primaryActionLabel: t`Ir a Hoja de Acuerdos`,
      primaryActionKind: 'open-tab',
      canAdvance: approvalOk,
      progressLabel: countDone(checklist),
    };
  }

  if (stageId === 'EN_NEGOCIACION') {
    const checklist: ParksDealGuideChecklistItem[] = [
      {
        id: 'aprobacion',
        label: deal.aprobacionRequerida
          ? t`Aprobación CEM/CEO concedida`
          : t`Condiciones comerciales alineadas`,
        done: approvalOk,
        targetTab: 'aprobacion',
        scrollTarget: PARKS_FLUJO_SECTION_IDS.aprobacion,
      },
      {
        id: 'hoja',
        label: t`Generar y firmar Hoja de Acuerdos (LOI)`,
        done: false,
        targetTab: 'hoja',
      },
    ];

    return {
      stageId,
      stageLabel,
      nextStageId,
      nextStageLabel,
      title: t`Cierra negociación con LOI`,
      description: t`Resuelve aprobación si aplica y genera la Hoja de Acuerdos.`,
      checklist,
      recommendedTab: 'hoja',
      primaryActionLabel: t`Ir a Hoja de Acuerdos`,
      primaryActionKind: 'open-tab',
      canAdvance: approvalOk,
      progressLabel: countDone(checklist),
    };
  }

  if (stageId === 'HOJA_DE_ACUERDOS_FIRMADA') {
    return {
      stageId,
      stageLabel,
      nextStageId,
      nextStageLabel,
      title: t`Handoff a Legal`,
      description: t`La LOI está firmada. Legal toma el caso; da seguimiento al semáforo del contrato.`,
      checklist: [
        {
          id: 'legal',
          label: t`Caso legal creado / en revisión`,
          done: true,
        },
      ],
      recommendedTab: 'hoja',
      primaryActionLabel: t`Ver Hoja`,
      primaryActionKind: 'open-tab',
      canAdvance: false,
      progressLabel: t`1 de 1 listos`,
    };
  }

  if (stageId === 'EN_PROCESO_LEGAL') {
    return {
      stageId,
      stageLabel,
      nextStageId,
      nextStageLabel,
      title: t`Espera cierre legal`,
      description: t`Legal elabora y negocia el contrato. Apoya con documentación del cliente si te la piden.`,
      checklist: [
        {
          id: 'docs',
          label: t`Documentación del cliente disponible`,
          done: true,
        },
      ],
      recommendedTab: 'actividad',
      primaryActionLabel: t`Ver actividad`,
      primaryActionKind: 'open-tab',
      canAdvance: false,
      progressLabel: t`En proceso`,
    };
  }

  if (stageId === 'GANADO_CONTRATO_FIRMADO') {
    return {
      stageId,
      stageLabel,
      nextStageId: null,
      nextStageLabel: null,
      title: t`Deal ganado`,
      description: t`Contrato firmado. El flujo comercial de este deal está completo.`,
      checklist: [
        {
          id: 'cerrado',
          label: t`Contrato firmado`,
          done: true,
        },
      ],
      recommendedTab: 'resumen',
      primaryActionLabel: t`Ver resumen`,
      primaryActionKind: 'open-tab',
      canAdvance: false,
      progressLabel: t`Completado`,
    };
  }

  return {
    stageId,
    stageLabel,
    nextStageId,
    nextStageLabel,
    title: t`Siguiente paso`,
    description: t`Continúa el flujo comercial según la etapa actual.`,
    checklist: [],
    recommendedTab: 'resumen',
    primaryActionLabel: t`Ver resumen`,
    primaryActionKind: 'open-tab',
    canAdvance: false,
    progressLabel: t`Sin checklist`,
  };
};
