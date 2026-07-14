export type CxcRiskLabel = 'Bajo' | 'Medio' | 'Alto' | 'Crítico';

export type CxcPaymentStatus =
  | 'Al corriente'
  | 'Mora leve'
  | 'Mora grave'
  | 'Holdover'
  | 'Inactivo';

export type CxcClientType = 'Sin portal' | 'Con portal' | 'Portal múltiple';

export type CxcInvoiceStatus =
  | 'Emitida'
  | 'OC_pendiente'
  | 'En_portal_cliente'
  | 'Pago_programado'
  | 'Pagada'
  | 'Vencida'
  | 'En_disputa'
  | 'Cancelada';

export type CxcDepositStatus =
  | 'Retenido'
  | 'En proceso de devolución'
  | 'Devuelto parcial'
  | 'Devuelto total'
  | 'Aplicado a adeudos';

export type CxcAnomalySeverity = 'info' | 'warning' | 'critical';

export type CxcInvoice = {
  id: string;
  numeroFactura: string;
  tipo: string;
  monto: number;
  moneda: 'MXN' | 'USD';
  fechaEmision: string;
  fechaLimitePago: string;
  diasVencida: number;
  estatus: CxcInvoiceStatus;
};

export type CxcOrdenCompra = {
  numeroOc: string | null;
  estatus: string;
  diasSinOc: number;
  intentosRecordatorio: number;
  fechaPagoProgramada: string | null;
};

export type CxcDeposito = {
  montoOriginal: number;
  montoADevolver: number;
  estatus: CxcDepositStatus;
  caratulaBancariaRecibida: boolean;
  cartaSolicitudRecibida: boolean;
  enProcesoFirmasInternas: boolean;
  razonRetencion: string | null;
};

export type CxcEscalacionInpc = {
  fechaAplicacion: string;
  rentaAnterior: number;
  porcentajeInpc: number;
  rentaNueva: number;
  estatus: string;
  diasParaAplicacion: number;
};

export type CxcHoldoverSummary = {
  diasEnHoldover: number;
  facturasEmitidas: number;
  montoAcumulado: number;
  montoPendiente: number;
};

export type CxcCobranzaActionType =
  | 'llamada'
  | 'email'
  | 'whatsapp'
  | 'nota'
  | 'escalar_claudia'
  | 'recordatorio_oc'
  | 'pago_aplicado'
  | 'oc_registrada';

export type CxcCobranzaActivity = {
  id: string;
  type: CxcCobranzaActionType;
  label: string;
  detail: string;
  createdBy: string;
  createdAt: string;
};

export type CxcAccount = {
  id: string;
  empresa: string;
  rfc: string;
  contactoPagosNombre: string;
  contactoPagosEmail: string;
  contactoPagosTelefono: string;
  ejecutivoId: string;
  ejecutivoNombre: string;
  estatusPagos: CxcPaymentStatus;
  scoreRiesgo: number;
  scoreLabel: CxcRiskLabel;
  scoreFactores: string[];
  tipoCliente: CxcClientType;
  diaPagoAcordado: string;
  moneda: 'MXN' | 'USD';
  rentaMensual: number;
  montoAdeudoTotal: number;
  diasEnMora: number;
  ultimaFechaPago: string | null;
  nave: string;
  parque: string;
  contratosActivos: number;
  requiereOc: boolean;
  cuentaBancaria: string | null;
  cicloEstatus: 'Gracia' | 'Activo' | 'Holdover' | 'Terminado';
  jesusContratoDadoAlta: boolean;
  facturas: CxcInvoice[];
  ordenCompra: CxcOrdenCompra | null;
  deposito: CxcDeposito | null;
  escalacionInpc: CxcEscalacionInpc | null;
  holdover: CxcHoldoverSummary | null;
  notasCobranza: string;
  actividadesCobranza?: CxcCobranzaActivity[];
  casoLegalId: string | null;
  createdAt: string;
  updatedAt: string;
};

export type CxcAnomaly = {
  id: string;
  severity: CxcAnomalySeverity;
  accountId: string | null;
  empresa: string;
  title: string;
  detail: string;
  suggestedAction: string;
  resolved: boolean;
  resolvedNote: string | null;
};

export type CxcForecastBucket = {
  esperado: number;
  enRiesgo: number;
  probabilidadPct: number;
};

export type CxcEjecutivoLoad = {
  ejecutivoId: string;
  ejecutivoNombre: string;
  cuentas: number;
  enMora: number;
  montoVencido: number;
  ocPendientes: number;
};

export type CxcDashboardResult = {
  generatedAt: string;
  kpis: {
    carteraTotal: number;
    carteraVencida: number;
    carteraCorriente: number;
    cuentasActivas: number;
    moraGraveCount: number;
    ocPendientes: number;
    holdoversActivos: number;
    depositosEnProceso: number;
    notasCreditoPendientes: number;
  };
  forecast: {
    d7: CxcForecastBucket;
    d30: CxcForecastBucket;
    d90: CxcForecastBucket;
  };
  riskDistribution: Array<{ label: CxcRiskLabel; count: number; monto: number }>;
  ejecutivos: CxcEjecutivoLoad[];
  anomalies: CxcAnomaly[];
  priorityAccounts: CxcAccount[];
  accounts: CxcAccount[];
};

export type CxcPaymentSuggestion = {
  accountId: string;
  pagoMonto: number;
  moneda: 'MXN' | 'USD';
  suggestion: string;
  justification: string;
  invoiceIds: string[];
  options: Array<{ label: string; invoiceIds: string[]; detail: string }>;
};
