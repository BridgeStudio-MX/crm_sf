import { t } from '@lingui/core/macro';
import { useContext } from 'react';
import { IconListCheck } from 'twenty-ui/icon';
import { ThemeContext } from 'twenty-ui/theme-constants';

import { ParksPageShell } from '@/parks-industrial/components/layout/ParksPageShell';
import { ParksMisPendientesContent } from '@/parks-industrial/components/pendientes/ParksMisPendientesContent';
import {
  ParksRoleLabel,
} from '@/parks-industrial/constants/parks-role-access.constants';
import { getParksIndustrialPageSubtitle } from '@/parks-industrial/constants/parks-tenant.constants';
import { useParksAccess } from '@/parks-industrial/hooks/useParksAccess';

export const ParksMisPendientesPage = () => {
  const { theme } = useContext(ThemeContext);
  const { primaryParksRoleLabel } = useParksAccess();
  const isCem =
    primaryParksRoleLabel === ParksRoleLabel.DirectorComercial;

  return (
    <ParksPageShell
      title={t`Mis pendientes`}
      subtitle={getParksIndustrialPageSubtitle(
        isCem
          ? t`Cola CEM, aprobaciones y firmas de Hoja de Acuerdos`
          : t`Aprobaciones y firmas que requieren tu acción`,
      )}
      icon={<IconListCheck size={theme.icon.size.md} />}
    >
      <ParksMisPendientesContent />
    </ParksPageShell>
  );
};
