import {
  CASO_LEGAL_ESTATUS_CERRADO,
  HOLDOVER_ETAPA_DETECTADO,
  HOLDOVER_RESOLUCION_ACTIVO,
  INQUILINO_ESTATUS_HOLDOVER,
  NAVE_ESTATUS_RENTADA,
} from '../constants/parks.constants';
import { envConfig } from '../config/env.config';
import { type ExpedienteContratoRecord } from '../types/parks.types';
import { toIsoDateString } from '../utils/business-days.util';
import { isSelectValueEqual, toSelectValue } from '../utils/select-value.util';
import { notificacionService } from './notificacion.service';
import { oracleService } from './oracle.service';
import { semaforoService } from './semaforo.service';
import { twentyDataService } from './twenty-data.service';

const isRenovacionFirmada = (expediente: ExpedienteContratoRecord): boolean => {
  const casoLegal = expediente.casoLegal;

  if (!casoLegal) {
    return false;
  }

  return (
    isSelectValueEqual(casoLegal.estatus ?? '', CASO_LEGAL_ESTATUS_CERRADO) &&
    (casoLegal.tipoDocumento === toSelectValue('Convenio renovación') ||
      casoLegal.tipoDocumento === 'Convenio renovación')
  );
};

const buildHoldoverReferencia = (
  expediente: ExpedienteContratoRecord,
): string => {
  const naveLabel = expediente.nave?.identificador ?? expediente.naveId ?? 'NAVE';
  const inquilinoLabel =
    expediente.inquilino?.empresa ?? expediente.inquilinoId ?? 'INQUILINO';

  return `HO-${naveLabel}-${inquilinoLabel}`.slice(0, 120);
};

export const holdoverService = {
  processExpedienteVencido: async (
    expediente: ExpedienteContratoRecord,
  ): Promise<void> => {
    if (isRenovacionFirmada(expediente)) {
      return;
    }

    if (!expediente.naveId || !expediente.inquilinoId) {
      console.warn(
        `[holdover.service] Expediente ${expediente.id} missing nave/inquilino relations`,
      );
      return;
    }

    const existingHoldover = await twentyDataService.findActiveHoldoverForTenant(
      expediente.naveId,
      expediente.inquilinoId,
    );

    if (existingHoldover) {
      return;
    }

    const rentaBaseMensualUsd = expediente.rentaMensualUsd ?? 0;
    const montoHoldoverMensual =
      rentaBaseMensualUsd * envConfig.holdoverMultiplier;

    const holdover = await twentyDataService.createHoldover({
      referencia: buildHoldoverReferencia(expediente),
      fechaInicioHoldover: toIsoDateString(new Date()),
      rentaBaseMensualUsd,
      montoHoldoverMensual,
      facturasEmitidas: 0,
      resolucion: toSelectValue(HOLDOVER_RESOLUCION_ACTIVO),
      etapaPipeline: toSelectValue(HOLDOVER_ETAPA_DETECTADO),
      oracleNotificado: false,
      casoLegalId: expediente.casoLegalId,
      inquilinoId: expediente.inquilinoId,
      naveId: expediente.naveId,
    });

    if (!holdover) {
      return;
    }

    await twentyDataService.updateInquilino(expediente.inquilinoId, {
      estatus: toSelectValue(INQUILINO_ESTATUS_HOLDOVER),
    });

    await twentyDataService.updateNave(expediente.naveId, {
      estatus: toSelectValue(NAVE_ESTATUS_RENTADA),
    });

    if (expediente.casoLegalId) {
      await semaforoService.markCasoAsHoldover(expediente.casoLegalId);
    }

    const empresa = expediente.inquilino?.empresa ?? 'Inquilino';
    const nave = expediente.nave?.identificador ?? expediente.naveId;

    await notificacionService.notifyArea(
      'Legal',
      `Holdover detectado — ${empresa} / nave ${nave}`,
    );
    await notificacionService.notifyArea(
      'Comercial',
      `Holdover activo — ${empresa} / nave ${nave}`,
    );
    await notificacionService.notifyArea(
      'CxC',
      `Emitir factura holdover — ${empresa}: ${montoHoldoverMensual.toFixed(2)} USD/mes`,
    );

    await oracleService.notifyHoldoverIniciado({
      id: holdover.id,
      fechaInicioHoldover: toIsoDateString(new Date()),
      montoHoldoverMensual,
      nave: {
        oracleNaveId: 'ORC-NAV-MOCK',
        identificador: nave,
      },
      inquilino: {
        oracleClienteId: 'ORC-CLI-MOCK',
        empresa,
      },
    });

    console.log(
      `[holdover.service] Created holdover ${holdover.id} for expediente ${expediente.numeroExpediente ?? expediente.id}`,
    );
  },

  scanExpiringContracts: async (): Promise<void> => {
    const expedientesVencidos =
      await twentyDataService.findExpedientesVencidos();

    console.log(
      `[holdover.service] Scanning ${expedientesVencidos.length} expired contracts`,
    );

    for (const expediente of expedientesVencidos) {
      await holdoverService.processExpedienteVencido(expediente);
    }
  },
};
