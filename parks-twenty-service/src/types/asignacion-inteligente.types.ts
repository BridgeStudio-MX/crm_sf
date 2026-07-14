export type LoNivel = 'AAA — Senior' | 'Estándar' | 'Junior';

export type LeadTier =
  | 'AAA — Cuenta clave'
  | 'Estándar'
  | 'Junior';

export type ScoreFinalUsado = 'Reglas' | 'Einstein';

export type AsignacionConfig = {
  umbralM2Aaa: number;
  umbralPresupuestoAaaUsd: number;
  umbralM2Estandar: number;
  umbralM2Junior: number;
  maxHorasSinAsignarAaa: number;
  maxHorasSinAsignarEstandar: number;
  maxHorasSinContactoTrasAsignacionAaa: number;
  maxHorasSinContactoTrasAsignacionEstandar: number;
  einsteinScoringActivo: boolean;
  activa: boolean;
  ultimaActualizacion: string;
  actualizadoPor: string;
};

export type LoProfile = {
  id: string;
  nombre: string;
  nivelLo: LoNivel;
  especialidadSectores: string;
  activoParaAsignacion: boolean;
  cargaMaximaLeads: number;
  cargaActual: number;
  tasaConversionHistorica: number;
};

export type FactorScore = {
  valor: string | number | boolean | null;
  puntos: number;
};

export type ClasificacionLead = {
  id: string;
  opportunityId: string;
  empresa: string;
  fechaClasificacion: string;
  versionClasificacion: number;
  activa: boolean;
  factorM2: FactorScore;
  factorPresupuesto: FactorScore;
  factorCanal: FactorScore;
  factorSector: FactorScore;
  factorInternacional: FactorScore;
  factorHistorialCliente: FactorScore;
  puntajeTotal: number;
  tierCalculado: LeadTier;
  explicacionTier: string;
  einsteinScore?: number | null;
  einsteinRazonTop?: string | null;
  scoreFinalUsado: ScoreFinalUsado;
  loSugerido1?: string | null;
  loSugerido2?: string | null;
  loSugerido3?: string | null;
  razonSugerencia1?: string | null;
  alertaCarga: boolean;
  mensajeCarga?: string | null;
  situacionFallback?: string | null;
  loAsignadoFinal?: string | null;
  asignadoPor?: string | null;
  fechaAsignacionFinal?: string | null;
  cemCambioSugerencia?: boolean;
  razonCambio?: string | null;
  pendienteAsignacion: boolean;
  asignacionProvisionalCem: boolean;
};

export type LeadScoreInput = {
  opportunityId: string;
  empresa: string;
  m2Requeridos?: number | null;
  presupuestoMensualUsd?: number | null;
  canalOrigen?: string | null;
  brokerClasificacion?: string | null;
  giroEmpresa?: string | null;
  paisOrigen?: string | null;
  historialClienteParks?: boolean;
};

export type EquipoAsignacionStatus = {
  los: Array<
    LoProfile & {
      pctCarga: number;
      estado: 'ok' | 'cerca' | 'maximo' | 'inactivo';
    }
  >;
  pendientes: ClasificacionLead[];
  alertas: string[];
};

export type AsignacionDashboard = {
  generatedAt: string;
  config: AsignacionConfig;
  equipo: EquipoAsignacionStatus;
  clasificacionesActivas: ClasificacionLead[];
};
