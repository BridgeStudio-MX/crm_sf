import { t } from '@lingui/core/macro';
import { IconLayoutKanban } from 'twenty-ui/icon';
import { useContext } from 'react';
import { ThemeContext } from 'twenty-ui/theme-constants';

import { ParksLegalPipelineBoard } from '@/parks-industrial/components/legal/ParksLegalPipelineBoard';
import { getParksIndustrialPageSubtitle } from '@/parks-industrial/constants/parks-tenant.constants';
import { ParksMetadataGate } from '@/parks-industrial/components/layout/ParksMetadataGate';
import { ParksPageShell } from '@/parks-industrial/components/layout/ParksPageShell';
import { ParksLoadingSkeleton } from '@/parks-industrial/components/ui/ParksLoadingSkeleton';
import { useFilteredParksCasosLegales } from '@/parks-industrial/hooks/useFilteredParksCasosLegales';

const ParksLegalPipelineContent = () => {
  const { records, loading } = useFilteredParksCasosLegales();

  if (loading) {
    return <ParksLoadingSkeleton variant="list" />;
  }

  return <ParksLegalPipelineBoard casosLegales={records} />;
};

export const ParksLegalPipelinePage = () => {
  const { theme } = useContext(ThemeContext);

  return (
    <ParksPageShell
      title={t`Pipeline legal`}
      subtitle={getParksIndustrialPageSubtitle(
        t`Haz clic en un caso para abrir el flujo de aprobación y gestionar versiones, firmas y SLA`,
      )}
      icon={<IconLayoutKanban size={theme.icon.size.md} />}
    >
      <ParksMetadataGate loadingVariant="list" objectNameSingular="casoLegal">
        <ParksLegalPipelineContent />
      </ParksMetadataGate>
    </ParksPageShell>
  );
};
