import { styled } from '@linaria/react';
import { type ReactNode } from 'react';
import { type IconComponent } from 'twenty-ui/icon';
import { MOBILE_VIEWPORT, themeCssVariables } from 'twenty-ui/theme-constants';

import {
  type ParksVisualAccent,
  PARKS_VISUAL_THEME,
} from '@/parks-industrial/constants/parks-theme.constants';

type ParksDashboardFeaturedMetricProps = {
  label: string;
  value: string;
  hint?: string;
  icon: IconComponent;
  accent?: ParksVisualAccent;
};

const StyledGrid = styled.div`
  display: grid;
  gap: ${themeCssVariables.spacing[3]};
  grid-template-columns: 1fr;

  @media (min-width: ${MOBILE_VIEWPORT}px) {
    grid-template-columns: repeat(3, minmax(0, 1fr));
  }
`;

const StyledCard = styled.div<{ accent: ParksVisualAccent }>`
  background: ${({ accent }) => PARKS_VISUAL_THEME.accents[accent].backgroundGradient};
  border: 1px solid ${({ accent }) => PARKS_VISUAL_THEME.accents[accent].border};
  border-radius: ${themeCssVariables.border.radius.md};
  box-shadow: ${themeCssVariables.boxShadow.light};
  display: flex;
  flex-direction: column;
  gap: ${themeCssVariables.spacing[3]};
  min-height: 132px;
  padding: ${themeCssVariables.spacing[4]};
  position: relative;

  &::before {
    background: ${({ accent }) => PARKS_VISUAL_THEME.accents[accent].accent};
    border-radius: ${themeCssVariables.border.radius.pill};
    content: '';
    height: 4px;
    left: ${themeCssVariables.spacing[4]};
    position: absolute;
    top: 0;
    width: 48px;
  }
`;

const StyledHeader = styled.div`
  align-items: flex-start;
  display: flex;
  justify-content: space-between;
`;

const StyledIconWrap = styled.span<{ accent: ParksVisualAccent }>`
  align-items: center;
  background: ${({ accent }) => PARKS_VISUAL_THEME.accents[accent].iconBackground};
  border: 1px solid ${({ accent }) => PARKS_VISUAL_THEME.accents[accent].border};
  border-radius: ${themeCssVariables.border.radius.sm};
  color: ${({ accent }) => PARKS_VISUAL_THEME.accents[accent].accent};
  display: flex;
  height: 40px;
  justify-content: center;
  width: 40px;
`;

const StyledLabel = styled.div`
  color: ${themeCssVariables.font.color.secondary};
  font-size: ${themeCssVariables.font.size.sm};
  font-weight: ${themeCssVariables.font.weight.medium};
`;

const StyledValue = styled.div<{ accent: ParksVisualAccent }>`
  color: ${({ accent }) => PARKS_VISUAL_THEME.accents[accent].accent};
  font-size: clamp(1.35rem, 2.4vw, 1.75rem);
  font-weight: ${themeCssVariables.font.weight.semiBold};
  letter-spacing: -0.02em;
  line-height: 1.1;
`;

const StyledHint = styled.div`
  color: ${themeCssVariables.font.color.tertiary};
  font-size: ${themeCssVariables.font.size.xs};
`;

type ParksDashboardFeaturedMetricsProps = {
  children: ReactNode;
};

export const ParksDashboardFeaturedMetrics = ({
  children,
}: ParksDashboardFeaturedMetricsProps) => (
  <StyledGrid>{children}</StyledGrid>
);

export const ParksDashboardFeaturedMetric = ({
  label,
  value,
  hint,
  icon: Icon,
  accent = 'green',
}: ParksDashboardFeaturedMetricProps) => (
  <StyledCard accent={accent}>
    <StyledHeader>
      <StyledLabel>{label}</StyledLabel>
      <StyledIconWrap accent={accent}>
        <Icon size={22} stroke={1.75} />
      </StyledIconWrap>
    </StyledHeader>
    <StyledValue accent={accent}>{value}</StyledValue>
    {hint ? <StyledHint>{hint}</StyledHint> : null}
  </StyledCard>
);
