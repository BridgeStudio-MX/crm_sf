import { t } from '@lingui/core/macro';
import { IconLayoutKanban } from 'twenty-ui/icon';
import { useContext } from 'react';
import { ThemeContext } from 'twenty-ui/theme-constants';

import { ParksMetadataGate } from '@/parks-industrial/components/layout/ParksMetadataGate';
import { ParksPageShell } from '@/parks-industrial/components/layout/ParksPageShell';
import { ParksPipelineBoard } from '@/parks-industrial/components/pipeline/ParksPipelineBoard';
import { ParksLoadingSkeleton } from '@/parks-industrial/components/ui/ParksLoadingSkeleton';
import { useParksOpportunities } from '@/parks-industrial/hooks/useParksRecords';

const ParksPipelineContent = () => {
  const { records, loading } = useParksOpportunities();

  if (loading) {
    return <ParksLoadingSkeleton variant="list" />;
  }

  return <ParksPipelineBoard opportunities={records} />;
};

export const ParksPipelinePage = () => {
  const { theme } = useContext(ThemeContext);

  return (
    <ParksPageShell
      title={t`Pipeline Comercial`}
      subtitle={t`Arrastra entre etapas o haz clic en un deal para ver su detalle`}
      icon={<IconLayoutKanban size={theme.icon.size.md} />}
    >
      <ParksMetadataGate loadingVariant="list">
        <ParksPipelineContent />
      </ParksMetadataGate>
    </ParksPageShell>
  );
};
