import { t } from '@lingui/core/macro';
import { useContext } from 'react';
import { IconShield } from 'twenty-ui/icon';
import { ThemeContext } from 'twenty-ui/theme-constants';

import { ParksComiteContent } from '@/parks-industrial/components/comite/ParksComiteContent';
import { ParksPageShell } from '@/parks-industrial/components/layout/ParksPageShell';
import { getParksIndustrialPageSubtitle } from '@/parks-industrial/constants/parks-tenant.constants';

export const ParksComitePage = () => {
  const { theme } = useContext(ThemeContext);

  return (
    <ParksPageShell
      title={t`Comité de Autorización`}
      subtitle={getParksIndustrialPageSubtitle(
        t`3 miembros · mayoría simple · gate entre Hoja firmada y Legal`,
      )}
      icon={<IconShield size={theme.icon.size.md} />}
    >
      <ParksComiteContent />
    </ParksPageShell>
  );
};
