import { styled } from '@linaria/react';
import { themeCssVariables } from 'twenty-ui/theme-constants';

type ParksDashboardColumnChartItem = {
  id: string;
  label: string;
  value: number;
  color: string;
  meta?: string;
};

type ParksDashboardColumnChartProps = {
  items: ParksDashboardColumnChartItem[];
};

const StyledChart = styled.div`
  align-items: flex-end;
  display: flex;
  gap: ${themeCssVariables.spacing[2]};
  height: 240px;
  overflow-x: auto;
  padding: ${themeCssVariables.spacing[2]} 0;
`;

const StyledColumn = styled.div`
  align-items: center;
  display: flex;
  flex: 1;
  flex-direction: column;
  gap: 6px;
  min-width: 52px;
`;

const StyledColumnTrack = styled.div`
  align-items: flex-end;
  display: flex;
  height: 180px;
  justify-content: center;
  width: 100%;
`;

const StyledColumnFill = styled.div<{ height: number; color: string }>`
  background: linear-gradient(
    180deg,
    ${({ color }) => color} 0%,
    ${themeCssVariables.background.tertiary} 100%
  );
  border-radius: 6px 6px 2px 2px;
  height: ${({ height }) => height}px;
  min-height: 6px;
  transition: height 0.35s ease;
  width: 36px;
`;

const StyledColumnLabel = styled.span`
  color: ${themeCssVariables.font.color.secondary};
  font-size: ${themeCssVariables.font.size.xs};
  text-align: center;
`;

const StyledColumnValue = styled.span`
  font-size: ${themeCssVariables.font.size.sm};
  font-weight: ${themeCssVariables.font.weight.semiBold};
`;

const StyledColumnMeta = styled.span`
  color: ${themeCssVariables.font.color.tertiary};
  font-size: 10px;
  text-align: center;
`;

export const ParksDashboardColumnChart = ({
  items,
}: ParksDashboardColumnChartProps) => {
  const maxValue = Math.max(...items.map((item) => item.value), 1);

  return (
    <StyledChart>
      {items.map((item) => (
        <StyledColumn key={item.id}>
          <StyledColumnValue>{item.value}</StyledColumnValue>
          <StyledColumnTrack>
            <StyledColumnFill
              color={item.color}
              height={Math.max(10, (item.value / maxValue) * 170)}
            />
          </StyledColumnTrack>
          <StyledColumnLabel>{item.label}</StyledColumnLabel>
          {item.meta ? <StyledColumnMeta>{item.meta}</StyledColumnMeta> : null}
        </StyledColumn>
      ))}
    </StyledChart>
  );
};
