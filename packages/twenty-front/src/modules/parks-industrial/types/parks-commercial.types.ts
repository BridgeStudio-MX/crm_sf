export type BrokerNotificationType =
  | 'task'
  | 'enrichment'
  | 'alert'
  | 'email'
  | 'system';

export type BrokerNotificationPriority = 'high' | 'normal' | 'low';

export type BrokerNotification = {
  id: string;
  type: BrokerNotificationType;
  priority: BrokerNotificationPriority;
  title: string;
  body: string;
  area?: string;
  opportunityId?: string;
  opportunityName?: string;
  actionPath?: string;
  actionLabel?: string;
  audienceRoleLabels?: string[];
  audienceNames?: string[];
  read: boolean;
  createdAt: string;
};

export type BrokerNotificationsResponse = {
  notifications: BrokerNotification[];
  unreadCount: number;
};

export type ProspectEnrichmentResult = {
  opportunityId: string;
  companyName: string;
  industry: string;
  employeeCountEstimate: string;
  revenueEstimateUsd: string;
  investmentSignals: string[];
  linkedInSignals: string[];
  fitScore: number;
  urgency: 'alta' | 'media' | 'baja';
  riskLevel: 'bajo' | 'medio' | 'alto';
  summary: string;
  suggestedActions: string[];
  usedLlm: boolean;
  enrichedAt: string;
};

export type NaveMatchCandidate = {
  naveId: string;
  identificador: string;
  m2: number;
  parqueNombre?: string;
  ubicacion?: string;
  precioUsdM2?: number;
  alturaLibreM?: number;
  andenes?: number;
  estatus?: string;
  fotoInmuebleUrl?: string;
  disponibilidadCondicional?: boolean;
  matchScore: number;
  matchReasons: string[];
};

export type NaveMatchResult = {
  opportunityId?: string;
  m2Requeridos: number;
  industry?: string;
  matches: NaveMatchCandidate[];
  totalDisponibles: number;
};

export type FichaTecnicaSentVia = 'email' | 'whatsapp' | 'link';

export type FichaTecnicaLink = {
  token: string;
  opportunityId: string;
  opportunityName: string;
  naveId: string;
  naveIdentificador: string;
  parqueNombre?: string;
  ubicacion?: string;
  m2: number;
  precioUsdM2?: number;
  fotoInmuebleUrl?: string;
  fotoParqueUrl?: string;
  publicUrl: string;
  viewCount: number;
  lastViewedAt?: string;
  sentVia: FichaTecnicaSentVia | null;
  sentAt?: string;
  createdAt: string;
};

export type SalesScriptResult = {
  opportunityId?: string;
  companyName: string;
  industry: string;
  scriptTitle: string;
  openingLine: string;
  discoveryQuestions: string[];
  valueProposition: string;
  visitAgenda: string[];
  closingLine: string;
  usedLlm: boolean;
  generatedAt: string;
};

export type ProspectScoreTier = 'hot' | 'warm' | 'cold';

export type ProspectScoreResult = {
  fitScore: number;
  urgency: 'alta' | 'media' | 'baja';
  tier: ProspectScoreTier;
  industry: string;
  scoreLabel: string;
};

export type ProspectScoresResponse = {
  scores: Record<string, ProspectScoreResult>;
};

export type EmailSequenceStep = {
  stepNumber: number;
  subject: string;
  scheduledIn: string;
  status: 'scheduled' | 'sent';
  preview: string;
};

export type EmailSequenceResult = {
  opportunityId: string;
  companyName: string;
  industry: string;
  steps: EmailSequenceStep[];
};

export type DecisorClienteRol =
  | 'DUENO_EMPRESA'
  | 'DIRECTOR_LOGISTICA'
  | 'GERENTE_OPERACIONES'
  | 'GERENTE_AMPLIACION'
  | 'BROKER_CLIENTE';

export type DecisorCliente = {
  id: string;
  inquilinoId?: string;
  opportunityId?: string;
  nombre: string;
  correo?: string;
  telefono?: string;
  rol: DecisorClienteRol;
  asistioTour?: boolean;
  createdAt: string;
  updatedAt: string;
};

export type ParksAccount360Contrato = {
  id: string;
  numeroExpediente?: string;
  fechaApertura?: string;
  fechaVencimiento?: string;
  rentaMensualUsd?: number;
  estatus?: string;
  naveIdentificador?: string;
  parqueNombre?: string;
  m2?: number;
  casoLegalId?: string;
  esPropiedadFuno?: boolean;
};

export type ParksAccount360Oportunidad = {
  id: string;
  name?: string;
  stage?: string;
  tipoOperacion?: string;
  m2Requeridos?: number;
  ubicacionDeseada?: string;
  updatedAt?: string;
  createdAt?: string;
  naveIdentificador?: string;
  enProceso: boolean;
};

export type ParksAccount360CasoLegal = {
  id: string;
  referencia?: string;
  tipoDocumento?: string;
  estatus?: string;
  semaforo?: string;
  abogadoAsignado?: string;
  diasTranscurridos?: number;
  slaDiasHabiles?: number;
  documentacionCompleta?: boolean;
  slaPausado?: boolean;
  naveIdentificador?: string;
  parqueNombre?: string;
  esPropiedadFuno?: boolean;
  fechaHojaAcuerdos?: string;
  hojaDeAcuerdosId?: string;
};

export type ParksAccount360HojaDeAcuerdos = {
  id: string;
  referencia?: string;
  tipoContrato?: string;
  m2Acordados?: number;
  precioUsdM2?: number;
  plazoMeses?: number;
  fechaInicio?: string;
  fechaFirma?: string;
  depositoMeses?: number;
  periodoGraciaMeses?: number;
  escalacionAnualPct?: number;
  estatus?: string;
  firmadaPorCliente?: boolean;
  firmadaPorCem?: boolean;
  ejecutivoAsignado?: string;
  naveIdentificador?: string;
  parqueNombre?: string;
  oportunidadVinculadaId?: string;
  rentaMensualEstimadaUsd?: number;
};

export type ParksAccount360Documento = {
  id: string;
  titulo?: string;
  tipoDocumento?: string;
  entregado: boolean;
  // Documentos entregados pasan por extracción/validación IA (CSF, acta, etc.)
  validadoIa?: boolean;
  casoLegalId: string;
  casoReferencia?: string;
};

export type ParksAccount360Actividad = {
  id: string;
  type: 'email' | 'call' | 'task' | 'meeting';
  direction: 'inbound' | 'outbound' | 'internal';
  subject: string;
  summary: string;
  participant: string;
  occurredAt: string;
  source: 'gmail' | 'crm' | 'email-parser';
  opportunityId?: string;
  opportunityName?: string;
};

export type ParksAccount360CxcResumen = {
  accountId: string;
  estatusPagos: string;
  scoreRiesgo: number;
  scoreLabel: string;
  montoAdeudoTotal: number;
  diasEnMora: number;
  rentaMensual: number;
  moneda: 'MXN' | 'USD';
  ultimaFechaPago: string | null;
  nave: string;
  parque: string;
  facturasPendientes: number;
  cicloEstatus: string;
};

export type ParksAccount360Interaccion = {
  id: string;
  titulo: string;
  descripcion: string;
  fecha: string;
  tipo:
    | 'oportunidad'
    | 'notificacion'
    | 'legal'
    | 'cxc'
    | 'hoja'
    | 'documento';
  linkId?: string;
};

export type ParksAccount360EstadoPagos = {
  alCorriente?: boolean;
  ultimoPagoFecha?: string;
  fuente: 'oracle' | 'cxc' | 'sin-datos';
  montoAdeudoTotal?: number;
  diasEnMora?: number;
};

export type ParksAccount360Response = {
  inquilinoId: string;
  inquilino?: {
    id: string;
    empresa?: string;
    rfc?: string;
    contactoPrincipal?: string;
    emailContacto?: string;
    telefono?: string;
    repLegalNombre?: string;
    repLegalEmail?: string;
    sector?: string;
    estatus?: string;
    oracleClienteId?: string;
    ultimoPagoFecha?: string;
    pagosAlCorriente?: boolean;
  };
  decisores: DecisorCliente[];
  expedientesActivos: number;
  contratos: ParksAccount360Contrato[];
  oportunidades: ParksAccount360Oportunidad[];
  oportunidadesEnProceso: number;
  casosLegales: ParksAccount360CasoLegal[];
  casosLegalesActivos: number;
  hojasDeAcuerdos: ParksAccount360HojaDeAcuerdos[];
  documentos: ParksAccount360Documento[];
  documentosEntregados: number;
  documentosPendientes: number;
  actividades: ParksAccount360Actividad[];
  cxc?: ParksAccount360CxcResumen;
  interacciones: ParksAccount360Interaccion[];
  estadoPagos: ParksAccount360EstadoPagos;
  tieneContratosFuno: boolean;
  senalesExpansion?: ParksExpansionSignal[];
  note?: string;
};

export type ParksExpansionSignal = {
  id: string;
  inquilinoId?: string;
  inquilinoNombre: string;
  titulo: string;
  detalle: string;
  fuente: string;
  confianza: string;
  zonaObjetivo: string;
  naveActual?: string;
  parqueActual?: string;
  mesesOcupado?: number;
  navesCandidatas: Array<{
    identificador: string;
    parqueNombre: string;
    m2: number;
    estatus: string;
    precioBaseUsd?: number;
  }>;
  detectedAt: string;
  refreshedAt: string;
};

export type ParksExpansionSignalsResponse = {
  signals: ParksExpansionSignal[];
  summaries: Array<{
    inquilinoNombre: string;
    signalCount: number;
    topTitulo: string;
    confianza: string;
  }>;
  refreshedAt: string;
};

export type DemandSearchFilters = {
  m2Min?: number;
  m2Max?: number;
  cityFilter?: string;
  sectorFilter?: string;
  canalOrigen?: string;
  minAlturaLibre?: number;
  minAndenes?: number;
  limit?: number;
};

export type DemandSearchProspect = {
  opportunityId: string;
  companyName: string;
  stage?: string;
  m2Requeridos?: number;
  ubicacionDeseada?: string;
  sector?: string;
  canalOrigen?: string;
  plazoContratoMeses?: number;
  presupuestoMensualUsd?: number;
  inquilinoId?: string;
  naveVinculadaIdentificador?: string;
  updatedAt?: string;
  matchingNaves: NaveMatchCandidate[];
};

export type DemandSearchResult = {
  filters: DemandSearchFilters;
  totalMatches: number;
  prospects: DemandSearchProspect[];
  searchedAt: string;
};

export type ComposerTemplateType = 'brochure' | 'listing-report';

export type ComposerGenerateResult = {
  templateType: ComposerTemplateType;
  html: string;
  fileName: string;
  filePath: string;
  generatedAt: string;
};

export type ActivityTimelineEntry = {
  id: string;
  type: 'email' | 'call' | 'task' | 'meeting';
  direction: 'inbound' | 'outbound' | 'internal';
  subject: string;
  summary: string;
  participant: string;
  occurredAt: string;
  source: 'gmail' | 'crm' | 'email-parser';
};

export type ActivityTimelineResult = {
  opportunityId: string;
  companyName: string;
  entries: ActivityTimelineEntry[];
  gmailConnected: boolean;
};

export type DealWinPreview = {
  opportunityId: string;
  companyName: string;
  naveIdentificador?: string;
  willCreateCasoLegal: boolean;
  willReserveNave: boolean;
  willOpenExpedienteOnClose: boolean;
  steps: string[];
};

export type MapOutreachDraft = {
  opportunityId: string;
  opportunityName: string;
  companyName: string;
  toEmail: string | null;
  subject: string;
  body: string;
  mailtoUrl: string;
};

export type MapOutreachResult = {
  sentCount: number;
  drafts: MapOutreachDraft[];
  message: string;
  generatedAt: string;
};
