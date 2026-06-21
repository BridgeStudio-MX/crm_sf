import crypto from 'crypto';

import { type TwentyWebhookPayload } from '../types/parks.types';

export const verifyTwentyWebhookSignature = (
  payload: TwentyWebhookPayload,
  secret: string,
  timestamp: string | undefined,
  signature: string | undefined,
): boolean => {
  if (!timestamp || !signature) {
    return false;
  }

  const { secret: _secret, ...payloadWithoutSecret } = payload as TwentyWebhookPayload & {
    secret?: string;
  };

  const expectedSignature = crypto
    .createHmac('sha256', secret)
    .update(`${timestamp}:${JSON.stringify(payloadWithoutSecret)}`)
    .digest('hex');

  const signatureBuffer = Buffer.from(signature);
  const expectedBuffer = Buffer.from(expectedSignature);

  if (signatureBuffer.length !== expectedBuffer.length) {
    return false;
  }

  return crypto.timingSafeEqual(signatureBuffer, expectedBuffer);
};
