import { type ParksMetricCardAccent } from '@/parks-industrial/components/ui/ParksMetricCard';
import {
  type ParksExpedienteRecord,
  type ParksNaveRecord,
} from '@/parks-industrial/hooks/useParksRecords';
import { type ParksParqueRecord } from '@/parks-industrial/hooks/useParksParques';
import {
  getParksDaysUntil,
  getParksOcupacionLevel,
} from '@/parks-industrial/utils/parks-format.util';
import {
  getParksMapCityFilterLabel,
  resolveParksMapCityFilterId,
  type ParksMapCityFilterId,
} from '@/parks-industrial/utils/parks-map-city-filter.util';

export type ParksPortfolioMetrics = {
  parqueCount: number;
  m2Totales: number;
  m2Rentados: number;
  m2Disponibles: number;
  ocupacion: number;
};

export type ParksNaveDisponibilidadMetrics = {
  navesDisponiblesCount: number;
  m2CatalogoDisponible: number;
};

export type ParksOperationalMetrics = {
  contratosPorVencer: number;
  ingresosMensuales: number;
};

export type ParksRegionalMetricSummary = {
  cityFilterId: ParksMapCityFilterId;
  label: string;
  parqueCount: number;
  ocupacion: number;
  m2Disponibles: number;
};

export type ParksNaveInventoryKind =
  | 'disponible'
  | 'ocupada'
  | 'construccion'
  | 'negociacion';

const normalizeNaveEstatus = (estatus?: string | null): string =>
  (estatus ?? '').trim().toUpperCase();

export const isParksNaveDisponible = (estatus?: string | null): boolean => {
  const normalizedEstatus = normalizeNaveEstatus(estatus);

  return (
    normalizedEstatus === 'DISPONIBLE' ||
    normalizedEstatus.includes('DISPONIBLE')
  );
};

export const isParksNaveEnConstruccion = (estatus?: string | null): boolean => {
  const normalizedEstatus = normalizeNaveEstatus(estatus);

  return (
    normalizedEstatus.includes('CONSTRUCCI') ||
    normalizedEstatus.includes('CONSTRUCCION')
  );
};

export const isParksNaveOcupada = (estatus?: string | null): boolean => {
  const normalizedEstatus = normalizeNaveEstatus(estatus);

  return (
    normalizedEstatus.includes('RENT') ||
    normalizedEstatus.includes('OCUPAD')
  );
};

export const resolveParksNaveInventoryKind = (
  estatus?: string | null,
): ParksNaveInventoryKind => {
  if (isParksNaveEnConstruccion(estatus)) {
    return 'construccion';
  }

  if (isParksNaveDisponible(estatus)) {
    return 'disponible';
  }

  if (isParksNaveOcupada(estatus)) {
    return 'ocupada';
  }

  return 'negociacion';
};

export const getParksNaveKindLabel = (
  kind: ParksNaveInventoryKind,
): string => {
  if (kind === 'construccion') {
    return 'En construcción';
  }

  if (kind === 'ocupada') {
    return 'Ocupada';
  }

  if (kind === 'negociacion') {
    return 'En negociación';
  }

  return 'Disponible';
};

export const getParksNaveKindColor = (
  kind: ParksNaveInventoryKind,
): ParksMetricCardAccent => {
  if (kind === 'construccion') {
    return 'orange';
  }

  if (kind === 'ocupada') {
    return 'blue';
  }

  if (kind === 'negociacion') {
    return 'yellow';
  }

  return 'green';
};

export const buildParksPortfolioMetricsFromParques = (
  parques: ParksParqueRecord[],
): ParksPortfolioMetrics => {
  const m2Totales = parques.reduce(
    (total, parque) => total + (parque.m2Totales ?? 0),
    0,
  );
  const m2Rentados = parques.reduce(
    (total, parque) => total + (parque.m2Rentados ?? 0),
    0,
  );
  const m2Disponibles = Math.max(m2Totales - m2Rentados, 0);
  const ocupacion =
    m2Totales > 0 ? Math.round((m2Rentados / m2Totales) * 100) : 0;

  return {
    parqueCount: parques.length,
    m2Totales,
    m2Rentados,
    m2Disponibles,
    ocupacion,
  };
};

export const buildParksNaveDisponibilidadMetrics = (
  naves: ParksNaveRecord[],
  parqueIds?: Set<string>,
): ParksNaveDisponibilidadMetrics => {
  const scopedNaves =
    parqueIds === undefined
      ? naves
      : naves.filter((nave) => parqueIds.has(nave.parqueId ?? ''));

  const navesDisponibles = scopedNaves.filter((nave) =>
    isParksNaveDisponible(nave.estatus),
  );

  return {
    navesDisponiblesCount: navesDisponibles.length,
    m2CatalogoDisponible: navesDisponibles.reduce(
      (total, nave) => total + (nave.m2 ?? 0),
      0,
    ),
  };
};

export const buildParksOperationalMetricsFromExpedientes = (
  expedientes: ParksExpedienteRecord[],
  naveIds?: Set<string>,
): ParksOperationalMetrics => {
  const scopedExpedientes =
    naveIds === undefined
      ? expedientes
      : expedientes.filter((expediente) =>
          naveIds.has(expediente.nave?.id ?? ''),
        );

  const contratosPorVencer = scopedExpedientes.filter((expediente) => {
    const dias = getParksDaysUntil(expediente.fechaVencimiento);

    return dias !== null && dias <= 90;
  }).length;

  const ingresosMensuales = scopedExpedientes.reduce(
    (total, expediente) => total + (expediente.rentaMensualUsd ?? 0),
    0,
  );

  return {
    contratosPorVencer,
    ingresosMensuales,
  };
};

export const getParksOcupacionMetricAccent = (
  ocupacion: number,
): ParksMetricCardAccent => {
  const level = getParksOcupacionLevel(ocupacion);

  if (level === 'high') {
    return 'green';
  }

  if (level === 'medium') {
    return 'yellow';
  }

  return 'blue';
};

export const buildParksRegionalMetricSummaries = (
  parques: ParksParqueRecord[],
): ParksRegionalMetricSummary[] => {
  const parquesByCity = new Map<ParksMapCityFilterId, ParksParqueRecord[]>();

  for (const parque of parques) {
    const cityFilterId = resolveParksMapCityFilterId(parque);

    if (!cityFilterId) {
      continue;
    }

    const cityParques = parquesByCity.get(cityFilterId) ?? [];

    cityParques.push(parque);
    parquesByCity.set(cityFilterId, cityParques);
  }

  return Array.from(parquesByCity.entries()).map(
    ([cityFilterId, cityParques]) => {
      const portfolioMetrics =
        buildParksPortfolioMetricsFromParques(cityParques);

      return {
        cityFilterId,
        label: getParksMapCityFilterLabel(cityFilterId),
        parqueCount: portfolioMetrics.parqueCount,
        ocupacion: portfolioMetrics.ocupacion,
        m2Disponibles: portfolioMetrics.m2Disponibles,
      };
    },
  );
};
