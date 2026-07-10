import { useMemo } from 'react';

import {
  useParksOpportunities,
  useParksRenovaciones,
} from '@/parks-industrial/hooks/useParksRecords';
import {
  buildParksCemAtRiskDeals,
  buildParksCemCanalMetrics,
  buildParksCemCriticalRenovaciones,
  buildParksCemLoPerformanceMetrics,
  buildParksCemPendingApprovals,
  buildParksCemTeamPipelineRows,
} from '@/parks-industrial/utils/parksCemDashboardUtil';

export const useParksCemDashboardMetrics = () => {
  const { records: opportunities, loading: opportunitiesLoading } =
    useParksOpportunities();
  const { queue, summary, loading: renovacionesLoading } = useParksRenovaciones();

  const metrics = useMemo(
    () => ({
      atRiskDeals: buildParksCemAtRiskDeals(opportunities),
      pendingApprovals: buildParksCemPendingApprovals(opportunities),
      teamPipelineRows: buildParksCemTeamPipelineRows(opportunities),
      canalMetrics: buildParksCemCanalMetrics(opportunities),
      loPerformanceMetrics: buildParksCemLoPerformanceMetrics(opportunities),
      criticalRenovaciones: buildParksCemCriticalRenovaciones(queue),
      renovacionesCriticosCount: summary.criticos,
      renovacionesIngresoEnRiesgoUsd: summary.ingresoEnRiesgoUsd,
    }),
    [opportunities, queue, summary],
  );

  return {
    metrics,
    loading: opportunitiesLoading || renovacionesLoading,
  };
};
