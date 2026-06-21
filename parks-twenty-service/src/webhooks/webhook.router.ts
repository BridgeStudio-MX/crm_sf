import { Router } from 'express';

import { envConfig } from '../config/env.config';
import { TwentyWebhookPayload } from '../types/parks.types';
import { handleCasoLegalWebhook } from './handlers/caso-legal.handler';
import { handleContratoWebhook } from './handlers/contrato.handler';
import { handleFlujoFirmasWebhook } from './handlers/flujo-firmas.handler';
import { handleOportunidadWebhook } from './handlers/oportunidad.handler';
import { parseTwentyWebhook } from './webhook-payload.util';
import { verifyTwentyWebhookSignature } from './webhook-signature.util';

export const webhookRouter = Router();

const HANDLERS_BY_OBJECT: Record<
  string,
  (payload: TwentyWebhookPayload) => Promise<void>
> = {
  opportunity: handleOportunidadWebhook,
  casoLegal: handleCasoLegalWebhook,
  flujoFirmas: handleFlujoFirmasWebhook,
  expedienteContrato: handleContratoWebhook,
};

webhookRouter.post('/twenty', async (request, response) => {
  const payload = request.body as TwentyWebhookPayload;

  if (envConfig.webhookSecret) {
    const isValidSignature = verifyTwentyWebhookSignature(
      payload,
      envConfig.webhookSecret,
      request.header('X-Twenty-Webhook-Timestamp'),
      request.header('X-Twenty-Webhook-Signature'),
    );

    if (!isValidSignature) {
      console.warn('[webhook] Invalid signature — rejected');
      response.status(401).json({ error: 'Invalid webhook signature' });
      return;
    }
  }

  const parsedWebhook = parseTwentyWebhook(payload);

  console.log('[webhook] Received Twenty event:', {
    eventName: payload.eventName,
    objectName: parsedWebhook?.objectNameSingular ?? payload.objectName,
    recordId: parsedWebhook?.recordId ?? payload.recordId,
    action: parsedWebhook?.action,
    updatedFields: parsedWebhook?.updatedFields,
  });

  if (!parsedWebhook) {
    response.status(400).json({ error: 'Invalid webhook payload' });
    return;
  }

  const handler = HANDLERS_BY_OBJECT[parsedWebhook.objectNameSingular];

  if (!handler) {
    console.log(
      `[webhook] No handler registered for object: ${parsedWebhook.objectNameSingular}`,
    );
    response.status(200).json({ received: true, handled: false });
    return;
  }

  try {
    await handler(payload);
    response.status(200).json({ received: true, handled: true });
  } catch (error) {
    const message = error instanceof Error ? error.message : 'Unknown error';
    console.error('[webhook] Handler error:', message);
    response.status(500).json({ error: message });
  }
});
