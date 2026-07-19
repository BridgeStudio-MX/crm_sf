import { type ParksVisualAccent } from '@/parks-industrial/constants/parks-theme.constants';
import {
  type ComiteAutorizacion,
  type ComiteEstatus,
  type ComiteIaFlagSeveridad,
  type ComiteVotoValor,
} from '@/parks-industrial/types/parks-comite.types';

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

export const getComiteSemaforoAccent = (
  semaforo: ComiteAutorizacion['deal']['semaforoPrecio'],
): ParksVisualAccent => {
  switch (semaforo) {
    case 'Verde':
      return 'green';
    case 'Amarillo':
      return 'yellow';
    case 'Rojo':
      return 'red';
  }
};

export const getComiteEstatusAccent = (
  estatus: ComiteEstatus,
): ParksVisualAccent => {
  if (estatus.startsWith('Resuelto — Aprobado')) {
    return 'green';
  }

  if (estatus.startsWith('Resuelto — Rechazado')) {
    return 'red';
  }

  if (estatus.startsWith('Abierto')) {
    return 'blue';
  }

  if (estatus.startsWith('Cancelado') || estatus.startsWith('Vencido')) {
    return 'orange';
  }

  return 'gray';
};

export const getComiteVotoAccent = (
  voto: ComiteVotoValor,
): ParksVisualAccent => {
  switch (voto) {
    case 'Aprueba':
      return 'green';
    case 'Rechaza':
      return 'red';
    case 'Se abstiene':
      return 'gray';
    case 'Pendiente':
      return 'yellow';
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

export const getComiteFlagSeveridadAccent = (
  severidad: ComiteIaFlagSeveridad,
): ParksVisualAccent => {
  switch (severidad) {
    case 'Alta':
      return 'red';
    case 'Media':
      return 'orange';
    case 'Baja':
      return 'yellow';
  }
};

export type ComiteAuditoriaEntry = {
  timestamp: string | null;
  mensaje: string;
};

// Cada línea de bitácora tiene el formato `${ISO} ${mensaje}`. El ISO no
// contiene espacios, así que separamos por el primer espacio.
export const parseComiteAuditoriaLine = (
  line: string,
): ComiteAuditoriaEntry => {
  const firstSpaceIndex = line.indexOf(' ');

  if (firstSpaceIndex === -1) {
    return { timestamp: null, mensaje: line };
  }

  const maybeIso = line.slice(0, firstSpaceIndex);
  const parsedDate = new Date(maybeIso);

  if (Number.isNaN(parsedDate.getTime())) {
    return { timestamp: null, mensaje: line };
  }

  return {
    timestamp: parsedDate.toLocaleString('es-MX', {
      day: '2-digit',
      month: 'short',
      hour: '2-digit',
      minute: '2-digit',
    }),
    mensaje: line.slice(firstSpaceIndex + 1),
  };
};
