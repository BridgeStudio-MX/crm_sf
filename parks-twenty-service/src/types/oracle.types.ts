export type OraclePagoRecord = {
  clienteId: string;
  fecha: string;
  alCorriente: boolean;
};

export type OracleNaveDisponibilidadRecord = {
  naveId: string;
  estatus: string;
};

export type OracleContratoNuevoPayload = {
  oracleNaveId: string;
  oracleClienteId: string;
  expedienteId: string;
  fechaInicio: string;
  fechaVencimiento: string;
  rentaMensualUsd: number;
};

export type OracleHoldoverIniciarPayload = {
  oracleClienteId: string;
  oracleNaveId: string;
  fechaInicio: string;
  montoHoldover: number;
};

export type OracleRenovacionPayload = {
  oracleContratoId: string;
  nuevaFechaVencimiento: string;
  nuevaRenta: number;
};

export type ExpedienteContratoNotification = {
  id: string;
  numeroExpediente: string;
  fechaVencimiento: string;
  rentaMensualUsd: number;
  oracleContratoId?: string;
  nave: {
    oracleNaveId: string;
    identificador?: string;
  };
  inquilino: {
    oracleClienteId: string;
    empresa?: string;
  };
  casoLegal?: {
    hojaDeAcuerdos?: {
      fechaInicio?: string;
    };
  };
};

export type HoldoverNotification = {
  id: string;
  fechaInicioHoldover: string;
  montoHoldoverMensual: number;
  nave: {
    oracleNaveId: string;
    identificador: string;
  };
  inquilino: {
    oracleClienteId: string;
    empresa?: string;
  };
};

export type OracleSyncResult = {
  pagosProcessed: number;
  navesProcessed: number;
  completedAt: string;
};

export type OracleSyncStatus = {
  lastSuccessfulSyncAt: string | null;
  lastError: string | null;
  mock: boolean;
};
