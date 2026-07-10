import { commercialLostService } from '../../services/commercial-lost.service';
import { type TwentyWebhookPayload } from '../../types/parks.types';
import {
  parseTwentyWebhook,
  wasFieldUpdated,
} from '../webhook-payload.util';

export const handleNaveWebhook = async (
  payload: TwentyWebhookPayload,
): Promise<void> => {
  const parsedWebhook = parseTwentyWebhook(payload);

  if (!parsedWebhook || parsedWebhook.action !== 'updated') {
    return;
  }

  if (!wasFieldUpdated(parsedWebhook, 'estatus')) {
    return;
  }

  const estatus =
    typeof parsedWebhook.record.estatus === 'string'
      ? parsedWebhook.record.estatus
      : undefined;

  const isDisponible =
    estatus === 'DISPONIBLE' ||
    estatus === 'Disponible' ||
    (estatus ?? '').toLowerCase().includes('disponible');

  if (!isDisponible) {
    return;
  }

  const m2 =
    typeof parsedWebhook.record.m2 === 'number'
      ? parsedWebhook.record.m2
      : undefined;
  const identificador =
    typeof parsedWebhook.record.identificador === 'string'
      ? parsedWebhook.record.identificador
      : undefined;

  const parque = parsedWebhook.record.parque as
    | { nombre?: string; ubicacion?: string }
    | undefined;

  const matchCount = await commercialLostService.matchDisponibleNave({
    id: parsedWebhook.recordId,
    identificador,
    m2,
    ubicacion: parque?.ubicacion,
    parqueNombre: parque?.nombre,
  });

  if (matchCount > 0) {
    console.log(
      `[nave.handler] ${matchCount} lost-opportunity match(es) for nave ${identificador ?? parsedWebhook.recordId}`,
    );
  }
};
