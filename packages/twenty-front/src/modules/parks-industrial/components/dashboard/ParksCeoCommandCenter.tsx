import { styled } from '@linaria/react';
import { t } from '@lingui/core/macro';
import { Link } from 'react-router-dom';
import { IconRefresh } from 'twenty-ui/icon';
import { Button } from 'twenty-ui/input';
import { themeCssVariables } from 'twenty-ui/theme-constants';

import { ParksCeoBoardView } from '@/parks-industrial/components/dashboard/ParksCeoBoardView';
import { ParksCeoDailyView } from '@/parks-industrial/components/dashboard/ParksCeoDailyView';
import { ParksCeoKpiCatalog } from '@/parks-industrial/components/dashboard/ParksCeoKpiCatalog';
import { ParksEmptyState } from '@/parks-industrial/components/ui/ParksEmptyState';
import { ParksLoadingSkeleton } from '@/parks-industrial/components/ui/ParksLoadingSkeleton';
import { StyledParksPageStack } from '@/parks-industrial/components/ui/ParksSectionCard';
import { ParksSegmentedControl } from '@/parks-industrial/components/ui/ParksSegmentedControl';
import { ParksStatusBadge } from '@/parks-industrial/components/ui/ParksStatusBadge';
import { PARKS_MIS_PENDIENTES_PATH } from '@/parks-industrial/constants/parks-routes.constants';
import { useParksCeoExecutiveDashboard } from '@/parks-industrial/hooks/useParksCeoExecutiveDashboard';
import { type ParksCeoDashboardView } from '@/parks-industrial/types/parks-ceo-dashboard.types';

const StyledToolbar = styled.div`
  align-items: center;
  display: flex;
  flex-wrap: wrap;
  gap: ${themeCssVariables.spacing[3]};
  justify-content: space-between;
`;

const StyledToolbarCopy = styled.div`
  display: flex;
  flex-direction: column;
  gap: 4px;
`;

const StyledToolbarTitle = styled.h2`
  font-size: ${themeCssVariables.font.size.xl};
  font-weight: ${themeCssVariables.font.weight.semiBold};
  margin: 0;
`;

const StyledToolbarHint = styled.p`
  color: ${themeCssVariables.font.color.secondary};
  font-size: ${themeCssVariables.font.size.sm};
  margin: 0;
`;

const StyledToolbarActions = styled.div`
  align-items: center;
  display: flex;
  flex-wrap: wrap;
  gap: ${themeCssVariables.spacing[2]};
`;

const StyledPendientesLink = styled(Link)`
  text-decoration: none;
`;

const StyledError = styled.div`
  color: ${themeCssVariables.font.color.danger};
  font-size: ${themeCssVariables.font.size.sm};
`;

export const ParksCeoCommandCenter = () => {
  const { data, loading, error, view, setView, refresh } =
    useParksCeoExecutiveDashboard();

  if (loading) {
    return <ParksLoadingSkeleton variant="dashboard" />;
  }

  if (!data) {
    return (
      <ParksEmptyState
        title={t`No se pudo cargar el Command Center`}
        description={error ?? t`Revisa el microservicio Parks (:3002).`}
        action={
          <Button
            variant="secondary"
            Icon={IconRefresh}
            title={t`Reintentar`}
            onClick={() => void refresh()}
          />
        }
      />
    );
  }

  const viewOptions = [
    { id: 'diario' as const, label: t`Dashboard diario` },
    { id: 'consejo' as const, label: t`Vista de consejo` },
  ];

  return (
    <StyledParksPageStack>
      <StyledToolbar>
        <StyledToolbarCopy>
          <StyledToolbarTitle>{t`Command Center CEO`}</StyledToolbarTitle>
          <StyledToolbarHint>
            {t`KPIs ejecutivos · dashboards comercial y legal en el menú`}
          </StyledToolbarHint>
        </StyledToolbarCopy>
        <StyledToolbarActions>
          {data.inbox.total > 0 ? (
            <StyledPendientesLink to={PARKS_MIS_PENDIENTES_PATH}>
              <ParksStatusBadge
                label={t`${data.inbox.total} pendientes →`}
                color="yellow"
              />
            </StyledPendientesLink>
          ) : null}
          <ParksSegmentedControl
            options={viewOptions}
            value={view}
            onChange={(nextView) =>
              setView(nextView as ParksCeoDashboardView)
            }
          />
          <Button
            variant="secondary"
            Icon={IconRefresh}
            title={t`Actualizar`}
            onClick={() => void refresh()}
          />
        </StyledToolbarActions>
      </StyledToolbar>

      {error ? <StyledError>{error}</StyledError> : null}

      {view === 'diario' ? (
        <ParksCeoDailyView
          daily={data.daily}
          asOfDate={data.asOfDate}
          pendingActions={data.inbox.total}
        />
      ) : (
        <ParksCeoBoardView board={data.board} />
      )}

      <ParksCeoKpiCatalog items={data.kpisCatalog} />
    </StyledParksPageStack>
  );
};
