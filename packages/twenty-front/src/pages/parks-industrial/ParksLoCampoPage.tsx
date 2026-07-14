import { t } from '@lingui/core/macro';
import { IconMap } from 'twenty-ui/icon';
import { useContext } from 'react';
import { ThemeContext } from 'twenty-ui/theme-constants';

import { ParksLoCampoContent } from '@/parks-industrial/components/campo/ParksLoCampoContent';
import { ParksMetadataGate } from '@/parks-industrial/components/layout/ParksMetadataGate';
import { ParksPageShell } from '@/parks-industrial/components/layout/ParksPageShell';
import { getParksIndustrialPageSubtitle } from '@/parks-industrial/constants/parks-tenant.constants';

export const ParksLoCampoPage = () => {
  const { theme } = useContext(ThemeContext);

  return (
    <ParksPageShell
      title={t`Campo LO`}
      subtitle={getParksIndustrialPageSubtitle(
        t`App móvil para tours: notas, recomendaciones, guión y checklist`,
      )}
      icon={<IconMap size={theme.icon.size.md} />}
    >
      <ParksMetadataGate loadingVariant="list">
        <ParksLoCampoContent />
      </ParksMetadataGate>
    </ParksPageShell>
  );
};
