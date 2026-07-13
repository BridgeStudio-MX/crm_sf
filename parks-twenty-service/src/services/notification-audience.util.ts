import { PARKS_ROLE_LABEL_PREFIX } from '../metadata/parks-role-definitions';

export const ParksNotificationRole = {
  AdminLegal: `${PARKS_ROLE_LABEL_PREFIX}Admin Legal`,
  DirectorLegal: `${PARKS_ROLE_LABEL_PREFIX}Director Legal`,
  SubdirectorLegal: `${PARKS_ROLE_LABEL_PREFIX}Subdirector Legal`,
  CEO: `${PARKS_ROLE_LABEL_PREFIX}CEO`,
  AbogadoAsignado: `${PARKS_ROLE_LABEL_PREFIX}Abogado asignado`,
  EjecutivoComercial: `${PARKS_ROLE_LABEL_PREFIX}Ejecutivo Comercial`,
  CxC: `${PARKS_ROLE_LABEL_PREFIX}CxC`,
  DirectorComercial: `${PARKS_ROLE_LABEL_PREFIX}Director Comercial`,
} as const;

export const PARKS_NOTIFICATION_COMMERCIAL_ROLES = [
  ParksNotificationRole.EjecutivoComercial,
  ParksNotificationRole.DirectorComercial,
] as const;

export const PARKS_NOTIFICATION_LEGAL_ROLES = [
  ParksNotificationRole.AdminLegal,
  ParksNotificationRole.DirectorLegal,
  ParksNotificationRole.SubdirectorLegal,
  ParksNotificationRole.AbogadoAsignado,
] as const;

export const PARKS_NOTIFICATION_CEM_ROLES = [
  ParksNotificationRole.DirectorComercial,
] as const;

export const PARKS_NOTIFICATION_CXC_ROLES = [
  ParksNotificationRole.CxC,
  ParksNotificationRole.DirectorComercial,
] as const;

export const PARKS_NOTIFICATION_CEO_ROLES = [
  ParksNotificationRole.CEO,
  ParksNotificationRole.DirectorComercial,
] as const;

export const PARKS_NOTIFICATION_ALL_ROLES = Object.values(
  ParksNotificationRole,
);

const normalizePersonName = (value?: string | null): string =>
  (value ?? '')
    .normalize('NFD')
    .replace(/\p{M}/gu, '')
    .replace(/\s+/g, ' ')
    .trim()
    .toLowerCase();

const viewerMatchesAudienceName = (
  viewerName: string | undefined,
  audienceNames: string[],
): boolean => {
  const normalizedViewerName = normalizePersonName(viewerName);

  if (!normalizedViewerName) {
    return false;
  }

  return audienceNames.some((audienceName) => {
    const normalizedAudienceName = normalizePersonName(audienceName);

    return (
      normalizedAudienceName.length > 0 &&
      (normalizedViewerName.includes(normalizedAudienceName) ||
        normalizedAudienceName.includes(normalizedViewerName))
    );
  });
};

export const resolveAudienceRoleLabelsForArea = (
  area?: string,
): string[] => {
  const normalizedArea = (area ?? '').trim().toLowerCase();

  if (
    normalizedArea === 'comercial' ||
    normalizedArea === 'broker' ||
    normalizedArea === 'comisiones'
  ) {
    return [...PARKS_NOTIFICATION_COMMERCIAL_ROLES];
  }

  if (normalizedArea === 'cem') {
    return [...PARKS_NOTIFICATION_CEM_ROLES];
  }

  if (normalizedArea === 'legal' || normalizedArea.startsWith('legal')) {
    return [...PARKS_NOTIFICATION_LEGAL_ROLES];
  }

  if (normalizedArea === 'cxc') {
    return [...PARKS_NOTIFICATION_CXC_ROLES];
  }

  if (
    normalizedArea === 'ceo' ||
    normalizedArea === 'dirección' ||
    normalizedArea === 'direccion'
  ) {
    return [...PARKS_NOTIFICATION_CEO_ROLES];
  }

  if (normalizedArea === 'parks' || normalizedArea === '') {
    return [...PARKS_NOTIFICATION_ALL_ROLES];
  }

  return [...PARKS_NOTIFICATION_COMMERCIAL_ROLES];
};

export type NotificationAudienceViewer = {
  viewerName?: string;
  viewerEmail?: string;
  viewerRoleLabels?: string[];
};

export type NotificationAudienceFields = {
  area?: string;
  // undefined = derive from area; [] = names-only (no role broadcast)
  audienceRoleLabels?: string[];
  audienceNames?: string[];
};

export const isNotificationVisibleToViewer = (
  notification: NotificationAudienceFields,
  viewer: NotificationAudienceViewer,
): boolean => {
  const audienceNames = notification.audienceNames ?? [];
  const hasExplicitRoleLabels = Array.isArray(notification.audienceRoleLabels);
  const audienceRoleLabels = hasExplicitRoleLabels
    ? (notification.audienceRoleLabels ?? [])
    : resolveAudienceRoleLabelsForArea(notification.area);

  const viewerRoleLabels = viewer.viewerRoleLabels ?? [];

  // Names-only: lead assigned to a specific LO.
  if (audienceNames.length > 0 && audienceRoleLabels.length === 0) {
    return viewerMatchesAudienceName(viewer.viewerName, audienceNames);
  }

  const matchesName =
    audienceNames.length > 0 &&
    (viewerMatchesAudienceName(viewer.viewerName, audienceNames) ||
      viewerMatchesAudienceName(viewer.viewerEmail, audienceNames));
  const matchesRole = viewerRoleLabels.some((roleLabel) =>
    audienceRoleLabels.includes(roleLabel),
  );

  if (audienceNames.length > 0) {
    return matchesName || matchesRole;
  }

  if (viewerRoleLabels.length === 0) {
    const area = (notification.area ?? '').toLowerCase();

    return area === 'parks' || area === '';
  }

  return matchesRole;
};
