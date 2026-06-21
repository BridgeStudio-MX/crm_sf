import { twentyDataService } from '../../services/twenty-data.service';
import { type TwentyWebhookPayload } from '../../types/parks.types';
import { parseTwentyWebhook, wasFieldUpdated } from '../webhook-payload.util';

export const handleContratoWebhook = async (
  payload: TwentyWebhookPayload,
): Promise<void> => {
  const parsedWebhook = parseTwentyWebhook(payload);

  if (!parsedWebhook) {
    return;
  }

  const expediente = await twentyDataService.getExpedienteById(
    parsedWebhook.recordId,
  );

  const expedienteLabel =
    expediente?.numeroExpediente ?? parsedWebhook.recordId;

  if (parsedWebhook.action === 'created') {
    console.log(
      `[contrato.handler] Expediente opened — ${expedienteLabel}`,
    );
    return;
  }

  if (parsedWebhook.action !== 'updated') {
    return;
  }

  if (wasFieldUpdated(parsedWebhook, 'fechaVencimiento')) {
    console.log(
      `[contrato.handler] Vencimiento updated — ${expedienteLabel}`,
    );
  }

  if (wasFieldUpdated(parsedWebhook, 'estatus')) {
    console.log(
      `[contrato.handler] Estatus updated — ${expedienteLabel} → ${String(parsedWebhook.record.estatus ?? '—')}`,
    );
  }
};
