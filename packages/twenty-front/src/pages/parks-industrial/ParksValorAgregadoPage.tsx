import { t } from '@lingui/core/macro';
import { IconSparkles } from 'twenty-ui/icon';
import { useContext } from 'react';
import { ThemeContext } from 'twenty-ui/theme-constants';

import { ParksValorAgregadoContent } from '@/parks-industrial/components/valor-agregado/ParksValorAgregadoContent';
import { ParksPageShell } from '@/parks-industrial/components/layout/ParksPageShell';
import { getParksIndustrialPageSubtitle } from '@/parks-industrial/constants/parks-tenant.constants';

export const ParksValorAgregadoPage = () => {
  const { theme } = useContext(ThemeContext);

  return (
    <ParksPageShell
      title={t`Valor agregado`}
      subtitle={getParksIndustrialPageSubtitle(
        t`Vigencia docs, expansión, ROI canal, match, brokers y renovación anticipada`,
      )}
      icon={<IconSparkles size={theme.icon.size.md} />}
    >
      <ParksValorAgregadoContent />
    </ParksPageShell>
  );
};
