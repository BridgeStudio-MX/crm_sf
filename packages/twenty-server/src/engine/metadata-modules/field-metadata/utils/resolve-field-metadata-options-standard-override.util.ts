import { type I18n } from '@lingui/core';
import { type APP_LOCALES } from 'twenty-shared/translations';

import { type FieldMetadataDefaultOption } from 'src/engine/metadata-modules/field-metadata/dtos/options.input';
import { resolveFieldMetadataStandardOverride } from 'src/engine/metadata-modules/field-metadata/utils/resolve-field-metadata-standard-override.util';

export const resolveFieldMetadataOptionsStandardOverride = ({
  options,
  locale,
  i18nInstance,
  isStandardApp,
}: {
  options: FieldMetadataDefaultOption[] | undefined;
  locale: keyof typeof APP_LOCALES | undefined;
  i18nInstance: I18n;
  isStandardApp: boolean;
}): FieldMetadataDefaultOption[] | undefined => {
  if (!options || !isStandardApp) {
    return options;
  }

  return options.map((option) => ({
    ...option,
    label: resolveFieldMetadataStandardOverride(
      {
        label: option.label,
        description: undefined,
        icon: undefined,
        standardOverrides: undefined,
      },
      'label',
      locale,
      i18nInstance,
      isStandardApp,
    ),
  }));
};
