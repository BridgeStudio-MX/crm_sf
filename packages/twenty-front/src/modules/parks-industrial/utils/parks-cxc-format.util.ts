import { type ParksVisualAccent } from '@/parks-industrial/constants/parks-theme.constants';
import {
  type CxcAnomalySeverity,
  type CxcPaymentStatus,
  type CxcRiskLabel,
} from '@/parks-industrial/types/parks-cxc.types';

export const formatCxcMoney = (
  amount: number,
  currency: 'MXN' | 'USD' = 'MXN',
): string => {
  const formatted = new Intl.NumberFormat('es-MX', {
    style: 'currency',
    currency,
    maximumFractionDigits: 0,
  }).format(amount);

  return formatted;
};

export const formatCxcCompactMoney = (
  amount: number,
  currency: 'MXN' | 'USD' = 'MXN',
): string => {
  if (amount >= 1_000_000) {
    return `${currency === 'USD' ? 'US$' : '$'}${(amount / 1_000_000).toFixed(1)}M`;
  }

  if (amount >= 1_000) {
    return `${currency === 'USD' ? 'US$' : '$'}${Math.round(amount / 1_000)}K`;
  }

  return formatCxcMoney(amount, currency);
};

export const getCxcRiskAccent = (label: CxcRiskLabel): ParksVisualAccent => {
  if (label === 'Crítico') {
    return 'red';
  }

  if (label === 'Alto') {
    return 'orange';
  }

  if (label === 'Medio') {
    return 'yellow';
  }

  return 'green';
};

export const getCxcPaymentStatusAccent = (
  status: CxcPaymentStatus,
): ParksVisualAccent => {
  if (status === 'Al corriente') {
    return 'green';
  }

  if (status === 'Mora leve') {
    return 'yellow';
  }

  if (status === 'Mora grave' || status === 'Holdover') {
    return 'red';
  }

  return 'gray';
};

export const getCxcAnomalyAccent = (
  severity: CxcAnomalySeverity,
): ParksVisualAccent => {
  if (severity === 'critical') {
    return 'red';
  }

  if (severity === 'warning') {
    return 'orange';
  }

  return 'sky';
};
