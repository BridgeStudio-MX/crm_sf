import {
  PARKS_COMMERCIAL_ENRICH_PROSPECT_ENDPOINT,
  PARKS_COMMERCIAL_FICHA_TECNICA_ENDPOINT,
  PARKS_COMMERCIAL_MATCH_NAVES_ENDPOINT,
  PARKS_COMMERCIAL_NOTIFICATIONS_ENDPOINT,
  PARKS_COMMERCIAL_PROSPECT_SCORES_ENDPOINT,
  PARKS_COMMERCIAL_EMAIL_SEQUENCE_ENDPOINT,
  PARKS_COMMERCIAL_SALES_SCRIPT_ENDPOINT,
  PARKS_SERVICE_URL,
} from '@/parks-industrial/constants/parks-commercial.constants';
import {
  type BrokerNotification,
  type BrokerNotificationsResponse,
  type EmailSequenceResult,
  type FichaTecnicaLink,
  type FichaTecnicaSentVia,
  type NaveMatchResult,
  type ProspectEnrichmentResult,
  type ProspectScoresResponse,
  type SalesScriptResult,
} from '@/parks-industrial/types/parks-commercial.types';

const parseErrorMessage = async (response: Response): Promise<string> => {
  const errorBody = (await response.json().catch(() => null)) as {
    error?: string;
  } | null;

  return (
    errorBody?.error ??
    `Error del servicio Parks Commercial (${response.status})`
  );
};

export const fetchParksNotifications = async ({
  unreadOnly = false,
}: {
  unreadOnly?: boolean;
} = {}): Promise<BrokerNotificationsResponse> => {
  const query = unreadOnly ? '?unreadOnly=true' : '';
  const response = await fetch(
    `${PARKS_COMMERCIAL_NOTIFICATIONS_ENDPOINT}${query}`,
  );

  if (!response.ok) {
    throw new Error(await parseErrorMessage(response));
  }

  return (await response.json()) as BrokerNotificationsResponse;
};

export const markParksNotificationRead = async (
  notificationId: string,
): Promise<{ notification: BrokerNotification; unreadCount: number }> => {
  const response = await fetch(
    `${PARKS_COMMERCIAL_NOTIFICATIONS_ENDPOINT}/${notificationId}/read`,
    { method: 'PATCH' },
  );

  if (!response.ok) {
    throw new Error(await parseErrorMessage(response));
  }

  return (await response.json()) as {
    notification: BrokerNotification;
    unreadCount: number;
  };
};

export const markAllParksNotificationsRead = async (): Promise<number> => {
  const response = await fetch(
    `${PARKS_COMMERCIAL_NOTIFICATIONS_ENDPOINT}/mark-all-read`,
    { method: 'POST' },
  );

  if (!response.ok) {
    throw new Error(await parseErrorMessage(response));
  }

  const body = (await response.json()) as { updatedCount: number };

  return body.updatedCount;
};

export const fetchCachedProspectEnrichment = async (
  opportunityId: string,
): Promise<ProspectEnrichmentResult | null> => {
  const response = await fetch(
    `${PARKS_COMMERCIAL_ENRICH_PROSPECT_ENDPOINT}/${opportunityId}`,
  );

  if (response.status === 404) {
    return null;
  }

  if (!response.ok) {
    throw new Error(await parseErrorMessage(response));
  }

  return (await response.json()) as ProspectEnrichmentResult;
};

export const enrichParksProspect = async ({
  opportunityId,
  companyName,
  industryHint,
  m2Requeridos,
}: {
  opportunityId: string;
  companyName: string;
  industryHint?: string;
  m2Requeridos?: number;
}): Promise<ProspectEnrichmentResult> => {
  const response = await fetch(PARKS_COMMERCIAL_ENRICH_PROSPECT_ENDPOINT, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      opportunityId,
      companyName,
      industryHint,
      m2Requeridos,
    }),
  });

  if (!response.ok) {
    throw new Error(await parseErrorMessage(response));
  }

  return (await response.json()) as ProspectEnrichmentResult;
};

export const matchParksNaves = async ({
  opportunityId,
  m2Requeridos,
  industry,
  cityFilter,
}: {
  opportunityId: string;
  m2Requeridos: number;
  industry?: string;
  cityFilter?: string;
}): Promise<NaveMatchResult> => {
  const response = await fetch(PARKS_COMMERCIAL_MATCH_NAVES_ENDPOINT, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      opportunityId,
      m2Requeridos,
      industry,
      cityFilter,
    }),
  });

  if (!response.ok) {
    throw new Error(await parseErrorMessage(response));
  }

  return (await response.json()) as NaveMatchResult;
};

export const createParksFichaTecnica = async (input: {
  opportunityId: string;
  opportunityName: string;
  naveId: string;
  naveIdentificador: string;
  parqueNombre?: string;
  ubicacion?: string;
  m2: number;
  precioUsdM2?: number;
}): Promise<FichaTecnicaLink> => {
  const response = await fetch(PARKS_COMMERCIAL_FICHA_TECNICA_ENDPOINT, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(input),
  });

  if (!response.ok) {
    throw new Error(await parseErrorMessage(response));
  }

  return (await response.json()) as FichaTecnicaLink;
};

export const simulateParksFichaView = async (
  token: string,
): Promise<FichaTecnicaLink> => {
  const response = await fetch(
    `${PARKS_SERVICE_URL}/commercial/ficha/${token}/view`,
    { method: 'POST' },
  );

  if (!response.ok) {
    throw new Error(await parseErrorMessage(response));
  }

  return (await response.json()) as FichaTecnicaLink;
};

export const markParksFichaSent = async ({
  token,
  sentVia,
}: {
  token: string;
  sentVia: FichaTecnicaSentVia;
}): Promise<FichaTecnicaLink> => {
  const response = await fetch(
    `${PARKS_SERVICE_URL}/commercial/ficha/${token}/sent`,
    {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ sentVia }),
    },
  );

  if (!response.ok) {
    throw new Error(await parseErrorMessage(response));
  }

  return (await response.json()) as FichaTecnicaLink;
};

export const generateParksSalesScript = async ({
  opportunityId,
  companyName,
  industry,
  m2Requeridos,
  naveDestacada,
}: {
  opportunityId: string;
  companyName: string;
  industry?: string;
  m2Requeridos?: number;
  naveDestacada?: string;
}): Promise<SalesScriptResult> => {
  const response = await fetch(PARKS_COMMERCIAL_SALES_SCRIPT_ENDPOINT, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      opportunityId,
      companyName,
      industry,
      m2Requeridos,
      naveDestacada,
    }),
  });

  if (!response.ok) {
    throw new Error(await parseErrorMessage(response));
  }

  return (await response.json()) as SalesScriptResult;
};

export const getParksCommercialServiceUrl = (): string => PARKS_SERVICE_URL;

export const fetchParksProspectScores = async (
  opportunities: Array<{
    opportunityId: string;
    companyName: string;
    industryHint?: string;
    m2Requeridos?: number;
    amountMicros?: number;
  }>,
): Promise<ProspectScoresResponse> => {
  const response = await fetch(PARKS_COMMERCIAL_PROSPECT_SCORES_ENDPOINT, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ opportunities }),
  });

  if (!response.ok) {
    throw new Error(await parseErrorMessage(response));
  }

  return (await response.json()) as ProspectScoresResponse;
};

export const fetchParksEmailSequence = async ({
  opportunityId,
  companyName,
  industryHint,
}: {
  opportunityId: string;
  companyName: string;
  industryHint?: string;
}): Promise<EmailSequenceResult> => {
  const query = new URLSearchParams({
    companyName,
    ...(industryHint ? { industryHint } : {}),
  });
  const response = await fetch(
    `${PARKS_COMMERCIAL_EMAIL_SEQUENCE_ENDPOINT}/${opportunityId}?${query.toString()}`,
  );

  if (!response.ok) {
    throw new Error(await parseErrorMessage(response));
  }

  return (await response.json()) as EmailSequenceResult;
};
