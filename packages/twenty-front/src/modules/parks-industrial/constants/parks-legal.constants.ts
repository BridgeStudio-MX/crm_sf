export const PARKS_LEGAL_SERVICE_URL =
  import.meta.env.VITE_PARKS_SERVICE_URL ?? 'http://localhost:3002';

export const PARKS_LEGAL_VALIDATE_ENDPOINT = `${PARKS_LEGAL_SERVICE_URL}/legal/validate-documents`;
export const PARKS_LEGAL_CONTRACT_TYPES_ENDPOINT = `${PARKS_LEGAL_SERVICE_URL}/legal/contract-types`;
export const PARKS_LEGAL_GENERATE_CONTRACT_ENDPOINT = `${PARKS_LEGAL_SERVICE_URL}/legal/generate-contract`;
export const PARKS_LEGAL_PRE_SEND_ENDPOINT = `${PARKS_LEGAL_SERVICE_URL}/legal/pre-send-legal`;
export const PARKS_LEGAL_EXTRACT_DOCUMENT_ENDPOINT = `${PARKS_LEGAL_SERVICE_URL}/legal/extract-document`;
export const PARKS_LEGAL_APPLY_EXTRACTION_ENDPOINT = `${PARKS_LEGAL_SERVICE_URL}/legal/apply-extraction`;

export const parksLegalWorkflowUrl = (casoLegalId: string): string =>
  `${PARKS_LEGAL_SERVICE_URL}/legal/workflow/${casoLegalId}`;

export const PARKS_LEGAL_DASHBOARD_ENDPOINT = `${PARKS_LEGAL_SERVICE_URL}/legal/dashboard`;
export const PARKS_LEGAL_WORKLOAD_ENDPOINT = `${PARKS_LEGAL_SERVICE_URL}/legal/workload`;
export const PARKS_LEGAL_METRICS_ENDPOINT = `${PARKS_LEGAL_SERVICE_URL}/legal/metrics`;
export const PARKS_LEGAL_REPORT_ENDPOINT = `${PARKS_LEGAL_SERVICE_URL}/legal/report/quincenal`;
