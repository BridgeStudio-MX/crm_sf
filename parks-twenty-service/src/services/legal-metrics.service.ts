import {
  CASO_LEGAL_ESTATUS_CANCELADO,
  CASO_LEGAL_ESTATUS_CERRADO,
  CASO_LEGAL_ESTATUS_PRIMERA_VERSION,
} from '../constants/parks.constants';
import { type CasoLegalRecord } from '../types/parks.types';
import { isSelectValueEqual } from '../utils/select-value.util';
import { twentyDataService } from './twenty-data.service';

export type LawyerMetricsItem = {
  abogadoAsignado: string;
  casosActivos: number;
  casosCerrados: number;
  promedioDiasPrimeraVersion: number | null;
  promedioDiasCierre: number | null;
  cumplimientoSlaPct: number;
};

const isClosed = (casoLegal: CasoLegalRecord): boolean =>
  isSelectValueEqual(casoLegal.estatus, CASO_LEGAL_ESTATUS_CERRADO);

const reachedFirstVersion = (casoLegal: CasoLegalRecord): boolean =>
  casoLegal.diasTranscurridos > 0 ||
  isSelectValueEqual(casoLegal.estatus, CASO_LEGAL_ESTATUS_PRIMERA_VERSION) ||
  isClosed(casoLegal);

export const legalMetricsService = {
  getTeamMetrics: async (): Promise<LawyerMetricsItem[]> => {
    const allCasos = await twentyDataService.findAllCasosLegales();
    const metricsMap = new Map<string, LawyerMetricsItem>();

    for (const casoLegal of allCasos) {
      if (isSelectValueEqual(casoLegal.estatus, CASO_LEGAL_ESTATUS_CANCELADO)) {
        continue;
      }

      const abogadoAsignado =
        casoLegal.abogadoAsignado?.trim() || 'Sin asignar';
      const existing = metricsMap.get(abogadoAsignado) ?? {
        abogadoAsignado,
        casosActivos: 0,
        casosCerrados: 0,
        promedioDiasPrimeraVersion: null,
        promedioDiasCierre: null,
        cumplimientoSlaPct: 0,
      };

      if (isClosed(casoLegal)) {
        existing.casosCerrados += 1;
      } else {
        existing.casosActivos += 1;
      }

      metricsMap.set(abogadoAsignado, existing);
    }

    const result = [...metricsMap.values()].map((item) => {
      const lawyerCases = allCasos.filter(
        (casoLegal) =>
          (casoLegal.abogadoAsignado?.trim() || 'Sin asignar') ===
            item.abogadoAsignado &&
          !isSelectValueEqual(casoLegal.estatus, CASO_LEGAL_ESTATUS_CANCELADO),
      );

      const firstVersionDays = lawyerCases
        .filter(reachedFirstVersion)
        .map((casoLegal) => Math.min(casoLegal.diasTranscurridos, 30));

      const closedDays = lawyerCases
        .filter(isClosed)
        .map((casoLegal) => casoLegal.diasTranscurridos);

      const slaCompliant = lawyerCases.filter(
        (casoLegal) =>
          isClosed(casoLegal) &&
          (casoLegal.slaDiasHabiles <= 0 ||
            casoLegal.diasTranscurridos <= casoLegal.slaDiasHabiles),
      ).length;

      const closedCount = lawyerCases.filter(isClosed).length;

      return {
        ...item,
        promedioDiasPrimeraVersion:
          firstVersionDays.length > 0
            ? Math.round(
                firstVersionDays.reduce((sum, days) => sum + days, 0) /
                  firstVersionDays.length,
              )
            : null,
        promedioDiasCierre:
          closedDays.length > 0
            ? Math.round(
                closedDays.reduce((sum, days) => sum + days, 0) /
                  closedDays.length,
              )
            : null,
        cumplimientoSlaPct:
          closedCount > 0 ? Math.round((slaCompliant / closedCount) * 100) : 0,
      };
    });

    return result.sort((left, right) => right.casosActivos - left.casosActivos);
  },
};
