import { useLingui } from '@lingui/react/macro';
import { AppPath } from 'twenty-shared/types';
import {
  IconBookmark,
  IconChartBar,
  IconCoins,
  IconFileText,
  IconLayoutGrid,
  IconLayoutKanban,
  IconMap,
  IconRefresh,
} from 'twenty-ui/icon';
import { AnimatedExpandableContainer } from 'twenty-ui/layout';

import { NavigationDrawerAnimatedCollapseWrapper } from '@/ui/navigation/navigation-drawer/components/NavigationDrawerAnimatedCollapseWrapper';
import { NavigationDrawerItem } from '@/ui/navigation/navigation-drawer/components/NavigationDrawerItem';
import { NavigationDrawerSection } from '@/ui/navigation/navigation-drawer/components/NavigationDrawerSection';
import { NavigationDrawerSectionTitle } from '@/ui/navigation/navigation-drawer/components/NavigationDrawerSectionTitle';
import { useNavigationSection } from '@/ui/navigation/navigation-drawer/hooks/useNavigationSection';
import { isNavigationSectionOpenFamilyState } from '@/ui/navigation/navigation-drawer/states/isNavigationSectionOpenFamilyState';
import { useAtomFamilyStateValue } from '@/ui/utilities/state/jotai/hooks/useAtomFamilyStateValue';

const PARKS_SECTION_ID = 'ParksIndustrial';

export const ParksNavigationSection = () => {
  const { t } = useLingui();
  const { toggleNavigationSection } = useNavigationSection(PARKS_SECTION_ID);
  const isNavigationSectionOpen = useAtomFamilyStateValue(
    isNavigationSectionOpenFamilyState,
    PARKS_SECTION_ID,
  );

  return (
    <NavigationDrawerSection>
      <NavigationDrawerAnimatedCollapseWrapper>
        <NavigationDrawerSectionTitle
          label={t`Parks Industrial`}
          onClick={toggleNavigationSection}
          isOpen={isNavigationSectionOpen}
        />
      </NavigationDrawerAnimatedCollapseWrapper>
      <AnimatedExpandableContainer
        isExpanded={isNavigationSectionOpen}
        dimension="height"
        mode="fit-content"
        containAnimation
        initial={false}
      >
        <NavigationDrawerItem
          label={t`Dashboard`}
          to={AppPath.ParksDashboard}
          Icon={IconChartBar}
        />
        <NavigationDrawerItem
          label={t`Stacking Plan`}
          to={AppPath.ParksStackingPlanIndex}
          Icon={IconLayoutGrid}
        />
        <NavigationDrawerItem
          label={t`Pipeline`}
          to={AppPath.ParksPipeline}
          Icon={IconLayoutKanban}
        />
        <NavigationDrawerItem
          label={t`Contratos`}
          to={AppPath.ParksContratos}
          Icon={IconFileText}
        />
        <NavigationDrawerItem
          label={t`Renovaciones`}
          to={AppPath.ParksRenovaciones}
          Icon={IconRefresh}
        />
        <NavigationDrawerItem
          label={t`Reservas`}
          to={AppPath.ParksReservas}
          Icon={IconBookmark}
        />
        <NavigationDrawerItem
          label={t`Comisiones`}
          to={AppPath.ParksComisiones}
          Icon={IconCoins}
        />
        <NavigationDrawerItem
          label={t`Mapa`}
          to={AppPath.ParksMapa}
          Icon={IconMap}
        />
      </AnimatedExpandableContainer>
    </NavigationDrawerSection>
  );
};
