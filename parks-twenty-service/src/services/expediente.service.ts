import {
  EXPEDIENTE_ESTATUS_ACTIVO,
  EXPEDIENTE_ESTATUS_ARCHIVADO_FUNO,
} from '../constants/parks.constants';
import { type CasoLegalRecord } from '../types/parks.types';
import { toIsoDateString } from '../utils/business-days.util';
import { toSelectValue } from '../utils/select-value.util';
import { twentyDataService } from './twenty-data.service';

const EXPEDIENTE_PREFIX = 'EXP';

const padSequence = (sequence: number): string =>
  sequence.toString().padStart(3, '0');

const addMonthsToDate = (startDate: Date, months: number): Date => {
  const result = new Date(startDate);
  result.setMonth(result.getMonth() + months);

  return result;
};

const resolveNextExpedienteNumber = async (year: number): Promise<string> => {
  const prefix = `${EXPEDIENTE_PREFIX}-${year}-`;
  const existingExpedientes =
    await twentyDataService.findExpedientesByYearPrefix(prefix);

  let maxSequence = 0;

  for (const expediente of existingExpedientes) {
    const numeroExpediente = expediente.numeroExpediente;

    if (!numeroExpediente?.startsWith(prefix)) {
      continue;
    }

    const sequencePart = numeroExpediente.slice(prefix.length);
    const sequence = Number.parseInt(sequencePart, 10);

    if (Number.isFinite(sequence) && sequence > maxSequence) {
      maxSequence = sequence;
    }
  }

  return `${prefix}${padSequence(maxSequence + 1)}`;
};

const resolveFechaVencimiento = (
  casoLegal: CasoLegalRecord,
): string | null => {
  const hojaDeAcuerdos = casoLegal.hojaDeAcuerdos;

  if (!hojaDeAcuerdos?.fechaInicio) {
    return null;
  }

  const startDate = new Date(hojaDeAcuerdos.fechaInicio);
  const endDate = addMonthsToDate(startDate, hojaDeAcuerdos.plazoMeses);

  return toIsoDateString(endDate);
};

const resolveRentaMensualUsd = (casoLegal: CasoLegalRecord): number => {
  const hojaDeAcuerdos = casoLegal.hojaDeAcuerdos;

  if (!hojaDeAcuerdos) {
    return 0;
  }

  return hojaDeAcuerdos.precioUsdM2 * hojaDeAcuerdos.m2Acordados;
};

export const expedienteService = {
  openForCasoLegal: async (casoLegalId: string): Promise<void> => {
    await expedienteService.abrirExpediente({ id: casoLegalId });
  },

  abrirExpediente: async (
    casoLegal: Pick<CasoLegalRecord, 'id'>,
  ): Promise<void> => {
    const fullCasoLegal = await twentyDataService.getCasoLegalById(casoLegal.id);

    if (!fullCasoLegal) {
      console.warn(
        `[expediente.service] Caso legal not found: ${casoLegal.id}`,
      );
      return;
    }

    const year = new Date().getFullYear();
    const numeroExpediente = await resolveNextExpedienteNumber(year);
    const fechaVencimiento = resolveFechaVencimiento(fullCasoLegal);

    if (!fechaVencimiento) {
      console.warn(
        `[expediente.service] Missing fechaInicio on hoja — cannot open expediente for ${fullCasoLegal.id}`,
      );
      return;
    }

    const esFuno =
      fullCasoLegal.nave?.esPropiedadFuno || fullCasoLegal.esPropiedadFuno;
    const estatus = esFuno
      ? toSelectValue(EXPEDIENTE_ESTATUS_ARCHIVADO_FUNO)
      : toSelectValue(EXPEDIENTE_ESTATUS_ACTIVO);

    const expediente = await twentyDataService.createExpedienteContrato({
      numeroExpediente,
      fechaApertura: twentyDataService.todayIsoDate(),
      fechaVencimiento,
      rentaMensualUsd: resolveRentaMensualUsd(fullCasoLegal),
      estatus,
      notas: esFuno
        ? 'Archivado FUNO — expediente físico va a FUNO, no a Parks.'
        : undefined,
      oracleSincronizado: false,
      casoLegalId: fullCasoLegal.id,
      inquilinoId: fullCasoLegal.inquilinoId,
      naveId: fullCasoLegal.naveId,
    });

    if (expediente) {
      console.log(
        `[expediente.service] Opened ${numeroExpediente} for caso ${fullCasoLegal.referencia ?? fullCasoLegal.id}`,
      );
    }
  },
};
