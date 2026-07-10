import { GraphQLClient } from 'graphql-request';

import { envConfig } from '../config/env.config';
import { twentyConfig } from '../config/twenty.config';
import {
  resolveTwentyAuthToken,
  resolveTwentyAuthTokenForUser,
} from './resolve-twenty-auth-token';
import { metadataClient } from './metadata-client';
import { PARKS_DEMO_ROLE_ASSIGNMENTS } from './parks-demo-role-assignments.constants';
import {
  PARKS_DEMO_USER_PASSWORD,
  PARKS_DEMO_USERS,
} from './parks-demo-users.constants';

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

  const runAssignments = async ({
    token,
    assignerLabel,
    skipEmails = [],
  }: {
    token: string;
    assignerLabel: string;
    skipEmails?: string[];
  }): Promise<number> => {
    const members = await fetchWorkspaceMembers(token);
    const memberIdByEmail = new Map(
      members.map((member) => [member.userEmail.toLowerCase(), member.id]),
    );
    const skipEmailSet = new Set(
      skipEmails.map((email) => email.toLowerCase()),
    );

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

  let assignedCount = 0;
  let members: WorkspaceMemberNode[] = [];

  if (envConfig.twentyApiKey) {
    const token = await resolveTwentyAuthToken();
    members = await fetchWorkspaceMembers(token);
    assignedCount = await runAssignments({
      token,
      assignerLabel: 'TWENTY_API_KEY',
    });
  } else {
    const primaryEmail = process.env.TWENTY_DEV_EMAIL ?? 'tim@apple.dev';
    const primaryPassword =
      process.env.TWENTY_DEV_PASSWORD ?? PARKS_DEMO_USER_PASSWORD;

    const primaryToken = await resolveTwentyAuthTokenForUser(
      primaryEmail,
      primaryPassword,
    );

    members = await fetchWorkspaceMembers(primaryToken);
    assignedCount += await runAssignments({
      token: primaryToken,
      assignerLabel: primaryEmail,
      skipEmails: [primaryEmail],
    });

    const timAssignment = PARKS_DEMO_ROLE_ASSIGNMENTS.find(
      (assignment) => assignment.userEmail.toLowerCase() === 'tim@apple.dev',
    );

    if (timAssignment) {
      const secondaryEmail = 'jane.austen@apple.dev';

      try {
        const secondaryToken = await resolveTwentyAuthTokenForUser(
          secondaryEmail,
          PARKS_DEMO_USER_PASSWORD,
        );

        assignedCount += await runAssignments({
          token: secondaryToken,
          assignerLabel: secondaryEmail,
          skipEmails: PARKS_DEMO_ROLE_ASSIGNMENTS.filter(
            (assignment) =>
              assignment.userEmail.toLowerCase() !== 'tim@apple.dev',
          ).map((assignment) => assignment.userEmail),
        });
      } catch (error) {
        const message = error instanceof Error ? error.message : String(error);
        console.warn(
          `${LOG_PREFIX}   ⚠ Could not assign tim@apple.dev role via ${secondaryEmail}: ${message}`,
        );
      }
    }
  }

  const memberEmails = new Set(
    members.map((member) => member.userEmail.toLowerCase()),
  );

  const missingMembers = PARKS_DEMO_ROLE_ASSIGNMENTS.filter(
    (assignment) => !memberEmails.has(assignment.userEmail.toLowerCase()),
  );

  if (assignedCount === 0 && missingMembers.length > 0) {
    console.log(
      `${LOG_PREFIX} Missing workspace members (${missingMembers.length}/${PARKS_DEMO_USERS.length}):`,
    );

    for (const assignment of missingMembers) {
      console.log(`${LOG_PREFIX}   - ${assignment.userEmail}`);
    }

    console.log(
      `${LOG_PREFIX} Run: npm run setup:demo-users (invite) or npx nx database:reset twenty-server (local seed)`,
    );
  }

  console.log(
    `${LOG_PREFIX} Done — ${assignedCount} role assignment(s) applied.`,
  );

  for (const assignment of PARKS_DEMO_ROLE_ASSIGNMENTS) {
    console.log(
      `${LOG_PREFIX}   ${assignment.userEmail} → ${assignment.roleLabel} (${assignment.persona})`,
    );
  }
};
