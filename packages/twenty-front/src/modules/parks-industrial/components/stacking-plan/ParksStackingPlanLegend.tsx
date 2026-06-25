import { styled } from '@linaria/react';
import { t } from '@lingui/core/macro';
import { themeCssVariables } from 'twenty-ui/theme-constants';

import { ParksStatusDot } from '@/parks-industrial/components/ui/ParksStatusBadge';

const StyledLegend = styled.div`
  color: ${themeCssVariables.font.color.secondary};
  display: flex;
  flex-wrap: wrap;
  font-size: ${themeCssVariables.font.size.sm};
  gap: ${themeCssVariables.spacing[4]};
`;

const StyledItem = styled.span`
  align-items: center;
  display: inline-flex;
  gap: ${themeCssVariables.spacing[1]};
`;

export const ParksStackingPlanLegend = () => (
  <StyledLegend>
    <StyledItem>
      <ParksStatusDot color="green" />
      {t`Activo (>180 días)`}
    </StyledItem>
    <StyledItem>
      <ParksStatusDot color="yellow" />
      {t`Por renovar (90–180 días)`}
    </StyledItem>
    <StyledItem>
      <ParksStatusDot color="red" />
      {t`Vence pronto (<90 días)`}
    </StyledItem>
    <StyledItem>
      <ParksStatusDot color="gray" />
      {t`Disponible`}
    </StyledItem>
  </StyledLegend>
);
