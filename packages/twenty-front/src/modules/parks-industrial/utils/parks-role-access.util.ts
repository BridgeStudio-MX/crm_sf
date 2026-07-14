import {
  PARKS_LEASING_OFFICER_ROLE_LABELS,
  PARKS_ROLE_LABEL_PREFIX,
  ParksRoleLabel,
} from '@/parks-industrial/constants/parks-role-access.constants';
import { type ParksCasoLegalRecord } from '@/parks-industrial/hooks/useParksRecords';

const normalizePersonName = (value?: string | null): string =>
  (value ?? '')
    .normalize('NFD')
    .replace(/\p{M}/gu, '')
    .replace(/\s+/g, ' ')
    .trim()
    .toLowerCase();

export const isParksRoleLabel = (label: string): boolean =>
  label.startsWith(PARKS_ROLE_LABEL_PREFIX);

export const filterParksRoleLabels = (roleLabels: string[]): string[] =>
  roleLabels.filter(isParksRoleLabel);

export const hasAnyParksRoleLabel = (
  userRoleLabels: string[],
  allowedRoleLabels: readonly string[],
): boolean =>
  allowedRoleLabels.some((allowedRoleLabel) =>
    userRoleLabels.includes(allowedRoleLabel),
  );

export const isParksLeasingOfficerRole = (roleLabels: string[]): boolean =>
  hasAnyParksRoleLabel(roleLabels, PARKS_LEASING_OFFICER_ROLE_LABELS);

export const filterParksCasosLegalesForAssignedLawyer = ({
  casosLegales,
  assignedLawyerName,
  assignedLawyerMatchNames = [],
  isAssignedLawyerOnly,
}: {
  casosLegales: ParksCasoLegalRecord[];
  assignedLawyerName: string;
  assignedLawyerMatchNames?: string[];
  isAssignedLawyerOnly: boolean;
}): ParksCasoLegalRecord[] => {
  if (!isAssignedLawyerOnly) {
    return casosLegales;
  }

  const matchNames = [
    assignedLawyerName,
    ...assignedLawyerMatchNames,
  ]
    .map((name) => normalizePersonName(name))
    .filter((name) => name.length > 0);

  if (matchNames.length === 0) {
    return [];
  }

  return casosLegales.filter((casoLegal) => {
    const normalizedAssignedOnCase = normalizePersonName(
      casoLegal.abogadoAsignado,
    );

    if (!normalizedAssignedOnCase) {
      return false;
    }

    return matchNames.some(
      (matchName) =>
        normalizedAssignedOnCase.includes(matchName) ||
        matchName.includes(normalizedAssignedOnCase),
    );
  });
};

export const isParksAssignedLawyerRole = (roleLabels: string[]): boolean =>
  roleLabels.includes(ParksRoleLabel.AbogadoAsignado) &&
  !roleLabels.includes(ParksRoleLabel.AdminLegal) &&
  !roleLabels.includes(ParksRoleLabel.DirectorLegal) &&
  !roleLabels.includes(ParksRoleLabel.SubdirectorLegal);
