import { styled } from '@linaria/react';
import { t } from '@lingui/core/macro';
import { Link } from 'react-router-dom';
import { IconArrowRight, IconUserPlus } from 'twenty-ui/icon';
import { themeCssVariables } from 'twenty-ui/theme-constants';

import { PARKS_LEADS_CEM_PATH } from '@/parks-industrial/constants/parks-routes.constants';
import { useParksAccess } from '@/parks-industrial/hooks/useParksAccess';
import { useParksUnassignedLeads } from '@/parks-industrial/hooks/useParksUnassignedLeads';

const StyledBanner = styled.div`
  align-items: center;
  background: linear-gradient(
    135deg,
    ${themeCssVariables.color.green1} 0%,
    ${themeCssVariables.background.primary} 72%
  );
  border: 1px solid ${themeCssVariables.color.green3};
  border-radius: ${themeCssVariables.border.radius.md};
  display: flex;
  flex-wrap: wrap;
  gap: ${themeCssVariables.spacing[2]};
  justify-content: space-between;
  padding: ${themeCssVariables.spacing[2]} ${themeCssVariables.spacing[3]};
`;

const StyledBannerMain = styled.div`
  align-items: center;
  display: flex;
  flex: 1;
  gap: ${themeCssVariables.spacing[2]};
  min-width: 220px;
`;

const StyledIconWrap = styled.span`
  align-items: center;
  background: ${themeCssVariables.background.transparent.success};
  border-radius: ${themeCssVariables.border.radius.sm};
  color: ${themeCssVariables.color.green};
  display: flex;
  height: 32px;
  justify-content: center;
  width: 32px;
`;

const StyledBannerCopy = styled.div`
  display: flex;
  flex-direction: column;
  gap: 2px;
`;

const StyledBannerTitle = styled.span`
  font-size: ${themeCssVariables.font.size.sm};
  font-weight: ${themeCssVariables.font.weight.semiBold};
`;

const StyledBannerHint = styled.span`
  color: ${themeCssVariables.font.color.tertiary};
  font-size: ${themeCssVariables.font.size.xs};
`;

const StyledBannerLink = styled(Link)`
  align-items: center;
  color: ${themeCssVariables.color.blue};
  display: inline-flex;
  font-size: ${themeCssVariables.font.size.sm};
  font-weight: ${themeCssVariables.font.weight.medium};
  gap: 4px;
  text-decoration: none;
  white-space: nowrap;

  &:hover {
    text-decoration: underline;
  }
`;

type ParksUnassignedLeadsBannerProps = {
  refreshKey?: number;
};

export const ParksUnassignedLeadsBanner = ({
  refreshKey = 0,
}: ParksUnassignedLeadsBannerProps) => {
  const { canAccessRoute } = useParksAccess();
  const { leads, isLoading } = useParksUnassignedLeads(refreshKey);

  if (!canAccessRoute('leadsCem') || isLoading || leads.length === 0) {
    return null;
  }

  const pendingLabel =
    leads.length === 1
      ? t`1 lead sin asignar`
      : t`${leads.length} leads sin asignar`;

  return (
    <StyledBanner>
      <StyledBannerMain>
        <StyledIconWrap>
          <IconUserPlus size={16} />
        </StyledIconWrap>
        <StyledBannerCopy>
          <StyledBannerTitle>{pendingLabel}</StyledBannerTitle>
          <StyledBannerHint>
            {t`Pendientes de asignación Director Comercial — gestiona la cola en Leads Director Comercial`}
          </StyledBannerHint>
        </StyledBannerCopy>
      </StyledBannerMain>
      <StyledBannerLink to={PARKS_LEADS_CEM_PATH}>
        {t`Ir a cola Director Comercial`}
        <IconArrowRight size={14} />
      </StyledBannerLink>
    </StyledBanner>
  );
};
