import { t } from '@lingui/core/macro';
import { IconTarget } from 'twenty-ui/icon';
import { useContext } from 'react';
import { ThemeContext } from 'twenty-ui/theme-constants';

import { ParksBrokerPerformanceContent } from '@/parks-industrial/components/broker/ParksBrokerPerformanceContent';
import { ParksPageShell } from '@/parks-industrial/components/layout/ParksPageShell';

export const ParksMiDesempenoPage = () => {
  const { theme } = useContext(ThemeContext);

  return (
    <ParksPageShell
      title={t`Mi desempeño`}
      subtitle={t`KPIs del broker: deals, ticket, comisiones y meta mensual`}
      icon={<IconTarget size={theme.icon.size.md} />}
    >
      <ParksBrokerPerformanceContent />
    </ParksPageShell>
  );
};
