import { type Request } from 'express';
import { type APP_LOCALES, SOURCE_LOCALE } from 'twenty-shared/translations';

import { type RawAuthContext } from 'src/engine/core-modules/auth/types/raw-auth-context.type';

export const bindDataToRequestObject = (
  data: RawAuthContext,
  request: Request,
  metadataVersion: number | undefined,
) => {
  request.user = data.user;
  request.apiKey = data.apiKey;
  request.application = data.application;
  request.userWorkspace = data.userWorkspace;
  request.workspace = data.workspace;
  request.workspaceId = data.workspace?.id;
  request.workspaceMetadataVersion = metadataVersion;
  request.workspaceMemberId = data.workspaceMemberId;
  request.workspaceMember = data.workspaceMember;
  request.userWorkspaceId = data.userWorkspaceId;
  request.authProvider = data.authProvider;
  request.impersonationContext = data.impersonationContext;
  request.tokenType = data.tokenType;

  const headerLocale = request.headers['x-locale'] as
    | keyof typeof APP_LOCALES
    | undefined;
  const userWorkspaceLocale = data.userWorkspace?.locale;

  const candidateLocale =
    headerLocale ??
    userWorkspaceLocale ??
    ('es-ES' as keyof typeof APP_LOCALES);

  // Bridge Studio: español por defecto; 'en' legado se trata como es-ES.
  request.locale =
    candidateLocale === SOURCE_LOCALE
      ? ('es-ES' as keyof typeof APP_LOCALES)
      : candidateLocale;
};
