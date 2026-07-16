import { styled } from '@linaria/react';
import { t } from '@lingui/core/macro';
import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { AppPath } from 'twenty-shared/types';
import { IconArrowRight, IconCoins } from 'twenty-ui/icon';
import { themeCssVariables } from 'twenty-ui/theme-constants';

import { ParksMetricCard } from '@/parks-industrial/components/ui/ParksMetricCard';
import { ParksSectionCard } from '@/parks-industrial/components/ui/ParksSectionCard';
import {
  fetchParksCommissionDashboard,
  type ParksCommissionDashboard,
} from '@/parks-industrial/services/parks-commission.client';
import { formatParksUsd } from '@/parks-industrial/utils/parks-format.util';

const StyledMetricsGrid = styled.div`
  display: grid;
  gap: ${themeCssVariables.spacing[3]};
  grid-template-columns: repeat(auto-fit, minmax(150px, 1fr));
`;

const StyledFooter = styled.div`
  align-items: center;
  display: flex;
  justify-content: flex-end;
  margin-top: ${themeCssVariables.spacing[3]};
`;

const StyledLink = styled(Link)`
  align-items: center;
  color: ${themeCssVariables.color.blue};
  display: inline-flex;
  font-size: ${themeCssVariables.font.size.sm};
  font-weight: ${themeCssVariables.font.weight.medium};
  gap: ${themeCssVariables.spacing[1]};
  text-decoration: none;

  &:hover {
    text-decoration: underline;
  }
`;

export const ParksCeoComisionesSnapshot = () => {
  const [dashboard, setDashboard] = useState<ParksCommissionDashboard | null>(
    null,
  );

  useEffect(() => {
    let cancelled = false;

    void fetchParksCommissionDashboard()
      .then((next) => {
        if (!cancelled) {
          setDashboard(next);
        }
      })
      .catch(() => {
        if (!cancelled) {
          setDashboard(null);
        }
      });

    return () => {
      cancelled = true;
    };
  }, []);

  if (!dashboard) {
    return null;
  }

  return (
    <ParksSectionCard title={t`Comisiones`} accent="yellow">
      <StyledMetricsGrid>
        <ParksMetricCard
          label={t`Periodo`}
          value={formatParksUsd(dashboard.totalPeriodo)}
          trend={t`Cierres del mes`}
          icon={IconCoins}
          accent="yellow"
        />
        <ParksMetricCard
          label={t`Interno`}
          value={formatParksUsd(dashboard.byTipoPago.interno)}
          trend={t`Bono LO`}
          accent="green"
        />
        <ParksMetricCard
          label={t`Externo`}
          value={formatParksUsd(dashboard.byTipoPago.externo)}
          trend={t`Pago broker`}
          accent="blue"
        />
        <ParksMetricCard
          label={t`Pendientes de autorizar`}
          value={String(dashboard.pendientesValidacion)}
          trend={formatParksUsd(dashboard.pendientesMonto)}
          accent="orange"
        />
      </StyledMetricsGrid>
      <StyledFooter>
        <StyledLink to={AppPath.ParksComisiones}>
          {t`Ver detalle por folio`}
          <IconArrowRight size={14} />
        </StyledLink>
      </StyledFooter>
    </ParksSectionCard>
  );
};
