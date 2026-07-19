import { t } from '@lingui/core/macro';
import { IconLayoutKanban } from 'twenty-ui/icon';
import { useContext } from 'react';
import { ThemeContext } from 'twenty-ui/theme-constants';

import { ParksCxcCarteraContent } from '@/parks-industrial/components/cxc/ParksCxcCarteraContent';
import { ParksPageShell } from '@/parks-industrial/components/layout/ParksPageShell';
import { getParksIndustrialPageSubtitle } from '@/parks-industrial/constants/parks-tenant.constants';

export const ParksCxcCarteraPage = () => {
  const { theme } = useContext(ThemeContext);

  return (
    <ParksPageShell
      title={t`CxC · Cartera`}
      subtitle={getParksIndustrialPageSubtitle(
        t`Pipeline Legal→CxC, prioridad, OC portal, holdovers y depósitos`,
      )}
      icon={<IconLayoutKanban size={theme.icon.size.md} />}
    >
      <ParksCxcCarteraContent />
    </ParksPageShell>
  );
};
