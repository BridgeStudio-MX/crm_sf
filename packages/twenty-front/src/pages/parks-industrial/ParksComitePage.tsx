import { t } from '@lingui/core/macro';
import { useContext } from 'react';
import { IconShield } from 'twenty-ui/icon';
import { ThemeContext } from 'twenty-ui/theme-constants';

import { ParksCeoComiteLiveSession } from '@/parks-industrial/components/comite/ParksCeoComiteLiveSession';
import { ParksComiteContent } from '@/parks-industrial/components/comite/ParksComiteContent';
import { ParksPageShell } from '@/parks-industrial/components/layout/ParksPageShell';
import { ParksRoleLabel } from '@/parks-industrial/constants/parks-role-access.constants';
import { getParksIndustrialPageSubtitle } from '@/parks-industrial/constants/parks-tenant.constants';
import { useParksAccess } from '@/parks-industrial/hooks/useParksAccess';
import { hasAnyParksRoleLabel } from '@/parks-industrial/utils/parks-role-access.util';

export const ParksComitePage = () => {
  const { theme } = useContext(ThemeContext);
  const { parksRoleLabels } = useParksAccess();
  const isCeoLiveSession = hasAnyParksRoleLabel(parksRoleLabels, [
    ParksRoleLabel.CEO,
  ]);

  return (
    <ParksPageShell
      title={
        isCeoLiveSession ? t`Sesión de comité` : t`Comité de Autorización`
      }
      subtitle={getParksIndustrialPageSubtitle(
        isCeoLiveSession
          ? t`Proyección en vivo · deals que requieren autorización`
          : t`Gobernanza comercial · mayoría simple`,
      )}
      icon={<IconShield size={theme.icon.size.md} />}
    >
      {isCeoLiveSession ? (
        <ParksCeoComiteLiveSession />
      ) : (
        <ParksComiteContent />
      )}
    </ParksPageShell>
  );
};
