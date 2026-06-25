import { Navigate } from 'react-router-dom';
import { AppPath } from 'twenty-shared/types';
import { getAppPath } from 'twenty-shared/utils';

import { ParksMetadataGate } from '@/parks-industrial/components/layout/ParksMetadataGate';
import { useParksFirstParqueId } from '@/parks-industrial/hooks/useParksParques';

const ParksStackingPlanIndexContent = () => {
  const firstParqueId = useParksFirstParqueId();

  if (!firstParqueId) {
    return <Navigate to={AppPath.ParksDashboard} replace />;
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
