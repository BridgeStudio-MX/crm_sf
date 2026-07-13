import { Navigate } from 'react-router-dom';
import { AppPath } from 'twenty-shared/types';
import { getAppPath } from 'twenty-shared/utils';

import { ParksMetadataGate } from '@/parks-industrial/components/layout/ParksMetadataGate';
import { useParksAccess } from '@/parks-industrial/hooks/useParksAccess';
import { useParksFirstParqueId } from '@/parks-industrial/hooks/useParksParques';

const ParksStackingPlanIndexContent = () => {
  const firstParqueId = useParksFirstParqueId();
  const { canAccessRoute } = useParksAccess();

  if (!firstParqueId) {
    // Prefer a concrete screen; never bounce back to this index route.
    const fallbackPath = canAccessRoute('dashboard')
      ? AppPath.ParksDashboard
      : canAccessRoute('pipeline')
        ? AppPath.ParksPipeline
        : AppPath.ParksNotificaciones;

    return <Navigate to={fallbackPath} replace />;
  }

  return (
    <Navigate
      to={getAppPath(AppPath.ParksStackingPlan, { parqueId: firstParqueId })}
      replace
    />
  );
};

export const ParksStackingPlanIndexPage = () => (
  <ParksMetadataGate>
    <ParksStackingPlanIndexContent />
  </ParksMetadataGate>
);
