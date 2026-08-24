import { styled } from '@linaria/react';
import { t } from '@lingui/core/macro';
import { Link } from 'react-router-dom';
import { IconRefresh } from 'twenty-ui/icon';
import { Button } from 'twenty-ui/input';
import { themeCssVariables } from 'twenty-ui/theme-constants';

import { ParksCeoAttentionBoard } from '@/parks-industrial/components/dashboard/ParksCeoAttentionBoard';
import { ParksCeoBoardView } from '@/parks-industrial/components/dashboard/ParksCeoBoardView';
import { ParksCeoComisionesSnapshot } from '@/parks-industrial/components/dashboard/ParksCeoComisionesSnapshot';
import { ParksCeoCommandHero } from '@/parks-industrial/components/dashboard/ParksCeoCommandHero';
import { ParksCeoExecutiveIndicatorsView } from '@/parks-industrial/components/dashboard/ParksCeoExecutiveIndicatorsView';
import { ParksCeoHoyCharts } from '@/parks-industrial/components/dashboard/ParksCeoHoyCharts';
import { ParksCeoParkCards } from '@/parks-industrial/components/portfolio/ParksCeoParkCards';
import { ParksEmptyState } from '@/parks-industrial/components/ui/ParksEmptyState';
import { ParksLoadingSkeleton } from '@/parks-industrial/components/ui/ParksLoadingSkeleton';
import { StyledParksPageStack } from '@/parks-industrial/components/ui/ParksSectionCard';
import { ParksSegmentedControl } from '@/parks-industrial/components/ui/ParksSegmentedControl';
import { ParksStatusBadge } from '@/parks-industrial/components/ui/ParksStatusBadge';
import {
  StyledParksSelect,
} from '@/parks-industrial/components/ui/parks-form-control.styles';
import { PARKS_MIS_PENDIENTES_PATH } from '@/parks-industrial/constants/parks-routes.constants';
import { useParksCeoCommandMetrics } from '@/parks-industrial/hooks/useParksCeoCommandMetrics';
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
    refresh,
  } = useParksCeoExecutiveDashboard();
  const {
    command,
    legalCases,
    cxcPriorityAccounts,
    refreshSideMetrics,
  } = useParksCeoCommandMetrics();

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
            onClick={() => {
              void refresh();
              void refreshSideMetrics();
            }}
          />
        }
      />
    );
  }

  const viewOptions = [
    { id: 'hoy' as const, label: t`Hoy` },
    { id: 'portafolio' as const, label: t`Portafolio` },
    { id: 'finanzas' as const, label: t`Finanzas` },
    { id: 'tiempos' as const, label: t`Tiempos y carga` },
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
          <StyledToolbarTitle>{t`Command Center CEO`}</StyledToolbarTitle>
          <StyledToolbarHint>
            {t`Una pantalla por área: inventario, dinero, tiempos y lo que pide decisión hoy.`}
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
            onClick={() => {
              void refresh();
              void refreshSideMetrics();
            }}
          />
        </StyledToolbarActions>
      </StyledToolbar>

      {view !== 'hoy' ? (
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
        </StyledFilters>
      ) : null}

      {error ? <StyledError>{error}</StyledError> : null}

      {view === 'hoy' ? (
        <>
          <ParksCeoCommandHero command={command} />
          <ParksCeoHoyCharts board={data.board} daily={data.daily} />
          <ParksCeoAttentionBoard
            command={command}
            legalCases={legalCases}
            cxcPriorityAccounts={cxcPriorityAccounts}
          />
        </>
      ) : null}

      {view === 'portafolio' ? (
        <>
          <ParksCeoParkCards />
          <ParksCeoBoardView board={data.board} sections={['portafolio']} />
        </>
      ) : null}

      {view === 'finanzas' ? (
        <>
          <ParksCeoBoardView
            board={data.board}
            sections={['ingresos', 'cobranza']}
          />
          <ParksCeoExecutiveIndicatorsView
            indicators={data.indicators}
            pendingActions={data.inbox.total}
          />
          <ParksCeoComisionesSnapshot />
        </>
      ) : null}

      {view === 'tiempos' ? (
        <ParksCeoBoardView
          board={data.board}
          sections={['retencion', 'operacion']}
        />
      ) : null}
    </StyledParksPageStack>
  );
};
