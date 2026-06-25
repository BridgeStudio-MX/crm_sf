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

export type ContractDraftRecord = {
  casoLegalId: string;
  tipoDocumento: string;
  html: string;
  version: number;
  pdfPath?: string;
  updatedAt: string;
  createdAt: string;
};

export type ContractTypeOption = {
  id: string;
  label: string;
  tipoDocumento: string;
};

export const PARKS_CONTRACT_TYPE_OPTIONS: ContractTypeOption[] = [
  {
    id: 'loi',
    label: 'Carta de intención (LOI)',
    tipoDocumento: 'Carta de intención',
  },
  {
    id: 'arrendamiento',
    label: 'Contrato de arrendamiento',
    tipoDocumento: 'Contrato nuevo',
  },
  {
    id: 'renovacion',
    label: 'Convenio de renovación',
    tipoDocumento: 'Convenio renovación',
  },
  {
    id: 'aclaracion',
    label: 'Convenio de aclaración',
    tipoDocumento: 'Convenio aclaración',
  },
  {
    id: 'terminacion',
    label: 'Terminación anticipada',
    tipoDocumento: 'Terminación anticipada',
  },
  {
    id: 'build-to-suit',
    label: 'Build-to-suit',
    tipoDocumento: 'Build-to-suit',
  },
];

export type PreSendLegalResult = {
  casoLegalId: string;
  canSend: boolean;
  validation: DocumentValidationResult;
  message: string;
};
