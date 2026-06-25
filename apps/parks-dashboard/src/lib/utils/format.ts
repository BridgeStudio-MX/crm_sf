import { format, parseISO } from 'date-fns';
import { es } from 'date-fns/locale';

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

export const formatUsd = (value?: number | null): string => {
  if (value === undefined || value === null) {
    return '—';
  }

  return new Intl.NumberFormat('es-MX', {
    style: 'currency',
    currency: 'USD',
    maximumFractionDigits: 0,
  }).format(value);
};

export const formatNumber = (value?: number | null): string => {
  if (value === undefined || value === null) {
    return '—';
  }

  return new Intl.NumberFormat('es-MX').format(value);
};

export const daysUntil = (dateValue?: string | null): number | null => {
  if (!dateValue) {
    return null;
  }

  const target = new Date(dateValue);
  const today = new Date();
  today.setHours(0, 0, 0, 0);
  target.setHours(0, 0, 0, 0);

  return Math.ceil((target.getTime() - today.getTime()) / (1000 * 60 * 60 * 24));
};

export const getStackingStatus = (
  diasRestantes: number | null,
  hasContract: boolean,
): {
  color: 'green' | 'yellow' | 'red' | 'gray';
  label: string;
} => {
  if (!hasContract) {
    return { color: 'gray', label: 'Disponible' };
  }

  if (diasRestantes === null) {
    return { color: 'green', label: 'Activo' };
  }

  if (diasRestantes <= 90) {
    return { color: 'red', label: 'Vence pronto' };
  }

  if (diasRestantes <= 180) {
    return { color: 'yellow', label: 'Por renovar' };
  }

  return { color: 'green', label: 'Activo' };
};

export const amountFromMicros = (amountMicros?: number): number => {
  if (!amountMicros) {
    return 0;
  }

  return amountMicros / 1_000_000;
};
