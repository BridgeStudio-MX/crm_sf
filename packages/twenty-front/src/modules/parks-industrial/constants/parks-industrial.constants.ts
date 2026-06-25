export type ParksPipelineStageColor =
  | 'gray'
  | 'sky'
  | 'blue'
  | 'turquoise'
  | 'purple'
  | 'orange'
  | 'yellow'
  | 'green';

export const PARKS_PIPELINE_STAGES = [
  { id: 'LEAD_RECIBIDO', label: 'Prospecto nuevo', color: 'gray' },
  { id: 'CALIFICADO', label: 'Prospecto calificado', color: 'sky' },
  { id: 'TOUR_VISITA', label: 'Visita agendada', color: 'blue' },
  { id: 'COTIZACION_ENVIADA', label: 'Propuesta enviada', color: 'turquoise' },
  { id: 'EN_NEGOCIACION', label: 'Negociación', color: 'purple' },
  { id: 'HOJA_FIRMADA', label: 'Letter of Intent (LOI)', color: 'orange' },
  { id: 'EN_PROCESO_LEGAL', label: 'Contrato en revisión legal', color: 'yellow' },
  { id: 'GANADO', label: 'Contrato firmado', color: 'green' },
  { id: 'PERDIDO', label: 'Cancelado', color: 'gray' },
] as const satisfies ReadonlyArray<{
  id: string;
  label: string;
  color: ParksPipelineStageColor;
}>;

export const getParksPipelineStageLabel = (stageId?: string | null): string => {
  const stage = PARKS_PIPELINE_STAGES.find(
    (pipelineStage) => pipelineStage.id === stageId,
  );

  return stage?.label ?? stageId ?? 'Sin etapa';
};

export const getParksPipelineStageColor = (
  stageId?: string | null,
): ParksPipelineStageColor => {
  const stage = PARKS_PIPELINE_STAGES.find(
    (pipelineStage) => pipelineStage.id === stageId,
  );

  return stage?.color ?? 'gray';
};

export const getNextParksPipelineStage = (
  currentStageId?: string | null,
): string | null => {
  const visibleStages = PARKS_VISIBLE_PIPELINE_STAGES.map((stage) => stage.id);
  const currentIndex = visibleStages.indexOf(currentStageId ?? '');

  if (currentIndex < 0 || currentIndex >= visibleStages.length - 1) {
    return null;
  }

  return visibleStages[currentIndex + 1] ?? null;
};

export const PARKS_VISIBLE_PIPELINE_STAGES = PARKS_PIPELINE_STAGES.filter(
  (stage) => stage.id !== 'PERDIDO',
);

export const PARKS_APPROVAL_STAGES = [
  { id: 'comercial', label: 'Revisión Comercial', responsable: 'Héctor' },
  { id: 'legal', label: 'Revisión Legal', responsable: 'Catalina' },
  {
    id: 'oracle',
    label: 'Aprobación Grupo (Oracle)',
    responsable: 'En configuración',
  },
  { id: 'firma', label: 'Firma Final', responsable: 'CEO / apoderado' },
] as const;

export type ParksApprovalStageId =
  (typeof PARKS_APPROVAL_STAGES)[number]['id'];

export const getParksApprovalStageLabel = (
  stageId: ParksApprovalStageId,
): string => {
  const stage = PARKS_APPROVAL_STAGES.find(
    (approvalStage) => approvalStage.id === stageId,
  );

  return stage?.label ?? stageId;
};

const APPROVAL_STAGE_KEY = 'APROBACION_ETAPA';

export const parseParksApprovalStage = (
  notasCatalina?: string | null,
): ParksApprovalStageId => {
  if (!notasCatalina) {
    return 'comercial';
  }

  const match = notasCatalina.match(
    new RegExp(`${APPROVAL_STAGE_KEY}:(comercial|legal|oracle|firma)`),
  );

  return (match?.[1] as ParksApprovalStageId | undefined) ?? 'comercial';
};

export const buildParksApprovalNotas = (
  stage: ParksApprovalStageId,
  comentario?: string,
): string => {
  const base = `${APPROVAL_STAGE_KEY}:${stage}`;
  return comentario ? `${base}\n${comentario}` : base;
};

export const getNextParksApprovalStage = (
  current: ParksApprovalStageId,
): ParksApprovalStageId | null => {
  const order: ParksApprovalStageId[] = [
    'comercial',
    'legal',
    'oracle',
    'firma',
  ];
  const index = order.indexOf(current);

  return index < order.length - 1 ? order[index + 1]! : null;
};

export type ParksApprovalTimelineStage = {
  id: ParksApprovalStageId;
  label: string;
  responsable: string;
  status: 'completed' | 'active' | 'pending';
  comentarios?: string;
};

export const buildParksApprovalTimeline = (
  currentStage: ParksApprovalStageId,
  comentarios?: string,
): ParksApprovalTimelineStage[] => {
  const stageOrder: ParksApprovalStageId[] = [
    'comercial',
    'legal',
    'oracle',
    'firma',
  ];
  const currentIndex = stageOrder.indexOf(currentStage);

  return PARKS_APPROVAL_STAGES.map((stage, index) => {
    let status: ParksApprovalTimelineStage['status'] = 'pending';

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

export const PARQUE_COORDINATES: Record<
  string,
  { lat: number; lng: number }
> = {
  'Parques del Bajío - Silao': { lat: 20.9356, lng: -101.4456 },
  'Guadalajara Park': { lat: 20.4597, lng: -103.3126 },
  'El Salto Park III': { lat: 20.5318, lng: -103.1789 },
  'Parque Industrial Guadalajara Norte': { lat: 20.5318, lng: -103.1789 },
  'T-MexPark': { lat: 19.5139, lng: -98.8829 },
  'Toluca Parks III': { lat: 19.285, lng: -99.61 },
  'TultiPark II': { lat: 19.647, lng: -99.1685 },
  'TlanePark IV': { lat: 19.539, lng: -99.1955 },
  'GuadalupePark I': { lat: 25.6769, lng: -100.2565 },
};

type ParqueCoordinateRule = {
  keywords: string[];
  coords: { lat: number; lng: number };
};

// Most specific rules first — legacy names and ubicación keywords before regional fallbacks
const PARQUE_COORDINATE_RULES: ParqueCoordinateRule[] = [
  {
    keywords: ['guadalajara park'],
    coords: { lat: 20.4597, lng: -103.3126 },
  },
  {
    keywords: ['el salto park iii', 'el salto park'],
    coords: { lat: 20.5318, lng: -103.1789 },
  },
  {
    keywords: ['parque industrial guadalajara norte'],
    coords: { lat: 20.5318, lng: -103.1789 },
  },
  {
    keywords: ['t-mexpark'],
    coords: { lat: 19.5139, lng: -98.8829 },
  },
  {
    keywords: ['toluca parks iii'],
    coords: { lat: 19.285, lng: -99.61 },
  },
  {
    keywords: ['tultipark ii'],
    coords: { lat: 19.647, lng: -99.1685 },
  },
  {
    keywords: ['tlanepark iv'],
    coords: { lat: 19.539, lng: -99.1955 },
  },
  {
    keywords: ['guadalupepark'],
    coords: { lat: 25.6769, lng: -100.2565 },
  },
  {
    keywords: ['parques del bajío', 'parques del bajio', 'silao'],
    coords: { lat: 20.9356, lng: -101.4456 },
  },
  {
    keywords: ['tlaquepaque'],
    coords: { lat: 20.4597, lng: -103.3126 },
  },
  {
    keywords: ['el salto'],
    coords: { lat: 20.5318, lng: -103.1789 },
  },
  {
    keywords: ['zapopan', 'tonalá', 'tonala', 'guadalajara', 'jalisco'],
    coords: { lat: 20.6597, lng: -103.3496 },
  },
  {
    keywords: [
      'texcoco',
      'lerma',
      'tultitlán',
      'tultitlan',
      'tlalnepantla',
      'toluca',
      'estado de méxico',
      'estado de mexico',
    ],
    coords: { lat: 19.45, lng: -99.15 },
  },
  {
    keywords: [
      'guadalupe, nuevo león',
      'guadalupe, nuevo leon',
      'apodaca',
      'monterrey',
      'nuevo león',
      'nuevo leon',
    ],
    coords: { lat: 25.6769, lng: -100.2565 },
  },
];

export const getParqueCoordinates = (
  nombre: string,
  ubicacion?: string | null,
): { lat: number; lng: number } => {
  if (PARQUE_COORDINATES[nombre]) {
    return PARQUE_COORDINATES[nombre]!;
  }

  const searchText = `${nombre ?? ''} ${ubicacion ?? ''}`.toLowerCase();

  for (const rule of PARQUE_COORDINATE_RULES) {
    const matchesRule = rule.keywords.some((keyword) =>
      searchText.includes(keyword),
    );

    if (matchesRule) {
      return rule.coords;
    }
  }

  return { lat: 23.6345, lng: -102.5528 };
};

export const PARKS_RENOVACION_STAGES = [
  { id: 'ALERTA_12_MESES', label: 'Alerta 12 meses', color: 'blue' },
  { id: 'ALERTA_6_MESES', label: 'Alerta 6 meses', color: 'sky' },
  { id: 'ALERTA_3_MESES', label: 'Alerta 3 meses', color: 'yellow' },
  { id: 'ALERTA_1_MES', label: 'Alerta 1 mes', color: 'orange' },
  { id: 'EN_NEGOCIACION', label: 'En negociación', color: 'purple' },
  { id: 'HOJA_FIRMADA', label: 'Hoja firmada', color: 'green' },
  { id: 'RENOVADO', label: 'Renovado', color: 'green' },
  { id: 'HOLDOVER_ACTIVO', label: 'Holdover activo', color: 'red' },
] as const satisfies ReadonlyArray<{
  id: string;
  label: string;
  color: ParksPipelineStageColor | 'red';
}>;

export const PARKS_HOLDOVER_STAGES = [
  { id: 'DETECTADO', label: 'Detectado', color: 'red' },
  { id: 'NOTIFICADO', label: 'Notificado', color: 'orange' },
  { id: 'CORTE_AUTORIZADO', label: 'Corte autorizado', color: 'yellow' },
  { id: 'CORTE_APLICADO', label: 'Corte aplicado', color: 'gray' },
  { id: 'EN_NEGOCIACION', label: 'En negociación', color: 'blue' },
  { id: 'RESUELTO_RENOVADO', label: 'Resuelto — renovado', color: 'green' },
  { id: 'RESUELTO_SALIDA', label: 'Resuelto — salida', color: 'green' },
  { id: 'CONDONADO', label: 'Condonado', color: 'purple' },
] as const satisfies ReadonlyArray<{
  id: string;
  label: string;
  color: ParksPipelineStageColor | 'red' | 'orange' | 'purple';
}>;

export const getParksRenovacionStageLabel = (
  stageId?: string | null,
): string => {
  const stage = PARKS_RENOVACION_STAGES.find(
    (renovacionStage) =>
      renovacionStage.id === stageId || renovacionStage.label === stageId,
  );

  return stage?.label ?? stageId ?? 'Sin etapa';
};

export const getParksHoldoverStageLabel = (stageId?: string | null): string => {
  const stage = PARKS_HOLDOVER_STAGES.find(
    (holdoverStage) =>
      holdoverStage.id === stageId || holdoverStage.label === stageId,
  );

  return stage?.label ?? stageId ?? 'Sin etapa';
};
