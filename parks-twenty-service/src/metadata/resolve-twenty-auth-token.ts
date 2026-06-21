import axios from 'axios';

import { envConfig } from '../config/env.config';
import { twentyConfig } from '../config/twenty.config';

const buildOrigin = (): string => {
  const originUrl = new URL(twentyConfig.apiUrl);

  return originUrl.toString();
};

export const resolveTwentyAuthToken = async (): Promise<string> => {
  if (envConfig.twentyApiKey) {
    return envConfig.twentyApiKey;
  }

  const devEmail = process.env.TWENTY_DEV_EMAIL ?? 'tim@apple.dev';
  const devPassword = process.env.TWENTY_DEV_PASSWORD ?? 'tim@apple.dev';
  const origin = buildOrigin();

  console.log(
    `[auth] TWENTY_API_KEY not set — using dev login (${devEmail})`,
  );

  const loginResponse = await axios.post<{ data: Record<string, unknown> }>(
    `${twentyConfig.apiUrl}/metadata`,
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
      variables: { email: devEmail, password: devPassword, origin },
    },
    { headers: { Origin: origin, 'Content-Type': 'application/json' } },
  );

  const loginToken = (
    loginResponse.data.data as {
      getLoginTokenFromCredentials: { loginToken: { token: string } };
    }
  ).getLoginTokenFromCredentials.loginToken.token;

  const authResponse = await axios.post<{ data: Record<string, unknown> }>(
    `${twentyConfig.apiUrl}/metadata`,
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
