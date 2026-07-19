import { styled } from '@linaria/react';
import { Tag } from 'twenty-ui/data-display';
import { type ThemeColor } from 'twenty-ui/theme';

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

const tagColorMap: Record<ParksStatusBadgeColor, ThemeColor> = {
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

const StyledDot = styled.span<{ dotColor: string }>`
  background: ${({ dotColor }) => dotColor};
  border-radius: 50%;
  display: inline-block;
  height: 8px;
  margin-right: 6px;
  width: 8px;
`;

export const ParksStatusDot = ({
  color,
}: {
  color: ParksStackingStatusColor;
}) => <StyledDot dotColor={getParksStackingStatusColor(color)} />;

export const ParksStatusBadge = ({ label, color = 'gray' }: ParksStatusBadgeProps) => (
  <Tag
    color={tagColorMap[color] ?? color ?? 'gray'}
    text={label}
    variant="solid"
    weight="medium"
  />
);
