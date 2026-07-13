import { t } from '@lingui/core/macro';
import { isDefined } from 'twenty-shared/utils';
import { useParams } from 'react-router-dom';
import { IconFileCheck } from 'twenty-ui/icon';
import { useContext } from 'react';
import { ThemeContext } from 'twenty-ui/theme-constants';

import { ParksApprovalTimeline } from '@/parks-industrial/components/approval/ParksApprovalTimeline';
import { getParksIndustrialPageSubtitle } from '@/parks-industrial/constants/parks-tenant.constants';
import { ParksMetadataGate } from '@/parks-industrial/components/layout/ParksMetadataGate';
import { ParksPageShell } from '@/parks-industrial/components/layout/ParksPageShell';
import { ParksEmptyState } from '@/parks-industrial/components/ui/ParksEmptyState';
import { ParksLoadingSkeleton } from '@/parks-industrial/components/ui/ParksLoadingSkeleton';
import { useParksCasoLegal } from '@/parks-industrial/hooks/useParksRecords';

export const ParksContratoAprobacionPage = () => {
  const { theme } = useContext(ThemeContext);
  const { contratoId } = useParams<{ contratoId: string }>();
  const { casoLegal, loading } = useParksCasoLegal(contratoId);

  const subtitle = casoLegal?.referencia
    ? getParksIndustrialPageSubtitle(
        t`Flujo comercial, legal y firma · ${casoLegal.referencia}`,
      )
    : getParksIndustrialPageSubtitle(
        t`Flujo comercial, legal y firma del contrato`,
      );

  return (
    <ParksPageShell
      title={t`Aprobación de contrato`}
      subtitle={subtitle}
      icon={<IconFileCheck size={theme.icon.size.md} />}
    >
      <ParksMetadataGate loadingVariant="list" objectNameSingular="casoLegal">
        {loading ? (
          <ParksLoadingSkeleton variant="list" />
        ) : !isDefined(casoLegal) ? (
          <ParksEmptyState
            title={t`Caso no encontrado`}
            description={t`El contrato solicitado no existe o fue eliminado.`}
          />
        ) : (
          <ParksApprovalTimeline casoLegal={casoLegal} />
        )}
      </ParksMetadataGate>
    </ParksPageShell>
  );
};
