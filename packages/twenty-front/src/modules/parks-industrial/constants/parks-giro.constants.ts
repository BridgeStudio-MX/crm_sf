// Coarse giro options that match live Twenty SELECT enums for
// opportunity.giroEmpresa and inquilino.sector (until setup syncs a wider catalog).
export const PARKS_GIRO_INQUILINO_OPTIONS = [
  'Manufactura',
  'Logística',
  'Distribución',
  'E-commerce',
  'Farmacéutica',
  'Automotriz',
  'Otro',
] as const;

export type ParksGiroInquilinoOption =
  (typeof PARKS_GIRO_INQUILINO_OPTIONS)[number];
