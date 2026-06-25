import { styled } from '@linaria/react';
import { Tag } from 'twenty-ui/data-display';
import { type ThemeColor } from 'twenty-ui/theme';

import {
  type ParksStackingStatusColor,
  getParksStackingStatusColor,
} from '@/parks-industrial/utils/parks-format.util';

type ParksStatusBadgeProps = {
  label: string;
  color?: ParksStackingStatusColor | 'blue' | 'red' | 'green' | 'yellow' | 'gray';
};

const tagColorMap: Record<
  ParksStackingStatusColor | 'blue' | 'red' | 'green' | 'yellow' | 'gray',
  ThemeColor
> = {
  green: 'green',
  yellow: 'yellow',
  red: 'red',
  gray: 'gray',
  blue: 'blue',
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
  <Tag color={tagColorMap[color]} text={label} variant="solid" weight="medium" />
);
