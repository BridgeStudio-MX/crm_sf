import { PARKS_INDUSTRIAL_TENANT_NAME } from '../constants/parks-tenant.constants';
import { metadataClient } from './metadata-client';

const LOG_PREFIX = '[setup:workspace-branding]';

export const setupParksWorkspaceBranding = async (): Promise<void> => {
  console.log(
    `${LOG_PREFIX} Setting workspace display name to "${PARKS_INDUSTRIAL_TENANT_NAME}"...`,
  );

  const response = await metadataClient.request<{
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
