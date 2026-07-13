import { AppPath } from 'twenty-shared/types';

import {
  PARKS_LEGAL_DASHBOARD_PATH,
  PARKS_LEGAL_PIPELINE_PATH,
} from '@/parks-industrial/constants/parks-routes.constants';

export const PARKS_ROLE_LABEL_PREFIX = 'Parks — ' as const;

export const ParksRoleLabel = {
  AdminLegal: `${PARKS_ROLE_LABEL_PREFIX}Admin Legal`,
  DirectorLegal: `${PARKS_ROLE_LABEL_PREFIX}Director Legal`,
  SubdirectorLegal: `${PARKS_ROLE_LABEL_PREFIX}Subdirector Legal`,
  CEO: `${PARKS_ROLE_LABEL_PREFIX}CEO`,
  AbogadoAsignado: `${PARKS_ROLE_LABEL_PREFIX}Abogado asignado`,
  EjecutivoComercial: `${PARKS_ROLE_LABEL_PREFIX}Ejecutivo Comercial`,
  CxC: `${PARKS_ROLE_LABEL_PREFIX}CxC`,
  DirectorComercial: `${PARKS_ROLE_LABEL_PREFIX}Director Comercial`,
} as const;

export type ParksRouteAccessKey =
  | 'dashboard'
  | 'stackingPlanIndex'
  | 'stackingPlan'
  | 'pipeline'
  | 'leadsCem'
  | 'prospectos'
  | 'notificaciones'
  | 'contratos'
  | 'contratoAprobacion'
  | 'legalPipeline'
  | 'legalDashboard'
  | 'renovaciones'
  | 'reservas'
  | 'comisiones'
  | 'miDesempeno'
  | 'inquilino360'
  | 'mapa';

const ALL_PARKS_ROLES = Object.values(ParksRoleLabel);

export const PARKS_LEGAL_EDITOR_ROLE_LABELS = [
  ParksRoleLabel.AdminLegal,
  ParksRoleLabel.DirectorLegal,
  ParksRoleLabel.SubdirectorLegal,
  ParksRoleLabel.AbogadoAsignado,
] as const;

export const PARKS_LEGAL_ASSIGN_LAWYER_ROLE_LABELS = [
  ParksRoleLabel.AdminLegal,
  ParksRoleLabel.DirectorLegal,
  ParksRoleLabel.SubdirectorLegal,
] as const;

export const PARKS_ROUTE_ACCESS_BY_KEY: Record<
  ParksRouteAccessKey,
  readonly string[]
> = {
  dashboard: [
    ParksRoleLabel.DirectorComercial,
    ParksRoleLabel.CEO,
    ParksRoleLabel.AdminLegal,
    ParksRoleLabel.DirectorLegal,
  ],
  stackingPlanIndex: [
    ParksRoleLabel.EjecutivoComercial,
    ParksRoleLabel.DirectorComercial,
    ParksRoleLabel.AdminLegal,
    ParksRoleLabel.DirectorLegal,
    ParksRoleLabel.SubdirectorLegal,
    ParksRoleLabel.AbogadoAsignado,
  ],
  stackingPlan: [
    ParksRoleLabel.EjecutivoComercial,
    ParksRoleLabel.DirectorComercial,
    ParksRoleLabel.AdminLegal,
    ParksRoleLabel.DirectorLegal,
    ParksRoleLabel.SubdirectorLegal,
    ParksRoleLabel.AbogadoAsignado,
  ],
  pipeline: [
    ParksRoleLabel.EjecutivoComercial,
    ParksRoleLabel.DirectorComercial,
  ],
  leadsCem: [ParksRoleLabel.DirectorComercial],
  prospectos: [
    ParksRoleLabel.EjecutivoComercial,
    ParksRoleLabel.DirectorComercial,
  ],
  notificaciones: ALL_PARKS_ROLES,
  contratos: [
    ParksRoleLabel.AdminLegal,
    ParksRoleLabel.DirectorLegal,
    ParksRoleLabel.SubdirectorLegal,
    ParksRoleLabel.AbogadoAsignado,
    ParksRoleLabel.DirectorComercial,
    ParksRoleLabel.EjecutivoComercial,
    ParksRoleLabel.CxC,
    ParksRoleLabel.CEO,
  ],
  contratoAprobacion: [
    ParksRoleLabel.AdminLegal,
    ParksRoleLabel.DirectorLegal,
    ParksRoleLabel.SubdirectorLegal,
    ParksRoleLabel.AbogadoAsignado,
    ParksRoleLabel.DirectorComercial,
    ParksRoleLabel.EjecutivoComercial,
    ParksRoleLabel.CxC,
    ParksRoleLabel.CEO,
  ],
  legalPipeline: [
    ParksRoleLabel.AdminLegal,
    ParksRoleLabel.DirectorLegal,
    ParksRoleLabel.SubdirectorLegal,
    ParksRoleLabel.AbogadoAsignado,
  ],
  legalDashboard: [
    ParksRoleLabel.AdminLegal,
    ParksRoleLabel.DirectorLegal,
    ParksRoleLabel.CEO,
  ],
  renovaciones: [
    ParksRoleLabel.EjecutivoComercial,
    ParksRoleLabel.DirectorComercial,
    ParksRoleLabel.AdminLegal,
    ParksRoleLabel.DirectorLegal,
    ParksRoleLabel.SubdirectorLegal,
    ParksRoleLabel.AbogadoAsignado,
    ParksRoleLabel.CxC,
    ParksRoleLabel.CEO,
  ],
  reservas: [
    ParksRoleLabel.EjecutivoComercial,
    ParksRoleLabel.DirectorComercial,
    ParksRoleLabel.AdminLegal,
    ParksRoleLabel.DirectorLegal,
  ],
  comisiones: [ParksRoleLabel.DirectorComercial],
  miDesempeno: [ParksRoleLabel.EjecutivoComercial],
  inquilino360: [
    ParksRoleLabel.EjecutivoComercial,
    ParksRoleLabel.DirectorComercial,
    ParksRoleLabel.AdminLegal,
    ParksRoleLabel.DirectorLegal,
  ],
  mapa: [
    ParksRoleLabel.EjecutivoComercial,
    ParksRoleLabel.DirectorComercial,
    ParksRoleLabel.AdminLegal,
    ParksRoleLabel.DirectorLegal,
    ParksRoleLabel.AbogadoAsignado,
  ],
};

export const PARKS_NAV_ROUTE_ACCESS: Array<{
  accessKey: ParksRouteAccessKey;
  to: string;
}> = [
  { accessKey: 'dashboard', to: AppPath.ParksDashboard },
  { accessKey: 'stackingPlanIndex', to: AppPath.ParksStackingPlanIndex },
  { accessKey: 'pipeline', to: AppPath.ParksPipeline },
  { accessKey: 'leadsCem', to: AppPath.ParksLeadsCem },
  { accessKey: 'prospectos', to: AppPath.ParksProspectos },
  { accessKey: 'notificaciones', to: AppPath.ParksNotificaciones },
  { accessKey: 'contratos', to: AppPath.ParksContratos },
  { accessKey: 'legalPipeline', to: PARKS_LEGAL_PIPELINE_PATH },
  { accessKey: 'legalDashboard', to: PARKS_LEGAL_DASHBOARD_PATH },
  { accessKey: 'renovaciones', to: AppPath.ParksRenovaciones },
  { accessKey: 'reservas', to: AppPath.ParksReservas },
  { accessKey: 'comisiones', to: AppPath.ParksComisiones },
  { accessKey: 'miDesempeno', to: AppPath.ParksMiDesempeno },
  { accessKey: 'mapa', to: AppPath.ParksMapa },
];

export const PARKS_DEMO_EMAIL_TO_ROLE_LABEL: Record<string, string> = {
  'jane.austen@apple.dev': ParksRoleLabel.AdminLegal,
  'roberto.salinas@apple.dev': ParksRoleLabel.DirectorLegal,
  'patricia.nunez@apple.dev': ParksRoleLabel.SubdirectorLegal,
  'jony.ive@apple.dev': ParksRoleLabel.CEO,
  'miguel.soto@apple.dev': ParksRoleLabel.AbogadoAsignado,
  'tim@apple.dev': ParksRoleLabel.EjecutivoComercial,
  'scott.forstall@apple.dev': ParksRoleLabel.CxC,
  'phil.schiler@apple.dev': ParksRoleLabel.DirectorComercial,
};

export const formatParksRoleLabelForDisplay = (roleLabel: string): string =>
  roleLabel.startsWith(PARKS_ROLE_LABEL_PREFIX)
    ? roleLabel.slice(PARKS_ROLE_LABEL_PREFIX.length)
    : roleLabel;

export const normalizeParksPathname = (pathname: string): string =>
  pathname.replace(/\/+$/, '') || '/';

export const resolveParksRouteAccessKey = (
  pathname: string,
): ParksRouteAccessKey | null => {
  const normalizedPath = normalizeParksPathname(pathname);

  if (
    normalizedPath.includes('/parks/contratos/') &&
    normalizedPath.endsWith('/aprobacion')
  ) {
    return 'contratoAprobacion';
  }

  if (normalizedPath.startsWith('/parks/inquilinos/')) {
    return 'inquilino360';
  }

  if (normalizedPath.startsWith('/parks/parque/')) {
    return 'stackingPlan';
  }

  if (
    normalizedPath === PARKS_LEGAL_PIPELINE_PATH ||
    normalizedPath.startsWith(`${PARKS_LEGAL_PIPELINE_PATH}/`)
  ) {
    return 'legalPipeline';
  }

  if (
    normalizedPath === PARKS_LEGAL_DASHBOARD_PATH ||
    normalizedPath.startsWith(`${PARKS_LEGAL_DASHBOARD_PATH}/`)
  ) {
    return 'legalDashboard';
  }

  const exactMatch = PARKS_NAV_ROUTE_ACCESS.find(
    (routeAccess) => routeAccess.to === normalizedPath,
  );

  return exactMatch?.accessKey ?? null;
};
