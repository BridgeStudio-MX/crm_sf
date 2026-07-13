import { HOLDOVER_RESOLUCION_ACTIVO } from '../constants/parks.constants';
import { toIsoDateString } from '../utils/business-days.util';
import { toSelectValue } from '../utils/select-value.util';
import { notificacionService } from './notificacion.service';
import { twentyDataService } from './twenty-data.service';

export const holdoverCondonacionService = {
  requestCondonacion: async ({
    holdoverId,
    motivo,
    montoSolicitado,
  }: {
    holdoverId: string;
    motivo: string;
    montoSolicitado: number;
  }) => {
    await twentyDataService.updateHoldover(holdoverId, {
      condonacionSolicitada: true,
      condonacionMotivo: motivo,
      montoCondonado: montoSolicitado,
      condonacionEstatus: toSelectValue('Pendiente'),
    });

    await notificacionService.notifyArea(
      'CEO',
      `Solicitud de condonación holdover — ${montoSolicitado.toFixed(2)} USD: ${motivo}`,
    );

    await twentyDataService.createTask(
      '[CEO] Aprobar condonación holdover',
      motivo,
    );
  },

  resolveCondonacion: async ({
    holdoverId,
    aprobada,
    aprobadoPor,
    comentario,
  }: {
    holdoverId: string;
    aprobada: boolean;
    aprobadoPor: string;
    comentario?: string;
  }) => {
    await twentyDataService.updateHoldover(holdoverId, {
      condonacionAutorizada: aprobada,
      condonacionAutorizadaPor: aprobadoPor,
      condonacionEstatus: toSelectValue(aprobada ? 'Aprobada' : 'Rechazada'),
      resolucion: toSelectValue(aprobada ? 'Condonado' : HOLDOVER_RESOLUCION_ACTIVO),
    });

    const message = aprobada
      ? `Condonación aprobada por ${aprobadoPor}${comentario ? `: ${comentario}` : ''}`
      : `Condonación rechazada por ${aprobadoPor}${comentario ? `: ${comentario}` : ''}`;

    await notificacionService.notifyArea('Legal', message);

    if (aprobada) {
      await notificacionService.notifyArea(
        'CxC',
        `Emitir nota de crédito por condonación holdover (${holdoverId})`,
      );
    }
  },

  listPendingCondonaciones: async () => {
    const holdovers = await twentyDataService.findHoldoversActivos();

    return holdovers.filter(
      (holdover) =>
        holdover.condonacionSolicitada === true &&
        holdover.condonacionEstatus === toSelectValue('Pendiente'),
    );
  },
};

export const holdoverAccumulationService = {
  refreshAccumulatedAmounts: async (): Promise<void> => {
    const holdovers = await twentyDataService.findHoldoversActivos();
    const today = new Date();

    for (const holdover of holdovers) {
      const holdoverRecord = holdover as {
        id: string;
        fechaInicioHoldover?: string;
        montoHoldoverMensual?: number;
        facturasEmitidas?: number;
        montoCobradoUsd?: number;
      };

      if (!holdoverRecord.fechaInicioHoldover) {
        continue;
      }

      const startDate = new Date(holdoverRecord.fechaInicioHoldover);
      const diasHoldoverAcumulados = Math.max(
        0,
        Math.floor(
          (today.getTime() - startDate.getTime()) / (1000 * 60 * 60 * 24),
        ),
      );
      const monthsElapsed = Math.max(1, Math.ceil(diasHoldoverAcumulados / 30));
      const montoHoldoverMensual = holdoverRecord.montoHoldoverMensual ?? 0;
      const montoAcumuladoUsd = montoHoldoverMensual * monthsElapsed;
      const montoCobradoUsd =
        (holdoverRecord.facturasEmitidas ?? 0) * montoHoldoverMensual;

      await twentyDataService.updateHoldover(holdoverRecord.id, {
        diasHoldoverAcumulados,
        montoAcumuladoUsd,
        montoCobradoUsd,
      });
    }
  },
};
