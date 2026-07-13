import { ParksNavigationSection } from '@/parks-industrial/components/navigation/ParksNavigationSection';
import { useParksAccess } from '@/parks-industrial/hooks/useParksAccess';
import { NavigationDrawerOpenedSection } from '@/navigation-menu-item/display/sections/components/NavigationDrawerOpenedSection';
import { NavigationDrawerWorkspaceSectionSkeletonLoader } from '@/object-metadata/components/NavigationDrawerWorkspaceSectionSkeletonLoader';
import { NavigationDrawerOtherSection } from '@/navigation/components/NavigationDrawerOtherSection';

import { styled } from '@linaria/react';
import { lazy, Suspense } from 'react';

import { themeCssVariables } from 'twenty-ui/theme-constants';

const FavoritesSectionDispatcher = lazy(() =>
  import('@/navigation-menu-item/display/sections/favorites/components/FavoritesSectionDispatcher').then(
    (module) => ({
      default: module.FavoritesSectionDispatcher,
    }),
  ),
);

const WorkspaceSectionDispatcher = lazy(() =>
  import('@/navigation-menu-item/display/sections/workspace/components/WorkspaceSectionDispatcher').then(
    (module) => ({
      default: module.WorkspaceSectionDispatcher,
    }),
  ),
);

const StyledScrollableItemsContainer = styled.div`
  display: flex;
  flex-direction: column;
  gap: ${themeCssVariables.spacing[3]};
`;

export const MainNavigationDrawerScrollableItems = () => {
  const { hasAnyParksNavAccess } = useParksAccess();

  // Parks-first nav still keeps Settings visible — otherwise "Configuración"
  // is only reachable via the workspace menu and feels broken in demo.
  if (hasAnyParksNavAccess) {
    return (
      <StyledScrollableItemsContainer>
        <ParksNavigationSection isPrimary />
        <NavigationDrawerOtherSection />
      </StyledScrollableItemsContainer>
    );
  }

  return (
    <StyledScrollableItemsContainer>
      <NavigationDrawerOpenedSection />
      <ParksNavigationSection />
      <Suspense fallback={<NavigationDrawerWorkspaceSectionSkeletonLoader />}>
        <FavoritesSectionDispatcher />
        <WorkspaceSectionDispatcher />
      </Suspense>
    </StyledScrollableItemsContainer>
  );
};
