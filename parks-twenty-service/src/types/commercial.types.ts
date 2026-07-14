import { type DecisorCliente } from './decisor-cliente.types';
import { type InquilinoRecord } from './parks.types';

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

export type {
  FichaDisponibilidadEstatus,
  FichaTecnicaDetalle,
  FichaTecnicaLink,
  FichaTecnicaSentVia,
} from './ficha-tecnica.types';

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

export type Account360Contrato = {
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

export type Account360Oportunidad = {
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

export type Account360CasoLegal = {
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

export type Account360HojaDeAcuerdos = {
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

export type Account360Documento = {
  id: string;
  titulo?: string;
  tipoDocumento?: string;
  entregado: boolean;
  casoLegalId: string;
  casoReferencia?: string;
};

export type Account360Actividad = {
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

export type Account360CxcResumen = {
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

export type Account360Interaccion = {
  id: string;
  titulo: string;
  descripcion: string;
  fecha: string;
  tipo: 'oportunidad' | 'notificacion' | 'legal' | 'cxc' | 'hoja' | 'documento';
  linkId?: string;
};

export type Account360EstadoPagos = {
  alCorriente?: boolean;
  ultimoPagoFecha?: string;
  fuente: 'oracle' | 'cxc' | 'sin-datos';
  montoAdeudoTotal?: number;
  diasEnMora?: number;
};

export type Account360Response = {
  inquilinoId: string;
  inquilino?: InquilinoRecord;
  decisores: DecisorCliente[];
  expedientesActivos: number;
  contratos: Account360Contrato[];
  oportunidades: Account360Oportunidad[];
  oportunidadesEnProceso: number;
  casosLegales: Account360CasoLegal[];
  casosLegalesActivos: number;
  hojasDeAcuerdos: Account360HojaDeAcuerdos[];
  documentos: Account360Documento[];
  documentosEntregados: number;
  documentosPendientes: number;
  actividades: Account360Actividad[];
  cxc?: Account360CxcResumen;
  interacciones: Account360Interaccion[];
  estadoPagos: Account360EstadoPagos;
  tieneContratosFuno: boolean;
  note?: string;
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

export type ComposerGenerateInput = {
  templateType: ComposerTemplateType;
  opportunityId?: string;
  opportunityName?: string;
  companyName?: string;
  naveIdentificador: string;
  parqueNombre?: string;
  ubicacion?: string;
  m2?: number;
  precioUsdM2?: number;
  description?: string;
  inquiriesCount?: number;
  toursCount?: number;
  proposalsCount?: number;
};

export type ComposerGenerateResult = {
  templateType: ComposerTemplateType;
  html: string;
  fileName: string;
  filePath: string;
  generatedAt: string;
};

export type ActivityTimelineEntryType =
  | 'email'
  | 'call'
  | 'task'
  | 'meeting';

export type ActivityTimelineEntry = {
  id: string;
  type: ActivityTimelineEntryType;
  direction: 'inbound' | 'outbound' | 'internal';
  subject: string;
  summary: string;
  participant: string;
  occurredAt: string;
  source: 'gmail' | 'crm' | 'email-parser';
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
