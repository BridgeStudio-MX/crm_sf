import { t } from '@lingui/core/macro';
import { useContext } from 'react';
import { AppPath } from 'twenty-shared/types';
import { IconBuildingSkyscraper, IconLayoutKanban } from 'twenty-ui/icon';
import { ThemeContext } from 'twenty-ui/theme-constants';

import { ParksMetadataGate } from '@/parks-industrial/components/layout/ParksMetadataGate';
import { ParksPageShell } from '@/parks-industrial/components/layout/ParksPageShell';
import { ParksPortfolioByParkSection } from '@/parks-industrial/components/portfolio/ParksPortfolioByParkSection';
import { ParksPageHero } from '@/parks-industrial/components/ui/ParksPageHero';
import { StyledParksPageStack } from '@/parks-industrial/components/ui/ParksSectionCard';
import { getParksIndustrialPageSubtitle } from '@/parks-industrial/constants/parks-tenant.constants';

const ParksStackingPlanIndexContent = () => (
  <StyledParksPageStack>
    <ParksPageHero
      eyebrow={t`Inventario · Pipeline`}
      title={t`Parques, naves y leads`}
      subtitle={t`Una vista de toda la cartera: cada parque, sus naves disponibles y los leads que viven en ese parque. Entra al plano cuando quieras el detalle de ocupación.`}
      actions={[
        {
          to: AppPath.ParksPipeline,
          label: t`Pipeline`,
          icon: IconLayoutKanban,
        },
      ]}
    />
    <ParksPortfolioByParkSection showIntro={false} />
  </StyledParksPageStack>
);

export const ParksStackingPlanIndexPage = () => {
  const { theme } = useContext(ThemeContext);

  return (
    <ParksPageShell
      title={t`Parques`}
      subtitle={getParksIndustrialPageSubtitle(
        t`Todos los parques, naves disponibles y leads del pipeline`,
      )}
      icon={<IconBuildingSkyscraper size={theme.icon.size.md} />}
    >
      <ParksMetadataGate loadingVariant="list">
        <ParksStackingPlanIndexContent />
      </ParksMetadataGate>
    </ParksPageShell>
  );
};
