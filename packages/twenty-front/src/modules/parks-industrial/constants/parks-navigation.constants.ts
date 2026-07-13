import { AppPath } from 'twenty-shared/types';
import {
  IconBookmark,
  IconBell,
  IconChartBar,
  IconCoins,
  IconFileText,
  IconLayoutGrid,
  IconLayoutKanban,
  IconMap,
  IconRefresh,
  IconShield,
  IconTarget,
  IconUserPlus,
  IconUsers,
  type IconComponent,
} from 'twenty-ui/icon';
import { type ThemeColor } from 'twenty-ui/theme';

import { type ParksRouteAccessKey } from '@/parks-industrial/constants/parks-role-access.constants';
import {
  PARKS_LEGAL_DASHBOARD_PATH,
  PARKS_LEGAL_PIPELINE_PATH,
} from '@/parks-industrial/constants/parks-routes.constants';

export type ParksNavigationItemKey =
  | 'dashboard'
  | 'stackingPlan'
  | 'pipeline'
  | 'leadsCem'
  | 'prospectos'
  | 'notificaciones'
  | 'contratos'
  | 'legalPipeline'
  | 'legalDashboard'
  | 'renovaciones'
  | 'reservas'
  | 'comisiones'
  | 'miDesempeno'
  | 'mapa';

export type ParksNavigationGroupKey =
  | 'overview'
  | 'commercial'
  | 'legal'
  | 'operations';

export type ParksNavigationItemDefinition = {
  accessKey: ParksRouteAccessKey;
  to: string;
  Icon: IconComponent;
  iconColor: ThemeColor;
};

export type ParksNavigationGroupDefinition = {
  id: string;
  groupKey: ParksNavigationGroupKey | null;
  itemKeys: ParksNavigationItemKey[];
};

export const PARKS_NAVIGATION_ITEMS: Record<
  ParksNavigationItemKey,
  ParksNavigationItemDefinition
> = {
  dashboard: {
    accessKey: 'dashboard',
    to: AppPath.ParksDashboard,
    Icon: IconChartBar,
    iconColor: 'green',
  },
  stackingPlan: {
    accessKey: 'stackingPlanIndex',
    to: AppPath.ParksStackingPlanIndex,
    Icon: IconLayoutGrid,
    iconColor: 'gray',
  },
  pipeline: {
    accessKey: 'pipeline',
    to: AppPath.ParksPipeline,
    Icon: IconLayoutKanban,
    iconColor: 'blue',
  },
  leadsCem: {
    accessKey: 'leadsCem',
    to: AppPath.ParksLeadsCem,
    Icon: IconUserPlus,
    iconColor: 'green',
  },
  prospectos: {
    accessKey: 'prospectos',
    to: AppPath.ParksProspectos,
    Icon: IconUsers,
    iconColor: 'turquoise',
  },
  notificaciones: {
    accessKey: 'notificaciones',
    to: AppPath.ParksNotificaciones,
    Icon: IconBell,
    iconColor: 'yellow',
  },
  contratos: {
    accessKey: 'contratos',
    to: AppPath.ParksContratos,
    Icon: IconFileText,
    iconColor: 'sky',
  },
  legalPipeline: {
    accessKey: 'legalPipeline',
    to: PARKS_LEGAL_PIPELINE_PATH,
    Icon: IconLayoutKanban,
    iconColor: 'green',
  },
  legalDashboard: {
    accessKey: 'legalDashboard',
    to: PARKS_LEGAL_DASHBOARD_PATH,
    Icon: IconShield,
    iconColor: 'green',
  },
  renovaciones: {
    accessKey: 'renovaciones',
    to: AppPath.ParksRenovaciones,
    Icon: IconRefresh,
    iconColor: 'orange',
  },
  reservas: {
    accessKey: 'reservas',
    to: AppPath.ParksReservas,
    Icon: IconBookmark,
    iconColor: 'purple',
  },
  comisiones: {
    accessKey: 'comisiones',
    to: AppPath.ParksComisiones,
    Icon: IconCoins,
    iconColor: 'yellow',
  },
  miDesempeno: {
    accessKey: 'miDesempeno',
    to: AppPath.ParksMiDesempeno,
    Icon: IconTarget,
    iconColor: 'red',
  },
  mapa: {
    accessKey: 'mapa',
    to: AppPath.ParksMapa,
    Icon: IconMap,
    iconColor: 'turquoise',
  },
};

export const PARKS_NAVIGATION_GROUPS: ParksNavigationGroupDefinition[] = [
  {
    id: 'overview',
    groupKey: null,
    itemKeys: ['dashboard'],
  },
  {
    id: 'commercial',
    groupKey: 'commercial',
    itemKeys: [
      'stackingPlan',
      'pipeline',
      'leadsCem',
      'prospectos',
      'miDesempeno',
      'comisiones',
    ],
  },
  {
    id: 'legal',
    groupKey: 'legal',
    itemKeys: ['legalPipeline', 'legalDashboard', 'contratos'],
  },
  {
    id: 'operations',
    groupKey: 'operations',
    itemKeys: ['renovaciones', 'reservas', 'mapa', 'notificaciones'],
  },
];
