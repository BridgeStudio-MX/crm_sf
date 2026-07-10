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

export const getParksInquilino360Path = (inquilinoId: string): string =>
  generatePath(PARKS_INQUILINO_360_PATH, { inquilinoId });
