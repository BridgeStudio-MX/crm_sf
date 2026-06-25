import { t } from '@lingui/core/macro';
import { IconMap } from 'twenty-ui/icon';
import { useContext } from 'react';
import { ThemeContext } from 'twenty-ui/theme-constants';

import { ParksMapContent } from '@/parks-industrial/components/mapa/ParksMapContent';
import { ParksMetadataGate } from '@/parks-industrial/components/layout/ParksMetadataGate';
import { ParksPageShell } from '@/parks-industrial/components/layout/ParksPageShell';
import { ParksLoadingSkeleton } from '@/parks-industrial/components/ui/ParksLoadingSkeleton';
import { useParksParques } from '@/parks-industrial/hooks/useParksParques';

const ParksMapContentWrapper = () => {
  const { records, loading } = useParksParques();

  if (loading) {
    return <ParksLoadingSkeleton variant="map" />;
  }

  return <ParksMapContent parques={records} />;
};

export const ParksMapPage = () => {
  const { theme } = useContext(ThemeContext);

  return (
    <ParksPageShell
      title={t`Mapa de parques`}
      subtitle={t`Explora la cartera en mapa, revisa ocupación y accede al stacking plan de cada parque`}
      icon={<IconMap size={theme.icon.size.md} />}
    >
      <ParksMetadataGate loadingVariant="dashboard">
        <ParksMapContentWrapper />
      </ParksMetadataGate>
    </ParksPageShell>
  );
};
