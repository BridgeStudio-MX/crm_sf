import { t } from '@lingui/core/macro';
import { IconTargetArrow } from 'twenty-ui/icon';
import { useContext } from 'react';
import { ThemeContext } from 'twenty-ui/theme-constants';

import { ParksAsignacionContent } from '@/parks-industrial/components/asignacion/ParksAsignacionContent';
import { ParksPageShell } from '@/parks-industrial/components/layout/ParksPageShell';
import { getParksIndustrialPageSubtitle } from '@/parks-industrial/constants/parks-tenant.constants';

export const ParksAsignacionPage = () => {
  const { theme } = useContext(ThemeContext);

  return (
    <ParksPageShell
      title={t`Asignación inteligente`}
      subtitle={getParksIndustrialPageSubtitle(
        t`Rank de cuenta · nivel LO · sugerencias IA`,
      )}
      icon={<IconTargetArrow size={theme.icon.size.md} />}
    >
      <ParksAsignacionContent />
    </ParksPageShell>
  );
};
