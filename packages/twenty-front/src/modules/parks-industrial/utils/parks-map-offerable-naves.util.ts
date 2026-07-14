import { t } from '@lingui/core/macro';

import {
  type ParksExpedienteRecord,
  type ParksNaveRecord,
} from '@/parks-industrial/hooks/useParksRecords';
import { type ParksParqueRecord } from '@/parks-industrial/hooks/useParksParques';
import {
  getParksDaysUntil,
  getParksStackingStatus,
  type ParksStackingStatusKey,
} from '@/parks-industrial/utils/parks-format.util';
import {
  resolveParksMapCityFilterId,
  type ParksMapCityFilterId,
} from '@/parks-industrial/utils/parks-map-city-filter.util';
import {
  getParksMapLeadRegionDefinition,
  type ParksMapLeadRegionId,
} from '@/parks-industrial/utils/parks-map-leads.util';
import { isParksNaveDisponible } from '@/parks-industrial/utils/parks-portfolio-metrics.util';

export type ParksMapOfferableNaveKind = 'disponible' | 'proxima';

export type ParksMapOfferableNave = {
  naveId: string;
  naveIdentificador: string;
  parqueId?: string;
  parqueNombre?: string;
  ubicacion?: string;
  m2?: number;
  precioUsdM2?: number;
  kind: ParksMapOfferableNaveKind;
  statusKey: ParksStackingStatusKey;
  availabilityLabel: string;
  diasRestantes: number | null;
  cityFilterId: ParksMapCityFilterId | null;
};

const getAvailabilityLabel = ({
  kind,
  diasRestantes,
}: {
  kind: ParksMapOfferableNaveKind;
  diasRestantes: number | null;
}): string => {
  if (kind === 'disponible') {
    return t`Disponible ahora`;
  }

  if (diasRestantes !== null && diasRestantes >= 0) {
    return t`Próxima a liberar · ${diasRestantes} días`;
  }

  return t`Próxima a liberar`;
};

export const buildParksMapOfferableNaves = ({
  naves,
  parques,
  expedientes,
  preferredRegionId,
}: {
  naves: ParksNaveRecord[];
  parques: ParksParqueRecord[];
  expedientes: ParksExpedienteRecord[];
  preferredRegionId?: ParksMapLeadRegionId | null;
}): ParksMapOfferableNave[] => {
  const parqueById = new Map(parques.map((parque) => [parque.id, parque]));
  const expedienteByNaveId = new Map(
    expedientes
      .filter((expediente) => expediente.nave?.id)
      .map((expediente) => [expediente.nave!.id, expediente]),
  );

  const preferredCityFilterId = preferredRegionId
    ? getParksMapLeadRegionDefinition(preferredRegionId).cityFilterId
    : null;

  const offerableNaves: ParksMapOfferableNave[] = [];

  for (const nave of naves) {
    const parque = nave.parqueId ? parqueById.get(nave.parqueId) : undefined;
    const cityFilterId = parque ? resolveParksMapCityFilterId(parque) : null;
    const expediente = expedienteByNaveId.get(nave.id);
    const diasRestantes = getParksDaysUntil(expediente?.fechaVencimiento);
    const hasContract =
      Boolean(expediente) || nave.estatus?.toUpperCase() === 'RENTADA';
    const stackingStatus = getParksStackingStatus(diasRestantes, hasContract);

    let kind: ParksMapOfferableNaveKind | null = null;

    if (isParksNaveDisponible(nave.estatus) || stackingStatus.statusKey === 'available') {
      kind = 'disponible';
    } else if (
      stackingStatus.statusKey === 'expiring_soon' ||
      stackingStatus.statusKey === 'renewal_due'
    ) {
      kind = 'proxima';
    }

    if (!kind) {
      continue;
    }

    offerableNaves.push({
      naveId: nave.id,
      naveIdentificador: nave.identificador ?? t`Nave`,
      parqueId: nave.parqueId,
      parqueNombre: parque?.nombre,
      ubicacion: parque?.ubicacion,
      m2: nave.m2,
      precioUsdM2: nave.precioBaseUsd,
      kind,
      statusKey: stackingStatus.statusKey,
      availabilityLabel: getAvailabilityLabel({ kind, diasRestantes }),
      diasRestantes,
      cityFilterId,
    });
  }

  const ranked = offerableNaves.sort((left, right) => {
    const leftPreferred =
      preferredCityFilterId && left.cityFilterId === preferredCityFilterId
        ? 0
        : 1;
    const rightPreferred =
      preferredCityFilterId && right.cityFilterId === preferredCityFilterId
        ? 0
        : 1;

    if (leftPreferred !== rightPreferred) {
      return leftPreferred - rightPreferred;
    }

    if (left.kind !== right.kind) {
      return left.kind === 'disponible' ? -1 : 1;
    }

    return (right.m2 ?? 0) - (left.m2 ?? 0);
  });

  return ranked;
};
