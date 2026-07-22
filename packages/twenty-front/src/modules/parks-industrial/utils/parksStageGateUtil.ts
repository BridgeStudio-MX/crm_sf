import { t } from '@lingui/core/macro';

import {
  getParksPipelineStageLabel,
  PARKS_PIPELINE_STAGES,
  PARKS_VISIBLE_PIPELINE_STAGES,
} from '@/parks-industrial/constants/parks-industrial.constants';
import { type ParksOpportunityRecord } from '@/parks-industrial/hooks/useParksRecords';
import { isParksSelectValueEqual } from '@/parks-industrial/utils/parks-select-value.util';

export type ParksStageGateOpportunityInput = {
  m2Requeridos?: number | null;
  ubicacionDeseada?: string | null;
  giroEmpresa?: string | null;
  plazoContratoMeses?: number | null;
  presupuestoMensualUsd?: number | null;
  naveVinculadaId?: string | null;
  tourNavesMostradas?: string | null;
  motivoSinNave?: string | null;
  precioPorM2Usd?: number | null;
  m2Ofertados?: number | null;
  aprobacionRequerida?: boolean | null;
  estatusAprobacion?: string | null;
  asignadoPor?: string | null;
};

export type ParksStageGateResult =
  | { ok: true }
  | {
      ok: false;
      error: string;
      missingRequirements: string[];
      targetStageLabel: string;
      actionHint?: string;
    };

export const PARKS_WORKFLOW_ONLY_STAGE_IDS = [
  'HOJA_DE_ACUERDOS_FIRMADA',
  'EN_PROCESO_LEGAL',
  'GANADO_CONTRATO_FIRMADO',
] as const;

const GATED_STAGE_ORDER = [
  'CALIFICADO',
  'TOUR_VISITA',
  'COTIZACION_ENVIADA',
  'HOJA_DE_ACUERDOS_FIRMADA',
] as const;

const hasPositiveNumber = (value: unknown): boolean =>
  typeof value === 'number' && Number.isFinite(value) && value > 0;

const hasNonEmptyString = (value: unknown): boolean =>
  typeof value === 'string' && value.trim().length > 0;

const isParksApprovalApproved = (
  estatusAprobacion?: string | null,
): boolean => {
  if (!estatusAprobacion) {
    return false;
  }

  return (
    estatusAprobacion === 'APROBADA' ||
    estatusAprobacion.toLowerCase().includes('aprobada')
  );
};

export const normalizeParksPipelineStageId = (
  stage?: string | null,
): string => {
  if (!stage) {
    return 'LEAD_RECIBIDO';
  }

  const matchedStage = PARKS_PIPELINE_STAGES.find(
    (pipelineStage) =>
      pipelineStage.id === stage ||
      isParksSelectValueEqual(stage, pipelineStage.label) ||
      isParksSelectValueEqual(stage, pipelineStage.id),
  );

  return matchedStage?.id ?? stage;
};

export const buildParksStageGateOpportunityInput = (
  opportunity: ParksOpportunityRecord,
): ParksStageGateOpportunityInput => ({
  m2Requeridos: opportunity.m2Requeridos,
  ubicacionDeseada: opportunity.ubicacionDeseada,
  giroEmpresa: opportunity.giroEmpresa,
  plazoContratoMeses: opportunity.plazoContratoMeses,
  presupuestoMensualUsd: opportunity.presupuestoMensualUsd,
  naveVinculadaId:
    opportunity.naveVinculada?.id ?? opportunity.naveVinculadaId,
  tourNavesMostradas: opportunity.tourNavesMostradas,
  motivoSinNave: opportunity.motivoSinNave,
  precioPorM2Usd: opportunity.precioPorM2Usd,
  m2Ofertados: opportunity.m2Ofertados,
  aprobacionRequerida: opportunity.aprobacionRequerida,
  estatusAprobacion: opportunity.estatusAprobacion,
  asignadoPor: opportunity.asignadoPor,
});

const collectCalificadoRequirements = (
  opportunity: ParksStageGateOpportunityInput,
): string[] => {
  const missing: string[] = [];

  if (!hasPositiveNumber(opportunity.m2Requeridos)) {
    missing.push(t`m² requeridos`);
  }

  if (!hasNonEmptyString(opportunity.ubicacionDeseada)) {
    missing.push(t`Ubicación deseada`);
  }

  if (!hasNonEmptyString(opportunity.giroEmpresa)) {
    missing.push(t`Giro de la empresa`);
  }

  if (!hasPositiveNumber(opportunity.plazoContratoMeses)) {
    missing.push(t`Plazo del contrato (meses)`);
  }

  if (!hasPositiveNumber(opportunity.presupuestoMensualUsd)) {
    missing.push(t`Presupuesto mensual (USD)`);
  }

  return missing;
};

const collectTourRequirements = (
  opportunity: ParksStageGateOpportunityInput,
): string[] => {
  if (
    hasNonEmptyString(opportunity.naveVinculadaId) ||
    hasNonEmptyString(opportunity.tourNavesMostradas) ||
    hasNonEmptyString(opportunity.motivoSinNave)
  ) {
    return [];
  }

  return [t`Nave(s) del tour o motivo documentado de “sin nave”`];
};

const collectCotizacionRequirements = (
  opportunity: ParksStageGateOpportunityInput,
): string[] => {
  const missing: string[] = [];

  if (!hasPositiveNumber(opportunity.precioPorM2Usd)) {
    missing.push(t`Precio por m² (USD)`);
  }

  if (!hasPositiveNumber(opportunity.m2Ofertados)) {
    missing.push(t`m² ofertados`);
  }

  return missing;
};

const collectHojaRequirements = (
  opportunity: ParksStageGateOpportunityInput,
): string[] => {
  if (
    opportunity.aprobacionRequerida &&
    !isParksApprovalApproved(opportunity.estatusAprobacion)
  ) {
    return [t`Aprobación de condiciones especiales (Director Comercial o CEO)`];
  }

  return [];
};

const collectRequirementsUpToStage = (
  targetStageId: string,
  opportunity: ParksStageGateOpportunityInput,
): string[] => {
  const targetIndex = GATED_STAGE_ORDER.indexOf(
    targetStageId as (typeof GATED_STAGE_ORDER)[number],
  );

  if (targetIndex < 0) {
    return [];
  }

  const missing = new Set<string>();

  for (let index = 0; index <= targetIndex; index += 1) {
    const stageId = GATED_STAGE_ORDER[index];

    if (stageId === 'CALIFICADO') {
      collectCalificadoRequirements(opportunity).forEach((item) =>
        missing.add(item),
      );
    }

    if (stageId === 'TOUR_VISITA') {
      collectTourRequirements(opportunity).forEach((item) => missing.add(item));
    }

    if (stageId === 'COTIZACION_ENVIADA') {
      collectCotizacionRequirements(opportunity).forEach((item) =>
        missing.add(item),
      );
    }

    if (stageId === 'HOJA_DE_ACUERDOS_FIRMADA') {
      collectHojaRequirements(opportunity).forEach((item) => missing.add(item));
    }
  }

  return Array.from(missing);
};

const getWorkflowOnlyStageHint = (stageId: string): string | undefined => {
  if (stageId === 'HOJA_DE_ACUERDOS_FIRMADA') {
    return t`Abre el deal → tab Hoja → Generar Hoja de Acuerdos`;
  }

  if (stageId === 'EN_PROCESO_LEGAL') {
    return t`Se activa al firmar la Hoja y completar el handoff a Legal`;
  }

  if (stageId === 'GANADO_CONTRATO_FIRMADO') {
    return t`Se alcanza cuando Legal cierra el contrato con todas las firmas`;
  }

  return undefined;
};

const getStageIndex = (stageId: string): number =>
  PARKS_VISIBLE_PIPELINE_STAGES.findIndex((stage) => stage.id === stageId);

export const validateParksStageTransition = (
  currentStage: string | null | undefined,
  targetStage: string,
  opportunity: ParksStageGateOpportunityInput,
): ParksStageGateResult => {
  const normalizedCurrent = normalizeParksPipelineStageId(currentStage);
  const normalizedTarget = normalizeParksPipelineStageId(targetStage);
  const targetStageLabel = getParksPipelineStageLabel(normalizedTarget);

  if (normalizedCurrent === normalizedTarget) {
    return { ok: true };
  }

  if (
    PARKS_WORKFLOW_ONLY_STAGE_IDS.includes(
      normalizedTarget as (typeof PARKS_WORKFLOW_ONLY_STAGE_IDS)[number],
    )
  ) {
    return {
      ok: false,
      error: t`La etapa “${targetStageLabel}” no se asigna arrastrando la card`,
      missingRequirements: [],
      targetStageLabel,
      actionHint: getWorkflowOnlyStageHint(normalizedTarget),
    };
  }

  const currentIndex = getStageIndex(normalizedCurrent);
  const targetIndex = getStageIndex(normalizedTarget);

  if (
    currentIndex >= 0 &&
    targetIndex >= 0 &&
    targetIndex > currentIndex &&
    normalizedCurrent === 'LEAD_RECIBIDO' &&
    !hasNonEmptyString(opportunity.asignadoPor)
  ) {
    return {
      ok: false,
      error: t`El lead debe ser asignado por Director Comercial antes de avanzar`,
      missingRequirements: [t`Asignación del Leasing Officer (Cola Director Comercial)`],
      targetStageLabel,
      actionHint: t`Asigna el lead en Dashboard → Cola Director Comercial o en /parks/leads-cem`,
    };
  }

  const highestGatedStage = GATED_STAGE_ORDER.reduce<string | null>(
    (highest, stageId) => {
      const gatedIndex = getStageIndex(stageId);
      const resolvedTargetIndex = getStageIndex(normalizedTarget);

      if (gatedIndex < 0 || resolvedTargetIndex < 0) {
        return highest;
      }

      if (resolvedTargetIndex >= gatedIndex) {
        return stageId;
      }

      return highest;
    },
    null,
  );

  if (highestGatedStage) {
    const missingRequirements = collectRequirementsUpToStage(
      highestGatedStage,
      opportunity,
    );

    if (missingRequirements.length > 0) {
      return {
        ok: false,
        error: t`No puedes mover a “${targetStageLabel}” todavía`,
        missingRequirements,
        targetStageLabel,
        actionHint: t`Completa los campos en el detalle del deal o usa los tabs Cotización / Aprobación / Hoja`,
      };
    }
  }

  return { ok: true };
};
