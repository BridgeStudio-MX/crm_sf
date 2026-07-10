import { styled } from '@linaria/react';
import { type ReactNode } from 'react';
import { type IconComponent } from 'twenty-ui/icon';
import { themeCssVariables } from 'twenty-ui/theme-constants';

import {
  type ParksVisualAccent,
  PARKS_VISUAL_THEME,
} from '@/parks-industrial/constants/parks-theme.constants';

export type ParksDetailFieldAccent =
  | 'default'
  | 'blue'
  | 'green'
  | 'yellow'
  | 'purple';

type ParksDetailFieldProps = {
  label: string;
  value: ReactNode;
  icon?: IconComponent;
  accent?: ParksDetailFieldAccent;
};

type ParksKpiTileProps = {
  label: string;
  value: ReactNode;
  accent?: ParksDetailFieldAccent;
};

const detailAccentMap: Record<ParksDetailFieldAccent, ParksVisualAccent> = {
  default: 'gray',
  blue: 'blue',
  green: 'green',
  yellow: 'yellow',
  purple: 'purple',
};

const StyledDetailField = styled.div<{ accent: ParksDetailFieldAccent }>`
  background: ${({ accent }) =>
    PARKS_VISUAL_THEME.accents[detailAccentMap[accent]].backgroundGradient};
  border: 1px solid
    ${({ accent }) => PARKS_VISUAL_THEME.accents[detailAccentMap[accent]].border};
  border-radius: ${themeCssVariables.border.radius.md};
  box-shadow: ${themeCssVariables.boxShadow.light};
  display: flex;
  flex-direction: column;
  gap: ${themeCssVariables.spacing[2]};
  min-width: 0;
  padding: ${themeCssVariables.spacing[3]};
`;

const StyledFieldHeader = styled.div`
  align-items: center;
  display: flex;
  gap: ${themeCssVariables.spacing[2]};
`;

const StyledIconWrap = styled.span<{ accent: ParksDetailFieldAccent }>`
  align-items: center;
  background: ${({ accent }) =>
    PARKS_VISUAL_THEME.accents[detailAccentMap[accent]].iconBackground};
  border: 1px solid
    ${({ accent }) => PARKS_VISUAL_THEME.accents[detailAccentMap[accent]].border};
  border-radius: ${themeCssVariables.border.radius.sm};
  color: ${({ accent }) =>
    PARKS_VISUAL_THEME.accents[detailAccentMap[accent]].accent};
  display: flex;
  flex-shrink: 0;
  height: 28px;
  justify-content: center;
  width: 28px;
`;

const StyledLabel = styled.span`
  color: ${themeCssVariables.font.color.tertiary};
  font-size: ${themeCssVariables.font.size.xs};
  font-weight: ${themeCssVariables.font.weight.medium};
  letter-spacing: 0.03em;
  text-transform: uppercase;
`;

const StyledValue = styled.div`
  color: ${themeCssVariables.font.color.primary};
  font-size: ${themeCssVariables.font.size.sm};
  font-weight: ${themeCssVariables.font.weight.medium};
  line-height: 1.35;
  word-break: break-word;
`;

const StyledKpiTile = styled.div<{ accent: ParksDetailFieldAccent }>`
  background: ${({ accent }) =>
    PARKS_VISUAL_THEME.accents[detailAccentMap[accent]].backgroundGradient};
  border: 1px solid
    ${({ accent }) => PARKS_VISUAL_THEME.accents[detailAccentMap[accent]].border};
  border-radius: ${themeCssVariables.border.radius.md};
  box-shadow: ${themeCssVariables.boxShadow.light};
  display: flex;
  flex-direction: column;
  gap: 4px;
  min-width: 0;
  padding: ${themeCssVariables.spacing[3]};
`;

const StyledKpiLabel = styled.span`
  color: ${themeCssVariables.font.color.tertiary};
  font-size: ${themeCssVariables.font.size.xs};
  font-weight: ${themeCssVariables.font.weight.medium};
  letter-spacing: 0.04em;
  text-transform: uppercase;
`;

const StyledKpiValue = styled.span<{ accent: ParksDetailFieldAccent }>`
  color: ${({ accent }) =>
    accent === 'default'
      ? themeCssVariables.font.color.primary
      : PARKS_VISUAL_THEME.accents[detailAccentMap[accent]].accent};
  font-size: ${themeCssVariables.font.size.lg};
  font-weight: ${themeCssVariables.font.weight.semiBold};
  line-height: 1.2;
`;

export const ParksDetailField = ({
  label,
  value,
  icon: Icon,
  accent = 'default',
}: ParksDetailFieldProps) => (
  <StyledDetailField accent={accent}>
    <StyledFieldHeader>
      {Icon ? (
        <StyledIconWrap accent={accent}>
          <Icon size={14} />
        </StyledIconWrap>
      ) : null}
      <StyledLabel>{label}</StyledLabel>
    </StyledFieldHeader>
    <StyledValue>{value}</StyledValue>
  </StyledDetailField>
);

export const ParksKpiTile = ({
  label,
  value,
  accent = 'default',
}: ParksKpiTileProps) => (
  <StyledKpiTile accent={accent}>
    <StyledKpiLabel>{label}</StyledKpiLabel>
    <StyledKpiValue accent={accent}>{value}</StyledKpiValue>
  </StyledKpiTile>
);
