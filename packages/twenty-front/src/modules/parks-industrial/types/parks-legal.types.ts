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

export type DocumentExtractionResult = {
  casoLegalId: string;
  documentType: string;
  fileName?: string;
  extractedFields: Record<string, string>;
  suggestedInquilinoUpdates: Record<string, string>;
  confidence: number;
  summary: string;
  extractedAt: string;
};

export type ApplyExtractionResult = {
  casoLegalId: string;
  inquilinoId: string;
  appliedFields: Record<string, string>;
  message: string;
};

export type LegalChecklistItem = {
  id: string;
  titulo?: string;
  tipoDocumento?: string;
  entregado?: boolean;
};

export type LegalVersionItem = {
  id: string;
  titulo?: string;
  numeroVersion?: number;
  fechaEnvio?: string;
  enviadoPor?: string;
  dirigidoA?: string;
  respuestaCliente?: string;
  cambiosSolicitados?: string;
  esVersionFinal?: boolean;
};

export type CotejoIaCambio = {
  id: string;
  seccion: string;
  tipo: 'modificado' | 'agregado' | 'eliminado';
  antes?: string;
  despues?: string;
  severidad: 'bajo' | 'medio' | 'alto';
  explicacion: string;
};

export type CotejoIaResult = {
  casoLegalId: string;
  versionBase: number;
  versionComparada: number;
  coinciden: boolean;
  cambios: CotejoIaCambio[];
  resumen: string;
  recomendacion: 'aprobar' | 'revisar' | 'rechazar';
  usadoHtmlDraft: boolean;
  generadoAt: string;
};

export type LegalFirmaItem = {
  id: string;
  orden: number;
  firmante?: string;
  rol?: string;
  estatus?: string;
};

export type LegalWorkflowSla = {
  diasHabiles: number;
  diasTranscurridos: number;
  diasRestantes: number | null;
  fechaLimite?: string;
  pausado: boolean;
};

export type LegalWorkflowTimelineStage = {
  id: string;
  label: string;
  estatus: string;
  responsable: string;
  status: 'completed' | 'active' | 'pending';
};

export type LegalWorkflowResult = {
  casoLegal: {
    id: string;
    referencia?: string;
    estatus?: string;
    abogadoAsignado?: string;
    documentacionCompleta?: boolean;
    cotejoAprobado?: boolean;
    semaforo?: string;
    tipoDocumento?: string;
    slaDiasHabiles?: number;
    diasTranscurridos?: number;
    slaFechaLimite?: string;
    slaPausado?: boolean;
    diasPausados?: number;
    motivoPausa?: string;
  };
  checklist: LegalChecklistItem[];
  versiones: LegalVersionItem[];
  firmas: LegalFirmaItem[];
  timeline: LegalWorkflowTimelineStage[];
  sla: LegalWorkflowSla;
};

export type LegalDashboardCase = {
  id: string;
  referencia?: string;
  estatus?: string;
  semaforo?: string;
  abogadoAsignado?: string;
  tipoDocumento?: string;
  empresa?: string;
  nave?: string;
  parque?: string;
  slaDiasHabiles: number;
  diasTranscurridos: number;
  diasRestantes: number | null;
  slaPausado: boolean;
};

export type LegalDashboardResult = {
  totalActivos: number;
  enRiesgo: number;
  pausados: number;
  slaVencidos: number;
  casos: LegalDashboardCase[];
};

export type LawyerWorkloadItem = {
  abogadoAsignado: string;
  casosActivos: number;
  casosEnRiesgo: number;
  casosPausados: number;
};

export type LawyerMetricsItem = {
  abogadoAsignado: string;
  casosActivos: number;
  casosCerrados: number;
  promedioDiasPrimeraVersion: number | null;
  promedioDiasCierre: number | null;
  cumplimientoSlaPct: number;
};

export type LegalQuincenalReport = {
  generatedAt: string;
  rowCount: number;
  csv: string;
  rows: {
    empresa: string;
    nave: string;
    parque: string;
    estatus: string;
    abogadoAsignado: string;
    semaforo: string;
    diasRestantes: number;
  }[];
};
