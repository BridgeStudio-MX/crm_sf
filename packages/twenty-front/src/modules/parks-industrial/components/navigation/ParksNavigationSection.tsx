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
  IconBell,
  IconTarget,
  IconUserPlus,
  type IconComponent,
} from 'twenty-ui/icon';
import { AnimatedExpandableContainer } from 'twenty-ui/layout';
import { type ThemeColor } from 'twenty-ui/theme';

import { NavigationDrawerAnimatedCollapseWrapper } from '@/ui/navigation/navigation-drawer/components/NavigationDrawerAnimatedCollapseWrapper';
import { NavigationDrawerItem } from '@/ui/navigation/navigation-drawer/components/NavigationDrawerItem';
import { NavigationDrawerSection } from '@/ui/navigation/navigation-drawer/components/NavigationDrawerSection';
import { NavigationDrawerSectionTitle } from '@/ui/navigation/navigation-drawer/components/NavigationDrawerSectionTitle';
import { useNavigationSection } from '@/ui/navigation/navigation-drawer/hooks/useNavigationSection';
import { isNavigationSectionOpenFamilyState } from '@/ui/navigation/navigation-drawer/states/isNavigationSectionOpenFamilyState';
import { useAtomFamilyStateValue } from '@/ui/utilities/state/jotai/hooks/useAtomFamilyStateValue';
import { useParksUnassignedLeads } from '@/parks-industrial/hooks/useParksUnassignedLeads';

const PARKS_SECTION_ID = 'ParksIndustrial';

type ParksNavigationItem = {
  label: string;
  to: string;
  Icon: IconComponent;
  iconColor: ThemeColor;
  secondaryLabel?: string;
};

export const ParksNavigationSection = () => {
  const { t } = useLingui();
  const { leads: unassignedLeads } = useParksUnassignedLeads();
  const pendingLeadsCount = unassignedLeads.length;
  const { toggleNavigationSection } = useNavigationSection(PARKS_SECTION_ID);
  const isNavigationSectionOpen = useAtomFamilyStateValue(
    isNavigationSectionOpenFamilyState,
    PARKS_SECTION_ID,
  );

  const navigationItems: ParksNavigationItem[] = [
    {
      label: t`Dashboard`,
      to: AppPath.ParksDashboard,
      Icon: IconChartBar,
      iconColor: 'blue',
    },
    {
      label: t`Stacking Plan`,
      to: AppPath.ParksStackingPlanIndex,
      Icon: IconLayoutGrid,
      iconColor: 'gray',
    },
    {
      label: t`Pipeline`,
      to: AppPath.ParksPipeline,
      Icon: IconLayoutKanban,
      iconColor: 'red',
    },
    {
      label: t`Leads CEM`,
      to: AppPath.ParksLeadsCem,
      Icon: IconUserPlus,
      iconColor: 'green',
      secondaryLabel:
        pendingLeadsCount > 0 ? String(pendingLeadsCount) : undefined,
    },
    {
      label: t`Notificaciones`,
      to: AppPath.ParksNotificaciones,
      Icon: IconBell,
      iconColor: 'yellow',
    },
    {
      label: t`Contratos`,
      to: AppPath.ParksContratos,
      Icon: IconFileText,
      iconColor: 'sky',
    },
    {
      label: t`Renovaciones`,
      to: AppPath.ParksRenovaciones,
      Icon: IconRefresh,
      iconColor: 'orange',
    },
    {
      label: t`Reservas`,
      to: AppPath.ParksReservas,
      Icon: IconBookmark,
      iconColor: 'purple',
    },
    {
      label: t`Comisiones`,
      to: AppPath.ParksComisiones,
      Icon: IconCoins,
      iconColor: 'yellow',
    },
    {
      label: t`Mi desempeño`,
      to: AppPath.ParksMiDesempeno,
      Icon: IconTarget,
      iconColor: 'red',
    },
    {
      label: t`Mapa`,
      to: AppPath.ParksMapa,
      Icon: IconMap,
      iconColor: 'turquoise',
    },
  ];

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
        {navigationItems.map((navigationItem) => (
          <NavigationDrawerItem
            key={navigationItem.to}
            label={navigationItem.label}
            to={navigationItem.to}
            Icon={navigationItem.Icon}
            iconColor={navigationItem.iconColor}
            secondaryLabel={navigationItem.secondaryLabel}
          />
        ))}
      </AnimatedExpandableContainer>
    </NavigationDrawerSection>
  );
};
