import { t } from '@lingui/core/macro';
import { themeCssVariables } from 'twenty-ui/theme-constants';

import {
  PARKS_VISIBLE_PIPELINE_STAGES,
  getParksPipelineStageLabel,
} from '@/parks-industrial/constants/parks-industrial.constants';
import {
  type ParksOpportunityRecord,
} from '@/parks-industrial/hooks/useParksRecords';
import {
  type ParksRenovacionQueueItem,
} from '@/parks-industrial/utils/parks-renovaciones.util';
import {
  formatParksCanalOrigenLabel,
} from '@/parks-industrial/utils/parks-unassigned-leads.util';
import {
  getParksAmountFromMicros,
  getParksDaysInStage,
  getParksOwnerName,
} from '@/parks-industrial/utils/parks-format.util';

export const PARKS_AT_RISK_DAYS_THRESHOLD = 15;

export const PARKS_TEAM_PIPELINE_STAGE_IDS = PARKS_VISIBLE_PIPELINE_STAGES.filter(
  (stage) => stage.id !== 'GANADO_CONTRATO_FIRMADO',
).map((stage) => stage.id);

const CLOSED_PIPELINE_STAGES = new Set([
  'PERDIDO',
  'GANADO',
  'GANADO_CONTRATO_FIRMADO',
]);

const WON_PIPELINE_STAGES = new Set(['GANADO', 'GANADO_CONTRATO_FIRMADO']);

export const isParksActivePipelineOpportunity = (
  opportunity: ParksOpportunityRecord,
): boolean => !CLOSED_PIPELINE_STAGES.has(opportunity.stage ?? '');

export const isParksWonPipelineOpportunity = (
  opportunity: ParksOpportunityRecord,
): boolean => WON_PIPELINE_STAGES.has(opportunity.stage ?? '');

export const isParksApprovalApproved = (
  estatusAprobacion?: string | null,
): boolean => {
  if (!estatusAprobacion) {
    return false;
  }

  return (
    estatusAprobacion === 'APROBADA' ||
    estatusAprobacion.toLowerCase().includes('aprobada')
  );
};

export type ParksCemAtRiskDeal = {
  id: string;
  name: string;
  stageLabel: string;
  ownerName: string;
  daysInStage: number;
  valueUsd: number;
};

export type ParksCemPendingApproval = {
  id: string;
  name: string;
  stageLabel: string;
  ownerName: string;
  estatusAprobacion: string;
  valueUsd: number;
};

export type ParksCemTeamPipelineRow = {
  ownerName: string;
  stageCounts: Record<string, number>;
  totalDeals: number;
  pipelineValueUsd: number;
};

export type ParksCemCanalMetric = {
  canalId: string;
  label: string;
  leadsCount: number;
  wonCount: number;
  conversionRate: number;
};

export type ParksCemLoPerformanceMetric = {
  ownerName: string;
  activeDeals: number;
  pipelineValueUsd: number;
  wonDeals: number;
  m2Pipeline: number;
};

export type ParksCemCriticalRenovacion = {
  id: string;
  tenantLabel: string;
  naveLabel: string;
  parqueNombre?: string;
  diasRestantes: number | null;
  ingresoMensualUsd: number;
};

export const buildParksCemAtRiskDeals = (
  opportunities: ParksOpportunityRecord[],
  limit = 8,
): ParksCemAtRiskDeal[] =>
  opportunities
    .filter(
      (opportunity) =>
        isParksActivePipelineOpportunity(opportunity) &&
        getParksDaysInStage(opportunity.updatedAt) >=
          PARKS_AT_RISK_DAYS_THRESHOLD,
    )
    .map((opportunity) => ({
      id: opportunity.id,
      name: opportunity.name ?? t`Sin nombre`,
      stageLabel: getParksPipelineStageLabel(opportunity.stage),
      ownerName: getParksOwnerName(opportunity),
      daysInStage: getParksDaysInStage(opportunity.updatedAt),
      valueUsd: getParksAmountFromMicros(opportunity.amount?.amountMicros),
    }))
    .sort((leftDeal, rightDeal) => rightDeal.daysInStage - leftDeal.daysInStage)
    .slice(0, limit);

export const buildParksCemPendingApprovals = (
  opportunities: ParksOpportunityRecord[],
  limit = 8,
): ParksCemPendingApproval[] =>
  opportunities
    .filter((opportunity) => {
      if (
        opportunity.aprobacionRequerida !== true ||
        isParksApprovalApproved(opportunity.estatusAprobacion)
      ) {
        return false;
      }

      // CEO-level approvals belong to Charles, not the CEM bandeja.
      if (opportunity.nivelAprobacion === 'CEO') {
        return false;
      }

      return (
        opportunity.nivelAprobacion === 'CEM' ||
        !opportunity.nivelAprobacion
      );
    })
    .map((opportunity) => ({
      id: opportunity.id,
      name: opportunity.name ?? t`Sin nombre`,
      stageLabel: getParksPipelineStageLabel(opportunity.stage),
      ownerName: getParksOwnerName(opportunity),
      estatusAprobacion: opportunity.estatusAprobacion ?? t`Pendiente`,
      valueUsd: getParksAmountFromMicros(opportunity.amount?.amountMicros),
    }))
    .sort((leftApproval, rightApproval) =>
      rightApproval.valueUsd - leftApproval.valueUsd,
    )
    .slice(0, limit);

export const buildParksCemTeamPipelineRows = (
  opportunities: ParksOpportunityRecord[],
): ParksCemTeamPipelineRow[] => {
  const rowByOwner = new Map<string, ParksCemTeamPipelineRow>();

  for (const opportunity of opportunities) {
    if (!isParksActivePipelineOpportunity(opportunity)) {
      continue;
    }

    const ownerName = getParksOwnerName(opportunity);
    const currentRow = rowByOwner.get(ownerName) ?? {
      ownerName,
      stageCounts: Object.fromEntries(
        PARKS_TEAM_PIPELINE_STAGE_IDS.map((stageId) => [stageId, 0]),
      ),
      totalDeals: 0,
      pipelineValueUsd: 0,
    };
    const stageId = opportunity.stage ?? 'LEAD_RECIBIDO';

    if (PARKS_TEAM_PIPELINE_STAGE_IDS.includes(stageId)) {
      currentRow.stageCounts[stageId] =
        (currentRow.stageCounts[stageId] ?? 0) + 1;
    }

    currentRow.totalDeals += 1;
    currentRow.pipelineValueUsd += getParksAmountFromMicros(
      opportunity.amount?.amountMicros,
    );
    rowByOwner.set(ownerName, currentRow);
  }

  return Array.from(rowByOwner.values()).sort(
    (leftRow, rightRow) => rightRow.pipelineValueUsd - leftRow.pipelineValueUsd,
  );
};

const normalizeCanalId = (canalOrigen?: string | null): string => {
  if (!canalOrigen) {
    return 'sin-canal';
  }

  return canalOrigen.trim().toUpperCase().replace(/\s+/g, '_');
};

export const buildParksCemCanalMetrics = (
  opportunities: ParksOpportunityRecord[],
): ParksCemCanalMetric[] => {
  const metricByCanal = new Map<
    string,
    { label: string; leadsCount: number; wonCount: number }
  >();

  for (const opportunity of opportunities) {
    const canalId = normalizeCanalId(opportunity.canalOrigen);
    const label =
      formatParksCanalOrigenLabel(opportunity.canalOrigen) ?? t`Sin canal`;
    const currentMetric = metricByCanal.get(canalId) ?? {
      label,
      leadsCount: 0,
      wonCount: 0,
    };

    currentMetric.leadsCount += 1;

    if (isParksWonPipelineOpportunity(opportunity)) {
      currentMetric.wonCount += 1;
    }

    metricByCanal.set(canalId, currentMetric);
  }

  return Array.from(metricByCanal.entries())
    .map(([canalId, metric]) => ({
      canalId,
      label: metric.label,
      leadsCount: metric.leadsCount,
      wonCount: metric.wonCount,
      conversionRate:
        metric.leadsCount > 0
          ? Math.round((metric.wonCount / metric.leadsCount) * 100)
          : 0,
    }))
    .sort((leftMetric, rightMetric) => rightMetric.leadsCount - leftMetric.leadsCount);
};

export const buildParksCemLoPerformanceMetrics = (
  opportunities: ParksOpportunityRecord[],
): ParksCemLoPerformanceMetric[] => {
  const metricByOwner = new Map<string, ParksCemLoPerformanceMetric>();

  for (const opportunity of opportunities) {
    const ownerName = getParksOwnerName(opportunity);

    if (ownerName === 'Sin asignar') {
      continue;
    }

    const currentMetric = metricByOwner.get(ownerName) ?? {
      ownerName,
      activeDeals: 0,
      pipelineValueUsd: 0,
      wonDeals: 0,
      m2Pipeline: 0,
    };

    if (isParksActivePipelineOpportunity(opportunity)) {
      currentMetric.activeDeals += 1;
      currentMetric.pipelineValueUsd += getParksAmountFromMicros(
        opportunity.amount?.amountMicros,
      );
      currentMetric.m2Pipeline +=
        opportunity.m2Ofertados ?? opportunity.m2Requeridos ?? 0;
    }

    if (isParksWonPipelineOpportunity(opportunity)) {
      currentMetric.wonDeals += 1;
    }

    metricByOwner.set(ownerName, currentMetric);
  }

  return Array.from(metricByOwner.values()).sort(
    (leftMetric, rightMetric) =>
      rightMetric.pipelineValueUsd - leftMetric.pipelineValueUsd,
  );
};

export const buildParksCemCriticalRenovaciones = (
  queue: ParksRenovacionQueueItem[],
  limit = 5,
): ParksCemCriticalRenovacion[] =>
  queue
    .filter((item) => item.riskBand === 'critical')
    .map((item) => ({
      id: item.id,
      tenantLabel:
        item.expediente.inquilino?.empresa ?? t`Inquilino sin nombre`,
      naveLabel: item.expediente.nave?.identificador ?? t`Sin nave`,
      parqueNombre: item.parqueNombre,
      diasRestantes: item.diasRestantes,
      ingresoMensualUsd: item.ingresoMensualUsd,
    }))
    .slice(0, limit);

export const getParksCemLoPerformanceBarColor = (index: number): string => {
  const colors = [
    themeCssVariables.color.blue,
    themeCssVariables.color.turquoise,
    themeCssVariables.color.purple,
    themeCssVariables.color.green,
    themeCssVariables.color.orange,
  ];

  return colors[index % colors.length];
};

export const getParksCemCanalBarColor = (conversionRate: number): string => {
  if (conversionRate >= 50) {
    return themeCssVariables.color.green;
  }

  if (conversionRate >= 25) {
    return themeCssVariables.color.blue;
  }

  return themeCssVariables.color.orange;
};
