import { styled } from '@linaria/react';
import { themeCssVariables } from 'twenty-ui/theme-constants';

export const StyledParksPageSubtitle = styled.p`
  background: linear-gradient(
    90deg,
    ${themeCssVariables.color.blue1} 0%,
    ${themeCssVariables.background.primary} 100%
  );
  border: 1px solid ${themeCssVariables.color.blue3};
  border-left: 4px solid ${themeCssVariables.color.blue};
  border-radius: ${themeCssVariables.border.radius.md};
  color: ${themeCssVariables.font.color.secondary};
  font-size: ${themeCssVariables.font.size.sm};
  line-height: 1.45;
  margin: 0;
  padding: ${themeCssVariables.spacing[2]} ${themeCssVariables.spacing[3]};
`;
