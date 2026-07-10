export const PARKS_DECISOR_ROLES = [
  'DUENO_EMPRESA',
  'DIRECTOR_LOGISTICA',
  'GERENTE_OPERACIONES',
  'GERENTE_AMPLIACION',
  'BROKER_CLIENTE',
] as const;

export type ParksDecisorRol = (typeof PARKS_DECISOR_ROLES)[number];

export const PARKS_DECISOR_ROLE_LABELS: Record<ParksDecisorRol, string> = {
  DUENO_EMPRESA: 'Dueño de la empresa',
  DIRECTOR_LOGISTICA: 'Director de logística',
  GERENTE_OPERACIONES: 'Gerente de operaciones',
  GERENTE_AMPLIACION: 'Gerente de ampliación',
  BROKER_CLIENTE: 'Broker representando al cliente',
};

export const PARKS_DECISOR_MAX_COUNT = 5;
