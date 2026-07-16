import { useCallback, useEffect, useState } from 'react';

import { type ParksPortfolioSegment } from '@/parks-industrial/constants/parks-executive.constants';
import { fetchParksCeoExecutiveDashboard } from '@/parks-industrial/services/parks-ceo.client';
import {
  type ParksCeoDashboardView,
  type ParksCeoExecutiveDashboardResult,
} from '@/parks-industrial/types/parks-ceo-dashboard.types';

export const useParksCeoExecutiveDashboard = () => {
  const now = new Date();
  const [data, setData] = useState<ParksCeoExecutiveDashboardResult | null>(
    null,
  );
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [view, setView] = useState<ParksCeoDashboardView>('ejecutivo');
  const [year, setYear] = useState(now.getFullYear());
  const [month, setMonth] = useState(now.getMonth() + 1);
  const [segmento, setSegmento] = useState<ParksPortfolioSegment>('TOTAL');

  const load = useCallback(async () => {
    setLoading(true);
    setError(null);

    try {
      const result = await fetchParksCeoExecutiveDashboard({
        year,
        month,
        segmento,
      });
      setData(result);
    } catch (loadError) {
      setError(
        loadError instanceof Error
          ? loadError.message
          : 'No se pudo cargar el dashboard ejecutivo',
      );
    } finally {
      setLoading(false);
    }
  }, [month, segmento, year]);

  useEffect(() => {
    void load();
  }, [load]);

  return {
    data,
    loading,
    error,
    view,
    setView,
    year,
    setYear,
    month,
    setMonth,
    segmento,
    setSegmento,
    refresh: load,
  };
};
