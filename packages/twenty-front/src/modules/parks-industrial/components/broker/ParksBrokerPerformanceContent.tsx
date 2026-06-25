import { styled } from '@linaria/react';
import { t } from '@lingui/core/macro';
import { useCallback, useEffect, useState } from 'react';
import { IconTarget, IconTrendingUp } from 'twenty-ui/icon';
import { themeCssVariables } from 'twenty-ui/theme-constants';

import { ParksMetricCard } from '@/parks-industrial/components/ui/ParksMetricCard';
import { ParksEmptyState } from '@/parks-industrial/components/ui/ParksEmptyState';
import { ParksLoadingSkeleton } from '@/parks-industrial/components/ui/ParksLoadingSkeleton';
import { ParksProgressBar } from '@/parks-industrial/components/ui/ParksProgressBar';
import { ParksSectionCard } from '@/parks-industrial/components/ui/ParksSectionCard';
import { StyledParksPageStack } from '@/parks-industrial/components/ui/ParksSectionCard';
import { ParksStatusBadge } from '@/parks-industrial/components/ui/ParksStatusBadge';
import { getParksPipelineStageLabel } from '@/parks-industrial/constants/parks-industrial.constants';
import { fetchParksBrokerPerformance } from '@/parks-industrial/services/parks-operations.client';
import { type BrokerPerformanceMetrics } from '@/parks-industrial/types/parks-operations.types';
import {
  formatParksNumber,
  formatParksUsd,
} from '@/parks-industrial/utils/parks-format.util';

const StyledMetricsGrid = styled.div`
  display: grid;
  gap: ${themeCssVariables.spacing[3]};
  grid-template-columns: repeat(auto-fit, minmax(180px, 1fr));
`;

const StyledDealList = styled.div`
  display: flex;
  flex-direction: column;
  gap: ${themeCssVariables.spacing[2]};
`;

const StyledDealRow = styled.div`
  align-items: center;
  background: ${themeCssVariables.background.tertiary};
  border-radius: ${themeCssVariables.border.radius.sm};
  display: flex;
  justify-content: space-between;
  padding: ${themeCssVariables.spacing[2]};
`;

const StyledHero = styled.div`
  background: linear-gradient(
    135deg,
    ${themeCssVariables.color.green1} 0%,
    ${themeCssVariables.background.primary} 60%,
    ${themeCssVariables.color.blue1} 100%
  );
  border: 1px solid ${themeCssVariables.color.green3};
  border-radius: ${themeCssVariables.border.radius.md};
  padding: ${themeCssVariables.spacing[4]};
`;

const StyledHeroTitle = styled.h3`
  font-size: ${themeCssVariables.font.size.lg};
  font-weight: ${themeCssVariables.font.weight.semiBold};
  margin: 0 0 ${themeCssVariables.spacing[2]};
`;

const StyledHeroText = styled.p`
  color: ${themeCssVariables.font.color.secondary};
  font-size: ${themeCssVariables.font.size.sm};
  margin: 0;
`;

export const ParksBrokerPerformanceContent = () => {
  const [metrics, setMetrics] = useState<BrokerPerformanceMetrics | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const loadMetrics = useCallback(async () => {
    setLoading(true);
    setError(null);

    try {
      const response = await fetchParksBrokerPerformance();
      setMetrics(response);
    } catch (loadError) {
      const message =
        loadError instanceof Error
          ? loadError.message
          : 'No se pudieron cargar métricas';
      setError(message);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    void loadMetrics();
  }, [loadMetrics]);

  if (loading) {
    return <ParksLoadingSkeleton variant="dashboard" />;
  }

  if (error || !metrics) {
    return (
      <ParksEmptyState
        title={t`Servicio no disponible`}
        description={
          error ??
          t`Verifica que parks-twenty-service esté corriendo en el puerto 3002.`
        }
      />
    );
  }

  return (
    <StyledParksPageStack>
      <StyledHero>
        <StyledHeroTitle>
          {t`Mi desempeño`} — {metrics.brokerName}
        </StyledHeroTitle>
        <StyledHeroText>
          {t`Ranking #${metrics.rankingPosition} de ${metrics.totalBrokers} brokers · KPIs de cierre y comisiones`}
        </StyledHeroText>
      </StyledHero>

      <StyledMetricsGrid>
        <ParksMetricCard
          label={t`Comisiones aprobadas`}
          value={formatParksUsd(metrics.comisionesAprobadasUsd)}
          icon={IconTrendingUp}
          accent="green"
        />
        <ParksMetricCard
          label={t`Comisiones pendientes`}
          value={formatParksUsd(metrics.comisionesPendientesUsd)}
          icon={IconTarget}
          accent="yellow"
        />
        <ParksMetricCard
          label={t`Deals activos`}
          value={String(metrics.dealsActivos)}
        />
        <ParksMetricCard
          label={t`Deals cerrados`}
          value={String(metrics.dealsCerrados)}
        />
        <ParksMetricCard
          label={t`Ticket promedio`}
          value={formatParksUsd(metrics.ticketPromedioUsd)}
        />
        <ParksMetricCard
          label={t`m² en pipeline`}
          value={`${formatParksNumber(metrics.m2Totales)} m²`}
        />
      </StyledMetricsGrid>

      <ParksSectionCard title={t`Meta mensual de comisiones`}>
        <ParksProgressBar
          label={t`Avance`}
          valueLabel={`${metrics.avanceMetaPct}% · ${formatParksUsd(metrics.comisionesAprobadasUsd)} / ${formatParksUsd(metrics.metaMensualUsd)}`}
          percentage={metrics.avanceMetaPct}
        />
      </ParksSectionCard>

      <ParksSectionCard title={t`Deals recientes`}>
        <StyledDealList>
          {metrics.recentDeals.map((deal) => (
            <StyledDealRow key={deal.dealId}>
              <div>
                <strong>{deal.dealName}</strong>
                <div
                  style={{
                    color: themeCssVariables.font.color.secondary,
                    fontSize: themeCssVariables.font.size.xs,
                  }}
                >
                  {getParksPipelineStageLabel(deal.stage)} ·{' '}
                  {formatParksNumber(deal.m2Requeridos)} m²
                </div>
              </div>
              <ParksStatusBadge
                color="blue"
                label={formatParksUsd(deal.ticketUsd)}
              />
            </StyledDealRow>
          ))}
        </StyledDealList>
      </ParksSectionCard>
    </StyledParksPageStack>
  );
};
