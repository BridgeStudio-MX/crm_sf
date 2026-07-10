export const DECISOR_CLIENTE_ROLES = [
  'DUENO_EMPRESA',
  'DIRECTOR_LOGISTICA',
  'GERENTE_OPERACIONES',
  'GERENTE_AMPLIACION',
  'BROKER_CLIENTE',
] as const;

export type DecisorClienteRol = (typeof DECISOR_CLIENTE_ROLES)[number];

export const DECISOR_CLIENTE_ROLE_LABELS: Record<DecisorClienteRol, string> = {
  DUENO_EMPRESA: 'Dueño de la empresa',
  DIRECTOR_LOGISTICA: 'Director de logística',
  GERENTE_OPERACIONES: 'Gerente de operaciones',
  GERENTE_AMPLIACION: 'Gerente de ampliación',
  BROKER_CLIENTE: 'Broker representando al cliente',
};

export const DECISOR_CLIENTE_MIN_COUNT = 0;
export const DECISOR_CLIENTE_MAX_COUNT = 5;
