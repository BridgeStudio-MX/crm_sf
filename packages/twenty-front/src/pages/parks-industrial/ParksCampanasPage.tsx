import { t } from '@lingui/core/macro';
import { useContext } from 'react';
import { IconTarget } from 'twenty-ui/icon';
import { ThemeContext } from 'twenty-ui/theme-constants';

import { ParksPageShell } from '@/parks-industrial/components/layout/ParksPageShell';
import { ParksMarketingCampaignsContent } from '@/parks-industrial/components/marketing/ParksMarketingCampaignsContent';
import { getParksIndustrialPageSubtitle } from '@/parks-industrial/constants/parks-tenant.constants';

export const ParksCampanasPage = () => {
  const { theme } = useContext(ThemeContext);

  return (
    <ParksPageShell
      title={t`Campañas`}
      subtitle={getParksIndustrialPageSubtitle(
        t`Campañas activas, presupuesto, CPL y conversión a tours`,
      )}
      icon={<IconTarget size={theme.icon.size.md} />}
    >
      <ParksMarketingCampaignsContent />
    </ParksPageShell>
  );
};
