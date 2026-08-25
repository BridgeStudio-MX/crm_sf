import { t } from '@lingui/core/macro';
import { useContext } from 'react';
import { IconMail } from 'twenty-ui/icon';
import { ThemeContext } from 'twenty-ui/theme-constants';

import { ParksPageShell } from '@/parks-industrial/components/layout/ParksPageShell';
import { ParksMarketingSequencesContent } from '@/parks-industrial/components/marketing/ParksMarketingSequencesContent';
import { getParksIndustrialPageSubtitle } from '@/parks-industrial/constants/parks-tenant.constants';

export const ParksSecuenciasPage = () => {
  const { theme } = useContext(ThemeContext);

  return (
    <ParksPageShell
      title={t`Nutrición / secuencias`}
      subtitle={getParksIndustrialPageSubtitle(
        t`Correos de nutrición por canal — vista y revisión (edición próximamente)`,
      )}
      icon={<IconMail size={theme.icon.size.md} />}
    >
      <ParksMarketingSequencesContent />
    </ParksPageShell>
  );
};
