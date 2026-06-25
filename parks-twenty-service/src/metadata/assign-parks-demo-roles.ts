import { GraphQLClient } from 'graphql-request';

import { twentyConfig } from '../config/twenty.config';
import { resolveTwentyAuthTokenForUser } from './resolve-twenty-auth-token';
import { metadataClient } from './metadata-client';
import { PARKS_DEMO_ROLE_ASSIGNMENTS } from './parks-demo-role-assignments.constants';

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

  const assignerPasses: Array<{ email: string; password: string }> = [
    { email: 'jane.austen@apple.dev', password: 'tim@apple.dev' },
    { email: 'tim@apple.dev', password: 'tim@apple.dev' },
  ];

  let assignedCount = 0;

  for (const assigner of assignerPasses) {
    let token: string;

    try {
      token = await resolveTwentyAuthTokenForUser(
        assigner.email,
        assigner.password,
      );
    } catch (error) {
      const message = error instanceof Error ? error.message : String(error);
      console.warn(
        `${LOG_PREFIX}   ⚠ Could not login as ${assigner.email}: ${message}`,
      );
      continue;
    }

    let members: WorkspaceMemberNode[];

    try {
      members = await fetchWorkspaceMembers(token);
    } catch (error) {
      const message = error instanceof Error ? error.message : String(error);
      console.warn(
        `${LOG_PREFIX}   ⚠ Could not list members as ${assigner.email}: ${message}`,
      );
      continue;
    }

    const memberIdByEmail = new Map(
      members.map((member) => [member.userEmail.toLowerCase(), member.id]),
    );

    const assignerMemberId = memberIdByEmail.get(assigner.email.toLowerCase());

    for (const assignment of PARKS_DEMO_ROLE_ASSIGNMENTS) {
      const roleId = roleIdByLabel.get(assignment.roleLabel);

      if (!roleId) {
        continue;
      }

      if (
        assignerMemberId &&
        assignment.userEmail.toLowerCase() === assigner.email.toLowerCase()
      ) {
        continue;
      }

      const workspaceMemberId = memberIdByEmail.get(
        assignment.userEmail.toLowerCase(),
      );

      if (!workspaceMemberId) {
        continue;
      }

      const assigned = await assignRoleWithToken({
        token,
        assignerEmail: assigner.email,
        workspaceMemberId,
        roleId,
        targetEmail: assignment.userEmail,
        roleLabel: assignment.roleLabel,
      });

      if (assigned) {
        assignedCount += 1;
      }
    }
  }

  const timOnlyWorkspace =
    assignedCount === 0 &&
    PARKS_DEMO_ROLE_ASSIGNMENTS.every(
      (assignment) => assignment.userEmail.toLowerCase() !== 'tim@apple.dev',
    );

  if (timOnlyWorkspace) {
    console.log(
      `${LOG_PREFIX} Solo hay un miembro (tim@apple.dev). Invita a jane.austen@, phil.schiler@, jony.ive@ y scott.forstall@apple.dev para asignar roles demo, o usa Settings → Members manualmente.`,
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
