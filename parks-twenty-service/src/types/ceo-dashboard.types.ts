export type CeoDashboardView = 'diario' | 'consejo';

export type CeoTrendPoint = {
  mesAnio: string;
  label: string;
  value: number;
};

export type CeoMonthlySnapshot = {
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

export type CeoChurnCause = {
  causa: string;
  m2Perdidos: number;
  revenueAnualizado: number;
  porcentajePortafolio: number;
};

export type CeoExpiringBucket = {
  dias: 30 | 60 | 90 | 180;
  contratos: number;
  m2EnRiesgo: number;
  revenueEnRiesgoAnual: number;
};

export type CeoOcupacionParque = {
  parqueId: string;
  parqueNombre: string;
  region: string;
  metrosRentados: number;
  metrosRentables: number;
  porcentajeOcupacion: number;
  variacionMensualPts: number;
};

export type CeoCriticalAlert = {
  id: string;
  severity: 'critical' | 'warning' | 'info';
  title: string;
  detail: string;
  actionPath?: string;
};

export type CeoDailyKpis = {
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
  vencimientos: CeoExpiringBucket[];
  alertas: CeoCriticalAlert[];
};

export type CeoBoardSection = {
  ocupacionTrend: CeoTrendPoint[];
  absorcionTrend: CeoTrendPoint[];
  ocupacionPorParque: CeoOcupacionParque[];
  mrrTrend: CeoTrendPoint[];
  mrrForecast: CeoTrendPoint[];
  revenuePorM2: number;
  revenuePorM2YoYPct: number;
  ticketPromedioM2: number;
  ticketDeltaPts: number;
  noiPorM2: number;
  tasaRenovacionYtd: number;
  metaRenovacion: number;
  churnPorCausa: CeoChurnCause[];
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

export type CeoInboxItemKind =
  | 'aprobacion-comercial'
  | 'condonacion-holdover'
  | 'firma-contrato';

export type CeoInboxItem = {
  id: string;
  kind: CeoInboxItemKind;
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

export type CeoInboxSummary = {
  total: number;
  aprobacionesComerciales: number;
  condonaciones: number;
  firmas: number;
  items: CeoInboxItem[];
};

export type CeoExecutiveDashboardResult = {
  generatedAt: string;
  asOfDate: string;
  currencyNote: string;
  daily: CeoDailyKpis;
  board: CeoBoardSection;
  inbox: CeoInboxSummary;
  snapshots: CeoMonthlySnapshot[];
  kpisCatalog: Array<{
    id: string;
    name: string;
    valueLabel: string;
    status: 'live' | 'demo-snapshot';
  }>;
};
