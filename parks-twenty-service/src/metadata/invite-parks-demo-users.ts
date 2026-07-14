import axios from 'axios';
import { GraphQLClient } from 'graphql-request';

import { envConfig } from '../config/env.config';
import { twentyConfig } from '../config/twenty.config';
import {
  resolveTwentyAuthToken,
  resolveTwentyAuthTokenForUser,
} from './resolve-twenty-auth-token';
import {
  PARKS_DEMO_USER_PASSWORD,
  PARKS_DEMO_USERS,
  type ParksDemoUser,
} from './parks-demo-users.constants';

const LOG_PREFIX = '[setup:demo-users]';

type WorkspaceMemberNode = {
  id: string;
  userEmail: string;
};

type WorkspaceContext = {
  id: string;
  inviteHash: string;
  isPublicInviteLinkEnabled: boolean;
  origin: string;
};

const buildMetadataClient = (token?: string): GraphQLClient =>
  new GraphQLClient(`${twentyConfig.apiUrl}/metadata`, {
    headers: {
      ...(token ? { Authorization: `Bearer ${token}` } : {}),
      'Content-Type': 'application/json',
    },
  });

const buildGraphqlClient = (token: string): GraphQLClient =>
  new GraphQLClient(twentyConfig.graphqlUrl, {
    headers: {
      Authorization: `Bearer ${token}`,
      'Content-Type': 'application/json',
    },
  });

const resolveAdminToken = async (): Promise<string> => {
  if (envConfig.twentyApiKey) {
    return resolveTwentyAuthToken();
  }

  const adminEmail = process.env.TWENTY_DEV_EMAIL ?? 'tim@apple.dev';
  const adminPassword =
    process.env.TWENTY_DEV_PASSWORD ?? PARKS_DEMO_USER_PASSWORD;

  return resolveTwentyAuthTokenForUser(adminEmail, adminPassword);
};

const resolveWorkspaceOrigin = (): string =>
  process.env.TWENTY_WORKSPACE_ORIGIN ?? twentyConfig.apiUrl;

const fetchWorkspaceMembers = async (
  token: string,
): Promise<WorkspaceMemberNode[]> => {
  const client = buildGraphqlClient(token);

  const response = await client.request<{
    workspaceMembers: {
      edges: { node: WorkspaceMemberNode }[];
    };
  }>(`
    query WorkspaceMembersForDemoUsers {
      workspaceMembers {
        edges {
          node {
            id
            userEmail
          }
        }
      }
    }
  `);

  return response.workspaceMembers.edges.map((edge) => edge.node);
};

const fetchWorkspaceContextFromAuthenticated = async (
  token: string,
): Promise<Partial<WorkspaceContext>> => {
  const client = buildMetadataClient(token);

  const response = await client.request<{
    currentWorkspace: {
      id: string;
      inviteHash?: string | null;
      isPublicInviteLinkEnabled?: boolean | null;
      workspaceUrls: {
        subdomainUrl: string;
        customUrl?: string | null;
      };
    };
  }>(`
    query WorkspaceContextForDemoUsers {
      currentWorkspace {
        id
        inviteHash
        isPublicInviteLinkEnabled
        workspaceUrls {
          subdomainUrl
          customUrl
        }
      }
    }
  `);

  const workspace = response.currentWorkspace;

  return {
    id: workspace.id,
    inviteHash: workspace.inviteHash ?? undefined,
    isPublicInviteLinkEnabled: workspace.isPublicInviteLinkEnabled ?? false,
    origin:
      workspace.workspaceUrls.customUrl ??
      workspace.workspaceUrls.subdomainUrl ??
      resolveWorkspaceOrigin(),
  };
};

const fetchWorkspaceContextFromPublicDomain = async (
  origin: string,
): Promise<Partial<WorkspaceContext>> => {
  const response = await axios.post<{
    data?: {
      getPublicWorkspaceDataByDomain?: {
        id: string;
        workspaceUrls: {
          subdomainUrl: string;
          customUrl?: string | null;
        };
      };
    };
    errors?: Array<{ message: string }>;
  }>(
    `${twentyConfig.apiUrl}/metadata`,
    {
      query: `
        query PublicWorkspaceContextForDemoUsers($origin: String!) {
          getPublicWorkspaceDataByDomain(origin: $origin) {
            id
            workspaceUrls {
              subdomainUrl
              customUrl
            }
          }
        }
      `,
      variables: { origin },
    },
    {
      headers: {
        Origin: origin,
        'Content-Type': 'application/json',
      },
    },
  );

  if (response.data.errors?.length) {
    throw new Error(JSON.stringify(response.data.errors));
  }

  const workspace = response.data.data?.getPublicWorkspaceDataByDomain;

  if (!workspace?.id) {
    throw new Error(`Could not resolve workspace from origin ${origin}`);
  }

  return {
    id: workspace.id,
    origin:
      workspace.workspaceUrls.customUrl ??
      workspace.workspaceUrls.subdomainUrl ??
      origin,
  };
};

const resolveWorkspaceContext = async (
  token: string,
): Promise<WorkspaceContext> => {
  const origin = resolveWorkspaceOrigin();
  const authenticatedContext =
    await fetchWorkspaceContextFromAuthenticated(token);
  const publicContext = await fetchWorkspaceContextFromPublicDomain(origin);
  const inviteHash =
    authenticatedContext.inviteHash ??
    process.env.TWENTY_WORKSPACE_INVITE_HASH ??
    '';

  const workspaceId = authenticatedContext.id ?? publicContext.id;

  if (!workspaceId) {
    throw new Error('Could not resolve workspace id');
  }

  if (!inviteHash) {
    throw new Error(
      'Could not resolve workspace inviteHash — set TWENTY_WORKSPACE_INVITE_HASH in CI secrets if needed',
    );
  }

  return {
    id: workspaceId,
    inviteHash,
    isPublicInviteLinkEnabled:
      authenticatedContext.isPublicInviteLinkEnabled ?? false,
    origin: authenticatedContext.origin ?? publicContext.origin ?? origin,
  };
};

const enablePublicInviteLink = async (token: string): Promise<void> => {
  const client = buildMetadataClient(token);

  await client.request(`
    mutation EnablePublicInviteLink {
      updateWorkspace(data: { isPublicInviteLinkEnabled: true }) {
        id
        isPublicInviteLinkEnabled
      }
    }
  `);

  console.log(`${LOG_PREFIX}   ✓ Public invite link enabled`);
};

const signUpDemoUserInWorkspace = async ({
  demoUser,
  workspaceContext,
}: {
  demoUser: ParksDemoUser;
  workspaceContext: WorkspaceContext;
}): Promise<boolean> => {
  try {
    const response = await axios.post<{
      data: Record<string, unknown>;
      errors?: Array<{ message: string }>;
    }>(
      `${twentyConfig.apiUrl}/metadata`,
      {
        query: `
          mutation SignUpParksDemoUser(
            $email: String!
            $password: String!
            $workspaceInviteHash: String
            $workspaceId: UUID
          ) {
            signUpInWorkspace(
              email: $email
              password: $password
              workspaceInviteHash: $workspaceInviteHash
              workspaceId: $workspaceId
            ) {
              workspace {
                id
              }
            }
          }
        `,
        variables: {
          email: demoUser.email,
          password: demoUser.password,
          workspaceInviteHash: workspaceContext.inviteHash,
          workspaceId: workspaceContext.id,
        },
      },
      {
        headers: {
          Origin: workspaceContext.origin,
          'Content-Type': 'application/json',
        },
      },
    );

    if (response.data.errors) {
      const errorMessage = JSON.stringify(response.data.errors);
      console.warn(
        `${LOG_PREFIX}   ⚠ signUpInWorkspace ${demoUser.email}: ${errorMessage}`,
      );

      return false;
    }

    console.log(`${LOG_PREFIX}   ✓ Provisioned ${demoUser.email}`);
    return true;
  } catch (error) {
    const message = error instanceof Error ? error.message : String(error);
    console.warn(
      `${LOG_PREFIX}   ⚠ signUpInWorkspace ${demoUser.email}: ${message}`,
    );

    return false;
  }
};

const inviteMissingMembers = async ({
  token,
  emails,
}: {
  token: string;
  emails: string[];
}): Promise<number> => {
  if (emails.length === 0) {
    return 0;
  }

  const client = buildMetadataClient(token);

  const response = await client.request<{
    sendInvitations: {
      success: boolean;
      errors: string[];
      result: Array<{ email: string; success: boolean }>;
    };
  }>(
    `
      mutation SendParksDemoInvitations($emails: [String!]!) {
        sendInvitations(emails: $emails) {
          success
          errors
          result {
            email
            success
          }
        }
      }
    `,
    { emails },
  );

  const invitationResult = response.sendInvitations;

  for (const result of invitationResult.result) {
    if (result.success) {
      console.log(`${LOG_PREFIX}   ✓ Invited ${result.email}`);
    } else {
      console.warn(`${LOG_PREFIX}   ⚠ Could not invite ${result.email}`);
    }
  }

  if (invitationResult.errors.length > 0) {
    console.warn(
      `${LOG_PREFIX}   ⚠ Invitation errors: ${invitationResult.errors.join(', ')}`,
    );
  }

  return invitationResult.result.filter((result) => result.success).length;
};

const provisionMissingDemoUsers = async ({
  token,
  missingDemoUsers,
  workspaceContext,
}: {
  token: string;
  missingDemoUsers: ParksDemoUser[];
  workspaceContext: WorkspaceContext;
}): Promise<number> => {
  if (!workspaceContext.isPublicInviteLinkEnabled) {
    try {
      await enablePublicInviteLink(token);
    } catch (error) {
      const message = error instanceof Error ? error.message : String(error);
      console.warn(
        `${LOG_PREFIX}   ⚠ Could not enable public invite link: ${message}`,
      );
    }
  }

  let provisionedCount = 0;
  const stillMissingEmails: string[] = [];

  for (const demoUser of missingDemoUsers) {
    const provisioned = await signUpDemoUserInWorkspace({
      demoUser,
      workspaceContext,
    });

    if (provisioned) {
      provisionedCount += 1;
      continue;
    }

    stillMissingEmails.push(demoUser.email);
  }

  if (stillMissingEmails.length > 0 && !envConfig.twentyApiKey) {
    console.log(
      `${LOG_PREFIX} Fallback invitations for ${stillMissingEmails.length} user(s)...`,
    );

    try {
      provisionedCount += await inviteMissingMembers({
        token,
        emails: stillMissingEmails,
      });
    } catch (error) {
      const message = error instanceof Error ? error.message : String(error);
      console.warn(
        `${LOG_PREFIX}   ⚠ Invitation fallback skipped: ${message}`,
      );
    }
  }

  return provisionedCount;
};

export const inviteParksDemoUsers = async (): Promise<void> => {
  console.log(
    `${LOG_PREFIX} Ensuring one workspace member per Parks role (${PARKS_DEMO_USERS.length} users)...`,
  );

  const token = await resolveAdminToken();
  const workspaceContext = await resolveWorkspaceContext(token);
  const members = await fetchWorkspaceMembers(token);

  const memberEmails = new Set(
    members.map((member) => member.userEmail.toLowerCase()),
  );

  const missingDemoUsers = PARKS_DEMO_USERS.filter(
    (demoUser) => !memberEmails.has(demoUser.email.toLowerCase()),
  );

  if (missingDemoUsers.length === 0) {
    console.log(
      `${LOG_PREFIX} All ${PARKS_DEMO_USERS.length} demo users are workspace members.`,
    );
  } else {
    console.log(
      `${LOG_PREFIX} Missing ${missingDemoUsers.length} member(s) — provisioning via signUpInWorkspace...`,
    );

    const provisionedCount = await provisionMissingDemoUsers({
      token,
      missingDemoUsers,
      workspaceContext,
    });

    const refreshedMembers = await fetchWorkspaceMembers(token);
    const refreshedEmails = new Set(
      refreshedMembers.map((member) => member.userEmail.toLowerCase()),
    );
    const remainingCount = PARKS_DEMO_USERS.filter(
      (demoUser) => !refreshedEmails.has(demoUser.email.toLowerCase()),
    ).length;

    console.log(
      `${LOG_PREFIX} Provisioned ${provisionedCount}/${missingDemoUsers.length} — remaining missing: ${remainingCount}`,
    );

    if (remainingCount > 0) {
      throw new Error(
        `${remainingCount} demo user(s) still missing from workspace after provisioning`,
      );
    }
  }

  console.log(`${LOG_PREFIX} Demo users:`);

  for (const demoUser of PARKS_DEMO_USERS) {
    console.log(
      `${LOG_PREFIX}   ${demoUser.email} → ${demoUser.roleLabel} · pass=${demoUser.password} (${demoUser.persona})`,
    );
  }
};
