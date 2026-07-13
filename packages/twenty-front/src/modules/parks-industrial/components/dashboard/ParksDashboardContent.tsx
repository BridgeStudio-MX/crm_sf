import { styled } from '@linaria/react';
import { t } from '@lingui/core/macro';
import { Link } from 'react-router-dom';
import { AppPath } from 'twenty-shared/types';
import {
  IconAlertTriangle,
  IconBox,
  IconBuildingSkyscraper,
  IconChartBar,
  IconCurrencyDollar,
  IconTarget,
} from 'twenty-ui/icon';
import { MOBILE_VIEWPORT, themeCssVariables } from 'twenty-ui/theme-constants';

import { ParksAiQuickActions } from '@/parks-industrial/components/ai/ParksAiQuickActions';
import { ParksCemDirectorDashboard } from '@/parks-industrial/components/dashboard/ParksCemDirectorDashboard';
import { ParksCemQueueSection } from '@/parks-industrial/components/dashboard/ParksCemQueueSection';
import { ParksDashboardAlertCard } from '@/parks-industrial/components/dashboard/ParksDashboardAlertCard';
import { ParksDashboardDealCard } from '@/parks-industrial/components/dashboard/ParksDashboardDealCard';
import {
  ParksDashboardFeaturedMetric,
  ParksDashboardFeaturedMetrics,
} from '@/parks-industrial/components/dashboard/ParksDashboardFeaturedMetrics';
import { ParksDashboardHero } from '@/parks-industrial/components/dashboard/ParksDashboardHero';
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
import {
  buildParksVencimientosPorMes,
  useParksDashboardMetrics,
} from '@/parks-industrial/hooks/useParksRecords';
import { buildParksDashboardQuickActions } from '@/parks-industrial/utils/parks-ai-quick-actions.util';
import { getParksDashboardVencimientoBarColor } from '@/parks-industrial/utils/parks-dashboard-charts.util';
import {
  formatParksNumber,
  formatParksUsd,
  getParksStackingStatusColor,
} from '@/parks-industrial/utils/parks-format.util';
import { getParksOcupacionMetricAccent } from '@/parks-industrial/utils/parks-portfolio-metrics.util';

const StyledMetricsGrid = styled.div`
  display: grid;
  gap: ${themeCssVariables.spacing[3]};
  grid-template-columns: repeat(auto-fit, minmax(190px, 1fr));
`;

const StyledBentoGrid = styled.div`
  display: grid;
  gap: ${themeCssVariables.spacing[4]};

  @media (min-width: ${MOBILE_VIEWPORT}px) {
    grid-template-columns: 1.2fr 0.8fr;
  }
`;

const StyledCardGrid = styled.div`
  display: grid;
  gap: ${themeCssVariables.spacing[3]};
  grid-template-columns: repeat(auto-fill, minmax(260px, 1fr));
`;

const StyledSectionLink = styled(Link)`
  color: ${themeCssVariables.color.blue};
  font-size: ${themeCssVariables.font.size.sm};
  font-weight: ${themeCssVariables.font.weight.medium};
  text-decoration: none;

  &:hover {
    text-decoration: underline;
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
      <ParksDashboardHero
        ocupacion={metrics.ocupacion}
        ocupacionSlices={charts.ocupacionSlices}
        parqueCount={metrics.parqueCount}
        m2Totales={metrics.m2Totales}
        pipelineValueUsd={metrics.pipelineValueUsd}
        pipelineActiveDeals={metrics.pipelineActiveDeals}
        ingresosMensuales={metrics.ingresosMensuales}
      />

      <ParksDashboardFeaturedMetrics>
        <ParksDashboardFeaturedMetric
          label={t`Tasa de ocupación`}
          value={`${metrics.ocupacion}%`}
          hint={t`Consolidado del grupo`}
          icon={IconChartBar}
          accent={getParksOcupacionMetricAccent(metrics.ocupacion)}
        />
        <ParksDashboardFeaturedMetric
          label={t`Ingresos mensuales`}
          value={formatParksUsd(metrics.ingresosMensuales)}
          hint={t`Estimado de cartera activa`}
          icon={IconCurrencyDollar}
          accent="green"
        />
        <ParksDashboardFeaturedMetric
          label={t`Valor pipeline`}
          value={formatParksUsd(metrics.pipelineValueUsd)}
          hint={t`${metrics.pipelineActiveDeals} oportunidades activas`}
          icon={IconTarget}
          accent="blue"
        />
      </ParksDashboardFeaturedMetrics>

      <ParksAiQuickActions actions={buildParksDashboardQuickActions()} />

      <ParksCemQueueSection />
      <ParksCemDirectorDashboard />

      <StyledMetricsGrid>
        <ParksMetricCard
          label={t`m² rentados / disponibles`}
          value={`${formatParksNumber(metrics.m2Rentados)} / ${formatParksNumber(metrics.m2Disponibles)}`}
          icon={IconBuildingSkyscraper}
          accent="blue"
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
          label={t`Deals en curso`}
          value={metrics.pipelineActiveDeals}
          icon={IconTarget}
          accent="yellow"
          trend={formatParksUsd(metrics.pipelineValueUsd)}
        />
      </StyledMetricsGrid>

      {charts.regionalSummaries.length > 0 ? (
        <ParksSectionCard title={t`Desempeño por región`} accent="sky">
          <ParksDashboardRegionalCards regions={charts.regionalSummaries} />
        </ParksSectionCard>
      ) : null}

      <StyledBentoGrid>
        <ParksSectionCard title={t`Embudo comercial`} accent="purple">
          {charts.pipelineStages.every((stage) => stage.count === 0) ? (
            <ParksEmptyState title={t`Sin deals en pipeline`} />
          ) : (
            <ParksDashboardPipelineFunnel stages={charts.pipelineStages} />
          )}
        </ParksSectionCard>

        <ParksSectionCard title={t`Estado de naves`} accent="turquoise">
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
      </StyledBentoGrid>

      <StyledParksTwoColumnGrid>
        <ParksSectionCard title={t`Vencimientos por mes`} accent="orange">
          {vencimientos.every((item) => item.contratos === 0) ? (
            <ParksEmptyState title={t`Sin vencimientos en los próximos 12 meses`} />
          ) : (
            <ParksDashboardColumnChart items={vencimientoChartItems} />
          )}
        </ParksSectionCard>

        <ParksSectionCard title={t`Ingresos por región`} accent="green">
          {ingresosRegionItems.length === 0 ? (
            <ParksEmptyState title={t`Sin ingresos activos por región`} />
          ) : (
            <ParksDashboardHorizontalBars items={ingresosRegionItems} />
          )}
        </ParksSectionCard>
      </StyledParksTwoColumnGrid>

      <StyledParksTwoColumnGrid>
        <ParksSectionCard title={t`Top parques por ocupación`} accent="blue">
          {topParqueItems.length === 0 ? (
            <ParksEmptyState title={t`No hay parques registrados`} />
          ) : (
            <ParksDashboardHorizontalBars items={topParqueItems} />
          )}
        </ParksSectionCard>

        <ParksSectionCard
          title={t`Alertas de vencimiento`}
          accent="red"
          action={
            <StyledSectionLink to={AppPath.ParksRenovaciones}>
              {t`Ver renovaciones`}
            </StyledSectionLink>
          }
        >
          {metrics.alertas.length === 0 ? (
            <ParksEmptyState title={t`Sin alertas críticas`} />
          ) : (
            <StyledCardGrid>
              {metrics.alertas.map((expediente) => (
                <ParksDashboardAlertCard
                  key={expediente.id}
                  empresa={expediente.inquilino?.empresa ?? t`Inquilino`}
                  fechaVencimiento={expediente.fechaVencimiento}
                  contratoId={expediente.casoLegal?.id ?? expediente.id}
                />
              ))}
            </StyledCardGrid>
          )}
        </ParksSectionCard>
      </StyledParksTwoColumnGrid>

      <ParksSectionCard
        title={t`Pipeline activo`}
        accent="blue"
        action={
          <StyledSectionLink to={AppPath.ParksPipeline}>
            {t`Ver pipeline completo`}
          </StyledSectionLink>
        }
      >
        {metrics.recentDeals.length === 0 ? (
          <ParksEmptyState title={t`No hay deals activos`} />
        ) : (
          <StyledCardGrid>
            {metrics.recentDeals.map((deal) => (
              <ParksDashboardDealCard key={deal.id} deal={deal} />
            ))}
          </StyledCardGrid>
        )}
      </ParksSectionCard>
    </StyledParksPageStack>
  );
};
