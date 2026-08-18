import { styled } from '@linaria/react';
import { t } from '@lingui/core/macro';
import { Link } from 'react-router-dom';
import { IconRefresh } from 'twenty-ui/icon';
import { Button } from 'twenty-ui/input';
import { themeCssVariables } from 'twenty-ui/theme-constants';

import { ParksCeoBoardView } from '@/parks-industrial/components/dashboard/ParksCeoBoardView';
import { ParksCeoComisionesSnapshot } from '@/parks-industrial/components/dashboard/ParksCeoComisionesSnapshot';
import { ParksCeoDailyView } from '@/parks-industrial/components/dashboard/ParksCeoDailyView';
import { ParksCeoExecutiveIndicatorsView } from '@/parks-industrial/components/dashboard/ParksCeoExecutiveIndicatorsView';
import { ParksCeoKpiCatalog } from '@/parks-industrial/components/dashboard/ParksCeoKpiCatalog';
import { ParksPortfolioByParkSection } from '@/parks-industrial/components/portfolio/ParksPortfolioByParkSection';
import { ParksEmptyState } from '@/parks-industrial/components/ui/ParksEmptyState';
import { ParksLoadingSkeleton } from '@/parks-industrial/components/ui/ParksLoadingSkeleton';
import { StyledParksPageStack } from '@/parks-industrial/components/ui/ParksSectionCard';
import { ParksSegmentedControl } from '@/parks-industrial/components/ui/ParksSegmentedControl';
import { ParksStatusBadge } from '@/parks-industrial/components/ui/ParksStatusBadge';
import {
  StyledParksSelect,
} from '@/parks-industrial/components/ui/parks-form-control.styles';
import {
  PARKS_PORTFOLIO_SEGMENTS,
  type ParksPortfolioSegment,
} from '@/parks-industrial/constants/parks-executive.constants';
import { PARKS_MIS_PENDIENTES_PATH } from '@/parks-industrial/constants/parks-routes.constants';
import { useParksCeoExecutiveDashboard } from '@/parks-industrial/hooks/useParksCeoExecutiveDashboard';
import { type ParksCeoDashboardView } from '@/parks-industrial/types/parks-ceo-dashboard.types';

const MONTH_OPTIONS = [
  { value: 1, label: 'Enero' },
  { value: 2, label: 'Febrero' },
  { value: 3, label: 'Marzo' },
  { value: 4, label: 'Abril' },
  { value: 5, label: 'Mayo' },
  { value: 6, label: 'Junio' },
  { value: 7, label: 'Julio' },
  { value: 8, label: 'Agosto' },
  { value: 9, label: 'Septiembre' },
  { value: 10, label: 'Octubre' },
  { value: 11, label: 'Noviembre' },
  { value: 12, label: 'Diciembre' },
] as const;

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

const StyledFilters = styled.div`
  align-items: center;
  display: flex;
  flex-wrap: wrap;
  gap: ${themeCssVariables.spacing[2]};
`;

const StyledFilterSelect = styled(StyledParksSelect)`
  max-width: 140px;
`;

const StyledPendientesLink = styled(Link)`
  text-decoration: none;
`;

const StyledError = styled.div`
  color: ${themeCssVariables.font.color.danger};
  font-size: ${themeCssVariables.font.size.sm};
`;

export const ParksCeoCommandCenter = () => {
  const {
    data,
    loading,
    error,
    view,
    setView,
    year,
    setYear,
    month,
    setMonth,
    segmento,
    setSegmento,
    refresh,
  } = useParksCeoExecutiveDashboard();

  if (loading && !data) {
    return <ParksLoadingSkeleton variant="dashboard" />;
  }

  if (!data) {
    return (
      <ParksEmptyState
        title={t`No se pudo cargar el Panel Ejecutivo`}
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
    { id: 'ejecutivo' as const, label: t`Panel ejecutivo` },
    { id: 'diario' as const, label: t`Dashboard diario` },
    { id: 'consejo' as const, label: t`Vista de consejo` },
  ];

  const yearOptions = Array.from(
    new Set([
      year,
      ...data.snapshots.map((snapshot) =>
        Number(snapshot.mesAnio.slice(0, 4)),
      ),
    ]),
  ).sort((left, right) => right - left);

  return (
    <StyledParksPageStack>
      <StyledToolbar>
        <StyledToolbarCopy>
          <StyledToolbarTitle>{t`Panel Ejecutivo CEO`}</StyledToolbarTitle>
          <StyledToolbarHint>
            {t`Indicadores consolidados · Comercial / Legal / CxC`}
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

      <StyledFilters>
        <StyledFilterSelect
          value={String(year)}
          onChange={(event) => setYear(Number(event.target.value))}
          aria-label={t`Año`}
        >
          {yearOptions.map((yearOption) => (
            <option key={yearOption} value={yearOption}>
              {yearOption}
            </option>
          ))}
        </StyledFilterSelect>
        <StyledFilterSelect
          value={String(month)}
          onChange={(event) => setMonth(Number(event.target.value))}
          aria-label={t`Mes`}
        >
          {MONTH_OPTIONS.map((monthOption) => (
            <option key={monthOption.value} value={monthOption.value}>
              {monthOption.label}
            </option>
          ))}
        </StyledFilterSelect>
        <ParksSegmentedControl
          options={PARKS_PORTFOLIO_SEGMENTS.map((segment) => ({
            id: segment,
            label: segment,
          }))}
          value={segmento}
          onChange={(next) => setSegmento(next as ParksPortfolioSegment)}
        />
      </StyledFilters>

      {error ? <StyledError>{error}</StyledError> : null}

      <ParksPortfolioByParkSection />

      {view === 'ejecutivo' ? (
        <ParksCeoExecutiveIndicatorsView
          indicators={data.indicators}
          pendingActions={data.inbox.total}
        />
      ) : null}

      {view === 'diario' ? (
        <ParksCeoDailyView
          daily={data.daily}
          asOfDate={data.asOfDate}
          pendingActions={data.inbox.total}
        />
      ) : null}

      {view === 'consejo' ? <ParksCeoBoardView board={data.board} /> : null}

      <ParksCeoComisionesSnapshot />

      {view !== 'ejecutivo' ? (
        <ParksCeoKpiCatalog items={data.kpisCatalog} />
      ) : null}
    </StyledParksPageStack>
  );
};
