import {
  CASO_LEGAL_ESTATUS_CANCELADO,
  CASO_LEGAL_ESTATUS_CERRADO,
} from '../constants/parks.constants';
import { type CasoLegalRecord } from '../types/parks.types';
import { isSelectValueEqual } from '../utils/select-value.util';
import { twentyDataService } from './twenty-data.service';

export type LawyerWorkloadItem = {
  abogadoAsignado: string;
  casosActivos: number;
  casosEnRiesgo: number;
  casosPausados: number;
};

const isActiveCase = (casoLegal: CasoLegalRecord): boolean =>
  !isSelectValueEqual(casoLegal.estatus, CASO_LEGAL_ESTATUS_CERRADO) &&
  !isSelectValueEqual(casoLegal.estatus, CASO_LEGAL_ESTATUS_CANCELADO);

export const legalWorkloadService = {
  getWorkload: async (): Promise<LawyerWorkloadItem[]> => {
    const casosLegales = await twentyDataService.findCasosLegalesActivos();
    const workloadMap = new Map<string, LawyerWorkloadItem>();

    for (const casoLegal of casosLegales) {
      if (!isActiveCase(casoLegal)) {
        continue;
      }

      const abogadoAsignado =
        casoLegal.abogadoAsignado?.trim() || 'Sin asignar';
      const existing = workloadMap.get(abogadoAsignado) ?? {
        abogadoAsignado,
        casosActivos: 0,
        casosEnRiesgo: 0,
        casosPausados: 0,
      };

      existing.casosActivos += 1;

      if (casoLegal.semaforo === 'ROJO') {
        existing.casosEnRiesgo += 1;
      }

      if (casoLegal.slaPausado || casoLegal.documentacionCompleta === false) {
        existing.casosPausados += 1;
      }

      workloadMap.set(abogadoAsignado, existing);
    }

    return [...workloadMap.values()].sort(
      (left, right) => right.casosActivos - left.casosActivos,
    );
  },
};
