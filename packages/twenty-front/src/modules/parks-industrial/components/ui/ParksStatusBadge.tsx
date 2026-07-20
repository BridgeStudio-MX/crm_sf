import { styled } from '@linaria/react';
import { themeCssVariables } from 'twenty-ui/theme-constants';

import {
  type ParksVisualAccent,
  PARKS_VIBE,
  PARKS_VISUAL_THEME,
} from '@/parks-industrial/constants/parks-theme.constants';
import {
  type ParksStackingStatusColor,
  getParksStackingStatusColor,
} from '@/parks-industrial/utils/parks-format.util';

type ParksStatusBadgeColor =
  | ParksStackingStatusColor
  | 'blue'
  | 'red'
  | 'green'
  | 'yellow'
  | 'gray'
  | 'orange'
  | 'sky'
  | 'turquoise'
  | 'purple';

type ParksStatusBadgeProps = {
  label: string;
  color?: ParksStatusBadgeColor;
};

const accentKeyMap: Record<ParksStatusBadgeColor, ParksVisualAccent> = {
  green: 'green',
  yellow: 'yellow',
  red: 'red',
  gray: 'gray',
  blue: 'blue',
  orange: 'orange',
  sky: 'sky',
  turquoise: 'turquoise',
  purple: 'purple',
};

const StyledChip = styled.span<{ accent: ParksVisualAccent }>`
  align-items: center;
  background: ${({ accent }) =>
    PARKS_VISUAL_THEME.accents[accent].iconBackground};
  border: 1px solid ${({ accent }) => PARKS_VISUAL_THEME.accents[accent].border};
  border-radius: ${PARKS_VIBE.chipRadius};
  color: ${({ accent }) => PARKS_VISUAL_THEME.accents[accent].accent};
  display: inline-flex;
  font-size: ${themeCssVariables.font.size.xs};
  font-weight: ${themeCssVariables.font.weight.medium};
  gap: 6px;
  letter-spacing: 0.01em;
  line-height: 1;
  max-width: 100%;
  padding: 5px 8px;
  white-space: nowrap;
`;

const StyledDot = styled.span<{ dotColor: string }>`
  background: ${({ dotColor }) => dotColor};
  border-radius: 50%;
  display: inline-block;
  flex-shrink: 0;
  height: 7px;
  width: 7px;
`;

export const ParksStatusDot = ({
  color,
}: {
  color: ParksStackingStatusColor;
}) => <StyledDot dotColor={getParksStackingStatusColor(color)} />;

export const ParksStatusBadge = ({
  label,
  color = 'gray',
}: ParksStatusBadgeProps) => {
  const accent = accentKeyMap[color] ?? 'gray';

  return (
    <StyledChip accent={accent}>
      <StyledDot
        dotColor={PARKS_VISUAL_THEME.accents[accent].accent}
      />
      {label}
    </StyledChip>
  );
};
