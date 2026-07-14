import { isParksSelectValueEqual } from '@/parks-industrial/utils/parks-select-value.util';

export const LEGAL_PIPELINE_STAGES = [
  { id: 'nuevo', label: 'Nuevo', estatus: 'Nuevo', responsable: 'Catalina' },
  {
    id: 'asignado',
    label: 'Asignado',
    estatus: 'Asignado',
    responsable: 'Abogado asignado',
  },
  {
    id: 'docs-incompletas',
    label: 'Documentación incompleta',
    estatus: 'Documentación incompleta',
    responsable: 'Comercial / Cliente',
  },
  {
    id: 'elaboracion',
    label: 'En elaboración',
    estatus: 'En elaboración',
    responsable: 'Abogado asignado',
  },
  {
    id: 'primera-version',
    label: 'Primera versión enviada',
    estatus: 'Primera versión enviada',
    responsable: 'Abogado asignado',
  },
  {
    id: 'negociacion',
    label: 'En negociación con cliente',
    estatus: 'En negociación con cliente',
    responsable: 'Abogado asignado',
  },
  {
    id: 'version-final',
    label: 'Versión final aceptada',
    estatus: 'Versión final aceptada',
    responsable: 'Abogado asignado',
  },
  {
    id: 'espera-firma-cliente',
    label: 'En espera de firma del cliente',
    estatus: 'En espera de firma del cliente',
    responsable: 'Cliente',
  },
  {
    id: 'cotejo',
    label: 'Cotejo pendiente',
    estatus: 'Cotejo pendiente',
    responsable: 'Catalina',
  },
  {
    id: 'firmas',
    label: 'Flujo de firmas',
    estatus: 'Flujo de firmas',
    responsable: 'Firmantes internos',
  },
  {
    id: 'funo',
    label: 'Enviado a FUNO/NEXT',
    estatus: 'Enviado a FUNO/NEXT',
    responsable: 'Apoderados FUNO',
  },
  {
    id: 'cerrado',
    label: 'Firmado — cerrado',
    estatus: 'Firmado — cerrado',
    responsable: 'Legal',
  },
] as const;

export const LEGAL_KANBAN_STAGES = LEGAL_PIPELINE_STAGES.filter(
  (stage) => stage.id !== 'cerrado',
);

export const LEGAL_LAWYER_OPTIONS = [
  'Miguel Soto',
  'Abogado 2 — Parks Legal',
  'Abogado 3 — Parks Legal',
] as const;

export const LEGAL_LAWYER_DIRECTORY: ReadonlyArray<{
  name: string;
  email: string;
}> = [
  { name: 'Miguel Soto', email: 'miguel.soto@apple.dev' },
] as const;

export const resolveLegalLawyerEmail = (lawyerName: string): string | null => {
  const normalizedName = lawyerName.trim().toLowerCase();
  const match = LEGAL_LAWYER_DIRECTORY.find(
    (lawyer) => lawyer.name.toLowerCase() === normalizedName,
  );

  return match?.email ?? null;
};

export const resolveLegalLawyerNameFromEmail = (
  email?: string | null,
): string | null => {
  if (!email) {
    return null;
  }

  const match = LEGAL_LAWYER_DIRECTORY.find(
    (lawyer) => lawyer.email.toLowerCase() === email.trim().toLowerCase(),
  );

  return match?.name ?? null;
};

export const LEGAL_VERSION_DIRIGIDO_A_OPTIONS = [
  'Cliente',
  'Broker',
  'FUNO/NEXT',
  'Subdirector Legal',
  'CEO',
] as const;

export const LEGAL_VERSION_RESPUESTA_OPTIONS = [
  'Pendiente',
  'Aceptada',
  'Modificaciones solicitadas',
  'Rechazada',
] as const;

export type LegalTimelineStageStatus = 'completed' | 'active' | 'pending';

export type LegalWorkflowActionTab =
  | 'elaboracion'
  | 'firma'
  | 'validacion'
  | 'operaciones';

export type LegalTimelineStage = {
  id: string;
  label: string;
  estatus: string;
  responsable: string;
  status: LegalTimelineStageStatus;
  actionTab?: LegalWorkflowActionTab;
  actionLabel?: string;
};

// CTA from the active timeline stage → the tab where the work happens
export const LEGAL_STAGE_ACTION_BY_ID: Record<
  string,
  { tab: LegalWorkflowActionTab; label: string }
> = {
  nuevo: { tab: 'elaboracion', label: 'Asignar abogado' },
  asignado: { tab: 'elaboracion', label: 'Revisar checklist' },
  'docs-incompletas': { tab: 'elaboracion', label: 'Completar documentación' },
  elaboracion: { tab: 'elaboracion', label: 'Elaborar y registrar versión' },
  'primera-version': {
    tab: 'elaboracion',
    label: 'Registrar respuesta / siguiente versión',
  },
  negociacion: {
    tab: 'elaboracion',
    label: 'Continuar negociación de versiones',
  },
  'version-final': { tab: 'firma', label: 'Ir a cotejo y firmas' },
  'espera-firma-cliente': {
    tab: 'firma',
    label: 'Registrar recepción firmada',
  },
  cotejo: { tab: 'firma', label: 'Realizar cotejo' },
  firmas: { tab: 'firma', label: 'Registrar firmas físicas' },
  funo: { tab: 'firma', label: 'Registrar firmas FUNO/NEXT' },
  cerrado: { tab: 'operaciones', label: 'Ver handoff CxC' },
};

export const LEGAL_CLOSED_ESTATUS_LABELS = [
  'Firmado — cerrado',
  'Cancelado',
] as const;

const normalizeEstatusValue = (estatus?: string | null): string => {
  if (!estatus) {
    return 'Nuevo';
  }

  const trimmed = estatus.trim();

  const match = LEGAL_PIPELINE_STAGES.find((stage) =>
    isParksSelectValueEqual(trimmed, stage.estatus),
  );

  return match?.estatus ?? trimmed;
};

export const isParksLegalCasoActivo = (estatus?: string | null): boolean => {
  if (!estatus) {
    return true;
  }

  return !LEGAL_CLOSED_ESTATUS_LABELS.some((closedEstatus) =>
    isParksSelectValueEqual(estatus, closedEstatus),
  );
};

export const buildLegalWorkflowTimeline = (
  estatus?: string | null,
): LegalTimelineStage[] => {
  const normalizedEstatus = normalizeEstatusValue(estatus);
  const activeIndex = LEGAL_PIPELINE_STAGES.findIndex(
    (stage) => stage.estatus === normalizedEstatus,
  );
  const resolvedIndex = activeIndex >= 0 ? activeIndex : 0;

  return LEGAL_PIPELINE_STAGES.map((stage, index) => {
    let status: LegalTimelineStageStatus = 'pending';

    if (index < resolvedIndex) {
      status = 'completed';
    } else if (index === resolvedIndex) {
      status = 'active';
    }

    const stageAction = LEGAL_STAGE_ACTION_BY_ID[stage.id];

    return {
      id: stage.id,
      label: stage.label,
      estatus: stage.estatus,
      responsable: stage.responsable,
      status,
      actionTab: stageAction?.tab,
      actionLabel: stageAction?.label,
    };
  });
};

export const getLegalEstatusLabel = (estatus?: string | null): string =>
  normalizeEstatusValue(estatus);

export const matchLegalEstatus = (
  recordEstatus: string | undefined,
  stageEstatus: string,
): boolean => {
  if (!recordEstatus) {
    return stageEstatus === 'Nuevo';
  }

  return isParksSelectValueEqual(recordEstatus, stageEstatus);
};
