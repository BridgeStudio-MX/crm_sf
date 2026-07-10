import { t } from '@lingui/core/macro';
import { IconBell } from 'twenty-ui/icon';
import { useContext } from 'react';
import { ThemeContext } from 'twenty-ui/theme-constants';

import { ParksNotificacionesContent } from '@/parks-industrial/components/notificaciones/ParksNotificacionesContent';
import { getParksIndustrialPageSubtitle } from '@/parks-industrial/constants/parks-tenant.constants';
import { ParksPageShell } from '@/parks-industrial/components/layout/ParksPageShell';

export const ParksNotificacionesPage = () => {
  const { theme } = useContext(ThemeContext);

  return (
    <ParksPageShell
      title={t`Notificaciones`}
      subtitle={getParksIndustrialPageSubtitle(
        t`Tareas automáticas, enriquecimiento IA y alertas comerciales`,
      )}
      icon={<IconBell size={theme.icon.size.md} />}
    >
      <ParksNotificacionesContent />
    </ParksPageShell>
  );
};
