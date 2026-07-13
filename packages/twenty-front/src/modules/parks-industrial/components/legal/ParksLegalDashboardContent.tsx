import { styled } from '@linaria/react';
import { t } from '@lingui/core/macro';
import { useCallback, useEffect, useMemo, useState } from 'react';
import { Link } from 'react-router-dom';
import { AppPath } from 'twenty-shared/types';
import {
  IconAlertTriangle,
  IconClock,
  IconDownload,
  IconRefresh,
  IconShield,
  IconTarget,
  IconUsers,
} from 'twenty-ui/icon';
import { Button } from 'twenty-ui/input';
import { MOBILE_VIEWPORT, themeCssVariables } from 'twenty-ui/theme-constants';

import {
  ParksDashboardFeaturedMetric,
  ParksDashboardFeaturedMetrics,
} from '@/parks-industrial/components/dashboard/ParksDashboardFeaturedMetrics';
import { ParksDashboardHorizontalBars } from '@/parks-industrial/components/dashboard/charts/ParksDashboardHorizontalBars';
import { ParksLegalDashboardCaseCard } from '@/parks-industrial/components/legal/ParksLegalDashboardCaseCard';
import { ParksLegalDashboardHero } from '@/parks-industrial/components/legal/ParksLegalDashboardHero';
import { ParksEmptyState } from '@/parks-industrial/components/ui/ParksEmptyState';
import { ParksLoadingSkeleton } from '@/parks-industrial/components/ui/ParksLoadingSkeleton';
import { ParksMetricCard } from '@/parks-industrial/components/ui/ParksMetricCard';
import {
  ParksSectionCard,
  StyledParksPageStack,
} from '@/parks-industrial/components/ui/ParksSectionCard';
import { StyledParksSelect } from '@/parks-industrial/components/ui/parks-form-control.styles';
import { LEGAL_LAWYER_OPTIONS } from '@/parks-industrial/constants/parks-legal-workflow.constants';
import { PARKS_BRAND } from '@/parks-industrial/constants/parks-theme.constants';
import { useParksAccess } from '@/parks-industrial/hooks/useParksAccess';
import {
  fetchParksLegalDashboard,
  fetchParksLegalMetrics,
  fetchParksLegalQuincenalReport,
} from '@/parks-industrial/services/parks-legal.client';
import {
  type LawyerMetricsItem,
  type LegalDashboardCase,
  type LegalDashboardResult,
} from '@/parks-industrial/types/parks-legal.types';
import { type ParksDashboardChartSlice } from '@/parks-industrial/utils/parks-dashboard-charts.util';

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

const StyledToolbar = styled.div`
  align-items: center;
  background: ${themeCssVariables.background.primary};
  border: 1px solid ${PARKS_BRAND.borderSoft};
  border-radius: ${themeCssVariables.border.radius.md};
  box-shadow: ${themeCssVariables.boxShadow.light};
  display: flex;
  flex-wrap: wrap;
  gap: ${themeCssVariables.spacing[2]};
  padding: ${themeCssVariables.spacing[3]};
`;

const StyledLawyerSelect = styled(StyledParksSelect)`
  min-width: 220px;
`;

const StyledAssignedHint = styled.span`
  color: ${themeCssVariables.font.color.secondary};
  font-size: ${themeCssVariables.font.size.sm};
`;

const StyledSectionLink = styled(Link)`
  color: ${PARKS_BRAND.primary};
  font-size: ${themeCssVariables.font.size.sm};
  font-weight: ${themeCssVariables.font.weight.medium};
  text-decoration: none;

  &:hover {
    text-decoration: underline;
  }
`;

const StyledReportPre = styled.pre`
  background: ${themeCssVariables.background.secondary};
  border: 1px solid ${themeCssVariables.border.color.light};
  border-radius: ${themeCssVariables.border.radius.sm};
  font-size: ${themeCssVariables.font.size.xs};
  max-height: 280px;
  overflow: auto;
  padding: ${themeCssVariables.spacing[3]};
  white-space: pre-wrap;
`;

const isCasoEnRiesgo = (caso: LegalDashboardCase): boolean => {
  if (caso.semaforo === 'ROJO' || caso.semaforo === 'NARANJA') {
    return true;
  }

  if ((caso.diasRestantes ?? 0) < 0) {
    return true;
  }

  return caso.semaforo === 'AMARILLO';
};

const buildSemaforoSlices = (
  casos: LegalDashboardCase[],
): ParksDashboardChartSlice[] => {
  const counts = {
    verde: 0,
    amarillo: 0,
    naranja: 0,
    rojo: 0,
    otro: 0,
  };

  casos.forEach((caso) => {
    if (caso.semaforo === 'VERDE') {
      counts.verde += 1;
      return;
    }

    if (caso.semaforo === 'AMARILLO') {
      counts.amarillo += 1;
      return;
    }

    if (caso.semaforo === 'NARANJA') {
      counts.naranja += 1;
      return;
    }

    if (caso.semaforo === 'ROJO') {
      counts.rojo += 1;
      return;
    }

    counts.otro += 1;
  });

  const slices: ParksDashboardChartSlice[] = [
    {
      id: 'verde',
      label: t`Verde`,
      value: counts.verde,
      color: themeCssVariables.color.green,
    },
    {
      id: 'amarillo',
      label: t`Amarillo`,
      value: counts.amarillo,
      color: themeCssVariables.color.yellow,
    },
    {
      id: 'naranja',
      label: t`Naranja`,
      value: counts.naranja,
      color: themeCssVariables.color.orange,
    },
    {
      id: 'rojo',
      label: t`Rojo`,
      value: counts.rojo,
      color: themeCssVariables.color.red,
    },
  ];

  if (counts.otro > 0) {
    slices.push({
      id: 'otro',
      label: t`Sin semáforo`,
      value: counts.otro,
      color: themeCssVariables.font.color.tertiary,
    });
  }

  return slices.filter((slice) => slice.value > 0);
};

const getAverageSlaCompliance = (metrics: LawyerMetricsItem[]): number => {
  if (metrics.length === 0) {
    return 0;
  }

  const total = metrics.reduce(
    (sum, metricItem) => sum + metricItem.cumplimientoSlaPct,
    0,
  );

  return Math.round(total / metrics.length);
};

const getTotalClosedCases = (metrics: LawyerMetricsItem[]): number =>
  metrics.reduce((sum, metricItem) => sum + metricItem.casosCerrados, 0);

export const ParksLegalDashboardContent = () => {
  const {
    assignedLawyerName,
    canViewLegalDashboardReport,
    isAssignedLawyerOnly,
  } = useParksAccess();
  const [dashboard, setDashboard] = useState<LegalDashboardResult | null>(null);
  const [metrics, setMetrics] = useState<LawyerMetricsItem[]>([]);
  const [abogadoFilter, setAbogadoFilter] = useState('');
  const [loading, setLoading] = useState(true);
  const [reportCsv, setReportCsv] = useState<string | null>(null);

  const effectiveAbogadoFilter = isAssignedLawyerOnly
    ? assignedLawyerName
    : abogadoFilter;

  const loadDashboard = useCallback(async () => {
    setLoading(true);

    try {
      const [dashboardResult, metricsResult] = await Promise.all([
        fetchParksLegalDashboard({
          abogadoAsignado: effectiveAbogadoFilter || undefined,
        }),
        fetchParksLegalMetrics(),
      ]);
      setDashboard(dashboardResult);
      setMetrics(
        isAssignedLawyerOnly
          ? metricsResult.filter(
              (metricItem) => metricItem.abogadoAsignado === assignedLawyerName,
            )
          : metricsResult,
      );
    } finally {
      setLoading(false);
    }
  }, [assignedLawyerName, effectiveAbogadoFilter, isAssignedLawyerOnly]);

  useEffect(() => {
    void loadDashboard();
  }, [loadDashboard]);

  const handleGenerateReport = async () => {
    const report = await fetchParksLegalQuincenalReport();
    setReportCsv(report.csv);
  };

  const handleDownloadReport = () => {
    if (!reportCsv) {
      return;
    }

    const blob = new Blob([reportCsv], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const anchor = document.createElement('a');
    anchor.href = url;
    anchor.download = `reporte-legal-quincenal-${new Date().toISOString().slice(0, 10)}.csv`;
    anchor.click();
    URL.revokeObjectURL(url);
  };

  const semaforoSlices = useMemo(
    () => buildSemaforoSlices(dashboard?.casos ?? []),
    [dashboard?.casos],
  );

  const casosEnRiesgo = useMemo(
    () => (dashboard?.casos ?? []).filter(isCasoEnRiesgo),
    [dashboard?.casos],
  );

  const avgSlaCompliancePct = useMemo(
    () => getAverageSlaCompliance(metrics),
    [metrics],
  );

  if (loading || !dashboard) {
    return <ParksLoadingSkeleton variant="dashboard" />;
  }

  const workloadBars = metrics.map((metricItem) => ({
    id: metricItem.abogadoAsignado,
    label: metricItem.abogadoAsignado,
    value: metricItem.casosActivos,
    displayValue: `${metricItem.casosActivos} ${t`activos`}`,
    color: PARKS_BRAND.primary,
    meta: `${metricItem.cumplimientoSlaPct}% SLA · ${metricItem.promedioDiasPrimeraVersion ?? '—'} ${t`días a V1`} · ${metricItem.casosCerrados} ${t`cerrados`}`,
  }));

  return (
    <StyledParksPageStack>
      <ParksLegalDashboardHero
        dashboard={dashboard}
        semaforoSlices={
          semaforoSlices.length > 0
            ? semaforoSlices
            : [
                {
                  id: 'empty',
                  label: t`Sin casos`,
                  value: 1,
                  color: themeCssVariables.font.color.tertiary,
                },
              ]
        }
        avgSlaCompliancePct={avgSlaCompliancePct}
      />

      <ParksDashboardFeaturedMetrics>
        <ParksDashboardFeaturedMetric
          label={t`Casos activos`}
          value={String(dashboard.totalActivos)}
          hint={t`En el pipeline legal`}
          icon={IconShield}
          accent="green"
        />
        <ParksDashboardFeaturedMetric
          label={t`Requieren atención`}
          value={String(dashboard.enRiesgo)}
          hint={t`Semáforo crítico o SLA vencido`}
          icon={IconAlertTriangle}
          accent={dashboard.enRiesgo > 0 ? 'red' : 'green'}
        />
        <ParksDashboardFeaturedMetric
          label={t`Cumplimiento SLA`}
          value={`${avgSlaCompliancePct}%`}
          hint={t`Promedio del equipo legal`}
          icon={IconTarget}
          accent="blue"
        />
      </ParksDashboardFeaturedMetrics>

      <StyledToolbar>
        {!isAssignedLawyerOnly ? (
          <StyledLawyerSelect
            value={abogadoFilter}
            onChange={(event) => setAbogadoFilter(event.target.value)}
          >
            <option value="">{t`Todos los abogados`}</option>
            {LEGAL_LAWYER_OPTIONS.map((lawyer) => (
              <option key={lawyer} value={lawyer}>
                {lawyer}
              </option>
            ))}
          </StyledLawyerSelect>
        ) : (
          <StyledAssignedHint>
            {t`Mostrando casos asignados a`} {assignedLawyerName}
          </StyledAssignedHint>
        )}
        <Button
          Icon={IconRefresh}
          title={t`Actualizar`}
          onClick={() => void loadDashboard()}
        />
        {canViewLegalDashboardReport ? (
          <Button
            Icon={IconDownload}
            title={t`Generar reporte quincenal`}
            variant="secondary"
            onClick={() => void handleGenerateReport()}
          />
        ) : null}
      </StyledToolbar>

      <StyledMetricsGrid>
        <ParksMetricCard
          label={t`SLA pausados`}
          value={dashboard.pausados}
          icon={IconClock}
          accent="gray"
        />
        <ParksMetricCard
          label={t`SLA vencidos`}
          value={dashboard.slaVencidos}
          icon={IconAlertTriangle}
          accent={dashboard.slaVencidos > 0 ? 'red' : 'green'}
        />
        <ParksMetricCard
          label={t`Abogados activos`}
          value={metrics.length}
          icon={IconUsers}
          accent="blue"
        />
        <ParksMetricCard
          label={t`Casos cerrados`}
          value={getTotalClosedCases(metrics)}
          icon={IconShield}
          accent="green"
        />
      </StyledMetricsGrid>

      <StyledBentoGrid>
        <ParksSectionCard
          title={t`Casos que requieren atención`}
          accent="red"
          action={
            <StyledSectionLink to={AppPath.ParksLegalPipeline}>
              {t`Ver pipeline legal`}
            </StyledSectionLink>
          }
        >
          {casosEnRiesgo.length === 0 ? (
            <ParksEmptyState title={t`Sin casos críticos`} />
          ) : (
            <StyledCardGrid>
              {casosEnRiesgo.map((caso) => (
                <ParksLegalDashboardCaseCard key={caso.id} caso={caso} />
              ))}
            </StyledCardGrid>
          )}
        </ParksSectionCard>

        <ParksSectionCard title={t`Carga por abogado`} accent="green">
          {workloadBars.length === 0 ? (
            <ParksEmptyState
              title={t`Sin métricas`}
              description={t`Aún no hay datos de carga por abogado.`}
            />
          ) : (
            <ParksDashboardHorizontalBars items={workloadBars} />
          )}
        </ParksSectionCard>
      </StyledBentoGrid>

      <ParksSectionCard
        title={t`Todos los casos activos`}
        accent="blue"
        action={
          <StyledSectionLink to={AppPath.ParksContratos}>
            {t`Ver contratos`}
          </StyledSectionLink>
        }
      >
        {dashboard.casos.length === 0 ? (
          <ParksEmptyState
            title={t`Sin casos activos`}
            description={t`No hay casos que coincidan con el filtro seleccionado.`}
          />
        ) : (
          <StyledCardGrid>
            {dashboard.casos.map((caso) => (
              <ParksLegalDashboardCaseCard key={caso.id} caso={caso} />
            ))}
          </StyledCardGrid>
        )}
      </ParksSectionCard>

      {reportCsv && canViewLegalDashboardReport ? (
        <ParksSectionCard
          title={t`Reporte quincenal`}
          accent="green"
          action={
            <Button
              Icon={IconDownload}
              title={t`Descargar CSV`}
              variant="secondary"
              onClick={handleDownloadReport}
            />
          }
        >
          <StyledReportPre>{reportCsv}</StyledReportPre>
        </ParksSectionCard>
      ) : null}
    </StyledParksPageStack>
  );
};
