import { styled } from '@linaria/react';
import { t } from '@lingui/core/macro';
import { useMemo, useState } from 'react';
import { IconCoin, IconTarget, IconUsers } from 'twenty-ui/icon';
import { themeCssVariables } from 'twenty-ui/theme-constants';

import { ParksMetricCard } from '@/parks-industrial/components/ui/ParksMetricCard';
import {
  ParksSectionCard,
  StyledParksPageStack,
} from '@/parks-industrial/components/ui/ParksSectionCard';
import { ParksStatusBadge } from '@/parks-industrial/components/ui/ParksStatusBadge';
import {
  PARKS_MARKETING_CAMPAIGNS,
  type ParksMarketingCampaign,
  type ParksMarketingCampaignStatus,
  getParksMarketingCampaignCpl,
  getParksMarketingCampaignQualificationRate,
} from '@/parks-industrial/constants/parks-marketing-demo.constants';
import {
  formatParksNumber,
  formatParksUsd,
} from '@/parks-industrial/utils/parks-format.util';

type CampaignFilter = 'todas' | ParksMarketingCampaignStatus;

const StyledMetricsGrid = styled.div`
  display: grid;
  gap: ${themeCssVariables.spacing[3]};
  grid-template-columns: repeat(auto-fit, minmax(180px, 1fr));
`;

const StyledFilterRow = styled.div`
  display: flex;
  flex-wrap: wrap;
  gap: ${themeCssVariables.spacing[2]};
`;

const StyledFilterChip = styled.button<{ isActive: boolean }>`
  background: ${({ isActive }) =>
    isActive
      ? themeCssVariables.color.blue
      : themeCssVariables.background.tertiary};
  border: 1px solid
    ${({ isActive }) =>
      isActive
        ? themeCssVariables.color.blue
        : themeCssVariables.border.color.medium};
  border-radius: ${themeCssVariables.border.radius.sm};
  color: ${({ isActive }) =>
    isActive ? '#ffffff' : themeCssVariables.font.color.primary};
  cursor: pointer;
  font-size: ${themeCssVariables.font.size.xs};
  padding: ${themeCssVariables.spacing[1]} ${themeCssVariables.spacing[2]};
`;

const StyledCampaignGrid = styled.div`
  display: grid;
  gap: ${themeCssVariables.spacing[3]};
  grid-template-columns: repeat(auto-fit, minmax(280px, 1fr));
`;

const StyledCampaignCard = styled.article`
  background: ${themeCssVariables.background.secondary};
  border: 1px solid ${themeCssVariables.border.color.medium};
  border-radius: ${themeCssVariables.border.radius.md};
  display: flex;
  flex-direction: column;
  gap: ${themeCssVariables.spacing[2]};
  padding: ${themeCssVariables.spacing[3]};
`;

const StyledCampaignHeader = styled.div`
  align-items: flex-start;
  display: flex;
  gap: ${themeCssVariables.spacing[2]};
  justify-content: space-between;
`;

const StyledCampaignTitle = styled.h4`
  font-size: ${themeCssVariables.font.size.md};
  font-weight: ${themeCssVariables.font.weight.semiBold};
  margin: 0;
`;

const StyledCampaignObjective = styled.p`
  color: ${themeCssVariables.font.color.secondary};
  font-size: ${themeCssVariables.font.size.sm};
  line-height: 1.4;
  margin: 0;
`;

const StyledStatRow = styled.div`
  display: grid;
  gap: ${themeCssVariables.spacing[2]};
  grid-template-columns: repeat(2, minmax(0, 1fr));
`;

const StyledStat = styled.div`
  background: ${themeCssVariables.background.tertiary};
  border-radius: ${themeCssVariables.border.radius.sm};
  padding: ${themeCssVariables.spacing[2]};
`;

const StyledStatLabel = styled.div`
  color: ${themeCssVariables.font.color.tertiary};
  font-size: ${themeCssVariables.font.size.xs};
  margin-bottom: 2px;
`;

const StyledStatValue = styled.div`
  font-size: ${themeCssVariables.font.size.sm};
  font-weight: ${themeCssVariables.font.weight.medium};
`;

const StyledBudgetBar = styled.div`
  background: ${themeCssVariables.background.tertiary};
  border-radius: ${themeCssVariables.border.radius.sm};
  height: 8px;
  overflow: hidden;
  width: 100%;
`;

const StyledBudgetFill = styled.div<{ pct: number }>`
  background: ${themeCssVariables.color.blue};
  height: 100%;
  width: ${({ pct }) => `${Math.min(pct, 100)}%`};
`;

const StyledMeta = styled.div`
  color: ${themeCssVariables.font.color.secondary};
  font-size: ${themeCssVariables.font.size.xs};
`;

const getStatusColor = (status: ParksMarketingCampaignStatus) => {
  if (status === 'activa') {
    return 'green' as const;
  }

  if (status === 'pausada') {
    return 'yellow' as const;
  }

  return 'gray' as const;
};

const getStatusLabel = (status: ParksMarketingCampaignStatus) => {
  if (status === 'activa') {
    return t`Activa`;
  }

  if (status === 'pausada') {
    return t`Pausada`;
  }

  return t`Finalizada`;
};

const CampaignCard = ({ campaign }: { campaign: ParksMarketingCampaign }) => {
  const budgetPct =
    campaign.budgetUsd > 0
      ? Math.round((campaign.spendUsd / campaign.budgetUsd) * 100)
      : 0;

  return (
    <StyledCampaignCard>
      <StyledCampaignHeader>
        <div>
          <StyledCampaignTitle>{campaign.name}</StyledCampaignTitle>
          <StyledMeta>
            {campaign.channel} · {campaign.regionFocus}
          </StyledMeta>
        </div>
        <ParksStatusBadge
          label={getStatusLabel(campaign.status)}
          color={getStatusColor(campaign.status)}
        />
      </StyledCampaignHeader>
      <StyledCampaignObjective>{campaign.objective}</StyledCampaignObjective>
      <div>
        <StyledMeta>
          {formatParksUsd(campaign.spendUsd)} /{' '}
          {formatParksUsd(campaign.budgetUsd)} ({budgetPct}%)
        </StyledMeta>
        <StyledBudgetBar>
          <StyledBudgetFill pct={budgetPct} />
        </StyledBudgetBar>
      </div>
      <StyledStatRow>
        <StyledStat>
          <StyledStatLabel>{t`Leads`}</StyledStatLabel>
          <StyledStatValue>
            {formatParksNumber(campaign.leadsGenerated)}
          </StyledStatValue>
        </StyledStat>
        <StyledStat>
          <StyledStatLabel>{t`Calificados`}</StyledStatLabel>
          <StyledStatValue>
            {formatParksNumber(campaign.qualifiedLeads)} (
            {getParksMarketingCampaignQualificationRate(campaign)}%)
          </StyledStatValue>
        </StyledStat>
        <StyledStat>
          <StyledStatLabel>{t`CPL`}</StyledStatLabel>
          <StyledStatValue>
            {formatParksUsd(getParksMarketingCampaignCpl(campaign))}
          </StyledStatValue>
        </StyledStat>
        <StyledStat>
          <StyledStatLabel>{t`Tours`}</StyledStatLabel>
          <StyledStatValue>
            {formatParksNumber(campaign.toursBooked)}
          </StyledStatValue>
        </StyledStat>
        <StyledStat>
          <StyledStatLabel>{t`m² prospectados`}</StyledStatLabel>
          <StyledStatValue>
            {formatParksNumber(campaign.m2Prospectados)}
          </StyledStatValue>
        </StyledStat>
        <StyledStat>
          <StyledStatLabel>{t`Periodo`}</StyledStatLabel>
          <StyledStatValue>
            {campaign.startDate}
            {campaign.endDate ? ` → ${campaign.endDate}` : ` → ${t`hoy`}`}
          </StyledStatValue>
        </StyledStat>
      </StyledStatRow>
    </StyledCampaignCard>
  );
};

export const ParksMarketingCampaignsContent = () => {
  const [filter, setFilter] = useState<CampaignFilter>('todas');

  const summary = useMemo(() => {
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

    return {
      totalSpend,
      totalBudget,
      remaining: Math.max(totalBudget - totalSpend, 0),
      totalLeads,
      activeCount: PARKS_MARKETING_CAMPAIGNS.filter(
        (campaign) => campaign.status === 'activa',
      ).length,
    };
  }, []);

  const filteredCampaigns = useMemo(() => {
    if (filter === 'todas') {
      return PARKS_MARKETING_CAMPAIGNS;
    }

    return PARKS_MARKETING_CAMPAIGNS.filter(
      (campaign) => campaign.status === filter,
    );
  }, [filter]);

  const filters: Array<{ id: CampaignFilter; label: string }> = [
    { id: 'todas', label: t`Todas` },
    { id: 'activa', label: t`Activas` },
    { id: 'pausada', label: t`Pausadas` },
    { id: 'finalizada', label: t`Finalizadas` },
  ];

  return (
    <StyledParksPageStack>
      <StyledMetricsGrid>
        <ParksMetricCard
          label={t`Presupuesto total`}
          value={formatParksUsd(summary.totalBudget)}
          icon={IconTarget}
          accent="blue"
        />
        <ParksMetricCard
          label={t`Gastado`}
          value={formatParksUsd(summary.totalSpend)}
          icon={IconCoin}
          accent="orange"
          trend={`${t`Disponible`} ${formatParksUsd(summary.remaining)}`}
        />
        <ParksMetricCard
          label={t`Activas`}
          value={summary.activeCount}
          icon={IconUsers}
          accent="green"
          trend={`${formatParksNumber(summary.totalLeads)} ${t`leads YTD`}`}
        />
      </StyledMetricsGrid>

      <ParksSectionCard title={t`Campañas de demanda`} accent="blue">
        <StyledFilterRow>
          {filters.map((filterOption) => (
            <StyledFilterChip
              key={filterOption.id}
              type="button"
              isActive={filter === filterOption.id}
              onClick={() => setFilter(filterOption.id)}
            >
              {filterOption.label}
            </StyledFilterChip>
          ))}
        </StyledFilterRow>
      </ParksSectionCard>

      <StyledCampaignGrid>
        {filteredCampaigns.map((campaign) => (
          <CampaignCard key={campaign.id} campaign={campaign} />
        ))}
      </StyledCampaignGrid>
    </StyledParksPageStack>
  );
};
