export const PARKS_COMITE_MIN_GLA_M2 = 20_000;
export const PARKS_COMITE_ESTATUS_AJUSTES_PEDIDOS =
  'Ajustes pedidos — espera comercial' as const;

export const requiresParksComiteByGla = (glaM2: number): boolean =>
  Number.isFinite(glaM2) && glaM2 > PARKS_COMITE_MIN_GLA_M2;
