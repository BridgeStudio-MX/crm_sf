import { t } from '@lingui/core/macro';
import { IconMap } from 'twenty-ui/icon';
import { useContext } from 'react';
import { ThemeContext } from 'twenty-ui/theme-constants';

import { ParksMapContent } from '@/parks-industrial/components/mapa/ParksMapContent';
import { ParksMetadataGate } from '@/parks-industrial/components/layout/ParksMetadataGate';
import { ParksPageShell } from '@/parks-industrial/components/layout/ParksPageShell';
import { ParksLoadingSkeleton } from '@/parks-industrial/components/ui/ParksLoadingSkeleton';
import { useParksNaves } from '@/parks-industrial/hooks/useParksRecords';
import { useParksParques } from '@/parks-industrial/hooks/useParksParques';

const ParksMapContentWrapper = () => {
  const { records: parques, loading: parquesLoading } = useParksParques();
  const { records: naves, loading: navesLoading } = useParksNaves();

  if (parquesLoading || navesLoading) {
    return <ParksLoadingSkeleton variant="map" />;
  }

  return <ParksMapContent parques={parques} naves={naves} />;
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
