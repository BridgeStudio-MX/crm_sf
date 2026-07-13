import { styled } from '@linaria/react';
import { type ReactNode } from 'react';
import { themeCssVariables } from 'twenty-ui/theme-constants';

const StyledBadge = styled.span`
  align-items: center;
  background: ${themeCssVariables.color.red};
  border-radius: ${themeCssVariables.border.radius.pill};
  color: ${themeCssVariables.font.color.inverted};
  display: inline-flex;
  font-size: 10px;
  font-weight: ${themeCssVariables.font.weight.semiBold};
  height: 16px;
  justify-content: center;
  line-height: 1;
  min-width: 16px;
  padding: 0 5px;
`;

const StyledDot = styled.span`
  background: ${themeCssVariables.color.red};
  border: 1.5px solid ${themeCssVariables.background.primary};
  border-radius: 50%;
  height: 8px;
  position: absolute;
  right: -2px;
  top: -2px;
  width: 8px;
`;

const StyledIconWrap = styled.span`
  display: inline-flex;
  position: relative;
`;

type ParksNavigationUnreadBadgeProps = {
  count: number;
};

export const ParksNavigationUnreadBadge = ({
  count,
}: ParksNavigationUnreadBadgeProps) => {
  if (count <= 0) {
    return null;
  }

  const label = count > 99 ? '99+' : String(count);

  return <StyledBadge aria-label={`${label} sin leer`}>{label}</StyledBadge>;
};

type ParksNavigationUnreadIconDotProps = {
  show: boolean;
  children: ReactNode;
};

export const ParksNavigationUnreadIconDot = ({
  show,
  children,
}: ParksNavigationUnreadIconDotProps) => (
  <StyledIconWrap>
    {children}
    {show ? <StyledDot aria-hidden /> : null}
  </StyledIconWrap>
);
