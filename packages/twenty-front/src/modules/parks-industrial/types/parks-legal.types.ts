export type DocumentValidationSeverity = 'ok' | 'warning' | 'error';

export type DocumentValidationMismatch = {
  field: string;
  expected: string;
  found: string;
  severity: 'error' | 'warning';
};

export type DocumentValidationItem = {
  documentType: string;
  fileName?: string;
  status: DocumentValidationSeverity;
  extractedFields: Record<string, string>;
  mismatches: DocumentValidationMismatch[];
};

export type DocumentValidationResult = {
  casoLegalId: string;
  overallStatus: 'green' | 'yellow' | 'red';
  items: DocumentValidationItem[];
  summary: string;
  usedLlm: boolean;
  validatedAt: string;
};

export type SimulatedDocumentUpload = {
  documentType: string;
  fileName?: string;
  simulateMismatch?: boolean;
};

export type ContractTypeOption = {
  id: string;
  label: string;
  tipoDocumento: string;
};

export type ContractDraftRecord = {
  casoLegalId: string;
  tipoDocumento: string;
  html: string;
  version: number;
  pdfPath?: string;
  updatedAt: string;
  createdAt: string;
};

export type PreSendLegalResult = {
  casoLegalId: string;
  canSend: boolean;
  validation: DocumentValidationResult;
  message: string;
};
