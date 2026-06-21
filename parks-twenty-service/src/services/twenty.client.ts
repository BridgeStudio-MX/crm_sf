import { GraphQLClient } from 'graphql-request';

import { twentyConfig } from '../config/twenty.config';
import { resolveTwentyAuthToken } from '../metadata/resolve-twenty-auth-token';

const MAX_RETRY_ATTEMPTS = 3;
const BASE_RETRY_DELAY_MS = 500;

const sleep = (milliseconds: number): Promise<void> =>
  new Promise((resolve) => {
    setTimeout(resolve, milliseconds);
  });

const isRetryableError = (error: unknown): boolean => {
  if (!(error instanceof Error)) {
    return false;
  }

  const message = error.message.toLowerCase();

  return (
    message.includes('fetch failed') ||
    message.includes('network') ||
    message.includes('timeout') ||
    message.includes('econnrefused') ||
    message.includes('503') ||
    message.includes('502')
  );
};

const requestWithRetry = async <TData>(
  executeRequest: () => Promise<TData>,
): Promise<TData> => {
  let lastError: unknown;

  for (let attempt = 1; attempt <= MAX_RETRY_ATTEMPTS; attempt += 1) {
    try {
      return await executeRequest();
    } catch (error) {
      lastError = error;

      if (!isRetryableError(error) || attempt === MAX_RETRY_ATTEMPTS) {
        throw error;
      }

      const delayMs = BASE_RETRY_DELAY_MS * 2 ** (attempt - 1);
      console.warn(
        `[twenty.client] Retry ${attempt}/${MAX_RETRY_ATTEMPTS} in ${delayMs}ms`,
      );
      await sleep(delayMs);
    }
  }

  throw lastError;
};

export class TwentyClient {
  private client: GraphQLClient | null = null;

  private async getClient(): Promise<GraphQLClient> {
    if (this.client) {
      return this.client;
    }

    const token = await resolveTwentyAuthToken();

    this.client = new GraphQLClient(twentyConfig.graphqlUrl, {
      headers: {
        Authorization: `Bearer ${token}`,
        'Content-Type': 'application/json',
      },
    });

    return this.client;
  }

  async query<TData>(
    document: string,
    variables?: Record<string, unknown>,
  ): Promise<TData> {
    const client = await this.getClient();

    return requestWithRetry(() => client.request<TData>(document, variables));
  }

  async mutate<TData>(
    document: string,
    variables?: Record<string, unknown>,
  ): Promise<TData> {
    return this.query<TData>(document, variables);
  }

  async ping(): Promise<boolean> {
    try {
      await this.query<{ __typename: string }>(`query Ping { __typename }`);
      return true;
    } catch (error) {
      const message = error instanceof Error ? error.message : 'Unknown error';
      console.error('[twenty.client] Ping failed:', message);
      return false;
    }
  }
}

export const twentyClient = new TwentyClient();
