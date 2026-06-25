import { styled } from '@linaria/react';
import { themeCssVariables } from 'twenty-ui/theme-constants';

import {
  getParksOcupacionMetricAccent,
  type ParksRegionalMetricSummary,
} from '@/parks-industrial/utils/parks-portfolio-metrics.util';
import { formatParksNumber } from '@/parks-industrial/utils/parks-format.util';
import { ParksMetricCard } from '@/parks-industrial/components/ui/ParksMetricCard';
import { IconMap } from 'twenty-ui/icon';

type ParksDashboardRegionalCardsProps = {
  regions: ParksRegionalMetricSummary[];
};

const StyledGrid = styled.div`
  display: grid;
  gap: ${themeCssVariables.spacing[3]};
  grid-template-columns: repeat(auto-fit, minmax(180px, 1fr));
`;

export const ParksDashboardRegionalCards = ({
  regions,
}: ParksDashboardRegionalCardsProps) => (
  <StyledGrid>
    {regions.map((region) => (
      <ParksMetricCard
        key={region.cityFilterId}
        label={region.label}
        value={`${region.ocupacion}%`}
        icon={IconMap}
        accent={getParksOcupacionMetricAccent(region.ocupacion)}
        trend={`${region.parqueCount} parques · ${formatParksNumber(region.m2Disponibles)} m² libres`}
      />
    ))}
  </StyledGrid>
);
