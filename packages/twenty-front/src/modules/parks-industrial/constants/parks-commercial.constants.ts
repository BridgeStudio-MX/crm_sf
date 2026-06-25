export const PARKS_SERVICE_URL =
  import.meta.env.VITE_PARKS_SERVICE_URL ?? 'http://localhost:3002';

export const PARKS_COMMERCIAL_NOTIFICATIONS_ENDPOINT = `${PARKS_SERVICE_URL}/commercial/notifications`;
export const PARKS_COMMERCIAL_ENRICH_PROSPECT_ENDPOINT = `${PARKS_SERVICE_URL}/commercial/enrich-prospect`;
export const PARKS_COMMERCIAL_MATCH_NAVES_ENDPOINT = `${PARKS_SERVICE_URL}/commercial/match-naves`;
export const PARKS_COMMERCIAL_FICHA_TECNICA_ENDPOINT = `${PARKS_SERVICE_URL}/commercial/ficha-tecnica`;
export const PARKS_COMMERCIAL_SALES_SCRIPT_ENDPOINT = `${PARKS_SERVICE_URL}/commercial/sales-script`;
export const PARKS_COMMERCIAL_PROSPECT_SCORES_ENDPOINT = `${PARKS_SERVICE_URL}/commercial/prospect-scores`;
export const PARKS_COMMERCIAL_EMAIL_SEQUENCE_ENDPOINT = `${PARKS_SERVICE_URL}/commercial/email-sequence`;
