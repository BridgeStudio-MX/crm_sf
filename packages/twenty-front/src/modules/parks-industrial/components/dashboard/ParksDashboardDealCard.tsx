import { styled } from '@linaria/react';
import { t } from '@lingui/core/macro';
import { Link } from 'react-router-dom';
import { AppPath } from 'twenty-shared/types';
import { IconArrowRight } from 'twenty-ui/icon';
import { themeCssVariables } from 'twenty-ui/theme-constants';

import { ParksStatusBadge } from '@/parks-industrial/components/ui/ParksStatusBadge';
import { getParksPipelineStageLabel } from '@/parks-industrial/constants/parks-industrial.constants';
import { PARKS_BRAND } from '@/parks-industrial/constants/parks-theme.constants';
import {
  formatParksUsd,
  getParksAmountFromMicros,
} from '@/parks-industrial/utils/parks-format.util';
import { type ParksOpportunityRecord } from '@/parks-industrial/hooks/useParksRecords';

const StyledCard = styled(Link)`
  background: ${themeCssVariables.background.primary};
  border: 1px solid ${themeCssVariables.border.color.medium};
  border-left: 4px solid ${PARKS_BRAND.primary};
  border-radius: ${themeCssVariables.border.radius.md};
  box-shadow: ${themeCssVariables.boxShadow.light};
  display: block;
  padding: ${themeCssVariables.spacing[3]};
  text-decoration: none;
  transition:
    box-shadow 0.15s ease,
    transform 0.15s ease;

  &:hover {
    box-shadow: ${themeCssVariables.boxShadow.strong};
    transform: translateY(-1px);
  }
`;

const StyledHeader = styled.div`
  align-items: flex-start;
  display: flex;
  gap: ${themeCssVariables.spacing[2]};
  justify-content: space-between;
`;

const StyledDealName = styled.div`
  color: ${themeCssVariables.font.color.primary};
  font-size: ${themeCssVariables.font.size.md};
  font-weight: ${themeCssVariables.font.weight.semiBold};
`;

const StyledMeta = styled.div`
  color: ${themeCssVariables.font.color.secondary};
  font-size: ${themeCssVariables.font.size.sm};
  margin-top: ${themeCssVariables.spacing[1]};
`;

const StyledFooter = styled.div`
  align-items: center;
  border-top: 1px solid ${themeCssVariables.border.color.light};
  color: ${PARKS_BRAND.primary};
  display: flex;
  font-size: ${themeCssVariables.font.size.xs};
  font-weight: ${themeCssVariables.font.weight.medium};
  gap: 4px;
  margin-top: ${themeCssVariables.spacing[3]};
  padding-top: ${themeCssVariables.spacing[2]};
`;

type ParksDashboardDealCardProps = {
  deal: ParksOpportunityRecord;
};

export const ParksDashboardDealCard = ({ deal }: ParksDashboardDealCardProps) => {
  const amount = formatParksUsd(
    getParksAmountFromMicros(deal.amount?.amountMicros),
  );

  return (
    <StyledCard to={AppPath.ParksPipeline}>
      <StyledHeader>
        <StyledDealName>{deal.name}</StyledDealName>
        <ParksStatusBadge
          color="blue"
          label={getParksPipelineStageLabel(deal.stage)}
        />
      </StyledHeader>
      <StyledMeta>
        {deal.naveVinculada?.identificador ?? t`Sin nave`} · {amount}
      </StyledMeta>
      <StyledFooter>
        {t`Ver en pipeline`}
        <IconArrowRight size={12} />
      </StyledFooter>
    </StyledCard>
  );
};
