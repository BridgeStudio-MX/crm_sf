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
  tipoDocumento?: string;
  estatus: string;
  fechaHojaAcuerdos?: string;
  slaDiasHabiles: number;
  slaFechaLimite?: string;
  diasTranscurridos: number;
  documentacionCompleta?: boolean;
  cotejoAprobado?: boolean;
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
  nave?: NaveRecord;
  hojaDeAcuerdos?: HojaDeAcuerdosRecord;
};

export type HojaDeAcuerdosRecord = {
  id: string;
  referencia?: string;
  tipoContrato?: string;
  naveId?: string;
  inquilinoId?: string;
  brokerId?: string;
  precioUsdM2: number;
  m2Acordados: number;
  plazoMeses: number;
  fechaInicio?: string;
  fechaFirma?: string;
  brokerComisionPct?: number;
  brokerComisionMonto?: number;
  ejecutivoAsignado?: string;
  nave?: NaveRecord;
  broker?: BrokerRecord;
};

export type NaveRecord = {
  id: string;
  identificador?: string;
  esPropiedadFuno: boolean;
  estatus?: string;
  parque?: ParqueRecord;
};

export type ParqueRecord = {
  id: string;
  nombre?: string;
  ubicacion?: string;
};

export type InquilinoRecord = {
  id: string;
  empresa?: string;
  rfc?: string;
  repLegalNombre?: string;
  contactoPrincipal?: string;
  emailContacto?: string;
  estatus?: string;
};

export type BrokerRecord = {
  id: string;
  empresa?: string;
  contacto?: string;
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
  nave?: NaveRecord & { oracleNaveId?: string };
  casoLegal?: { id: string; estatus?: string; tipoDocumento?: string };
};

export type HoldoverRecord = {
  id: string;
  referencia?: string;
};

export type ComisionRecord = {
  id: string;
  tipo?: string;
  beneficiario?: string;
  montoUsd?: number;
  estatus?: string;
  baseCalculo?: string;
  hojaDeAcuerdosId?: string;
  casoLegalId?: string;
  hojaDeAcuerdos?: {
    referencia?: string;
    m2Acordados?: number;
    precioUsdM2?: number;
    nave?: { identificador?: string };
  };
  casoLegal?: { referencia?: string };
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
  updatedAt?: string;
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
