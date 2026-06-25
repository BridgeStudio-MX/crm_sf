import { t } from '@lingui/core/macro';

import {
  type ParksExpedienteRecord,
  type ParksHoldoverRecord,
  type ParksOpportunityRecord,
} from '@/parks-industrial/hooks/useParksRecords';
import { type ParksParqueRecord } from '@/parks-industrial/hooks/useParksParques';
import { getParksRenovacionStageLabel } from '@/parks-industrial/constants/parks-industrial.constants';
import {
  getParksDaysUntil,
  getParksStackingStatus,
} from '@/parks-industrial/utils/parks-format.util';
import { isParksSelectValueEqual } from '@/parks-industrial/utils/parks-select-value.util';

export type ParksRenovacionRiskBand =
  | 'critical'
  | 'attention'
  | 'planning'
  | 'stable';

export type ParksRenovacionQueueItem = {
  id: string;
  expediente: ParksExpedienteRecord;
  diasRestantes: number | null;
  riskBand: ParksRenovacionRiskBand;
  etapaRenovacion: string;
  ingresoMensualUsd: number;
  parqueNombre?: string;
};

export type ParksRenovacionesSummary = {
  totalEnCola: number;
  criticos: number;
  atencion: number;
  ingresoEnRiesgoUsd: number;
  holdoversActivos: number;
  montoHoldoverMensualUsd: number;
};

const RISK_BAND_ORDER: Record<ParksRenovacionRiskBand, number> = {
  critical: 0,
  attention: 1,
  planning: 2,
  stable: 3,
};

export const getParksRenovacionRiskBand = (
  diasRestantes: number | null,
): ParksRenovacionRiskBand => {
  if (diasRestantes === null) {
    return 'stable';
  }

  if (diasRestantes <= 90) {
    return 'critical';
  }

  if (diasRestantes <= 180) {
    return 'attention';
  }

  if (diasRestantes <= 365) {
    return 'planning';
  }

  return 'stable';
};

export const getParksRenovacionRiskLabel = (
  riskBand: ParksRenovacionRiskBand,
): string => {
  const labels: Record<ParksRenovacionRiskBand, string> = {
    critical: t`Crítico (<90 días)`,
    attention: t`Atención (90–180 días)`,
    planning: t`Planificar (180–365 días)`,
    stable: t`Estable`,
  };

  return labels[riskBand];
};

const deriveEtapaFromDays = (diasRestantes: number | null): string => {
  if (diasRestantes === null) {
    return getParksRenovacionStageLabel('ALERTA_12_MESES');
  }

  if (diasRestantes <= 30) {
    return getParksRenovacionStageLabel('ALERTA_1_MES');
  }

  if (diasRestantes <= 90) {
    return getParksRenovacionStageLabel('ALERTA_3_MESES');
  }

  if (diasRestantes <= 180) {
    return getParksRenovacionStageLabel('ALERTA_6_MESES');
  }

  return getParksRenovacionStageLabel('ALERTA_12_MESES');
};

const findLinkedRenovacionOpportunity = (
  expediente: ParksExpedienteRecord,
  opportunities: ParksOpportunityRecord[],
): ParksOpportunityRecord | undefined =>
  opportunities.find((opportunity) => {
    const naveId = expediente.nave?.id;
    const inquilinoId = expediente.inquilino?.id;

    if (!naveId && !inquilinoId) {
      return false;
    }

    const matchesNave = opportunity.naveVinculada?.id === naveId;
    const matchesInquilino =
      opportunity.inquilinoVinculado?.id === inquilinoId;

    return (
      (matchesNave || matchesInquilino) &&
      isDefinedRenovacionOpportunity(opportunity)
    );
  });

const isDefinedRenovacionOpportunity = (
  opportunity: ParksOpportunityRecord,
): boolean => {
  if (opportunity.etapaRenovacion) {
    return !isParksSelectValueEqual(opportunity.etapaRenovacion, 'Renovado');
  }

  return false;
};

export const buildParksRenovacionQueue = ({
  expedientes,
  opportunities,
  parques,
  naves,
  maxHorizonDays = 365,
}: {
  expedientes: ParksExpedienteRecord[];
  opportunities: ParksOpportunityRecord[];
  parques: ParksParqueRecord[];
  naves: { id: string; parqueId?: string }[];
  maxHorizonDays?: number;
}): ParksRenovacionQueueItem[] => {
  const parqueNameById = new Map(
    parques.map((parque) => [parque.id, parque.nombre ?? '']),
  );
  const parqueIdByNaveId = new Map(
    naves.map((nave) => [nave.id, nave.parqueId ?? '']),
  );

  return expedientes
    .map((expediente) => {
      const diasRestantes = getParksDaysUntil(expediente.fechaVencimiento);
      const linkedOpportunity = findLinkedRenovacionOpportunity(
        expediente,
        opportunities,
      );
      const etapaRenovacion = linkedOpportunity?.etapaRenovacion
        ? getParksRenovacionStageLabel(linkedOpportunity.etapaRenovacion)
        : deriveEtapaFromDays(diasRestantes);
      const parqueId = expediente.nave?.id
        ? parqueIdByNaveId.get(expediente.nave.id)
        : undefined;

      return {
        id: expediente.id,
        expediente,
        diasRestantes,
        riskBand: getParksRenovacionRiskBand(diasRestantes),
        etapaRenovacion,
        ingresoMensualUsd: expediente.rentaMensualUsd ?? 0,
        parqueNombre: parqueId ? parqueNameById.get(parqueId) : undefined,
      };
    })
    .filter((item) => {
      if (item.diasRestantes === null) {
        return false;
      }

      return item.diasRestantes <= maxHorizonDays;
    })
    .sort((leftItem, rightItem) => {
      const riskCompare =
        RISK_BAND_ORDER[leftItem.riskBand] -
        RISK_BAND_ORDER[rightItem.riskBand];

      if (riskCompare !== 0) {
        return riskCompare;
      }

      return (leftItem.diasRestantes ?? 9999) - (rightItem.diasRestantes ?? 9999);
    });
};

export const buildParksRenovacionesSummary = ({
  queue,
  holdovers,
}: {
  queue: ParksRenovacionQueueItem[];
  holdovers: ParksHoldoverRecord[];
}): ParksRenovacionesSummary => {
  const activeHoldovers = holdovers.filter((holdover) =>
    isParksSelectValueEqual(holdover.resolucion, 'Activo'),
  );

  return {
    totalEnCola: queue.length,
    criticos: queue.filter((item) => item.riskBand === 'critical').length,
    atencion: queue.filter((item) => item.riskBand === 'attention').length,
    ingresoEnRiesgoUsd: queue
      .filter(
        (item) =>
          item.riskBand === 'critical' || item.riskBand === 'attention',
      )
      .reduce((total, item) => total + item.ingresoMensualUsd, 0),
    holdoversActivos: activeHoldovers.length,
    montoHoldoverMensualUsd: activeHoldovers.reduce(
      (total, holdover) => total + (holdover.montoHoldoverMensual ?? 0),
      0,
    ),
  };
};

export const getParksRenovacionStackingStatus = (
  diasRestantes: number | null,
) => getParksStackingStatus(diasRestantes, true);
