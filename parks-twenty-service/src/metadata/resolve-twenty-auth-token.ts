import axios from 'axios';

import { envConfig } from '../config/env.config';
import { twentyConfig } from '../config/twenty.config';
import { PARKS_DEMO_USER_PASSWORD } from './parks-demo-users.constants';

const buildOrigin = (): string => {
  const originUrl = new URL(twentyConfig.apiUrl);

  return originUrl.toString();
};

const loginAsUser = async (
  email: string,
  password: string,
): Promise<string> => {
  const origin = buildOrigin();

  console.log(`[auth] Using user login (${email})`);

  const loginResponse = await axios.post<{ data: Record<string, unknown> }>(
    twentyConfig.metadataUrl,
    {
      query: `
        mutation GetLoginTokenFromCredentials(
          $email: String!
          $password: String!
          $origin: String!
        ) {
          getLoginTokenFromCredentials(
            email: $email
            password: $password
            origin: $origin
          ) {
            loginToken {
              token
            }
          }
        }
      `,
      variables: { email, password, origin },
    },
    { headers: { Origin: origin, 'Content-Type': 'application/json' } },
  );

  if (!loginResponse.data?.data) {
    throw new Error(
      `getLoginTokenFromCredentials failed: ${JSON.stringify(loginResponse.data)}`,
    );
  }

  const loginToken = (
    loginResponse.data.data as {
      getLoginTokenFromCredentials: { loginToken: { token: string } };
    }
  ).getLoginTokenFromCredentials.loginToken.token;

  const authResponse = await axios.post<{ data: Record<string, unknown> }>(
    twentyConfig.metadataUrl,
    {
      query: `
        mutation GetAuthTokensFromLoginToken(
          $loginToken: String!
          $origin: String!
        ) {
          getAuthTokensFromLoginToken(loginToken: $loginToken, origin: $origin) {
            tokens {
              accessOrWorkspaceAgnosticToken {
                token
              }
            }
          }
        }
      `,
      variables: { loginToken, origin },
    },
    { headers: { Origin: origin, 'Content-Type': 'application/json' } },
  );

  return (
    authResponse.data.data as {
      getAuthTokensFromLoginToken: {
        tokens: { accessOrWorkspaceAgnosticToken: { token: string } };
      };
    }
  ).getAuthTokensFromLoginToken.tokens.accessOrWorkspaceAgnosticToken.token;
};

// API key for metadata CRUD; user login for operations that require user context
export const resolveTwentyAuthToken = async (): Promise<string> => {
  if (envConfig.twentyApiKey) {
    return envConfig.twentyApiKey;
  }

  return resolveTwentyUserAuthToken();
};

export const resolveTwentyUserAuthToken = async (): Promise<string> => {
  const email =
    process.env.TWENTY_BOOTSTRAP_EMAIL ??
    process.env.TWENTY_DEV_EMAIL ??
    'tim@apple.dev';
  const password =
    process.env.TWENTY_BOOTSTRAP_PASSWORD ??
    process.env.TWENTY_DEV_PASSWORD ??
    PARKS_DEMO_USER_PASSWORD;

  return loginAsUser(email, password);
};

export const resolveTwentyAuthTokenForUser = async (
  email: string,
  password: string,
): Promise<string> => loginAsUser(email, password);
