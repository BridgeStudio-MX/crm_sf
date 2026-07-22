import { t } from '@lingui/core/macro';
import { IconChartBar } from 'twenty-ui/icon';
import { useContext } from 'react';
import { ThemeContext } from 'twenty-ui/theme-constants';

import { ParksDashboardContent } from '@/parks-industrial/components/dashboard/ParksDashboardContent';
import { getParksIndustrialPageSubtitle } from '@/parks-industrial/constants/parks-tenant.constants';
import { ParksMetadataGate } from '@/parks-industrial/components/layout/ParksMetadataGate';
import { ParksPageShell } from '@/parks-industrial/components/layout/ParksPageShell';
import { useParksDashboardAudience } from '@/parks-industrial/hooks/useParksDashboardAudience';

export const ParksDashboardPage = () => {
  const { theme } = useContext(ThemeContext);
  const audience = useParksDashboardAudience();

  const title =
    audience === 'ceo'
      ? t`Command Center CEO`
      : t`Centro de mando comercial`;

  const subtitle =
    audience === 'ceo'
      ? getParksIndustrialPageSubtitle(
          t`Pulso del grupo: ocupación, ingresos, legal, CxC y renovaciones`,
        )
      : getParksIndustrialPageSubtitle(
          t`Pipeline, ocupación, ingresos y cola Director Comercial — vista operativa`,
        );

  return (
    <ParksPageShell
      title={title}
      subtitle={subtitle}
      icon={<IconChartBar size={theme.icon.size.md} />}
    >
      <ParksMetadataGate loadingVariant="dashboard">
        <ParksDashboardContent />
      </ParksMetadataGate>
    </ParksPageShell>
  );
};
