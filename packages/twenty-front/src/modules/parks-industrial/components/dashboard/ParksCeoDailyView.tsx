import { styled } from '@linaria/react';
import { t } from '@lingui/core/macro';
import { Link } from 'react-router-dom';
import { AppPath } from 'twenty-shared/types';
import {
  IconAlertTriangle,
  IconArrowRight,
  IconClock,
  IconTarget,
} from 'twenty-ui/icon';
import { MOBILE_VIEWPORT, themeCssVariables } from 'twenty-ui/theme-constants';

import { ParksMetricCard } from '@/parks-industrial/components/ui/ParksMetricCard';
import { ParksPageHero } from '@/parks-industrial/components/ui/ParksPageHero';
import {
  ParksSectionCard,
  StyledParksTwoColumnGrid,
} from '@/parks-industrial/components/ui/ParksSectionCard';
import { type ParksCeoDailyKpis } from '@/parks-industrial/types/parks-ceo-dashboard.types';
import { formatParksNumber } from '@/parks-industrial/utils/parks-format.util';

type ParksCeoDailyViewProps = {
  daily: ParksCeoDailyKpis;
  asOfDate: string;
  pendingActions?: number;
};

const formatMxnCompact = (value: number): string => {
  if (Math.abs(value) >= 1_000_000) {
    return `$${(value / 1_000_000).toFixed(1)}M`;
  }

  if (Math.abs(value) >= 1_000) {
    return `$${(value / 1_000).toFixed(0)}K`;
  }

  return `$${formatParksNumber(value)}`;
};

const formatDelta = (value: number, unit: 'pts' | '%'): string => {
  const sign = value > 0 ? '+' : '';
  return `${sign}${value}${unit === 'pts' ? ' pts' : '%'}`;
};

const StyledStack = styled.div`
  display: flex;
  flex-direction: column;
  gap: ${themeCssVariables.spacing[4]};
`;

const StyledMetricsGrid = styled.div`
  display: grid;
  gap: ${themeCssVariables.spacing[3]};
  grid-template-columns: repeat(auto-fit, minmax(160px, 1fr));
`;

const StyledAlertList = styled.div`
  display: flex;
  flex-direction: column;
  gap: ${themeCssVariables.spacing[2]};
`;

const StyledAlertRow = styled(Link)<{ severity: string }>`
  align-items: flex-start;
  background: ${themeCssVariables.background.primary};
  border: 1px solid ${themeCssVariables.border.color.light};
  border-left: 3px solid
    ${({ severity }) =>
      severity === 'critical'
        ? themeCssVariables.color.red
        : themeCssVariables.color.yellow};
  border-radius: ${themeCssVariables.border.radius.sm};
  color: inherit;
  display: flex;
  gap: ${themeCssVariables.spacing[2]};
  padding: ${themeCssVariables.spacing[3]};
  text-decoration: none;

  &:hover {
    border-color: ${themeCssVariables.border.color.medium};
  }
`;

const StyledAlertBody = styled.div`
  display: flex;
  flex: 1;
  flex-direction: column;
  gap: 4px;
  min-width: 0;
`;

const StyledAlertTitle = styled.div`
  font-size: ${themeCssVariables.font.size.sm};
  font-weight: ${themeCssVariables.font.weight.semiBold};
`;

const StyledAlertDetail = styled.div`
  color: ${themeCssVariables.font.color.secondary};
  font-size: ${themeCssVariables.font.size.xs};
  line-height: 1.4;
`;

const StyledBucketGrid = styled.div`
  display: grid;
  gap: ${themeCssVariables.spacing[2]};
  grid-template-columns: 1fr;

  @media (min-width: ${MOBILE_VIEWPORT}px) {
    grid-template-columns: repeat(2, minmax(0, 1fr));
  }
`;

const StyledBucket = styled.div`
  background: ${themeCssVariables.background.primary};
  border: 1px solid ${themeCssVariables.border.color.light};
  border-radius: ${themeCssVariables.border.radius.sm};
  display: flex;
  flex-direction: column;
  gap: 4px;
  padding: ${themeCssVariables.spacing[3]};
`;

const StyledBucketLabel = styled.div`
  color: ${themeCssVariables.font.color.secondary};
  font-size: ${themeCssVariables.font.size.xs};
`;

const StyledBucketValue = styled.div`
  font-size: ${themeCssVariables.font.size.lg};
  font-weight: ${themeCssVariables.font.weight.semiBold};
`;

export const ParksCeoDailyView = ({
  daily,
  asOfDate,
  pendingActions = 0,
}: ParksCeoDailyViewProps) => {
  const todayLabel = new Date().toLocaleDateString('es-MX', {
    day: 'numeric',
    month: 'long',
    year: 'numeric',
  });

  return (
    <StyledStack>
      <ParksPageHero
        eyebrow={t`Dashboard diario`}
        title={t`Parks Industrial`}
        subtitle={`${todayLabel} · ${t`Snapshot`} ${asOfDate}${
          pendingActions > 0
            ? ` · ${pendingActions} ${t`acciones pendientes`}`
            : ''
        }`}
        actions={[
          {
            to: AppPath.ParksMisPendientes,
            label:
              pendingActions > 0
                ? t`Mis pendientes (${pendingActions})`
                : t`Mis pendientes`,
          },
          {
            to: AppPath.ParksStackingPlanIndex,
            label: t`Inventario por parque`,
          },
          {
            to: AppPath.ParksLegalDashboard,
            label: t`Dashboard legal`,
          },
        ]}
        stats={[
          {
            label: t`Ocupación`,
            value: `${daily.ocupacionPct}%`,
            hint: `${formatDelta(daily.ocupacionDeltaPts, 'pts')} vs mes ant`,
          },
          {
            label: t`MRR`,
            value: `${formatMxnCompact(daily.mrrMxn)} MXN`,
            hint: `${formatDelta(daily.mrrDeltaPct, '%')} vs mes ant`,
          },
          {
            label: t`Cobranza mes`,
            value: `${daily.cobranzaMesPct}%`,
            hint: `${formatDelta(daily.cobranzaDeltaPts, 'pts')} vs mes ant`,
          },
          {
            label: t`Pipeline`,
            value: String(daily.pipelineDeals),
            hint: `${formatParksNumber(daily.pipelineM2)} m²`,
          },
        ]}
      />

      <StyledMetricsGrid>
        <ParksMetricCard
          label={t`Holdovers`}
          value={daily.holdoversCount}
          accent="yellow"
          icon={IconClock}
          trend={`${formatMxnCompact(daily.holdoverMontoAcumulado)} · ${daily.holdoverDiasPromedio}d`}
        />
        <ParksMetricCard
          label={t`Cartera +90`}
          value={formatMxnCompact(daily.carteraMas90)}
          accent="red"
          icon={IconAlertTriangle}
        />
        <ParksMetricCard
          label={t`MRR ponderado`}
          value={formatMxnCompact(daily.pipelineMrrPonderado)}
          accent="purple"
          icon={IconTarget}
        />
      </StyledMetricsGrid>

      <StyledParksTwoColumnGrid>
        <ParksSectionCard title={t`Alertas`} accent="red">
          <StyledAlertList>
            {daily.alertas.map((alerta) => (
              <StyledAlertRow
                key={alerta.id}
                to={alerta.actionPath ?? '/parks/dashboard'}
                severity={alerta.severity}
              >
                <IconAlertTriangle size={16} />
                <StyledAlertBody>
                  <StyledAlertTitle>{alerta.title}</StyledAlertTitle>
                  <StyledAlertDetail>{alerta.detail}</StyledAlertDetail>
                </StyledAlertBody>
                <IconArrowRight size={14} />
              </StyledAlertRow>
            ))}
          </StyledAlertList>
        </ParksSectionCard>

        <ParksSectionCard title={t`Contratos por vencer`} accent="orange">
          <StyledBucketGrid>
            {daily.vencimientos.map((bucket) => (
              <StyledBucket key={bucket.dias}>
                <StyledBucketLabel>{t`${bucket.dias} días`}</StyledBucketLabel>
                <StyledBucketValue>
                  {bucket.contratos} {t`contratos`}
                </StyledBucketValue>
                <StyledAlertDetail>
                  {formatParksNumber(bucket.m2EnRiesgo)} m² ·{' '}
                  {formatMxnCompact(bucket.revenueEnRiesgoAnual)} MXN/año
                </StyledAlertDetail>
              </StyledBucket>
            ))}
          </StyledBucketGrid>
        </ParksSectionCard>
      </StyledParksTwoColumnGrid>
    </StyledStack>
  );
};
