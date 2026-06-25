import { styled } from '@linaria/react';
import { t } from '@lingui/core/macro';
import { IconCurrencyDollar, IconLayoutKanban, IconUser } from 'twenty-ui/icon';
import { MOBILE_VIEWPORT, themeCssVariables } from 'twenty-ui/theme-constants';

import { ParksMetricCard } from '@/parks-industrial/components/ui/ParksMetricCard';
import {
  StyledParksInput,
  StyledParksSelect,
} from '@/parks-industrial/components/ui/parks-form-control.styles';
import { PARKS_VISIBLE_PIPELINE_STAGES } from '@/parks-industrial/constants/parks-industrial.constants';
import { type ParksOpportunityRecord } from '@/parks-industrial/hooks/useParksRecords';
import {
  formatParksUsd,
  getParksAmountFromMicros,
  getParksOwnerName,
  getParksPipelineStageTheme,
} from '@/parks-industrial/utils/parks-format.util';

const StyledToolbar = styled.div`
  display: flex;
  flex-direction: column;
  gap: ${themeCssVariables.spacing[3]};
`;

const StyledFilters = styled.div`
  display: flex;
  flex-wrap: wrap;
  gap: ${themeCssVariables.spacing[2]};
`;

const StyledSearchInput = styled(StyledParksInput)`
  min-width: 200px;
  padding: ${themeCssVariables.spacing[2]};
`;

const StyledOwnerSelect = styled(StyledParksSelect)`
  min-width: 220px;
`;

const StyledMetrics = styled.div`
  display: grid;
  gap: ${themeCssVariables.spacing[3]};
  grid-template-columns: repeat(auto-fit, minmax(180px, 1fr));

  @media (min-width: ${MOBILE_VIEWPORT}px) {
    grid-template-columns: repeat(3, 1fr);
  }
`;

const StyledLegend = styled.div`
  display: flex;
  flex-wrap: wrap;
  gap: ${themeCssVariables.spacing[2]};
`;

const StyledLegendItem = styled.div`
  align-items: center;
  display: flex;
  gap: 6px;
`;

const StyledLegendDot = styled.span<{ dotColor: string }>`
  background: ${({ dotColor }) => dotColor};
  border-radius: 50%;
  display: inline-block;
  height: 8px;
  width: 8px;
`;

const StyledLegendLabel = styled.span`
  color: ${themeCssVariables.font.color.secondary};
  font-size: ${themeCssVariables.font.size.xs};
`;

export type ParksPipelineFilters = {
  searchQuery: string;
  ownerFilter: string;
};

type ParksPipelineToolbarProps = {
  opportunities: ParksOpportunityRecord[];
  filters: ParksPipelineFilters;
  onFiltersChange: (filters: ParksPipelineFilters) => void;
  filteredCount: number;
};

export const ParksPipelineToolbar = ({
  opportunities,
  filters,
  onFiltersChange,
  filteredCount,
}: ParksPipelineToolbarProps) => {
  const ownerOptions = Array.from(
    new Set(opportunities.map((opportunity) => getParksOwnerName(opportunity))),
  ).sort();

  const pipelineValue = opportunities.reduce(
    (sum, opportunity) =>
      sum + getParksAmountFromMicros(opportunity.amount?.amountMicros),
    0,
  );

  const activeDeals = opportunities.filter(
    (opportunity) => opportunity.stage !== 'PERDIDO',
  ).length;

  return (
    <StyledToolbar>
      <StyledMetrics>
        <ParksMetricCard
          label={t`Deals activos`}
          value={activeDeals}
          icon={IconLayoutKanban}
          accent="blue"
        />
        <ParksMetricCard
          label={t`Valor del pipeline`}
          value={formatParksUsd(pipelineValue)}
          icon={IconCurrencyDollar}
          accent="green"
        />
        <ParksMetricCard
          label={t`Mostrando`}
          value={`${filteredCount} / ${opportunities.length}`}
          icon={IconUser}
          accent="gray"
        />
      </StyledMetrics>

      <StyledFilters>
        <StyledSearchInput
          type="search"
          placeholder={t`Buscar deal o prospecto...`}
          value={filters.searchQuery}
          onChange={(event) =>
            onFiltersChange({
              ...filters,
              searchQuery: event.target.value,
            })
          }
        />
        <StyledOwnerSelect
          value={filters.ownerFilter}
          onChange={(event) =>
            onFiltersChange({
              ...filters,
              ownerFilter: event.target.value,
            })
          }
        >
          <option value="">{t`Todos los responsables`}</option>
          {ownerOptions.map((ownerName) => (
            <option key={ownerName} value={ownerName}>
              {ownerName}
            </option>
          ))}
        </StyledOwnerSelect>
      </StyledFilters>

      <StyledLegend>
        {PARKS_VISIBLE_PIPELINE_STAGES.map((stage) => {
          const stageTheme = getParksPipelineStageTheme(stage.color);

          return (
            <StyledLegendItem key={stage.id}>
              <StyledLegendDot dotColor={stageTheme.accent} />
              <StyledLegendLabel>{stage.label}</StyledLegendLabel>
            </StyledLegendItem>
          );
        })}
      </StyledLegend>
    </StyledToolbar>
  );
};
