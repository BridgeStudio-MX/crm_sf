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
  // Valor agregado F1/F5 daily 6am, F2/F8 weekly Mon 8am, F3 monthly 1st Mon 8am
  cronValorAgregadoDaily: process.env.CRON_VALOR_AGREGADO_DAILY ?? '0 6 * * *',
  cronValorAgregadoWeekly:
    process.env.CRON_VALOR_AGREGADO_WEEKLY ?? '0 8 * * 1',
  cronValorAgregadoMonthly:
    process.env.CRON_VALOR_AGREGADO_MONTHLY ?? '0 8 * * 1',
  cronAsignacionEscalation:
    process.env.CRON_ASIGNACION_ESCALATION ?? '*/15 * * * *',
  forceDemoSeed: parseBoolean(process.env.FORCE_DEMO_SEED, false),
  openAiApiKey: process.env.OPENAI_API_KEY ?? '',
  openAiModel: process.env.OPENAI_MODEL ?? 'gpt-4o-mini',
  parksAiMock: parseBoolean(process.env.PARKS_AI_MOCK, true),
  // Legal handoff creates casoLegal when Hoja de Acuerdos is signed
  parksLegalHandoffEnabled: parseBoolean(
    process.env.PARKS_LEGAL_HANDOFF_ENABLED,
    true,
  ),
  // When true, signed Hoja opens Comité before Legal handoff
  parksComiteEnabled: parseBoolean(process.env.PARKS_COMITE_ENABLED, true),
  parksComiteSlaHoras: parseNumber(process.env.PARKS_COMITE_SLA_HORAS, 48),
  parksComiteSemaforoVerdeMaxPct: parseNumber(
    process.env.PARKS_COMITE_SEMAFORO_VERDE_MAX_PCT,
    5,
  ),
  parksComiteSemaforoAmarilloMaxPct: parseNumber(
    process.env.PARKS_COMITE_SEMAFORO_AMARILLO_MAX_PCT,
    10,
  ),
  // Placeholder thresholds until Héctor confirms exact discount rules
  aprobacionCemDescuentoPctMax: parseNumber(
    process.env.APROBACION_CEM_DESCUENTO_PCT_MAX,
    5,
  ),
} as const;

export type EnvConfig = typeof envConfig;
