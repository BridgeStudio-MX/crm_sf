import { t } from '@lingui/core/macro';
import { IconRefresh } from 'twenty-ui/icon';
import { useContext } from 'react';
import { ThemeContext } from 'twenty-ui/theme-constants';

import { ParksRenovacionesContent } from '@/parks-industrial/components/renovaciones/ParksRenovacionesContent';
import { getParksIndustrialPageSubtitle } from '@/parks-industrial/constants/parks-tenant.constants';
import { ParksMetadataGate } from '@/parks-industrial/components/layout/ParksMetadataGate';
import { ParksPageShell } from '@/parks-industrial/components/layout/ParksPageShell';

export const ParksRenovacionesPage = () => {
  const { theme } = useContext(ThemeContext);

  return (
    <ParksPageShell
      title={t`Renovaciones`}
      subtitle={getParksIndustrialPageSubtitle(
        t`Alertas IA a 12/6/3/1 mes · riesgo de vacancia · holdovers`,
      )}
      icon={<IconRefresh size={theme.icon.size.md} />}
    >
      <ParksMetadataGate loadingVariant="list">
        <ParksRenovacionesContent />
      </ParksMetadataGate>
    </ParksPageShell>
  );
};
