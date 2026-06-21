import dotenv from 'dotenv';

dotenv.config();

const parseNumber = (value: string | undefined, fallback: number): number => {
  if (value === undefined || value === '') {
    return fallback;
  }

  const parsedValue = Number(value);

  return Number.isFinite(parsedValue) ? parsedValue : fallback;
};

const parseBoolean = (
  value: string | undefined,
  fallback: boolean,
): boolean => {
  if (value === undefined || value === '') {
    return fallback;
  }

  return value.toLowerCase() === 'true';
};

const parseStringList = (value: string | undefined): string[] => {
  if (value === undefined || value.trim() === '') {
    return [];
  }

  return value.split(',').map((item) => item.trim());
};

export const envConfig = {
  nodeEnv: process.env.NODE_ENV ?? 'development',
  port: parseNumber(process.env.PORT, 3002),
  twentyApiUrl: process.env.TWENTY_API_URL ?? 'http://localhost:3000',
  twentyApiKey: process.env.TWENTY_API_KEY ?? '',
  webhookUrl:
    process.env.WEBHOOK_URL ?? 'http://localhost:3002/webhooks/twenty',
  webhookSecret: process.env.WEBHOOK_SECRET ?? '',
  diasFestivosMx: parseStringList(process.env.DIAS_FESTIVOS_MX),
  slaPausaPorDocs: parseBoolean(process.env.SLA_PAUSA_POR_DOCS, true),
  comisionEjecutivoPct: parseNumber(process.env.COMISION_EJECUTIVO_PCT, 0.03),
  holdoverMultiplier: parseNumber(process.env.HOLDOVER_MULTIPLIER, 2),
  oracleApiUrl: process.env.ORACLE_API_URL ?? '',
  oracleApiKey: process.env.ORACLE_API_KEY ?? '',
  oracleMock: parseBoolean(process.env.ORACLE_MOCK, true),
  cronSlaTicker: process.env.CRON_SLA_TICKER ?? '0 * * * *',
  cronHoldoverScanner: process.env.CRON_HOLDOVER_SCANNER ?? '0 8 * * *',
  cronRenovacionAlerts: process.env.CRON_RENOVACION_ALERTS ?? '0 7 * * *',
  cronOracleSync: process.env.CRON_ORACLE_SYNC ?? '0 */4 * * *',
  forceDemoSeed: parseBoolean(process.env.FORCE_DEMO_SEED, false),
} as const;

export type EnvConfig = typeof envConfig;
