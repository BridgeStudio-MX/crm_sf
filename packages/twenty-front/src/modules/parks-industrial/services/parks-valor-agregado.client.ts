import { PARKS_SERVICE_URL } from '@/parks-industrial/constants/parks-commercial.constants';
import { type ValorAgregadoDashboard } from '@/parks-industrial/types/parks-valor-agregado.types';

export const PARKS_VALOR_AGREGADO_ENDPOINT = `${PARKS_SERVICE_URL}/valor-agregado`;

const parseErrorMessage = async (response: Response): Promise<string> => {
  const errorBody = (await response.json().catch(() => null)) as {
    error?: string;
  } | null;

  return (
    errorBody?.error ??
    `Error del servicio Parks Industrial (${response.status})`
  );
};

export const fetchValorAgregadoDashboard =
  async (): Promise<ValorAgregadoDashboard> => {
    const response = await fetch(`${PARKS_VALOR_AGREGADO_ENDPOINT}/dashboard`);

    if (!response.ok) {
      throw new Error(await parseErrorMessage(response));
    }

    return response.json() as Promise<ValorAgregadoDashboard>;
  };

export const createOfertaRenovacion = async (body: {
  casoLegalId: string;
  empresa: string;
  loNombre?: string;
  tipoIncentivo: string;
  diasGraciaAdicionales?: number;
  descuentoPorcentaje?: number;
  observaciones?: string;
}): Promise<unknown> => {
  const response = await fetch(`${PARKS_VALOR_AGREGADO_ENDPOINT}/ofertas`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(body),
  });

  if (!response.ok) {
    throw new Error(await parseErrorMessage(response));
  }

  return response.json();
};

export const updateOfertaRenovacionEstatus = async ({
  ofertaId,
  estatus,
}: {
  ofertaId: string;
  estatus: string;
}): Promise<unknown> => {
  const response = await fetch(
    `${PARKS_VALOR_AGREGADO_ENDPOINT}/ofertas/${ofertaId}/estatus`,
    {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ estatus }),
    },
  );

  if (!response.ok) {
    throw new Error(await parseErrorMessage(response));
  }

  return response.json();
};
