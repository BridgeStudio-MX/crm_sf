import { useCallback, useEffect, useState } from 'react';

import { fetchParksCeoExecutiveDashboard } from '@/parks-industrial/services/parks-ceo.client';
import {
  type ParksCeoDashboardView,
  type ParksCeoExecutiveDashboardResult,
} from '@/parks-industrial/types/parks-ceo-dashboard.types';

export const useParksCeoExecutiveDashboard = () => {
  const [data, setData] = useState<ParksCeoExecutiveDashboardResult | null>(
    null,
  );
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [view, setView] = useState<ParksCeoDashboardView>('diario');

  const load = useCallback(async () => {
    setLoading(true);
    setError(null);

    try {
      const result = await fetchParksCeoExecutiveDashboard();
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
  }, []);

  useEffect(() => {
    void load();
  }, [load]);

  return {
    data,
    loading,
    error,
    view,
    setView,
    refresh: load,
  };
};
