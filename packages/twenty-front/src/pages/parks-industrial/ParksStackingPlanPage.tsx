import { t } from '@lingui/core/macro';
import { useParams } from 'react-router-dom';
import { IconLayoutGrid } from 'twenty-ui/icon';
import { useContext } from 'react';
import { ThemeContext } from 'twenty-ui/theme-constants';

import { ParksMetadataGate } from '@/parks-industrial/components/layout/ParksMetadataGate';
import { ParksPageShell } from '@/parks-industrial/components/layout/ParksPageShell';
import { ParksStackingPlanContent } from '@/parks-industrial/components/stacking-plan/ParksStackingPlanContent';

export const ParksStackingPlanPage = () => {
  const { parqueId } = useParams<{ parqueId: string }>();
  const { theme } = useContext(ThemeContext);

  return (
    <ParksPageShell
      title={t`Stacking Plan`}
      subtitle={t`Ocupación y vencimientos por nave industrial`}
      icon={<IconLayoutGrid size={theme.icon.size.md} />}
    >
      <ParksMetadataGate loadingVariant="list">
        <ParksStackingPlanContent key={parqueId} />
      </ParksMetadataGate>
    </ParksPageShell>
  );
};
