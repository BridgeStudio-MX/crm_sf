import { t } from '@lingui/core/macro';
import { IconShield } from 'twenty-ui/icon';
import { useContext } from 'react';
import { ThemeContext } from 'twenty-ui/theme-constants';

import { ParksLegalDashboardContent } from '@/parks-industrial/components/legal/ParksLegalDashboardContent';
import { getParksIndustrialPageSubtitle } from '@/parks-industrial/constants/parks-tenant.constants';
import { ParksPageShell } from '@/parks-industrial/components/layout/ParksPageShell';

export const ParksLegalDashboardPage = () => {
  const { theme } = useContext(ThemeContext);

  return (
    <ParksPageShell
      title={t`Dashboard legal`}
      subtitle={getParksIndustrialPageSubtitle(
        t`Casos activos, semáforos, métricas y reporte quincenal`,
      )}
      icon={<IconShield size={theme.icon.size.md} />}
    >
      <ParksLegalDashboardContent />
    </ParksPageShell>
  );
};
