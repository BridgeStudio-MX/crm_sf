import { styled } from '@linaria/react';
import { t } from '@lingui/core/macro';
import { Link } from 'react-router-dom';
import { AppPath } from 'twenty-shared/types';
import { getAppPath } from 'twenty-shared/utils';
import { themeCssVariables } from 'twenty-ui/theme-constants';

import { ParksDashboardHorizontalBars } from '@/parks-industrial/components/dashboard/charts/ParksDashboardHorizontalBars';
import { ParksEmptyState } from '@/parks-industrial/components/ui/ParksEmptyState';
import { ParksLoadingSkeleton } from '@/parks-industrial/components/ui/ParksLoadingSkeleton';
import {
  ParksSectionCard,
  StyledParksTwoColumnGrid,
} from '@/parks-industrial/components/ui/ParksSectionCard';
import { ParksStatusBadge } from '@/parks-industrial/components/ui/ParksStatusBadge';
import {
  PARKS_TEAM_PIPELINE_STAGE_IDS,
  getParksCemCanalBarColor,
  getParksCemLoPerformanceBarColor,
  type ParksCemTeamPipelineRow,
} from '@/parks-industrial/utils/parksCemDashboardUtil';
import { getParksRenovacionRiskLabel } from '@/parks-industrial/utils/parks-renovaciones.util';
import { useParksCemDashboardMetrics } from '@/parks-industrial/hooks/useParksCemDashboardMetrics';
import {
  getParksPipelineStageLabel,
} from '@/parks-industrial/constants/parks-industrial.constants';
import {
  formatParksNumber,
  formatParksUsd,
} from '@/parks-industrial/utils/parks-format.util';

const StyledSectionIntro = styled.p`
  color: ${themeCssVariables.font.color.secondary};
  font-size: ${themeCssVariables.font.size.sm};
  line-height: 1.45;
  margin: 0 0 ${themeCssVariables.spacing[3]} 0;
`;

const StyledTableScroll = styled.div`
  overflow-x: auto;
`;

const StyledTable = styled.table`
  border-collapse: collapse;
  font-size: ${themeCssVariables.font.size.xs};
  min-width: 100%;
  width: max-content;
`;

const StyledTableHeadCell = styled.th`
  border-bottom: 1px solid ${themeCssVariables.border.color.medium};
  color: ${themeCssVariables.font.color.tertiary};
  font-weight: ${themeCssVariables.font.weight.medium};
  padding: ${themeCssVariables.spacing[1]} ${themeCssVariables.spacing[2]};
  text-align: center;
  white-space: nowrap;

  &:first-child {
    left: 0;
    position: sticky;
    text-align: left;
    z-index: 1;
  }
`;

const StyledTableCell = styled.td`
  border-bottom: 1px solid ${themeCssVariables.border.color.light};
  padding: ${themeCssVariables.spacing[1]} ${themeCssVariables.spacing[2]};
  text-align: center;
  white-space: nowrap;

  &:first-child {
    background: ${themeCssVariables.background.primary};
    font-weight: ${themeCssVariables.font.weight.medium};
    left: 0;
    position: sticky;
    text-align: left;
    z-index: 1;
  }
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

const StyledRecordLink = styled(Link)`
  color: ${themeCssVariables.color.blue};
  font-size: ${themeCssVariables.font.size.xs};
  text-decoration: none;

  &:hover {
    text-decoration: underline;
  }
`;

const StyledSummaryRow = styled.div`
  color: ${themeCssVariables.font.color.secondary};
  display: flex;
  font-size: ${themeCssVariables.font.size.sm};
  gap: ${themeCssVariables.spacing[4]};
  margin-bottom: ${themeCssVariables.spacing[2]};
`;

type ParksCemTeamPipelineTableProps = {
  rows: ParksCemTeamPipelineRow[];
};

const ParksCemTeamPipelineTable = ({
  rows,
}: ParksCemTeamPipelineTableProps) => {
  if (rows.length === 0) {
    return <ParksEmptyState title={t`Sin deals activos en el equipo`} />;
  }

  return (
    <StyledTableScroll>
      <StyledTable>
        <thead>
          <tr>
            <StyledTableHeadCell>{t`LO`}</StyledTableHeadCell>
            {PARKS_TEAM_PIPELINE_STAGE_IDS.map((stageId) => (
              <StyledTableHeadCell key={stageId}>
                {getParksPipelineStageLabel(stageId)}
              </StyledTableHeadCell>
            ))}
            <StyledTableHeadCell>{t`Total`}</StyledTableHeadCell>
            <StyledTableHeadCell>{t`USD`}</StyledTableHeadCell>
          </tr>
        </thead>
        <tbody>
          {rows.map((row) => (
            <tr key={row.ownerName}>
              <StyledTableCell>{row.ownerName}</StyledTableCell>
              {PARKS_TEAM_PIPELINE_STAGE_IDS.map((stageId) => (
                <StyledTableCell key={`${row.ownerName}-${stageId}`}>
                  {row.stageCounts[stageId] ?? 0}
                </StyledTableCell>
              ))}
              <StyledTableCell>{row.totalDeals}</StyledTableCell>
              <StyledTableCell>
                {formatParksUsd(row.pipelineValueUsd)}
              </StyledTableCell>
            </tr>
          ))}
        </tbody>
      </StyledTable>
    </StyledTableScroll>
  );
};

const buildOpportunityRecordPath = (opportunityId: string) =>
  getAppPath(AppPath.RecordShowPage, {
    objectNameSingular: 'opportunity',
    objectRecordId: opportunityId,
  });

export const ParksCemDirectorDashboard = () => {
  const { metrics, loading } = useParksCemDashboardMetrics();

  if (loading) {
    return <ParksLoadingSkeleton variant="list" />;
  }

  const canalChartItems = metrics.canalMetrics.map((canalMetric) => ({
    id: canalMetric.canalId,
    label: canalMetric.label,
    value: canalMetric.conversionRate,
    displayValue: `${canalMetric.conversionRate}%`,
    color: getParksCemCanalBarColor(canalMetric.conversionRate),
    meta: t`${canalMetric.wonCount} ganados · ${canalMetric.leadsCount} leads`,
  }));

  const loChartItems = metrics.loPerformanceMetrics.map(
    (loMetric, index) => ({
      id: loMetric.ownerName,
      label: loMetric.ownerName,
      value: loMetric.pipelineValueUsd,
      displayValue: formatParksUsd(loMetric.pipelineValueUsd),
      color: getParksCemLoPerformanceBarColor(index),
      meta: t`${loMetric.activeDeals} activos · ${loMetric.wonDeals} ganados · ${formatParksNumber(loMetric.m2Pipeline)} m²`,
    }),
  );

  return (
    <>
      <ParksSectionCard
        title={t`Vista Director Comercial (CEM)`}
        accent="green"
        action={
          <Link to={AppPath.ParksPipeline} style={{ fontSize: 12 }}>
            {t`Ver pipeline`}
          </Link>
        }
      >
        <StyledSectionIntro>
          {t`Seguimiento consolidado del equipo: pipeline por LO, deals en riesgo, aprobaciones, conversión por canal y renovaciones críticas.`}
        </StyledSectionIntro>
      </ParksSectionCard>

      <ParksSectionCard
        title={t`Pipeline del equipo por etapa y LO`}
        accent="blue"
      >
        <ParksCemTeamPipelineTable rows={metrics.teamPipelineRows} />
      </ParksSectionCard>

      <StyledParksTwoColumnGrid>
        <ParksSectionCard
          title={t`Oportunidades en riesgo (+15 días sin actividad)`}
          accent="red"
          action={
            <Link to={AppPath.ParksPipeline} style={{ fontSize: 12 }}>
              {t`Ver pipeline`}
            </Link>
          }
        >
          {metrics.atRiskDeals.length === 0 ? (
            <ParksEmptyState title={t`Sin deals estancados`} />
          ) : (
            metrics.atRiskDeals.map((deal) => (
              <StyledDealCard key={deal.id}>
                <StyledDealHeader>
                  <strong>{deal.name}</strong>
                  <ParksStatusBadge
                    color="red"
                    label={t`${deal.daysInStage}d`}
                  />
                </StyledDealHeader>
                <StyledDealMeta>
                  {deal.ownerName} · {deal.stageLabel} ·{' '}
                  {formatParksUsd(deal.valueUsd)}
                </StyledDealMeta>
                <StyledRecordLink to={buildOpportunityRecordPath(deal.id)}>
                  {t`Abrir oportunidad →`}
                </StyledRecordLink>
              </StyledDealCard>
            ))
          )}
        </ParksSectionCard>

        <ParksSectionCard
          title={t`Aprobaciones pendientes`}
          accent="yellow"
          action={
            <Link to={AppPath.ParksNotificaciones} style={{ fontSize: 12 }}>
              {t`Ver notificaciones`}
            </Link>
          }
        >
          {metrics.pendingApprovals.length === 0 ? (
            <ParksEmptyState title={t`Sin aprobaciones pendientes`} />
          ) : (
            metrics.pendingApprovals.map((approval) => (
              <StyledDealCard key={approval.id}>
                <StyledDealHeader>
                  <strong>{approval.name}</strong>
                  <ParksStatusBadge
                    color="yellow"
                    label={approval.estatusAprobacion}
                  />
                </StyledDealHeader>
                <StyledDealMeta>
                  {approval.ownerName} · {approval.stageLabel} ·{' '}
                  {formatParksUsd(approval.valueUsd)}
                </StyledDealMeta>
                <StyledRecordLink to={buildOpportunityRecordPath(approval.id)}>
                  {t`Revisar oportunidad →`}
                </StyledRecordLink>
              </StyledDealCard>
            ))
          )}
        </ParksSectionCard>
      </StyledParksTwoColumnGrid>

      <StyledParksTwoColumnGrid>
        <ParksSectionCard
          title={t`Conversión por canal de origen`}
          accent="purple"
        >
          {canalChartItems.length === 0 ? (
            <ParksEmptyState title={t`Sin datos de canal`} />
          ) : (
            <ParksDashboardHorizontalBars items={canalChartItems} />
          )}
        </ParksSectionCard>

        <ParksSectionCard title={t`Desempeño por LO`} accent="sky">
          {loChartItems.length === 0 ? (
            <ParksEmptyState title={t`Sin LOs con deals asignados`} />
          ) : (
            <ParksDashboardHorizontalBars items={loChartItems} />
          )}
        </ParksSectionCard>
      </StyledParksTwoColumnGrid>

      <ParksSectionCard
        title={t`Renovaciones críticas del equipo`}
        accent="orange"
        action={
          <Link to={AppPath.ParksRenovaciones} style={{ fontSize: 12 }}>
            {t`Ver renovaciones`}
          </Link>
        }
      >
        <StyledSummaryRow>
          <span>
            {t`Críticos`}: {metrics.renovacionesCriticosCount}
          </span>
          <span>
            {t`Ingreso en riesgo`}:{' '}
            {formatParksUsd(metrics.renovacionesIngresoEnRiesgoUsd)}
          </span>
        </StyledSummaryRow>
        {metrics.criticalRenovaciones.length === 0 ? (
          <ParksEmptyState title={t`Sin renovaciones críticas (<90 días)`} />
        ) : (
          metrics.criticalRenovaciones.map((renovacion) => (
            <StyledDealCard key={renovacion.id}>
              <StyledDealHeader>
                <strong>{renovacion.tenantLabel}</strong>
                <ParksStatusBadge
                  color="red"
                  label={
                    renovacion.diasRestantes !== null
                      ? t`${renovacion.diasRestantes}d`
                      : getParksRenovacionRiskLabel('critical')
                  }
                />
              </StyledDealHeader>
              <StyledDealMeta>
                {renovacion.naveLabel}
                {renovacion.parqueNombre
                  ? ` · ${renovacion.parqueNombre}`
                  : ''}{' '}
                · {formatParksUsd(renovacion.ingresoMensualUsd)}/{t`mes`}
              </StyledDealMeta>
            </StyledDealCard>
          ))
        )}
      </ParksSectionCard>
    </>
  );
};
