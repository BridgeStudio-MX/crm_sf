import { oracleConfig } from '../config/oracle.config';
import { oracleClient } from './oracle.client';
import { oracleTwentyBridge } from './oracle-twenty-bridge.service';
import {
  type ExpedienteContratoNotification,
  type HoldoverNotification,
  type OracleSyncResult,
  type OracleSyncStatus,
} from '../types/oracle.types';

let lastSuccessfulSyncAt: string | null = null;
let lastSyncError: string | null = null;

export const oracleService = {
  getSyncStatus: (): OracleSyncStatus => ({
    lastSuccessfulSyncAt,
    lastError: lastSyncError,
    mock: oracleConfig.mock,
  }),

  syncPagosDesdeOracle: async (): Promise<number> => {
    const pagos = await oracleClient.fetchPagos(lastSuccessfulSyncAt);

    for (const pago of pagos) {
      await oracleTwentyBridge.applyPagoToInquilino(pago);
    }

    console.log(
      `[oracle.service] syncPagosDesdeOracle — ${pagos.length} pagos processed`,
    );

    return pagos.length;
  },

  syncDisponibilidadNaves: async (): Promise<number> => {
    const naves = await oracleClient.fetchNavesDisponibilidad();

    for (const nave of naves) {
      await oracleTwentyBridge.applyNaveDisponibilidad(nave);
    }

    console.log(
      `[oracle.service] syncDisponibilidadNaves — ${naves.length} naves processed`,
    );

    return naves.length;
  },

  syncAll: async (): Promise<OracleSyncResult> => {
    console.log('[oracle.service] Starting Oracle sync...');

    try {
      const pagosProcessed = await oracleService.syncPagosDesdeOracle();
      const navesProcessed = await oracleService.syncDisponibilidadNaves();
      const completedAt = new Date().toISOString();

      lastSuccessfulSyncAt = completedAt;
      lastSyncError = null;

      console.log('[oracle.service] Oracle sync completed');

      return { pagosProcessed, navesProcessed, completedAt };
    } catch (error) {
      const message = error instanceof Error ? error.message : String(error);
      lastSyncError = message;
      console.error('[oracle.service] Oracle sync failed:', message);
      throw error;
    }
  },

  notifyContratoFirmado: async (
    expediente: ExpedienteContratoNotification,
  ): Promise<void> => {
    await oracleClient.postContratoNuevo({
      oracleNaveId: expediente.nave.oracleNaveId,
      oracleClienteId: expediente.inquilino.oracleClienteId,
      expedienteId: expediente.numeroExpediente,
      fechaInicio:
        expediente.casoLegal?.hojaDeAcuerdos?.fechaInicio ??
        new Date().toISOString().slice(0, 10),
      fechaVencimiento: expediente.fechaVencimiento,
      rentaMensualUsd: expediente.rentaMensualUsd,
    });

    await oracleTwentyBridge.markExpedienteOracleSincronizado(expediente.id);

    console.log(
      `[oracle.service] notifyContratoFirmado — ${expediente.numeroExpediente}`,
    );
  },

  notifyHoldoverIniciado: async (
    holdover: HoldoverNotification,
  ): Promise<void> => {
    await oracleClient.postHoldoverIniciar({
      oracleClienteId: holdover.inquilino.oracleClienteId,
      oracleNaveId: holdover.nave.oracleNaveId,
      fechaInicio: holdover.fechaInicioHoldover,
      montoHoldover: holdover.montoHoldoverMensual,
    });

    await oracleTwentyBridge.markHoldoverOracleNotificado(holdover.id);

    console.log(
      `[oracle.service] notifyHoldoverIniciado — ${holdover.nave.identificador}`,
    );
  },

  // Alias for backward compatibility with early stubs
  notifyHoldover: async (holdoverId: string): Promise<void> => {
    await oracleService.notifyHoldoverIniciado({
      id: holdoverId,
      fechaInicioHoldover: new Date().toISOString().slice(0, 10),
      montoHoldoverMensual: 0,
      nave: {
        oracleNaveId: 'ORC-NAV-MOCK',
        identificador: 'NAV-MOCK',
      },
      inquilino: {
        oracleClienteId: 'ORC-CLI-MOCK',
      },
    });
  },

  notifyRenovacionFirmada: async (
    expediente: ExpedienteContratoNotification,
  ): Promise<void> => {
    if (!expediente.oracleContratoId) {
      console.warn(
        `[oracle.service] notifyRenovacionFirmada skipped — missing oracleContratoId for ${expediente.numeroExpediente}`,
      );
      return;
    }

    await oracleClient.putContratoRenovar({
      oracleContratoId: expediente.oracleContratoId,
      nuevaFechaVencimiento: expediente.fechaVencimiento,
      nuevaRenta: expediente.rentaMensualUsd,
    });

    console.log(
      `[oracle.service] notifyRenovacionFirmada — ${expediente.numeroExpediente}`,
    );
  },
};
