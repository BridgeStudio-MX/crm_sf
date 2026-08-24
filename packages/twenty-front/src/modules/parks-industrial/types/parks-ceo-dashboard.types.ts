export type ParksCeoTrendPoint = {
  mesAnio: string;
  label: string;
  value: number;
};

export type ParksCeoMonthlySnapshot = {
  mesAnio: string;
  fechaSnapshot: string;
  metrosRentablesTotales: number;
  metrosRentados: number;
  metrosDisponibles: number;
  metrosEnConstruccion: number;
  porcentajeOcupacion: number;
  contratosActivosCount: number;
  mrrTotalUsd: number;
  mrrTotalMxn: number;
  tipoCambioUsado: number;
  revenuePorM2Rentado: number;
  ticketPromedioM2: number;
  metrosNuevosMes: number;
  metrosPerdidosMes: number;
  absorcionNetaMes: number;
  contratosNuevosMes: number;
  contratosTerminadosMes: number;
  contratosVencidosMes: number;
  contratosRenovadosMes: number;
  tasaRenovacionMes: number;
  m2ChurnMes: number;
  revenuePerdidoChurnMes: number;
  contratosHoldoverActivos: number;
  m2EnHoldover: number;
  montoHoldoverFacturadoMes: number;
  montoHoldoverCobradoMes: number;
  montoFacturadoMes: number;
  montoCobradoMes: number;
  porcentajeCobranzaMes: number;
  carteraVencidaCierre: number;
  cartera0_30: number;
  cartera31_60: number;
  cartera61_90: number;
  carteraMas90: number;
  casosLegalesCerradosMes: number;
  porcentajeSlaCumplido: number;
  tiempoPromedioCicloLegal: number;
  nuevosLeadsMes: number;
  oportunidadesCerradasGanadasMes: number;
  tiempoPromedioCicloVenta: number;
  tasaConversionLeadContrato: number;
  montoNotasCreditoMes: number;
  montoCondonacionesHoldoverMes: number;
  noiEstimadoMes: number;
  noiPorM2: number;
  pipelineM2Total: number;
  pipelineMrrPonderado: number;
  pipelineDealsActivos: number;
};

export type ParksCeoChurnCause = {
  causa: string;
  m2Perdidos: number;
  revenueAnualizado: number;
  porcentajePortafolio: number;
};

export type ParksCeoExpiringBucket = {
  dias: 30 | 60 | 90 | 180;
  contratos: number;
  m2EnRiesgo: number;
  revenueEnRiesgoAnual: number;
};

export type ParksCeoOcupacionParque = {
  parqueId: string;
  parqueNombre: string;
  region: string;
  metrosRentados: number;
  metrosRentables: number;
  porcentajeOcupacion: number;
  variacionMensualPts: number;
};

export type ParksCeoCriticalAlert = {
  id: string;
  severity: 'critical' | 'warning' | 'info';
  title: string;
  detail: string;
  actionPath?: string;
};

export type ParksCeoDailyKpis = {
  ocupacionPct: number;
  ocupacionDeltaPts: number;
  mrrMxn: number;
  mrrDeltaPct: number;
  cobranzaMesPct: number;
  cobranzaDeltaPts: number;
  holdoversCount: number;
  holdoverMontoAcumulado: number;
  holdoverDiasPromedio: number;
  carteraMas90: number;
  pipelineDeals: number;
  pipelineM2: number;
  pipelineMrrPonderado: number;
  vencimientos: ParksCeoExpiringBucket[];
  alertas: ParksCeoCriticalAlert[];
};

export type ParksCeoBoardSection = {
  ocupacionTrend: ParksCeoTrendPoint[];
  absorcionTrend: ParksCeoTrendPoint[];
  ocupacionPorParque: ParksCeoOcupacionParque[];
  mrrTrend: ParksCeoTrendPoint[];
  mrrForecast: ParksCeoTrendPoint[];
  revenuePorM2: number;
  revenuePorM2YoYPct: number;
  ticketPromedioM2: number;
  ticketDeltaPts: number;
  noiPorM2: number;
  tasaRenovacionYtd: number;
  metaRenovacion: number;
  churnPorCausa: ParksCeoChurnCause[];
  contratosPorVencer6m: Array<{
    mesAnio: string;
    contratos: number;
    m2: number;
    estatusRenovacionDominante: string;
  }>;
  indiceCobranza12m: number;
  carteraAntiguedad: Array<{
    rango: string;
    monto: number;
  }>;
  holdoversActivos: number;
  holdoverMontoRiesgo: number;
  notasCredito12m: number;
  notasCreditoPctMrr: number;
  cicloVentaDias: number;
  slaCumplimientoPct: number;
  cicloLegalDias: number;
  slaLegalDias: number;
  fuentesProspecto: Array<{
    canal: string;
    dealsCerrados: number;
  }>;
};

export type ParksCeoInboxItemKind =
  | 'aprobacion-comercial'
  | 'condonacion-holdover'
  | 'firma-contrato';

export type ParksCeoInboxItem = {
  id: string;
  kind: ParksCeoInboxItemKind;
  title: string;
  subtitle: string;
  detail: string;
  amountLabel?: string;
  priority: 'high' | 'normal';
  actionPath: string;
  canResolve: boolean;
  entityId: string;
  isDemo?: boolean;
  createdAt?: string;
};

export type ParksCeoInboxSummary = {
  total: number;
  aprobacionesComerciales: number;
  condonaciones: number;
  firmas: number;
  items: ParksCeoInboxItem[];
};

export type ParksCeoPortfolioSegment = 'TOTAL' | 'INDUSTRIAL';

export type ParksCeoOcupacionGauge = {
  key: 'terminados' | 'construccion' | 'proyectados';
  label: string;
  ocupacionPct: number;
  metaPct: number;
  m2Totales: number;
  m2Rentados: number;
  m2Disponibles: number;
  m2Anterior: number;
  variacionPct: number;
};

export type ParksCeoLegalSlaBlock = {
  key: string;
  label: string;
  cumplimientoPct: number;
  metaPct: number;
  diasPromedioCierre: number;
  metaDiasCierre: number;
  abiertos: number;
  fueraDeTiempo: number;
};

export type ParksCeoLitigioBucket = {
  categoria: string;
  enProceso: number;
  porcentaje: number;
};

export type ParksCeoPerformanceAreaScore = {
  area: string;
  ponderacionPct: number;
  scorePct: number;
};

export type ParksCeoExecutiveIndicators = {
  filters: {
    year: number;
    month: number;
    segmento: ParksCeoPortfolioSegment;
  };
  performanceConsolidadoPct: number;
  performanceAreas: ParksCeoPerformanceAreaScore[];
  performanceFormulaNote: string;
  ocupacion: ParksCeoOcupacionGauge[];
  ocupacionMetaTerminados: number;
  litigios: ParksCeoLitigioBucket[];
  contratosNoRenovados: number;
  m2NoRenovados: number;
  pctNoRenovados: number;
  renovacionIncrementoPct: number;
  renovacionIncrementoMetaPct: number;
  renovacionesFirmadasAntesVencerPct: number;
  renovacionesFirmadasMetaPct: number;
  hojasAcuerdoNuevos: number;
  hojasAcuerdoRenovacion: number;
  varContratosNuevosPct: number;
  varM2RentadosPct: number;
  varValorM2MxnPct: number;
  varValorM2UsdPct: number;
  varAnosPromedioRentaPct: number;
  legalSla: ParksCeoLegalSlaBlock[];
  ultimaActualizacionLabel: string;
};

export type ParksCeoDashboardView =
  | 'hoy'
  | 'portafolio'
  | 'finanzas'
  | 'tiempos';

export type ParksCeoExecutiveDashboardResult = {
  generatedAt: string;
  asOfDate: string;
  currencyNote: string;
  daily: ParksCeoDailyKpis;
  board: ParksCeoBoardSection;
  inbox: ParksCeoInboxSummary;
  snapshots: ParksCeoMonthlySnapshot[];
  indicators: ParksCeoExecutiveIndicators;
  kpisCatalog: Array<{
    id: string;
    name: string;
    valueLabel: string;
    status: 'live' | 'demo-snapshot';
  }>;
};
