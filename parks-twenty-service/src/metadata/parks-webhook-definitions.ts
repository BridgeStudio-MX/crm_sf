export const PARKS_WEBHOOK_DESCRIPTION =
  'Parks Industrial — microservicio Node.js';

export const PARKS_WEBHOOK_OPERATIONS = [
  'opportunity.created',
  'opportunity.updated',
  'casoLegal.created',
  'casoLegal.updated',
  'flujoFirmas.created',
  'flujoFirmas.updated',
  'expedienteContrato.created',
  'expedienteContrato.updated',
] as const;

export type ParksWebhookOperation = (typeof PARKS_WEBHOOK_OPERATIONS)[number];
