import {
  type AsignacionConfig,
  type ClasificacionLead,
  type LoProfile,
} from '../types/asignacion-inteligente.types';

const nowIso = (): string => new Date().toISOString();

const hoursAgo = (hours: number): string => {
  const date = new Date();
  date.setHours(date.getHours() - hours);
  return date.toISOString();
};

export const DEFAULT_ASIGNACION_CONFIG: AsignacionConfig = {
  umbralM2Aaa: 10_000,
  umbralPresupuestoAaaUsd: 850_000,
  umbralM2Estandar: 3_000,
  umbralM2Junior: 0,
  maxHorasSinAsignarAaa: 2,
  maxHorasSinAsignarEstandar: 24,
  maxHorasSinContactoTrasAsignacionAaa: 4,
  maxHorasSinContactoTrasAsignacionEstandar: 24,
  iaScoringActivo: true,
  activa: true,
  ultimaActualizacion: nowIso(),
  actualizadoPor: 'Sistema',
};

const buildDemoLos = (): LoProfile[] => [
  {
    id: 'lo-israel',
    nombre: 'Israel Ramírez',
    nivelLo: 'AAA — Senior',
    especialidadSectores:
      'Nearshoring asiático, electrónica, Manufactura electrónica',
    activoParaAsignacion: true,
    cargaMaximaLeads: 8,
    cargaActual: 4,
    tasaConversionHistorica: 68,
  },
  {
    id: 'lo-uae',
    nombre: 'UAE',
    nivelLo: 'AAA — Senior',
    especialidadSectores: 'Automotriz, manufactura pesada, Manufactura automotriz',
    activoParaAsignacion: true,
    cargaMaximaLeads: 8,
    cargaActual: 6,
    tasaConversionHistorica: 61,
  },
  {
    id: 'lo-bruyel',
    nombre: 'Bruyel',
    nivelLo: 'Estándar',
    especialidadSectores: 'Logística, distribución, Logística y distribución',
    activoParaAsignacion: true,
    cargaMaximaLeads: 15,
    cargaActual: 12,
    tasaConversionHistorica: 42,
  },
  {
    id: 'lo-junior',
    nombre: 'Ana Junior',
    nivelLo: 'Junior',
    especialidadSectores: 'Call center, leads digitales',
    activoParaAsignacion: true,
    cargaMaximaLeads: 10,
    cargaActual: 3,
    tasaConversionHistorica: 28,
  },
];

type StoreState = {
  config: AsignacionConfig;
  los: LoProfile[];
  clasificaciones: ClasificacionLead[];
  // opportunityId → first activity timestamp (overlay for Situación F)
  primeraActividadByOppId: Map<string, string>;
};

const createInitialState = (): StoreState => ({
  config: { ...DEFAULT_ASIGNACION_CONFIG },
  los: buildDemoLos(),
  clasificaciones: [],
  primeraActividadByOppId: new Map(),
});

let state = createInitialState();

export const asignacionInteligenteStore = {
  resetDemo: (): void => {
    state = createInitialState();
  },
  getConfig: (): AsignacionConfig => ({ ...state.config }),
  updateConfig: (
    patch: Partial<AsignacionConfig>,
    actualizadoPor = 'Admin',
  ): AsignacionConfig => {
    state.config = {
      ...state.config,
      ...patch,
      ultimaActualizacion: nowIso(),
      actualizadoPor,
    };
    return asignacionInteligenteStore.getConfig();
  },
  listLos: (): LoProfile[] => state.los.map((item) => ({ ...item })),
  upsertLo: (lo: LoProfile): void => {
    const index = state.los.findIndex((item) => item.id === lo.id);
    if (index >= 0) {
      state.los[index] = lo;
    } else {
      state.los = [...state.los, lo];
    }
  },
  setLoCarga: (loId: string, cargaActual: number): void => {
    state.los = state.los.map((item) =>
      item.id === loId ? { ...item, cargaActual } : item,
    );
  },
  setLoActivo: (loId: string, activo: boolean): void => {
    state.los = state.los.map((item) =>
      item.id === loId ? { ...item, activoParaAsignacion: activo } : item,
    );
  },
  listClasificaciones: (): ClasificacionLead[] =>
    state.clasificaciones.map((item) => ({ ...item })),
  getActivaByOpportunity: (
    opportunityId: string,
  ): ClasificacionLead | undefined =>
    state.clasificaciones.find(
      (item) => item.opportunityId === opportunityId && item.activa,
    ),
  upsertClasificacion: (clasificacion: ClasificacionLead): void => {
    // Deactivate previous versions for same opportunity when saving active
    if (clasificacion.activa) {
      state.clasificaciones = state.clasificaciones.map((item) =>
        item.opportunityId === clasificacion.opportunityId &&
        item.id !== clasificacion.id
          ? { ...item, activa: false }
          : item,
      );
    }

    const index = state.clasificaciones.findIndex(
      (item) => item.id === clasificacion.id,
    );

    if (index >= 0) {
      state.clasificaciones[index] = clasificacion;
    } else {
      state.clasificaciones = [clasificacion, ...state.clasificaciones];
    }
  },
  setPrimeraActividad: (opportunityId: string, at: string): void => {
    state.primeraActividadByOppId.set(opportunityId, at);
  },
  getPrimeraActividad: (opportunityId: string): string | undefined =>
    state.primeraActividadByOppId.get(opportunityId),
  hoursAgoIso: hoursAgo,
};
