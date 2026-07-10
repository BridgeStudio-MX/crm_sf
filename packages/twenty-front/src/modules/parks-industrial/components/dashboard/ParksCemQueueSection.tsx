import { styled } from '@linaria/react';
import { t } from '@lingui/core/macro';
import { Link } from 'react-router-dom';
import { themeCssVariables } from 'twenty-ui/theme-constants';

import { ParksUnassignedLeadsPanel } from '@/parks-industrial/components/pipeline/ParksUnassignedLeadsPanel';
import { ParksSectionCard } from '@/parks-industrial/components/ui/ParksSectionCard';
import { PARKS_LEADS_CEM_PATH } from '@/parks-industrial/constants/parks-routes.constants';

const StyledSectionIntro = styled.p`
  color: ${themeCssVariables.font.color.secondary};
  font-size: ${themeCssVariables.font.size.sm};
  line-height: 1.45;
  margin: 0;
`;

const StyledManageLink = styled(Link)`
  color: ${themeCssVariables.color.blue};
  font-size: ${themeCssVariables.font.size.sm};
  font-weight: ${themeCssVariables.font.weight.medium};
  text-decoration: none;

  &:hover {
    text-decoration: underline;
  }
`;

const StyledSectionFooter = styled.div`
  display: flex;
  justify-content: flex-end;
  margin-top: ${themeCssVariables.spacing[2]};
`;

type ParksCemQueueSectionProps = {
  refreshKey?: number;
};

export const ParksCemQueueSection = ({
  refreshKey = 0,
}: ParksCemQueueSectionProps) => (
  <ParksSectionCard
    title={t`Cola CEM — leads sin asignar`}
    accent="green"
  >
    <StyledSectionIntro>
      {t`Vista del Director Comercial (US-COM-002): asigna cada lead al Leasing Officer correcto. Al asignar se registra auditoría y tarea de contacto en 24h.`}
    </StyledSectionIntro>
    <ParksUnassignedLeadsPanel variant="compact" refreshKey={refreshKey} />
    <StyledSectionFooter>
      <StyledManageLink to={PARKS_LEADS_CEM_PATH}>
        {t`Abrir cola completa →`}
      </StyledManageLink>
    </StyledSectionFooter>
  </ParksSectionCard>
);
