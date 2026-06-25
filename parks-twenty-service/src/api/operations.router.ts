import { Router } from 'express';

import { brokerPerformanceService } from '../services/broker-performance.service';
import { cxcHandoffService } from '../services/cxc-handoff.service';
import { paymentCommissionService } from '../services/payment-commission.service';

export const operationsRouter = Router();

operationsRouter.post('/cxc-handoff', async (request, response) => {
  try {
    const body = request.body as { casoLegalId?: string };

    if (!body.casoLegalId) {
      response.status(400).json({ error: 'casoLegalId is required' });
      return;
    }

    const result = await cxcHandoffService.triggerHandoff(body.casoLegalId);
    response.json(result);
  } catch (error) {
    const message = error instanceof Error ? error.message : 'Unknown error';
    response.status(500).json({ error: message });
  }
});

operationsRouter.get('/cxc-handoff/:casoLegalId', (request, response) => {
  const handoff = cxcHandoffService.getHandoffByCasoLegal(
    request.params.casoLegalId,
  );

  if (!handoff) {
    response.status(404).json({ error: 'Handoff not found' });
    return;
  }

  response.json(handoff);
});

operationsRouter.post('/register-payment', async (request, response) => {
  try {
    const body = request.body as { comisionId?: string };

    if (!body.comisionId) {
      response.status(400).json({ error: 'comisionId is required' });
      return;
    }

    const result = await paymentCommissionService.registerPayment(
      body.comisionId,
    );
    response.json(result);
  } catch (error) {
    const message = error instanceof Error ? error.message : 'Unknown error';
    response.status(500).json({ error: message });
  }
});

operationsRouter.get('/broker-performance', async (request, response) => {
  try {
    const brokerName =
      typeof request.query.brokerName === 'string'
        ? request.query.brokerName
        : undefined;

    const metrics = await brokerPerformanceService.getMetrics(brokerName);
    response.json(metrics);
  } catch (error) {
    const message = error instanceof Error ? error.message : 'Unknown error';
    response.status(500).json({ error: message });
  }
});
