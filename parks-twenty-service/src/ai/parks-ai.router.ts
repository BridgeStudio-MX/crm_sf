import { Router } from 'express';

import { parksAiService } from '../ai/parks-ai.service';
import { type ParksAiChatRequest } from '../ai/parks-ai.types';
import { envConfig } from '../config/env.config';

export const parksAiRouter = Router();

parksAiRouter.get('/health', (_request, response) => {
  response.json({
    status: 'ok',
    llmEnabled: envConfig.openAiApiKey.trim().length > 0 && !envConfig.parksAiMock,
    mockMode: envConfig.parksAiMock || envConfig.openAiApiKey.trim().length === 0,
  });
});

parksAiRouter.post('/chat', async (request, response) => {
  try {
    const body = request.body as ParksAiChatRequest;

    if (!body.message || body.message.trim().length === 0) {
      response.status(400).json({ error: 'message is required' });
      return;
    }

    const result = await parksAiService.chat({
      message: body.message.trim(),
      action: body.action,
      context: body.context,
      history: body.history ?? [],
    });

    response.json(result);
  } catch (error) {
    const message = error instanceof Error ? error.message : 'Unknown error';
    console.error('[parks-ai] chat failed:', message);
    response.status(500).json({ error: message });
  }
});
