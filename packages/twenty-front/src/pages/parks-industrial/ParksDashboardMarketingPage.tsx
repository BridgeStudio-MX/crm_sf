import { t } from '@lingui/core/macro';
import { useContext } from 'react';
import { IconChartBar } from 'twenty-ui/icon';
import { ThemeContext } from 'twenty-ui/theme-constants';

import { ParksMetadataGate } from '@/parks-industrial/components/layout/ParksMetadataGate';
import { ParksPageShell } from '@/parks-industrial/components/layout/ParksPageShell';
import { ParksMarketingDashboardContent } from '@/parks-industrial/components/marketing/ParksMarketingDashboardContent';
import { getParksIndustrialPageSubtitle } from '@/parks-industrial/constants/parks-tenant.constants';

export const ParksDashboardMarketingPage = () => {
  const { theme } = useContext(ThemeContext);

  return (
    <ParksPageShell
      title={t`Dashboard marketing`}
      subtitle={getParksIndustrialPageSubtitle(
        t`Campañas, leads por canal, calificación IA y control de gasto`,
      )}
      icon={<IconChartBar size={theme.icon.size.md} />}
    >
      <ParksMetadataGate loadingVariant="dashboard">
        <ParksMarketingDashboardContent />
      </ParksMetadataGate>
    </ParksPageShell>
  );
};
