import { styled } from '@linaria/react';
import { type IconComponent } from 'twenty-ui/icon';
import { themeCssVariables } from 'twenty-ui/theme-constants';

import {
  type ParksVisualAccent,
  PARKS_VIBE,
  PARKS_VISUAL_THEME,
} from '@/parks-industrial/constants/parks-theme.constants';

export type ParksMetricCardAccent = ParksVisualAccent;

type ParksMetricCardProps = {
  label: string;
  value: string | number;
  icon?: IconComponent;
  accent?: ParksMetricCardAccent;
  trend?: string;
};

const StyledCard = styled.div<{ accent: ParksMetricCardAccent }>`
  background: ${({ accent }) =>
    PARKS_VISUAL_THEME.accents[accent].backgroundGradient};
  border: 1px solid ${({ accent }) => PARKS_VISUAL_THEME.accents[accent].border};
  border-radius: ${PARKS_VIBE.radiusMd};
  box-shadow: ${PARKS_VIBE.shadowSoft};
  height: 100%;
  padding: ${PARKS_VIBE.space.lg};
  transition: box-shadow 0.15s ease;

  &:hover {
    box-shadow: ${PARKS_VIBE.shadowCard};
  }
`;

const StyledHeader = styled.div`
  align-items: flex-start;
  display: flex;
  gap: ${PARKS_VIBE.space.sm};
  justify-content: space-between;
`;

const StyledCopy = styled.div`
  display: flex;
  flex: 1;
  flex-direction: column;
  gap: ${PARKS_VIBE.space.xs};
  min-width: 0;
`;

const StyledLabel = styled.div`
  color: ${PARKS_VIBE.textSecondary};
  font-size: ${themeCssVariables.font.size.sm};
  font-weight: ${themeCssVariables.font.weight.medium};
  line-height: 1.35;
`;

const StyledValue = styled.div<{ accent: ParksMetricCardAccent }>`
  color: ${({ accent }) => PARKS_VISUAL_THEME.accents[accent].accent};
  font-size: ${themeCssVariables.font.size.xl};
  font-weight: ${themeCssVariables.font.weight.semiBold};
  letter-spacing: -0.02em;
  line-height: 1.2;
  margin-top: ${PARKS_VIBE.space.xs};
  overflow-wrap: anywhere;
`;

const StyledTrend = styled.div`
  color: ${PARKS_VIBE.textMuted};
  font-size: ${themeCssVariables.font.size.xs};
  line-height: 1.35;
  margin-top: ${PARKS_VIBE.space.xs};
`;

const StyledIconWrap = styled.span<{ accent: ParksMetricCardAccent }>`
  align-items: center;
  background: ${({ accent }) =>
    PARKS_VISUAL_THEME.accents[accent].iconBackground};
  border: 1px solid ${({ accent }) => PARKS_VISUAL_THEME.accents[accent].border};
  border-radius: ${PARKS_VIBE.radiusSm};
  color: ${({ accent }) => PARKS_VISUAL_THEME.accents[accent].accent};
  display: flex;
  flex-shrink: 0;
  height: 36px;
  justify-content: center;
  width: 36px;
`;

export const ParksMetricCard = ({
  label,
  value,
  icon: Icon,
  accent = 'blue',
  trend,
}: ParksMetricCardProps) => (
  <StyledCard accent={accent}>
    <StyledHeader>
      <StyledCopy>
        <StyledLabel>{label}</StyledLabel>
        <StyledValue accent={accent}>{value}</StyledValue>
        {trend ? <StyledTrend>{trend}</StyledTrend> : null}
      </StyledCopy>
      {Icon ? (
        <StyledIconWrap accent={accent}>
          <Icon size={20} stroke={1.75} />
        </StyledIconWrap>
      ) : null}
    </StyledHeader>
  </StyledCard>
);
