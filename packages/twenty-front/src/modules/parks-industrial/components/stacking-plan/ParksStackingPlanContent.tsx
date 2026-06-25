import { t } from '@lingui/core/macro';
import { useParams } from 'react-router-dom';

import { ParksEmptyState } from '@/parks-industrial/components/ui/ParksEmptyState';
import { ParksLoadingSkeleton } from '@/parks-industrial/components/ui/ParksLoadingSkeleton';
import { StyledParksPageStack } from '@/parks-industrial/components/ui/ParksSectionCard';
import { ParksStackingPlanGrid } from '@/parks-industrial/components/stacking-plan/ParksStackingPlanGrid';
import { ParksStackingPlanHeader } from '@/parks-industrial/components/stacking-plan/ParksStackingPlanHeader';
import { ParksStackingPlanLegend } from '@/parks-industrial/components/stacking-plan/ParksStackingPlanLegend';
import { useParksParques } from '@/parks-industrial/hooks/useParksParques';
import { useParksStackingPlan } from '@/parks-industrial/hooks/useParksRecords';

export const ParksStackingPlanContent = () => {
  const { parqueId } = useParams<{ parqueId: string }>();
  const { records: parques, loading: parquesLoading } = useParksParques();
  const { parque, stackingNaves, loading } = useParksStackingPlan(parqueId);

  if (loading || parquesLoading) {
    return <ParksLoadingSkeleton variant="list" />;
  }

  if (!parque || !parqueId) {
    return (
      <ParksEmptyState
        title={t`Parque no encontrado`}
        description={t`Verifica el enlace o selecciona otro parque desde el mapa.`}
      />
    );
  }

  return (
    <StyledParksPageStack>
      <ParksStackingPlanHeader
        parque={parque}
        parqueId={parqueId}
        parques={parques}
        naves={stackingNaves}
      />
      <ParksStackingPlanLegend />
      {stackingNaves.length === 0 ? (
        <ParksEmptyState title={t`Este parque aún no tiene naves registradas`} />
      ) : (
        <ParksStackingPlanGrid naves={stackingNaves} />
      )}
    </StyledParksPageStack>
  );
};
