import { envConfig } from './env.config';

export const twentyConfig = {
  apiUrl: envConfig.twentyApiUrl,
  graphqlUrl: `${envConfig.twentyApiUrl}/graphql`,
  metadataUrl: `${envConfig.twentyApiUrl}/metadata`,
  apiKey: envConfig.twentyApiKey,
} as const;

export type TwentyConfig = typeof twentyConfig;
