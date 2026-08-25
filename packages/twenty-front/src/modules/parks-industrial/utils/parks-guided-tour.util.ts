import {
  PARKS_GUIDED_TOUR_DEFAULT_INTRO,
  PARKS_GUIDED_TOUR_ITEM_COPY,
  PARKS_GUIDED_TOUR_NAV_TARGET_PREFIX,
  PARKS_GUIDED_TOUR_ROLE_INTRO,
  PARKS_GUIDED_TOUR_WELCOME_TARGET,
  PARKS_INVENTORY_TOUR_TARGETS,
} from '@/parks-industrial/constants/parks-guided-tour.constants';
import {
  PARKS_COMMERCIAL_DASHBOARD_TOUR_PAGE_COPY,
  PARKS_COMMERCIAL_DASHBOARD_TOUR_PATH,
  PARKS_COMMERCIAL_DASHBOARD_TOUR_TARGETS,
} from '@/parks-industrial/constants/parks-commercial-dashboard-tour.constants';
import {
  PARKS_MARKETING_DASHBOARD_TOUR_PAGE_COPY,
  PARKS_MARKETING_DASHBOARD_TOUR_PATH,
  PARKS_MARKETING_DASHBOARD_TOUR_TARGETS,
} from '@/parks-industrial/constants/parks-marketing-dashboard-tour.constants';
import {
  PARKS_INVENTORY_TOUR_PAGE_COPY,
  PARKS_INVENTORY_TOUR_PATH,
} from '@/parks-industrial/constants/parks-inventory-tour.constants';
import {
  type ParksNavigationGroupKey,
  type ParksNavigationItemKey,
  PARKS_NAVIGATION_GROUPS,
  PARKS_NAVIGATION_ITEMS,
} from '@/parks-industrial/constants/parks-navigation.constants';
import { type ParksRouteAccessKey } from '@/parks-industrial/constants/parks-role-access.constants';

export type ParksGuidedTourStep = {
  id: string;
  target: string;
  kind: 'welcome' | 'tool' | 'page';
  groupKey: ParksNavigationGroupKey | null;
  itemKey: ParksNavigationItemKey | null;
  title: string;
  body: string;
  path?: string;
  inventoryFocus?: (typeof PARKS_INVENTORY_TOUR_TARGETS)[keyof typeof PARKS_INVENTORY_TOUR_TARGETS];
};

export const listVisibleParksTourItemKeys = (
  canAccessRoute: (accessKey: ParksRouteAccessKey) => boolean,
): ParksNavigationItemKey[] =>
  PARKS_NAVIGATION_GROUPS.flatMap((navigationGroup) =>
    navigationGroup.itemKeys.filter((itemKey) =>
      canAccessRoute(PARKS_NAVIGATION_ITEMS[itemKey].accessKey),
    ),
  );

export const resolveParksTourGroupKey = (
  itemKey: ParksNavigationItemKey,
): ParksNavigationGroupKey | null => {
  const navigationGroup = PARKS_NAVIGATION_GROUPS.find((group) =>
    group.itemKeys.includes(itemKey),
  );

  return navigationGroup?.groupKey ?? null;
};

export const buildParksGuidedTourSteps = ({
  canAccessRoute,
  roleLabel,
}: {
  canAccessRoute: (accessKey: ParksRouteAccessKey) => boolean;
  roleLabel: string | null;
}): ParksGuidedTourStep[] => {
  const itemKeys = listVisibleParksTourItemKeys(canAccessRoute);
  const intro =
    (roleLabel ? PARKS_GUIDED_TOUR_ROLE_INTRO[roleLabel] : undefined) ??
    PARKS_GUIDED_TOUR_DEFAULT_INTRO;
  const toolCount = itemKeys.length;

  const welcomeStep: ParksGuidedTourStep = {
    id: 'welcome',
    target: PARKS_GUIDED_TOUR_WELCOME_TARGET,
    kind: 'welcome',
    groupKey: null,
    itemKey: null,
    title: intro.title,
    body: `${intro.body} En esta sesión tienes ${toolCount} ${
      toolCount === 1 ? 'herramienta' : 'herramientas'
    }.`,
  };

  const inventoryGroupKey = resolveParksTourGroupKey('stackingPlan');
  const inventoryPageSteps: ParksGuidedTourStep[] = [
    PARKS_INVENTORY_TOUR_TARGETS.parks,
    PARKS_INVENTORY_TOUR_TARGETS.parkPipeline,
    PARKS_INVENTORY_TOUR_TARGETS.naves,
    PARKS_INVENTORY_TOUR_TARGETS.nave,
  ].map((inventoryFocus) => {
    const copy = PARKS_INVENTORY_TOUR_PAGE_COPY[inventoryFocus];

    return {
      id: inventoryFocus,
      target: inventoryFocus,
      kind: 'page' as const,
      groupKey: inventoryGroupKey,
      itemKey: 'stackingPlan' as const,
      title: copy.title,
      body: copy.body,
      path: PARKS_INVENTORY_TOUR_PATH,
      inventoryFocus,
    };
  });

  const commercialDashboardGroupKey = resolveParksTourGroupKey(
    'dashboardComercial',
  );
  const commercialDashboardPageSteps: ParksGuidedTourStep[] = [
    PARKS_COMMERCIAL_DASHBOARD_TOUR_TARGETS.hero,
    PARKS_COMMERCIAL_DASHBOARD_TOUR_TARGETS.metrics,
    PARKS_COMMERCIAL_DASHBOARD_TOUR_TARGETS.portfolio,
    PARKS_COMMERCIAL_DASHBOARD_TOUR_TARGETS.cemQueue,
    PARKS_COMMERCIAL_DASHBOARD_TOUR_TARGETS.teamPulse,
  ].map((dashboardFocus) => {
    const copy = PARKS_COMMERCIAL_DASHBOARD_TOUR_PAGE_COPY[dashboardFocus];

    return {
      id: dashboardFocus,
      target: dashboardFocus,
      kind: 'page' as const,
      groupKey: commercialDashboardGroupKey,
      itemKey: 'dashboardComercial' as const,
      title: copy.title,
      body: copy.body,
      path: PARKS_COMMERCIAL_DASHBOARD_TOUR_PATH,
    };
  });

  const marketingDashboardGroupKey = resolveParksTourGroupKey(
    'dashboardMarketing',
  );
  const marketingDashboardPageSteps: ParksGuidedTourStep[] = [
    PARKS_MARKETING_DASHBOARD_TOUR_TARGETS.metrics,
    PARKS_MARKETING_DASHBOARD_TOUR_TARGETS.channels,
    PARKS_MARKETING_DASHBOARD_TOUR_TARGETS.campaigns,
    PARKS_MARKETING_DASHBOARD_TOUR_TARGETS.leads,
  ].map((dashboardFocus) => {
    const copy = PARKS_MARKETING_DASHBOARD_TOUR_PAGE_COPY[dashboardFocus];

    return {
      id: dashboardFocus,
      target: dashboardFocus,
      kind: 'page' as const,
      groupKey: marketingDashboardGroupKey,
      itemKey: 'dashboardMarketing' as const,
      title: copy.title,
      body: copy.body,
      path: PARKS_MARKETING_DASHBOARD_TOUR_PATH,
    };
  });

  const toolSteps = itemKeys.flatMap((itemKey): ParksGuidedTourStep[] => {
    const copy = PARKS_GUIDED_TOUR_ITEM_COPY[itemKey];
    const toolStep: ParksGuidedTourStep = {
      id: itemKey,
      target: `${PARKS_GUIDED_TOUR_NAV_TARGET_PREFIX}${itemKey}`,
      kind: 'tool',
      groupKey: resolveParksTourGroupKey(itemKey),
      itemKey,
      title: copy.title,
      body: copy.body,
    };

    if (itemKey === 'stackingPlan') {
      return [toolStep, ...inventoryPageSteps];
    }

    if (itemKey === 'dashboardComercial') {
      return [toolStep, ...commercialDashboardPageSteps];
    }

    if (itemKey === 'dashboardMarketing') {
      return [toolStep, ...marketingDashboardPageSteps];
    }

    return [toolStep];
  });

  return [welcomeStep, ...toolSteps];
};

export const countParksGuidedTourTools = (steps: ParksGuidedTourStep[]): number =>
  steps.filter((step) => step.kind === 'tool').length;

export const resolveParksGuidedTourToolIndex = (
  steps: ParksGuidedTourStep[],
  stepIndex: number,
): number | null => {
  const currentStep = steps[stepIndex];

  if (!currentStep || currentStep.kind !== 'tool') {
    return null;
  }

  const toolSteps = steps.filter((step) => step.kind === 'tool');

  return toolSteps.findIndex((step) => step.id === currentStep.id) + 1;
};
