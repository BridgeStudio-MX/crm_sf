import { styled } from '@linaria/react';
import { type IconComponent } from 'twenty-ui/icon';
import { themeCssVariables } from 'twenty-ui/theme-constants';

export type ParksMetricCardAccent =
  | 'blue'
  | 'green'
  | 'yellow'
  | 'red'
  | 'gray';

type ParksMetricCardProps = {
  label: string;
  value: string | number;
  icon?: IconComponent;
  accent?: ParksMetricCardAccent;
  trend?: string;
};

const accentBackground: Record<ParksMetricCardAccent, string> = {
  blue: themeCssVariables.color.blue1,
  green: themeCssVariables.color.green1,
  yellow: themeCssVariables.color.yellow1,
  red: themeCssVariables.color.red1,
  gray: themeCssVariables.background.primary,
};

const accentBorder: Record<ParksMetricCardAccent, string> = {
  blue: themeCssVariables.color.blue3,
  green: themeCssVariables.color.green3,
  yellow: themeCssVariables.color.yellow3,
  red: themeCssVariables.color.red3,
  gray: themeCssVariables.border.color.medium,
};

const StyledCard = styled.div<{ accent: ParksMetricCardAccent }>`
  background: ${({ accent }) => accentBackground[accent]};
  border: 1px solid ${({ accent }) => accentBorder[accent]};
  border-radius: ${themeCssVariables.border.radius.md};
  padding: ${themeCssVariables.spacing[3]};
`;

const StyledHeader = styled.div`
  align-items: flex-start;
  display: flex;
  justify-content: space-between;
`;

const StyledLabel = styled.div`
  color: ${themeCssVariables.font.color.secondary};
  font-size: ${themeCssVariables.font.size.sm};
  font-weight: ${themeCssVariables.font.weight.medium};
`;

const StyledValue = styled.div`
  font-size: ${themeCssVariables.font.size.xl};
  font-weight: ${themeCssVariables.font.weight.semiBold};
  margin-top: ${themeCssVariables.spacing[2]};
`;

const StyledTrend = styled.div`
  color: ${themeCssVariables.font.color.tertiary};
  font-size: ${themeCssVariables.font.size.xs};
  margin-top: ${themeCssVariables.spacing[1]};
`;

export const ParksMetricCard = ({
  label,
  value,
  icon: Icon,
  accent = 'gray',
  trend,
}: ParksMetricCardProps) => (
  <StyledCard accent={accent}>
    <StyledHeader>
      <div>
        <StyledLabel>{label}</StyledLabel>
        <StyledValue>{value}</StyledValue>
        {trend ? <StyledTrend>{trend}</StyledTrend> : null}
      </div>
      {Icon ? <Icon size={22} stroke={1.5} /> : null}
    </StyledHeader>
  </StyledCard>
);
