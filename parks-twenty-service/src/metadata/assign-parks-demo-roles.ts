import { GraphQLClient } from 'graphql-request';

import { envConfig } from '../config/env.config';
import { twentyConfig } from '../config/twenty.config';
import { metadataClient } from './metadata-client';
import { PARKS_DEMO_ROLE_ASSIGNMENTS } from './parks-demo-role-assignments.constants';
import {
  PARKS_DEMO_USERS,
  TWENTY_BOOTSTRAP_EMAIL,
  TWENTY_BOOTSTRAP_PASSWORD,
} from './parks-demo-users.constants';
import {
  resolveTwentyAuthTokenForUser,
  resolveTwentyUserAuthToken,
} from './resolve-twenty-auth-token';

const LOG_PREFIX = '[setup:assign-roles]';

type WorkspaceMemberNode = {
  id: string;
  userEmail: string;
};

const fetchWorkspaceMembers = async (
  token: string,
): Promise<WorkspaceMemberNode[]> => {
  const client = new GraphQLClient(twentyConfig.graphqlUrl, {
    headers: {
      Authorization: `Bearer ${token}`,
      'Content-Type': 'application/json',
    },
  });

  const response = await client.request<{
    workspaceMembers: {
      edges: { node: WorkspaceMemberNode }[];
    };
  }>(`
    query WorkspaceMembersForRoleAssignment {
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

const assignRoleWithToken = async ({
  token,
  assignerEmail,
  workspaceMemberId,
  roleId,
  targetEmail,
  roleLabel,
}: {
  token: string;
  assignerEmail: string;
  workspaceMemberId: string;
  roleId: string;
  targetEmail: string;
  roleLabel: string;
}): Promise<boolean> => {
  const client = new GraphQLClient(`${twentyConfig.apiUrl}/metadata`, {
    headers: {
      Authorization: `Bearer ${token}`,
      'Content-Type': 'application/json',
    },
  });

  try {
    await client.request(
      `
        mutation AssignWorkspaceMemberRole(
          $workspaceMemberId: UUID!
          $roleId: UUID!
        ) {
          updateWorkspaceMemberRole(
            workspaceMemberId: $workspaceMemberId
            roleId: $roleId
          ) {
            id
            userEmail
          }
        }
      `,
      { workspaceMemberId, roleId },
    );

    console.log(
      `${LOG_PREFIX}   ✓ ${targetEmail} → ${roleLabel} (by ${assignerEmail})`,
    );

    return true;
  } catch (error) {
    const message = error instanceof Error ? error.message : String(error);
    console.warn(
      `${LOG_PREFIX}   ⚠ ${targetEmail} → ${roleLabel} failed: ${message}`,
    );

    return false;
  }
};

const runAssignments = async ({
  token,
  assignerLabel,
  skipEmails = [],
  roleIdByLabel,
}: {
  token: string;
  assignerLabel: string;
  skipEmails?: string[];
  roleIdByLabel: Map<string, string>;
}): Promise<number> => {
  const members = await fetchWorkspaceMembers(token);
  const memberIdByEmail = new Map(
    members.map((member) => [member.userEmail.toLowerCase(), member.id]),
  );
  const skipEmailSet = new Set(skipEmails.map((email) => email.toLowerCase()));

  let passAssignedCount = 0;

  for (const assignment of PARKS_DEMO_ROLE_ASSIGNMENTS) {
    const roleId = roleIdByLabel.get(assignment.roleLabel);

    if (!roleId) {
      continue;
    }

    if (skipEmailSet.has(assignment.userEmail.toLowerCase())) {
      continue;
    }

    const workspaceMemberId = memberIdByEmail.get(
      assignment.userEmail.toLowerCase(),
    );

    if (!workspaceMemberId) {
      console.warn(
        `${LOG_PREFIX}   ⚠ ${assignment.userEmail} not in workspace — run setup:demo-users first`,
      );
      continue;
    }

    const assigned = await assignRoleWithToken({
      token,
      assignerEmail: assignerLabel,
      workspaceMemberId,
      roleId,
      targetEmail: assignment.userEmail,
      roleLabel: assignment.roleLabel,
    });

    if (assigned) {
      passAssignedCount += 1;
    }
  }

  return passAssignedCount;
};

export const assignParksDemoRoles = async (): Promise<void> => {
  console.log(`${LOG_PREFIX} Assigning Parks demo roles to workspace members...`);

  const roles = await metadataClient.getRoles();
  const roleIdByLabel = new Map(roles.map((role) => [role.label, role.id]));

  const missingRoles = PARKS_DEMO_ROLE_ASSIGNMENTS.filter(
    (assignment) => !roleIdByLabel.has(assignment.roleLabel),
  );

  if (missingRoles.length > 0) {
    console.warn(
      `${LOG_PREFIX} Missing roles — run npm run setup:roles first:`,
      missingRoles.map((assignment) => assignment.roleLabel).join(', '),
    );
  }

  const bootstrapEmail =
    process.env.TWENTY_BOOTSTRAP_EMAIL ??
    process.env.TWENTY_DEV_EMAIL ??
    TWENTY_BOOTSTRAP_EMAIL;
  const bootstrapPassword =
    process.env.TWENTY_BOOTSTRAP_PASSWORD ??
    process.env.TWENTY_DEV_PASSWORD ??
    TWENTY_BOOTSTRAP_PASSWORD;

  let assignedCount = 0;

  if (envConfig.twentyApiKey) {
    const token = await resolveTwentyUserAuthToken();

    assignedCount = await runAssignments({
      token,
      assignerLabel: bootstrapEmail,
      roleIdByLabel,
      skipEmails: [bootstrapEmail],
    });
  } else {
    const primaryToken = await resolveTwentyAuthTokenForUser(
      bootstrapEmail,
      bootstrapPassword,
    );

    assignedCount += await runAssignments({
      token: primaryToken,
      assignerLabel: bootstrapEmail,
      skipEmails: [bootstrapEmail],
      roleIdByLabel,
    });
  }

  const userToken = await resolveTwentyUserAuthToken();
  const members = await fetchWorkspaceMembers(userToken);
  const memberEmails = new Set(
    members.map((member) => member.userEmail.toLowerCase()),
  );

  const missingMembers = PARKS_DEMO_ROLE_ASSIGNMENTS.filter(
    (assignment) => !memberEmails.has(assignment.userEmail.toLowerCase()),
  );

  if (missingMembers.length > 0) {
    console.log(
      `${LOG_PREFIX} Missing workspace members (${missingMembers.length}/${PARKS_DEMO_USERS.length}):`,
    );

    for (const assignment of missingMembers) {
      console.log(`${LOG_PREFIX}   - ${assignment.userEmail}`);
    }

    console.log(`${LOG_PREFIX} Run: npm run setup:demo-users first`);
  }

  console.log(
    `${LOG_PREFIX} Done — ${assignedCount} role assignment(s) applied.`,
  );

  for (const assignment of PARKS_DEMO_ROLE_ASSIGNMENTS) {
    console.log(
      `${LOG_PREFIX}   ${assignment.userEmail} → ${assignment.roleLabel} (${assignment.persona})`,
    );
  }

  const expectedAssignments = PARKS_DEMO_ROLE_ASSIGNMENTS.filter((assignment) =>
    roleIdByLabel.has(assignment.roleLabel),
  ).length;

  if (
    envConfig.twentyApiKey &&
    assignedCount < expectedAssignments
  ) {
    throw new Error(
      `Only ${assignedCount}/${expectedAssignments} Parks demo roles were assigned — check TWENTY_BOOTSTRAP_EMAIL has admin + ROLES permission`,
    );
  }
};
