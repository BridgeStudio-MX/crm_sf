import {
  CASO_LEGAL_ESTATUS_CERRADO,
  DEFAULT_SLA_DIAS_VARIABLE,
  SLA_DIAS_BY_TIPO_DOCUMENTO,
} from '../constants/parks.constants';
import { envConfig } from '../config/env.config';
import { type CasoLegalRecord } from '../types/parks.types';
import {
  addBusinessDays,
  countBusinessDaysBetween,
  toIsoDateString,
} from '../utils/business-days.util';
import { isSelectValueEqual, toSelectValue } from '../utils/select-value.util';
import { notificacionService } from './notificacion.service';
import { twentyDataService } from './twenty-data.service';

const resolveSlaDiasHabiles = (tipoDocumento: string | undefined): number => {
  if (!tipoDocumento) {
    return DEFAULT_SLA_DIAS_VARIABLE;
  }

  const configuredDays = SLA_DIAS_BY_TIPO_DOCUMENTO[tipoDocumento];

  if (configuredDays === null || configuredDays === undefined) {
    return DEFAULT_SLA_DIAS_VARIABLE;
  }

  return configuredDays;
};

const resolveSlaStartDate = (casoLegal: CasoLegalRecord): Date | null => {
  if (!casoLegal.fechaHojaAcuerdos) {
    return null;
  }

  if (
    envConfig.slaPausaPorDocs &&
    !casoLegal.documentacionCompleta &&
    casoLegal.diasTranscurridos === 0
  ) {
    return null;
  }

  return new Date(casoLegal.fechaHojaAcuerdos);
};

const calculateDiasTranscurridos = (casoLegal: CasoLegalRecord): number => {
  const startDate = resolveSlaStartDate(casoLegal);

  if (!startDate) {
    return 0;
  }

  return countBusinessDaysBetween(startDate, new Date());
};

const appendNota = (
  existingNotes: string | undefined,
  line: string,
): string => {
  if (!existingNotes) {
    return line;
  }

  return `${existingNotes}\n${line}`;
};

export const slaService = {
  resolveSlaDiasHabiles,

  iniciarSLA: async (casoLegal: CasoLegalRecord): Promise<void> => {
    const slaDiasHabiles = resolveSlaDiasHabiles(casoLegal.tipoDocumento);
    const startDate = casoLegal.fechaHojaAcuerdos
      ? new Date(casoLegal.fechaHojaAcuerdos)
      : new Date();
    const slaFechaLimite = addBusinessDays(startDate, slaDiasHabiles);

    await twentyDataService.updateCasoLegal(casoLegal.id, {
      slaDiasHabiles,
      slaFechaLimite: toIsoDateString(slaFechaLimite),
      diasTranscurridos: 0,
    });

    console.log(
      `[sla.service] SLA iniciado — caso ${casoLegal.id}: ${slaDiasHabiles} días hábiles`,
    );
  },

  reanudarSLA: async (casoLegal: CasoLegalRecord): Promise<void> => {
    const diasTranscurridos = calculateDiasTranscurridos({
      ...casoLegal,
      documentacionCompleta: true,
    });

    await twentyDataService.updateCasoLegal(casoLegal.id, {
      diasTranscurridos,
      estatus: toSelectValue('En elaboración'),
    });

    console.log(
      `[sla.service] SLA reanudado — caso ${casoLegal.id}: ${diasTranscurridos} días`,
    );
  },

  registrarHito: async (
    casoLegalId: string,
    hito: string,
    timestamp: Date,
  ): Promise<void> => {
    const casoLegal = await twentyDataService.getCasoLegalById(casoLegalId);

    if (!casoLegal) {
      return;
    }

    const line = `[SLA ${timestamp.toISOString()}] Hito: ${hito}`;
    const notasCatalina = appendNota(casoLegal.notasCatalina, line);

    await twentyDataService.updateCasoLegal(casoLegalId, { notasCatalina });
  },

  recalculateForCaso: async (casoLegal: CasoLegalRecord): Promise<void> => {
    if (isSelectValueEqual(casoLegal.estatus, CASO_LEGAL_ESTATUS_CERRADO)) {
      return;
    }

    const diasTranscurridos = calculateDiasTranscurridos(casoLegal);
    const slaDiasHabiles =
      casoLegal.slaDiasHabiles > 0
        ? casoLegal.slaDiasHabiles
        : resolveSlaDiasHabiles(casoLegal.tipoDocumento);

    const updatePayload: Record<string, unknown> = {
      diasTranscurridos,
    };

    if (slaDiasHabiles > 0 && casoLegal.slaDiasHabiles !== slaDiasHabiles) {
      updatePayload.slaDiasHabiles = slaDiasHabiles;
    }

    if (
      slaDiasHabiles > 0 &&
      diasTranscurridos > slaDiasHabiles &&
      diasTranscurridos !== casoLegal.diasTranscurridos
    ) {
      await notificacionService.notifyArea(
        'Legal',
        `SLA vencido — caso ${casoLegal.referencia ?? casoLegal.id} (${diasTranscurridos}/${slaDiasHabiles} días hábiles)`,
      );
    }

    if (diasTranscurridos !== casoLegal.diasTranscurridos) {
      await twentyDataService.updateCasoLegal(casoLegal.id, updatePayload);
    }
  },

  recalculateAll: async (): Promise<void> => {
    const casosLegales = await twentyDataService.findCasosLegalesActivos();

    console.log(
      `[sla.service] Recalculating SLA for ${casosLegales.length} active cases`,
    );

    for (const casoLegal of casosLegales) {
      await slaService.recalculateForCaso(casoLegal);
    }
  },

  cerrarSLA: async (casoLegalId: string): Promise<void> => {
    const casoLegal = await twentyDataService.getCasoLegalById(casoLegalId);

    if (!casoLegal) {
      return;
    }

    await twentyDataService.updateCasoLegal(casoLegalId, {
      semaforo: 'VERDE',
      diasTranscurridos: casoLegal.diasTranscurridos,
    });

    console.log(`[sla.service] SLA cerrado — caso ${casoLegalId}`);
  },
};
