export type DocumentoVigenciaEstatus =
  | 'Vigente'
  | 'Por vencer'
  | 'Vencido'
  | 'Sin fecha';

export type ChecklistDocumentoVigencia = {
  documentoChecklistId: string;
  tipoDocumento: string;
  entregado: boolean;
  fechaEntrega?: string | null;
  fechaVencimiento?: string | null;
  vigenciaEstatus: DocumentoVigenciaEstatus;
  diasParaVencer?: number | null;
};

export type ChecklistVigenciaResumen = {
  casoLegalId: string;
  empresa: string;
  checklistDocumentosVigentes: boolean;
  documentosConAlerta: string;
  documentos: ChecklistDocumentoVigencia[];
};

export type ExpansionOportunidad = {
  id: string;
  inquilinoNombre: string;
  naveActual: string;
  parqueNombre: string;
  mesesOcupado: number;
  navesDisponibles: Array<{
    identificador: string;
    m2: number;
    precioBaseUsd: number;
  }>;
  taskCreated: boolean;
};

export type ConcentracionParque = {
  parqueNombre: string;
  m2Totales: number;
  umbralPct: number;
  contratosProximos90d: number;
  m2EnRiesgo: number;
  porcentajeRiesgo: number;
  alerta: boolean;
  contratos: Array<{
    empresa: string;
    fechaVencimiento: string;
    m2: number;
  }>;
};

export type RoiCanalFila = {
  canalOrigen: string;
  totalOportunidades: number;
  dealsCerrados: number;
  tasaCierrePct: number;
  diasCicloPromedio: number | null;
  rentaPromedioUsd: number | null;
  costoComisionesUsd: number;
  revenueAnualizadoUsd: number;
};

export type OfertaRenovacionIncentivo =
  | 'Días de gracia adicionales'
  | 'Descuento en renta'
  | 'Mejoras a la nave (tenant improvements)'
  | 'Combinación';

export type OfertaRenovacionEstatus =
  | 'Borrador'
  | 'Enviada al cliente'
  | 'Aceptada'
  | 'Rechazada'
  | 'Expirada';

export type OfertaRenovacionAnticipada = {
  id: string;
  casoLegalId: string;
  empresa: string;
  inquilinoId?: string;
  loNombre: string;
  tipoIncentivo: OfertaRenovacionIncentivo;
  diasGraciaAdicionales?: number;
  descuentoPorcentaje?: number;
  descripcionMejoras?: string;
  observaciones?: string;
  fechaOferta: string;
  fechaVencimientoOferta: string;
  estatus: OfertaRenovacionEstatus;
  oportunidadRenovacionId?: string;
  createdAt: string;
  updatedAt: string;
};

export type LeadResponseMetric = {
  opportunityId: string;
  nombre: string;
  leasingOfficer: string;
  createdAt: string;
  fechaPrimeraActividad?: string | null;
  tiempoPrimeraRespuestaHoras?: number | null;
  semaforo:
    | 'Excelente'
    | 'Bueno'
    | 'Regular'
    | 'Tardío'
    | 'Sin contacto';
};

export type LeadResponsePorLo = {
  leasingOfficer: string;
  totalLeads: number;
  promedioHoras: number | null;
  pctExcelente: number;
  sinContacto48h: number;
};

export type BrokerOutreachAlert = {
  id: string;
  brokerId: string;
  brokerEmpresa: string;
  brokerEmail: string;
  naveIdentificador: string;
  parqueNombre: string;
  m2: number;
  precioBaseUsd: number;
  sentAt: string;
  draftMailto: string;
};

export type BrokerInactividad = {
  brokerId: string;
  empresa: string;
  clasificacion: string;
  diasSinActividad: number;
  ultimaActividadFecha?: string | null;
  zonasOperacion?: string;
};

export type MatchAutoResult = {
  opportunityId: string;
  opportunityName: string;
  matchNavesSugeridas: string;
  matchCount: number;
  notified: boolean;
};

export type ValorAgregadoDashboard = {
  generatedAt: string;
  f1ChecklistAlertas: ChecklistVigenciaResumen[];
  f2Expansiones: ExpansionOportunidad[];
  f3Concentracion: ConcentracionParque[];
  f4RoiCanal: RoiCanalFila[];
  f5Ofertas: OfertaRenovacionAnticipada[];
  f6Matches: MatchAutoResult[];
  f7TiempoRespuesta: LeadResponsePorLo[];
  f7Detalle: LeadResponseMetric[];
  f8BrokerAlerts: BrokerOutreachAlert[];
  f8Inactivos: BrokerInactividad[];
};
