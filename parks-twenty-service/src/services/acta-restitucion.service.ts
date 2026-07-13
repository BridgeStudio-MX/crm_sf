import { NAVE_ESTATUS_DISPONIBLE } from '../constants/parks.constants';
import { countBusinessDaysBetween, toIsoDateString } from '../utils/business-days.util';
import { toSelectValue } from '../utils/select-value.util';
import { notificacionService } from './notificacion.service';
import { twentyDataService } from './twenty-data.service';

export type CreateActaRestitucionInput = {
  casoLegalId: string;
  inquilinoId: string;
  naveId: string;
  fechaSalidaCliente: string;
  fechaRecepcionActa?: string;
  estadoNave: string;
  descripcionDesperfectos?: string;
  decisionDeposito: string;
  porcentajeDevolucion?: number;
  montoDepositoOriginal: number;
  justificacionRetencion?: string;
};

const calculateDepositAmounts = ({
  montoDepositoOriginal,
  porcentajeDevolucion,
  decisionDeposito,
}: {
  montoDepositoOriginal: number;
  porcentajeDevolucion?: number;
  decisionDeposito: string;
}): { montoADevolver: number; montoARetener: number } => {
  if (decisionDeposito === 'Devolver 100%') {
    return {
      montoADevolver: montoDepositoOriginal,
      montoARetener: 0,
    };
  }

  if (decisionDeposito === 'Retener 100%') {
    return {
      montoADevolver: 0,
      montoARetener: montoDepositoOriginal,
    };
  }

  const pct = porcentajeDevolucion ?? 50;
  const montoADevolver = (montoDepositoOriginal * pct) / 100;

  return {
    montoADevolver,
    montoARetener: montoDepositoOriginal - montoADevolver,
  };
};

export const actaRestitucionService = {
  create: async (input: CreateActaRestitucionInput) => {
    const { montoADevolver, montoARetener } = calculateDepositAmounts(input);
    const diasRetrasoActa =
      input.fechaRecepcionActa && input.fechaSalidaCliente
        ? countBusinessDaysBetween(
            new Date(input.fechaSalidaCliente),
            new Date(input.fechaRecepcionActa),
          )
        : 0;

    const referencia = `ACTA-${input.naveId.slice(0, 4)}-${Date.now()}`.slice(
      0,
      120,
    );

    const acta = await twentyDataService.createActaRestitucion({
      referencia,
      fechaSalidaCliente: input.fechaSalidaCliente,
      fechaRecepcionActa: input.fechaRecepcionActa ?? null,
      diasRetrasoActa,
      estadoNave: toSelectValue(input.estadoNave),
      descripcionDesperfectos: input.descripcionDesperfectos ?? null,
      decisionDeposito: toSelectValue(input.decisionDeposito),
      porcentajeDevolucion: input.porcentajeDevolucion ?? null,
      montoDepositoOriginal: input.montoDepositoOriginal,
      montoADevolver,
      montoARetener,
      justificacionRetencion: input.justificacionRetencion ?? null,
      aprobadoPorComercial: false,
      actaFirmadaCliente: false,
      casoLegalId: input.casoLegalId,
      inquilinoId: input.inquilinoId,
      naveId: input.naveId,
    });

    return acta;
  },

  approveComercial: async ({
    actaRestitucionId,
    aprobadoPor,
  }: {
    actaRestitucionId: string;
    aprobadoPor: string;
  }) => {
    await twentyDataService.updateActaRestitucion(actaRestitucionId, {
      aprobadoPorComercial: true,
      aprobadoPor,
      fechaAprobacion: toIsoDateString(new Date()),
    });

    const actas = await twentyDataService.findActasByCasoLegal('');

    void actas;

    await notificacionService.notifyArea(
      'CxC',
      `Acta de restitución aprobada — procesar devolución de depósito (${actaRestitucionId})`,
    );
  },

  finalize: async ({
    actaRestitucionId,
    naveId,
    montoADevolver,
  }: {
    actaRestitucionId: string;
    naveId: string;
    montoADevolver: number;
  }) => {
    await twentyDataService.updateActaRestitucion(actaRestitucionId, {
      actaFirmadaCliente: true,
    });

    await twentyDataService.updateNave(naveId, {
      estatus: toSelectValue(NAVE_ESTATUS_DISPONIBLE),
    });

    await notificacionService.notifyArea(
      'Comercial',
      `Nave disponible tras acta de restitución — verificar oportunidades en espera`,
    );

    await notificacionService.notifyArea(
      'CxC',
      `Ejecutar devolución de depósito: ${montoADevolver.toFixed(2)} USD`,
    );
  },

  findByCasoLegal: async (casoLegalId: string) =>
    twentyDataService.findActasByCasoLegal(casoLegalId),
};
