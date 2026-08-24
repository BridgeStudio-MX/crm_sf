import { styled } from '@linaria/react';
import { themeCssVariables } from 'twenty-ui/theme-constants';

import { getParksComiteGlaLegend } from '@/parks-industrial/utils/parks-comite-pipeline.util';

type ParksComiteGateLegendProps = {
  glaM2: number;
};

const StyledLegend = styled.p`
  background: ${themeCssVariables.color.orange1};
  border: 1px solid ${themeCssVariables.color.orange3};
  border-radius: ${themeCssVariables.border.radius.sm};
  color: ${themeCssVariables.font.color.primary};
  font-size: ${themeCssVariables.font.size.xs};
  line-height: 1.4;
  margin: 0;
  padding: ${themeCssVariables.spacing[2]} ${themeCssVariables.spacing[3]};
`;

export const ParksComiteGateLegend = ({
  glaM2,
}: ParksComiteGateLegendProps) => {
  const legend = getParksComiteGlaLegend(glaM2);

  if (!legend) {
    return null;
  }

  return <StyledLegend>{legend}</StyledLegend>;
};
