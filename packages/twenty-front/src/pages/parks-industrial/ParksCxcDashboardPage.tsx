import { t } from '@lingui/core/macro';
import { IconReportMoney } from 'twenty-ui/icon';
import { useContext } from 'react';
import { ThemeContext } from 'twenty-ui/theme-constants';

import { ParksCxcDashboardContent } from '@/parks-industrial/components/cxc/ParksCxcDashboardContent';
import { ParksPageShell } from '@/parks-industrial/components/layout/ParksPageShell';
import { getParksIndustrialPageSubtitle } from '@/parks-industrial/constants/parks-tenant.constants';

export const ParksCxcDashboardPage = () => {
  const { theme } = useContext(ThemeContext);

  return (
    <ParksPageShell
      title={t`CxC · Cobranza`}
      subtitle={getParksIndustrialPageSubtitle(
        t`KPIs, forecast y anomalías · Cartera CxC para el trabajo diario`,
      )}
      icon={<IconReportMoney size={theme.icon.size.md} />}
    >
      <ParksCxcDashboardContent />
    </ParksPageShell>
  );
};
