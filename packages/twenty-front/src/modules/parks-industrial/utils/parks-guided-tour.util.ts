import {
  PARKS_GUIDED_TOUR_DEFAULT_INTRO,
  PARKS_GUIDED_TOUR_ITEM_COPY,
  PARKS_GUIDED_TOUR_NAV_TARGET_PREFIX,
  PARKS_GUIDED_TOUR_ROLE_INTRO,
  PARKS_GUIDED_TOUR_WELCOME_TARGET,
  PARKS_INVENTORY_TOUR_TARGETS,
} from '@/parks-industrial/constants/parks-guided-tour.constants';
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
      kind: 'page',
      groupKey: inventoryGroupKey,
      itemKey: 'stackingPlan',
      title: copy.title,
      body: copy.body,
      path: PARKS_INVENTORY_TOUR_PATH,
      inventoryFocus,
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

    if (itemKey !== 'stackingPlan') {
      return [toolStep];
    }

    return [toolStep, ...inventoryPageSteps];
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
