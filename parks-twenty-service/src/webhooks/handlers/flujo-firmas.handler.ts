import { FLUJO_FIRMAS_ESTATUS_FIRMADO } from '../../constants/parks.constants';
import { firmasService } from '../../services/firmas.service';
import { type TwentyWebhookPayload } from '../../types/parks.types';
import { isSelectValueEqual } from '../../utils/select-value.util';
import { parseTwentyWebhook, wasFieldUpdated } from '../webhook-payload.util';

export const handleFlujoFirmasWebhook = async (
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

  if (!isSelectValueEqual(estatus, FLUJO_FIRMAS_ESTATUS_FIRMADO)) {
    return;
  }

  const casoLegalId =
    typeof parsedWebhook.record.casoLegalId === 'string'
      ? parsedWebhook.record.casoLegalId
      : undefined;

  if (!casoLegalId) {
    console.warn(
      `[flujo-firmas.handler] Missing casoLegalId on flujo ${parsedWebhook.recordId}`,
    );
    return;
  }

  await firmasService.advanceAfterSignature(casoLegalId);

  console.log(
    `[flujo-firmas.handler] Signature recorded — flujo ${parsedWebhook.recordId}, caso ${casoLegalId}`,
  );
};
