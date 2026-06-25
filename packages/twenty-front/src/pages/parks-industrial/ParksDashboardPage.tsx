import { t } from '@lingui/core/macro';
import { IconChartBar } from 'twenty-ui/icon';
import { useContext } from 'react';
import { ThemeContext } from 'twenty-ui/theme-constants';

import { ParksDashboardContent } from '@/parks-industrial/components/dashboard/ParksDashboardContent';
import { ParksMetadataGate } from '@/parks-industrial/components/layout/ParksMetadataGate';
import { ParksPageShell } from '@/parks-industrial/components/layout/ParksPageShell';

export const ParksDashboardPage = () => {
  const { theme } = useContext(ThemeContext);

  return (
    <ParksPageShell
      title={t`Dashboard Ejecutivo`}
      subtitle={t`Métricas consolidadas del grupo Parks Industrial`}
      icon={<IconChartBar size={theme.icon.size.md} />}
    >
      <ParksMetadataGate loadingVariant="dashboard">
        <ParksDashboardContent />
      </ParksMetadataGate>
    </ParksPageShell>
  );
};
