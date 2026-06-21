import {
  buildSelectOptions,
  type FieldDefinition,
  type RelationDefinition,
} from './parks-object-definitions';

export const OPPORTUNITY_OBJECT_NAME = 'opportunity';

export const OPPORTUNITY_FIELD_DEFINITIONS: FieldDefinition[] = [
  {
    name: 'tipoOperacion',
    label: 'Tipo operación',
    type: 'SELECT',
    options: buildSelectOptions([
      'Arrendamiento nuevo',
      'Renovación',
      'Build-to-suit',
      'Terminación anticipada',
    ]),
  },
  { name: 'm2Requeridos', label: 'm² requeridos', type: 'NUMBER' },
  {
    name: 'condicionesEspeciales',
    label: 'Condiciones especiales',
    type: 'BOOLEAN',
  },
  {
    name: 'aprobacionRequerida',
    label: 'Aprobación requerida',
    type: 'BOOLEAN',
  },
  {
    name: 'canalOrigen',
    label: 'Canal origen',
    type: 'SELECT',
    options: buildSelectOptions([
      'Directo',
      'Broker',
      'Digital',
      'Referido',
    ]),
  },
];

export const OPPORTUNITY_RELATION_DEFINITIONS: RelationDefinition[] = [
  {
    objectNameSingular: OPPORTUNITY_OBJECT_NAME,
    name: 'naveVinculada',
    label: 'Nave vinculada',
    targetObjectNameSingular: 'nave',
    targetFieldLabel: 'Oportunidades',
    targetFieldIcon: 'IconTargetArrow',
  },
  {
    objectNameSingular: OPPORTUNITY_OBJECT_NAME,
    name: 'brokerVinculado',
    label: 'Broker vinculado',
    targetObjectNameSingular: 'broker',
    targetFieldLabel: 'Oportunidades',
    targetFieldIcon: 'IconTargetArrow',
    isNullable: true,
  },
  {
    objectNameSingular: OPPORTUNITY_OBJECT_NAME,
    name: 'inquilinoVinculado',
    label: 'Inquilino vinculado',
    targetObjectNameSingular: 'inquilino',
    targetFieldLabel: 'Oportunidades',
    targetFieldIcon: 'IconTargetArrow',
  },
];
