import {
  PARKS_CEO_DASHBOARD_ENDPOINT,
  PARKS_CEO_INBOX_ENDPOINT,
  PARKS_CEO_INBOX_RESOLVE_ENDPOINT,
} from '@/parks-industrial/constants/parks-ceo.constants';
import {
  type ParksCeoExecutiveDashboardResult,
  type ParksCeoInboxItem,
  type ParksCeoInboxItemKind,
  type ParksCeoInboxSummary,
} from '@/parks-industrial/types/parks-ceo-dashboard.types';

const parseErrorMessage = async (response: Response): Promise<string> => {
  const errorBody = (await response.json().catch(() => null)) as {
    error?: string;
  } | null;

  return (
    errorBody?.error ??
    `Error del servicio Parks Industrial (${response.status})`
  );
};

const EMPTY_INBOX: ParksCeoInboxSummary = {
  total: 0,
  aprobacionesComerciales: 0,
  condonaciones: 0,
  firmas: 0,
  items: [],
};

const normalizeInbox = (
  inbox: ParksCeoInboxSummary | undefined,
): ParksCeoInboxSummary => {
  if (!inbox) {
    return EMPTY_INBOX;
  }

  return {
    total: inbox.total ?? inbox.items?.length ?? 0,
    aprobacionesComerciales: inbox.aprobacionesComerciales ?? 0,
    condonaciones: inbox.condonaciones ?? 0,
    firmas: inbox.firmas ?? 0,
    items: inbox.items ?? [],
  };
};

export const fetchParksCeoExecutiveDashboard =
  async (): Promise<ParksCeoExecutiveDashboardResult> => {
    const response = await fetch(PARKS_CEO_DASHBOARD_ENDPOINT);

    if (!response.ok) {
      throw new Error(await parseErrorMessage(response));
    }

    const result =
      (await response.json()) as ParksCeoExecutiveDashboardResult;

    return {
      ...result,
      inbox: normalizeInbox(result.inbox),
    };
  };

export const fetchParksCeoInbox = async (): Promise<ParksCeoInboxSummary> => {
  const response = await fetch(PARKS_CEO_INBOX_ENDPOINT);

  if (!response.ok) {
    throw new Error(await parseErrorMessage(response));
  }

  return normalizeInbox((await response.json()) as ParksCeoInboxSummary);
};

export const resolveParksCeoInboxItem = async (input: {
  item: ParksCeoInboxItem;
  decision: 'Aprobada' | 'Rechazada';
  resolvedBy: string;
  comentario?: string;
}): Promise<void> => {
  const response = await fetch(PARKS_CEO_INBOX_RESOLVE_ENDPOINT(input.item.id), {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      decision: input.decision,
      resolvedBy: input.resolvedBy,
      comentario: input.comentario,
      entityId: input.item.entityId,
      kind: input.item.kind as ParksCeoInboxItemKind,
      isDemo: input.item.isDemo === true,
    }),
  });

  if (!response.ok) {
    throw new Error(await parseErrorMessage(response));
  }
};
