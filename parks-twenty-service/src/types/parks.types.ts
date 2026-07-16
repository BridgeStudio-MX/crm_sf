export type SemaforoColor =
  | 'VERDE'
  | 'AZUL'
  | 'AMARILLO'
  | 'NARANJA'
  | 'ROJO';

export type TipoDocumentoLegal =
  | 'Contrato nuevo'
  | 'Convenio renovación'
  | 'Convenio aclaración'
  | 'Terminación anticipada'
  | 'Build-to-suit';

export type TipoDocumentoChecklist =
  | 'Acta constitutiva'
  | 'Poder notarial'
  | 'Comprobante domicilio'
  | 'INE representante'
  | 'CSF'
  | 'Constancia obligaciones'
  | 'Estados financieros'
  | 'Info obligado solidario'
  | 'Garantía'
  | 'NDA/Convenio confidencialidad';

export type CasoLegalRecord = {
  id: string;
  referencia?: string;
  folio?: string;
  tipoDocumento?: string;
  estatus: string;
  fechaHojaAcuerdos?: string;
  slaDiasHabiles: number;
  slaFechaLimite?: string;
  diasTranscurridos: number;
  documentacionCompleta?: boolean;
  cotejoAprobado?: boolean;
  abogadoAsignado?: string;
  slaPausado?: boolean;
  fechaPausaSla?: string;
  motivoPausa?: string;
  diasPausados?: number;
  versionActual?: number;
  requiereConvenioConfidencialidad?: boolean;
  ndaFirmado?: boolean;
  esPropiedadFuno?: boolean;
  holdoverActivo: boolean;
  clienteNoRenueva: boolean;
  semaforo?: SemaforoColor | string;
  notasCatalina?: string;
  pdfBorradorUrl?: string;
  hojaDeAcuerdosId?: string;
  inquilinoId?: string;
  naveId?: string;
  inquilino?: InquilinoRecord;
  nave?: NaveRecord & {
    parque?: { id?: string; nombre?: string };
  };
  hojaDeAcuerdos?: HojaDeAcuerdosRecord;
};

export type HojaDeAcuerdosRecord = {
  id: string;
  referencia?: string;
  folio?: string;
  tipoContrato?: string;
  naveId?: string;
  inquilinoId?: string;
  brokerId?: string;
  oportunidadVinculadaId?: string;
  precioUsdM2: number;
  m2Acordados: number;
  plazoMeses: number;
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
  brokerComisionPct?: number;
  brokerComisionMonto?: number;
  ejecutivoAsignado?: string;
  nave?: NaveRecord;
  inquilino?: InquilinoRecord;
  broker?: BrokerRecord;
};

export type NaveRecord = {
  id: string;
  identificador?: string;
  esPropiedadFuno: boolean;
  estatus?: string;
  m2?: number;
  alturaLibreM?: number;
  andenes?: number;
  cargaPisoTon?: number;
  potenciaKva?: number;
  oficinasM2?: number;
  precioBaseUsd?: number;
  fotoInmuebleUrl?: string;
  parqueId?: string;
  parque?: ParqueRecord;
};

export type ParqueRecord = {
  id: string;
  nombre?: string;
  ubicacion?: string;
  fotoEntradaUrl?: string;
};

export type InquilinoRecord = {
  id: string;
  empresa?: string;
  rfc?: string;
  repLegalNombre?: string;
  contactoPrincipal?: string;
  emailContacto?: string;
  telefono?: string;
  repLegalEmail?: string;
  sector?: string;
  estatus?: string;
  oracleClienteId?: string;
  ultimoPagoFecha?: string;
  pagosAlCorriente?: boolean;
};

export type BrokerRecord = {
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
    clasificacion?: string;
  };
};

export type BrokerWithCommissionStats = BrokerRecord & {
  totalComisionesUsd: number;
  comisionesPendientesUsd: number;
  comisionesAprobadasUsd: number;
  comisionesPagadasUsd: number;
  dealsCount: number;
};

export type EmpresaBrokerRecord = {
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
};

export type EmpresaBrokerWithStats = EmpresaBrokerRecord & {
  brokersCount: number;
  totalComisionesUsd: number;
  comisionesPendientesUsd: number;
  dealsCount: number;
};

export type ExpedienteContratoRecord = {
  id: string;
  numeroExpediente?: string;
  fechaApertura?: string;
  fechaVencimiento: string;
  rentaMensualUsd?: number;
  estatus?: string;
  oracleSincronizado?: boolean;
  oracleContratoId?: string;
  casoLegalId?: string;
  inquilinoId?: string;
  naveId?: string;
  inquilino?: InquilinoRecord & { oracleClienteId?: string };
  nave?: NaveRecord & {
    oracleNaveId?: string;
    esPropiedadFuno?: boolean;
    parque?: { id?: string; nombre?: string };
  };
  casoLegal?: { id: string; estatus?: string; tipoDocumento?: string };
};

export type HoldoverRecord = {
  id: string;
  referencia?: string;
};

export type ComisionRecord = {
  id: string;
  tipo?: string;
  tipoPago?: string;
  beneficiario?: string;
  folio?: string;
  clienteNombre?: string;
  leasingOfficer?: string;
  origenDeal?: string;
  tipoContratoComision?: string;
  estatusNaveComision?: string;
  brokerTierSnapshot?: string;
  rentaTotalContrato?: number;
  pctAplicado?: number;
  montoUsd?: number;
  estatus?: string;
  baseCalculo?: string;
  aprobadoPor?: string;
  fechaAprobacion?: string;
  ajusteMonto?: number;
  motivoAjuste?: string;
  fechaCierre?: string;
  fechaPago?: string;
  opportunityId?: string;
  hojaDeAcuerdosId?: string;
  casoLegalId?: string;
  brokerId?: string;
  broker?: { id?: string; empresa?: string };
  hojaDeAcuerdos?: {
    referencia?: string;
    folio?: string;
    m2Acordados?: number;
    precioUsdM2?: number;
    nave?: { identificador?: string };
  };
  casoLegal?: { referencia?: string; folio?: string };
};

export type NotificacionTicket = {
  area: string;
  titulo: string;
  descripcion: string;
};

export type OpportunityRecord = {
  id: string;
  name?: string;
  stage?: string;
  etapaRenovacion?: string;
  inquilinoVinculadoId?: string;
  naveVinculadaId?: string;
  brokerVinculadoId?: string;
  tipoOperacion?: string;
  m2Requeridos?: number;
  m2Ofertados?: number;
  precioPorM2Usd?: number;
  plazoContratoMeses?: number;
  periodoGraciaMeses?: number;
  depositoGarantiaMeses?: number;
  rentasAdelantadasMeses?: number;
  escalacionAnual?: string;
  aprobacionRequerida?: boolean;
  estatusAprobacion?: string;
  nivelAprobacion?: string;
  comentarioAprobacion?: string;
  monedaCotizacion?: string;
  costosAledanosJson?: string;
  cotizacionHistorialJson?: string;
  primerContactoRealizado?: boolean;
  rentaMensualCalculada?: number;
  folio?: string;
  leasingOfficerAsignado?: string;
  esquemaComision?: string;
  updatedAt?: string;
  createdAt?: string;
  ubicacionDeseada?: string;
  naveVinculada?: { id?: string; identificador?: string };
  amount?: { amountMicros?: number; currencyCode?: string };
};

export type FlujoFirmasRecord = {
  id: string;
  orden: number;
  firmante?: string;
  rol?: string;
  estatus?: string;
  casoLegalId?: string;
};

export type TwentyWebhookPayload = {
  eventName?: string;
  objectName?: string;
  recordId?: string;
  objectMetadata?: {
    id?: string;
    nameSingular?: string;
  };
  record?: Record<string, unknown>;
  updatedFields?: string[];
  workspaceId?: string;
  webhookId?: string;
  eventDate?: string;
  [key: string]: unknown;
};

export type GraphQlConnection<TNode> = {
  edges: { node: TNode }[];
};
