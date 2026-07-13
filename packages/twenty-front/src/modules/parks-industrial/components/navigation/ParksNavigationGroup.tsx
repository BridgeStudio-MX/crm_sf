import { styled } from '@linaria/react';
import { type ReactNode } from 'react';
import { themeCssVariables } from 'twenty-ui/theme-constants';

import { PARKS_BRAND } from '@/parks-industrial/constants/parks-theme.constants';

const StyledGroup = styled.div`
  display: flex;
  flex-direction: column;
  gap: 1px;
`;

const StyledGroupLabel = styled.div`
  align-items: center;
  color: ${themeCssVariables.font.color.tertiary};
  display: flex;
  font-size: 10px;
  font-weight: ${themeCssVariables.font.weight.medium};
  gap: 6px;
  letter-spacing: 0.07em;
  padding: ${themeCssVariables.spacing[2]} ${themeCssVariables.spacing[1]}
    ${themeCssVariables.spacing[1]};
  text-transform: uppercase;
`;

const StyledGroupDot = styled.span`
  background: ${PARKS_BRAND.accent};
  border-radius: 50%;
  flex-shrink: 0;
  height: 4px;
  width: 4px;
`;

type ParksNavigationGroupProps = {
  label?: string;
  children: ReactNode;
};

export const ParksNavigationGroup = ({
  label,
  children,
}: ParksNavigationGroupProps) => (
  <StyledGroup>
    {label ? (
      <StyledGroupLabel>
        <StyledGroupDot />
        {label}
      </StyledGroupLabel>
    ) : null}
    {children}
  </StyledGroup>
);
