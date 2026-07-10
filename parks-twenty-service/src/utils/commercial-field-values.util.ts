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

export const resolveCanalOrigenStorageValue = (canalOrigen: string): string => {
  const trimmedCanal = canalOrigen.trim();
  const legacyLabel = LEGACY_CANAL_LABEL_BY_INPUT[trimmedCanal] ?? trimmedCanal;

  return toSelectValue(legacyLabel);
};

export const resolveLeadRecibidoStageValue = (): string =>
  toSelectValue('Lead recibido');
