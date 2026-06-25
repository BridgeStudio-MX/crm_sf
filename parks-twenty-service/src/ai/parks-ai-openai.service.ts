import axios from 'axios';

import { envConfig } from '../config/env.config';
import { type ParksAiChatMessage } from './parks-ai.types';

const SYSTEM_PROMPT = `Eres el Asistente Parks Industrial de FUNO.
Respondes en español (México), tono profesional y conciso.
Usa markdown ligero. Basa respuestas SOLO en el contexto JSON provisto.
Si falta información, dilo explícitamente. No inventes naves, montos ni fechas.
Dominio: parques industriales, naves, casos legales, checklist documental, SLA, holdover, comisiones.`;

export const parksAiOpenAiService = {
  isEnabled: (): boolean =>
    envConfig.openAiApiKey.trim().length > 0 && !envConfig.parksAiMock,

  complete: async ({
    message,
    contextPayload,
    history,
    demoFallback,
  }: {
    message: string;
    contextPayload: Record<string, unknown>;
    history: ParksAiChatMessage[];
    demoFallback: string;
  }): Promise<string> => {
    if (!parksAiOpenAiService.isEnabled()) {
      return demoFallback;
    }

    try {
      const response = await axios.post<{
        choices: { message: { content: string } }[];
      }>(
        'https://api.openai.com/v1/chat/completions',
        {
          model: envConfig.openAiModel,
          temperature: 0.2,
          messages: [
            { role: 'system', content: SYSTEM_PROMPT },
            {
              role: 'user',
              content: `Contexto Parks (JSON):\n${JSON.stringify(contextPayload, null, 2)}`,
            },
            ...history.slice(-6).map((chatMessage) => ({
              role: chatMessage.role,
              content: chatMessage.content,
            })),
            { role: 'user', content: message },
          ],
        },
        {
          headers: {
            Authorization: `Bearer ${envConfig.openAiApiKey}`,
            'Content-Type': 'application/json',
          },
          timeout: 45000,
        },
      );

      const content = response.data.choices[0]?.message?.content?.trim();

      return content && content.length > 0 ? content : demoFallback;
    } catch (error) {
      const errorMessage =
        error instanceof Error ? error.message : String(error);
      console.warn('[parks-ai] OpenAI fallback to demo:', errorMessage);

      return demoFallback;
    }
  },
};
