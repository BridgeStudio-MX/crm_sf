import { useMemo } from 'react';

import { currentUserState } from '@/auth/states/currentUserState';
import { currentWorkspaceMemberState } from '@/auth/states/currentWorkspaceMemberState';
import {
  PARKS_DEMO_EMAIL_TO_ROLE_LABEL,
  PARKS_LEGAL_ASSIGN_LAWYER_ROLE_LABELS,
  PARKS_LEGAL_EDITOR_ROLE_LABELS,
  PARKS_NAV_ROUTE_ACCESS,
  PARKS_ROLE_HOME_PATH,
  PARKS_ROUTE_ACCESS_BY_KEY,
  ParksRoleLabel,
  type ParksRouteAccessKey,
  resolveParksRouteAccessKey,
} from '@/parks-industrial/constants/parks-role-access.constants';
import { resolveLegalLawyerNameFromEmail } from '@/parks-industrial/constants/parks-legal-workflow.constants';
import {
  filterParksRoleLabels,
  hasAnyParksRoleLabel,
  isParksAssignedLawyerRole,
} from '@/parks-industrial/utils/parks-role-access.util';
import { useAtomStateValue } from '@/ui/utilities/state/jotai/hooks/useAtomStateValue';
import { AppPath } from 'twenty-shared/types';
import { isDefined } from 'twenty-shared/utils';

const resolveRoleLabelsFromEmail = (email?: string | null): string[] => {
  if (!isDefined(email)) {
    return [];
  }

  const roleLabel = PARKS_DEMO_EMAIL_TO_ROLE_LABEL[email.toLowerCase()];

  return roleLabel ? [roleLabel] : [];
};

export const useParksAccess = () => {
  const currentUser = useAtomStateValue(currentUserState);
  const workspaceMember = useAtomStateValue(currentWorkspaceMemberState);

  const parksRoleLabels = useMemo(() => {
    const roleLabelsFromMember = filterParksRoleLabels(
      workspaceMember?.roles?.map((role) => role.label) ?? [],
    );

    if (roleLabelsFromMember.length > 0) {
      return roleLabelsFromMember;
    }

    return resolveRoleLabelsFromEmail(
      workspaceMember?.userEmail ?? currentUser?.email,
    );
  }, [currentUser?.email, workspaceMember?.roles, workspaceMember?.userEmail]);

  const hasParksRole = parksRoleLabels.length > 0;
  const hasFullParksAccess =
    (currentUser?.canAccessFullAdminPanel ?? false) && !hasParksRole;

  const displayName = useMemo(() => {
    if (isDefined(workspaceMember?.name)) {
      return [
        workspaceMember.name.firstName,
        workspaceMember.name.lastName,
      ]
        .map((part) => part?.trim() ?? '')
        .filter((part) => part.length > 0)
        .join(' ')
        .replace(/\s+/g, ' ')
        .trim();
    }

    if (isDefined(currentUser?.firstName) || isDefined(currentUser?.lastName)) {
      return [currentUser?.firstName, currentUser?.lastName]
        .map((part) => part?.trim() ?? '')
        .filter((part) => part.length > 0)
        .join(' ')
        .replace(/\s+/g, ' ')
        .trim();
    }

    return workspaceMember?.userEmail ?? currentUser?.email ?? '';
  }, [currentUser, workspaceMember]);

  const primaryParksRoleLabel = parksRoleLabels[0] ?? null;

  const userEmail =
    workspaceMember?.userEmail ?? currentUser?.email ?? null;

  const assignedLawyerName = displayName;

  const assignedLawyerMatchNames = useMemo(() => {
    const names = [displayName];

    if (userEmail) {
      names.push(userEmail);
      const mappedName = resolveLegalLawyerNameFromEmail(userEmail);

      if (mappedName) {
        names.push(mappedName);
      }
    }

    return [...new Set(names.filter((name) => name.trim().length > 0))];
  }, [displayName, userEmail]);

  const isAssignedLawyerOnly = isParksAssignedLawyerRole(parksRoleLabels);

  const canAccessRoute = (accessKey: ParksRouteAccessKey): boolean => {
    if (hasFullParksAccess) {
      return true;
    }

    if (!hasParksRole) {
      return false;
    }

    return hasAnyParksRoleLabel(
      parksRoleLabels,
      PARKS_ROUTE_ACCESS_BY_KEY[accessKey],
    );
  };

  const canAccessPath = (pathname: string): boolean => {
    const accessKey = resolveParksRouteAccessKey(pathname);

    // Non-Parks routes (e.g. /settings/*) are outside Parks ACL.
    if (!isDefined(accessKey)) {
      return true;
    }

    return canAccessRoute(accessKey);
  };

  const accessibleNavRoutes = useMemo(() => {
    if (hasFullParksAccess) {
      return PARKS_NAV_ROUTE_ACCESS;
    }

    if (!hasParksRole) {
      return [];
    }

    return PARKS_NAV_ROUTE_ACCESS.filter((routeAccess) =>
      hasAnyParksRoleLabel(
        parksRoleLabels,
        PARKS_ROUTE_ACCESS_BY_KEY[routeAccess.accessKey],
      ),
    );
  }, [hasFullParksAccess, hasParksRole, parksRoleLabels]);

  const preferredHomePath = primaryParksRoleLabel
    ? PARKS_ROLE_HOME_PATH[primaryParksRoleLabel]
    : undefined;

  const canUsePreferredHome =
    isDefined(preferredHomePath) &&
    accessibleNavRoutes.some((routeAccess) => routeAccess.to === preferredHomePath);

  const defaultAccessiblePath = canUsePreferredHome
    ? preferredHomePath
    : (accessibleNavRoutes[0]?.to ?? AppPath.ParksNotificaciones);

  const canEditLegalWorkflow =
    hasFullParksAccess ||
    hasAnyParksRoleLabel(parksRoleLabels, PARKS_LEGAL_EDITOR_ROLE_LABELS);

  const canAssignLegalLawyer =
    hasFullParksAccess ||
    hasAnyParksRoleLabel(parksRoleLabels, PARKS_LEGAL_ASSIGN_LAWYER_ROLE_LABELS);

  const canViewLegalDashboardReport =
    hasFullParksAccess ||
    hasAnyParksRoleLabel(parksRoleLabels, [
      ParksRoleLabel.AdminLegal,
      ParksRoleLabel.DirectorLegal,
    ]);

  const hasAnyParksNavAccess =
    hasFullParksAccess || accessibleNavRoutes.length > 0;

  return {
    parksRoleLabels,
    hasParksRole,
    hasFullParksAccess,
    displayName,
    userEmail,
    primaryParksRoleLabel,
    assignedLawyerName,
    assignedLawyerMatchNames,
    isAssignedLawyerOnly,
    canAccessRoute,
    canAccessPath,
    accessibleNavRoutes,
    defaultAccessiblePath,
    canEditLegalWorkflow,
    canAssignLegalLawyer,
    canViewLegalDashboardReport,
    hasAnyParksNavAccess,
  };
};
