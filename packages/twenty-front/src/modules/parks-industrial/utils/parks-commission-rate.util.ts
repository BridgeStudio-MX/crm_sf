import { type ParksCommissionRateMatrix } from '@/parks-industrial/services/parks-commission.client';

export type ParksCommissionOrigen =
  | 'DIRECTO'
  | 'BROKER_TOP_10'
  | 'BROKER_NO_TOP_10';

export type ParksCommissionTipoContrato = 'NUEVO' | 'RENOVACION';

export type ParksCommissionEstatusNave = 'CONSTRUIDA' | 'POR_CONSTRUIR';

export type ParksBrokerCommissionOverrides = {
  comisionPct?: number | null;
  comisionPctNuevo?: number | null;
  comisionPctPreventa?: number | null;
  comisionPctRenovacion?: number | null;
};

export type ParksResolvedCommissionRate = {
  pctAplicado: number;
  origen: ParksCommissionOrigen;
  tipoContrato: ParksCommissionTipoContrato;
  estatusNave: ParksCommissionEstatusNave;
  source: 'matrix' | 'broker_override';
};

const includesNormalized = (
  value: string | null | undefined,
  needle: string,
): boolean => (value ?? '').toUpperCase().includes(needle.toUpperCase());

export const resolveParksCommissionOrigen = (input: {
  hasBroker: boolean;
  brokerClasificacion?: string | null;
  esquemaComision?: string | null;
}): ParksCommissionOrigen => {
  if (
    !input.hasBroker ||
    includesNormalized(input.esquemaComision, 'Recursos propios')
  ) {
    return 'DIRECTO';
  }

  if (
    includesNormalized(input.esquemaComision, 'top 10') ||
    includesNormalized(input.brokerClasificacion, 'top 10') ||
    input.brokerClasificacion === 'TOP_10'
  ) {
    return 'BROKER_TOP_10';
  }

  return 'BROKER_NO_TOP_10';
};

export const resolveParksCommissionTipoContrato = (
  tipoContratoOrOperacion?: string | null,
): ParksCommissionTipoContrato => {
  if (includesNormalized(tipoContratoOrOperacion, 'Renov')) {
    return 'RENOVACION';
  }

  return 'NUEVO';
};

export const resolveParksCommissionEstatusNave = (
  naveEstatus?: string | null,
): ParksCommissionEstatusNave => {
  if (
    includesNormalized(naveEstatus, 'construcción') ||
    includesNormalized(naveEstatus, 'construccion') ||
    includesNormalized(naveEstatus, 'Por construir') ||
    includesNormalized(naveEstatus, 'Preventa')
  ) {
    return 'POR_CONSTRUIR';
  }

  return 'CONSTRUIDA';
};

const resolveBrokerOverride = (
  overrides: ParksBrokerCommissionOverrides | undefined,
  tipoContrato: ParksCommissionTipoContrato,
  estatusNave: ParksCommissionEstatusNave,
): number | null => {
  if (!overrides) {
    return null;
  }

  if (tipoContrato === 'RENOVACION' && overrides.comisionPctRenovacion != null) {
    return overrides.comisionPctRenovacion;
  }

  if (
    tipoContrato === 'NUEVO' &&
    estatusNave === 'POR_CONSTRUIR' &&
    overrides.comisionPctPreventa != null
  ) {
    return overrides.comisionPctPreventa;
  }

  if (
    tipoContrato === 'NUEVO' &&
    estatusNave === 'CONSTRUIDA' &&
    overrides.comisionPctNuevo != null
  ) {
    return overrides.comisionPctNuevo;
  }

  if (overrides.comisionPct != null && overrides.comisionPct > 0) {
    return overrides.comisionPct;
  }

  return null;
};

const resolveMatrixRate = (
  matrix: ParksCommissionRateMatrix,
  origen: ParksCommissionOrigen,
  tipoContrato: ParksCommissionTipoContrato,
  estatusNave: ParksCommissionEstatusNave,
): number => {
  if (tipoContrato === 'RENOVACION') {
    return matrix[origen].RENOVACION.rate ?? 0;
  }

  const nuevo = matrix[origen].NUEVO;

  return estatusNave === 'POR_CONSTRUIR'
    ? (nuevo.POR_CONSTRUIR ?? 0)
    : (nuevo.CONSTRUIDA ?? 0);
};

// Prefill for Hoja: matrix + broker overrides (no hoja lock — that is the field itself).
export const resolveParksHojaCommissionPrefill = (input: {
  matrix: ParksCommissionRateMatrix;
  hasBroker: boolean;
  brokerClasificacion?: string | null;
  esquemaComision?: string | null;
  tipoContratoOrOperacion?: string | null;
  naveEstatus?: string | null;
  brokerOverrides?: ParksBrokerCommissionOverrides;
}): ParksResolvedCommissionRate => {
  const origen = resolveParksCommissionOrigen(input);
  const tipoContrato = resolveParksCommissionTipoContrato(
    input.tipoContratoOrOperacion,
  );
  const estatusNave = resolveParksCommissionEstatusNave(input.naveEstatus);

  if (origen === 'DIRECTO') {
    return {
      pctAplicado: resolveMatrixRate(
        input.matrix,
        'DIRECTO',
        tipoContrato,
        estatusNave,
      ),
      origen,
      tipoContrato,
      estatusNave,
      source: 'matrix',
    };
  }

  const override = resolveBrokerOverride(
    input.brokerOverrides,
    tipoContrato,
    estatusNave,
  );

  if (override != null && override > 0) {
    return {
      pctAplicado: override,
      origen,
      tipoContrato,
      estatusNave,
      source: 'broker_override',
    };
  }

  return {
    pctAplicado: resolveMatrixRate(
      input.matrix,
      origen,
      tipoContrato,
      estatusNave,
    ),
    origen,
    tipoContrato,
    estatusNave,
    source: 'matrix',
  };
};

export const formatParksCommissionPrefillHint = (
  rate: ParksResolvedCommissionRate,
): string => {
  if (rate.source === 'broker_override') {
    return 'Override del broker (sobre matriz)';
  }

  const escenario =
    rate.tipoContrato === 'RENOVACION'
      ? 'Renovación'
      : rate.estatusNave === 'POR_CONSTRUIR'
        ? 'Nuevo · preventa'
        : 'Nuevo · construida';

  return `Matriz · ${escenario}`;
};
