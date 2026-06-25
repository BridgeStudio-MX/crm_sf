import { styled } from '@linaria/react';
import { themeCssVariables } from 'twenty-ui/theme-constants';

export const StyledParksInput = styled.input`
  background: ${themeCssVariables.background.primary};
  border: 1px solid ${themeCssVariables.border.color.medium};
  border-radius: ${themeCssVariables.border.radius.sm};
  color: ${themeCssVariables.font.color.primary};
  font-size: ${themeCssVariables.font.size.sm};

  &::placeholder {
    color: ${themeCssVariables.font.color.tertiary};
  }
`;

export const StyledParksSelect = styled.select`
  appearance: none;
  background: ${themeCssVariables.background.primary};
  background-image: linear-gradient(
      45deg,
      transparent 50%,
      ${themeCssVariables.font.color.tertiary} 50%
    ),
    linear-gradient(
      135deg,
      ${themeCssVariables.font.color.tertiary} 50%,
      transparent 50%
    );
  background-position:
    calc(100% - 16px) calc(50% - 2px),
    calc(100% - 11px) calc(50% - 2px);
  background-repeat: no-repeat;
  background-size:
    5px 5px,
    5px 5px;
  border: 1px solid ${themeCssVariables.border.color.medium};
  border-radius: ${themeCssVariables.border.radius.sm};
  color: ${themeCssVariables.font.color.primary};
  cursor: pointer;
  font-size: ${themeCssVariables.font.size.sm};
  padding: ${themeCssVariables.spacing[2]}
    calc(${themeCssVariables.spacing[2]} + 20px)
    ${themeCssVariables.spacing[2]} ${themeCssVariables.spacing[2]};

  option {
    background: ${themeCssVariables.background.primary};
    color: ${themeCssVariables.font.color.primary};
  }
`;
