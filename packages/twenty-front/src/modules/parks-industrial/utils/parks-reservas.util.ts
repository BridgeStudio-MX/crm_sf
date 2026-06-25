import { t } from '@lingui/core/macro';

import {
  type ParksNaveRecord,
  type ParksOpportunityRecord,
} from '@/parks-industrial/hooks/useParksRecords';
import { type ParksParqueRecord } from '@/parks-industrial/hooks/useParksParques';
import { getParksPipelineStageLabel } from '@/parks-industrial/constants/parks-industrial.constants';
import {
  getParksAmountFromMicros,
  getParksDaysInStage,
  getParksOwnerName,
} from '@/parks-industrial/utils/parks-format.util';
import { isParksNaveDisponible } from '@/parks-industrial/utils/parks-portfolio-metrics.util';
import { isParksSelectValueEqual } from '@/parks-industrial/utils/parks-select-value.util';

export type ParksReservaItem = {
  id: string;
  nave: ParksNaveRecord;
  parqueNombre: string;
  opportunity: ParksOpportunityRecord | null;
  estatusLabel: string;
  diasEnEtapa: number | null;
  valorEstimadoUsd: number;
  responsable: string;
};

export type ParksReservasSummary = {
  totalReservadas: number;
  m2BajoNegociacion: number;
  valorPipelineUsd: number;
  navesDisponibles: number;
  m2Disponible: number;
};

const RESERVED_PIPELINE_STAGES = new Set([
  'EN_NEGOCIACION',
  'COTIZACION_ENVIADA',
  'TOUR_VISITA',
  'CALIFICADO',
  'LEAD_RECIBIDO',
  'HOJA_FIRMADA',
  'EN_PROCESO_LEGAL',
]);

const isNaveReserved = (nave: ParksNaveRecord): boolean => {
  if (!nave.estatus) {
    return false;
  }

  return (
    isParksSelectValueEqual(nave.estatus, 'En negociación') ||
    nave.estatus.toUpperCase().includes('NEGOCI')
  );
};

const isOpportunityReservation = (
  opportunity: ParksOpportunityRecord,
): boolean => {
  if (!opportunity.stage || opportunity.stage === 'PERDIDO') {
    return false;
  }

  if (opportunity.stage === 'GANADO') {
    return false;
  }

  return RESERVED_PIPELINE_STAGES.has(opportunity.stage);
};

export const buildParksReservaItems = ({
  naves,
  opportunities,
  parques,
}: {
  naves: ParksNaveRecord[];
  opportunities: ParksOpportunityRecord[];
  parques: ParksParqueRecord[];
}): ParksReservaItem[] => {
  const parqueNameById = new Map(
    parques.map((parque) => [parque.id, parque.nombre ?? t`Parque`]),
  );

  const opportunityByNaveId = new Map<string, ParksOpportunityRecord>();

  for (const opportunity of opportunities) {
    const naveId = opportunity.naveVinculada?.id;

    if (!naveId || !isOpportunityReservation(opportunity)) {
      continue;
    }

    const currentOpportunity = opportunityByNaveId.get(naveId);

    if (!currentOpportunity) {
      opportunityByNaveId.set(naveId, opportunity);
      continue;
    }

    const currentUpdatedAt = new Date(
      currentOpportunity.updatedAt ?? 0,
    ).getTime();
    const nextUpdatedAt = new Date(opportunity.updatedAt ?? 0).getTime();

    if (nextUpdatedAt > currentUpdatedAt) {
      opportunityByNaveId.set(naveId, opportunity);
    }
  }

  const reservedNaves = naves.filter(
    (nave) => isNaveReserved(nave) || opportunityByNaveId.has(nave.id),
  );

  return reservedNaves
    .map((nave) => {
      const opportunity = opportunityByNaveId.get(nave.id) ?? null;
      const parqueNombre =
        parqueNameById.get(nave.parqueId ?? '') ?? t`Sin parque`;

      return {
        id: nave.id,
        nave,
        parqueNombre,
        opportunity,
        estatusLabel: opportunity
          ? getParksPipelineStageLabel(opportunity.stage)
          : t`En negociación`,
        diasEnEtapa: opportunity
          ? getParksDaysInStage(opportunity.updatedAt)
          : null,
        valorEstimadoUsd: opportunity
          ? getParksAmountFromMicros(opportunity.amount?.amountMicros)
          : (nave.m2 ?? 0) * (nave.precioBaseUsd ?? 0),
        responsable: opportunity
          ? getParksOwnerName(opportunity)
          : t`Sin asignar`,
      };
    })
    .sort((leftItem, rightItem) => {
      const leftDays = leftItem.diasEnEtapa ?? 0;
      const rightDays = rightItem.diasEnEtapa ?? 0;

      return rightDays - leftDays;
    });
};

export const buildParksReservasSummary = ({
  reservas,
  naves,
}: {
  reservas: ParksReservaItem[];
  naves: ParksNaveRecord[];
}): ParksReservasSummary => {
  const navesDisponibles = naves.filter((nave) =>
    isParksNaveDisponible(nave.estatus),
  );

  return {
    totalReservadas: reservas.length,
    m2BajoNegociacion: reservas.reduce(
      (total, reserva) => total + (reserva.nave.m2 ?? 0),
      0,
    ),
    valorPipelineUsd: reservas.reduce(
      (total, reserva) => total + reserva.valorEstimadoUsd,
      0,
    ),
    navesDisponibles: navesDisponibles.length,
    m2Disponible: navesDisponibles.reduce(
      (total, nave) => total + (nave.m2 ?? 0),
      0,
    ),
  };
};
