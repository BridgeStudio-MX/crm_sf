import { PARKS_SERVICE_URL } from '@/parks-industrial/constants/parks-commercial.constants';
import {
  type ComiteAutorizacion,
  type ComiteListResponse,
  type ComiteVotoValor,
} from '@/parks-industrial/types/parks-comite.types';

export const PARKS_COMITE_ENDPOINT = `${PARKS_SERVICE_URL}/comite`;

const parseErrorMessage = async (response: Response): Promise<string> => {
  try {
    const payload = (await response.json()) as { error?: string };
    return payload.error ?? response.statusText;
  } catch {
    return response.statusText;
  }
};

export const fetchParksComiteList = async (
  viewerEmail?: string,
): Promise<ComiteListResponse> => {
  const query = viewerEmail
    ? `?viewerEmail=${encodeURIComponent(viewerEmail)}`
    : '';
  const response = await fetch(`${PARKS_COMITE_ENDPOINT}${query}`);

  if (!response.ok) {
    throw new Error(await parseErrorMessage(response));
  }

  return (await response.json()) as ComiteListResponse;
};

export const fetchParksComiteById = async (
  comiteId: string,
): Promise<ComiteAutorizacion> => {
  const response = await fetch(`${PARKS_COMITE_ENDPOINT}/${comiteId}`);

  if (!response.ok) {
    throw new Error(await parseErrorMessage(response));
  }

  return (await response.json()) as ComiteAutorizacion;
};

export const fetchParksComiteByOpportunity = async (
  opportunityId: string,
): Promise<ComiteAutorizacion | null> => {
  const response = await fetch(
    `${PARKS_COMITE_ENDPOINT}/by-opportunity/${opportunityId}`,
  );

  if (response.status === 404) {
    return null;
  }

  if (!response.ok) {
    throw new Error(await parseErrorMessage(response));
  }

  return (await response.json()) as ComiteAutorizacion;
};

export const voteParksComite = async ({
  comiteId,
  memberId,
  voto,
  comentario,
  viewerEmail,
}: {
  comiteId: string;
  memberId: string;
  voto: Exclude<ComiteVotoValor, 'Pendiente'>;
  comentario?: string;
  viewerEmail?: string;
}): Promise<ComiteAutorizacion> => {
  const response = await fetch(`${PARKS_COMITE_ENDPOINT}/${comiteId}/vote`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ memberId, voto, comentario, viewerEmail }),
  });

  if (!response.ok) {
    throw new Error(await parseErrorMessage(response));
  }

  return (await response.json()) as ComiteAutorizacion;
};

export const decideParksComiteAsCeo = async ({
  comiteId,
  decision,
  comentario,
  viewerEmail,
  viewerNombre,
}: {
  comiteId: string;
  decision: 'Aprueba' | 'Rechaza';
  comentario?: string;
  viewerEmail?: string;
  viewerNombre?: string;
}): Promise<ComiteAutorizacion> => {
  const response = await fetch(
    `${PARKS_COMITE_ENDPOINT}/${comiteId}/ceo-decision`,
    {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        decision,
        comentario,
        viewerEmail,
        viewerNombre,
      }),
    },
  );

  if (!response.ok) {
    throw new Error(await parseErrorMessage(response));
  }

  return (await response.json()) as ComiteAutorizacion;
};

export const requestParksComiteSessionAdjustments = async ({
  comiteId,
  texto,
  viewerNombre,
}: {
  comiteId: string;
  texto: string;
  viewerNombre?: string;
}): Promise<ComiteAutorizacion> => {
  const response = await fetch(
    `${PARKS_COMITE_ENDPOINT}/${comiteId}/session-adjustments`,
    {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ texto, viewerNombre }),
    },
  );

  if (!response.ok) {
    throw new Error(await parseErrorMessage(response));
  }

  return (await response.json()) as ComiteAutorizacion;
};

export const resubmitParksComiteAfterAdjustments = async (
  comiteId: string,
): Promise<ComiteAutorizacion> => {
  const response = await fetch(
    `${PARKS_COMITE_ENDPOINT}/${comiteId}/resubmit-after-adjustments`,
    { method: 'POST' },
  );

  if (!response.ok) {
    throw new Error(await parseErrorMessage(response));
  }

  return (await response.json()) as ComiteAutorizacion;
};

export const askParksComiteQuestion = async ({
  comiteId,
  memberId,
  preguntaTexto,
}: {
  comiteId: string;
  memberId: string;
  preguntaTexto: string;
}): Promise<ComiteAutorizacion> => {
  const response = await fetch(
    `${PARKS_COMITE_ENDPOINT}/${comiteId}/questions`,
    {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ memberId, preguntaTexto }),
    },
  );

  if (!response.ok) {
    throw new Error(await parseErrorMessage(response));
  }

  return (await response.json()) as ComiteAutorizacion;
};

export const answerParksComiteQuestion = async ({
  comiteId,
  preguntaId,
  respuestaTexto,
  respuestaPorNombre,
}: {
  comiteId: string;
  preguntaId: string;
  respuestaTexto: string;
  respuestaPorNombre: string;
}): Promise<ComiteAutorizacion> => {
  const response = await fetch(
    `${PARKS_COMITE_ENDPOINT}/${comiteId}/questions/${preguntaId}/answer`,
    {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ respuestaTexto, respuestaPorNombre }),
    },
  );

  if (!response.ok) {
    throw new Error(await parseErrorMessage(response));
  }

  return (await response.json()) as ComiteAutorizacion;
};
