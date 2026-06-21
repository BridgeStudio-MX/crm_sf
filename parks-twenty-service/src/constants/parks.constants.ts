import { toSelectValue } from '../utils/select-value.util';
import { type TipoDocumentoChecklist } from '../types/parks.types';

const SLA_DIAS_HUMAN_LABELS: Record<string, number | null> = {
  'Contrato nuevo': 60,
  'Convenio renovación': 45,
  'Build-to-suit': 90,
  'Convenio aclaración': null,
  'Terminación anticipada': null,
};

export const SLA_DIAS_BY_TIPO_DOCUMENTO: Record<string, number | null> = {
  ...SLA_DIAS_HUMAN_LABELS,
  ...Object.fromEntries(
    Object.entries(SLA_DIAS_HUMAN_LABELS).map(([label, days]) => [
      toSelectValue(label),
      days,
    ]),
  ),
};

export const DEFAULT_SLA_DIAS_VARIABLE = 30;

export const CHECKLIST_DOCUMENT_TYPES: TipoDocumentoChecklist[] = [
  'Acta constitutiva',
  'Poder notarial',
  'Comprobante domicilio',
  'INE representante',
  'CSF',
  'Constancia obligaciones',
  'Estados financieros',
  'Info obligado solidario',
  'Garantía',
  'NDA/Convenio confidencialidad',
];

export const CASO_LEGAL_ESTATUS_CERRADO = 'Firmado — cerrado';
export const CASO_LEGAL_ESTATUS_CANCELADO = 'Cancelado';

export const EXPEDIENTE_ESTATUS_ACTIVO = 'Activo';
export const EXPEDIENTE_ESTATUS_ARCHIVADO_FUNO = 'Archivado FUNO';

export const INQUILINO_ESTATUS_HOLDOVER = 'En holdover';
export const NAVE_ESTATUS_RENTADA = 'Rentada';

export const HOLDOVER_ETAPA_DETECTADO = 'Detectado';
export const HOLDOVER_RESOLUCION_ACTIVO = 'Activo';

export const OPPORTUNITY_STAGE_HOJA_FIRMADA = 'Hoja de Acuerdos firmada';
export const OPPORTUNITY_STAGE_EN_PROCESO_LEGAL = 'En proceso legal';

export const CASO_LEGAL_ESTATUS_ELABORACION = 'En elaboración';
export const CASO_LEGAL_ESTATUS_DOCS_INCOMPLETAS = 'Documentación incompleta';
export const CASO_LEGAL_ESTATUS_PRIMERA_VERSION = 'Primera versión enviada';
export const CASO_LEGAL_ESTATUS_FLUJO_FIRMAS = 'Flujo de firmas';

export const FLUJO_FIRMAS_ESTATUS_FIRMADO = 'Firmado';
export const FLUJO_FIRMAS_ESTATUS_ENVIADO = 'Enviado';
export const FLUJO_FIRMAS_ESTATUS_PENDIENTE = 'Pendiente';

export const TIPO_CONTRATO_TO_TIPO_DOCUMENTO: Record<string, string> = {
  'Arrendamiento nuevo': 'Contrato nuevo',
  Renovación: 'Convenio renovación',
  Modificatorio: 'Convenio aclaración',
  'Terminación anticipada': 'Terminación anticipada',
  'Build-to-suit': 'Build-to-suit',
};

export const TIPO_DOCUMENTO_RENOVACION = 'Convenio renovación';

export const RENOVACION_ETAPA_ALERTA_12 = 'Alerta 12 meses';
export const RENOVACION_ETAPA_ALERTA_6 = 'Alerta 6 meses';
export const RENOVACION_ETAPA_ALERTA_3 = 'Alerta 3 meses';
export const RENOVACION_ETAPA_ALERTA_1 = 'Alerta 1 mes';

export const RENOVACION_ALERT_THRESHOLDS_MONTHS = [12, 6, 3, 1] as const;

export const RENOVACION_ETAPA_BY_MONTHS: Record<number, string> = {
  12: RENOVACION_ETAPA_ALERTA_12,
  6: RENOVACION_ETAPA_ALERTA_6,
  3: RENOVACION_ETAPA_ALERTA_3,
  1: RENOVACION_ETAPA_ALERTA_1,
};
