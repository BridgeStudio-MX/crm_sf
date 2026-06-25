import { type ApprovalStage, type ApprovalStageId } from '../types';

export const PIPELINE_STAGES = [
  { id: 'LEAD_RECIBIDO', label: 'Prospecto nuevo' },
  { id: 'CALIFICADO', label: 'Prospecto calificado' },
  { id: 'TOUR_VISITA', label: 'Visita agendada' },
  { id: 'COTIZACION_ENVIADA', label: 'Propuesta enviada' },
  { id: 'EN_NEGOCIACION', label: 'Negociación' },
  { id: 'HOJA_FIRMADA', label: 'Letter of Intent (LOI)' },
  { id: 'EN_PROCESO_LEGAL', label: 'Contrato en revisión legal' },
  { id: 'GANADO', label: 'Contrato firmado' },
  { id: 'PERDIDO', label: 'Cancelado' },
] as const;

export const APPROVAL_STAGES: {
  id: ApprovalStageId;
  label: string;
  responsable: string;
}[] = [
  { id: 'comercial', label: 'Revisión Comercial', responsable: 'Héctor' },
  { id: 'legal', label: 'Revisión Legal', responsable: 'Catalina' },
  {
    id: 'oracle',
    label: 'Aprobación Grupo (Oracle)',
    responsable: 'En configuración',
  },
  { id: 'firma', label: 'Firma Final', responsable: 'CEO / apoderado' },
];

const APPROVAL_STAGE_KEY = 'APROBACION_ETAPA';

export const parseApprovalStage = (
  notasCatalina?: string | null,
): ApprovalStageId => {
  if (!notasCatalina) {
    return 'comercial';
  }

  const match = notasCatalina.match(
    new RegExp(`${APPROVAL_STAGE_KEY}:(comercial|legal|oracle|firma)`),
  );

  return (match?.[1] as ApprovalStageId | undefined) ?? 'comercial';
};

export const buildApprovalNotas = (
  stage: ApprovalStageId,
  comentario?: string,
): string => {
  const base = `${APPROVAL_STAGE_KEY}:${stage}`;
  return comentario ? `${base}\n${comentario}` : base;
};

export const buildApprovalTimeline = (
  currentStage: ApprovalStageId,
  comentarios?: string,
): ApprovalStage[] => {
  const stageOrder: ApprovalStageId[] = [
    'comercial',
    'legal',
    'oracle',
    'firma',
  ];
  const currentIndex = stageOrder.indexOf(currentStage);

  return APPROVAL_STAGES.map((stage, index) => {
    let status: ApprovalStage['status'] = 'pending';

    if (index < currentIndex) {
      status = 'completed';
    } else if (index === currentIndex) {
      status = 'active';
    }

    return {
      ...stage,
      status,
      comentarios: index === currentIndex ? comentarios : undefined,
    };
  });
};

export const getNextApprovalStage = (
  current: ApprovalStageId,
): ApprovalStageId | null => {
  const order: ApprovalStageId[] = ['comercial', 'legal', 'oracle', 'firma'];
  const index = order.indexOf(current);

  return index < order.length - 1 ? order[index + 1]! : null;
};
