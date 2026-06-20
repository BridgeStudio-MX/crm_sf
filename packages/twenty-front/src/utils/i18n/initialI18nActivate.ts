import { dynamicActivate } from '~/utils/i18n/dynamicActivate';

// El sistema arranca SIEMPRE en español, ignorando el idioma del navegador.
// Un usuario logueado puede cambiar su idioma en su perfil; esa preferencia se
// aplica al cargar la sesión (useLoadCurrentUser / UserMetadataProviderInitialEffect).
export const initialI18nActivate = () => {
  dynamicActivate('es-ES');
};
