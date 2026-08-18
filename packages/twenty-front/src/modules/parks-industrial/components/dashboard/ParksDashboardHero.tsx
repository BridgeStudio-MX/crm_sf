import { t } from '@lingui/core/macro';
import { AppPath } from 'twenty-shared/types';
import {
  IconBuildingSkyscraper,
  IconLayoutKanban,
  IconMap,
} from 'twenty-ui/icon';

import { ParksDashboardDonutChart } from '@/parks-industrial/components/dashboard/charts/ParksDashboardDonutChart';
import { ParksPageHero } from '@/parks-industrial/components/ui/ParksPageHero';
import { type ParksDashboardChartSlice } from '@/parks-industrial/utils/parks-dashboard-charts.util';
import {
  formatParksNumber,
  formatParksUsd,
} from '@/parks-industrial/utils/parks-format.util';

type ParksDashboardHeroProps = {
  ocupacion: number;
  ocupacionSlices: ParksDashboardChartSlice[];
  parqueCount: number;
  m2Totales: number;
  pipelineValueUsd: number;
  pipelineActiveDeals: number;
  ingresosMensuales: number;
};

export const ParksDashboardHero = ({
  ocupacion,
  ocupacionSlices,
  parqueCount,
  m2Totales,
  pipelineValueUsd,
  pipelineActiveDeals,
  ingresosMensuales,
}: ParksDashboardHeroProps) => (
  <ParksPageHero
    eyebrow={t`Parks Industrial · Cartera`}
    title={t`Centro de mando comercial`}
    subtitle={t`Ocupación, ingresos, pipeline y riesgos de vencimiento en una sola vista para decidir dónde enfocar el equipo.`}
    actions={[
      {
        to: AppPath.ParksPipeline,
        label: t`Pipeline`,
        icon: IconLayoutKanban,
      },
      {
        to: AppPath.ParksMapa,
        label: t`Mapa de Inventario`,
        icon: IconMap,
      },
      {
        to: AppPath.ParksStackingPlanIndex,
        label: t`Parques`,
        icon: IconBuildingSkyscraper,
      },
    ]}
    sideContent={
      <ParksDashboardDonutChart
        slices={ocupacionSlices}
        centerLabel={t`Ocupación global`}
        centerValue={`${ocupacion}%`}
        variant="default"
      />
    }
    stats={[
      {
        label: t`Parques activos`,
        value: String(parqueCount),
        hint: t`En cartera`,
      },
      {
        label: t`Superficie total`,
        value: `${formatParksNumber(m2Totales)} m²`,
        hint: t`Inventario`,
      },
      {
        label: t`Pipeline activo`,
        value: formatParksUsd(pipelineValueUsd),
        hint: `${pipelineActiveDeals} ${t`deals`}`,
      },
      {
        label: t`Ingresos / mes`,
        value: formatParksUsd(ingresosMensuales),
        hint: t`Estimado`,
      },
    ]}
  />
);
