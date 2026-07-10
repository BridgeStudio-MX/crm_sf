import { GraphQLClient } from 'graphql-request';

import { PARKS_INDUSTRIAL_TENANT_NAME } from '../constants/parks-tenant.constants';
import { twentyConfig } from '../config/twenty.config';
import { resolveTwentyUserAuthToken } from './resolve-twenty-auth-token';

const LOG_PREFIX = '[setup:workspace-branding]';

export const setupParksWorkspaceBranding = async (): Promise<void> => {
  console.log(
    `${LOG_PREFIX} Setting workspace display name to "${PARKS_INDUSTRIAL_TENANT_NAME}"...`,
  );

  const token = await resolveTwentyUserAuthToken();
  const client = new GraphQLClient(`${twentyConfig.apiUrl}/metadata`, {
    headers: {
      Authorization: `Bearer ${token}`,
      'Content-Type': 'application/json',
    },
  });

  const response = await client.request<{
    updateWorkspace: { id: string; displayName: string };
  }>(
    `
      mutation UpdateWorkspace($input: UpdateWorkspaceInput!) {
        updateWorkspace(data: $input) {
          id
          displayName
        }
      }
    `,
    {
      input: {
        displayName: PARKS_INDUSTRIAL_TENANT_NAME,
      },
    },
  );

  console.log(
    `${LOG_PREFIX} Done — workspace "${response.updateWorkspace.displayName}"`,
  );
};
