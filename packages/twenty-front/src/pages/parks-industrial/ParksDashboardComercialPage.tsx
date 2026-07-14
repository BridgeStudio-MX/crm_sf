import { t } from '@lingui/core/macro';
import { useContext } from 'react';
import { IconLayoutKanban } from 'twenty-ui/icon';
import { ThemeContext } from 'twenty-ui/theme-constants';

import { ParksCommercialDashboardContent } from '@/parks-industrial/components/dashboard/ParksDashboardContent';
import { ParksMetadataGate } from '@/parks-industrial/components/layout/ParksMetadataGate';
import { ParksPageShell } from '@/parks-industrial/components/layout/ParksPageShell';
import { getParksIndustrialPageSubtitle } from '@/parks-industrial/constants/parks-tenant.constants';

export const ParksDashboardComercialPage = () => {
  const { theme } = useContext(ThemeContext);

  return (
    <ParksPageShell
      title={t`Dashboard comercial`}
      subtitle={getParksIndustrialPageSubtitle(
        t`Pipeline, ocupación, ingresos y cola CEM — vista informativa`,
      )}
      icon={<IconLayoutKanban size={theme.icon.size.md} />}
    >
      <ParksMetadataGate loadingVariant="dashboard">
        <ParksCommercialDashboardContent />
      </ParksMetadataGate>
    </ParksPageShell>
  );
};
