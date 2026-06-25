import {
  PARKS_LEGAL_CONTRACT_TYPES_ENDPOINT,
  PARKS_LEGAL_GENERATE_CONTRACT_ENDPOINT,
  PARKS_LEGAL_PRE_SEND_ENDPOINT,
  PARKS_LEGAL_SERVICE_URL,
  PARKS_LEGAL_VALIDATE_ENDPOINT,
} from '@/parks-industrial/constants/parks-legal.constants';
import {
  type ContractDraftRecord,
  type ContractTypeOption,
  type DocumentValidationResult,
  type PreSendLegalResult,
  type SimulatedDocumentUpload,
} from '@/parks-industrial/types/parks-legal.types';

const parseErrorMessage = async (response: Response): Promise<string> => {
  const errorBody = (await response.json().catch(() => null)) as {
    error?: string;
  } | null;

  return (
    errorBody?.error ?? `Error del servicio Parks Legal (${response.status})`
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
