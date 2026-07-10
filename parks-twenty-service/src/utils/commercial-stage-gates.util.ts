export type StageGateOpportunity = {
  m2Requeridos?: number | null;
  ubicacionDeseada?: string | null;
  giroEmpresa?: string | null;
  plazoContratoMeses?: number | null;
  presupuestoMensualUsd?: number | null;
  naveVinculadaId?: string | null;
  motivoSinNave?: string | null;
  precioPorM2Usd?: number | null;
  m2Ofertados?: number | null;
  aprobacionRequerida?: boolean | null;
  estatusAprobacion?: string | null;
  asignadoPor?: string | null;
};

export type StageGateValidationResult =
  | { ok: true }
  | {
      ok: false;
      error: string;
      missingRequirements?: string[];
      actionHint?: string;
    };

const WORKFLOW_ONLY_STAGE_IDS = new Set([
  'HOJA_DE_ACUERDOS_FIRMADA',
  'EN_PROCESO_LEGAL',
  'GANADO_CONTRATO_FIRMADO',
]);

const GATED_STAGE_ORDER = [
  'CALIFICADO',
  'TOUR_VISITA',
  'COTIZACION_ENVIADA',
  'HOJA_DE_ACUERDOS_FIRMADA',
] as const;

const VISIBLE_STAGE_ORDER = [
  'LEAD_RECIBIDO',
  'CALIFICADO',
  'TOUR_VISITA',
  'COTIZACION_ENVIADA',
  'EN_NEGOCIACION',
  'HOJA_DE_ACUERDOS_FIRMADA',
  'EN_PROCESO_LEGAL',
  'GANADO_CONTRATO_FIRMADO',
] as const;

const hasValue = (value: unknown): boolean => {
  if (typeof value === 'number') {
    return Number.isFinite(value) && value > 0;
  }

  if (typeof value === 'string') {
    return value.trim().length > 0;
  }

  return value !== null && value !== undefined;
};

const isApproved = (estatus: string | null | undefined): boolean => {
  if (!estatus) {
    return false;
  }

  return (
    estatus === 'APROBADA' ||
    estatus.toLowerCase().includes('aprobada')
  );
};

const normalizeStageId = (stage: string): string =>
  stage
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '')
    .trim()
    .toUpperCase()
    .replace(/[^A-Z0-9]+/g, '_')
    .replace(/^_|_$/g, '');

const getStageIndex = (stageId: string): number =>
  VISIBLE_STAGE_ORDER.indexOf(
    stageId as (typeof VISIBLE_STAGE_ORDER)[number],
  );

const collectCalificadoRequirements = (
  opportunity: StageGateOpportunity,
): string[] => {
  const missing: string[] = [];

  if (!hasValue(opportunity.m2Requeridos)) {
    missing.push('m² requeridos');
  }

  if (!hasValue(opportunity.ubicacionDeseada)) {
    missing.push('Ubicación deseada');
  }

  if (!hasValue(opportunity.giroEmpresa)) {
    missing.push('Giro de la empresa');
  }

  if (!hasValue(opportunity.plazoContratoMeses)) {
    missing.push('Plazo del contrato (meses)');
  }

  if (!hasValue(opportunity.presupuestoMensualUsd)) {
    missing.push('Presupuesto mensual (USD)');
  }

  return missing;
};

const collectTourRequirements = (
  opportunity: StageGateOpportunity,
): string[] => {
  if (
    hasValue(opportunity.naveVinculadaId) ||
    hasValue(opportunity.motivoSinNave)
  ) {
    return [];
  }

  return ['Nave vinculada o motivo documentado de “sin nave”'];
};

const collectCotizacionRequirements = (
  opportunity: StageGateOpportunity,
): string[] => {
  const missing: string[] = [];

  if (!hasValue(opportunity.precioPorM2Usd)) {
    missing.push('Precio por m² (USD)');
  }

  if (!hasValue(opportunity.m2Ofertados)) {
    missing.push('m² ofertados');
  }

  return missing;
};

const collectHojaRequirements = (
  opportunity: StageGateOpportunity,
): string[] => {
  if (
    opportunity.aprobacionRequerida &&
    !isApproved(opportunity.estatusAprobacion)
  ) {
    return ['Aprobación de condiciones especiales (CEM o CEO)'];
  }

  return [];
};

const collectRequirementsUpToStage = (
  targetStageId: string,
  opportunity: StageGateOpportunity,
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

const getWorkflowOnlyHint = (stageId: string): string => {
  if (stageId === 'HOJA_DE_ACUERDOS_FIRMADA') {
    return 'Genera la Hoja de Acuerdos desde el tab Flujo comercial';
  }

  if (stageId === 'EN_PROCESO_LEGAL') {
    return 'Se activa al firmar la Hoja y completar el handoff a Legal';
  }

  if (stageId === 'GANADO_CONTRATO_FIRMADO') {
    return 'Se alcanza cuando Legal cierra el contrato con todas las firmas';
  }

  return 'Usa el flujo comercial en lugar de arrastrar la card';
};

export const validateCommercialStageTransition = (
  targetStage: string,
  opportunity: StageGateOpportunity,
): StageGateValidationResult => {
  const normalizedTarget = normalizeStageId(targetStage);

  if (WORKFLOW_ONLY_STAGE_IDS.has(normalizedTarget)) {
    return {
      ok: false,
      error: 'Esta etapa no se asigna arrastrando la card en el kanban',
      missingRequirements: [],
      actionHint: getWorkflowOnlyHint(normalizedTarget),
    };
  }

  const targetIndex = getStageIndex(normalizedTarget);

  if (
    targetIndex > getStageIndex('LEAD_RECIBIDO') &&
    !hasValue(opportunity.asignadoPor)
  ) {
    return {
      ok: false,
      error: 'El lead debe ser asignado por CEM antes de avanzar',
      missingRequirements: ['Asignación del Leasing Officer (Cola CEM)'],
      actionHint: 'Asigna el lead en Dashboard → Cola CEM',
    };
  }

  const highestGatedStage = GATED_STAGE_ORDER.reduce<string | null>(
    (highest, stageId) => {
      const gatedIndex = getStageIndex(stageId);

      if (gatedIndex < 0 || targetIndex < 0) {
        return highest;
      }

      if (targetIndex >= gatedIndex) {
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
        error: `No puedes avanzar a esta etapa todavía`,
        missingRequirements,
        actionHint:
          'Completa los campos en el detalle del deal o usa el tab Flujo comercial',
      };
    }
  }

  return { ok: true };
};
