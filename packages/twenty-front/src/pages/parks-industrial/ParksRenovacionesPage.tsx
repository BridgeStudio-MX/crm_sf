import { t } from '@lingui/core/macro';
import { IconRefresh } from 'twenty-ui/icon';
import { useContext } from 'react';
import { ThemeContext } from 'twenty-ui/theme-constants';

import { ParksRenovacionesContent } from '@/parks-industrial/components/renovaciones/ParksRenovacionesContent';
import { ParksMetadataGate } from '@/parks-industrial/components/layout/ParksMetadataGate';
import { ParksPageShell } from '@/parks-industrial/components/layout/ParksPageShell';

export const ParksRenovacionesPage = () => {
  const { theme } = useContext(ThemeContext);

  return (
    <ParksPageShell
      title={t`Renovaciones`}
      subtitle={t`Cola de vencimientos, riesgo de vacancia y holdovers activos`}
      icon={<IconRefresh size={theme.icon.size.md} />}
    >
      <ParksMetadataGate loadingVariant="list">
        <ParksRenovacionesContent />
      </ParksMetadataGate>
    </ParksPageShell>
  );
};
