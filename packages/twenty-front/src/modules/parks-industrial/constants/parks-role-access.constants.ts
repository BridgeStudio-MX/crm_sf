import { AppPath } from 'twenty-shared/types';

import {
  PARKS_ASIGNACION_PATH,
  PARKS_BROKERS_PATH,
  PARKS_COMITE_PATH,
  PARKS_CXC_CARTERA_PATH,
  PARKS_CXC_PATH,
  PARKS_DASHBOARD_COMERCIAL_PATH,
  PARKS_LEGAL_DASHBOARD_PATH,
  PARKS_LEGAL_PIPELINE_PATH,
  PARKS_LO_CAMPO_PATH,
  PARKS_MIS_PENDIENTES_PATH,
  PARKS_VALOR_AGREGADO_PATH,
} from '@/parks-industrial/constants/parks-routes.constants';

export const PARKS_ROLE_LABEL_PREFIX = 'Parks — ' as const;

export const ParksRoleLabel = {
  AdminLegal: `${PARKS_ROLE_LABEL_PREFIX}Admin Legal`,
  DirectorLegal: `${PARKS_ROLE_LABEL_PREFIX}Director Legal`,
  SubdirectorLegal: `${PARKS_ROLE_LABEL_PREFIX}Subdirector Legal`,
  CEO: `${PARKS_ROLE_LABEL_PREFIX}CEO`,
  AbogadoAsignado: `${PARKS_ROLE_LABEL_PREFIX}Abogado asignado`,
  EjecutivoComercial: `${PARKS_ROLE_LABEL_PREFIX}Ejecutivo Comercial`,
  LoAaaSenior: `${PARKS_ROLE_LABEL_PREFIX}LO AAA Senior`,
  LoEstandar: `${PARKS_ROLE_LABEL_PREFIX}LO Estándar`,
  CxC: `${PARKS_ROLE_LABEL_PREFIX}CxC`,
  GerenteCxc: `${PARKS_ROLE_LABEL_PREFIX}Gerente CxC`,
  EjecutivoCxc: `${PARKS_ROLE_LABEL_PREFIX}Ejecutivo CxC`,
  DirectorComercial: `${PARKS_ROLE_LABEL_PREFIX}Director Comercial`,
  MiembroComite: `${PARKS_ROLE_LABEL_PREFIX}Miembro del Comité`,
  ContratosFacturacion: `${PARKS_ROLE_LABEL_PREFIX}Contratos y Facturación`,
  AdminSistema: `${PARKS_ROLE_LABEL_PREFIX}Admin Sistema`,
  AdminParque: `${PARKS_ROLE_LABEL_PREFIX}Admin Parque`,
} as const;

export type ParksRouteAccessKey =
  | 'dashboard'
  | 'dashboardComercial'
  | 'stackingPlanIndex'
  | 'stackingPlan'
  | 'pipeline'
  | 'leadsCem'
  | 'prospectos'
  | 'notificaciones'
  | 'misPendientes'
  | 'contratos'
  | 'contratoAprobacion'
  | 'legalPipeline'
  | 'legalDashboard'
  | 'cxc'
  | 'cxcCartera'
  | 'comite'
  | 'valorAgregado'
  | 'asignacion'
  | 'loCampo'
  | 'renovaciones'
  | 'reservas'
  | 'comisiones'
  | 'brokers'
  | 'miDesempeno'
  | 'inquilino360'
  | 'mapa';

const ALL_PARKS_ROLES = Object.values(ParksRoleLabel);

export const PARKS_LEASING_OFFICER_ROLE_LABELS = [
  ParksRoleLabel.EjecutivoComercial,
  ParksRoleLabel.LoAaaSenior,
  ParksRoleLabel.LoEstandar,
] as const;

export const PARKS_CXC_ROLE_LABELS = [
  ParksRoleLabel.CxC,
  ParksRoleLabel.GerenteCxc,
  ParksRoleLabel.EjecutivoCxc,
] as const;

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

const withAdminSistema = (roleLabels: readonly string[]): string[] => [
  ...roleLabels,
  ParksRoleLabel.AdminSistema,
];

export const PARKS_ROUTE_ACCESS_BY_KEY: Record<
  ParksRouteAccessKey,
  readonly string[]
> = {
  dashboard: withAdminSistema([
    ParksRoleLabel.DirectorComercial,
    ParksRoleLabel.CEO,
    ParksRoleLabel.AdminLegal,
    ParksRoleLabel.DirectorLegal,
  ]),
  dashboardComercial: withAdminSistema([
    ParksRoleLabel.CEO,
    ParksRoleLabel.DirectorComercial,
  ]),
  stackingPlanIndex: withAdminSistema([
    ...PARKS_LEASING_OFFICER_ROLE_LABELS,
    ParksRoleLabel.DirectorComercial,
    ParksRoleLabel.AdminLegal,
    ParksRoleLabel.DirectorLegal,
    ParksRoleLabel.SubdirectorLegal,
    ParksRoleLabel.AbogadoAsignado,
    ParksRoleLabel.AdminParque,
  ]),
  stackingPlan: withAdminSistema([
    ...PARKS_LEASING_OFFICER_ROLE_LABELS,
    ParksRoleLabel.DirectorComercial,
    ParksRoleLabel.AdminLegal,
    ParksRoleLabel.DirectorLegal,
    ParksRoleLabel.SubdirectorLegal,
    ParksRoleLabel.AbogadoAsignado,
    ParksRoleLabel.AdminParque,
  ]),
  pipeline: withAdminSistema([
    ...PARKS_LEASING_OFFICER_ROLE_LABELS,
    ParksRoleLabel.DirectorComercial,
    ParksRoleLabel.CEO,
  ]),
  leadsCem: withAdminSistema([ParksRoleLabel.DirectorComercial]),
  prospectos: withAdminSistema([
    ...PARKS_LEASING_OFFICER_ROLE_LABELS,
    ParksRoleLabel.DirectorComercial,
  ]),
  notificaciones: ALL_PARKS_ROLES,
  misPendientes: withAdminSistema([
    ParksRoleLabel.CEO,
    ParksRoleLabel.DirectorComercial,
    ParksRoleLabel.DirectorLegal,
    ParksRoleLabel.AdminLegal,
    ParksRoleLabel.SubdirectorLegal,
    ParksRoleLabel.MiembroComite,
  ]),
  contratos: withAdminSistema([
    ParksRoleLabel.AdminLegal,
    ParksRoleLabel.DirectorLegal,
    ParksRoleLabel.SubdirectorLegal,
    ParksRoleLabel.AbogadoAsignado,
    ParksRoleLabel.DirectorComercial,
    ...PARKS_LEASING_OFFICER_ROLE_LABELS,
    ...PARKS_CXC_ROLE_LABELS,
    ParksRoleLabel.ContratosFacturacion,
    ParksRoleLabel.AdminParque,
    ParksRoleLabel.CEO,
  ]),
  contratoAprobacion: withAdminSistema([
    ParksRoleLabel.AdminLegal,
    ParksRoleLabel.DirectorLegal,
    ParksRoleLabel.SubdirectorLegal,
    ParksRoleLabel.AbogadoAsignado,
    ParksRoleLabel.DirectorComercial,
    ...PARKS_LEASING_OFFICER_ROLE_LABELS,
    ...PARKS_CXC_ROLE_LABELS,
    ParksRoleLabel.CEO,
  ]),
  legalPipeline: withAdminSistema([
    ParksRoleLabel.AdminLegal,
    ParksRoleLabel.DirectorLegal,
    ParksRoleLabel.SubdirectorLegal,
    ParksRoleLabel.AbogadoAsignado,
  ]),
  legalDashboard: withAdminSistema([
    ParksRoleLabel.AdminLegal,
    ParksRoleLabel.DirectorLegal,
    ParksRoleLabel.SubdirectorLegal,
    ParksRoleLabel.CEO,
  ]),
  cxc: withAdminSistema([
    ...PARKS_CXC_ROLE_LABELS,
    ParksRoleLabel.CEO,
    ParksRoleLabel.DirectorComercial,
  ]),
  cxcCartera: withAdminSistema([
    ...PARKS_CXC_ROLE_LABELS,
    ParksRoleLabel.CEO,
    ParksRoleLabel.DirectorComercial,
  ]),
  comite: withAdminSistema([
    ParksRoleLabel.DirectorComercial,
    ParksRoleLabel.MiembroComite,
    ParksRoleLabel.CEO,
    ...PARKS_LEASING_OFFICER_ROLE_LABELS,
  ]),
  valorAgregado: withAdminSistema([
    ParksRoleLabel.DirectorComercial,
    ParksRoleLabel.CEO,
  ]),
  asignacion: withAdminSistema([ParksRoleLabel.DirectorComercial]),
  loCampo: withAdminSistema([
    ...PARKS_LEASING_OFFICER_ROLE_LABELS,
    ParksRoleLabel.DirectorComercial,
  ]),
  renovaciones: withAdminSistema([
    ...PARKS_LEASING_OFFICER_ROLE_LABELS,
    ParksRoleLabel.DirectorComercial,
    ParksRoleLabel.AdminLegal,
    ParksRoleLabel.DirectorLegal,
    ParksRoleLabel.SubdirectorLegal,
    ParksRoleLabel.AbogadoAsignado,
    ...PARKS_CXC_ROLE_LABELS,
    ParksRoleLabel.CEO,
  ]),
  reservas: withAdminSistema([
    ...PARKS_LEASING_OFFICER_ROLE_LABELS,
    ParksRoleLabel.DirectorComercial,
    ParksRoleLabel.AdminLegal,
    ParksRoleLabel.DirectorLegal,
  ]),
  comisiones: withAdminSistema([
    ParksRoleLabel.DirectorComercial,
    ParksRoleLabel.CEO,
    ParksRoleLabel.AdminSistema,
  ]),
  // Brokers directory is used by CEM and commercial ops when assigning deals
  brokers: withAdminSistema([
    ParksRoleLabel.DirectorComercial,
    ParksRoleLabel.CEO,
    ...PARKS_LEASING_OFFICER_ROLE_LABELS,
  ]),
  miDesempeno: withAdminSistema([...PARKS_LEASING_OFFICER_ROLE_LABELS]),
  inquilino360: withAdminSistema([
    ...PARKS_LEASING_OFFICER_ROLE_LABELS,
    ParksRoleLabel.DirectorComercial,
    ParksRoleLabel.AdminLegal,
    ParksRoleLabel.DirectorLegal,
    ParksRoleLabel.AdminParque,
    ...PARKS_CXC_ROLE_LABELS,
    ParksRoleLabel.CEO,
  ]),
  mapa: withAdminSistema([
    ...PARKS_LEASING_OFFICER_ROLE_LABELS,
    ParksRoleLabel.DirectorComercial,
    ParksRoleLabel.AdminLegal,
    ParksRoleLabel.DirectorLegal,
    ParksRoleLabel.AbogadoAsignado,
  ]),
};

export const PARKS_NAV_ROUTE_ACCESS: Array<{
  accessKey: ParksRouteAccessKey;
  to: string;
}> = [
  { accessKey: 'dashboard', to: AppPath.ParksDashboard },
  {
    accessKey: 'dashboardComercial',
    to: PARKS_DASHBOARD_COMERCIAL_PATH,
  },
  { accessKey: 'stackingPlanIndex', to: AppPath.ParksStackingPlanIndex },
  { accessKey: 'pipeline', to: AppPath.ParksPipeline },
  { accessKey: 'leadsCem', to: AppPath.ParksLeadsCem },
  { accessKey: 'prospectos', to: AppPath.ParksProspectos },
  { accessKey: 'notificaciones', to: AppPath.ParksNotificaciones },
  { accessKey: 'misPendientes', to: PARKS_MIS_PENDIENTES_PATH },
  { accessKey: 'contratos', to: AppPath.ParksContratos },
  { accessKey: 'legalPipeline', to: PARKS_LEGAL_PIPELINE_PATH },
  { accessKey: 'legalDashboard', to: PARKS_LEGAL_DASHBOARD_PATH },
  { accessKey: 'cxc', to: PARKS_CXC_PATH },
  { accessKey: 'cxcCartera', to: PARKS_CXC_CARTERA_PATH },
  { accessKey: 'comite', to: PARKS_COMITE_PATH },
  { accessKey: 'valorAgregado', to: PARKS_VALOR_AGREGADO_PATH },
  { accessKey: 'asignacion', to: PARKS_ASIGNACION_PATH },
  { accessKey: 'loCampo', to: PARKS_LO_CAMPO_PATH },
  { accessKey: 'renovaciones', to: AppPath.ParksRenovaciones },
  { accessKey: 'reservas', to: AppPath.ParksReservas },
  { accessKey: 'comisiones', to: AppPath.ParksComisiones },
  { accessKey: 'brokers', to: PARKS_BROKERS_PATH },
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
  'israel.ramirez@parksindustrial.com': ParksRoleLabel.LoAaaSenior,
  'uae@parksindustrial.com': ParksRoleLabel.LoAaaSenior,
  'bruyel@parksindustrial.com': ParksRoleLabel.LoEstandar,
  'director.financiero@parksindustrial.com': ParksRoleLabel.MiembroComite,
  'director.operaciones@parksindustrial.com': ParksRoleLabel.MiembroComite,
  'claudia.rodriguez@parksindustrial.com': ParksRoleLabel.GerenteCxc,
  'ejecutivo.cxc1@parksindustrial.com': ParksRoleLabel.EjecutivoCxc,
  'ejecutivo.cxc2@parksindustrial.com': ParksRoleLabel.EjecutivoCxc,
  'ejecutivo.cxc3@parksindustrial.com': ParksRoleLabel.EjecutivoCxc,
  'jesus.gazon@parksindustrial.com': ParksRoleLabel.ContratosFacturacion,
  'lilibeth.lopez@parksindustrial.com': ParksRoleLabel.AdminSistema,
  'admin.parque.gdl@parksindustrial.com': ParksRoleLabel.AdminParque,
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

  if (
    normalizedPath === PARKS_CXC_PATH ||
    normalizedPath.startsWith(`${PARKS_CXC_PATH}/`)
  ) {
    return 'cxc';
  }

  if (
    normalizedPath === PARKS_COMITE_PATH ||
    normalizedPath.startsWith(`${PARKS_COMITE_PATH}/`)
  ) {
    return 'comite';
  }

  if (
    normalizedPath === PARKS_VALOR_AGREGADO_PATH ||
    normalizedPath.startsWith(`${PARKS_VALOR_AGREGADO_PATH}/`)
  ) {
    return 'valorAgregado';
  }

  if (
    normalizedPath === PARKS_ASIGNACION_PATH ||
    normalizedPath.startsWith(`${PARKS_ASIGNACION_PATH}/`)
  ) {
    return 'asignacion';
  }

  if (
    normalizedPath === PARKS_LO_CAMPO_PATH ||
    normalizedPath.startsWith(`${PARKS_LO_CAMPO_PATH}/`)
  ) {
    return 'loCampo';
  }

  const exactMatch = PARKS_NAV_ROUTE_ACCESS.find(
    (routeAccess) => routeAccess.to === normalizedPath,
  );

  return exactMatch?.accessKey ?? null;
};
