import {
  buildSelectOptions,
  type SelectOptionDefinition,
} from './parks-object-definitions';

export type PipelineDefinition = {
  name: string;
  objectNameSingular: string;
  groupByFieldName: string;
  viewIcon: string;
  viewPosition: number;
  options?: SelectOptionDefinition[];
  createFieldIfMissing?: boolean;
  fieldLabel?: string;
  updateFieldOptions?: boolean;
  fieldDefaultValue?: string;
};

const commercialStageOptions = buildSelectOptions(
  [
    'Lead recibido',
    'Calificado',
    'Tour / Visita',
    'Cotización enviada',
    'En negociación',
    'Hoja de Acuerdos firmada',
    'En proceso legal',
    'Ganado — Contrato firmado',
    'Perdido',
  ],
  [
    'gray',
    'sky',
    'blue',
    'yellow',
    'orange',
    'green',
    'green',
    'green',
    'red',
  ],
);

const renovacionStageOptions = buildSelectOptions(
  [
    'Alerta 12 meses',
    'Alerta 6 meses',
    'Alerta 3 meses',
    'Alerta 1 mes',
    'En negociación',
    'Hoja firmada',
    'Renovado',
    'Holdover activo',
  ],
  ['blue', 'sky', 'yellow', 'orange', 'purple', 'green', 'green', 'red'],
);

const holdoverStageOptions = buildSelectOptions(
  [
    'Detectado',
    'Notificado',
    'Corte autorizado',
    'Corte aplicado',
    'En negociación',
    'Resuelto — renovado',
    'Resuelto — salida',
    'Condonado',
  ],
  ['red', 'orange', 'yellow', 'gray', 'blue', 'green', 'green', 'purple'],
);

export const PARKS_PIPELINE_DEFINITIONS: PipelineDefinition[] = [
  {
    name: 'Pipeline Comercial Parks Industrial',
    objectNameSingular: 'opportunity',
    groupByFieldName: 'stage',
    viewIcon: 'IconLayoutKanban',
    viewPosition: 10,
    options: commercialStageOptions,
    updateFieldOptions: true,
    fieldLabel: 'Etapa comercial',
    fieldDefaultValue: commercialStageOptions[0]?.value,
  },
  {
    name: 'Pipeline Legal Parks Industrial',
    objectNameSingular: 'casoLegal',
    groupByFieldName: 'estatus',
    viewIcon: 'IconLayoutKanban',
    viewPosition: 10,
  },
  {
    name: 'Pipeline Renovaciones Parks Industrial',
    objectNameSingular: 'opportunity',
    groupByFieldName: 'etapaRenovacion',
    viewIcon: 'IconLayoutKanban',
    viewPosition: 11,
    options: renovacionStageOptions,
    createFieldIfMissing: true,
    fieldLabel: 'Etapa renovación',
    fieldDefaultValue: renovacionStageOptions[0]?.value,
  },
  {
    name: 'Holdovers Activos',
    objectNameSingular: 'holdover',
    groupByFieldName: 'etapaPipeline',
    viewIcon: 'IconLayoutKanban',
    viewPosition: 10,
    options: holdoverStageOptions,
    createFieldIfMissing: true,
    fieldLabel: 'Etapa pipeline',
    fieldDefaultValue: holdoverStageOptions[0]?.value,
  },
];
