import { styled } from '@linaria/react';
import { t } from '@lingui/core/macro';
import { Link } from 'react-router-dom';
import { AppPath } from 'twenty-shared/types';
import { getAppPath } from 'twenty-shared/utils';
import {
  IconAlertTriangle,
  IconBox,
  IconBuildingSkyscraper,
  IconChartBar,
  IconCurrencyDollar,
  IconTarget,
} from 'twenty-ui/icon';
import { UndecoratedLink } from 'twenty-ui/navigation';
import { MOBILE_VIEWPORT, themeCssVariables } from 'twenty-ui/theme-constants';

import { ParksAiQuickActions } from '@/parks-industrial/components/ai/ParksAiQuickActions';
import { ParksDashboardColumnChart } from '@/parks-industrial/components/dashboard/charts/ParksDashboardColumnChart';
import { ParksDashboardDonutChart } from '@/parks-industrial/components/dashboard/charts/ParksDashboardDonutChart';
import { ParksDashboardHorizontalBars } from '@/parks-industrial/components/dashboard/charts/ParksDashboardHorizontalBars';
import { ParksDashboardPipelineFunnel } from '@/parks-industrial/components/dashboard/charts/ParksDashboardPipelineFunnel';
import { ParksDashboardRegionalCards } from '@/parks-industrial/components/dashboard/charts/ParksDashboardRegionalCards';
import { ParksEmptyState } from '@/parks-industrial/components/ui/ParksEmptyState';
import { ParksLoadingSkeleton } from '@/parks-industrial/components/ui/ParksLoadingSkeleton';
import { ParksMetricCard } from '@/parks-industrial/components/ui/ParksMetricCard';
import {
  ParksSectionCard,
  StyledParksPageStack,
  StyledParksTwoColumnGrid,
} from '@/parks-industrial/components/ui/ParksSectionCard';
import { ParksStatusBadge } from '@/parks-industrial/components/ui/ParksStatusBadge';
import { getParksPipelineStageLabel } from '@/parks-industrial/constants/parks-industrial.constants';
import {
  buildParksVencimientosPorMes,
  useParksDashboardMetrics,
} from '@/parks-industrial/hooks/useParksRecords';
import { buildParksDashboardQuickActions } from '@/parks-industrial/utils/parks-ai-quick-actions.util';
import { getParksDashboardVencimientoBarColor } from '@/parks-industrial/utils/parks-dashboard-charts.util';
import {
  formatParksDate,
  formatParksNumber,
  formatParksUsd,
  getParksAmountFromMicros,
  getParksStackingStatusColor,
} from '@/parks-industrial/utils/parks-format.util';
import { getParksOcupacionMetricAccent } from '@/parks-industrial/utils/parks-portfolio-metrics.util';

const StyledMetricsGrid = styled.div`
  display: grid;
  gap: ${themeCssVariables.spacing[3]};
  grid-template-columns: repeat(auto-fit, minmax(190px, 1fr));
`;

const StyledHeroCard = styled.div`
  background: linear-gradient(
    135deg,
    ${themeCssVariables.color.green1} 0%,
    ${themeCssVariables.background.primary} 45%,
    ${themeCssVariables.color.blue1} 100%
  );
  border: 1px solid ${themeCssVariables.color.green3};
  border-radius: ${themeCssVariables.border.radius.md};
  display: grid;
  gap: ${themeCssVariables.spacing[4]};
  padding: ${themeCssVariables.spacing[4]};

  @media (min-width: ${MOBILE_VIEWPORT}px) {
    align-items: center;
    grid-template-columns: 1.2fr 1fr;
  }
`;

const StyledHeroCopy = styled.div`
  display: flex;
  flex-direction: column;
  gap: ${themeCssVariables.spacing[2]};
`;

const StyledHeroTitle = styled.h3`
  font-size: ${themeCssVariables.font.size.lg};
  font-weight: ${themeCssVariables.font.weight.semiBold};
  margin: 0;
`;

const StyledHeroText = styled.p`
  color: ${themeCssVariables.font.color.secondary};
  font-size: ${themeCssVariables.font.size.sm};
  line-height: 1.5;
  margin: 0;
`;

const StyledHeroStats = styled.div`
  display: grid;
  gap: ${themeCssVariables.spacing[2]};
  grid-template-columns: repeat(2, minmax(0, 1fr));
`;

const StyledHeroStat = styled.div`
  background: ${themeCssVariables.background.primary};
  border: 1px solid ${themeCssVariables.border.color.light};
  border-radius: ${themeCssVariables.border.radius.sm};
  padding: ${themeCssVariables.spacing[2]};
`;

const StyledHeroStatLabel = styled.div`
  color: ${themeCssVariables.font.color.tertiary};
  font-size: ${themeCssVariables.font.size.xs};
`;

const StyledHeroStatValue = styled.div`
  font-size: ${themeCssVariables.font.size.md};
  font-weight: ${themeCssVariables.font.weight.semiBold};
  margin-top: 4px;
`;

const StyledAlertCard = styled.div`
  background: ${themeCssVariables.color.red1};
  border: 1px solid ${themeCssVariables.color.red3};
  border-radius: ${themeCssVariables.border.radius.sm};
  margin-top: ${themeCssVariables.spacing[2]};
  padding: ${themeCssVariables.spacing[2]};
`;

const StyledDealCard = styled.div`
  border: 1px solid ${themeCssVariables.border.color.medium};
  border-radius: ${themeCssVariables.border.radius.sm};
  margin-top: ${themeCssVariables.spacing[2]};
  padding: ${themeCssVariables.spacing[2]};
`;

const StyledDealHeader = styled.div`
  align-items: center;
  display: flex;
  gap: ${themeCssVariables.spacing[2]};
  justify-content: space-between;
`;

const StyledDealMeta = styled.div`
  color: ${themeCssVariables.font.color.secondary};
  font-size: ${themeCssVariables.font.size.xs};
  margin-top: ${themeCssVariables.spacing[1]};
`;

const StyledBottomGrid = styled.div`
  display: grid;
  gap: ${themeCssVariables.spacing[4]};

  @media (min-width: ${MOBILE_VIEWPORT}px) {
    grid-template-columns: 1fr 1fr;
  }
`;

export const ParksDashboardContent = () => {
  const { metrics, charts, expedientes, loading } = useParksDashboardMetrics();
  const vencimientos = buildParksVencimientosPorMes(expedientes);

  if (loading) {
    return <ParksLoadingSkeleton variant="dashboard" />;
  }

  const vencimientoChartItems = vencimientos.map((item) => ({
    id: item.mes,
    label: item.mes,
    value: item.contratos,
    color: getParksDashboardVencimientoBarColor(item.contratos),
  }));

  const ingresosRegionItems = charts.ingresosPorRegion.map((region) => ({
    id: region.regionId,
    label: region.label,
    value: region.ingresosMensuales,
    displayValue: formatParksUsd(region.ingresosMensuales),
    color: themeCssVariables.color.green,
    meta: t`${region.contratosActivos} contratos activos`,
  }));

  const topParqueItems = charts.topParques.map((parque) => ({
    id: parque.id,
    label: parque.nombre,
    value: parque.ocupacion,
    displayValue: `${parque.ocupacion}%`,
    color:
      parque.ocupacion >= 85
        ? getParksStackingStatusColor('green')
        : themeCssVariables.color.blue,
    meta: `${formatParksNumber(parque.m2Rentados)} / ${formatParksNumber(parque.m2Totales)} m²`,
  }));

  return (
    <StyledParksPageStack>
      <ParksAiQuickActions actions={buildParksDashboardQuickActions()} />

      <StyledHeroCard>
        <StyledHeroCopy>
          <StyledHeroTitle>{t`Resumen ejecutivo de cartera`}</StyledHeroTitle>
          <StyledHeroText>
            {t`Vista consolidada de ocupación, ingresos, pipeline comercial y riesgos de vencimiento para el grupo Parks Industrial.`}
          </StyledHeroText>
          <StyledHeroStats>
            <StyledHeroStat>
              <StyledHeroStatLabel>{t`Parques en cartera`}</StyledHeroStatLabel>
              <StyledHeroStatValue>{metrics.parqueCount}</StyledHeroStatValue>
            </StyledHeroStat>
            <StyledHeroStat>
              <StyledHeroStatLabel>{t`Superficie total`}</StyledHeroStatLabel>
              <StyledHeroStatValue>
                {formatParksNumber(metrics.m2Totales)} m²
              </StyledHeroStatValue>
            </StyledHeroStat>
            <StyledHeroStat>
              <StyledHeroStatLabel>{t`Pipeline activo`}</StyledHeroStatLabel>
              <StyledHeroStatValue>
                {formatParksUsd(metrics.pipelineValueUsd)}
              </StyledHeroStatValue>
            </StyledHeroStat>
            <StyledHeroStat>
              <StyledHeroStatLabel>{t`Deals en curso`}</StyledHeroStatLabel>
              <StyledHeroStatValue>{metrics.pipelineActiveDeals}</StyledHeroStatValue>
            </StyledHeroStat>
          </StyledHeroStats>
        </StyledHeroCopy>
        <ParksDashboardDonutChart
          slices={charts.ocupacionSlices}
          centerLabel={t`Ocupación`}
          centerValue={`${metrics.ocupacion}%`}
        />
      </StyledHeroCard>

      <StyledMetricsGrid>
        <ParksMetricCard
          label={t`m² rentados / disponibles`}
          value={`${formatParksNumber(metrics.m2Rentados)} / ${formatParksNumber(metrics.m2Disponibles)}`}
          icon={IconBuildingSkyscraper}
          accent="blue"
        />
        <ParksMetricCard
          label={t`Tasa de ocupación`}
          value={`${metrics.ocupacion}%`}
          icon={IconChartBar}
          accent={getParksOcupacionMetricAccent(metrics.ocupacion)}
          trend={t`Consolidado del grupo`}
        />
        <ParksMetricCard
          label={t`Ingresos mensuales estimados`}
          value={formatParksUsd(metrics.ingresosMensuales)}
          icon={IconCurrencyDollar}
          accent="gray"
        />
        <ParksMetricCard
          label={t`Naves disponibles`}
          value={metrics.navesDisponibles}
          icon={IconBox}
          accent="green"
          trend={`${formatParksNumber(metrics.m2CatalogoDisponible)} m² en catálogo`}
        />
        <ParksMetricCard
          label={t`Contratos por vencer (90 días)`}
          value={metrics.contratosPorVencer}
          icon={IconAlertTriangle}
          accent={metrics.contratosPorVencer > 0 ? 'red' : 'green'}
        />
        <ParksMetricCard
          label={t`Valor pipeline activo`}
          value={formatParksUsd(metrics.pipelineValueUsd)}
          icon={IconTarget}
          accent="yellow"
          trend={t`${metrics.pipelineActiveDeals} oportunidades`}
        />
      </StyledMetricsGrid>

      {charts.regionalSummaries.length > 0 ? (
        <ParksSectionCard title={t`Desempeño por región`}>
          <ParksDashboardRegionalCards regions={charts.regionalSummaries} />
        </ParksSectionCard>
      ) : null}

      <StyledParksTwoColumnGrid>
        <ParksSectionCard title={t`Vencimientos por mes`}>
          {vencimientos.every((item) => item.contratos === 0) ? (
            <ParksEmptyState title={t`Sin vencimientos en los próximos 12 meses`} />
          ) : (
            <ParksDashboardColumnChart items={vencimientoChartItems} />
          )}
        </ParksSectionCard>

        <ParksSectionCard title={t`Ingresos por región`}>
          {ingresosRegionItems.length === 0 ? (
            <ParksEmptyState title={t`Sin ingresos activos por región`} />
          ) : (
            <ParksDashboardHorizontalBars items={ingresosRegionItems} />
          )}
        </ParksSectionCard>
      </StyledParksTwoColumnGrid>

      <StyledParksTwoColumnGrid>
        <ParksSectionCard title={t`Estado de naves`}>
          {charts.naveStatusSlices.length === 0 ? (
            <ParksEmptyState title={t`Sin naves registradas`} />
          ) : (
            <ParksDashboardDonutChart
              slices={charts.naveStatusSlices}
              centerLabel={t`Naves`}
              centerValue={String(
                charts.naveStatusSlices.reduce(
                  (total, slice) => total + slice.value,
                  0,
                ),
              )}
            />
          )}
        </ParksSectionCard>

        <ParksSectionCard title={t`Embudo comercial`}>
          {charts.pipelineStages.every((stage) => stage.count === 0) ? (
            <ParksEmptyState title={t`Sin deals en pipeline`} />
          ) : (
            <ParksDashboardPipelineFunnel stages={charts.pipelineStages} />
          )}
        </ParksSectionCard>
      </StyledParksTwoColumnGrid>

      <StyledBottomGrid>
        <ParksSectionCard title={t`Top parques por ocupación`}>
          {topParqueItems.length === 0 ? (
            <ParksEmptyState title={t`No hay parques registrados`} />
          ) : (
            <ParksDashboardHorizontalBars items={topParqueItems} />
          )}
        </ParksSectionCard>

        <ParksSectionCard
          title={t`Alertas de vencimiento`}
          action={
            <Link to={AppPath.ParksRenovaciones} style={{ fontSize: 12 }}>
              {t`Ver renovaciones`}
            </Link>
          }
        >
          {metrics.alertas.length === 0 ? (
            <ParksEmptyState title={t`Sin alertas críticas`} />
          ) : (
            metrics.alertas.map((expediente) => (
              <StyledAlertCard key={expediente.id}>
                <div>{expediente.inquilino?.empresa ?? t`Inquilino`}</div>
                <StyledDealMeta>
                  {t`Vence`} {formatParksDate(expediente.fechaVencimiento)}
                </StyledDealMeta>
                <UndecoratedLink
                  to={getAppPath(AppPath.ParksContratoAprobacion, {
                    contratoId: expediente.casoLegal?.id ?? expediente.id,
                  })}
                >
                  <span style={{ fontSize: 12 }}>{t`Ver contrato`}</span>
                </UndecoratedLink>
              </StyledAlertCard>
            ))
          )}
        </ParksSectionCard>
      </StyledBottomGrid>

      <ParksSectionCard
        title={t`Pipeline activo`}
        action={
          <Link to={AppPath.ParksPipeline} style={{ fontSize: 12 }}>
            {t`Ver pipeline`}
          </Link>
        }
      >
        {metrics.recentDeals.length === 0 ? (
          <ParksEmptyState title={t`No hay deals activos`} />
        ) : (
          metrics.recentDeals.map((deal) => (
            <StyledDealCard key={deal.id}>
              <StyledDealHeader>
                <strong>{deal.name}</strong>
                <ParksStatusBadge
                  color="blue"
                  label={getParksPipelineStageLabel(deal.stage)}
                />
              </StyledDealHeader>
              <StyledDealMeta>
                {deal.naveVinculada?.identificador ?? t`Sin nave`} ·{' '}
                {formatParksUsd(getParksAmountFromMicros(deal.amount?.amountMicros))}
              </StyledDealMeta>
            </StyledDealCard>
          ))
        )}
      </ParksSectionCard>
    </StyledParksPageStack>
  );
};
