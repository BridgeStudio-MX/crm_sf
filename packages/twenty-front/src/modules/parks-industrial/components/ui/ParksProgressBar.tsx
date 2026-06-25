import { styled } from '@linaria/react';
import { themeCssVariables } from 'twenty-ui/theme-constants';

type ParksProgressBarProps = {
  label: string;
  valueLabel: string;
  percentage: number;
  accentColor?: string;
};

const StyledRow = styled.div`
  display: flex;
  flex-direction: column;
  gap: ${themeCssVariables.spacing[1]};
`;

const StyledHeader = styled.div`
  align-items: center;
  display: flex;
  font-size: ${themeCssVariables.font.size.sm};
  justify-content: space-between;
`;

const StyledTrack = styled.div`
  background: ${themeCssVariables.background.tertiary};
  border-radius: 999px;
  height: 8px;
  overflow: hidden;
  width: 100%;
`;

const StyledFill = styled.div<{ percentage: number; accentColor: string }>`
  background: ${({ accentColor }) => accentColor};
  border-radius: 999px;
  height: 100%;
  transition: width 0.3s ease;
  width: ${({ percentage }) => `${Math.min(Math.max(percentage, 0), 100)}%`};
`;

export const ParksProgressBar = ({
  label,
  valueLabel,
  percentage,
  accentColor = themeCssVariables.color.blue,
}: ParksProgressBarProps) => (
  <StyledRow>
    <StyledHeader>
      <span>{label}</span>
      <span>{valueLabel}</span>
    </StyledHeader>
    <StyledTrack>
      <StyledFill percentage={percentage} accentColor={accentColor} />
    </StyledTrack>
  </StyledRow>
);
