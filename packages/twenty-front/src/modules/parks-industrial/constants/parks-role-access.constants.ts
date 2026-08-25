import { AppPath } from 'twenty-shared/types';

import {
  PARKS_DEMO_EMAIL,
  PARKS_DEMO_EMAIL_ALIASES,
} from '@/parks-industrial/constants/parks-demo-logins.constants';
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
  Cfo: `${PARKS_ROLE_LABEL_PREFIX}CFO`,
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

export const PARKS_CXC_MANAGER_ROLE_LABELS = [
  ParksRoleLabel.CxC,
  ParksRoleLabel.GerenteCxc,
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

// Who can open the URL. Pages stay in the app — restore access by adding
// the role here. CEO keeps drill-downs from the command center even when
// those items are hidden from the sidebar.
export const PARKS_ROUTE_ACCESS_BY_KEY: Record<
  ParksRouteAccessKey,
  readonly string[]
> = {
  dashboard: withAdminSistema([ParksRoleLabel.CEO, ParksRoleLabel.Cfo]),
  dashboardComercial: withAdminSistema([
    ParksRoleLabel.CEO,
    ParksRoleLabel.DirectorComercial,
  ]),
  stackingPlanIndex: withAdminSistema([
    ...PARKS_LEASING_OFFICER_ROLE_LABELS,
    ParksRoleLabel.DirectorComercial,
    ParksRoleLabel.CEO,
    ParksRoleLabel.AdminParque,
  ]),
  stackingPlan: withAdminSistema([
    ...PARKS_LEASING_OFFICER_ROLE_LABELS,
    ParksRoleLabel.DirectorComercial,
    ParksRoleLabel.CEO,
    ParksRoleLabel.AdminParque,
  ]),
  pipeline: withAdminSistema([
    ...PARKS_LEASING_OFFICER_ROLE_LABELS,
    ParksRoleLabel.DirectorComercial,
  ]),
  leadsCem: withAdminSistema([ParksRoleLabel.DirectorComercial]),
  prospectos: withAdminSistema([]),
  notificaciones: ALL_PARKS_ROLES,
  misPendientes: withAdminSistema([
    ParksRoleLabel.CEO,
    ParksRoleLabel.DirectorComercial,
    ParksRoleLabel.DirectorLegal,
    ParksRoleLabel.AdminLegal,
    ParksRoleLabel.SubdirectorLegal,
    ParksRoleLabel.MiembroComite,
    ParksRoleLabel.Cfo,
  ]),
  contratos: withAdminSistema([
    ParksRoleLabel.AdminLegal,
    ParksRoleLabel.DirectorLegal,
    ParksRoleLabel.SubdirectorLegal,
    ParksRoleLabel.AbogadoAsignado,
    ParksRoleLabel.ContratosFacturacion,
    ParksRoleLabel.CEO,
  ]),
  contratoAprobacion: withAdminSistema([
    ParksRoleLabel.AdminLegal,
    ParksRoleLabel.DirectorLegal,
    ParksRoleLabel.SubdirectorLegal,
    ParksRoleLabel.AbogadoAsignado,
    ParksRoleLabel.DirectorComercial,
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
    ...PARKS_CXC_MANAGER_ROLE_LABELS,
    ParksRoleLabel.CEO,
    ParksRoleLabel.Cfo,
  ]),
  cxcCartera: withAdminSistema([
    ...PARKS_CXC_ROLE_LABELS,
    ParksRoleLabel.Cfo,
  ]),
  comite: withAdminSistema([
    ParksRoleLabel.MiembroComite,
    ParksRoleLabel.Cfo,
    ParksRoleLabel.CEO,
    ...PARKS_LEASING_OFFICER_ROLE_LABELS,
  ]),
  valorAgregado: [],
  asignacion: withAdminSistema([ParksRoleLabel.DirectorComercial]),
  loCampo: withAdminSistema([...PARKS_LEASING_OFFICER_ROLE_LABELS]),
  renovaciones: withAdminSistema([
    ParksRoleLabel.DirectorComercial,
    ...PARKS_CXC_MANAGER_ROLE_LABELS,
    ParksRoleLabel.CEO,
    ParksRoleLabel.Cfo,
  ]),
  reservas: withAdminSistema([
    ...PARKS_LEASING_OFFICER_ROLE_LABELS,
    ParksRoleLabel.DirectorComercial,
  ]),
  comisiones: withAdminSistema([
    ParksRoleLabel.DirectorComercial,
    ParksRoleLabel.CEO,
  ]),
  brokers: withAdminSistema([ParksRoleLabel.DirectorComercial]),
  miDesempeno: withAdminSistema([...PARKS_LEASING_OFFICER_ROLE_LABELS]),
  inquilino360: withAdminSistema([
    ...PARKS_LEASING_OFFICER_ROLE_LABELS,
    ParksRoleLabel.DirectorComercial,
    ParksRoleLabel.AdminLegal,
    ParksRoleLabel.DirectorLegal,
    ParksRoleLabel.AdminParque,
    ...PARKS_CXC_ROLE_LABELS,
    ParksRoleLabel.CEO,
    ParksRoleLabel.Cfo,
  ]),
  mapa: withAdminSistema([ParksRoleLabel.AdminParque]),
};

// Who sees the item in the Parks sidebar and guided tour. Restore a menu
// item by adding the role here (and to PARKS_ROUTE_ACCESS_BY_KEY if needed).
export const PARKS_NAV_ACCESS_BY_KEY: Record<
  ParksRouteAccessKey,
  readonly string[]
> = {
  dashboard: withAdminSistema([ParksRoleLabel.CEO, ParksRoleLabel.Cfo]),
  dashboardComercial: withAdminSistema([ParksRoleLabel.DirectorComercial]),
  stackingPlanIndex: withAdminSistema([
    ...PARKS_LEASING_OFFICER_ROLE_LABELS,
    ParksRoleLabel.DirectorComercial,
    ParksRoleLabel.CEO,
    ParksRoleLabel.AdminParque,
  ]),
  stackingPlan: withAdminSistema([
    ...PARKS_LEASING_OFFICER_ROLE_LABELS,
    ParksRoleLabel.DirectorComercial,
    ParksRoleLabel.CEO,
    ParksRoleLabel.AdminParque,
  ]),
  pipeline: withAdminSistema([
    ...PARKS_LEASING_OFFICER_ROLE_LABELS,
    ParksRoleLabel.DirectorComercial,
  ]),
  leadsCem: withAdminSistema([]),
  prospectos: withAdminSistema([]),
  notificaciones: ALL_PARKS_ROLES,
  misPendientes: withAdminSistema([
    ParksRoleLabel.CEO,
    ParksRoleLabel.DirectorComercial,
    ParksRoleLabel.DirectorLegal,
    ParksRoleLabel.AdminLegal,
    ParksRoleLabel.SubdirectorLegal,
    ParksRoleLabel.MiembroComite,
    ParksRoleLabel.Cfo,
  ]),
  contratos: withAdminSistema([
    ParksRoleLabel.AdminLegal,
    ParksRoleLabel.DirectorLegal,
    ParksRoleLabel.SubdirectorLegal,
    ParksRoleLabel.AbogadoAsignado,
    ParksRoleLabel.ContratosFacturacion,
  ]),
  contratoAprobacion: [],
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
  ]),
  cxc: withAdminSistema([
    ...PARKS_CXC_MANAGER_ROLE_LABELS,
    ParksRoleLabel.Cfo,
  ]),
  cxcCartera: withAdminSistema([
    ...PARKS_CXC_ROLE_LABELS,
    ParksRoleLabel.Cfo,
  ]),
  comite: withAdminSistema([
    ParksRoleLabel.MiembroComite,
    ParksRoleLabel.Cfo,
    ParksRoleLabel.CEO,
    ...PARKS_LEASING_OFFICER_ROLE_LABELS,
  ]),
  valorAgregado: [],
  asignacion: withAdminSistema([ParksRoleLabel.DirectorComercial]),
  loCampo: withAdminSistema([...PARKS_LEASING_OFFICER_ROLE_LABELS]),
  renovaciones: withAdminSistema([
    ParksRoleLabel.DirectorComercial,
    ...PARKS_CXC_MANAGER_ROLE_LABELS,
    ParksRoleLabel.Cfo,
  ]),
  reservas: withAdminSistema([...PARKS_LEASING_OFFICER_ROLE_LABELS]),
  comisiones: withAdminSistema([
    ParksRoleLabel.DirectorComercial,
    ParksRoleLabel.CEO,
  ]),
  brokers: withAdminSistema([ParksRoleLabel.DirectorComercial]),
  miDesempeno: withAdminSistema([...PARKS_LEASING_OFFICER_ROLE_LABELS]),
  inquilino360: [],
  mapa: withAdminSistema([ParksRoleLabel.AdminParque]),
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

// Preferred first screen for demos — not the generic nav order.
export const PARKS_ROLE_HOME_PATH: Partial<Record<string, string>> = {
  [ParksRoleLabel.CEO]: AppPath.ParksDashboard,
  [ParksRoleLabel.DirectorComercial]: PARKS_DASHBOARD_COMERCIAL_PATH,
  [ParksRoleLabel.EjecutivoComercial]: AppPath.ParksPipeline,
  [ParksRoleLabel.LoAaaSenior]: AppPath.ParksPipeline,
  [ParksRoleLabel.LoEstandar]: AppPath.ParksPipeline,
  [ParksRoleLabel.CxC]: PARKS_CXC_PATH,
  [ParksRoleLabel.GerenteCxc]: PARKS_CXC_PATH,
  [ParksRoleLabel.EjecutivoCxc]: PARKS_CXC_CARTERA_PATH,
  [ParksRoleLabel.AdminLegal]: PARKS_LEGAL_DASHBOARD_PATH,
  [ParksRoleLabel.DirectorLegal]: PARKS_LEGAL_DASHBOARD_PATH,
  [ParksRoleLabel.SubdirectorLegal]: PARKS_LEGAL_DASHBOARD_PATH,
  [ParksRoleLabel.AbogadoAsignado]: PARKS_LEGAL_PIPELINE_PATH,
  [ParksRoleLabel.Cfo]: AppPath.ParksDashboard,
  [ParksRoleLabel.MiembroComite]: PARKS_COMITE_PATH,
  [ParksRoleLabel.AdminSistema]: AppPath.ParksDashboard,
  [ParksRoleLabel.ContratosFacturacion]: AppPath.ParksContratos,
  [ParksRoleLabel.AdminParque]: AppPath.ParksMapa,
};

const PARKS_DEMO_CANONICAL_EMAIL_TO_ROLE_LABEL: Record<string, string> = {
  [PARKS_DEMO_EMAIL.ceo]: ParksRoleLabel.CEO,
  [PARKS_DEMO_EMAIL.directorComercial]: ParksRoleLabel.DirectorComercial,
  [PARKS_DEMO_EMAIL.adminLegal]: ParksRoleLabel.AdminLegal,
  [PARKS_DEMO_EMAIL.directorLegal]: ParksRoleLabel.DirectorLegal,
  [PARKS_DEMO_EMAIL.subdirectorLegal]: ParksRoleLabel.SubdirectorLegal,
  [PARKS_DEMO_EMAIL.abogadoAsignado]: ParksRoleLabel.AbogadoAsignado,
  [PARKS_DEMO_EMAIL.loAaaIsrael]: ParksRoleLabel.LoAaaSenior,
  [PARKS_DEMO_EMAIL.loAaaUae]: ParksRoleLabel.LoAaaSenior,
  [PARKS_DEMO_EMAIL.loEstandar]: ParksRoleLabel.LoEstandar,
  [PARKS_DEMO_EMAIL.ejecutivoComercial]: ParksRoleLabel.EjecutivoComercial,
  [PARKS_DEMO_EMAIL.cfo]: ParksRoleLabel.Cfo,
  [PARKS_DEMO_EMAIL.directorOperaciones]: ParksRoleLabel.MiembroComite,
  [PARKS_DEMO_EMAIL.gerenteCxc]: ParksRoleLabel.GerenteCxc,
  [PARKS_DEMO_EMAIL.ejecutivoCxc1]: ParksRoleLabel.EjecutivoCxc,
  [PARKS_DEMO_EMAIL.ejecutivoCxc2]: ParksRoleLabel.EjecutivoCxc,
  [PARKS_DEMO_EMAIL.ejecutivoCxc3]: ParksRoleLabel.EjecutivoCxc,
  [PARKS_DEMO_EMAIL.contratosFacturacion]: ParksRoleLabel.ContratosFacturacion,
  [PARKS_DEMO_EMAIL.adminSistema]: ParksRoleLabel.AdminSistema,
  [PARKS_DEMO_EMAIL.adminParque]: ParksRoleLabel.AdminParque,
};

export const PARKS_DEMO_EMAIL_TO_ROLE_LABEL: Record<string, string> = {
  ...PARKS_DEMO_CANONICAL_EMAIL_TO_ROLE_LABEL,
  ...Object.fromEntries(
    Object.entries(PARKS_DEMO_EMAIL_ALIASES).flatMap(([alias, canonical]) => {
      const roleLabel = PARKS_DEMO_CANONICAL_EMAIL_TO_ROLE_LABEL[canonical];

      return roleLabel ? [[alias, roleLabel]] : [];
    }),
  ),
  'tim@apple.dev': ParksRoleLabel.EjecutivoComercial,
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
