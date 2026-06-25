import { Router } from 'express';

import { brokerNotificationStore } from '../services/broker-notification.store';
import { emailSequenceService } from '../services/email-sequence.service';
import { fichaTecnicaService } from '../services/ficha-tecnica.service';
import { naveMatchingService } from '../services/nave-matching.service';
import { prospectEnrichmentService } from '../services/prospect-enrichment.service';
import { prospectScoringService } from '../services/prospect-scoring.service';
import { salesScriptService } from '../services/sales-script.service';
import { type FichaTecnicaSentVia } from '../types/commercial.types';

export const commercialRouter = Router();

commercialRouter.get('/notifications', (request, response) => {
  const unreadOnly = request.query.unreadOnly === 'true';
  const notifications = brokerNotificationStore.list({ unreadOnly });

  response.json({
    notifications,
    unreadCount: brokerNotificationStore.getUnreadCount(),
  });
});

commercialRouter.patch('/notifications/:notificationId/read', (request, response) => {
  const notification = brokerNotificationStore.markRead(
    request.params.notificationId,
  );

  if (!notification) {
    response.status(404).json({ error: 'Notification not found' });
    return;
  }

  response.json({
    notification,
    unreadCount: brokerNotificationStore.getUnreadCount(),
  });
});

commercialRouter.post('/notifications/mark-all-read', (_request, response) => {
  const updatedCount = brokerNotificationStore.markAllRead();

  response.json({
    updatedCount,
    unreadCount: brokerNotificationStore.getUnreadCount(),
  });
});

commercialRouter.get(
  '/enrich-prospect/:opportunityId',
  (request, response) => {
    const cached = prospectEnrichmentService.getCached(
      request.params.opportunityId,
    );

    if (!cached) {
      response.status(404).json({ error: 'Enrichment not found' });
      return;
    }

    response.json(cached);
  },
);

commercialRouter.post('/prospect-scores', (request, response) => {
  const body = request.body as {
    opportunities?: Array<{
      opportunityId?: string;
      companyName?: string;
      industryHint?: string;
      m2Requeridos?: number;
      amountMicros?: number;
    }>;
  };

  if (!body.opportunities || body.opportunities.length === 0) {
    response.status(400).json({ error: 'opportunities array is required' });
    return;
  }

  const validItems = body.opportunities.filter(
    (item): item is {
      opportunityId: string;
      companyName: string;
      industryHint?: string;
      m2Requeridos?: number;
      amountMicros?: number;
    } =>
      typeof item.opportunityId === 'string' &&
      typeof item.companyName === 'string',
  );

  response.json({
    scores: prospectScoringService.computeBatch(validItems),
  });
});

commercialRouter.get(
  '/email-sequence/:opportunityId',
  (request, response) => {
    const companyName =
      typeof request.query.companyName === 'string'
        ? request.query.companyName
        : 'Prospecto';
    const industryHint =
      typeof request.query.industryHint === 'string'
        ? request.query.industryHint
        : undefined;

    const sequence = emailSequenceService.getForOpportunity({
      opportunityId: request.params.opportunityId,
      companyName,
      industryHint,
    });

    response.json(sequence);
  },
);

commercialRouter.post('/enrich-prospect', async (request, response) => {
  try {
    const body = request.body as {
      opportunityId?: string;
      companyName?: string;
      industryHint?: string;
      m2Requeridos?: number;
    };

    if (!body.opportunityId || !body.companyName) {
      response
        .status(400)
        .json({ error: 'opportunityId and companyName are required' });
      return;
    }

    const result = await prospectEnrichmentService.enrich({
      opportunityId: body.opportunityId,
      companyName: body.companyName.trim(),
      industryHint: body.industryHint,
      m2Requeridos: body.m2Requeridos,
    });

    response.json(result);
  } catch (error) {
    const message = error instanceof Error ? error.message : 'Unknown error';
    response.status(500).json({ error: message });
  }
});

commercialRouter.post('/match-naves', async (request, response) => {
  try {
    const body = request.body as {
      opportunityId?: string;
      m2Requeridos?: number;
      industry?: string;
      cityFilter?: string;
      limit?: number;
    };

    const m2Requeridos = body.m2Requeridos ?? 0;

    if (m2Requeridos <= 0) {
      response.status(400).json({ error: 'm2Requeridos must be greater than 0' });
      return;
    }

    const result = await naveMatchingService.match({
      opportunityId: body.opportunityId,
      m2Requeridos,
      industry: body.industry,
      cityFilter: body.cityFilter,
      limit: body.limit ?? 3,
    });

    response.json(result);
  } catch (error) {
    const message = error instanceof Error ? error.message : 'Unknown error';
    response.status(500).json({ error: message });
  }
});

commercialRouter.post('/ficha-tecnica', async (request, response) => {
  try {
    const body = request.body as {
      opportunityId?: string;
      opportunityName?: string;
      naveId?: string;
      naveIdentificador?: string;
      parqueNombre?: string;
      ubicacion?: string;
      m2?: number;
      precioUsdM2?: number;
    };

    if (
      !body.opportunityId ||
      !body.opportunityName ||
      !body.naveId ||
      !body.naveIdentificador ||
      !body.m2
    ) {
      response.status(400).json({
        error:
          'opportunityId, opportunityName, naveId, naveIdentificador and m2 are required',
      });
      return;
    }

    const link = await fichaTecnicaService.createLink({
      opportunityId: body.opportunityId,
      opportunityName: body.opportunityName,
      naveId: body.naveId,
      naveIdentificador: body.naveIdentificador,
      parqueNombre: body.parqueNombre,
      ubicacion: body.ubicacion,
      m2: body.m2,
      precioUsdM2: body.precioUsdM2,
    });

    response.json(link);
  } catch (error) {
    const message = error instanceof Error ? error.message : 'Unknown error';
    response.status(500).json({ error: message });
  }
});

commercialRouter.get('/ficha/:token', (request, response) => {
  const acceptHeader = request.headers.accept ?? '';

  if (acceptHeader.includes('application/json')) {
    const link = fichaTecnicaService.getPublicJson(request.params.token);

    if (!link) {
      response.status(404).json({ error: 'Ficha not found' });
      return;
    }

    response.json(link);
    return;
  }

  const html = fichaTecnicaService.getPublicHtml(request.params.token);

  if (!html) {
    response.status(404).send('Ficha no encontrada');
    return;
  }

  response.type('html').send(html);
});

commercialRouter.post('/ficha/:token/view', (request, response) => {
  const link = fichaTecnicaService.recordView(request.params.token);

  if (!link) {
    response.status(404).json({ error: 'Ficha not found' });
    return;
  }

  response.json(link);
});

commercialRouter.post('/ficha/:token/sent', (request, response) => {
  const body = request.body as { sentVia?: FichaTecnicaSentVia };

  if (!body.sentVia) {
    response.status(400).json({ error: 'sentVia is required' });
    return;
  }

  const link = fichaTecnicaService.markSent(
    request.params.token,
    body.sentVia,
  );

  if (!link) {
    response.status(404).json({ error: 'Ficha not found' });
    return;
  }

  response.json(link);
});

commercialRouter.get('/ficha/:token/pdf', async (request, response) => {
  try {
    const pdfBuffer = await fichaTecnicaService.generatePdfBuffer(
      request.params.token,
    );

    if (!pdfBuffer) {
      response.status(404).json({ error: 'Ficha not found' });
      return;
    }

    response
      .type('application/pdf')
      .set(
        'Content-Disposition',
        `inline; filename="ficha-${request.params.token}.pdf"`,
      )
      .send(pdfBuffer);
  } catch (error) {
    const message = error instanceof Error ? error.message : 'Unknown error';
    response.status(500).json({ error: message });
  }
});

commercialRouter.get(
  '/ficha-tecnica/opportunity/:opportunityId',
  (request, response) => {
    const links = fichaTecnicaService.listByOpportunity(
      request.params.opportunityId,
    );

    response.json({ links });
  },
);

commercialRouter.post('/sales-script', async (request, response) => {
  try {
    const body = request.body as {
      opportunityId?: string;
      companyName?: string;
      industry?: string;
      m2Requeridos?: number;
      naveDestacada?: string;
    };

    if (!body.companyName) {
      response.status(400).json({ error: 'companyName is required' });
      return;
    }

    const result = await salesScriptService.generate({
      opportunityId: body.opportunityId,
      companyName: body.companyName,
      industry: body.industry ?? 'Manufactura',
      m2Requeridos: body.m2Requeridos,
      naveDestacada: body.naveDestacada,
    });

    response.json(result);
  } catch (error) {
    const message = error instanceof Error ? error.message : 'Unknown error';
    response.status(500).json({ error: message });
  }
});
