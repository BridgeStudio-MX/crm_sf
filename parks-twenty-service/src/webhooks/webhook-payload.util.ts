import {
  type CasoLegalRecord,
  type TwentyWebhookPayload,
} from '../types/parks.types';

export type WebhookAction = 'created' | 'updated' | 'deleted';

export type ParsedTwentyWebhook = {
  action: WebhookAction;
  objectNameSingular: string;
  recordId: string;
  record: Record<string, unknown>;
  updatedFields: string[];
  payload: TwentyWebhookPayload;
};

const parseWebhookAction = (eventName: string | undefined): WebhookAction => {
  const action = eventName?.split('.').pop();

  if (action === 'created' || action === 'updated' || action === 'deleted') {
    return action;
  }

  return 'updated';
};

const parseObjectNameFromEvent = (
  eventName: string | undefined,
): string | undefined => eventName?.split('.')[0];

export const parseTwentyWebhook = (
  payload: TwentyWebhookPayload,
): ParsedTwentyWebhook | null => {
  const objectMetadata = payload.objectMetadata as
    | { nameSingular?: string }
    | undefined;

  const objectNameSingular =
    objectMetadata?.nameSingular ??
    payload.objectName ??
    parseObjectNameFromEvent(payload.eventName);

  const record = (payload.record ?? {}) as Record<string, unknown>;
  const recordId =
    (typeof record.id === 'string' ? record.id : undefined) ??
    payload.recordId;

  if (!objectNameSingular || !recordId) {
    return null;
  }

  const updatedFields = Array.isArray(payload.updatedFields)
    ? payload.updatedFields.filter(
        (field): field is string => typeof field === 'string',
      )
    : [];

  return {
    action: parseWebhookAction(payload.eventName),
    objectNameSingular,
    recordId,
    record,
    updatedFields,
    payload,
  };
};

export const mapWebhookRecordToCasoLegal = (
  record: Record<string, unknown>,
): CasoLegalRecord => ({
  id: String(record.id),
  referencia:
    typeof record.referencia === 'string' ? record.referencia : undefined,
  tipoDocumento:
    typeof record.tipoDocumento === 'string'
      ? record.tipoDocumento
      : undefined,
  estatus: typeof record.estatus === 'string' ? record.estatus : 'NUEVO',
  fechaHojaAcuerdos:
    typeof record.fechaHojaAcuerdos === 'string'
      ? record.fechaHojaAcuerdos
      : undefined,
  slaDiasHabiles:
    typeof record.slaDiasHabiles === 'number' ? record.slaDiasHabiles : 0,
  slaFechaLimite:
    typeof record.slaFechaLimite === 'string'
      ? record.slaFechaLimite
      : undefined,
  diasTranscurridos:
    typeof record.diasTranscurridos === 'number' ? record.diasTranscurridos : 0,
  documentacionCompleta:
    typeof record.documentacionCompleta === 'boolean'
      ? record.documentacionCompleta
      : undefined,
  cotejoAprobado:
    typeof record.cotejoAprobado === 'boolean'
      ? record.cotejoAprobado
      : undefined,
  esPropiedadFuno:
    typeof record.esPropiedadFuno === 'boolean'
      ? record.esPropiedadFuno
      : undefined,
  holdoverActivo: false,
  clienteNoRenueva: false,
  semaforo:
    typeof record.semaforo === 'string' ? record.semaforo : undefined,
  notasCatalina:
    typeof record.notasCatalina === 'string'
      ? record.notasCatalina
      : undefined,
  pdfBorradorUrl:
    typeof record.pdfBorradorUrl === 'string'
      ? record.pdfBorradorUrl
      : undefined,
  hojaDeAcuerdosId:
    typeof record.hojaDeAcuerdosId === 'string'
      ? record.hojaDeAcuerdosId
      : undefined,
  inquilinoId:
    typeof record.inquilinoId === 'string' ? record.inquilinoId : undefined,
  naveId: typeof record.naveId === 'string' ? record.naveId : undefined,
});

export const wasFieldUpdated = (
  parsedWebhook: ParsedTwentyWebhook,
  fieldName: string,
): boolean => parsedWebhook.updatedFields.includes(fieldName);
