import { useMemo } from 'react';

import { ParksRoleLabel } from '@/parks-industrial/constants/parks-role-access.constants';
import { useParksAccess } from '@/parks-industrial/hooks/useParksAccess';
import { hasAnyParksRoleLabel } from '@/parks-industrial/utils/parks-role-access.util';

export type ParksDashboardAudience = 'ceo' | 'cfo' | 'commercial';

export const useParksDashboardAudience = (): ParksDashboardAudience => {
  const { parksRoleLabels, primaryParksRoleLabel, hasFullParksAccess } =
    useParksAccess();

  return useMemo((): ParksDashboardAudience => {
    if (primaryParksRoleLabel === ParksRoleLabel.Cfo) {
      return 'cfo';
    }

    if (primaryParksRoleLabel === ParksRoleLabel.DirectorComercial) {
      return 'commercial';
    }

    if (
      hasAnyParksRoleLabel(parksRoleLabels, [
        ParksRoleLabel.DirectorComercial,
      ]) &&
      !hasAnyParksRoleLabel(parksRoleLabels, [ParksRoleLabel.CEO])
    ) {
      return 'commercial';
    }

    if (
      hasFullParksAccess ||
      hasAnyParksRoleLabel(parksRoleLabels, [ParksRoleLabel.CEO])
    ) {
      return 'ceo';
    }

    if (hasAnyParksRoleLabel(parksRoleLabels, [ParksRoleLabel.Cfo])) {
      return 'cfo';
    }

    return 'commercial';
  }, [hasFullParksAccess, parksRoleLabels, primaryParksRoleLabel]);
};
