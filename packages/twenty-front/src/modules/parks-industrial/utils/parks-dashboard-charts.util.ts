import { t } from '@lingui/core/macro';
import { themeCssVariables } from 'twenty-ui/theme-constants';

import {
  PARKS_VISIBLE_PIPELINE_STAGES,
  type ParksPipelineStageColor,
} from '@/parks-industrial/constants/parks-industrial.constants';
import {
  type ParksExpedienteRecord,
  type ParksNaveRecord,
  type ParksOpportunityRecord,
} from '@/parks-industrial/hooks/useParksRecords';
import { type ParksParqueRecord } from '@/parks-industrial/hooks/useParksParques';
import {
  buildParksRegionalMetricSummaries,
  isParksNaveDisponible,
} from '@/parks-industrial/utils/parks-portfolio-metrics.util';
import {
  getParksAmountFromMicros,
  getParksPipelineStageTheme,
  getParksStackingStatusColor,
} from '@/parks-industrial/utils/parks-format.util';
import {
  getParksMapCityFilterLabel,
  resolveParksMapCityFilterId,
  type ParksMapCityFilterId,
} from '@/parks-industrial/utils/parks-map-city-filter.util';

export type ParksDashboardChartSlice = {
  id: string;
  label: string;
  value: number;
  color: string;
};

export type ParksDashboardPipelineStageMetric = {
  stageId: string;
  label: string;
  count: number;
  valueUsd: number;
  color: string;
};

export type ParksDashboardTopParqueMetric = {
  id: string;
  nombre: string;
  ocupacion: number;
  m2Rentados: number;
  m2Totales: number;
};

export type ParksDashboardIngresoRegionMetric = {
  regionId: string;
  label: string;
  ingresosMensuales: number;
  contratosActivos: number;
};

const getPipelineStageAccent = (color: ParksPipelineStageColor): string =>
  getParksPipelineStageTheme(color).accent;

const normalizeNaveStatusKey = (estatus?: string | null): string => {
  if (!estatus) {
    return 'otro';
  }

  const normalizedEstatus = estatus.trim().toUpperCase();

  if (isParksNaveDisponible(normalizedEstatus)) {
    return 'disponible';
  }

  if (normalizedEstatus.includes('RENT')) {
    return 'rentada';
  }

  if (
    normalizedEstatus.includes('HOLD') ||
    normalizedEstatus.includes('MANTEN')
  ) {
    return 'hold';
  }

  return 'otro';
};

const NAVE_STATUS_COLORS: Record<string, string> = {
  disponible: themeCssVariables.color.green,
  rentada: themeCssVariables.color.blue,
  hold: themeCssVariables.color.orange,
  otro: themeCssVariables.color.gray,
};

const NAVE_STATUS_LABELS: Record<string, string> = {
  disponible: t`Disponible`,
  rentada: t`Rentada`,
  hold: t`Hold / mantenimiento`,
  otro: t`Otro`,
};

export const buildParksDashboardOcupacionSlices = (
  m2Rentados: number,
  m2Disponibles: number,
): ParksDashboardChartSlice[] => [
  {
    id: 'rentados',
    label: t`m² rentados`,
    value: m2Rentados,
    color: themeCssVariables.color.blue,
  },
  {
    id: 'disponibles',
    label: t`m² disponibles`,
    value: m2Disponibles,
    color: themeCssVariables.color.green,
  },
];

export const buildParksDashboardNaveStatusSlices = (
  naves: ParksNaveRecord[],
): ParksDashboardChartSlice[] => {
  const counts = new Map<string, number>();

  for (const nave of naves) {
    const statusKey = normalizeNaveStatusKey(nave.estatus);
    counts.set(statusKey, (counts.get(statusKey) ?? 0) + 1);
  }

  return ['disponible', 'rentada', 'hold', 'otro']
    .map((statusKey) => ({
      id: statusKey,
      label: NAVE_STATUS_LABELS[statusKey],
      value: counts.get(statusKey) ?? 0,
      color: NAVE_STATUS_COLORS[statusKey],
    }))
    .filter((slice) => slice.value > 0);
};

export const buildParksDashboardPipelineStages = (
  opportunities: ParksOpportunityRecord[],
): ParksDashboardPipelineStageMetric[] => {
  const activeOpportunities = opportunities.filter(
    (opportunity) => opportunity.stage !== 'PERDIDO',
  );

  return PARKS_VISIBLE_PIPELINE_STAGES.map((stage) => {
    const stageOpportunities = activeOpportunities.filter(
      (opportunity) => opportunity.stage === stage.id,
    );

    return {
      stageId: stage.id,
      label: stage.label,
      count: stageOpportunities.length,
      valueUsd: stageOpportunities.reduce(
        (total, opportunity) =>
          total + getParksAmountFromMicros(opportunity.amount?.amountMicros),
        0,
      ),
      color: getPipelineStageAccent(stage.color),
    };
  });
};

export const buildParksDashboardTopParques = (
  parques: ParksParqueRecord[],
): ParksDashboardTopParqueMetric[] =>
  [...parques]
    .map((parque) => {
      const m2Totales = parque.m2Totales ?? 0;
      const m2Rentados = parque.m2Rentados ?? 0;
      const ocupacion =
        m2Totales > 0 ? Math.round((m2Rentados / m2Totales) * 100) : 0;

      return {
        id: parque.id,
        nombre: parque.nombre ?? t`Parque`,
        ocupacion,
        m2Rentados,
        m2Totales,
      };
    })
    .sort((leftParque, rightParque) => rightParque.ocupacion - leftParque.ocupacion)
    .slice(0, 8);

export const buildParksDashboardIngresosPorRegion = (
  expedientes: ParksExpedienteRecord[],
  parques: ParksParqueRecord[],
  naves: ParksNaveRecord[],
): ParksDashboardIngresoRegionMetric[] => {
  const parqueById = new Map(parques.map((parque) => [parque.id, parque]));
  const parqueIdByNaveId = new Map(
    naves.map((nave) => [nave.id, nave.parqueId ?? '']),
  );
  const regionMetrics = new Map<
    string,
    { ingresosMensuales: number; contratosActivos: number }
  >();

  for (const expediente of expedientes) {
    const naveId = expediente.nave?.id;
    const parqueId = naveId ? parqueIdByNaveId.get(naveId) : undefined;
    const parque = parqueId ? parqueById.get(parqueId) : undefined;
    const regionId = parque
      ? (resolveParksMapCityFilterId(parque) ?? 'sin-region')
      : 'sin-region';
    const currentMetric = regionMetrics.get(regionId) ?? {
      ingresosMensuales: 0,
      contratosActivos: 0,
    };

    regionMetrics.set(regionId, {
      ingresosMensuales:
        currentMetric.ingresosMensuales + (expediente.rentaMensualUsd ?? 0),
      contratosActivos: currentMetric.contratosActivos + 1,
    });
  }

  return Array.from(regionMetrics.entries())
    .map(([regionId, metric]) => ({
      regionId,
      label:
        regionId === 'sin-region'
          ? t`Sin región`
          : getParksMapCityFilterLabel(regionId as ParksMapCityFilterId),
      ingresosMensuales: metric.ingresosMensuales,
      contratosActivos: metric.contratosActivos,
    }))
    .sort(
      (leftRegion, rightRegion) =>
        rightRegion.ingresosMensuales - leftRegion.ingresosMensuales,
    );
};

export const buildParksDashboardPipelineSummary = (
  opportunities: ParksOpportunityRecord[],
) => {
  const activeOpportunities = opportunities.filter(
    (opportunity) =>
      opportunity.stage !== 'PERDIDO' && opportunity.stage !== 'GANADO',
  );

  return {
    activeDeals: activeOpportunities.length,
    pipelineValueUsd: activeOpportunities.reduce(
      (total, opportunity) =>
        total + getParksAmountFromMicros(opportunity.amount?.amountMicros),
      0,
    ),
  };
};

export const buildParksDashboardRegionalSummaries = (
  parques: ParksParqueRecord[],
) => buildParksRegionalMetricSummaries(parques);

export const getParksDashboardVencimientoBarColor = (
  contratos: number,
): string =>
  contratos >= 3
    ? getParksStackingStatusColor('red')
    : contratos > 0
      ? themeCssVariables.color.orange
      : themeCssVariables.color.blue;
