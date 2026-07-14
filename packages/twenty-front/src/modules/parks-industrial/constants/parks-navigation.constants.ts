import { AppPath } from 'twenty-shared/types';
import {
  IconBookmark,
  IconBell,
  IconChartBar,
  IconCoins,
  IconFileText,
  IconLayoutGrid,
  IconLayoutKanban,
  IconListCheck,
  IconMap,
  IconNotes,
  IconRefresh,
  IconReportMoney,
  IconShield,
  IconSparkles,
  IconTarget,
  IconTargetArrow,
  IconUserPlus,
  IconUsers,
  type IconComponent,
} from 'twenty-ui/icon';
import { type ThemeColor } from 'twenty-ui/theme';

import { type ParksRouteAccessKey } from '@/parks-industrial/constants/parks-role-access.constants';
import {
  PARKS_COMITE_PATH,
  PARKS_CXC_PATH,
  PARKS_DASHBOARD_COMERCIAL_PATH,
  PARKS_LEGAL_DASHBOARD_PATH,
  PARKS_LEGAL_PIPELINE_PATH,
  PARKS_LO_CAMPO_PATH,
  PARKS_MIS_PENDIENTES_PATH,
  PARKS_VALOR_AGREGADO_PATH,
  PARKS_ASIGNACION_PATH,
} from '@/parks-industrial/constants/parks-routes.constants';

export type ParksNavigationItemKey =
  | 'dashboard'
  | 'dashboardComercial'
  | 'stackingPlan'
  | 'pipeline'
  | 'leadsCem'
  | 'prospectos'
  | 'notificaciones'
  | 'misPendientes'
  | 'contratos'
  | 'legalPipeline'
  | 'legalDashboard'
  | 'cxc'
  | 'comite'
  | 'valorAgregado'
  | 'asignacion'
  | 'loCampo'
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
  dashboardComercial: {
    accessKey: 'dashboardComercial',
    to: PARKS_DASHBOARD_COMERCIAL_PATH,
    Icon: IconLayoutKanban,
    iconColor: 'blue',
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
  misPendientes: {
    accessKey: 'misPendientes',
    to: PARKS_MIS_PENDIENTES_PATH,
    Icon: IconListCheck,
    iconColor: 'orange',
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
  cxc: {
    accessKey: 'cxc',
    to: PARKS_CXC_PATH,
    Icon: IconReportMoney,
    iconColor: 'orange',
  },
  comite: {
    accessKey: 'comite',
    to: PARKS_COMITE_PATH,
    Icon: IconShield,
    iconColor: 'blue',
  },
  valorAgregado: {
    accessKey: 'valorAgregado',
    to: PARKS_VALOR_AGREGADO_PATH,
    Icon: IconSparkles,
    iconColor: 'purple',
  },
  asignacion: {
    accessKey: 'asignacion',
    to: PARKS_ASIGNACION_PATH,
    Icon: IconTargetArrow,
    iconColor: 'red',
  },
  loCampo: {
    accessKey: 'loCampo',
    to: PARKS_LO_CAMPO_PATH,
    Icon: IconNotes,
    iconColor: 'blue',
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
    itemKeys: [
      'dashboard',
      'misPendientes',
      'dashboardComercial',
      'legalDashboard',
    ],
  },
  {
    id: 'commercial',
    groupKey: 'commercial',
    itemKeys: [
      'stackingPlan',
      'pipeline',
      'comite',
      'valorAgregado',
      'loCampo',
      'mapa',
      'leadsCem',
      'asignacion',
      'prospectos',
      'miDesempeno',
      'comisiones',
    ],
  },
  {
    id: 'legal',
    groupKey: 'legal',
    itemKeys: ['legalPipeline', 'contratos'],
  },
  {
    id: 'operations',
    groupKey: 'operations',
    itemKeys: ['cxc', 'renovaciones', 'reservas', 'notificaciones'],
  },
];
