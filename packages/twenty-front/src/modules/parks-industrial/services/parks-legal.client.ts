import {
  PARKS_LEGAL_CONTRACT_TYPES_ENDPOINT,
  PARKS_LEGAL_GENERATE_CONTRACT_ENDPOINT,
  PARKS_LEGAL_PRE_SEND_ENDPOINT,
  PARKS_LEGAL_SERVICE_URL,
  PARKS_LEGAL_VALIDATE_ENDPOINT,
  PARKS_LEGAL_EXTRACT_DOCUMENT_ENDPOINT,
  PARKS_LEGAL_APPLY_EXTRACTION_ENDPOINT,
  PARKS_LEGAL_DASHBOARD_ENDPOINT,
  PARKS_LEGAL_WORKLOAD_ENDPOINT,
  PARKS_LEGAL_METRICS_ENDPOINT,
  PARKS_LEGAL_REPORT_ENDPOINT,
  parksLegalWorkflowUrl,
} from '@/parks-industrial/constants/parks-legal.constants';
import {
  type ApplyExtractionResult,
  type ContractDraftRecord,
  type ContractTypeOption,
  type CotejoIaResult,
  type DocumentExtractionResult,
  type DocumentValidationResult,
  type LegalDashboardResult,
  type LegalQuincenalReport,
  type LegalWorkflowResult,
  type LawyerMetricsItem,
  type LawyerWorkloadItem,
  type PreSendLegalResult,
  type SimulatedDocumentUpload,
} from '@/parks-industrial/types/parks-legal.types';

const parseErrorMessage = async (response: Response): Promise<string> => {
  const errorBody = (await response.json().catch(() => null)) as {
    error?: string;
  } | null;

  return (
    errorBody?.error ?? `Error del servicio Parks Industrial (${response.status})`
  );
};

export const fetchParksContractTypes = async (): Promise<ContractTypeOption[]> => {
  const response = await fetch(PARKS_LEGAL_CONTRACT_TYPES_ENDPOINT);

  if (!response.ok) {
    throw new Error(await parseErrorMessage(response));
  }

  const body = (await response.json()) as { types: ContractTypeOption[] };

  return body.types;
};

export const fetchParksLegalHojaCopy = async (
  casoLegalId: string,
): Promise<{
  html: string;
  fileName: string;
  referencia: string;
  hojaId: string;
  firmadaPorCem: boolean;
  firmadaPorCliente: boolean;
  m2Acordados: number | null;
  precioUsdM2: number | null;
  plazoMeses: number | null;
  fechaInicio: string | null;
  tipoContrato: string | null;
}> => {
  const response = await fetch(
    `${parksLegalWorkflowUrl(casoLegalId)}/hoja-acuerdos/copy`,
  );

  if (!response.ok) {
    throw new Error(await parseErrorMessage(response));
  }

  return (await response.json()) as {
    html: string;
    fileName: string;
    referencia: string;
    hojaId: string;
    firmadaPorCem: boolean;
    firmadaPorCliente: boolean;
    m2Acordados: number | null;
    precioUsdM2: number | null;
    plazoMeses: number | null;
    fechaInicio: string | null;
    tipoContrato: string | null;
  };
};


export const validateParksDocuments = async ({
  casoLegalId,
  uploads,
  useLlm = false,
}: {
  casoLegalId: string;
  uploads?: SimulatedDocumentUpload[];
  useLlm?: boolean;
}): Promise<DocumentValidationResult> => {
  const response = await fetch(PARKS_LEGAL_VALIDATE_ENDPOINT, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ casoLegalId, uploads, useLlm }),
  });

  if (!response.ok) {
    throw new Error(await parseErrorMessage(response));
  }

  return (await response.json()) as DocumentValidationResult;
};

export const generateParksContractDraft = async ({
  casoLegalId,
  tipoDocumento,
}: {
  casoLegalId: string;
  tipoDocumento: string;
}): Promise<ContractDraftRecord> => {
  const response = await fetch(PARKS_LEGAL_GENERATE_CONTRACT_ENDPOINT, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ casoLegalId, tipoDocumento }),
  });

  if (!response.ok) {
    throw new Error(await parseErrorMessage(response));
  }

  return (await response.json()) as ContractDraftRecord;
};

export const fetchParksContractDraft = async (
  casoLegalId: string,
): Promise<ContractDraftRecord | null> => {
  const response = await fetch(
    `${PARKS_LEGAL_SERVICE_URL}/legal/contract-draft/${casoLegalId}`,
  );

  if (response.status === 404) {
    return null;
  }

  if (!response.ok) {
    throw new Error(await parseErrorMessage(response));
  }

  return (await response.json()) as ContractDraftRecord;
};

export const saveParksContractDraft = async ({
  casoLegalId,
  html,
}: {
  casoLegalId: string;
  html: string;
}): Promise<ContractDraftRecord> => {
  const response = await fetch(
    `${PARKS_LEGAL_SERVICE_URL}/legal/contract-draft/${casoLegalId}`,
    {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ html }),
    },
  );

  if (!response.ok) {
    throw new Error(await parseErrorMessage(response));
  }

  return (await response.json()) as ContractDraftRecord;
};

export const generateParksContractPdf = async (
  casoLegalId: string,
): Promise<{ pdfPath: string }> => {
  const response = await fetch(
    `${PARKS_LEGAL_SERVICE_URL}/legal/contract-draft/${casoLegalId}/pdf`,
    { method: 'POST' },
  );

  if (!response.ok) {
    throw new Error(await parseErrorMessage(response));
  }

  return (await response.json()) as { pdfPath: string };
};

export const getParksContractPdfDownloadUrl = (
  casoLegalId: string,
): string =>
  `${PARKS_LEGAL_SERVICE_URL}/legal/contract-draft/${casoLegalId}/download`;

export const preSendParksToLegal = async (
  casoLegalId: string,
): Promise<PreSendLegalResult> => {
  const response = await fetch(PARKS_LEGAL_PRE_SEND_ENDPOINT, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ casoLegalId }),
  });

  if (!response.ok) {
    throw new Error(await parseErrorMessage(response));
  }

  return (await response.json()) as PreSendLegalResult;
};

export const extractParksDocument = async ({
  casoLegalId,
  documentType,
  fileName,
}: {
  casoLegalId: string;
  documentType: string;
  fileName?: string;
}): Promise<DocumentExtractionResult> => {
  const response = await fetch(PARKS_LEGAL_EXTRACT_DOCUMENT_ENDPOINT, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ casoLegalId, documentType, fileName }),
  });

  if (!response.ok) {
    throw new Error(await parseErrorMessage(response));
  }

  return (await response.json()) as DocumentExtractionResult;
};

export const applyParksDocumentExtraction = async ({
  casoLegalId,
  extractedFields,
}: {
  casoLegalId: string;
  extractedFields: Record<string, string>;
}): Promise<ApplyExtractionResult> => {
  const response = await fetch(PARKS_LEGAL_APPLY_EXTRACTION_ENDPOINT, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ casoLegalId, extractedFields }),
  });

  if (!response.ok) {
    throw new Error(await parseErrorMessage(response));
  }

  return (await response.json()) as ApplyExtractionResult;
};

export const fetchParksLegalWorkflow = async (
  casoLegalId: string,
): Promise<LegalWorkflowResult> => {
  const response = await fetch(parksLegalWorkflowUrl(casoLegalId));

  if (!response.ok) {
    throw new Error(await parseErrorMessage(response));
  }

  return (await response.json()) as LegalWorkflowResult;
};

export const assignParksLegalLawyer = async ({
  casoLegalId,
  abogadoAsignado,
}: {
  casoLegalId: string;
  abogadoAsignado: string;
}): Promise<LegalWorkflowResult['casoLegal']> => {
  const response = await fetch(
    `${parksLegalWorkflowUrl(casoLegalId)}/assign-lawyer`,
    {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ abogadoAsignado }),
    },
  );

  if (!response.ok) {
    throw new Error(await parseErrorMessage(response));
  }

  const body = (await response.json()) as {
    casoLegal: LegalWorkflowResult['casoLegal'];
  };

  return body.casoLegal;
};

export const ensureParksLegalChecklist = async (
  casoLegalId: string,
): Promise<LegalWorkflowResult> => {
  const response = await fetch(
    `${parksLegalWorkflowUrl(casoLegalId)}/ensure-checklist`,
    { method: 'POST' },
  );

  if (!response.ok) {
    throw new Error(await parseErrorMessage(response));
  }

  return (await response.json()) as LegalWorkflowResult;
};

export const updateParksLegalChecklistItem = async ({
  documentoChecklistId,
  casoLegalId,
  entregado,
}: {
  documentoChecklistId: string;
  casoLegalId: string;
  entregado: boolean;
}): Promise<{ documentacionCompleta: boolean }> => {
  const response = await fetch(
    `${PARKS_LEGAL_SERVICE_URL}/legal/checklist/${documentoChecklistId}`,
    {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ casoLegalId, entregado }),
    },
  );

  if (!response.ok) {
    throw new Error(await parseErrorMessage(response));
  }

  return (await response.json()) as { documentacionCompleta: boolean };
};

export const registerParksLegalCotejo = async ({
  casoLegalId,
  aprobado,
  discrepancia,
  realizadoPor,
}: {
  casoLegalId: string;
  aprobado: boolean;
  discrepancia?: string;
  realizadoPor?: string;
}): Promise<LegalWorkflowResult> => {
  const response = await fetch(
    `${parksLegalWorkflowUrl(casoLegalId)}/cotejo`,
    {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ aprobado, discrepancia, realizadoPor }),
    },
  );

  if (!response.ok) {
    throw new Error(await parseErrorMessage(response));
  }

  return (await response.json()) as LegalWorkflowResult;
};

export const runParksLegalCotejoIa = async ({
  casoLegalId,
  versionBase,
  versionComparada,
}: {
  casoLegalId: string;
  versionBase?: number;
  versionComparada?: number;
}): Promise<CotejoIaResult> => {
  const response = await fetch(
    `${parksLegalWorkflowUrl(casoLegalId)}/cotejo-ia`,
    {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ versionBase, versionComparada }),
    },
  );

  if (!response.ok) {
    throw new Error(await parseErrorMessage(response));
  }

  return (await response.json()) as CotejoIaResult;
};

export const createParksLegalVersion = async ({
  casoLegalId,
  enviadoPor,
  dirigidoA,
  respuestaCliente,
  cambiosSolicitados,
  esVersionFinal,
}: {
  casoLegalId: string;
  enviadoPor: string;
  dirigidoA: string;
  respuestaCliente?: string;
  cambiosSolicitados?: string;
  esVersionFinal?: boolean;
}): Promise<void> => {
  const response = await fetch(
    `${parksLegalWorkflowUrl(casoLegalId)}/versions`,
    {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        enviadoPor,
        dirigidoA,
        respuestaCliente,
        cambiosSolicitados,
        esVersionFinal,
      }),
    },
  );

  if (!response.ok) {
    throw new Error(await parseErrorMessage(response));
  }
};

export const markParksLegalSignature = async ({
  casoLegalId,
  flujoFirmasId,
  fechaFirma,
}: {
  casoLegalId: string;
  flujoFirmasId: string;
  fechaFirma?: string;
}): Promise<LegalWorkflowResult> => {
  const response = await fetch(
    `${PARKS_LEGAL_SERVICE_URL}/legal/firmas/${flujoFirmasId}/sign`,
    {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ casoLegalId, fechaFirma }),
    },
  );

  if (!response.ok) {
    throw new Error(await parseErrorMessage(response));
  }

  return (await response.json()) as LegalWorkflowResult;
};

export const advanceParksLegalEstatus = async ({
  casoLegalId,
  estatus,
}: {
  casoLegalId: string;
  estatus: string;
}): Promise<void> => {
  const response = await fetch(
    `${parksLegalWorkflowUrl(casoLegalId)}/advance-estatus`,
    {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ estatus }),
    },
  );

  if (!response.ok) {
    throw new Error(await parseErrorMessage(response));
  }
};

export const fetchParksLegalDashboard = async (filters?: {
  abogadoAsignado?: string;
  tipoDocumento?: string;
  parque?: string;
  slaVencido?: boolean;
}): Promise<LegalDashboardResult> => {
  const params = new URLSearchParams();

  if (filters?.abogadoAsignado) {
    params.set('abogadoAsignado', filters.abogadoAsignado);
  }

  if (filters?.tipoDocumento) {
    params.set('tipoDocumento', filters.tipoDocumento);
  }

  if (filters?.parque) {
    params.set('parque', filters.parque);
  }

  if (filters?.slaVencido) {
    params.set('slaVencido', 'true');
  }

  const url = params.toString()
    ? `${PARKS_LEGAL_DASHBOARD_ENDPOINT}?${params.toString()}`
    : PARKS_LEGAL_DASHBOARD_ENDPOINT;
  const response = await fetch(url);

  if (!response.ok) {
    throw new Error(await parseErrorMessage(response));
  }

  return (await response.json()) as LegalDashboardResult;
};

export const fetchParksLegalWorkload = async (): Promise<
  LawyerWorkloadItem[]
> => {
  const response = await fetch(PARKS_LEGAL_WORKLOAD_ENDPOINT);

  if (!response.ok) {
    throw new Error(await parseErrorMessage(response));
  }

  const body = (await response.json()) as { workload: LawyerWorkloadItem[] };

  return body.workload;
};

export const fetchParksLegalMetrics = async (): Promise<LawyerMetricsItem[]> => {
  const response = await fetch(PARKS_LEGAL_METRICS_ENDPOINT);

  if (!response.ok) {
    throw new Error(await parseErrorMessage(response));
  }

  const body = (await response.json()) as { metrics: LawyerMetricsItem[] };

  return body.metrics;
};

export const fetchParksLegalQuincenalReport =
  async (): Promise<LegalQuincenalReport> => {
    const response = await fetch(PARKS_LEGAL_REPORT_ENDPOINT);

    if (!response.ok) {
      throw new Error(await parseErrorMessage(response));
    }

    return (await response.json()) as LegalQuincenalReport;
  };

export const pauseParksLegalSla = async ({
  casoLegalId,
  motivoPausa,
}: {
  casoLegalId: string;
  motivoPausa: string;
}): Promise<LegalWorkflowResult> => {
  const response = await fetch(
    `${parksLegalWorkflowUrl(casoLegalId)}/pause-sla`,
    {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ motivoPausa }),
    },
  );

  if (!response.ok) {
    throw new Error(await parseErrorMessage(response));
  }

  return (await response.json()) as LegalWorkflowResult;
};

export const registerParksNdaSigned = async (
  casoLegalId: string,
): Promise<LegalWorkflowResult> => {
  const response = await fetch(
    `${parksLegalWorkflowUrl(casoLegalId)}/nda-signed`,
    { method: 'POST' },
  );

  if (!response.ok) {
    throw new Error(await parseErrorMessage(response));
  }

  return (await response.json()) as LegalWorkflowResult;
};

export const fetchParksLegalClientHistory = async (casoLegalId: string) => {
  const response = await fetch(
    `${parksLegalWorkflowUrl(casoLegalId)}/client-history`,
  );

  if (!response.ok) {
    throw new Error(await parseErrorMessage(response));
  }

  const body = (await response.json()) as {
    history: LegalWorkflowResult['casoLegal'][];
  };

  return body.history;
};

export const createParksActaRestitucion = async (
  payload: Record<string, unknown>,
) => {
  const response = await fetch(
    `${PARKS_LEGAL_SERVICE_URL}/legal/acta-restitucion`,
    {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(payload),
    },
  );

  if (!response.ok) {
    throw new Error(await parseErrorMessage(response));
  }

  return response.json();
};

export const requestParksHoldoverCondonacion = async ({
  holdoverId,
  motivo,
  montoSolicitado,
}: {
  holdoverId: string;
  motivo: string;
  montoSolicitado: number;
}) => {
  const response = await fetch(
    `${PARKS_LEGAL_SERVICE_URL}/legal/holdover/${holdoverId}/condonacion`,
    {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ motivo, montoSolicitado }),
    },
  );

  if (!response.ok) {
    throw new Error(await parseErrorMessage(response));
  }
};

export const resolveParksHoldoverCondonacion = async ({
  holdoverId,
  aprobada,
  aprobadoPor,
  comentario,
}: {
  holdoverId: string;
  aprobada: boolean;
  aprobadoPor: string;
  comentario?: string;
}) => {
  const response = await fetch(
    `${PARKS_LEGAL_SERVICE_URL}/legal/holdover/${holdoverId}/condonacion/resolve`,
    {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ aprobada, aprobadoPor, comentario }),
    },
  );

  if (!response.ok) {
    throw new Error(await parseErrorMessage(response));
  }
};
