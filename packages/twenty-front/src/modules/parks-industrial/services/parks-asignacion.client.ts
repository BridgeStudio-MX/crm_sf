import { PARKS_SERVICE_URL } from '@/parks-industrial/constants/parks-commercial.constants';
import { type AsignacionDashboard } from '@/parks-industrial/types/parks-asignacion.types';

export const PARKS_ASIGNACION_ENDPOINT = `${PARKS_SERVICE_URL}/asignacion-inteligente`;

const parseErrorMessage = async (response: Response): Promise<string> => {
  const errorBody = (await response.json().catch(() => null)) as {
    error?: string;
  } | null;

  return (
    errorBody?.error ??
    `Error del servicio Parks Industrial (${response.status})`
  );
};

export const fetchAsignacionDashboard =
  async (): Promise<AsignacionDashboard> => {
    const response = await fetch(`${PARKS_ASIGNACION_ENDPOINT}/dashboard`);

    if (!response.ok) {
      throw new Error(await parseErrorMessage(response));
    }

    return response.json() as Promise<AsignacionDashboard>;
  };

export const seedAsignacionDemo = async (): Promise<unknown> => {
  const response = await fetch(`${PARKS_ASIGNACION_ENDPOINT}/seed-demo`, {
    method: 'POST',
  });

  if (!response.ok) {
    throw new Error(await parseErrorMessage(response));
  }

  return response.json();
};

export const confirmarAsignacionInteligente = async (body: {
  opportunityId: string;
  leasingOfficerName: string;
  assignedBy: string;
  razonCambio?: string;
}): Promise<unknown> => {
  const response = await fetch(
    `${PARKS_ASIGNACION_ENDPOINT}/confirmar-asignacion`,
    {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(body),
    },
  );

  if (!response.ok) {
    throw new Error(await parseErrorMessage(response));
  }

  return response.json();
};
