export type ExpansionSignalFuente =
  | 'LinkedIn'
  | 'Noticias'
  | 'Web corporativa'
  | 'Ocupación + inventario'
  | 'Broker / mercado';

export type ExpansionSignalConfianza = 'alta' | 'media' | 'baja';

export type ExpansionSignalMatchNave = {
  identificador: string;
  parqueNombre: string;
  m2: number;
  estatus: string;
  precioBaseUsd?: number;
};

export type ExpansionSignal = {
  id: string;
  inquilinoId?: string;
  inquilinoNombre: string;
  titulo: string;
  detalle: string;
  fuente: ExpansionSignalFuente;
  confianza: ExpansionSignalConfianza;
  zonaObjetivo: string;
  naveActual?: string;
  parqueActual?: string;
  mesesOcupado?: number;
  navesCandidatas: ExpansionSignalMatchNave[];
  detectedAt: string;
  refreshedAt: string;
};

const hoursAgo = (hours: number): string => {
  const date = new Date();
  date.setHours(date.getHours() - hours);
  return date.toISOString();
};

const buildDefaultSignals = (): ExpansionSignal[] => [
  {
    id: 'exp-sig-logimex',
    inquilinoNombre: 'LogiMex',
    titulo: 'Contrataciones logísticas en Bajío',
    detalle:
      'LinkedIn muestra +38 vacantes de operaciones/warehouse en León–Silao en 30 días. Encaja con expansión regional.',
    fuente: 'LinkedIn',
    confianza: 'alta',
    zonaObjetivo: 'Bajío',
    naveActual: 'Nave 1',
    parqueActual: 'Parques del Bajío - Silao',
    mesesOcupado: 26,
    navesCandidatas: [
      {
        identificador: 'Nave 7',
        parqueNombre: 'Parques del Bajío - Silao',
        m2: 4_500,
        estatus: 'Disponible',
        precioBaseUsd: 0.92,
      },
      {
        identificador: 'Nave XC-01',
        parqueNombre: 'Parques del Bajío - Silao',
        m2: 12_000,
        estatus: 'En construcción',
        precioBaseUsd: 0.95,
      },
    ],
    detectedAt: hoursAgo(72),
    refreshedAt: hoursAgo(6),
  },
  {
    id: 'exp-sig-nestle',
    inquilinoNombre: 'Nestlé México',
    titulo: 'Nuevo hub de distribución GDL',
    detalle:
      'Nota de prensa: Nestlé anuncia capacidad adicional en corredor Guadalajara–El Salto para e-commerce frío.',
    fuente: 'Noticias',
    confianza: 'alta',
    zonaObjetivo: 'Guadalajara',
    naveActual: 'Nave 4',
    parqueActual: 'Parques del Bajío - Silao',
    mesesOcupado: 22,
    navesCandidatas: [
      {
        identificador: 'Nave D-2',
        parqueNombre: 'El Salto Park III',
        m2: 49_890,
        estatus: 'Disponible',
        precioBaseUsd: 0.88,
      },
      {
        identificador: 'Nave BT-GDL-A',
        parqueNombre: 'Guadalajara Park',
        m2: 18_500,
        estatus: 'En construcción',
        precioBaseUsd: 0.98,
      },
    ],
    detectedAt: hoursAgo(48),
    refreshedAt: hoursAgo(6),
  },
  {
    id: 'exp-sig-femsa',
    inquilinoNombre: 'Coca-Cola FEMSA',
    titulo: 'Expansión nearshoring Monterrey',
    detalle:
      'Sitio corporativo menciona nuevo centro de consolidación en NL. Match con naves grandes disponibles en T-Mex.',
    fuente: 'Web corporativa',
    confianza: 'media',
    zonaObjetivo: 'Monterrey',
    naveActual: 'Bodega 05AM200',
    parqueActual: 'GuadalupePark I',
    mesesOcupado: 34,
    navesCandidatas: [
      {
        identificador: 'Nave C-3',
        parqueNombre: 'T-MexPark',
        m2: 44_658,
        estatus: 'Disponible',
        precioBaseUsd: 0.92,
      },
      {
        identificador: 'Nave XL-MTY-1',
        parqueNombre: 'T-MexPark',
        m2: 62_000,
        estatus: 'En construcción',
        precioBaseUsd: 0.94,
      },
    ],
    detectedAt: hoursAgo(96),
    refreshedAt: hoursAgo(6),
  },
];

let signals = buildDefaultSignals();

const normalizeEmpresa = (value: string): string =>
  value
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '')
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, ' ')
    .trim();

export const expansionSignalsStore = {
  list: (): ExpansionSignal[] => [...signals],

  listByInquilinoNombre: (empresa?: string | null): ExpansionSignal[] => {
    if (!empresa?.trim()) {
      return [];
    }

    const normalizedEmpresa = normalizeEmpresa(empresa);

    return signals.filter((signal) => {
      const signalName = normalizeEmpresa(signal.inquilinoNombre);
      return (
        signalName.includes(normalizedEmpresa) ||
        normalizedEmpresa.includes(signalName)
      );
    });
  },

  listSummaryByEmpresa: (): Array<{
    inquilinoNombre: string;
    signalCount: number;
    topTitulo: string;
    confianza: ExpansionSignalConfianza;
  }> => {
    const byEmpresa = new Map<string, ExpansionSignal[]>();

    for (const signal of signals) {
      const key = normalizeEmpresa(signal.inquilinoNombre);
      const current = byEmpresa.get(key) ?? [];
      current.push(signal);
      byEmpresa.set(key, current);
    }

    return Array.from(byEmpresa.values()).map((empresaSignals) => {
      const sorted = [...empresaSignals].sort((left, right) =>
        right.refreshedAt.localeCompare(left.refreshedAt),
      );
      const top = sorted[0];

      return {
        inquilinoNombre: top.inquilinoNombre,
        signalCount: empresaSignals.length,
        topTitulo: top.titulo,
        confianza: top.confianza,
      };
    });
  },

  bindInquilinoIds: (
    bindings: Array<{ inquilinoId: string; empresa: string }>,
  ): void => {
    signals = signals.map((signal) => {
      const match = bindings.find((binding) => {
        const signalName = normalizeEmpresa(signal.inquilinoNombre);
        const empresaName = normalizeEmpresa(binding.empresa);
        return (
          signalName.includes(empresaName) || empresaName.includes(signalName)
        );
      });

      return match
        ? { ...signal, inquilinoId: match.inquilinoId }
        : signal;
    });
  },

  replaceAll: (nextSignals: ExpansionSignal[]): void => {
    signals = [...nextSignals];
  },

  refreshMock: (): ExpansionSignal[] => {
    const refreshedAt = new Date().toISOString();
    signals = signals.map((signal) => ({
      ...signal,
      refreshedAt,
      detectedAt: signal.detectedAt,
    }));
    return expansionSignalsStore.list();
  },

  resetDemo: (): void => {
    signals = buildDefaultSignals();
  },
};
