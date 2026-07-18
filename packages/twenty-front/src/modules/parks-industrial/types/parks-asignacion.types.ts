export type AsignacionDashboard = {
  generatedAt: string;
  config: {
    umbralM2Aaa: number;
    umbralPresupuestoAaaUsd: number;
    umbralM2Estandar: number;
    maxHorasSinAsignarAaa: number;
    maxHorasSinAsignarEstandar: number;
    iaScoringActivo: boolean;
  };
  equipo: {
    los: Array<{
      id: string;
      nombre: string;
      nivelLo: string;
      especialidadSectores: string;
      cargaActual: number;
      cargaMaximaLeads: number;
      tasaConversionHistorica: number;
      pctCarga: number;
      estado: 'ok' | 'cerca' | 'maximo' | 'inactivo';
      activoParaAsignacion: boolean;
    }>;
    pendientes: Array<{
      id: string;
      opportunityId: string;
      empresa: string;
      puntajeTotal: number;
      tierCalculado: string;
      explicacionTier: string;
      loSugerido1?: string | null;
      loSugerido2?: string | null;
      loSugerido3?: string | null;
      razonSugerencia1?: string | null;
      alertaCarga: boolean;
      mensajeCarga?: string | null;
      scoreFinalUsado: string;
      iaScore?: number | null;
      iaRazonTop?: string | null;
      pendienteAsignacion: boolean;
      fechaClasificacion: string;
      situacionFallback?: string | null;
    }>;
    alertas: string[];
  };
};
