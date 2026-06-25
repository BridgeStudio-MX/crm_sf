import { styled } from '@linaria/react';
import { themeCssVariables } from 'twenty-ui/theme-constants';

import { type ParksDashboardPipelineStageMetric } from '@/parks-industrial/utils/parks-dashboard-charts.util';
import { formatParksUsd } from '@/parks-industrial/utils/parks-format.util';

type ParksDashboardPipelineFunnelProps = {
  stages: ParksDashboardPipelineStageMetric[];
};

const StyledFunnel = styled.div`
  display: flex;
  flex-direction: column;
  gap: ${themeCssVariables.spacing[2]};
`;

const StyledStageRow = styled.div`
  align-items: center;
  display: grid;
  gap: ${themeCssVariables.spacing[2]};
  grid-template-columns: minmax(0, 1.4fr) minmax(0, 1fr) auto;
`;

const StyledStageLabel = styled.div`
  color: ${themeCssVariables.font.color.secondary};
  font-size: ${themeCssVariables.font.size.xs};
`;

const StyledStageTrack = styled.div`
  background: ${themeCssVariables.background.tertiary};
  border-radius: 999px;
  height: 12px;
  overflow: hidden;
`;

const StyledStageFill = styled.div<{ width: number; color: string }>`
  background: ${({ color }) => color};
  border-radius: 999px;
  height: 100%;
  transition: width 0.35s ease;
  width: ${({ width }) => width}%;
`;

const StyledStageMeta = styled.div`
  color: ${themeCssVariables.font.color.primary};
  font-size: ${themeCssVariables.font.size.xs};
  font-weight: ${themeCssVariables.font.weight.medium};
  text-align: right;
  white-space: nowrap;
`;

export const ParksDashboardPipelineFunnel = ({
  stages,
}: ParksDashboardPipelineFunnelProps) => {
  const maxCount = Math.max(...stages.map((stage) => stage.count), 1);
  const visibleStages = stages.filter((stage) => stage.count > 0);

  if (visibleStages.length === 0) {
    return null;
  }

  return (
    <StyledFunnel>
      {visibleStages.map((stage) => (
        <StyledStageRow key={stage.stageId}>
          <StyledStageLabel>{stage.label}</StyledStageLabel>
          <StyledStageTrack>
            <StyledStageFill
              color={stage.color}
              width={Math.max(6, (stage.count / maxCount) * 100)}
            />
          </StyledStageTrack>
          <StyledStageMeta>
            {stage.count} · {formatParksUsd(stage.valueUsd)}
          </StyledStageMeta>
        </StyledStageRow>
      ))}
    </StyledFunnel>
  );
};
