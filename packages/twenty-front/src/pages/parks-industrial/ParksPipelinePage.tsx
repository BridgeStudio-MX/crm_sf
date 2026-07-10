import { t } from '@lingui/core/macro';
import { IconLayoutKanban } from 'twenty-ui/icon';
import { useContext } from 'react';
import { ThemeContext } from 'twenty-ui/theme-constants';

import { ParksMetadataGate } from '@/parks-industrial/components/layout/ParksMetadataGate';
import { getParksIndustrialPageSubtitle } from '@/parks-industrial/constants/parks-tenant.constants';
import { ParksPageShell } from '@/parks-industrial/components/layout/ParksPageShell';
import { ParksPipelineBoard } from '@/parks-industrial/components/pipeline/ParksPipelineBoard';
import { ParksEmptyState } from '@/parks-industrial/components/ui/ParksEmptyState';
import { ParksLoadingSkeleton } from '@/parks-industrial/components/ui/ParksLoadingSkeleton';
import {
  type ParksOpportunityRecord,
  useParksOpportunities,
} from '@/parks-industrial/hooks/useParksRecords';

const EMPTY_OPPORTUNITIES: ParksOpportunityRecord[] = [];

const ParksPipelineContent = () => {
  const { records, loading, error, refetch } = useParksOpportunities();

  if (loading) {
    return <ParksLoadingSkeleton variant="list" />;
  }

  if (error) {
    return (
      <ParksEmptyState
        title={t`No se pudo cargar el pipeline`}
        description={t`Tu sesión pudo haber expirado. Recarga la página o vuelve a iniciar sesión.`}
      />
    );
  }

  return (
    <ParksPipelineBoard
      opportunities={records ?? EMPTY_OPPORTUNITIES}
      onOpportunitiesRefresh={async () => {
        try {
          await refetch?.();
        } catch {
          // Mantener UI optimista si la recarga falla (p. ej. token expirado)
        }
      }}
    />
  );
};

export const ParksPipelinePage = () => {
  const { theme } = useContext(ThemeContext);

  return (
    <ParksPageShell
      title={t`Pipeline Comercial`}
      subtitle={getParksIndustrialPageSubtitle(
        t`Arrastra entre etapas o haz clic en un deal para ver su detalle`,
      )}
      icon={<IconLayoutKanban size={theme.icon.size.md} />}
    >
      <ParksMetadataGate loadingVariant="list">
        <ParksPipelineContent />
      </ParksMetadataGate>
    </ParksPageShell>
  );
};
