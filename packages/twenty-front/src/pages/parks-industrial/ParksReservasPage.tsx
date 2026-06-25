import { t } from '@lingui/core/macro';
import { IconBookmark } from 'twenty-ui/icon';
import { useContext } from 'react';
import { ThemeContext } from 'twenty-ui/theme-constants';

import { ParksReservasContent } from '@/parks-industrial/components/reservas/ParksReservasContent';
import { ParksMetadataGate } from '@/parks-industrial/components/layout/ParksMetadataGate';
import { ParksPageShell } from '@/parks-industrial/components/layout/ParksPageShell';

export const ParksReservasPage = () => {
  const { theme } = useContext(ThemeContext);

  return (
    <ParksPageShell
      title={t`Reservas`}
      subtitle={t`Naves en negociación y control de disponibilidad comercial`}
      icon={<IconBookmark size={theme.icon.size.md} />}
    >
      <ParksMetadataGate loadingVariant="dashboard">
        <ParksReservasContent />
      </ParksMetadataGate>
    </ParksPageShell>
  );
};
