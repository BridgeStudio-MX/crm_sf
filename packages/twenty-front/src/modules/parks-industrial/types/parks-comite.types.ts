export type ComiteVotoValor =
  | 'Aprueba'
  | 'Rechaza'
  | 'Se abstiene'
  | 'Pendiente';

export type ComiteEstatus =
  | 'Abierto — en deliberación'
  | 'Resuelto — Aprobado'
  | 'Resuelto — Aprobado con voto disidente'
  | 'Resuelto — Rechazado'
  | 'Cancelado — oportunidad perdida'
  | 'Vencido sin resolución';

export type ComiteResolucion =
  | 'Pendiente'
  | 'Aprobado — 3 de 3'
  | 'Aprobado — 2 de 3'
  | 'Aprobado — 2 de 3 (con voto disidente)'
  | 'Aprobado — decisión CEO'
  | 'Rechazado — 2 de 3'
  | 'Rechazado — 3 de 3'
  | 'Rechazado — decisión CEO'
  | 'Empate — escalar'
  | 'Vencido sin resolución';

export type ComiteSemaforoPrecio = 'Verde' | 'Amarillo' | 'Rojo';

export type ComiteIaFlagSeveridad = 'Alta' | 'Media' | 'Baja';

export type ComiteIaFlag = {
  id: string;
  titulo: string;
  detalle: string;
  severidad: ComiteIaFlagSeveridad;
};

export type ComiteMiembroSeat = {
  memberId: string;
  seatIndex: 1 | 2 | 3;
  nombre: string;
  rolEtiqueta: string;
  email: string;
  voto: ComiteVotoValor;
  fechaVoto?: string;
  comentario?: string;
};

export type ComitePregunta = {
  id: string;
  preguntaPorMemberId: string;
  preguntaPorNombre: string;
  fechaPregunta: string;
  preguntaTexto: string;
  respuestaTexto?: string;
  respuestaPorNombre?: string;
  fechaRespuesta?: string;
  resuelta: boolean;
};

export type ComiteDealSnapshot = {
  portafolio: string;
  cotizacionReferencia: string;
  parqueNombre: string;
  naveNomenclatura: string;
  pisos: string;
  esPropiedadFuno: boolean;
  nombreComercio: string;
  clienteRazonSocial: string;
  clienteGiro: string;
  clienteHistorialParks: boolean;
  clienteAdeudosActivos: boolean;
  glaClienteM2: number;
  glaM2: number;
  precioListaM2: number;
  precioAcordadoM2: number;
  descuentoPorcentaje: number;
  rentaMensual: number;
  rentaVariablePct: number | null;
  moneda: 'MXN' | 'USD';
  semaforoPrecio: ComiteSemaforoPrecio;
  plazoMeses: number;
  prorrogaMeses: number;
  periodoGraciaMeses: number;
  depositosGarantiaMeses: number;
  rentasAdelantadasMeses: number;
  guantePactado: number;
  mantenimientoPactado: number;
  adeudoSinIva: number | null;
  incrementoTipo: 'INPC' | 'Porcentaje fijo';
  incrementoValor: number;
  rentaContratoAnterior?: number;
  brokerNombre: string;
  brokerClasificacion: 'Top 10' | 'No top 10' | 'Sin broker';
  numeroGirosOperando: number | null;
  condicionesEspeciales: string;
  observacionesEntregaNave: string;
};

export type ComiteAutorizacion = {
  id: string;
  referencia: string;
  opportunityId?: string;
  opportunityName?: string;
  hojaDeAcuerdosId?: string;
  leasingOfficerNombre: string;
  cemQueFirmoNombre: string;
  fechaCreacion: string;
  fechaLimiteResolucion: string;
  estatus: ComiteEstatus;
  deal: ComiteDealSnapshot;
  miembros: [ComiteMiembroSeat, ComiteMiembroSeat, ComiteMiembroSeat];
  votosAprueba: number;
  votosRechaza: number;
  votosPendientes: number;
  votosAbstiene: number;
  resolucion: ComiteResolucion;
  fechaResolucion?: string;
  resumenRazonesRechazo?: string;
  preguntas: ComitePregunta[];
  casoLegalId?: string;
  flagsIaAtipicas: ComiteIaFlag[];
  auditoria: string[];
  createdAt: string;
  updatedAt: string;
};

export type ComiteConfig = {
  slaHorasHabiles: number;
  semaforoVerdeMaxPct: number;
  semaforoAmarilloMaxPct: number;
  recordatorioHorasAntes: number;
};

export type ComiteListSummary = {
  openCount: number;
  approvedCount: number;
  rejectedCount: number;
  tiedCount: number;
  pendingVotesForViewer: number;
};

export type ComiteListResponse = {
  comites: ComiteAutorizacion[];
  summary: ComiteListSummary;
  config: ComiteConfig;
};
