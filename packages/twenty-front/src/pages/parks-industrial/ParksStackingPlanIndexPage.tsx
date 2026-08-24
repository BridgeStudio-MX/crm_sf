import { t } from '@lingui/core/macro';
import { useContext } from 'react';
import { AppPath } from 'twenty-shared/types';
import { IconBuildingSkyscraper, IconLayoutKanban } from 'twenty-ui/icon';
import { ThemeContext } from 'twenty-ui/theme-constants';

import { ParksMetadataGate } from '@/parks-industrial/components/layout/ParksMetadataGate';
import { ParksPageShell } from '@/parks-industrial/components/layout/ParksPageShell';
import { ParksCeoParkCards } from '@/parks-industrial/components/portfolio/ParksCeoParkCards';
import { ParksPageHero } from '@/parks-industrial/components/ui/ParksPageHero';
import { StyledParksPageStack } from '@/parks-industrial/components/ui/ParksSectionCard';
import { ParksRoleLabel } from '@/parks-industrial/constants/parks-role-access.constants';
import { getParksIndustrialPageSubtitle } from '@/parks-industrial/constants/parks-tenant.constants';
import { useParksAccess } from '@/parks-industrial/hooks/useParksAccess';
import { hasAnyParksRoleLabel } from '@/parks-industrial/utils/parks-role-access.util';

const ParksStackingPlanIndexContent = () => {
  const { canAccessRoute, parksRoleLabels } = useParksAccess();
  const isCeoView = hasAnyParksRoleLabel(parksRoleLabels, [ParksRoleLabel.CEO]);
  const canOpenPipeline = canAccessRoute('pipeline');

  return (
    <StyledParksPageStack>
      <ParksPageHero
        eyebrow={
          isCeoView ? t`Inventario · Demanda` : t`Inventario · Pipeline`
        }
        title={
          isCeoView ? t`Parques y ocupación` : t`Parques, naves y pipeline`
        }
        subtitle={
          isCeoView
            ? t`Del parque al pipeline, o a las naves — incluyendo las que aún están en construcción y se pueden pre-rentar.`
            : t`Entra a un parque, ve su pipeline o cambia a tarjetas de naves. Las naves en obra también tienen pipeline de pre-renta.`
        }
        actions={
          canOpenPipeline
            ? [
                {
                  to: AppPath.ParksPipeline,
                  label: t`Pipeline`,
                  icon: IconLayoutKanban,
                },
              ]
            : []
        }
      />
      <ParksCeoParkCards />
    </StyledParksPageStack>
  );
};

export const ParksStackingPlanIndexPage = () => {
  const { theme } = useContext(ThemeContext);

  return (
    <ParksPageShell
      title={t`Parques`}
      subtitle={getParksIndustrialPageSubtitle(
        t`Ocupación, vacancia e interés comercial por parque`,
      )}
      icon={<IconBuildingSkyscraper size={theme.icon.size.md} />}
    >
      <ParksMetadataGate loadingVariant="list">
        <ParksStackingPlanIndexContent />
      </ParksMetadataGate>
    </ParksPageShell>
  );
};
