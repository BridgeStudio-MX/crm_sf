import { styled } from '@linaria/react';
import { themeCssVariables } from 'twenty-ui/theme-constants';

import { type ParksDashboardChartSlice } from '@/parks-industrial/utils/parks-dashboard-charts.util';
import { formatParksNumber } from '@/parks-industrial/utils/parks-format.util';

type ParksDashboardDonutChartProps = {
  slices: ParksDashboardChartSlice[];
  centerLabel: string;
  centerValue: string;
};

const StyledChartLayout = styled.div`
  align-items: center;
  display: flex;
  gap: ${themeCssVariables.spacing[4]};
  justify-content: center;
  min-height: 220px;
`;

const StyledDonut = styled.div<{ gradient: string }>`
  background: ${({ gradient }) => gradient};
  border-radius: 50%;
  flex-shrink: 0;
  height: 168px;
  position: relative;
  width: 168px;

  &::after {
    background: ${themeCssVariables.background.primary};
    border-radius: 50%;
    content: '';
    inset: 28%;
    position: absolute;
  }
`;

const StyledDonutCenter = styled.div`
  align-items: center;
  display: flex;
  flex-direction: column;
  inset: 0;
  justify-content: center;
  position: absolute;
  text-align: center;
  z-index: 1;
`;

const StyledCenterValue = styled.div`
  font-size: ${themeCssVariables.font.size.lg};
  font-weight: ${themeCssVariables.font.weight.semiBold};
`;

const StyledCenterLabel = styled.div`
  color: ${themeCssVariables.font.color.tertiary};
  font-size: ${themeCssVariables.font.size.xs};
  margin-top: 2px;
  max-width: 88px;
`;

const StyledLegend = styled.div`
  display: flex;
  flex-direction: column;
  gap: ${themeCssVariables.spacing[2]};
  min-width: 0;
`;

const StyledLegendItem = styled.div`
  align-items: center;
  display: flex;
  gap: ${themeCssVariables.spacing[2]};
`;

const StyledLegendSwatch = styled.span<{ color: string }>`
  background: ${({ color }) => color};
  border-radius: 50%;
  flex-shrink: 0;
  height: 10px;
  width: 10px;
`;

const StyledLegendText = styled.div`
  min-width: 0;
`;

const StyledLegendLabel = styled.div`
  color: ${themeCssVariables.font.color.secondary};
  font-size: ${themeCssVariables.font.size.xs};
`;

const StyledLegendValue = styled.div`
  font-size: ${themeCssVariables.font.size.sm};
  font-weight: ${themeCssVariables.font.weight.medium};
`;

const buildConicGradient = (slices: ParksDashboardChartSlice[]): string => {
  const total = slices.reduce((sum, slice) => sum + slice.value, 0);

  if (total <= 0) {
    return themeCssVariables.background.tertiary;
  }

  let currentPercentage = 0;
  const stops = slices.map((slice) => {
    const slicePercentage = (slice.value / total) * 100;
    const start = currentPercentage;
    const end = currentPercentage + slicePercentage;
    currentPercentage = end;

    return `${slice.color} ${start}% ${end}%`;
  });

  return `conic-gradient(${stops.join(', ')})`;
};

export const ParksDashboardDonutChart = ({
  slices,
  centerLabel,
  centerValue,
}: ParksDashboardDonutChartProps) => {
  const visibleSlices = slices.filter((slice) => slice.value > 0);
  const total = visibleSlices.reduce((sum, slice) => sum + slice.value, 0);

  return (
    <StyledChartLayout>
      <StyledDonut gradient={buildConicGradient(visibleSlices)}>
        <StyledDonutCenter>
          <StyledCenterValue>{centerValue}</StyledCenterValue>
          <StyledCenterLabel>{centerLabel}</StyledCenterLabel>
        </StyledDonutCenter>
      </StyledDonut>
      <StyledLegend>
        {visibleSlices.map((slice) => (
          <StyledLegendItem key={slice.id}>
            <StyledLegendSwatch color={slice.color} />
            <StyledLegendText>
              <StyledLegendLabel>{slice.label}</StyledLegendLabel>
              <StyledLegendValue>
                {formatParksNumber(slice.value)}
                {total > 0
                  ? ` · ${Math.round((slice.value / total) * 100)}%`
                  : ''}
              </StyledLegendValue>
            </StyledLegendText>
          </StyledLegendItem>
        ))}
      </StyledLegend>
    </StyledChartLayout>
  );
};
