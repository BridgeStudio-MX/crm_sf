import { styled } from '@linaria/react';
import { motion } from 'framer-motion';
import { type MouseEvent, useContext } from 'react';
import { isDefined } from 'twenty-shared/utils';
import { IconChevronRight } from 'twenty-ui/icon';
import { ThemeContext, themeCssVariables } from 'twenty-ui/theme-constants';

import { PARKS_BRAND } from '@/parks-industrial/constants/parks-theme.constants';

const StyledTitle = styled.div`
  align-items: center;
  border-radius: ${themeCssVariables.border.radius.sm};
  display: flex;
  height: ${themeCssVariables.spacing[7]};
  justify-content: space-between;
  padding: ${themeCssVariables.spacing[1]};

  &:hover {
    background-color: ${themeCssVariables.background.transparent.light};
    cursor: pointer;
  }
`;

const StyledLabelContainer = styled.div`
  align-items: center;
  display: flex;
  flex-grow: 1;
  gap: ${themeCssVariables.spacing[2]};
  min-width: 0;
`;

const StyledAccentMark = styled.span`
  background: linear-gradient(
    180deg,
    ${PARKS_BRAND.accent} 0%,
    ${PARKS_BRAND.primary} 100%
  );
  border-radius: ${themeCssVariables.border.radius.pill};
  flex-shrink: 0;
  height: 14px;
  width: 3px;
`;

const StyledSectionLabel = styled.span`
  color: ${themeCssVariables.font.color.primary};
  font-size: ${themeCssVariables.font.size.sm};
  font-weight: ${themeCssVariables.font.weight.semiBold};
  letter-spacing: -0.01em;
  line-height: 1;
`;

const StyledChevron = styled.div`
  align-items: center;
  display: flex;
  opacity: 0;
  transition: opacity calc(${themeCssVariables.animation.duration.fast} * 1s)
    ease;

  ${StyledTitle}:hover & {
    opacity: 1;
  }
`;

const MotionIconChevronRight = motion.create(IconChevronRight);

type ParksNavigationSectionTitleProps = {
  onClick?: () => void;
  label: string;
  isOpen?: boolean;
};

export const ParksNavigationSectionTitle = ({
  onClick,
  label,
  isOpen,
}: ParksNavigationSectionTitleProps) => {
  const { theme } = useContext(ThemeContext);

  const handleTitleClick = (event: MouseEvent<HTMLDivElement>) => {
    event.stopPropagation();

    if (isDefined(onClick)) {
      onClick();
    }
  };

  return (
    <StyledTitle>
      <StyledLabelContainer onClick={handleTitleClick}>
        <StyledAccentMark />
        <StyledSectionLabel>{label}</StyledSectionLabel>
        {isOpen !== undefined ? (
          <StyledChevron>
            <MotionIconChevronRight
              initial={false}
              animate={{ rotate: isOpen ? 90 : 0 }}
              transition={{ duration: theme.animation.duration.normal }}
              size="12px"
              stroke={theme.icon.stroke.lg}
              color={themeCssVariables.font.color.tertiary}
            />
          </StyledChevron>
        ) : null}
      </StyledLabelContainer>
    </StyledTitle>
  );
};
