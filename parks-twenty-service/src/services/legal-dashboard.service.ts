import {
  CASO_LEGAL_ESTATUS_CANCELADO,
  CASO_LEGAL_ESTATUS_CERRADO,
} from '../constants/parks.constants';
import { type CasoLegalRecord } from '../types/parks.types';
import { isSelectValueEqual } from '../utils/select-value.util';
import { twentyDataService } from './twenty-data.service';

export type LegalDashboardFilters = {
  abogadoAsignado?: string;
  tipoDocumento?: string;
  parque?: string;
  slaVencido?: boolean;
};

export type LegalDashboardCaseItem = {
  id: string;
  referencia?: string;
  estatus?: string;
  semaforo?: string;
  abogadoAsignado?: string;
  tipoDocumento?: string;
  empresa?: string;
  nave?: string;
  parque?: string;
  slaDiasHabiles: number;
  diasTranscurridos: number;
  diasRestantes: number | null;
  slaPausado: boolean;
  documentacionCompleta?: boolean;
};

const isSlaVencido = (casoLegal: CasoLegalRecord): boolean =>
  casoLegal.slaDiasHabiles > 0 &&
  casoLegal.diasTranscurridos > casoLegal.slaDiasHabiles;

const mapCasoToDashboardItem = (
  casoLegal: CasoLegalRecord,
): LegalDashboardCaseItem => {
  const diasRestantes =
    casoLegal.slaDiasHabiles > 0
      ? Math.max(
          0,
          casoLegal.slaDiasHabiles - (casoLegal.diasTranscurridos ?? 0),
        )
      : null;

  return {
    id: casoLegal.id,
    referencia: casoLegal.referencia,
    estatus: casoLegal.estatus,
    semaforo: casoLegal.semaforo,
    abogadoAsignado: casoLegal.abogadoAsignado,
    tipoDocumento: casoLegal.tipoDocumento,
    empresa: casoLegal.inquilino?.empresa,
    nave: casoLegal.nave?.identificador,
    parque: casoLegal.nave?.parque?.nombre,
    slaDiasHabiles: casoLegal.slaDiasHabiles,
    diasTranscurridos: casoLegal.diasTranscurridos ?? 0,
    diasRestantes,
    slaPausado: casoLegal.slaPausado === true,
    documentacionCompleta: casoLegal.documentacionCompleta,
  };
};

const matchesFilters = (
  casoLegal: CasoLegalRecord,
  filters: LegalDashboardFilters,
): boolean => {
  if (
    filters.abogadoAsignado &&
    casoLegal.abogadoAsignado !== filters.abogadoAsignado
  ) {
    return false;
  }

  if (
    filters.tipoDocumento &&
    casoLegal.tipoDocumento !== filters.tipoDocumento
  ) {
    return false;
  }

  if (filters.parque) {
    const parqueNombre = casoLegal.nave?.parque?.nombre ?? '';

    if (!parqueNombre.toLowerCase().includes(filters.parque.toLowerCase())) {
      return false;
    }
  }

  if (filters.slaVencido === true && !isSlaVencido(casoLegal)) {
    return false;
  }

  return true;
};

export const legalDashboardService = {
  getDashboard: async (filters: LegalDashboardFilters = {}) => {
    const casosLegales = await twentyDataService.findCasosLegalesActivos();

    const activeCases = casosLegales.filter(
      (casoLegal) =>
        !isSelectValueEqual(casoLegal.estatus, CASO_LEGAL_ESTATUS_CERRADO) &&
        !isSelectValueEqual(casoLegal.estatus, CASO_LEGAL_ESTATUS_CANCELADO) &&
        matchesFilters(casoLegal, filters),
    );

    const items = activeCases
      .map(mapCasoToDashboardItem)
      .sort((left, right) => {
        if (left.slaPausado !== right.slaPausado) {
          return left.slaPausado ? 1 : -1;
        }

        if (left.semaforo === 'ROJO' && right.semaforo !== 'ROJO') {
          return -1;
        }

        if (right.semaforo === 'ROJO' && left.semaforo !== 'ROJO') {
          return 1;
        }

        return (left.diasRestantes ?? 999) - (right.diasRestantes ?? 999);
      });

    return {
      totalActivos: items.length,
      enRiesgo: items.filter((item) => item.semaforo === 'ROJO').length,
      pausados: items.filter((item) => item.slaPausado).length,
      slaVencidos: items.filter(
        (item) =>
          item.slaDiasHabiles > 0 &&
          item.diasTranscurridos > item.slaDiasHabiles,
      ).length,
      casos: items,
    };
  },
};
