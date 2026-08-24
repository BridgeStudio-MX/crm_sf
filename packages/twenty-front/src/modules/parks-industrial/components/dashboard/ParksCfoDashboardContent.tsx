import { t } from '@lingui/core/macro';
import { IconChartBar, IconCurrencyDollar, IconTarget } from 'twenty-ui/icon';

import { ParksCxcDashboardContent } from '@/parks-industrial/components/cxc/ParksCxcDashboardContent';
import {
  ParksDashboardFeaturedMetric,
  ParksDashboardFeaturedMetrics,
} from '@/parks-industrial/components/dashboard/ParksDashboardFeaturedMetrics';
import { ParksLoadingSkeleton } from '@/parks-industrial/components/ui/ParksLoadingSkeleton';
import { StyledParksPageStack } from '@/parks-industrial/components/ui/ParksSectionCard';
import { useParksDashboardMetrics } from '@/parks-industrial/hooks/useParksRecords';
import { formatParksUsd } from '@/parks-industrial/utils/parks-format.util';

export const ParksCfoDashboardContent = () => {
  const { metrics, loading } = useParksDashboardMetrics();

  return (
    <StyledParksPageStack>
      {loading ? (
        <ParksLoadingSkeleton variant="dashboard" />
      ) : (
        <ParksDashboardFeaturedMetrics>
          <ParksDashboardFeaturedMetric
            label={t`Ingreso mensual`}
            value={formatParksUsd(metrics.ingresosMensuales)}
            hint={t`Cartera activa estimada`}
            icon={IconCurrencyDollar}
            accent="green"
          />
          <ParksDashboardFeaturedMetric
            label={t`Pipeline comercial`}
            value={formatParksUsd(metrics.pipelineValueUsd)}
            hint={t`${metrics.pipelineActiveDeals} deals en curso`}
            icon={IconTarget}
            accent="blue"
          />
          <ParksDashboardFeaturedMetric
            label={t`Ocupación`}
            value={`${metrics.ocupacion}%`}
            hint={t`Contexto de ingreso, no operación de campo`}
            icon={IconChartBar}
            accent={metrics.ocupacion >= 85 ? 'green' : 'yellow'}
          />
        </ParksDashboardFeaturedMetrics>
      )}

      <ParksCxcDashboardContent variant="cfo" />
    </StyledParksPageStack>
  );
};
