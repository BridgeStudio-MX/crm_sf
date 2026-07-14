import { t } from '@lingui/core/macro';
import { IconMap } from 'twenty-ui/icon';
import { useContext } from 'react';
import { ThemeContext } from 'twenty-ui/theme-constants';

import { ParksMapContent } from '@/parks-industrial/components/mapa/ParksMapContent';
import { getParksIndustrialPageSubtitle } from '@/parks-industrial/constants/parks-tenant.constants';
import { ParksMetadataGate } from '@/parks-industrial/components/layout/ParksMetadataGate';
import { ParksPageShell } from '@/parks-industrial/components/layout/ParksPageShell';
import { ParksLoadingSkeleton } from '@/parks-industrial/components/ui/ParksLoadingSkeleton';
import {
  useParksExpedientesActivos,
  useParksNaves,
  useParksOpportunities,
} from '@/parks-industrial/hooks/useParksRecords';
import { useParksParques } from '@/parks-industrial/hooks/useParksParques';

const ParksMapContentWrapper = () => {
  const { records: parques, loading: parquesLoading } = useParksParques();
  const { records: naves, loading: navesLoading } = useParksNaves();
  const { records: opportunities, loading: opportunitiesLoading } =
    useParksOpportunities();
  const { records: expedientes, loading: expedientesLoading } =
    useParksExpedientesActivos();

  if (
    parquesLoading ||
    navesLoading ||
    opportunitiesLoading ||
    expedientesLoading
  ) {
    return <ParksLoadingSkeleton variant="map" />;
  }

  return (
    <ParksMapContent
      parques={parques}
      naves={naves}
      opportunities={opportunities}
      expedientes={expedientes}
    />
  );
};

export const ParksMapPage = () => {
  const { theme } = useContext(ThemeContext);

  return (
    <ParksPageShell
      title={t`Mapa de Inventario`}
      subtitle={getParksIndustrialPageSubtitle(
        t`Selecciona leads por zona y ofréceles naves disponibles o próximas a liberar`,
      )}
      icon={<IconMap size={theme.icon.size.md} />}
    >
      <ParksMetadataGate loadingVariant="dashboard">
        <ParksMapContentWrapper />
      </ParksMetadataGate>
    </ParksPageShell>
  );
};
