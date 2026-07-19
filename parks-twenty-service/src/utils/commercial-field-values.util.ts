import { toSelectValue } from './select-value.util';

// Maps US-001 channel labels to values accepted by legacy workspace metadata
const LEGACY_CANAL_LABEL_BY_INPUT: Record<string, string> = {
  'Página web': 'Digital',
  LinkedIn: 'Digital',
  'Call Center': 'Directo',
  CEM: 'Directo',
  Recomendación: 'Referido',
  Evento: 'Directo',
  Otro: 'Directo',
  Directo: 'Directo',
  'Cliente existente': 'Directo',
  Digital: 'Digital',
  Referido: 'Referido',
};

// Inquilino.sector is a coarse SELECT; opportunity.giroEmpresa is the detailed catalog.
const INQUILINO_SECTOR_OPTIONS = [
  'Manufactura',
  'Logística',
  'Distribución',
  'E-commerce',
  'Farmacéutica',
  'Automotriz',
  'Tecnología',
  'Otro',
] as const;

const GIRO_TO_INQUILINO_SECTOR: Record<string, string> = {
  Manufactura: 'Manufactura',
  'Manufactura General': 'Manufactura',
  Aeroespacial: 'Manufactura',
  'Alimentos y Bebidas': 'Manufactura',
  'Textil y Calzado': 'Manufactura',
  Metalmecánica: 'Manufactura',
  'Plásticos y Empaque': 'Manufactura',
  'Muebles y Madera': 'Manufactura',
  Química: 'Manufactura',
  Logística: 'Logística',
  'Logística y Distribución': 'Logística',
  'Almacenamiento / Self-storage': 'Logística',
  Distribución: 'Distribución',
  'Retail / Comercio': 'Distribución',
  'E-commerce': 'E-commerce',
  E_COMMERCE: 'E-commerce',
  Farmacéutica: 'Farmacéutica',
  'Farmacéutica / Dispositivos Médicos': 'Farmacéutica',
  Automotriz: 'Automotriz',
  'Automotriz / Autopartes': 'Automotriz',
  Tecnología: 'Tecnología',
  'Electrónica y Tecnología': 'Tecnología',
  Otro: 'Otro',
};

const resolveKnownInquilinoSectorLabel = (giroEmpresa: string): string => {
  const trimmedGiro = giroEmpresa.trim();

  if (!trimmedGiro) {
    return 'Otro';
  }

  const directMatch = GIRO_TO_INQUILINO_SECTOR[trimmedGiro];

  if (directMatch) {
    return directMatch;
  }

  const normalizedGiro = toSelectValue(trimmedGiro);

  for (const sectorOption of INQUILINO_SECTOR_OPTIONS) {
    if (toSelectValue(sectorOption) === normalizedGiro) {
      return sectorOption;
    }
  }

  for (const [giroLabel, sectorLabel] of Object.entries(
    GIRO_TO_INQUILINO_SECTOR,
  )) {
    if (toSelectValue(giroLabel) === normalizedGiro) {
      return sectorLabel;
    }
  }

  if (normalizedGiro.includes('LOGISTIC')) {
    return 'Logística';
  }

  if (normalizedGiro.includes('DISTRIBUC')) {
    return 'Distribución';
  }

  if (
    normalizedGiro.includes('MANUFACT') ||
    normalizedGiro.includes('METAL') ||
    normalizedGiro.includes('ALIMENT') ||
    normalizedGiro.includes('QUIMIC') ||
    normalizedGiro.includes('TEXTIL') ||
    normalizedGiro.includes('PLASTIC') ||
    normalizedGiro.includes('AEROESPAC')
  ) {
    return 'Manufactura';
  }

  if (
    normalizedGiro.includes('TECNOLOG') ||
    normalizedGiro.includes('ELECTRON')
  ) {
    return 'Tecnología';
  }

  if (
    normalizedGiro.includes('AUTOMOTRIZ') ||
    normalizedGiro.includes('AUTOPART')
  ) {
    return 'Automotriz';
  }

  if (
    normalizedGiro.includes('FARMAC') ||
    normalizedGiro.includes('MEDIC')
  ) {
    return 'Farmacéutica';
  }

  if (
    normalizedGiro.includes('E_COMMERCE') ||
    normalizedGiro.includes('ECOMMERCE') ||
    normalizedGiro.includes('COMMERCE')
  ) {
    return 'E-commerce';
  }

  return 'Otro';
};

export const resolveCanalOrigenStorageValue = (canalOrigen: string): string => {
  const trimmedCanal = canalOrigen.trim();
  const legacyLabel = LEGACY_CANAL_LABEL_BY_INPUT[trimmedCanal] ?? trimmedCanal;

  return toSelectValue(legacyLabel);
};

export const resolveInquilinoSectorStorageValue = (
  giroEmpresa: string,
): string => toSelectValue(resolveKnownInquilinoSectorLabel(giroEmpresa));

// Live workspace still has the coarse opportunity.giroEmpresa enum
// (no Tecnología / detailed giros until setup:opportunity syncs).
export const resolveGiroEmpresaStorageValue = (
  giroEmpresa: string,
): string => {
  const sectorLabel = resolveKnownInquilinoSectorLabel(giroEmpresa);

  if (sectorLabel === 'Tecnología') {
    return toSelectValue('Manufactura');
  }

  return toSelectValue(sectorLabel);
};

export const resolveLeadRecibidoStageValue = (): string =>
  toSelectValue('Lead recibido');
