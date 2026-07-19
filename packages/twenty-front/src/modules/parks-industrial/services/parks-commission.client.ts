import { PARKS_SERVICE_URL } from '@/parks-industrial/constants/parks-commercial.constants';
import { type ParksComisionRecord } from '@/parks-industrial/hooks/useParksRecords';

const parseErrorMessage = async (response: Response): Promise<string> => {
  const errorBody = (await response.json().catch(() => null)) as {
    error?: string;
  } | null;

  return (
    errorBody?.error ??
    `Error del servicio Parks Industrial (${response.status})`
  );
};

export type ParksCommissionRateMatrix = {
  DIRECTO: {
    NUEVO: { CONSTRUIDA?: number; POR_CONSTRUIR?: number };
    RENOVACION: { rate?: number };
  };
  BROKER_TOP_10: {
    NUEVO: { CONSTRUIDA?: number; POR_CONSTRUIR?: number };
    RENOVACION: { rate?: number };
  };
  BROKER_NO_TOP_10: {
    NUEVO: { CONSTRUIDA?: number; POR_CONSTRUIR?: number };
    RENOVACION: { rate?: number };
  };
};

export type ParksCommissionDashboard = {
  totalPeriodo: number;
  byTipoPago: { interno: number; externo: number };
  byOrigen: { directo: number; top10: number; noTop10: number };
  byLo: Array<{ name: string; total: number }>;
  byBroker: Array<{ name: string; total: number }>;
  pendientesValidacion: number;
  pendientesMonto: number;
  stalePendientes: number;
  totalComisiones: number;
  comisiones: ParksComisionRecord[];
};

export const fetchParksCommissionDashboard =
  async (): Promise<ParksCommissionDashboard> => {
    const response = await fetch(`${PARKS_SERVICE_URL}/commissions/dashboard`);

    if (!response.ok) {
      throw new Error(await parseErrorMessage(response));
    }

    return (await response.json()) as ParksCommissionDashboard;
  };

export const fetchParksCommissionRates =
  async (): Promise<ParksCommissionRateMatrix> => {
    const response = await fetch(`${PARKS_SERVICE_URL}/commissions/rates`);

    if (!response.ok) {
      throw new Error(await parseErrorMessage(response));
    }

    const body = (await response.json()) as {
      matrix: ParksCommissionRateMatrix;
    };

    return body.matrix;
  };

export const saveParksCommissionRates = async (
  matrix: ParksCommissionRateMatrix,
): Promise<{
  matrix: ParksCommissionRateMatrix;
  recalculated?: { updated: number; skipped: number };
  dashboard?: ParksCommissionDashboard;
}> => {
  const response = await fetch(`${PARKS_SERVICE_URL}/commissions/rates`, {
    method: 'PUT',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ matrix }),
  });

  if (!response.ok) {
    throw new Error(await parseErrorMessage(response));
  }

  return (await response.json()) as {
    matrix: ParksCommissionRateMatrix;
    recalculated?: { updated: number; skipped: number };
    dashboard?: ParksCommissionDashboard;
  };
};

export const backfillParksFolios = async (): Promise<{
  updated: number;
  skipped: number;
  folios: string[];
}> => {
  const response = await fetch(
    `${PARKS_SERVICE_URL}/commissions/backfill-folios`,
    { method: 'POST' },
  );

  if (!response.ok) {
    throw new Error(await parseErrorMessage(response));
  }

  return (await response.json()) as {
    updated: number;
    skipped: number;
    folios: string[];
  };
};

export const approveParksCommission = async (input: {
  comisionId: string;
  aprobadoPor: string;
  ajusteMonto?: number;
  motivoAjuste?: string;
}): Promise<ParksComisionRecord> => {
  const response = await fetch(
    `${PARKS_SERVICE_URL}/commissions/${input.comisionId}/approve`,
    {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(input),
    },
  );

  if (!response.ok) {
    throw new Error(await parseErrorMessage(response));
  }

  const body = (await response.json()) as { comision: ParksComisionRecord };

  return body.comision;
};

export const rejectParksCommission = async (input: {
  comisionId: string;
  aprobadoPor: string;
  motivoAjuste: string;
}): Promise<ParksComisionRecord> => {
  const response = await fetch(
    `${PARKS_SERVICE_URL}/commissions/${input.comisionId}/reject`,
    {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(input),
    },
  );

  if (!response.ok) {
    throw new Error(await parseErrorMessage(response));
  }

  const body = (await response.json()) as { comision: ParksComisionRecord };

  return body.comision;
};

export const markParksCommissionPaid = async (
  comisionId: string,
): Promise<ParksComisionRecord> => {
  const response = await fetch(
    `${PARKS_SERVICE_URL}/commissions/${comisionId}/pay`,
    {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({}),
    },
  );

  if (!response.ok) {
    throw new Error(await parseErrorMessage(response));
  }

  const body = (await response.json()) as { comision: ParksComisionRecord };

  return body.comision;
};

export const getParksCommissionExportUrl = (): string =>
  `${PARKS_SERVICE_URL}/commissions/export.csv`;
