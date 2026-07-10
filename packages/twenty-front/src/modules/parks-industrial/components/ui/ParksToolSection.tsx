import { styled } from '@linaria/react';
import { type ReactNode } from 'react';
import { type IconComponent } from 'twenty-ui/icon';
import { themeCssVariables } from 'twenty-ui/theme-constants';

import {
  type ParksVisualAccent,
  PARKS_VISUAL_THEME,
} from '@/parks-industrial/constants/parks-theme.constants';

type ParksToolSectionVariant =
  | 'default'
  | 'highlight'
  | 'purple'
  | 'green'
  | 'orange'
  | 'sky';

type ParksToolSectionProps = {
  title: string;
  icon?: IconComponent;
  hint?: string;
  action?: ReactNode;
  children: ReactNode;
  variant?: ParksToolSectionVariant;
  embedded?: boolean;
};

const variantAccentMap: Record<ParksToolSectionVariant, ParksVisualAccent> = {
  default: 'sky',
  highlight: 'blue',
  purple: 'purple',
  green: 'green',
  orange: 'orange',
  sky: 'sky',
};

const StyledEmbedded = styled.div`
  display: flex;
  flex-direction: column;
  gap: ${themeCssVariables.spacing[3]};
`;

const StyledSection = styled.section<{ variant: ParksToolSectionVariant }>`
  background: ${({ variant }) =>
    PARKS_VISUAL_THEME.accents[variantAccentMap[variant]].backgroundGradient};
  border: 1px solid
    ${({ variant }) => PARKS_VISUAL_THEME.accents[variantAccentMap[variant]].border};
  border-radius: ${themeCssVariables.border.radius.md};
  box-shadow: ${themeCssVariables.boxShadow.light};
  display: flex;
  flex-direction: column;
  gap: ${themeCssVariables.spacing[3]};
  padding: ${themeCssVariables.spacing[3]};
`;

const StyledHeader = styled.div`
  align-items: flex-start;
  display: flex;
  gap: ${themeCssVariables.spacing[2]};
  justify-content: space-between;
`;

const StyledHeaderMain = styled.div`
  align-items: center;
  display: flex;
  gap: ${themeCssVariables.spacing[2]};
  min-width: 0;
`;

const StyledIconWrap = styled.span<{ variant: ParksToolSectionVariant }>`
  align-items: center;
  background: ${({ variant }) =>
    PARKS_VISUAL_THEME.accents[variantAccentMap[variant]].iconBackground};
  border: 1px solid
    ${({ variant }) => PARKS_VISUAL_THEME.accents[variantAccentMap[variant]].border};
  border-radius: ${themeCssVariables.border.radius.sm};
  color: ${({ variant }) =>
    PARKS_VISUAL_THEME.accents[variantAccentMap[variant]].accent};
  display: flex;
  flex-shrink: 0;
  height: 28px;
  justify-content: center;
  width: 28px;
`;

const StyledTitleWrap = styled.div`
  display: flex;
  flex-direction: column;
  gap: 2px;
  min-width: 0;
`;

const StyledTitle = styled.h4`
  color: ${themeCssVariables.font.color.primary};
  font-size: ${themeCssVariables.font.size.sm};
  font-weight: ${themeCssVariables.font.weight.semiBold};
  margin: 0;
`;

const StyledHint = styled.p`
  color: ${themeCssVariables.font.color.tertiary};
  font-size: ${themeCssVariables.font.size.xs};
  line-height: 1.35;
  margin: 0;
`;

export const ParksToolSection = ({
  title,
  icon: Icon,
  hint,
  action,
  children,
  variant = 'default',
  embedded = false,
}: ParksToolSectionProps) => {
  if (embedded) {
    return <StyledEmbedded>{children}</StyledEmbedded>;
  }

  return (
    <StyledSection variant={variant}>
      <StyledHeader>
        <StyledHeaderMain>
          {Icon ? (
            <StyledIconWrap variant={variant}>
              <Icon size={16} />
            </StyledIconWrap>
          ) : null}
          <StyledTitleWrap>
            <StyledTitle>{title}</StyledTitle>
            {hint ? <StyledHint>{hint}</StyledHint> : null}
          </StyledTitleWrap>
        </StyledHeaderMain>
        {action}
      </StyledHeader>
      {children}
    </StyledSection>
  );
};
