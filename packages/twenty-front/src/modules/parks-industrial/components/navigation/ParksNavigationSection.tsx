import { useLingui } from '@lingui/react/macro';
import { useMemo } from 'react';
import { useLocation } from 'react-router-dom';
import { type IconComponent, type TablerIconsProps } from 'twenty-ui/icon';
import { AnimatedExpandableContainer } from 'twenty-ui/layout';

import {
  ParksNavigationBrandPanel,
  ParksNavigationGroupsStack,
} from '@/parks-industrial/components/navigation/ParksNavigationBrandPanel';
import { ParksNavigationGroup } from '@/parks-industrial/components/navigation/ParksNavigationGroup';
import { ParksNavigationSectionTitle } from '@/parks-industrial/components/navigation/ParksNavigationSectionTitle';
import {
  ParksNavigationUnreadBadge,
  ParksNavigationUnreadIconDot,
} from '@/parks-industrial/components/navigation/ParksNavigationUnreadBadge';
import {
  type ParksNavigationGroupKey,
  type ParksNavigationItemKey,
  PARKS_NAVIGATION_GROUPS,
  PARKS_NAVIGATION_ITEMS,
} from '@/parks-industrial/constants/parks-navigation.constants';
import { useParksAccess } from '@/parks-industrial/hooks/useParksAccess';
import { useParksNotificationsUnreadCount } from '@/parks-industrial/hooks/useParksNotificationsUnreadCount';
import { useParksUnassignedLeads } from '@/parks-industrial/hooks/useParksUnassignedLeads';
import { NavigationDrawerAnimatedCollapseWrapper } from '@/ui/navigation/navigation-drawer/components/NavigationDrawerAnimatedCollapseWrapper';
import { NavigationDrawerItem } from '@/ui/navigation/navigation-drawer/components/NavigationDrawerItem';
import { useNavigationSection } from '@/ui/navigation/navigation-drawer/hooks/useNavigationSection';
import { isNavigationSectionOpenFamilyState } from '@/ui/navigation/navigation-drawer/states/isNavigationSectionOpenFamilyState';
import { useAtomFamilyStateValue } from '@/ui/utilities/state/jotai/hooks/useAtomFamilyStateValue';

const PARKS_SECTION_ID = 'ParksIndustrial';

const isParksNavigationItemActive = (
  pathname: string,
  navigationPath: string,
): boolean => {
  if (pathname === navigationPath) {
    return true;
  }

  return (
    pathname.startsWith(`${navigationPath}/`) ||
    pathname.startsWith(`${navigationPath}?`)
  );
};

type ParksNavigationSectionProps = {
  isPrimary?: boolean;
};

export const ParksNavigationSection = ({
  isPrimary = false,
}: ParksNavigationSectionProps) => {
  const { t } = useLingui();
  const { pathname } = useLocation();
  const { canAccessRoute, hasAnyParksNavAccess } = useParksAccess();
  const { leads: unassignedLeads } = useParksUnassignedLeads();
  const unreadNotificationsCount = useParksNotificationsUnreadCount();
  const pendingLeadsCount = unassignedLeads.length;
  const { toggleNavigationSection } = useNavigationSection(PARKS_SECTION_ID);
  const isNavigationSectionOpen = useAtomFamilyStateValue(
    isNavigationSectionOpenFamilyState,
    PARKS_SECTION_ID,
  );

  const groupLabels: Record<ParksNavigationGroupKey, string> = {
    overview: t`Resumen`,
    commercial: t`Comercial`,
    legal: t`Legal`,
    operations: t`Operaciones`,
  };

  const itemLabels: Record<ParksNavigationItemKey, string> = {
    dashboard: t`Dashboard`,
    dashboardComercial: t`Dashboard comercial`,
    stackingPlan: t`Stacking Plan`,
    pipeline: t`Pipeline`,
    leadsCem: t`Leads CEM`,
    prospectos: t`Prospectos`,
    notificaciones: t`Notificaciones`,
    misPendientes: t`Mis pendientes`,
    contratos: t`Contratos`,
    legalPipeline: t`Pipeline legal`,
    legalDashboard: t`Dashboard legal`,
    cxc: t`CxC`,
    comite: t`Comité`,
    valorAgregado: t`Valor agregado`,
    asignacion: t`Asignación`,
    loCampo: t`Campo LO`,
    renovaciones: t`Renovaciones`,
    reservas: t`Reservas`,
    comisiones: t`Comisiones`,
    miDesempeno: t`Mi desempeño`,
    mapa: t`Mapa de Inventario`,
  };

  const NotificacionesIcon = useMemo((): IconComponent => {
    const BaseIcon = PARKS_NAVIGATION_ITEMS.notificaciones.Icon;

    const IconWithUnreadDot = (props: TablerIconsProps) => (
      <ParksNavigationUnreadIconDot show={unreadNotificationsCount > 0}>
        <BaseIcon {...props} />
      </ParksNavigationUnreadIconDot>
    );

    return IconWithUnreadDot;
  }, [unreadNotificationsCount]);

  if (!hasAnyParksNavAccess) {
    return null;
  }

  const visibleGroups = PARKS_NAVIGATION_GROUPS.map((navigationGroup) => {
    const visibleItems = navigationGroup.itemKeys
      .map((itemKey) => ({
        itemKey,
        definition: PARKS_NAVIGATION_ITEMS[itemKey],
      }))
      .filter(({ definition }) => canAccessRoute(definition.accessKey));

    return {
      ...navigationGroup,
      visibleItems,
    };
  }).filter((navigationGroup) => navigationGroup.visibleItems.length > 0);

  if (visibleGroups.length === 0) {
    return null;
  }

  return (
    <ParksNavigationBrandPanel isPrimary={isPrimary}>
      <NavigationDrawerAnimatedCollapseWrapper>
        <ParksNavigationSectionTitle
          label={t`Parks`}
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
        <ParksNavigationGroupsStack>
          {visibleGroups.map((navigationGroup) => (
            <ParksNavigationGroup
              key={navigationGroup.id}
              label={
                navigationGroup.groupKey
                  ? groupLabels[navigationGroup.groupKey]
                  : undefined
              }
            >
              {navigationGroup.visibleItems.map(({ itemKey, definition }) => {
                const isNotificaciones = itemKey === 'notificaciones';

                return (
                  <NavigationDrawerItem
                    key={definition.to}
                    label={itemLabels[itemKey]}
                    to={definition.to}
                    Icon={
                      isNotificaciones ? NotificacionesIcon : definition.Icon
                    }
                    iconColor={definition.iconColor}
                    secondaryLabel={
                      itemKey === 'leadsCem' && pendingLeadsCount > 0
                        ? String(pendingLeadsCount)
                        : undefined
                    }
                    rightOptions={
                      isNotificaciones && unreadNotificationsCount > 0 ? (
                        <ParksNavigationUnreadBadge
                          count={unreadNotificationsCount}
                        />
                      ) : undefined
                    }
                    alwaysShowRightOptions={
                      isNotificaciones && unreadNotificationsCount > 0
                    }
                    active={isParksNavigationItemActive(
                      pathname,
                      definition.to,
                    )}
                  />
                );
              })}
            </ParksNavigationGroup>
          ))}
        </ParksNavigationGroupsStack>
      </AnimatedExpandableContainer>
    </ParksNavigationBrandPanel>
  );
};
