import { styled } from '@linaria/react';
import { t } from '@lingui/core/macro';
import { useMemo } from 'react';
import { Link } from 'react-router-dom';
import {
  IconChartBar,
  IconCoin,
  IconTarget,
  IconTrendingUp,
  IconUsers,
} from 'twenty-ui/icon';
import { themeCssVariables } from 'twenty-ui/theme-constants';
import { AppPath } from 'twenty-shared/types';

import { ParksDashboardHorizontalBars } from '@/parks-industrial/components/dashboard/charts/ParksDashboardHorizontalBars';
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
  PARKS_MARKETING_CAMPAIGNS,
  getParksMarketingCampaignCpl,
  getParksMarketingCampaignQualificationRate,
} from '@/parks-industrial/constants/parks-marketing-demo.constants';
import { PARKS_CAMPANAS_PATH } from '@/parks-industrial/constants/parks-routes.constants';
import { PARKS_MARKETING_DASHBOARD_TOUR_TARGETS } from '@/parks-industrial/constants/parks-marketing-dashboard-tour.constants';
import { useParksOpportunities } from '@/parks-industrial/hooks/useParksRecords';
import { useParksProspectScores } from '@/parks-industrial/hooks/useParksProspectScores';
import {
  formatParksNumber,
  formatParksUsd,
} from '@/parks-industrial/utils/parks-format.util';
import { formatParksProspectUrgencyLabel } from '@/parks-industrial/utils/parks-prospect-scoring.util';
import { formatParksCanalOrigenLabel } from '@/parks-industrial/utils/parks-unassigned-leads.util';
import { buildParksCemCanalMetrics } from '@/parks-industrial/utils/parksCemDashboardUtil';

const StyledTourAnchor = styled.div`
  min-width: 0;
`;

const StyledMetricsGrid = styled.div`
  display: grid;
  gap: ${themeCssVariables.spacing[3]};
  grid-template-columns: repeat(auto-fit, minmax(180px, 1fr));
`;

const StyledIntro = styled.p`
  color: ${themeCssVariables.font.color.secondary};
  font-size: ${themeCssVariables.font.size.sm};
  line-height: 1.45;
  margin: 0;
`;

const StyledTable = styled.table`
  border-collapse: collapse;
  font-size: ${themeCssVariables.font.size.xs};
  width: 100%;
`;

const StyledTableHeadCell = styled.th`
  border-bottom: 1px solid ${themeCssVariables.border.color.medium};
  color: ${themeCssVariables.font.color.tertiary};
  font-weight: ${themeCssVariables.font.weight.medium};
  padding: ${themeCssVariables.spacing[1]} ${themeCssVariables.spacing[2]};
  text-align: left;
  white-space: nowrap;
`;

const StyledTableCell = styled.td`
  border-bottom: 1px solid ${themeCssVariables.border.color.light};
  padding: ${themeCssVariables.spacing[2]};
  vertical-align: middle;
`;

const StyledLeadLink = styled(Link)`
  color: ${themeCssVariables.color.blue};
  font-weight: ${themeCssVariables.font.weight.medium};
  text-decoration: none;

  &:hover {
    text-decoration: underline;
  }
`;

const StyledMeta = styled.div`
  color: ${themeCssVariables.font.color.secondary};
  font-size: ${themeCssVariables.font.size.xs};
  margin-top: 2px;
`;

const StyledInsightList = styled.ul`
  color: ${themeCssVariables.font.color.secondary};
  font-size: ${themeCssVariables.font.size.sm};
  line-height: 1.5;
  margin: 0;
  padding-left: ${themeCssVariables.spacing[4]};
`;

const getCampaignStatusColor = (
  status: (typeof PARKS_MARKETING_CAMPAIGNS)[number]['status'],
) => {
  if (status === 'activa') {
    return 'green' as const;
  }

  if (status === 'pausada') {
    return 'yellow' as const;
  }

  return 'gray' as const;
};

const getCampaignStatusLabel = (
  status: (typeof PARKS_MARKETING_CAMPAIGNS)[number]['status'],
) => {
  if (status === 'activa') {
    return t`Activa`;
  }

  if (status === 'pausada') {
    return t`Pausada`;
  }

  return t`Finalizada`;
};

export const ParksMarketingDashboardContent = () => {
  const { records: opportunities, loading } = useParksOpportunities();
  const scoresById = useParksProspectScores(opportunities ?? []);

  const campaignSummary = useMemo(() => {
    const activeCampaigns = PARKS_MARKETING_CAMPAIGNS.filter(
      (campaign) => campaign.status === 'activa',
    );
    const totalSpend = PARKS_MARKETING_CAMPAIGNS.reduce(
      (sum, campaign) => sum + campaign.spendUsd,
      0,
    );
    const totalBudget = PARKS_MARKETING_CAMPAIGNS.reduce(
      (sum, campaign) => sum + campaign.budgetUsd,
      0,
    );
    const totalLeads = PARKS_MARKETING_CAMPAIGNS.reduce(
      (sum, campaign) => sum + campaign.leadsGenerated,
      0,
    );
    const qualifiedLeads = PARKS_MARKETING_CAMPAIGNS.reduce(
      (sum, campaign) => sum + campaign.qualifiedLeads,
      0,
    );
    const toursBooked = PARKS_MARKETING_CAMPAIGNS.reduce(
      (sum, campaign) => sum + campaign.toursBooked,
      0,
    );
    const m2Prospectados = PARKS_MARKETING_CAMPAIGNS.reduce(
      (sum, campaign) => sum + campaign.m2Prospectados,
      0,
    );

    return {
      activeCampaigns: activeCampaigns.length,
      totalSpend,
      totalBudget,
      budgetUsedPct:
        totalBudget > 0 ? Math.round((totalSpend / totalBudget) * 100) : 0,
      totalLeads,
      qualifiedLeads,
      qualificationRate:
        totalLeads > 0
          ? Math.round((qualifiedLeads / totalLeads) * 100)
          : 0,
      toursBooked,
      m2Prospectados,
      cpl: totalLeads > 0 ? Math.round(totalSpend / totalLeads) : 0,
    };
  }, []);

  const canalMetrics = useMemo(
    () => buildParksCemCanalMetrics(opportunities ?? []),
    [opportunities],
  );

  const canalBars = useMemo(
    () =>
      canalMetrics.slice(0, 6).map((metric) => ({
        id: metric.canalId,
        label: metric.label,
        value: metric.leadsCount,
        displayValue: formatParksNumber(metric.leadsCount),
        color: themeCssVariables.color.blue,
      })),
    [canalMetrics],
  );

  const recentLeads = useMemo(() => {
    return [...(opportunities ?? [])]
      .sort((leftDeal, rightDeal) => {
        const leftDate = leftDeal.createdAt
          ? Date.parse(leftDeal.createdAt)
          : 0;
        const rightDate = rightDeal.createdAt
          ? Date.parse(rightDeal.createdAt)
          : 0;

        return rightDate - leftDate;
      })
      .slice(0, 12);
  }, [opportunities]);

  const scoreDistribution = useMemo(() => {
    const scores = Object.values(scoresById);
    const hot = scores.filter((score) => score.tier === 'hot').length;
    const warm = scores.filter((score) => score.tier === 'warm').length;
    const cold = scores.filter((score) => score.tier === 'cold').length;

    return { hot, warm, cold, total: scores.length };
  }, [scoresById]);

  if (loading) {
    return <ParksLoadingSkeleton variant="dashboard" />;
  }

  return (
    <StyledParksPageStack>
      <StyledIntro>
        {t`Vista de demanda industrial: campañas activas, gasto, calidad de leads (fit score IA) y conversión a tours. Pensado para optimizar canales Digital, LinkedIn, brokers y eventos.`}
      </StyledIntro>

      <StyledTourAnchor
        data-parks-tour-target={
          PARKS_MARKETING_DASHBOARD_TOUR_TARGETS.metrics
        }
      >
        <StyledMetricsGrid>
          <ParksMetricCard
            label={t`Campañas activas`}
            value={campaignSummary.activeCampaigns}
            icon={IconTarget}
            accent="blue"
          />
          <ParksMetricCard
            label={t`Gasto YTD`}
            value={formatParksUsd(campaignSummary.totalSpend)}
            icon={IconCoin}
            accent="orange"
            trend={`${campaignSummary.budgetUsedPct}% ${t`del presupuesto`}`}
          />
          <ParksMetricCard
            label={t`Leads generados`}
            value={formatParksNumber(campaignSummary.totalLeads)}
            icon={IconUsers}
            accent="green"
            trend={`CPL ${formatParksUsd(campaignSummary.cpl)}`}
          />
          <ParksMetricCard
            label={t`Calificación`}
            value={`${campaignSummary.qualificationRate}%`}
            icon={IconChartBar}
            accent="turquoise"
            trend={`${formatParksNumber(campaignSummary.qualifiedLeads)} ${t`calificados`}`}
          />
          <ParksMetricCard
            label={t`Tours agendados`}
            value={formatParksNumber(campaignSummary.toursBooked)}
            icon={IconTrendingUp}
            accent="purple"
            trend={`${formatParksNumber(campaignSummary.m2Prospectados)} m²`}
          />
        </StyledMetricsGrid>
      </StyledTourAnchor>

      <StyledTourAnchor
        data-parks-tour-target={
          PARKS_MARKETING_DASHBOARD_TOUR_TARGETS.channels
        }
      >
        <StyledParksTwoColumnGrid>
          <ParksSectionCard title={t`Leads por canal de origen`} accent="blue">
            {canalBars.length > 0 ? (
              <ParksDashboardHorizontalBars items={canalBars} />
            ) : (
              <StyledIntro>
                {t`Aún no hay leads con canal de origen registrado.`}
              </StyledIntro>
            )}
          </ParksSectionCard>

          <ParksSectionCard title={t`Calidad IA del pipeline`} accent="green">
            <StyledMetricsGrid>
              <ParksMetricCard
                label={t`Hot (≥80)`}
                value={scoreDistribution.hot}
                accent="green"
              />
              <ParksMetricCard
                label={t`Warm (65–79)`}
                value={scoreDistribution.warm}
                accent="yellow"
              />
              <ParksMetricCard
                label={t`Cold (<65)`}
                value={scoreDistribution.cold}
                accent="gray"
              />
            </StyledMetricsGrid>
            <StyledMeta style={{ marginTop: 12 }}>
              {`${scoreDistribution.total} ${t`leads con score disponible`}`}
            </StyledMeta>
            <StyledInsightList style={{ marginTop: 12 }}>
              <li>
                {t`Prioriza presupuesto en canales con más Hot y tours — no solo volumen.`}
              </li>
              <li>
                {t`Para naves industriales, m² prospectados y tours valen más que CPL solo.`}
              </li>
              <li>
                {t`LinkedIn + brokers suelen calificar mejor que search genérico.`}
              </li>
            </StyledInsightList>
          </ParksSectionCard>
        </StyledParksTwoColumnGrid>
      </StyledTourAnchor>

      <StyledTourAnchor
        data-parks-tour-target={
          PARKS_MARKETING_DASHBOARD_TOUR_TARGETS.campaigns
        }
      >
        <ParksSectionCard title={t`Campañas en curso`} accent="orange">
          <StyledTable>
            <thead>
              <tr>
                <StyledTableHeadCell>{t`Campaña`}</StyledTableHeadCell>
                <StyledTableHeadCell>{t`Canal`}</StyledTableHeadCell>
                <StyledTableHeadCell>{t`Estatus`}</StyledTableHeadCell>
                <StyledTableHeadCell>{t`Gasto`}</StyledTableHeadCell>
                <StyledTableHeadCell>{t`Leads`}</StyledTableHeadCell>
                <StyledTableHeadCell>{t`CPL`}</StyledTableHeadCell>
                <StyledTableHeadCell>{t`% calif.`}</StyledTableHeadCell>
              </tr>
            </thead>
            <tbody>
              {PARKS_MARKETING_CAMPAIGNS.filter(
                (campaign) => campaign.status !== 'finalizada',
              ).map((campaign) => (
                <tr key={campaign.id}>
                  <StyledTableCell>
                    <strong>{campaign.name}</strong>
                    <StyledMeta>{campaign.regionFocus}</StyledMeta>
                  </StyledTableCell>
                  <StyledTableCell>{campaign.channel}</StyledTableCell>
                  <StyledTableCell>
                    <ParksStatusBadge
                      label={getCampaignStatusLabel(campaign.status)}
                      color={getCampaignStatusColor(campaign.status)}
                    />
                  </StyledTableCell>
                  <StyledTableCell>
                    {formatParksUsd(campaign.spendUsd)}
                    <StyledMeta>
                      {t`de`} {formatParksUsd(campaign.budgetUsd)}
                    </StyledMeta>
                  </StyledTableCell>
                  <StyledTableCell>
                    {formatParksNumber(campaign.leadsGenerated)}
                  </StyledTableCell>
                  <StyledTableCell>
                    {formatParksUsd(getParksMarketingCampaignCpl(campaign))}
                  </StyledTableCell>
                  <StyledTableCell>
                    {getParksMarketingCampaignQualificationRate(campaign)}%
                  </StyledTableCell>
                </tr>
              ))}
            </tbody>
          </StyledTable>
          <StyledMeta style={{ marginTop: 12 }}>
            <Link to={PARKS_CAMPANAS_PATH}>
              {t`Ver todas las campañas y presupuesto →`}
            </Link>
          </StyledMeta>
        </ParksSectionCard>
      </StyledTourAnchor>

      <StyledTourAnchor
        data-parks-tour-target={PARKS_MARKETING_DASHBOARD_TOUR_TARGETS.leads}
      >
        <ParksSectionCard
          title={t`Leads recientes · calificación`}
          accent="turquoise"
        >
          <StyledTable>
            <thead>
              <tr>
                <StyledTableHeadCell>{t`Lead`}</StyledTableHeadCell>
                <StyledTableHeadCell>{t`Canal`}</StyledTableHeadCell>
                <StyledTableHeadCell>{t`Etapa`}</StyledTableHeadCell>
                <StyledTableHeadCell>{t`Fit score`}</StyledTableHeadCell>
                <StyledTableHeadCell>{t`m²`}</StyledTableHeadCell>
              </tr>
            </thead>
            <tbody>
              {recentLeads.map((lead) => {
                const score = scoresById[lead.id];
                const companyName =
                  lead.inquilinoVinculado?.empresa ??
                  lead.name ??
                  t`Sin nombre`;

                return (
                  <tr key={lead.id}>
                    <StyledTableCell>
                      <StyledLeadLink
                        to={`${AppPath.ParksPipeline}?dealId=${lead.id}`}
                      >
                        {companyName}
                      </StyledLeadLink>
                      <StyledMeta>
                        {lead.folio ?? lead.ubicacionDeseada}
                      </StyledMeta>
                    </StyledTableCell>
                    <StyledTableCell>
                      {formatParksCanalOrigenLabel(lead.canalOrigen) ??
                        t`Sin canal`}
                    </StyledTableCell>
                    <StyledTableCell>
                      {getParksPipelineStageLabel(lead.stage)}
                    </StyledTableCell>
                    <StyledTableCell>
                      {score ? (
                        <ParksStatusBadge
                          label={`${score.fitScore} · ${formatParksProspectUrgencyLabel(score.urgency)}`}
                          color={
                            score.tier === 'hot'
                              ? 'green'
                              : score.tier === 'warm'
                                ? 'yellow'
                                : 'gray'
                          }
                        />
                      ) : (
                        '—'
                      )}
                    </StyledTableCell>
                    <StyledTableCell>
                      {lead.m2Requeridos
                        ? formatParksNumber(lead.m2Requeridos)
                        : '—'}
                    </StyledTableCell>
                  </tr>
                );
              })}
            </tbody>
          </StyledTable>
        </ParksSectionCard>
      </StyledTourAnchor>
    </StyledParksPageStack>
  );
};
