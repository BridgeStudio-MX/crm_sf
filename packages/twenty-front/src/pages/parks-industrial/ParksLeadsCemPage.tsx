import { t } from '@lingui/core/macro';
import { useContext } from 'react';
import { IconUserPlus } from 'twenty-ui/icon';
import { ThemeContext } from 'twenty-ui/theme-constants';

import { ParksPageShell } from '@/parks-industrial/components/layout/ParksPageShell';
import { ParksLeadsCemContent } from '@/parks-industrial/components/pipeline/ParksLeadsCemContent';
import { getParksIndustrialPageSubtitle } from '@/parks-industrial/constants/parks-tenant.constants';

export const ParksLeadsCemPage = () => {
  const { theme } = useContext(ThemeContext);

  return (
    <ParksPageShell
      title={t`Leads CEM`}
      subtitle={getParksIndustrialPageSubtitle(
        t`Cola de leads sin asignar — asigna cada uno a un Leasing Officer`,
      )}
      icon={<IconUserPlus size={theme.icon.size.md} />}
    >
      <ParksLeadsCemContent />
    </ParksPageShell>
  );
};
