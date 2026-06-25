import express from 'express';
import dotenv from 'dotenv';

import { envConfig } from './config/env.config';
import { registerCrons } from './crons/register-crons';
import { parksAiRouter } from './ai/parks-ai.router';
import { commercialRouter } from './api/commercial.router';
import { legalRouter } from './api/legal.router';
import { operationsRouter } from './api/operations.router';
import { oracleService } from './services/oracle.service';
import { webhookRouter } from './webhooks/webhook.router';

dotenv.config();

const applyCors = (
  request: express.Request,
  response: express.Response,
  next: express.NextFunction,
): void => {
  response.header('Access-Control-Allow-Origin', '*');
  response.header('Access-Control-Allow-Headers', 'Content-Type');
  response.header('Access-Control-Allow-Methods', 'GET,POST,OPTIONS');

  if (request.method === 'OPTIONS') {
    response.sendStatus(204);
    return;
  }

  next();
};

export const createApp = (): express.Application => {
  const application = express();

  application.use(applyCors);
  application.use(express.json({ limit: '2mb' }));

  application.get('/health', (_request, response) => {
    response.json({
      status: 'ok',
      service: 'parks-twenty-service',
      twentyApiUrl: envConfig.twentyApiUrl,
      oracleMock: envConfig.oracleMock,
      oracleSync: oracleService.getSyncStatus(),
      timestamp: new Date().toISOString(),
    });
  });

  application.use('/webhooks', webhookRouter);
  application.use('/ai', parksAiRouter);
  application.use('/commercial', commercialRouter);
  application.use('/legal', legalRouter);
  application.use('/operations', operationsRouter);

  application.post('/oracle/sync', async (_request, response) => {
    try {
      const result = await oracleService.syncAll();
      response.status(200).json(result);
    } catch (error) {
      const message = error instanceof Error ? error.message : 'Unknown error';
      response.status(500).json({ error: message });
    }
  });

  application.use(
    (
      error: Error,
      _request: express.Request,
      response: express.Response,
      _next: express.NextFunction,
    ) => {
      console.error('[parks-twenty-service] Unhandled error:', error.message);
      response.status(500).json({ error: 'Internal server error' });
    },
  );

  return application;
};

const startServer = (): void => {
  const application = createApp();

  registerCrons();

  application.listen(envConfig.port, () => {
    console.log(
      `[parks-twenty-service] Listening on http://localhost:${envConfig.port}`,
    );
    console.log(
      `[parks-twenty-service] Twenty API: ${envConfig.twentyApiUrl}`,
    );
  });
};

startServer();
