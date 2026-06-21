import { oracleConfig } from '../config/oracle.config';
import {
  type OracleContratoNuevoPayload,
  type OracleHoldoverIniciarPayload,
  type OracleNaveDisponibilidadRecord,
  type OraclePagoRecord,
  type OracleRenovacionPayload,
} from '../types/oracle.types';

const MOCK_PAGOS: OraclePagoRecord[] = [
  {
    clienteId: 'ORC-CLI-LOGIMEX-001',
    fecha: '2026-06-15',
    alCorriente: true,
  },
  {
    clienteId: 'ORC-CLI-RETAIL-002',
    fecha: '2026-05-20',
    alCorriente: false,
  },
];

const MOCK_NAVES: OracleNaveDisponibilidadRecord[] = [
  { naveId: 'ORC-NAV-GDL-001', estatus: 'RENTADA' },
  { naveId: 'ORC-NAV-GDL-002', estatus: 'DISPONIBLE' },
  { naveId: 'ORC-NAV-MTY-001', estatus: 'EN_NEGOCIACION' },
];

const logMockRequest = (
  method: string,
  path: string,
  payload?: unknown,
): void => {
  console.log(`[Oracle MOCK] ${method} ${path}`, payload ?? '');
};

export class OracleClient {
  async fetchPagos(desde: string | null): Promise<OraclePagoRecord[]> {
    if (oracleConfig.mock) {
      logMockRequest('GET', '/pagos', { desde });
      return MOCK_PAGOS;
    }

    const url = new URL(`${oracleConfig.apiUrl}/pagos`);

    if (desde) {
      url.searchParams.set('desde', desde);
    }

    const response = await fetch(url.toString(), {
      headers: {
        Authorization: `Bearer ${oracleConfig.apiKey}`,
        'Content-Type': 'application/json',
      },
    });

    if (!response.ok) {
      throw new Error(`Oracle pagos API failed: ${response.status}`);
    }

    const body = (await response.json()) as {
      pagos: {
        cliente_id: string;
        fecha: string;
        al_corriente: boolean;
      }[];
    };

    return body.pagos.map((pago) => ({
      clienteId: pago.cliente_id,
      fecha: pago.fecha,
      alCorriente: pago.al_corriente,
    }));
  }

  async fetchNavesDisponibilidad(): Promise<OracleNaveDisponibilidadRecord[]> {
    if (oracleConfig.mock) {
      logMockRequest('GET', '/naves/disponibilidad');
      return MOCK_NAVES;
    }

    const response = await fetch(
      `${oracleConfig.apiUrl}/naves/disponibilidad`,
      {
        headers: {
          Authorization: `Bearer ${oracleConfig.apiKey}`,
          'Content-Type': 'application/json',
        },
      },
    );

    if (!response.ok) {
      throw new Error(`Oracle naves API failed: ${response.status}`);
    }

    const body = (await response.json()) as {
      naves: { nave_id: string; estatus: string }[];
    };

    return body.naves.map((nave) => ({
      naveId: nave.nave_id,
      estatus: nave.estatus,
    }));
  }

  async postContratoNuevo(payload: OracleContratoNuevoPayload): Promise<void> {
    if (oracleConfig.mock) {
      logMockRequest('POST', '/contratos/nuevo', payload);
      return;
    }

    const response = await fetch(`${oracleConfig.apiUrl}/contratos/nuevo`, {
      method: 'POST',
      headers: {
        Authorization: `Bearer ${oracleConfig.apiKey}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        oracle_nave_id: payload.oracleNaveId,
        oracle_cliente_id: payload.oracleClienteId,
        expediente_id: payload.expedienteId,
        fecha_inicio: payload.fechaInicio,
        fecha_vencimiento: payload.fechaVencimiento,
        renta_mensual_usd: payload.rentaMensualUsd,
      }),
    });

    if (!response.ok) {
      throw new Error(`Oracle contrato nuevo failed: ${response.status}`);
    }
  }

  async postHoldoverIniciar(
    payload: OracleHoldoverIniciarPayload,
  ): Promise<void> {
    if (oracleConfig.mock) {
      logMockRequest('POST', '/holdover/iniciar', payload);
      return;
    }

    const response = await fetch(`${oracleConfig.apiUrl}/holdover/iniciar`, {
      method: 'POST',
      headers: {
        Authorization: `Bearer ${oracleConfig.apiKey}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        oracle_cliente_id: payload.oracleClienteId,
        oracle_nave_id: payload.oracleNaveId,
        fecha_inicio: payload.fechaInicio,
        monto_holdover: payload.montoHoldover,
      }),
    });

    if (!response.ok) {
      throw new Error(`Oracle holdover iniciar failed: ${response.status}`);
    }
  }

  async putContratoRenovar(payload: OracleRenovacionPayload): Promise<void> {
    if (oracleConfig.mock) {
      logMockRequest('PUT', '/contratos/renovar', payload);
      return;
    }

    const response = await fetch(`${oracleConfig.apiUrl}/contratos/renovar`, {
      method: 'PUT',
      headers: {
        Authorization: `Bearer ${oracleConfig.apiKey}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        oracle_contrato_id: payload.oracleContratoId,
        nueva_fecha_venc: payload.nuevaFechaVencimiento,
        nueva_renta: payload.nuevaRenta,
      }),
    });

    if (!response.ok) {
      throw new Error(`Oracle contrato renovar failed: ${response.status}`);
    }
  }
}

export const oracleClient = new OracleClient();
