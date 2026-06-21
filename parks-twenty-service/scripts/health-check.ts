import axios from 'axios';
import dotenv from 'dotenv';

import { twentyClient } from '../src/services/twenty.client';

dotenv.config();

const twentyApiUrl = process.env.TWENTY_API_URL ?? 'http://localhost:3000';
const servicePort = process.env.PORT ?? '3002';

const checkTwentyHttp = async (): Promise<boolean> => {
  try {
    const response = await axios.get(`${twentyApiUrl}/healthz`, {
      timeout: 5000,
    });

    return response.status === 200;
  } catch {
    try {
      const response = await axios.get(twentyApiUrl, { timeout: 5000 });
      return response.status < 500;
    } catch (error) {
      console.error('[health] Twenty HTTP unreachable:', error);
      return false;
    }
  }
};

const checkMicroservice = async (): Promise<boolean> => {
  try {
    const response = await axios.get(`http://localhost:${servicePort}/health`, {
      timeout: 5000,
    });

    console.log('[health] Microservice:', response.data);
    return response.status === 200;
  } catch {
    console.log(
      `[health] Microservice not running on :${servicePort} (start with npm run dev)`,
    );
    return false;
  }
};

const main = async (): Promise<void> => {
  const twentyHttpOk = await checkTwentyHttp();
  const serviceOk = await checkMicroservice();
  const twentyGraphqlOk = await twentyClient.ping();

  console.log(
    `[health] Twenty HTTP (${twentyApiUrl}): ${twentyHttpOk ? 'OK' : 'FAIL'}`,
  );
  console.log(
    `[health] Twenty GraphQL (API key): ${twentyGraphqlOk ? 'OK' : 'FAIL — set TWENTY_API_KEY in .env'}`,
  );
  console.log(
    `[health] parks-twenty-service (:${servicePort}): ${serviceOk ? 'OK' : 'NOT RUNNING'}`,
  );

  if (!twentyHttpOk) {
    process.exit(1);
  }
};

main();
