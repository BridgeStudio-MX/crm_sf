import { type ReactNode } from 'react';
import { Navigate, useLocation } from 'react-router-dom';
import { AppPath } from 'twenty-shared/types';

import { ParksLoadingSkeleton } from '@/parks-industrial/components/ui/ParksLoadingSkeleton';
import { useParksAccess } from '@/parks-industrial/hooks/useParksAccess';
import { isCurrentUserLoadedState } from '@/auth/states/isCurrentUserLoadedState';
import { useAtomStateValue } from '@/ui/utilities/state/jotai/hooks/useAtomStateValue';

type ParksProtectedRouteProps = {
  children: ReactNode;
};

export const ParksProtectedRoute = ({ children }: ParksProtectedRouteProps) => {
  const location = useLocation();
  const isCurrentUserLoaded = useAtomStateValue(isCurrentUserLoadedState);
  const { canAccessPath, defaultAccessiblePath, hasAnyParksNavAccess } =
    useParksAccess();

  if (!isCurrentUserLoaded) {
    return <ParksLoadingSkeleton variant="dashboard" />;
  }

  if (!hasAnyParksNavAccess) {
    return <Navigate to={AppPath.Index} replace />;
  }

  if (!canAccessPath(location.pathname)) {
    return <Navigate to={defaultAccessiblePath} replace />;
  }

  return children;
};
