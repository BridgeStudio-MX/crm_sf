import { useCallback, useEffect, useState } from 'react';

import {
  enrichParksProspect,
  fetchCachedProspectEnrichment,
} from '@/parks-industrial/services/parks-commercial.client';
import { type ProspectEnrichmentResult } from '@/parks-industrial/types/parks-commercial.types';

type UseParksProspectEnrichmentParams = {
  opportunityId: string;
  companyName: string;
  m2Requeridos?: number;
  autoLoad?: boolean;
};

export const useParksProspectEnrichment = ({
  opportunityId,
  companyName,
  m2Requeridos,
  autoLoad = true,
}: UseParksProspectEnrichmentParams) => {
  const [enrichment, setEnrichment] = useState<ProspectEnrichmentResult | null>(
    null,
  );
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const loadEnrichment = useCallback(async () => {
    if (!opportunityId || !companyName) {
      return;
    }

    setLoading(true);
    setError(null);

    try {
      const cached = await fetchCachedProspectEnrichment(opportunityId);

      if (cached) {
        setEnrichment(cached);
        return;
      }

      const result = await enrichParksProspect({
        opportunityId,
        companyName,
        m2Requeridos,
      });
      setEnrichment(result);
    } catch (loadError) {
      const message =
        loadError instanceof Error
          ? loadError.message
          : 'No se pudo enriquecer el prospecto';
      setError(message);
    } finally {
      setLoading(false);
    }
  }, [companyName, m2Requeridos, opportunityId]);

  useEffect(() => {
    if (!autoLoad) {
      return;
    }

    void loadEnrichment();
  }, [autoLoad, loadEnrichment]);

  return {
    enrichment,
    loading,
    error,
    loadEnrichment,
  };
};
