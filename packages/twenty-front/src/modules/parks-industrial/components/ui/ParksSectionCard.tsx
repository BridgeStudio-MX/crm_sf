import { styled } from '@linaria/react';
import { type ReactNode } from 'react';
import { MOBILE_VIEWPORT, themeCssVariables } from 'twenty-ui/theme-constants';

import {
  type ParksVisualAccent,
  PARKS_VISUAL_THEME,
} from '@/parks-industrial/constants/parks-theme.constants';

type ParksSectionCardProps = {
  title: string;
  children: ReactNode;
  action?: ReactNode;
  accent?: ParksVisualAccent;
};

const StyledSection = styled.section<{ accent: ParksVisualAccent }>`
  background: ${({ accent }) => PARKS_VISUAL_THEME.accents[accent].backgroundGradient};
  border: 1px solid ${({ accent }) => PARKS_VISUAL_THEME.accents[accent].border};
  border-radius: ${themeCssVariables.border.radius.md};
  box-shadow: ${themeCssVariables.boxShadow.light};
  overflow: hidden;
  padding: ${themeCssVariables.spacing[3]};
  position: relative;

  &::before {
    background: ${({ accent }) => PARKS_VISUAL_THEME.accents[accent].accent};
    content: '';
    height: 3px;
    left: 0;
    position: absolute;
    right: 0;
    top: 0;
  }
`;

const StyledHeader = styled.div`
  align-items: center;
  display: flex;
  justify-content: space-between;
  margin-bottom: ${themeCssVariables.spacing[3]};
  padding-top: ${themeCssVariables.spacing[1]};
`;

const StyledTitle = styled.h3`
  color: ${themeCssVariables.font.color.primary};
  font-size: ${themeCssVariables.font.size.md};
  font-weight: ${themeCssVariables.font.weight.semiBold};
  margin: 0;
`;

export const ParksSectionCard = ({
  title,
  children,
  action,
  accent = 'blue',
}: ParksSectionCardProps) => (
  <StyledSection accent={accent}>
    <StyledHeader>
      <StyledTitle>{title}</StyledTitle>
      {action}
    </StyledHeader>
    {children}
  </StyledSection>
);

export const StyledParksTwoColumnGrid = styled.div`
  display: grid;
  gap: ${themeCssVariables.spacing[4]};

  @media (min-width: ${MOBILE_VIEWPORT}px) {
    grid-template-columns: 2fr 1fr;
  }
`;

export const StyledParksPageStack = styled.div`
  display: flex;
  flex-direction: column;
  gap: ${themeCssVariables.spacing[4]};
`;
