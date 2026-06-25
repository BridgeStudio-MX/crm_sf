import { styled } from '@linaria/react';
import { themeCssVariables } from 'twenty-ui/theme-constants';

type ParksDashboardHorizontalBarItem = {
  id: string;
  label: string;
  value: number;
  displayValue: string;
  color: string;
  meta?: string;
};

type ParksDashboardHorizontalBarsProps = {
  items: ParksDashboardHorizontalBarItem[];
};

const StyledList = styled.div`
  display: flex;
  flex-direction: column;
  gap: ${themeCssVariables.spacing[3]};
`;

const StyledRow = styled.div`
  display: flex;
  flex-direction: column;
  gap: ${themeCssVariables.spacing[1]};
`;

const StyledHeader = styled.div`
  align-items: baseline;
  display: flex;
  gap: ${themeCssVariables.spacing[2]};
  justify-content: space-between;
`;

const StyledLabel = styled.span`
  font-size: ${themeCssVariables.font.size.sm};
  font-weight: ${themeCssVariables.font.weight.medium};
`;

const StyledValue = styled.span`
  color: ${themeCssVariables.font.color.secondary};
  font-size: ${themeCssVariables.font.size.xs};
`;

const StyledTrack = styled.div`
  background: ${themeCssVariables.background.tertiary};
  border-radius: 999px;
  height: 10px;
  overflow: hidden;
`;

const StyledFill = styled.div<{ width: number; color: string }>`
  background: linear-gradient(
    90deg,
    ${({ color }) => color},
    ${themeCssVariables.background.transparent.light}
  );
  border-radius: 999px;
  height: 100%;
  transition: width 0.35s ease;
  width: ${({ width }) => width}%;
`;

const StyledMeta = styled.div`
  color: ${themeCssVariables.font.color.tertiary};
  font-size: ${themeCssVariables.font.size.xs};
`;

export const ParksDashboardHorizontalBars = ({
  items,
}: ParksDashboardHorizontalBarsProps) => {
  const maxValue = Math.max(...items.map((item) => item.value), 1);

  return (
    <StyledList>
      {items.map((item) => (
        <StyledRow key={item.id}>
          <StyledHeader>
            <StyledLabel>{item.label}</StyledLabel>
            <StyledValue>{item.displayValue}</StyledValue>
          </StyledHeader>
          <StyledTrack>
            <StyledFill
              color={item.color}
              width={Math.max(4, (item.value / maxValue) * 100)}
            />
          </StyledTrack>
          {item.meta ? <StyledMeta>{item.meta}</StyledMeta> : null}
        </StyledRow>
      ))}
    </StyledList>
  );
};
