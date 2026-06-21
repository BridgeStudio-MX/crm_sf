import { type APP_LOCALES, SOURCE_LOCALE } from 'twenty-shared/translations';

// Bridge Studio arranca en español; workspaces legados pueden tener locale 'en' en BD.
export const resolveApplicationLocale = (
  locale: keyof typeof APP_LOCALES | null | undefined,
): keyof typeof APP_LOCALES => {
  if (!locale || locale === SOURCE_LOCALE) {
    return 'es-ES';
  }

  return locale;
};
