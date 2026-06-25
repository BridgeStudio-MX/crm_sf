import { t } from '@lingui/core/macro';
import { useParams } from 'react-router-dom';
import { IconFileCheck } from 'twenty-ui/icon';
import { useContext } from 'react';
import { ThemeContext } from 'twenty-ui/theme-constants';

import { ParksApprovalTimeline } from '@/parks-industrial/components/approval/ParksApprovalTimeline';
import { ParksMetadataGate } from '@/parks-industrial/components/layout/ParksMetadataGate';
import { ParksPageShell } from '@/parks-industrial/components/layout/ParksPageShell';
import { ParksEmptyState } from '@/parks-industrial/components/ui/ParksEmptyState';
import { ParksLoadingSkeleton } from '@/parks-industrial/components/ui/ParksLoadingSkeleton';
import { useParksCasoLegal } from '@/parks-industrial/hooks/useParksRecords';

const ParksContratoAprobacionContent = () => {
  const { contratoId } = useParams<{ contratoId: string }>();
  const { casoLegal, loading } = useParksCasoLegal(contratoId);

  if (loading) {
    return <ParksLoadingSkeleton variant="list" />;
  }

  if (!casoLegal) {
    return (
      <ParksEmptyState
        title={t`Caso no encontrado`}
        description={t`El contrato solicitado no existe o fue eliminado.`}
      />
    );
  }

  return <ParksApprovalTimeline casoLegal={casoLegal} />;
};

export const ParksContratoAprobacionPage = () => {
  const { theme } = useContext(ThemeContext);

  return (
    <ParksPageShell
      title={t`Aprobación de contrato`}
      subtitle={t`Flujo comercial, legal y firma del contrato`}
      icon={<IconFileCheck size={theme.icon.size.md} />}
    >
      <ParksMetadataGate loadingVariant="list">
        <ParksContratoAprobacionContent />
      </ParksMetadataGate>
    </ParksPageShell>
  );
};
