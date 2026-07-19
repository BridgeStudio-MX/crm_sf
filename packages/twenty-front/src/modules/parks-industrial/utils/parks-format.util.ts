import { format, parseISO } from 'date-fns';
import { es } from 'date-fns/locale';
import { MAIN_COLORS_LIGHT } from 'twenty-ui/theme';
import { themeCssVariables } from 'twenty-ui/theme-constants';

import {
  type ParksPipelineStageColor,
  parseParksApprovalStage,
} from '@/parks-industrial/constants/parks-industrial.constants';
import {
  type ParksOpportunityRecord,
  type ParksStackingPlanNave,
} from '@/parks-industrial/hooks/useParksRecords';

const APPROVAL_STAGE_KEY = 'APROBACION_ETAPA';

export type ParksPipelineStageTheme = {
  accent: string;
  background: string;
  border: string;
  dragHighlight: string;
};

const pipelineStageThemeByColor: Record<
  ParksPipelineStageColor,
  ParksPipelineStageTheme
> = {
  gray: {
    background: themeCssVariables.color.gray1,
    border: themeCssVariables.color.gray4,
    accent: themeCssVariables.color.gray11,
    dragHighlight: themeCssVariables.color.gray3,
  },
  sky: {
    background: themeCssVariables.color.sky1,
    border: themeCssVariables.color.sky4,
    accent: themeCssVariables.color.sky,
    dragHighlight: themeCssVariables.color.sky3,
  },
  blue: {
    background: themeCssVariables.color.blue1,
    border: themeCssVariables.color.blue4,
    accent: themeCssVariables.color.blue,
    dragHighlight: themeCssVariables.color.blue3,
  },
  turquoise: {
    background: themeCssVariables.color.turquoise1,
    border: themeCssVariables.color.turquoise4,
    accent: themeCssVariables.color.turquoise,
    dragHighlight: themeCssVariables.color.turquoise3,
  },
  purple: {
    background: themeCssVariables.color.purple1,
    border: themeCssVariables.color.purple4,
    accent: themeCssVariables.color.purple,
    dragHighlight: themeCssVariables.color.purple3,
  },
  orange: {
    background: themeCssVariables.color.orange1,
    border: themeCssVariables.color.orange4,
    accent: themeCssVariables.color.orange,
    dragHighlight: themeCssVariables.color.orange3,
  },
  yellow: {
    background: themeCssVariables.color.yellow2,
    border: themeCssVariables.color.yellow6,
    accent: themeCssVariables.color.yellow11,
    dragHighlight: themeCssVariables.color.yellow3,
  },
  green: {
    background: themeCssVariables.color.green1,
    border: themeCssVariables.color.green4,
    accent: themeCssVariables.color.green,
    dragHighlight: themeCssVariables.color.green3,
  },
};

export const getParksPipelineStageTheme = (
  color: ParksPipelineStageColor,
): ParksPipelineStageTheme => pipelineStageThemeByColor[color];

export const getParksRenovacionStageTheme = (
  color: ParksPipelineStageColor | 'red',
): ParksPipelineStageTheme => {
  if (color === 'red') {
    return {
      accent: themeCssVariables.color.red,
      background: themeCssVariables.color.red1,
      border: themeCssVariables.color.red4,
      dragHighlight: themeCssVariables.color.red3,
    };
  }

  return getParksPipelineStageTheme(color);
};

const legalStageColorById: Record<string, ParksPipelineStageColor> = {
  nuevo: 'sky',
  asignado: 'blue',
  'docs-incompletas': 'yellow',
  elaboracion: 'purple',
  'primera-version': 'turquoise',
  negociacion: 'orange',
  'version-final': 'green',
  'espera-firma-cliente': 'orange',
  cotejo: 'yellow',
  firmas: 'green',
  funo: 'purple',
};

export const getParksLegalStageTheme = (
  stageId: string,
): ParksPipelineStageTheme => {
  const color = legalStageColorById[stageId] ?? 'gray';

  return getParksPipelineStageTheme(color);
};

export const getParksLegalSemaforoBadgeColor = (
  semaforo?: string | null,
): 'red' | 'yellow' | 'green' | 'gray' => {
  if (semaforo === 'ROJO') {
    return 'red';
  }

  if (semaforo === 'AMARILLO' || semaforo === 'NARANJA') {
    return 'yellow';
  }

  if (semaforo === 'VERDE') {
    return 'green';
  }

  return 'gray';
};

export const getParksLegalSemaforoLabel = (semaforo?: string | null): string => {
  if (semaforo === 'ROJO') {
    return 'Crítico';
  }

  if (semaforo === 'NARANJA') {
    return 'En riesgo';
  }

  if (semaforo === 'AMARILLO') {
    return 'Atención';
  }

  if (semaforo === 'VERDE') {
    return 'En tiempo';
  }

  return 'Sin semáforo';
};

export const getParksLegalLawyerInitials = (name?: string | null): string => {
  if (!name) {
    return '?';
  }

  const parts = name.trim().split(/\s+/);

  if (parts.length === 1) {
    return parts[0].slice(0, 2).toUpperCase();
  }

  return `${parts[0][0] ?? ''}${parts[1][0] ?? ''}`.toUpperCase();
};

export type ParksOcupacionLevel = 'high' | 'medium' | 'low';

export const getParksParqueOcupacion = (
  m2Totales?: number | null,
  m2Rentados?: number | null,
): number => {
  if (!m2Totales || m2Totales <= 0) {
    return 0;
  }

  return Math.round(((m2Rentados ?? 0) / m2Totales) * 100);
};

export const getParksOcupacionLevel = (
  ocupacion: number,
): ParksOcupacionLevel => {
  if (ocupacion >= 85) {
    return 'high';
  }

  if (ocupacion >= 60) {
    return 'medium';
  }

  return 'low';
};

export const getParksOcupacionColor = (ocupacion: number): string => {
  const level = getParksOcupacionLevel(ocupacion);

  if (level === 'high') {
    return themeCssVariables.color.green;
  }

  if (level === 'medium') {
    return themeCssVariables.color.yellow11;
  }

  return themeCssVariables.color.orange;
};

export const getParksOcupacionMarkerHex = (ocupacion: number): string => {
  const level = getParksOcupacionLevel(ocupacion);

  if (level === 'high') {
    return MAIN_COLORS_LIGHT.green;
  }

  if (level === 'medium') {
    return MAIN_COLORS_LIGHT.amber;
  }

  return MAIN_COLORS_LIGHT.orange;
};

export const getParksParqueM2Disponibles = (
  m2Totales?: number | null,
  m2Rentados?: number | null,
): number => Math.max((m2Totales ?? 0) - (m2Rentados ?? 0), 0);

export const formatParksDate = (value?: string | null): string => {
  if (!value) {
    return '—';
  }

  try {
    return format(parseISO(value), 'dd/MMM/yyyy', { locale: es });
  } catch {
    return value;
  }
};

export const formatParksUsd = (value?: number | null): string => {
  if (value === undefined || value === null) {
    return '—';
  }

  return new Intl.NumberFormat('es-MX', {
    style: 'currency',
    currency: 'USD',
    maximumFractionDigits: 0,
  }).format(value);
};

export const formatParksNumber = (value?: number | null): string => {
  if (value === undefined || value === null) {
    return '—';
  }

  return new Intl.NumberFormat('es-MX').format(value);
};

export const getParksDaysUntil = (dateValue?: string | null): number | null => {
  if (!dateValue) {
    return null;
  }

  const target = new Date(dateValue);
  const today = new Date();
  today.setHours(0, 0, 0, 0);
  target.setHours(0, 0, 0, 0);

  return Math.ceil(
    (target.getTime() - today.getTime()) / (1000 * 60 * 60 * 24),
  );
};

export type ParksStackingStatusColor = 'green' | 'yellow' | 'red' | 'gray';

export type ParksStackingStatusKey =
  | 'available'
  | 'active'
  | 'expiring_soon'
  | 'renewal_due';

export const getParksStackingStatus = (
  diasRestantes: number | null,
  hasContract: boolean,
): { color: ParksStackingStatusColor; statusKey: ParksStackingStatusKey } => {
  if (!hasContract) {
    return { color: 'gray', statusKey: 'available' };
  }

  if (diasRestantes === null) {
    return { color: 'green', statusKey: 'active' };
  }

  if (diasRestantes <= 90) {
    return { color: 'red', statusKey: 'expiring_soon' };
  }

  if (diasRestantes <= 180) {
    return { color: 'yellow', statusKey: 'renewal_due' };
  }

  return { color: 'green', statusKey: 'active' };
};

export const getParksStackingStatusLabel = (
  statusKey: ParksStackingStatusKey,
): string => {
  switch (statusKey) {
    case 'available':
      return 'Disponible';
    case 'active':
      return 'Activo';
    case 'expiring_soon':
      return 'Vence pronto';
    case 'renewal_due':
      return 'Por renovar';
  }
};

export const getParksComisionStatusLabel = (estatus?: string | null): string =>
  estatus ?? 'PENDIENTE';

export const getParksComisionStatusColor = (
  estatus?: string | null,
): 'green' | 'yellow' | 'blue' | 'red' | 'gray' => {
  if (!estatus) {
    return 'yellow';
  }

  const normalized = estatus.toUpperCase();

  if (normalized.includes('PAGADA') || normalized.includes('PAGADO')) {
    return 'green';
  }

  if (
    normalized.includes('APROBADA') ||
    normalized.includes('PENDIENTE DE PAGO') ||
    normalized.includes('PENDIENTE_DE_PAGO')
  ) {
    return 'blue';
  }

  if (
    normalized.includes('RECHAZADA') ||
    normalized.includes('DISPUTA')
  ) {
    return 'red';
  }

  if (
    normalized.includes('PENDIENTE') ||
    normalized.includes('CALCULADA')
  ) {
    return 'yellow';
  }

  return 'gray';
};

export const getParksAmountFromMicros = (amountMicros?: number): number => {
  if (!amountMicros) {
    return 0;
  }

  return amountMicros / 1_000_000;
};

export const getParksStackingStatusColor = (
  color: ParksStackingStatusColor,
): string => {
  switch (color) {
    case 'green':
      return '#16A34A';
    case 'yellow':
      return '#D97706';
    case 'red':
      return '#DC2626';
    default:
      return '#6B7280';
  }
};

export type ParksDaysInStageColor = 'gray' | 'yellow' | 'red';

const normalizePersonName = (value?: string | null): string =>
  (value ?? '')
    .normalize('NFD')
    .replace(/\p{M}/gu, '')
    .trim()
    .toLowerCase();

// Prefer dedicated LO field; fall back to "CEM → LO" in asignadoPor.
export const getParksAssignedLeasingOfficerName = (
  opportunity: ParksOpportunityRecord,
): string | null => {
  const dedicated = opportunity.leasingOfficerAsignado?.trim();

  if (dedicated) {
    return dedicated;
  }

  const asignadoPor = opportunity.asignadoPor?.trim();

  if (!asignadoPor) {
    return null;
  }

  const arrowIndex = asignadoPor.lastIndexOf('→');

  if (arrowIndex === -1) {
    return null;
  }

  const leasingOfficerName = asignadoPor.slice(arrowIndex + 1).trim();

  return leasingOfficerName.length > 0 ? leasingOfficerName : null;
};

export const isParksOpportunityAssignedToViewer = (
  opportunity: ParksOpportunityRecord,
  viewerName?: string | null,
): boolean => {
  const leasingOfficerName = getParksAssignedLeasingOfficerName(opportunity);
  const normalizedViewerName = normalizePersonName(viewerName);
  const normalizedOfficerName = normalizePersonName(leasingOfficerName);

  if (!normalizedViewerName || !normalizedOfficerName) {
    return false;
  }

  return (
    normalizedViewerName.includes(normalizedOfficerName) ||
    normalizedOfficerName.includes(normalizedViewerName)
  );
};

export const getParksOwnerName = (
  opportunity: ParksOpportunityRecord,
): string => {
  const leasingOfficerName = getParksAssignedLeasingOfficerName(opportunity);

  if (leasingOfficerName) {
    return leasingOfficerName;
  }

  const firstName = opportunity.owner?.name?.firstName ?? '';
  const lastName = opportunity.owner?.name?.lastName ?? '';
  const fullName = `${firstName} ${lastName}`.trim();

  return fullName.length > 0 ? fullName : 'Sin asignar';
};

export const getParksOwnerInitials = (
  opportunity: ParksOpportunityRecord,
): string => {
  const ownerName = getParksOwnerName(opportunity);

  if (ownerName === 'Sin asignar') {
    return '?';
  }

  return ownerName
    .split(' ')
    .slice(0, 2)
    .map((part) => part.charAt(0).toUpperCase())
    .join('');
};

export const getParksDaysInStage = (updatedAt?: string | null): number => {
  if (!updatedAt) {
    return 0;
  }

  return Math.floor(
    (Date.now() - new Date(updatedAt).getTime()) / (1000 * 60 * 60 * 24),
  );
};

export const getParksDaysInStageColor = (
  updatedAt?: string | null,
): ParksDaysInStageColor => {
  const days = getParksDaysInStage(updatedAt);

  if (days > 30) {
    return 'red';
  }

  if (days > 14) {
    return 'yellow';
  }

  return 'gray';
};

const escapeCsvValue = (value: string): string =>
  `"${value.replace(/"/g, '""')}"`;

export const downloadParksStackingPlanCsv = (
  parqueNombre: string,
  naves: ParksStackingPlanNave[],
): void => {
  const headers = [
    'Nave',
    'Estado',
    'm2',
    'Inquilino',
    'Precio/m2 USD',
    'Vencimiento',
    'Dias restantes',
  ];

  const rows = naves.map((nave) => [
    nave.identificador ?? '',
    nave.statusKey,
    formatParksNumber(nave.m2),
    nave.expedienteActivo?.inquilino?.empresa ?? 'Disponible',
    formatParksUsd(nave.precioBaseUsd),
    formatParksDate(nave.expedienteActivo?.fechaVencimiento),
    nave.diasRestantes?.toString() ?? '',
  ]);

  const csvContent = [headers, ...rows]
    .map((row) => row.map((cell) => escapeCsvValue(cell)).join(','))
    .join('\n');

  const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
  const url = URL.createObjectURL(blob);
  const link = document.createElement('a');
  const safeName = parqueNombre.replace(/\s+/g, '-').toLowerCase();

  link.href = url;
  link.download = `stacking-plan-${safeName}.csv`;
  link.click();
  URL.revokeObjectURL(url);
};

export const parseParksApprovalComments = (
  notasCatalina?: string | null,
): string[] => {
  if (!notasCatalina) {
    return [];
  }

  const lines = notasCatalina.split('\n').slice(1);

  return lines.map((line) => line.trim()).filter((line) => line.length > 0);
};

export const appendParksApprovalComment = (
  notasCatalina: string | null | undefined,
  comentario: string,
): string => {
  const stageLine =
    notasCatalina?.split('\n')[0] ??
    `${APPROVAL_STAGE_KEY}:${parseParksApprovalStage(notasCatalina)}`;
  const existingComments = parseParksApprovalComments(notasCatalina);

  return [stageLine, ...existingComments, comentario.trim()]
    .filter((line) => line.length > 0)
    .join('\n');
};
