import { useMemo } from 'react';

import {
  useParksExpedientesActivos,
  useParksNaves,
} from '@/parks-industrial/hooks/useParksRecords';
import { type ParksParqueRecord } from '@/parks-industrial/hooks/useParksParques';
import {
  buildParksNaveDisponibilidadMetrics,
  buildParksOperationalMetricsFromExpedientes,
  buildParksPortfolioMetricsFromParques,
  buildParksRegionalMetricSummaries,
  getParksOcupacionMetricAccent,
  type ParksNaveDisponibilidadMetrics,
  type ParksOperationalMetrics,
  type ParksPortfolioMetrics,
  type ParksRegionalMetricSummary,
} from '@/parks-industrial/utils/parks-portfolio-metrics.util';
import {
  getParksMapCityFilterLabel,
  type ParksMapCityFilterId,
} from '@/parks-industrial/utils/parks-map-city-filter.util';

export type ParksMapMetricsFilterContext = {
  isFiltered: boolean;
  visibleParqueCount: number;
  totalParqueCount: number;
  cityFilterId: ParksMapCityFilterId;
  cityFilterLabel: string;
  searchQuery: string;
};

export type ParksMapMetrics = {
  portfolio: ParksPortfolioMetrics;
  naveDisponibilidad: ParksNaveDisponibilidadMetrics;
  operational: ParksOperationalMetrics;
  ocupacionAccent: ReturnType<typeof getParksOcupacionMetricAccent>;
  filterContext: ParksMapMetricsFilterContext;
  regionalSummaries: ParksRegionalMetricSummary[];
  loading: boolean;
};

type UseParksMapMetricsArgs = {
  filteredParques: ParksParqueRecord[];
  allParques: ParksParqueRecord[];
  cityFilterId: ParksMapCityFilterId;
  searchQuery: string;
};

export const useParksMapMetrics = ({
  filteredParques,
  allParques,
  cityFilterId,
  searchQuery,
}: UseParksMapMetricsArgs): ParksMapMetrics => {
  const { records: naves, loading: navesLoading } = useParksNaves();
  const { records: expedientes, loading: expedientesLoading } =
    useParksExpedientesActivos();

  const filteredParqueIds = useMemo(
    () => new Set(filteredParques.map((parque) => parque.id)),
    [filteredParques],
  );

  const filteredNaveIds = useMemo(() => {
    const naveIds = new Set<string>();

    for (const nave of naves) {
      if (filteredParqueIds.has(nave.parqueId ?? '')) {
        naveIds.add(nave.id);
      }
    }

    return naveIds;
  }, [filteredParqueIds, naves]);

  const portfolio = useMemo(
    () => buildParksPortfolioMetricsFromParques(filteredParques),
    [filteredParques],
  );

  const naveDisponibilidad = useMemo(
    () => buildParksNaveDisponibilidadMetrics(naves, filteredParqueIds),
    [filteredParqueIds, naves],
  );

  const operational = useMemo(
    () =>
      buildParksOperationalMetricsFromExpedientes(expedientes, filteredNaveIds),
    [expedientes, filteredNaveIds],
  );

  const regionalSummaries = useMemo(
    () => buildParksRegionalMetricSummaries(allParques),
    [allParques],
  );

  const normalizedSearchQuery = searchQuery.trim();
  const isFiltered =
    cityFilterId !== 'all' || normalizedSearchQuery.length > 0;

  const filterContext: ParksMapMetricsFilterContext = {
    isFiltered,
    visibleParqueCount: filteredParques.length,
    totalParqueCount: allParques.length,
    cityFilterId,
    cityFilterLabel: getParksMapCityFilterLabel(cityFilterId),
    searchQuery: normalizedSearchQuery,
  };

  return {
    portfolio,
    naveDisponibilidad,
    operational,
    ocupacionAccent: getParksOcupacionMetricAccent(portfolio.ocupacion),
    filterContext,
    regionalSummaries,
    loading: navesLoading || expedientesLoading,
  };
};
