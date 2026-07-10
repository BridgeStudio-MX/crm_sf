import { t } from '@lingui/core/macro';
import { useCallback, useEffect, useState } from 'react';

import {
  fetchParksUnassignedLeads,
  type UnassignedLead,
} from '@/parks-industrial/services/parks-commercial.client';

export const useParksUnassignedLeads = (refreshKey = 0) => {
  const [leads, setLeads] = useState<UnassignedLead[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  const loadLeads = useCallback(async () => {
    setIsLoading(true);
    setErrorMessage(null);

    try {
      const unassignedLeads = await fetchParksUnassignedLeads();
      setLeads(unassignedLeads);
    } catch (error) {
      setErrorMessage(
        error instanceof Error
          ? error.message
          : t`No se pudieron cargar leads sin asignar`,
      );
    } finally {
      setIsLoading(false);
    }
  }, []);

  useEffect(() => {
    void loadLeads();
  }, [loadLeads, refreshKey]);

  return {
    leads,
    setLeads,
    isLoading,
    errorMessage,
    setErrorMessage,
    reloadLeads: loadLeads,
  };
};
