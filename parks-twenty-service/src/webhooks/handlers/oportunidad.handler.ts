import { envConfig } from '../../config/env.config';
import { OPPORTUNITY_STAGE_HOJA_FIRMADA } from '../../constants/parks.constants';
import { commercialLegalHandoffService } from '../../services/commercial-legal-handoff.service';
import { leadOnboardingService } from '../../services/lead-onboarding.service';
import { type TwentyWebhookPayload } from '../../types/parks.types';
import { isSelectValueEqual } from '../../utils/select-value.util';
import {
  parseTwentyWebhook,
  wasFieldUpdated,
} from '../webhook-payload.util';

const isLeadStage = (stage: string | undefined): boolean => {
  if (!stage) {
    return true;
  }

  return (
    stage === 'LEAD_RECIBIDO' ||
    isSelectValueEqual(stage, 'LEAD_RECIBIDO') ||
    isSelectValueEqual(stage, 'Prospecto nuevo')
  );
};

const handleNewLead = async (
  parsedWebhook: NonNullable<ReturnType<typeof parseTwentyWebhook>>,
): Promise<void> => {
  const stage =
    typeof parsedWebhook.record.stage === 'string'
      ? parsedWebhook.record.stage
      : undefined;

  if (!isLeadStage(stage)) {
    return;
  }

  await leadOnboardingService.processNewOpportunity({
    opportunityId: parsedWebhook.recordId,
    record: parsedWebhook.record,
  });
};

const handleLegalHandoff = async (
  parsedWebhook: NonNullable<ReturnType<typeof parseTwentyWebhook>>,
): Promise<void> => {
  if (!wasFieldUpdated(parsedWebhook, 'stage')) {
    return;
  }

  const stage =
    typeof parsedWebhook.record.stage === 'string'
      ? parsedWebhook.record.stage
      : undefined;

  if (!isSelectValueEqual(stage, OPPORTUNITY_STAGE_HOJA_FIRMADA)) {
    return;
  }

  if (!envConfig.parksLegalHandoffEnabled) {
    console.log(
      `[oportunidad.handler] Legal handoff skipped (PARKS_LEGAL_HANDOFF_ENABLED=false) for ${parsedWebhook.recordId}`,
    );
    return;
  }

  // Prefer signing-time handoff; webhook remains as fallback if stage was set elsewhere
  await commercialLegalHandoffService.handoffFromOpportunity(
    parsedWebhook.recordId,
  );
};

export const handleOportunidadWebhook = async (
  payload: TwentyWebhookPayload,
): Promise<void> => {
  const parsedWebhook = parseTwentyWebhook(payload);

  if (!parsedWebhook) {
    return;
  }

  if (parsedWebhook.action === 'created') {
    await handleNewLead(parsedWebhook);
    return;
  }

  if (parsedWebhook.action !== 'updated') {
    return;
  }

  await handleLegalHandoff(parsedWebhook);
};
