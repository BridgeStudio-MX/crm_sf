import { CASO_LEGAL_ESTATUS_CERRADO } from '../constants/parks.constants';
import { type CasoLegalRecord, type SemaforoColor } from '../types/parks.types';
import { isSelectValueEqual } from '../utils/select-value.util';
import { twentyDataService } from './twenty-data.service';

export const calcularSemaforo = (caso: CasoLegalRecord): SemaforoColor => {
  if (isSelectValueEqual(caso.estatus, CASO_LEGAL_ESTATUS_CERRADO)) {
    return 'VERDE';
  }

  if (caso.holdoverActivo) {
    return 'ROJO';
  }

  if (caso.clienteNoRenueva) {
    return 'AMARILLO';
  }

  if (caso.slaDiasHabiles <= 0) {
    return 'AZUL';
  }

  const pctSla = caso.diasTranscurridos / caso.slaDiasHabiles;

  if (pctSla >= 0.8) {
    return 'ROJO';
  }

  if (pctSla >= 0.5) {
    return 'NARANJA';
  }

  return 'AZUL';
};

export const semaforoService = {
  updateForCaso: async (casoLegal: CasoLegalRecord): Promise<void> => {
    const nuevoSemaforo = calcularSemaforo(casoLegal);

    if (casoLegal.semaforo === nuevoSemaforo) {
      return;
    }

    await twentyDataService.updateCasoLegal(casoLegal.id, {
      semaforo: nuevoSemaforo,
    });

    console.log(
      `[semaforo.service] ${casoLegal.referencia ?? casoLegal.id}: ${casoLegal.semaforo ?? '—'} → ${nuevoSemaforo}`,
    );
  },

  updateAll: async (): Promise<void> => {
    const casosLegales = await twentyDataService.findCasosLegalesActivos();

    console.log(
      `[semaforo.service] Updating semáforo for ${casosLegales.length} cases`,
    );

    for (const casoLegal of casosLegales) {
      await semaforoService.updateForCaso(casoLegal);
    }
  },

  markCasoAsHoldover: async (casoLegalId: string): Promise<void> => {
    await twentyDataService.updateCasoLegal(casoLegalId, {
      semaforo: 'ROJO',
    });
  },
};
