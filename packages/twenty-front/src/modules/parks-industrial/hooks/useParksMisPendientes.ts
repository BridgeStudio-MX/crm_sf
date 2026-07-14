import { useCallback, useEffect, useMemo, useState } from 'react';

import {
  ParksRoleLabel,
} from '@/parks-industrial/constants/parks-role-access.constants';
import { useParksAccess } from '@/parks-industrial/hooks/useParksAccess';
import { fetchParksCeoInbox } from '@/parks-industrial/services/parks-ceo.client';
import { fetchParksCemInbox } from '@/parks-industrial/services/parks-commercial.client';
import { type ParksCeoInboxSummary } from '@/parks-industrial/types/parks-ceo-dashboard.types';
import { type ParksCemInboxSummary } from '@/parks-industrial/types/parks-cem-inbox.types';
import { hasAnyParksRoleLabel } from '@/parks-industrial/utils/parks-role-access.util';

export type ParksMisPendientesAudience = 'ceo' | 'cem';

export const useParksMisPendientes = () => {
  const { parksRoleLabels, primaryParksRoleLabel } = useParksAccess();
  const [ceoInbox, setCeoInbox] = useState<ParksCeoInboxSummary | null>(null);
  const [cemInbox, setCemInbox] = useState<ParksCemInboxSummary | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const audience = useMemo((): ParksMisPendientesAudience => {
    // Director Comercial (CEM) always sees his own bandeja, not the CEO's.
    if (primaryParksRoleLabel === ParksRoleLabel.DirectorComercial) {
      return 'cem';
    }

    if (
      hasAnyParksRoleLabel(parksRoleLabels, [
        ParksRoleLabel.DirectorComercial,
      ]) &&
      !hasAnyParksRoleLabel(parksRoleLabels, [ParksRoleLabel.CEO])
    ) {
      return 'cem';
    }

    return 'ceo';
  }, [parksRoleLabels, primaryParksRoleLabel]);

  const load = useCallback(async () => {
    setLoading(true);
    setError(null);

    try {
      if (audience === 'cem') {
        const result = await fetchParksCemInbox();
        setCemInbox(result);
        setCeoInbox(null);
      } else {
        const result = await fetchParksCeoInbox();
        setCeoInbox(result);
        setCemInbox(null);
      }
    } catch (loadError) {
      setError(
        loadError instanceof Error
          ? loadError.message
          : 'No se pudieron cargar los pendientes',
      );
    } finally {
      setLoading(false);
    }
  }, [audience]);

  useEffect(() => {
    void load();
  }, [load]);

  return {
    audience,
    ceoInbox,
    cemInbox,
    loading,
    error,
    refresh: load,
  };
};
