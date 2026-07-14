import { useMemo } from 'react';

import { currentWorkspaceMembersState } from '@/auth/states/currentWorkspaceMembersState';
import {
  PARKS_DEMO_EMAIL_TO_ROLE_LABEL,
  PARKS_LEASING_OFFICER_ROLE_LABELS,
} from '@/parks-industrial/constants/parks-role-access.constants';
import { PARKS_LEASING_OFFICER_OPTIONS } from '@/parks-industrial/utils/parks-unassigned-leads.util';
import { hasAnyParksRoleLabel } from '@/parks-industrial/utils/parks-role-access.util';
import { useAtomStateValue } from '@/ui/utilities/state/jotai/hooks/useAtomStateValue';
import { isDefined } from 'twenty-shared/utils';

const formatWorkspaceMemberDisplayName = (member: {
  name?: { firstName?: string | null; lastName?: string | null } | null;
  userEmail?: string | null;
}): string => {
  const fullName =
    `${member.name?.firstName ?? ''} ${member.name?.lastName ?? ''}`.trim();

  return fullName || member.userEmail?.trim() || '';
};

const isLeasingOfficerMember = (member: {
  userEmail?: string | null;
  roles?: Array<{ label: string }> | null;
}): boolean => {
  const roleLabels = member.roles?.map((role) => role.label) ?? [];

  if (hasAnyParksRoleLabel(roleLabels, PARKS_LEASING_OFFICER_ROLE_LABELS)) {
    return true;
  }

  const email = member.userEmail?.toLowerCase();

  if (!isDefined(email)) {
    return false;
  }

  const demoRoleLabel = PARKS_DEMO_EMAIL_TO_ROLE_LABEL[email];

  return (
    isDefined(demoRoleLabel) &&
    hasAnyParksRoleLabel([demoRoleLabel], PARKS_LEASING_OFFICER_ROLE_LABELS)
  );
};

// Live LOs from the workspace + demo fallbacks (Edgard first for client demos).
export const useParksLeasingOfficerOptions = (): string[] => {
  const workspaceMembers = useAtomStateValue(currentWorkspaceMembersState);

  return useMemo(() => {
    const fromWorkspace = workspaceMembers
      .filter(isLeasingOfficerMember)
      .map(formatWorkspaceMemberDisplayName)
      .filter((displayName) => displayName.length > 0);

    // Prefer Edgard / real workspace LOs before generic demo names.
    return Array.from(
      new Set([...fromWorkspace, ...PARKS_LEASING_OFFICER_OPTIONS]),
    );
  }, [workspaceMembers]);
};
