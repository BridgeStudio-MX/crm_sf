import { metadataLoadedVersionState } from '@/metadata-store/states/metadataLoadedVersionState';
import { resetMetadataStore } from '@/metadata-store/hooks/useUpdateMetadataStoreDraft';
import { type APP_LOCALES } from 'twenty-shared/translations';
import { type createStore } from 'jotai';

const METADATA_LOCALE_CACHE_KEY = 'bridge-studio-metadata-locale-v2';

type JotaiStore = ReturnType<typeof createStore>;

export const syncApplicationMetadataLocale = (
  store: JotaiStore,
  locale: keyof typeof APP_LOCALES,
) => {
  let cachedLocale: string | null = null;

  try {
    cachedLocale = sessionStorage.getItem(METADATA_LOCALE_CACHE_KEY);
  } catch {
    cachedLocale = null;
  }

  if (cachedLocale === locale) {
    return;
  }

  try {
    sessionStorage.setItem(METADATA_LOCALE_CACHE_KEY, locale);
  } catch {
    // sessionStorage may be unavailable in some browsers
  }

  resetMetadataStore(store);
  store.set(metadataLoadedVersionState.atom, (previous) => previous + 1);
};
