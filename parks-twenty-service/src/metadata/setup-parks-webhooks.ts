import { envConfig } from '../config/env.config';
import { metadataClient } from './metadata-client';
import {
  PARKS_WEBHOOK_DESCRIPTION,
  PARKS_WEBHOOK_OPERATIONS,
} from './parks-webhook-definitions';

const operationsMatch = (
  currentOperations: string[],
  expectedOperations: readonly string[],
): boolean => {
  if (currentOperations.length !== expectedOperations.length) {
    return false;
  }

  const currentSet = new Set(currentOperations);

  return expectedOperations.every((operation) => currentSet.has(operation));
};

const findExistingParksWebhook = async () => {
  const webhooks = await metadataClient.listWebhooks();

  return (
    webhooks.find(
      (webhook) => webhook.description === PARKS_WEBHOOK_DESCRIPTION,
    ) ??
    webhooks.find(
      (webhook) => webhook.targetUrl === envConfig.webhookUrl,
    ) ??
    null
  );
};

export const setupParksWebhooks = async (): Promise<void> => {
  console.log('[setup:webhooks] Configuring Twenty webhooks...');
  console.log(`[setup:webhooks] Target URL: ${envConfig.webhookUrl}`);

  const webhookInput = {
    targetUrl: envConfig.webhookUrl,
    operations: [...PARKS_WEBHOOK_OPERATIONS],
    description: PARKS_WEBHOOK_DESCRIPTION,
    ...(envConfig.webhookSecret ? { secret: envConfig.webhookSecret } : {}),
  };

  const existingWebhook = await findExistingParksWebhook();

  if (existingWebhook) {
    const needsUpdate =
      existingWebhook.targetUrl !== webhookInput.targetUrl ||
      !operationsMatch(existingWebhook.operations, PARKS_WEBHOOK_OPERATIONS) ||
      existingWebhook.description !== PARKS_WEBHOOK_DESCRIPTION;

    if (!needsUpdate) {
      console.log(
        `[setup:webhooks] Webhook already configured — ${existingWebhook.id}`,
      );
      return;
    }

    const updatedWebhook = await metadataClient.updateWebhook(
      existingWebhook.id,
      webhookInput,
    );

    console.log(`[setup:webhooks] Updated webhook ${updatedWebhook.id}`);
    return;
  }

  const createdWebhook = await metadataClient.createWebhook(webhookInput);

  console.log(`[setup:webhooks] Created webhook ${createdWebhook.id}`);
  console.log(
    `[setup:webhooks] Operations: ${createdWebhook.operations.join(', ')}`,
  );
  console.log('');
  console.log('[setup:webhooks] Local dev note:');
  console.log(
    '  Twenty blocks localhost webhook delivery when OUTBOUND_HTTP_SAFE_MODE_ENABLED=true.',
  );
  console.log(
    '  Disable it in Settings → Admin Panel → OUTBOUND_HTTP_SAFE_MODE_ENABLED=false',
  );
  console.log(
    '  If Twenty runs in Docker, use host.docker.internal instead of localhost in WEBHOOK_URL.',
  );
};
