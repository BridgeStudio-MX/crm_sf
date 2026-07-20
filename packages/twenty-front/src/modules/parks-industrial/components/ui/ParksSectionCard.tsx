import { styled } from '@linaria/react';
import { type ReactNode } from 'react';
import { MOBILE_VIEWPORT, themeCssVariables } from 'twenty-ui/theme-constants';

import {
  type ParksVisualAccent,
  PARKS_VIBE,
  PARKS_VISUAL_THEME,
} from '@/parks-industrial/constants/parks-theme.constants';

type ParksSectionCardProps = {
  title: string;
  children: ReactNode;
  action?: ReactNode;
  accent?: ParksVisualAccent;
};

const StyledSection = styled.section<{ accent: ParksVisualAccent }>`
  background: ${({ accent }) =>
    PARKS_VISUAL_THEME.accents[accent].backgroundGradient};
  border: 1px solid ${({ accent }) => PARKS_VISUAL_THEME.accents[accent].border};
  border-radius: ${PARKS_VIBE.radiusMd};
  box-shadow: ${PARKS_VIBE.shadowCard};
  overflow: hidden;
  padding: ${PARKS_VIBE.space.lg};
  position: relative;
  transition: box-shadow 0.15s ease;

  &::before {
    background: ${({ accent }) => PARKS_VISUAL_THEME.accents[accent].accent};
    content: '';
    height: ${PARKS_VIBE.accentBarHeight};
    left: 0;
    position: absolute;
    right: 0;
    top: 0;
  }

  &:hover {
    box-shadow: ${PARKS_VIBE.shadowHover};
  }
`;

const StyledHeader = styled.div`
  align-items: center;
  display: flex;
  justify-content: space-between;
  margin-bottom: ${PARKS_VIBE.space.md};
  padding-top: ${PARKS_VIBE.space.xs};
`;

const StyledTitle = styled.h3`
  color: ${PARKS_VIBE.textPrimary};
  font-size: ${themeCssVariables.font.size.md};
  font-weight: ${themeCssVariables.font.weight.semiBold};
  letter-spacing: -0.01em;
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
  gap: ${PARKS_VIBE.space.lg};

  @media (min-width: ${MOBILE_VIEWPORT}px) {
    grid-template-columns: 2fr 1fr;
  }
`;

export const StyledParksPageStack = styled.div`
  display: flex;
  flex-direction: column;
  gap: ${PARKS_VIBE.space.lg};
`;
