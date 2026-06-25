export const PARKS_LEGAL_SERVICE_URL =
  import.meta.env.VITE_PARKS_SERVICE_URL ?? 'http://localhost:3002';

export const PARKS_LEGAL_VALIDATE_ENDPOINT = `${PARKS_LEGAL_SERVICE_URL}/legal/validate-documents`;
export const PARKS_LEGAL_CONTRACT_TYPES_ENDPOINT = `${PARKS_LEGAL_SERVICE_URL}/legal/contract-types`;
export const PARKS_LEGAL_GENERATE_CONTRACT_ENDPOINT = `${PARKS_LEGAL_SERVICE_URL}/legal/generate-contract`;
export const PARKS_LEGAL_PRE_SEND_ENDPOINT = `${PARKS_LEGAL_SERVICE_URL}/legal/pre-send-legal`;
