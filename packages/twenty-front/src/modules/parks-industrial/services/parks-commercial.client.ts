import {
  PARKS_COMMERCIAL_EMAIL_SEQUENCE_ENDPOINT,
  PARKS_COMMERCIAL_ENRICH_PROSPECT_ENDPOINT,
  PARKS_COMMERCIAL_FICHA_TECNICA_ENDPOINT,
  PARKS_COMMERCIAL_INBOX_ENDPOINT,
  PARKS_COMMERCIAL_MATCH_NAVES_ENDPOINT,
  PARKS_COMMERCIAL_NOTIFICATIONS_ENDPOINT,
  PARKS_COMMERCIAL_PROSPECT_SCORES_ENDPOINT,
  PARKS_COMMERCIAL_SALES_SCRIPT_ENDPOINT,
  PARKS_COMMERCIAL_DEMAND_SEARCH_ENDPOINT,
  PARKS_COMMERCIAL_COMPOSER_ENDPOINT,
  PARKS_COMMERCIAL_ACTIVITY_TIMELINE_ENDPOINT,
  PARKS_COMMERCIAL_DEAL_WIN_PREVIEW_ENDPOINT,
  PARKS_COMMERCIAL_BULK_FOLLOW_UP_ENDPOINT,
  PARKS_COMMERCIAL_MAP_OUTREACH_ENDPOINT,
  PARKS_COMMERCIAL_EXPANSION_SIGNALS_ENDPOINT,
  PARKS_SERVICE_URL,
} from '@/parks-industrial/constants/parks-commercial.constants';
import {
  type ActivityTimelineResult,
  type BrokerNotification,
  type BrokerNotificationsResponse,
  type ComposerGenerateResult,
  type ComposerTemplateType,
  type DealWinPreview,
  type DemandSearchFilters,
  type DemandSearchResult,
  type EmailSequenceResult,
  type FichaTecnicaLink,
  type FichaTecnicaSentVia,
  type MapOutreachResult,
  type ParksExpansionSignalsResponse,
  type NaveMatchResult,
  type ProspectEnrichmentResult,
  type ProspectScoresResponse,
  type SalesScriptResult,
  type DecisorCliente,
  type DecisorClienteRol,
  type ParksAccount360Response,
} from '@/parks-industrial/types/parks-commercial.types';
import { type ParksCemInboxSummary } from '@/parks-industrial/types/parks-cem-inbox.types';

const normalizeParksAccount360Response = (
  body: Partial<ParksAccount360Response> & { inquilinoId: string },
): ParksAccount360Response => {
  const oportunidades = body.oportunidades ?? [];
  const casosLegales = body.casosLegales ?? [];
  const documentos = body.documentos ?? [];

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
    casosLegales,
    casosLegalesActivos: body.casosLegalesActivos ?? casosLegales.length,
    hojasDeAcuerdos: body.hojasDeAcuerdos ?? [],
    documentos,
    documentosEntregados:
      body.documentosEntregados ??
      documentos.filter((documento) => documento.entregado).length,
    documentosPendientes:
      body.documentosPendientes ??
      documentos.filter((documento) => !documento.entregado).length,
    actividades: body.actividades ?? [],
    cxc: body.cxc,
    interacciones: body.interacciones ?? [],
    estadoPagos: body.estadoPagos ?? { fuente: 'sin-datos' },
    tieneContratosFuno: body.tieneContratosFuno ?? false,
    senalesExpansion: body.senalesExpansion ?? [],
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

const EMPTY_CEM_INBOX: ParksCemInboxSummary = {
  total: 0,
  leadsSinAsignar: 0,
  aprobacionesComerciales: 0,
  firmasHoja: 0,
  items: [],
};

export const fetchParksCemInbox = async (): Promise<ParksCemInboxSummary> => {
  const response = await fetch(PARKS_COMMERCIAL_INBOX_ENDPOINT);

  if (!response.ok) {
    throw new Error(await parseErrorMessage(response));
  }

  const inbox = (await response.json()) as ParksCemInboxSummary | undefined;

  if (!inbox) {
    return EMPTY_CEM_INBOX;
  }

  return {
    total: inbox.total ?? inbox.items?.length ?? 0,
    leadsSinAsignar: inbox.leadsSinAsignar ?? 0,
    aprobacionesComerciales: inbox.aprobacionesComerciales ?? 0,
    firmasHoja: inbox.firmasHoja ?? 0,
    items: inbox.items ?? [],
  };
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
  // Required whenever brokerId is set: the LO handles the internal
  // negotiation for every lead that comes through a broker.
  leasingOfficerAsignado?: string;
  // Required when canalOrigen is Recomendación.
  recomendadoPor?: string;
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
  folio?: string;
  stage?: string;
  m2Requeridos?: number;
  canalOrigen?: string;
  ubicacionDeseada?: string;
  asignadoPor?: string;
  createdAt?: string;
};

export const createParksLead = async (
  input: CreateParksLeadInput,
): Promise<{ opportunityId: string; inquilinoId: string; folio?: string }> => {
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
    folio?: string;
  };
};

export const fetchParksUnassignedLeads = async (): Promise<
  UnassignedLead[]
> => {
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

export const registerParksFirstContact = async (input: {
  opportunityId: string;
  tipo: string;
  fecha: string;
  hora?: string;
  notas?: string;
  realizado?: boolean;
  companyName?: string;
}): Promise<{ opportunityId: string }> => {
  const response = await fetch(
    `${PARKS_SERVICE_URL}/commercial/contacts/${input.opportunityId}`,
    {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(input),
    },
  );

  if (!response.ok) {
    throw new Error(await parseErrorMessage(response));
  }

  return (await response.json()) as { opportunityId: string };
};

export const registerParksTour = async (input: {
  opportunityId: string;
  tourFecha: string;
  tourHora?: string;
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

export type ParksQuotationAdjacentCost = {
  concepto: string;
  monto: number;
  tipo: 'unica_vez' | 'recurrente';
};

export type ParksQuotationHistoryEntry = {
  enviadaEn: string;
  m2Ofertados: number;
  precioPorM2: number;
  moneda: 'MXN' | 'USD';
  rentaMensualCalculada: number;
  plazoContratoMeses?: number;
  costosAledanos?: ParksQuotationAdjacentCost[];
  naveIdentificador?: string;
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
    naveVinculadaId?: string;
    naveIdentificador?: string;
    moneda?: 'MXN' | 'USD';
    costosAledanos?: ParksQuotationAdjacentCost[];
  },
): Promise<{
  rentaMensualCalculada: number;
  followUpDue: string;
  requiresConsejoApproval?: boolean;
  consejoReasons?: string[];
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
    requiresConsejoApproval?: boolean;
    consejoReasons?: string[];
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
}): Promise<{
  hojaId: string;
  esquemaComision: string;
  hoja: ParksHojaDeAcuerdosDraft;
}> => {
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
    hoja: ParksHojaDeAcuerdosDraft;
  };
};

export type ParksHojaDeAcuerdosDraft = {
  id: string;
  referencia?: string;
  tipoContrato?: string;
  m2Acordados?: number;
  precioUsdM2?: number;
  plazoMeses?: number;
  fechaInicio?: string;
  fechaFirma?: string;
  periodoGraciaMeses?: number;
  depositoMeses?: number;
  escalacionAnualPct?: number;
  condicionesEspeciales?: string;
  esquemaComision?: string;
  estatus?: string;
  firmadaPorCliente?: boolean;
  firmadaPorCem?: boolean;
  brokerId?: string;
  broker?: { id?: string; empresa?: string };
  brokerComisionPct?: number;
  brokerComisionMonto?: number;
  ejecutivoAsignado?: string;
  nave?: { id?: string; identificador?: string };
  inquilino?: { id?: string; empresa?: string };
};

export type ParksHojaDeAcuerdosUpdateInput = {
  m2Acordados?: number;
  precioUsdM2?: number;
  plazoMeses?: number;
  fechaInicio?: string | null;
  periodoGraciaMeses?: number;
  depositoMeses?: number;
  escalacionAnualPct?: number;
  condicionesEspeciales?: string;
  tipoContrato?: string;
  esquemaComision?: string;
  ejecutivoAsignado?: string;
  brokerId?: string | null;
  brokerComisionPct?: number;
  brokerComisionMonto?: number;
};

export type ParksBroker = {
  id: string;
  empresa?: string;
  contacto?: string;
  email?: string;
  telefono?: string;
  firma?: string;
  clasificacion?: string;
  activo?: boolean;
  operacionesCnt?: number;
  ultimaActividadFecha?: string;
  zonasOperacion?: string;
  empresaBrokerId?: string;
  empresaBroker?: {
    id?: string;
    nombre?: string;
    comisionPct?: number;
    comisionPctNuevo?: number;
    comisionPctPreventa?: number;
    comisionPctRenovacion?: number;
    clasificacion?: string;
  };
  totalComisionesUsd?: number;
  comisionesPendientesUsd?: number;
  comisionesAprobadasUsd?: number;
  comisionesPagadasUsd?: number;
  dealsCount?: number;
};

export type ParksBrokerInput = {
  contacto: string;
  empresaBrokerId?: string;
  // When set (instead of empresaBrokerId), the API creates a brand new
  // empresa de brokers on the fly and links this broker to it.
  nuevaEmpresaNombre?: string;
  email?: string;
  telefono?: string;
  firma?: string;
  activo?: boolean;
};

export type ParksEmpresaBroker = {
  id: string;
  nombre?: string;
  contactoPrincipal?: string;
  email?: string;
  telefono?: string;
  comisionPct?: number;
  comisionPctNuevo?: number;
  comisionPctPreventa?: number;
  comisionPctRenovacion?: number;
  clasificacion?: string;
  clasificacionHistorialJson?: string;
  sectores?: string;
  zonasOperacion?: string;
  documentacionUrl?: string;
  notas?: string;
  activo?: boolean;
  brokersCount?: number;
  totalComisionesUsd?: number;
  comisionesPendientesUsd?: number;
  dealsCount?: number;
};

export type ParksEmpresaBrokerInput = {
  nombre: string;
  contactoPrincipal?: string;
  email?: string;
  telefono?: string;
  comisionPct?: number;
  comisionPctNuevo?: number;
  comisionPctPreventa?: number;
  comisionPctRenovacion?: number;
  clasificacion?: string;
  sectores?: string;
  zonasOperacion?: string;
  documentacionUrl?: string;
  notas?: string;
  activo?: boolean;
};

export const fetchParksBrokers = async (): Promise<ParksBroker[]> => {
  const response = await fetch(`${PARKS_SERVICE_URL}/commercial/brokers`);

  if (!response.ok) {
    throw new Error(await parseErrorMessage(response));
  }

  const body = (await response.json()) as { brokers: ParksBroker[] };

  return body.brokers;
};

export const createParksBroker = async (
  input: ParksBrokerInput,
): Promise<ParksBroker> => {
  const response = await fetch(`${PARKS_SERVICE_URL}/commercial/brokers`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(input),
  });

  if (!response.ok) {
    throw new Error(await parseErrorMessage(response));
  }

  const body = (await response.json()) as { broker: ParksBroker };

  return body.broker;
};

export const updateParksBroker = async (
  brokerId: string,
  input: Partial<ParksBrokerInput>,
): Promise<ParksBroker> => {
  const response = await fetch(
    `${PARKS_SERVICE_URL}/commercial/brokers/${brokerId}`,
    {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(input),
    },
  );

  if (!response.ok) {
    throw new Error(await parseErrorMessage(response));
  }

  const body = (await response.json()) as { broker: ParksBroker };

  return body.broker;
};

export const fetchParksEmpresasBroker = async (): Promise<
  ParksEmpresaBroker[]
> => {
  const response = await fetch(
    `${PARKS_SERVICE_URL}/commercial/empresas-broker`,
  );

  if (!response.ok) {
    throw new Error(await parseErrorMessage(response));
  }

  const body = (await response.json()) as { empresas: ParksEmpresaBroker[] };

  return body.empresas;
};

export const createParksEmpresaBroker = async (
  input: ParksEmpresaBrokerInput,
): Promise<ParksEmpresaBroker> => {
  const response = await fetch(
    `${PARKS_SERVICE_URL}/commercial/empresas-broker`,
    {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(input),
    },
  );

  if (!response.ok) {
    throw new Error(await parseErrorMessage(response));
  }

  const body = (await response.json()) as { empresa: ParksEmpresaBroker };

  return body.empresa;
};

export const updateParksEmpresaBroker = async (
  empresaBrokerId: string,
  input: Partial<ParksEmpresaBrokerInput>,
): Promise<ParksEmpresaBroker> => {
  const response = await fetch(
    `${PARKS_SERVICE_URL}/commercial/empresas-broker/${empresaBrokerId}`,
    {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(input),
    },
  );

  if (!response.ok) {
    throw new Error(await parseErrorMessage(response));
  }

  const body = (await response.json()) as { empresa: ParksEmpresaBroker };

  return body.empresa;
};

export const fetchParksHojaByOpportunity = async (
  opportunityId: string,
): Promise<ParksHojaDeAcuerdosDraft | null> => {
  const response = await fetch(
    `${PARKS_SERVICE_URL}/commercial/hoja-acuerdos/by-opportunity/${opportunityId}`,
  );

  if (!response.ok) {
    throw new Error(await parseErrorMessage(response));
  }

  const payload = (await response.json()) as {
    hoja: ParksHojaDeAcuerdosDraft | null;
  };

  return payload.hoja;
};

export const updateParksHojaAcuerdos = async (
  hojaId: string,
  input: ParksHojaDeAcuerdosUpdateInput,
): Promise<ParksHojaDeAcuerdosDraft> => {
  const response = await fetch(
    `${PARKS_SERVICE_URL}/commercial/hoja-acuerdos/${hojaId}`,
    {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(input),
    },
  );

  if (!response.ok) {
    throw new Error(await parseErrorMessage(response));
  }

  const payload = (await response.json()) as {
    hoja: ParksHojaDeAcuerdosDraft;
  };

  return payload.hoja;
};

export const generateParksHojaCopy = async (
  hojaId: string,
): Promise<{ html: string; fileName: string; referencia: string }> => {
  const response = await fetch(
    `${PARKS_SERVICE_URL}/commercial/hoja-acuerdos/${hojaId}/generate-copy`,
    {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
    },
  );

  if (!response.ok) {
    throw new Error(await parseErrorMessage(response));
  }

  return (await response.json()) as {
    html: string;
    fileName: string;
    referencia: string;
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
): Promise<{
  readyForLegal: boolean;
  firmadaPorCem: boolean;
  firmadaPorCliente: boolean;
  casoLegalId?: string;
  nextStage?: string;
}> => {
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

  return (await response.json()) as {
    readyForLegal: boolean;
    firmadaPorCem: boolean;
    firmadaPorCliente: boolean;
    casoLegalId?: string;
    nextStage?: string;
  };
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
    return {
      ok: false,
      error: body.error ?? (await parseErrorMessage(response)),
    };
  }

  return body;
};

export const createParksOpportunityForInquilino = async (
  inquilinoId: string,
  input: Omit<CreateParksLeadInput, 'empresa' | 'nombreCompleto'> & {
    nombreCompleto?: string;
  },
): Promise<{ opportunityId: string; inquilinoId: string; folio?: string }> => {
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
    folio?: string;
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

export const fetchParksExpansionSignals =
  async (): Promise<ParksExpansionSignalsResponse> => {
    const response = await fetch(PARKS_COMMERCIAL_EXPANSION_SIGNALS_ENDPOINT);

    if (!response.ok) {
      throw new Error(await parseErrorMessage(response));
    }

    return (await response.json()) as ParksExpansionSignalsResponse;
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

type ParksNotificationViewerParams = {
  viewerName?: string;
  viewerEmail?: string;
  viewerRoleLabels?: string[];
};

const buildNotificationsQuery = ({
  unreadOnly = false,
  viewerName,
  viewerEmail,
  viewerRoleLabels,
}: {
  unreadOnly?: boolean;
} & ParksNotificationViewerParams): string => {
  const params = new URLSearchParams();

  if (unreadOnly) {
    params.set('unreadOnly', 'true');
  }

  if (viewerName) {
    params.set('viewerName', viewerName);
  }

  if (viewerEmail) {
    params.set('viewerEmail', viewerEmail);
  }

  if (viewerRoleLabels && viewerRoleLabels.length > 0) {
    params.set('viewerRoleLabels', viewerRoleLabels.join(','));
  }

  const query = params.toString();

  return query ? `?${query}` : '';
};

export const fetchParksNotifications = async ({
  unreadOnly = false,
  viewerName,
  viewerEmail,
  viewerRoleLabels,
}: {
  unreadOnly?: boolean;
} & ParksNotificationViewerParams = {}): Promise<BrokerNotificationsResponse> => {
  const query = buildNotificationsQuery({
    unreadOnly,
    viewerName,
    viewerEmail,
    viewerRoleLabels,
  });
  const response = await fetch(
    `${PARKS_COMMERCIAL_NOTIFICATIONS_ENDPOINT}${query}`,
  );

  if (!response.ok) {
    throw new Error(await parseErrorMessage(response));
  }

  return (await response.json()) as BrokerNotificationsResponse;
};

export const markParksNotificationRead = async ({
  notificationId,
  viewerName,
  viewerEmail,
  viewerRoleLabels,
}: {
  notificationId: string;
} & ParksNotificationViewerParams): Promise<{
  notification: BrokerNotification;
  unreadCount: number;
}> => {
  const query = buildNotificationsQuery({
    viewerName,
    viewerEmail,
    viewerRoleLabels,
  });
  const response = await fetch(
    `${PARKS_COMMERCIAL_NOTIFICATIONS_ENDPOINT}/${notificationId}/read${query}`,
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

export const markAllParksNotificationsRead = async ({
  viewerName,
  viewerEmail,
  viewerRoleLabels,
}: ParksNotificationViewerParams = {}): Promise<number> => {
  const response = await fetch(
    `${PARKS_COMMERCIAL_NOTIFICATIONS_ENDPOINT}/mark-all-read`,
    {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ viewerName, viewerEmail, viewerRoleLabels }),
    },
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
  limit = 50,
}: {
  opportunityId: string;
  m2Requeridos: number;
  industry?: string;
  cityFilter?: string;
  minAlturaLibre?: number;
  minAndenes?: number;
  limit?: number;
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
      limit,
    }),
  });

  if (!response.ok) {
    throw new Error(await parseErrorMessage(response));
  }

  return (await response.json()) as NaveMatchResult;
};

export const createParksFichaTecnica = async (input: {
  opportunityId?: string;
  opportunityName?: string;
  naveId: string;
  naveIdentificador: string;
  parqueNombre?: string;
  ubicacion?: string;
  m2: number;
  precioUsdM2?: number;
  source?: 'pipeline' | 'stacking-plan' | 'inventory';
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

export const downloadParksFichaTecnicaPdf = async ({
  token,
  filename,
}: {
  token: string;
  filename: string;
}): Promise<void> => {
  const response = await fetch(
    `${PARKS_SERVICE_URL}/commercial/ficha/${token}/pdf`,
  );

  if (!response.ok) {
    throw new Error(await parseErrorMessage(response));
  }

  const pdfBlob = await response.blob();
  const objectUrl = URL.createObjectURL(pdfBlob);
  const anchor = document.createElement('a');
  anchor.href = objectUrl;
  anchor.download = filename.endsWith('.pdf') ? filename : `${filename}.pdf`;
  document.body.appendChild(anchor);
  anchor.click();
  anchor.remove();
  URL.revokeObjectURL(objectUrl);
};

export const openParksFichaTecnicaPdf = async (
  token: string,
): Promise<void> => {
  const response = await fetch(
    `${PARKS_SERVICE_URL}/commercial/ficha/${token}/pdf`,
  );

  if (!response.ok) {
    throw new Error(await parseErrorMessage(response));
  }

  const pdfBlob = await response.blob();
  const objectUrl = URL.createObjectURL(pdfBlob);
  window.open(objectUrl, '_blank', 'noopener,noreferrer');
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

export const searchParksDemandProspects = async (
  filters: DemandSearchFilters,
): Promise<DemandSearchResult> => {
  const response = await fetch(PARKS_COMMERCIAL_DEMAND_SEARCH_ENDPOINT, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(filters),
  });

  if (!response.ok) {
    throw new Error(await parseErrorMessage(response));
  }

  return (await response.json()) as DemandSearchResult;
};

export const generateParksComposerMaterial = async ({
  templateType,
  opportunityId,
  opportunityName,
  companyName,
  naveIdentificador,
  parqueNombre,
  ubicacion,
  m2,
  precioUsdM2,
}: {
  templateType: ComposerTemplateType;
  opportunityId?: string;
  opportunityName?: string;
  companyName?: string;
  naveIdentificador: string;
  parqueNombre?: string;
  ubicacion?: string;
  m2?: number;
  precioUsdM2?: number;
}): Promise<ComposerGenerateResult> => {
  const response = await fetch(PARKS_COMMERCIAL_COMPOSER_ENDPOINT, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      templateType,
      opportunityId,
      opportunityName,
      companyName,
      naveIdentificador,
      parqueNombre,
      ubicacion,
      m2,
      precioUsdM2,
    }),
  });

  if (!response.ok) {
    throw new Error(await parseErrorMessage(response));
  }

  return (await response.json()) as ComposerGenerateResult;
};

export const fetchParksActivityTimeline = async (
  opportunityId: string,
): Promise<ActivityTimelineResult> => {
  const response = await fetch(
    `${PARKS_COMMERCIAL_ACTIVITY_TIMELINE_ENDPOINT}/${opportunityId}`,
  );

  if (!response.ok) {
    throw new Error(await parseErrorMessage(response));
  }

  return (await response.json()) as ActivityTimelineResult;
};

export const fetchParksDealWinPreview = async (
  opportunityId: string,
): Promise<DealWinPreview> => {
  const response = await fetch(
    `${PARKS_COMMERCIAL_DEAL_WIN_PREVIEW_ENDPOINT}/${opportunityId}`,
  );

  if (!response.ok) {
    throw new Error(await parseErrorMessage(response));
  }

  return (await response.json()) as DealWinPreview;
};

export const createParksBulkFollowUp = async (
  opportunityIds: string[],
): Promise<{ tasksCreated: number; message: string }> => {
  const response = await fetch(PARKS_COMMERCIAL_BULK_FOLLOW_UP_ENDPOINT, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ opportunityIds }),
  });

  if (!response.ok) {
    throw new Error(await parseErrorMessage(response));
  }

  return (await response.json()) as {
    tasksCreated: number;
    message: string;
  };
};

export const sendParksMapOutreach = async (input: {
  leads: Array<{
    opportunityId: string;
    opportunityName: string;
    companyName?: string;
    ubicacionDeseada?: string;
    m2Requeridos?: number;
    contactEmail?: string;
  }>;
  nave: {
    naveId: string;
    naveIdentificador: string;
    parqueNombre?: string;
    ubicacion?: string;
    m2?: number;
    precioUsdM2?: number;
    availabilityLabel?: string;
  };
  personalNote?: string;
  senderName?: string;
}): Promise<MapOutreachResult> => {
  const response = await fetch(PARKS_COMMERCIAL_MAP_OUTREACH_ENDPOINT, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(input),
  });

  if (!response.ok) {
    throw new Error(await parseErrorMessage(response));
  }

  return (await response.json()) as MapOutreachResult;
};
