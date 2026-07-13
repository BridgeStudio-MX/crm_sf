import { styled } from '@linaria/react';
import { t } from '@lingui/core/macro';
import { Link } from 'react-router-dom';
import { AppPath } from 'twenty-shared/types';
import { getAppPath } from 'twenty-shared/utils';
import { IconAlertTriangle, IconArrowRight } from 'twenty-ui/icon';
import { themeCssVariables } from 'twenty-ui/theme-constants';

import { formatParksDate } from '@/parks-industrial/utils/parks-format.util';

type ParksDashboardAlertCardProps = {
  empresa: string;
  fechaVencimiento?: string | null;
  contratoId?: string | null;
};

const StyledCard = styled.div`
  background: linear-gradient(
    135deg,
    ${themeCssVariables.color.red1} 0%,
    ${themeCssVariables.background.primary} 100%
  );
  border: 1px solid ${themeCssVariables.color.red3};
  border-left: 4px solid ${themeCssVariables.color.red};
  border-radius: ${themeCssVariables.border.radius.md};
  display: flex;
  flex-direction: column;
  gap: ${themeCssVariables.spacing[2]};
  padding: ${themeCssVariables.spacing[3]};
  transition: box-shadow 0.15s ease;

  &:hover {
    box-shadow: ${themeCssVariables.boxShadow.strong};
  }
`;

const StyledHeader = styled.div`
  align-items: flex-start;
  display: flex;
  gap: ${themeCssVariables.spacing[2]};
  justify-content: space-between;
`;

const StyledEmpresa = styled.div`
  font-size: ${themeCssVariables.font.size.sm};
  font-weight: ${themeCssVariables.font.weight.semiBold};
`;

const StyledMeta = styled.div`
  color: ${themeCssVariables.font.color.secondary};
  font-size: ${themeCssVariables.font.size.xs};
`;

const StyledLink = styled(Link)`
  align-items: center;
  color: ${themeCssVariables.color.red};
  display: inline-flex;
  font-size: ${themeCssVariables.font.size.xs};
  font-weight: ${themeCssVariables.font.weight.medium};
  gap: 4px;
  text-decoration: none;

  &:hover {
    text-decoration: underline;
  }
`;

export const ParksDashboardAlertCard = ({
  empresa,
  fechaVencimiento,
  contratoId,
}: ParksDashboardAlertCardProps) => (
  <StyledCard>
    <StyledHeader>
      <div>
        <StyledEmpresa>{empresa}</StyledEmpresa>
        <StyledMeta>
          {t`Vence`} {formatParksDate(fechaVencimiento)}
        </StyledMeta>
      </div>
      <IconAlertTriangle color={themeCssVariables.color.red} size={18} />
    </StyledHeader>
    {contratoId ? (
      <StyledLink
        to={getAppPath(AppPath.ParksContratoAprobacion, {
          contratoId,
        })}
      >
        {t`Ver contrato`}
        <IconArrowRight size={12} />
      </StyledLink>
    ) : null}
  </StyledCard>
);
