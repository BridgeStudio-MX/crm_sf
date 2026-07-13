import { t } from '@lingui/core/macro';
import { useContext } from 'react';
import { IconUsers } from 'twenty-ui/icon';
import { ThemeContext } from 'twenty-ui/theme-constants';

import { ParksMetadataGate } from '@/parks-industrial/components/layout/ParksMetadataGate';
import { ParksPageShell } from '@/parks-industrial/components/layout/ParksPageShell';
import { ParksProspectSearchContent } from '@/parks-industrial/components/prospectos/ParksProspectSearchContent';
import { getParksIndustrialPageSubtitle } from '@/parks-industrial/constants/parks-tenant.constants';

export const ParksProspectSearchPage = () => {
  const { theme } = useContext(ThemeContext);

  return (
    <ParksPageShell
      title={t`Prospectos`}
      subtitle={getParksIndustrialPageSubtitle(
        t`Búsqueda avanzada por perfil de demanda y matching con inventario de naves`,
      )}
      icon={<IconUsers size={theme.icon.size.md} />}
    >
      <ParksMetadataGate loadingVariant="dashboard">
        <ParksProspectSearchContent />
      </ParksMetadataGate>
    </ParksPageShell>
  );
};
