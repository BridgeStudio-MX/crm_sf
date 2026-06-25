import { PARKS_AI_CHAT_ENDPOINT } from '@/parks-industrial/constants/parks-ai.constants';
import {
  type ParksAiAction,
  type ParksAiChatMessage,
  type ParksAiRouteContext,
} from '@/parks-industrial/types/parks-ai.types';

type ParksAiChatApiResponse = {
  reply: string;
  action: ParksAiAction;
  usedLlm: boolean;
  suggestedFollowUps?: string[];
};

export const sendParksAiChatRequest = async ({
  message,
  action,
  context,
  history,
}: {
  message: string;
  action?: ParksAiAction;
  context?: ParksAiRouteContext;
  history: ParksAiChatMessage[];
}): Promise<ParksAiChatApiResponse> => {
  const response = await fetch(PARKS_AI_CHAT_ENDPOINT, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      message,
      action,
      context,
      history: history.map((chatMessage) => ({
        role: chatMessage.role,
        content: chatMessage.content,
      })),
    }),
  });

  if (!response.ok) {
    const errorBody = (await response.json().catch(() => null)) as {
      error?: string;
    } | null;
    throw new Error(
      errorBody?.error ??
        `No se pudo contactar al asistente Parks (${response.status})`,
    );
  }

  return (await response.json()) as ParksAiChatApiResponse;
};
