import { generatePath } from 'react-router-dom';
import { AppPath } from 'twenty-shared/types';

const resolveParksPath = (
  appPathValue: string | undefined,
  fallback: string,
): string => appPathValue ?? fallback;

export const PARKS_LEADS_CEM_PATH = resolveParksPath(
  AppPath.ParksLeadsCem,
  '/parks/leads-cem',
);

export const PARKS_INQUILINO_360_PATH = resolveParksPath(
  AppPath.ParksInquilino360,
  '/parks/inquilinos/:inquilinoId',
);

export const PARKS_RENOVACIONES_PATH = resolveParksPath(
  AppPath.ParksRenovaciones,
  '/parks/renovaciones',
);

export const PARKS_RESERVAS_PATH = resolveParksPath(
  AppPath.ParksReservas,
  '/parks/reservas',
);

export const PARKS_LEGAL_PIPELINE_PATH = resolveParksPath(
  AppPath.ParksLegalPipeline,
  '/parks/legal-pipeline',
);

export const PARKS_LEGAL_DASHBOARD_PATH = resolveParksPath(
  AppPath.ParksLegalDashboard,
  '/parks/legal-dashboard',
);

export const PARKS_CXC_PATH = resolveParksPath(AppPath.ParksCxc, '/parks/cxc');

export const PARKS_CXC_CARTERA_PATH = resolveParksPath(
  AppPath.ParksCxcCartera,
  '/parks/cxc/cartera',
);

export const PARKS_NOTIFICACIONES_PATH = resolveParksPath(
  AppPath.ParksNotificaciones,
  '/parks/notificaciones',
);
export const PARKS_COMITE_PATH = resolveParksPath(
  AppPath.ParksComite,
  '/parks/comite',
);

export const PARKS_COMITE_DETAIL_PATH = resolveParksPath(
  AppPath.ParksComiteDetail,
  '/parks/comite/:comiteId',
);

export const getParksComiteDetailPath = (comiteId: string): string =>
  generatePath(PARKS_COMITE_DETAIL_PATH, { comiteId });

export const PARKS_VALOR_AGREGADO_PATH = resolveParksPath(
  AppPath.ParksValorAgregado,
  '/parks/valor-agregado',
);

export const PARKS_ASIGNACION_PATH = resolveParksPath(
  AppPath.ParksAsignacion,
  '/parks/asignacion',
);

export const PARKS_LO_CAMPO_PATH = resolveParksPath(
  AppPath.ParksLoCampo,
  '/parks/campo',
);

export const PARKS_MIS_PENDIENTES_PATH = resolveParksPath(
  AppPath.ParksMisPendientes,
  '/parks/mis-pendientes',
);

export const PARKS_DASHBOARD_COMERCIAL_PATH = resolveParksPath(
  AppPath.ParksDashboardComercial,
  '/parks/dashboard-comercial',
);

export const PARKS_BROKERS_PATH = resolveParksPath(
  AppPath.ParksBrokers,
  '/parks/brokers',
);

export const getParksInquilino360Path = (inquilinoId: string): string =>
  generatePath(PARKS_INQUILINO_360_PATH, { inquilinoId });
