import {
  PARKS_COMMERCIAL_EMAIL_SEQUENCE_ENDPOINT,
  PARKS_COMMERCIAL_ENRICH_PROSPECT_ENDPOINT,
  PARKS_COMMERCIAL_FICHA_TECNICA_ENDPOINT,
  PARKS_COMMERCIAL_MATCH_NAVES_ENDPOINT,
  PARKS_COMMERCIAL_NOTIFICATIONS_ENDPOINT,
  PARKS_COMMERCIAL_PROSPECT_SCORES_ENDPOINT,
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
  type DecisorCliente,
  type DecisorClienteRol,
  type ParksAccount360Response,
} from '@/parks-industrial/types/parks-commercial.types';

const normalizeParksAccount360Response = (
  body: Partial<ParksAccount360Response> & { inquilinoId: string },
): ParksAccount360Response => {
  const oportunidades = body.oportunidades ?? [];

  return {
    inquilinoId: body.inquilinoId,
    inquilino: body.inquilino,
    decisores: body.decisores ?? [],
    expedientesActivos: body.expedientesActivos ?? 0,
    contratos: body.contratos ?? [],
    oportunidades,
    oportunidadesEnProceso:
      body.oportunidadesEnProceso ??
      oportunidades.filter((oportunidad) => oportunidad.enProceso).length,
    interacciones: body.interacciones ?? [],
    estadoPagos: body.estadoPagos ?? { fuente: 'sin-datos' },
    tieneContratosFuno: body.tieneContratosFuno ?? false,
    note: body.note,
  };
};

const parseErrorMessage = async (response: Response): Promise<string> => {
  const errorBody = (await response.json().catch(() => null)) as {
    error?: string;
  } | null;

  return (
    errorBody?.error ??
    `Error del servicio Parks Industrial (${response.status})`
  );
};

export type CreateParksLeadInput = {
  nombreCompleto: string;
  empresa: string;
  correo?: string;
  telefono?: string;
  giroEmpresa: string;
  metrosCuadradosRequeridos: number;
  ubicacionDeseada: string;
  plazoContratoMeses: number;
  presupuestoMensualUsd: number;
  canalOrigen: string;
  brokerId?: string;
  tipoOperacion?: string;
  alturaRequerida?: number;
  andenesRequeridos?: number;
  potenciaRequerida?: number;
  cargaPisoRequerida?: number;
  especificacionesTecnicas?: string;
};

export type UnassignedLead = {
  id: string;
  name?: string;
  stage?: string;
  m2Requeridos?: number;
  canalOrigen?: string;
  ubicacionDeseada?: string;
  asignadoPor?: string;
  createdAt?: string;
};

export const createParksLead = async (
  input: CreateParksLeadInput,
): Promise<{ opportunityId: string; inquilinoId: string }> => {
  const response = await fetch(`${PARKS_SERVICE_URL}/commercial/leads`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(input),
  });

  if (!response.ok) {
    throw new Error(await parseErrorMessage(response));
  }

  return (await response.json()) as {
    opportunityId: string;
    inquilinoId: string;
  };
};

export const fetchParksUnassignedLeads = async (): Promise<UnassignedLead[]> => {
  const response = await fetch(
    `${PARKS_SERVICE_URL}/commercial/leads/unassigned`,
  );

  if (!response.ok) {
    throw new Error(await parseErrorMessage(response));
  }

  const body = (await response.json()) as { leads: UnassignedLead[] };

  return body.leads;
};

export const assignParksLead = async ({
  opportunityId,
  leasingOfficerName,
  assignedBy,
}: {
  opportunityId: string;
  leasingOfficerName: string;
  assignedBy: string;
}): Promise<void> => {
  const response = await fetch(
    `${PARKS_SERVICE_URL}/commercial/leads/${opportunityId}/assign`,
    {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ leasingOfficerName, assignedBy }),
    },
  );

  if (!response.ok) {
    throw new Error(await parseErrorMessage(response));
  }
};

export const registerParksTour = async (input: {
  opportunityId: string;
  tourFecha: string;
  tourParque?: string;
  tourNavesMostradas?: string;
  tourAsistentes?: string;
  attendedDecisorIds?: string[];
  inquilinoId?: string;
  tourFeedback?: string;
  tourProximosPasos?: string;
  companyName?: string;
}): Promise<void> => {
  const response = await fetch(`${PARKS_SERVICE_URL}/commercial/tour`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(input),
  });

  if (!response.ok) {
    throw new Error(await parseErrorMessage(response));
  }
};

export const previewParksQuotation = async (input: {
  m2Ofertados: number;
  precioPorM2Usd: number;
}): Promise<{ rentaMensualCalculada: number }> => {
  const response = await fetch(
    `${PARKS_SERVICE_URL}/commercial/quotations/preview`,
    {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(input),
    },
  );

  if (!response.ok) {
    throw new Error(await parseErrorMessage(response));
  }

  return (await response.json()) as { rentaMensualCalculada: number };
};

export const sendParksQuotation = async (
  opportunityId: string,
  input: {
    m2Ofertados: number;
    precioPorM2Usd: number;
    plazoContratoMeses?: number;
    periodoGraciaMeses?: number;
    depositoGarantiaMeses?: number;
    companyName?: string;
  },
): Promise<{
  rentaMensualCalculada: number;
  followUpDue: string;
}> => {
  const response = await fetch(
    `${PARKS_SERVICE_URL}/commercial/quotations/${opportunityId}/send`,
    {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(input),
    },
  );

  if (!response.ok) {
    throw new Error(await parseErrorMessage(response));
  }

  return (await response.json()) as {
    rentaMensualCalculada: number;
    followUpDue: string;
  };
};

export const requestParksApproval = async (input: {
  opportunityId: string;
  companyName?: string;
  descuentoPct?: number;
  condicionSignificativa?: boolean;
  condicionesPropuestas: string;
}): Promise<void> => {
  const response = await fetch(
    `${PARKS_SERVICE_URL}/commercial/approvals/request`,
    {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(input),
    },
  );

  if (!response.ok) {
    throw new Error(await parseErrorMessage(response));
  }
};

export const resolveParksApproval = async (input: {
  opportunityId: string;
  decision: 'Aprobada' | 'Rechazada';
  comentario: string;
  resolvedBy: string;
}): Promise<void> => {
  const response = await fetch(
    `${PARKS_SERVICE_URL}/commercial/approvals/resolve`,
    {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(input),
    },
  );

  if (!response.ok) {
    throw new Error(await parseErrorMessage(response));
  }
};

export const markParksOpportunityLost = async (input: {
  opportunityId: string;
  motivoPerdida: string;
  competidor?: string;
  fechaReactivacion?: string;
  razonPerdidaDetalle?: string;
  companyName?: string;
}): Promise<void> => {
  const response = await fetch(`${PARKS_SERVICE_URL}/commercial/lost`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(input),
  });

  if (!response.ok) {
    throw new Error(await parseErrorMessage(response));
  }
};

export const createParksHojaAcuerdos = async (input: {
  opportunityId: string;
  ejecutivoAsignado?: string;
}): Promise<{ hojaId: string; esquemaComision: string }> => {
  const response = await fetch(
    `${PARKS_SERVICE_URL}/commercial/hoja-acuerdos`,
    {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(input),
    },
  );

  if (!response.ok) {
    throw new Error(await parseErrorMessage(response));
  }

  return (await response.json()) as {
    hojaId: string;
    esquemaComision: string;
  };
};

export const signParksHojaAcuerdos = async (
  hojaId: string,
  input: {
    opportunityId: string;
    firmadaPorCliente?: boolean;
    firmadaPorCem?: boolean;
    fechaFirma?: string;
  },
): Promise<{ readyForLegal: boolean }> => {
  const response = await fetch(
    `${PARKS_SERVICE_URL}/commercial/hoja-acuerdos/${hojaId}/sign`,
    {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(input),
    },
  );

  if (!response.ok) {
    throw new Error(await parseErrorMessage(response));
  }

  return (await response.json()) as { readyForLegal: boolean };
};

export const validateParksStageGate = async (input: {
  targetStage: string;
  opportunity: Record<string, unknown>;
}): Promise<{
  ok: boolean;
  error?: string;
  missingRequirements?: string[];
  actionHint?: string;
}> => {
  const response = await fetch(`${PARKS_SERVICE_URL}/commercial/stage-gate`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(input),
  });

  const body = (await response.json()) as {
    ok: boolean;
    error?: string;
    missingRequirements?: string[];
    actionHint?: string;
  };

  if (!response.ok) {
    return { ok: false, error: body.error ?? (await parseErrorMessage(response)) };
  }

  return body;
};

export const createParksOpportunityForInquilino = async (
  inquilinoId: string,
  input: Omit<CreateParksLeadInput, 'empresa' | 'nombreCompleto'> & {
    nombreCompleto?: string;
  },
): Promise<{ opportunityId: string; inquilinoId: string }> => {
  const response = await fetch(
    `${PARKS_SERVICE_URL}/commercial/inquilinos/${inquilinoId}/opportunities`,
    {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(input),
    },
  );

  if (!response.ok) {
    throw new Error(await parseErrorMessage(response));
  }

  return (await response.json()) as {
    opportunityId: string;
    inquilinoId: string;
  };
};

export const fetchParksAccount360 = async (
  inquilinoId: string,
): Promise<ParksAccount360Response> => {
  const response = await fetch(
    `${PARKS_SERVICE_URL}/commercial/account-360/${inquilinoId}`,
  );

  if (!response.ok) {
    throw new Error(await parseErrorMessage(response));
  }

  return normalizeParksAccount360Response(
    (await response.json()) as Partial<ParksAccount360Response> & {
      inquilinoId: string;
    },
  );
};

export const fetchParksDecisores = async ({
  opportunityId,
  inquilinoId,
}: {
  opportunityId?: string;
  inquilinoId?: string;
}): Promise<DecisorCliente[]> => {
  const response = opportunityId
    ? await fetch(
        `${PARKS_SERVICE_URL}/commercial/decisores/opportunity/${opportunityId}${
          inquilinoId ? `?inquilinoId=${encodeURIComponent(inquilinoId)}` : ''
        }`,
      )
    : inquilinoId
      ? await fetch(
          `${PARKS_SERVICE_URL}/commercial/decisores/inquilino/${inquilinoId}`,
        )
      : null;

  if (!response) {
    return [];
  }

  if (!response.ok) {
    throw new Error(await parseErrorMessage(response));
  }

  const body = (await response.json()) as { decisores: DecisorCliente[] };

  return body.decisores;
};

export const upsertParksDecisor = async (input: {
  id?: string;
  inquilinoId?: string;
  opportunityId?: string;
  nombre: string;
  correo?: string;
  telefono?: string;
  rol: DecisorClienteRol;
}): Promise<DecisorCliente> => {
  const response = await fetch(`${PARKS_SERVICE_URL}/commercial/decisores`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(input),
  });

  if (!response.ok) {
    throw new Error(await parseErrorMessage(response));
  }

  const body = (await response.json()) as { decisor: DecisorCliente };

  return body.decisor;
};

export const deleteParksDecisor = async ({
  decisorId,
  opportunityId,
}: {
  decisorId: string;
  opportunityId?: string;
}): Promise<void> => {
  const query = opportunityId
    ? `?opportunityId=${encodeURIComponent(opportunityId)}`
    : '';
  const response = await fetch(
    `${PARKS_SERVICE_URL}/commercial/decisores/${decisorId}${query}`,
    { method: 'DELETE' },
  );

  if (!response.ok) {
    throw new Error(await parseErrorMessage(response));
  }
};

export const setParksDecisorTourAttendance = async (input: {
  opportunityId: string;
  inquilinoId?: string;
  attendedDecisorIds: string[];
}): Promise<{ tourAsistentes: string; decisores: DecisorCliente[] }> => {
  const response = await fetch(
    `${PARKS_SERVICE_URL}/commercial/decisores/tour-attendance`,
    {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(input),
    },
  );

  if (!response.ok) {
    throw new Error(await parseErrorMessage(response));
  }

  return (await response.json()) as {
    tourAsistentes: string;
    decisores: DecisorCliente[];
  };
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
  minAlturaLibre,
  minAndenes,
}: {
  opportunityId: string;
  m2Requeridos: number;
  industry?: string;
  cityFilter?: string;
  minAlturaLibre?: number;
  minAndenes?: number;
}): Promise<NaveMatchResult> => {
  const response = await fetch(PARKS_COMMERCIAL_MATCH_NAVES_ENDPOINT, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      opportunityId,
      m2Requeridos,
      industry,
      cityFilter,
      minAlturaLibre,
      minAndenes,
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
