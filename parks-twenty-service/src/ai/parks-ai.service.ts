import { parksAiContextService } from './parks-ai-context.service';
import { parksAiDemoService } from './parks-ai-demo.service';
import { parksAiOpenAiService } from './parks-ai-openai.service';
import {
  type ParksAiAction,
  type ParksAiChatRequest,
  type ParksAiChatResponse,
  type ParksAiRouteContext,
} from './parks-ai.types';

const resolveAction = (
  request: ParksAiChatRequest,
): ParksAiAction => {
  if (request.action) {
    return request.action;
  }

  const normalizedMessage = request.message.toLowerCase();

  if (
    normalizedMessage.includes('checklist') ||
    normalizedMessage.includes('document')
  ) {
    return 'checklist_review';
  }

  if (
    normalizedMessage.includes('resumen') ||
    normalizedMessage.includes('resume')
  ) {
    return 'case_summary';
  }

  if (
    normalizedMessage.includes('disponib') ||
    normalizedMessage.includes('nave') ||
    normalizedMessage.includes('m2') ||
    normalizedMessage.includes('m²')
  ) {
    return 'availability_search';
  }

  return 'general';
};

const inferActionFromScreen = (
  action: ParksAiAction,
  context?: ParksAiRouteContext,
): ParksAiAction => {
  if (action !== 'general') {
    return action;
  }

  if (context?.screen === 'approval' && context.casoLegalId) {
    return 'case_summary';
  }

  if (context?.screen === 'map') {
    return 'availability_search';
  }

  return action;
};

export const parksAiService = {
  chat: async (request: ParksAiChatRequest): Promise<ParksAiChatResponse> => {
    const action = inferActionFromScreen(
      resolveAction(request),
      request.context,
    );
    const history = request.history ?? [];
    const casoLegalId =
      request.context?.casoLegalId ??
      (action === 'checklist_review' || action === 'case_summary'
        ? request.context?.casoLegalId
        : undefined);

    let casoBundle = null;

    if (
      casoLegalId &&
      (action === 'checklist_review' || action === 'case_summary')
    ) {
      casoBundle = await parksAiContextService.loadCasoLegalBundle(casoLegalId);
    }

    const disponibleNaves =
      action === 'availability_search' || action === 'general'
        ? await parksAiContextService.loadDisponibleNaves()
        : [];

    const demoResult = await parksAiDemoService.respond({
      action,
      message: request.message,
      context: request.context,
      casoLegal: casoBundle?.casoLegal,
      checklist: casoBundle?.checklist,
      disponibleNaves,
    });

    const contextPayload = {
      screen: request.context?.screen ?? 'unknown',
      routeContext: request.context ?? null,
      casoLegal: casoBundle?.casoLegal ?? null,
      checklist: casoBundle?.checklist ?? null,
      disponibleNaves:
        action === 'availability_search' || action === 'general'
          ? disponibleNaves
          : undefined,
      demoDraft: demoResult.reply,
    };

    const reply = await parksAiOpenAiService.complete({
      message: request.message,
      contextPayload,
      history,
      demoFallback: demoResult.reply,
    });

    return {
      reply,
      action,
      usedLlm: parksAiOpenAiService.isEnabled(),
      suggestedFollowUps: demoResult.suggestedFollowUps,
    };
  },
};
