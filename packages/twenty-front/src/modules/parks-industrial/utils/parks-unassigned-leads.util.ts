import { t } from '@lingui/core/macro';

export const PARKS_UNASSIGNED_LEADS_PREVIEW_COUNT = 3;

// Demo + fallback LOs. Live workspace LOs (rol Ejecutivo Comercial) are
// prepended at runtime via useParksLeasingOfficerOptions.
export const PARKS_LEASING_OFFICER_OPTIONS = [
  'Edgard Vargas',
  'Tim Apple',
  'Alejandro García',
  'María Torres',
  'Carlos Mendoza',
] as const;

const CANAL_LABEL_BY_VALUE: Record<string, string> = {
  RECOMENDACION: 'Recomendación',
  CALL_CENTER: 'Call Center',
  CEM: 'Director Comercial',
  LINKEDIN: 'LinkedIn',
  PAGINA_WEB: 'Página web',
  BROKER: 'Broker',
  EVENTO: 'Evento',
  OTRO: 'Otro',
  DIRECTO: 'Directo',
  DIGITAL: 'Digital',
  REFERIDO: 'Referido',
};

const UBICACION_LABEL_BY_VALUE: Record<string, string> = {
  GUADALAJARA: 'Guadalajara',
  MONTERREY: 'Monterrey',
  CDMX: 'CDMX',
  BAJIO: 'Bajío',
  NORTE: 'Norte',
  SUR: 'Sur',
  OTRO: 'Otro',
};

const formatSelectLabel = (
  value: string | undefined,
  labelByValue: Record<string, string>,
): string | null => {
  if (!value) {
    return null;
  }

  if (labelByValue[value]) {
    return labelByValue[value];
  }

  // Already human-readable (e.g. from form labels)
  if (value.includes(' ') || /[a-záéíóúñ]/i.test(value)) {
    return value;
  }

  return value
    .split('_')
    .map((part) => part.charAt(0) + part.slice(1).toLowerCase())
    .join(' ');
};

export const formatParksCanalOrigenLabel = (
  canalOrigen?: string,
): string | null => formatSelectLabel(canalOrigen, CANAL_LABEL_BY_VALUE);

export const formatParksUbicacionDeseadaLabel = (
  ubicacionDeseada?: string,
): string | null =>
  formatSelectLabel(ubicacionDeseada, UBICACION_LABEL_BY_VALUE);

export const formatParksLeadAgeLabel = (
  createdAt?: string,
): string | null => {
  if (!createdAt) {
    return null;
  }

  const createdAtMs = Date.parse(createdAt);

  if (Number.isNaN(createdAtMs)) {
    return null;
  }

  const ageInHours = Math.floor((Date.now() - createdAtMs) / (1000 * 60 * 60));

  if (ageInHours < 1) {
    return t`Hace menos de 1h`;
  }

  if (ageInHours < 24) {
    return t`Hace ${ageInHours}h`;
  }

  const ageInDays = Math.floor(ageInHours / 24);

  return t`Hace ${ageInDays}d`;
};
