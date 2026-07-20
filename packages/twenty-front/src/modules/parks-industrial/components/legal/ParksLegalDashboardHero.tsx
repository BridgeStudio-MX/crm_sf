import { t } from '@lingui/core/macro';
import { AppPath } from 'twenty-shared/types';
import { IconFileText, IconLayoutKanban } from 'twenty-ui/icon';

import { ParksDashboardDonutChart } from '@/parks-industrial/components/dashboard/charts/ParksDashboardDonutChart';
import { ParksPageHero } from '@/parks-industrial/components/ui/ParksPageHero';
import { type LegalDashboardResult } from '@/parks-industrial/types/parks-legal.types';
import { type ParksDashboardChartSlice } from '@/parks-industrial/utils/parks-dashboard-charts.util';

type ParksLegalDashboardHeroProps = {
  dashboard: LegalDashboardResult;
  semaforoSlices: ParksDashboardChartSlice[];
  avgSlaCompliancePct: number;
};

export const ParksLegalDashboardHero = ({
  dashboard,
  semaforoSlices,
  avgSlaCompliancePct,
}: ParksLegalDashboardHeroProps) => (
  <ParksPageHero
    eyebrow={t`Parks Industrial · Legal`}
    title={t`Centro de mando legal`}
    subtitle={t`Casos activos, semáforos de SLA, carga por abogado y riesgos de vencimiento en una sola vista para priorizar el equipo.`}
    actions={[
      {
        to: AppPath.ParksLegalPipeline,
        label: t`Pipeline legal`,
        icon: IconLayoutKanban,
      },
      {
        to: AppPath.ParksContratos,
        label: t`Contratos`,
        icon: IconFileText,
      },
    ]}
    sideContent={
      <ParksDashboardDonutChart
        slices={semaforoSlices}
        centerLabel={t`Semáforos SLA`}
        centerValue={String(dashboard.enRiesgo)}
        variant="default"
      />
    }
    stats={[
      {
        label: t`Casos activos`,
        value: String(dashboard.totalActivos),
        hint: t`En cartera legal`,
      },
      {
        label: t`Requieren atención`,
        value: String(dashboard.enRiesgo),
        hint: t`Semáforo rojo/naranja`,
      },
      {
        label: t`SLA pausados`,
        value: String(dashboard.pausados),
        hint: t`En espera`,
      },
      {
        label: t`Cumplimiento SLA`,
        value: `${avgSlaCompliancePct}%`,
        hint: t`Promedio del equipo`,
      },
    ]}
  />
);
