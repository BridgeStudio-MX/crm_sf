import { styled } from '@linaria/react';
import { t } from '@lingui/core/macro';
import {
  IconBuildingSkyscraper,
  IconChartBar,
  IconChartLine,
  IconClock,
  IconCoin,
  IconPercentage,
  IconReportMoney,
  IconShield,
  IconTarget,
  IconTrendingDown,
  IconTrendingUp,
  type IconComponent,
} from 'twenty-ui/icon';
import { MOBILE_VIEWPORT, themeCssVariables } from 'twenty-ui/theme-constants';

import { ParksMetricCard } from '@/parks-industrial/components/ui/ParksMetricCard';
import { ParksSectionCard } from '@/parks-industrial/components/ui/ParksSectionCard';
import { ParksStatusBadge } from '@/parks-industrial/components/ui/ParksStatusBadge';
import { type ParksVisualAccent } from '@/parks-industrial/constants/parks-theme.constants';

type ParksCeoKpiCatalogItem = {
  id: string;
  name: string;
  valueLabel: string;
  status: 'live' | 'demo-snapshot';
};

type ParksCeoKpiCatalogProps = {
  items: ParksCeoKpiCatalogItem[];
};

type KpiVisualMeta = {
  group: string;
  accent: ParksVisualAccent;
  icon: IconComponent;
};

const KPI_VISUAL_META: Record<string, KpiVisualMeta> = {
  'kpi-1': { group: 'portafolio', accent: 'green', icon: IconPercentage },
  'kpi-2': { group: 'portafolio', accent: 'blue', icon: IconTrendingUp },
  'kpi-3': { group: 'ingresos', accent: 'green', icon: IconCoin },
  'kpi-4': { group: 'riesgo', accent: 'yellow', icon: IconClock },
  'kpi-5': {
    group: 'riesgo',
    accent: 'orange',
    icon: IconBuildingSkyscraper,
  },
  'kpi-6': { group: 'cobranza', accent: 'green', icon: IconReportMoney },
  'kpi-7': { group: 'retencion', accent: 'green', icon: IconTrendingUp },
  'kpi-8': { group: 'retencion', accent: 'orange', icon: IconTrendingDown },
  'kpi-9': { group: 'comercial', accent: 'purple', icon: IconTarget },
  'kpi-10': { group: 'comercial', accent: 'blue', icon: IconChartLine },
  'kpi-11': { group: 'ingresos', accent: 'sky', icon: IconCoin },
  'kpi-12': { group: 'ingresos', accent: 'turquoise', icon: IconChartBar },
  'kpi-13': { group: 'cobranza', accent: 'green', icon: IconReportMoney },
  'kpi-14': { group: 'cobranza', accent: 'yellow', icon: IconCoin },
  'kpi-15': { group: 'legal', accent: 'purple', icon: IconShield },
  'kpi-16': { group: 'ingresos', accent: 'green', icon: IconChartBar },
};

const GROUP_ORDER = [
  'portafolio',
  'ingresos',
  'riesgo',
  'cobranza',
  'retencion',
  'comercial',
  'legal',
] as const;

const getGroupLabel = (group: string): string => {
  switch (group) {
    case 'portafolio':
      return t`Portafolio`;
    case 'ingresos':
      return t`Ingresos`;
    case 'riesgo':
      return t`Riesgo operativo`;
    case 'cobranza':
      return t`Cobranza`;
    case 'retencion':
      return t`Retención`;
    case 'comercial':
      return t`Comercial`;
    case 'legal':
      return t`Legal`;
    default:
      return group;
  }
};

const StyledStack = styled.div`
  display: flex;
  flex-direction: column;
  gap: ${themeCssVariables.spacing[4]};
`;

const StyledGroup = styled.div`
  display: flex;
  flex-direction: column;
  gap: ${themeCssVariables.spacing[2]};
`;

const StyledGroupTitle = styled.h4`
  color: ${themeCssVariables.font.color.secondary};
  font-size: ${themeCssVariables.font.size.xs};
  font-weight: ${themeCssVariables.font.weight.semiBold};
  letter-spacing: 0.06em;
  margin: 0;
  text-transform: uppercase;
`;

const StyledGrid = styled.div`
  display: grid;
  gap: ${themeCssVariables.spacing[3]};
  grid-template-columns: 1fr;

  @media (min-width: ${MOBILE_VIEWPORT}px) {
    grid-template-columns: repeat(2, minmax(0, 1fr));
  }

  @media (min-width: 1100px) {
    grid-template-columns: repeat(4, minmax(0, 1fr));
  }
`;

const StyledTile = styled.div`
  display: flex;
  flex-direction: column;
  gap: ${themeCssVariables.spacing[1]};
  height: 100%;
  min-width: 0;
`;

const StyledTileFooter = styled.div`
  align-items: center;
  display: flex;
  justify-content: space-between;
  padding: 0 2px;
`;

const StyledKpiId = styled.span`
  color: ${themeCssVariables.font.color.tertiary};
  font-size: 10px;
  font-weight: ${themeCssVariables.font.weight.medium};
  letter-spacing: 0.04em;
  text-transform: uppercase;
`;

const StyledLegend = styled.div`
  align-items: center;
  color: ${themeCssVariables.font.color.tertiary};
  display: flex;
  flex-wrap: wrap;
  font-size: ${themeCssVariables.font.size.xs};
  gap: ${themeCssVariables.spacing[2]};
  margin-bottom: ${themeCssVariables.spacing[2]};
`;

export const ParksCeoKpiCatalog = ({ items }: ParksCeoKpiCatalogProps) => {
  const liveCount = items.filter((item) => item.status === 'live').length;
  const grouped = GROUP_ORDER.map((groupId) => ({
    groupId,
    label: getGroupLabel(groupId),
    items: items.filter((item) => KPI_VISUAL_META[item.id]?.group === groupId),
  })).filter((group) => group.items.length > 0);

  const ungrouped = items.filter((item) => !KPI_VISUAL_META[item.id]);

  const renderTile = (
    kpi: ParksCeoKpiCatalogItem,
    meta?: KpiVisualMeta,
  ) => (
    <StyledTile key={kpi.id}>
      <ParksMetricCard
        label={kpi.name}
        value={kpi.valueLabel}
        accent={meta?.accent ?? 'gray'}
        icon={meta?.icon ?? IconChartBar}
        trend={
          kpi.status === 'live' ? t`Fuente live / CxC` : t`Snapshot mensual`
        }
      />
      <StyledTileFooter>
        <StyledKpiId>{kpi.id}</StyledKpiId>
        <ParksStatusBadge
          label={kpi.status === 'live' ? t`Live` : t`Demo`}
          color={kpi.status === 'live' ? 'green' : 'blue'}
        />
      </StyledTileFooter>
    </StyledTile>
  );

  return (
    <ParksSectionCard title={t`Catálogo de KPIs`} accent="green">
      <StyledLegend>
        <span>{t`${items.length} indicadores ejecutivos`}</span>
        <ParksStatusBadge label={t`${liveCount} live`} color="green" />
        <ParksStatusBadge
          label={t`${items.length - liveCount} snapshot`}
          color="blue"
        />
      </StyledLegend>

      <StyledStack>
        {grouped.map((group) => (
          <StyledGroup key={group.groupId}>
            <StyledGroupTitle>{group.label}</StyledGroupTitle>
            <StyledGrid>
              {group.items.map((kpi) =>
                renderTile(kpi, KPI_VISUAL_META[kpi.id]),
              )}
            </StyledGrid>
          </StyledGroup>
        ))}

        {ungrouped.length > 0 ? (
          <StyledGroup>
            <StyledGroupTitle>{t`Otros`}</StyledGroupTitle>
            <StyledGrid>
              {ungrouped.map((kpi) => renderTile(kpi))}
            </StyledGrid>
          </StyledGroup>
        ) : null}
      </StyledStack>
    </ParksSectionCard>
  );
};
