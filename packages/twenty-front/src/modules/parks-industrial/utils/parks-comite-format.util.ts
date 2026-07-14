import { type ComiteAutorizacion } from '@/parks-industrial/types/parks-comite.types';

export const getComiteSemaforoColor = (
  semaforo: ComiteAutorizacion['deal']['semaforoPrecio'],
): string => {
  switch (semaforo) {
    case 'Verde':
      return '#16a34a';
    case 'Amarillo':
      return '#ca8a04';
    case 'Rojo':
      return '#dc2626';
  }
};

export const getComiteTrackerHint = (comite: ComiteAutorizacion): string => {
  if (comite.resolucion !== 'Pendiente') {
    return comite.resolucion;
  }

  if (comite.votosAprueba === 1 && comite.votosRechaza === 0) {
    return 'Falta 1 aprobación para resolver';
  }

  if (comite.votosRechaza === 1 && comite.votosAprueba === 0) {
    return 'Falta 1 rechazo para bloquear o 2 aprobaciones para pasar';
  }

  if (comite.votosAprueba === 1 && comite.votosRechaza === 1) {
    return 'Tercer voto decide · o abstención escala a empate';
  }

  return 'En deliberación · mayoría simple (2 de 3)';
};

export const formatComiteCurrency = (
  amount: number,
  currency: 'MXN' | 'USD' = 'USD',
): string =>
  amount.toLocaleString('es-MX', {
    style: 'currency',
    currency,
    maximumFractionDigits: 0,
  });

export const getHoursUntil = (isoDate: string): number => {
  const diffMs = new Date(isoDate).getTime() - Date.now();
  return Math.max(0, Math.round(diffMs / (1000 * 60 * 60)));
};
