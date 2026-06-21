import { envConfig } from './env.config';

export const oracleConfig = {
  apiUrl: envConfig.oracleApiUrl,
  apiKey: envConfig.oracleApiKey,
  mock: envConfig.oracleMock,
} as const;

export type OracleConfig = typeof oracleConfig;
