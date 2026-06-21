import { oracleConfig } from '../config/oracle.config';
import {
  type OracleNaveDisponibilidadRecord,
  type OraclePagoRecord,
} from '../types/oracle.types';

const mapOracleNaveStatusToTwenty = (oracleStatus: string): string => {
  const statusMap: Record<string, string> = {
    DISPONIBLE: 'DISPONIBLE',
    RENTADA: 'RENTADA',
    EN_NEGOCIACION: 'EN_NEGOCIACION',
    EN_CONSTRUCCION: 'EN_CONSTRUCCION',
  };

  return statusMap[oracleStatus.toUpperCase()] ?? oracleStatus;
};

export const oracleTwentyBridge = {
  applyPagoToInquilino: async (pago: OraclePagoRecord): Promise<void> => {
    console.log(
      `[oracle.bridge] Update inquilino oracleClienteId=${pago.clienteId}`,
      {
        ultimoPagoFecha: pago.fecha,
        pagosAlCorriente: pago.alCorriente,
      },
    );

    if (!oracleConfig.mock) {
      // Javier — conectar GraphQL data API cuando Oracle real esté disponible
      console.warn(
        '[oracle.bridge] Production Twenty update pending Oracle ERP integration',
      );
    }
  },

  applyNaveDisponibilidad: async (
    naveRecord: OracleNaveDisponibilidadRecord,
  ): Promise<void> => {
    const twentyStatus = mapOracleNaveStatusToTwenty(naveRecord.estatus);

    console.log(
      `[oracle.bridge] Update nave oracleNaveId=${naveRecord.naveId}`,
      { estatus: twentyStatus },
    );

    if (!oracleConfig.mock) {
      console.warn(
        '[oracle.bridge] Production Twenty update pending Oracle ERP integration',
      );
    }
  },

  markExpedienteOracleSincronizado: async (
    expedienteId: string,
  ): Promise<void> => {
    console.log(
      `[oracle.bridge] Mark expediente ${expedienteId} oracleSincronizado=true`,
    );
  },

  markHoldoverOracleNotificado: async (holdoverId: string): Promise<void> => {
    console.log(
      `[oracle.bridge] Mark holdover ${holdoverId} oracleNotificado=true`,
    );
  },
};
