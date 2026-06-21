import express from 'express';
import dotenv from 'dotenv';

import { envConfig } from './config/env.config';
import { registerCrons } from './crons/register-crons';
import { oracleService } from './services/oracle.service';
import { webhookRouter } from './webhooks/webhook.router';

dotenv.config();

export const createApp = (): express.Application => {
  const application = express();

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
