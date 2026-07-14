import { Router } from 'express';

import { comiteService } from '../services/comite.service';
import { type ComiteVotoValor } from '../types/comite.types';

export const comiteRouter = Router();

comiteRouter.get('/', (request, response) => {
  try {
    const viewerEmail =
      typeof request.query.viewerEmail === 'string'
        ? request.query.viewerEmail
        : undefined;
    response.json(comiteService.list(viewerEmail));
  } catch (error) {
    const message = error instanceof Error ? error.message : 'Unknown error';
    response.status(500).json({ error: message });
  }
});

comiteRouter.get('/config', (_request, response) => {
  response.json(comiteService.getConfig());
});

comiteRouter.patch('/config', (request, response) => {
  try {
    const body = request.body as Partial<{
      slaHorasHabiles: number;
      semaforoVerdeMaxPct: number;
      semaforoAmarilloMaxPct: number;
      recordatorioHorasAntes: number;
    }>;
    response.json(comiteService.updateConfig(body));
  } catch (error) {
    const message = error instanceof Error ? error.message : 'Unknown error';
    response.status(500).json({ error: message });
  }
});

comiteRouter.get('/:comiteId', (request, response) => {
  try {
    const comite = comiteService.getById(request.params.comiteId);

    if (!comite) {
      response.status(404).json({ error: 'Comité not found' });
      return;
    }

    response.json(comite);
  } catch (error) {
    const message = error instanceof Error ? error.message : 'Unknown error';
    response.status(500).json({ error: message });
  }
});

comiteRouter.post('/:comiteId/vote', async (request, response) => {
  try {
    const body = request.body as {
      memberId?: string;
      voto?: Exclude<ComiteVotoValor, 'Pendiente'>;
      comentario?: string;
      viewerEmail?: string;
    };

    if (!body.memberId || !body.voto) {
      response.status(400).json({ error: 'memberId and voto are required' });
      return;
    }

    if (!['Aprueba', 'Rechaza', 'Se abstiene'].includes(body.voto)) {
      response.status(400).json({ error: 'Invalid voto value' });
      return;
    }

    const comite = await comiteService.vote({
      comiteId: request.params.comiteId,
      memberId: body.memberId,
      voto: body.voto,
      comentario: body.comentario,
      viewerEmail: body.viewerEmail,
    });

    response.json(comite);
  } catch (error) {
    const message = error instanceof Error ? error.message : 'Unknown error';
    const status = message.includes('not found')
      ? 404
      : message.includes('Debes explicar') ||
          message.includes('permanent') ||
          message.includes('already resolved') ||
          message.includes('No puedes votar')
        ? 400
        : 500;
    response.status(status).json({ error: message });
  }
});

comiteRouter.post('/:comiteId/questions', (request, response) => {
  try {
    const body = request.body as {
      memberId?: string;
      preguntaTexto?: string;
    };

    if (!body.memberId || !body.preguntaTexto) {
      response
        .status(400)
        .json({ error: 'memberId and preguntaTexto are required' });
      return;
    }

    const comite = comiteService.askQuestion({
      comiteId: request.params.comiteId,
      memberId: body.memberId,
      preguntaTexto: body.preguntaTexto,
    });

    response.status(201).json(comite);
  } catch (error) {
    const message = error instanceof Error ? error.message : 'Unknown error';
    response.status(message.includes('not found') ? 404 : 400).json({
      error: message,
    });
  }
});

comiteRouter.post(
  '/:comiteId/questions/:preguntaId/answer',
  (request, response) => {
    try {
      const body = request.body as {
        respuestaTexto?: string;
        respuestaPorNombre?: string;
      };

      if (!body.respuestaTexto || !body.respuestaPorNombre) {
        response.status(400).json({
          error: 'respuestaTexto and respuestaPorNombre are required',
        });
        return;
      }

      const comite = comiteService.answerQuestion({
        comiteId: request.params.comiteId,
        preguntaId: request.params.preguntaId,
        respuestaTexto: body.respuestaTexto,
        respuestaPorNombre: body.respuestaPorNombre,
      });

      response.json(comite);
    } catch (error) {
      const message = error instanceof Error ? error.message : 'Unknown error';
      response.status(message.includes('not found') ? 404 : 400).json({
        error: message,
      });
    }
  },
);
