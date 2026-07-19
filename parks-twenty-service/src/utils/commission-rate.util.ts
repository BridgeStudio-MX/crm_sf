import {
  type CommissionEstatusNave,
  type CommissionOrigen,
  type CommissionTipoContrato,
  commissionRateMatrixStore,
  resolveMatrixRate,
} from '../services/commission-rate-matrix.store';
import { isSelectValueEqual } from './select-value.util';

export type BrokerCommissionOverrides = {
  comisionPctNuevo?: number | null;
  comisionPctPreventa?: number | null;
  comisionPctRenovacion?: number | null;
  // Legacy single % — used as fallback override for all scenarios
  comisionPct?: number | null;
};

export type ResolvedCommissionRate = {
  pctAplicado: number;
  origen: CommissionOrigen;
  tipoContrato: CommissionTipoContrato;
  estatusNave: CommissionEstatusNave;
  source: 'matrix' | 'broker_override' | 'legacy_pct';
  tipoPago: 'interno' | 'externo';
  brokerTierSnapshot: 'TOP_10' | 'NO_TOP_10' | 'DIRECTO';
};

export const resolveCommissionOrigen = (input: {
  hasBroker: boolean;
  brokerClasificacion?: string | null;
  esquemaComision?: string | null;
}): CommissionOrigen => {
  if (
    isSelectValueEqual(input.esquemaComision, 'Recursos propios') ||
    !input.hasBroker
  ) {
    return 'DIRECTO';
  }

  if (
    isSelectValueEqual(input.esquemaComision, 'Broker top 10') ||
    isSelectValueEqual(input.brokerClasificacion, 'Top 10')
  ) {
    return 'BROKER_TOP_10';
  }

  return 'BROKER_NO_TOP_10';
};

export const resolveCommissionTipoContrato = (
  tipoContratoOrOperacion?: string | null,
): CommissionTipoContrato => {
  if (
    isSelectValueEqual(tipoContratoOrOperacion, 'Renovación') ||
    isSelectValueEqual(tipoContratoOrOperacion, 'Renovacion')
  ) {
    return 'RENOVACION';
  }

  return 'NUEVO';
};

export const resolveCommissionEstatusNave = (
  naveEstatus?: string | null,
): CommissionEstatusNave => {
  if (
    isSelectValueEqual(naveEstatus, 'En construcción') ||
    isSelectValueEqual(naveEstatus, 'En construccion') ||
    isSelectValueEqual(naveEstatus, 'Por construir') ||
    isSelectValueEqual(naveEstatus, 'Preventa')
  ) {
    return 'POR_CONSTRUIR';
  }

  return 'CONSTRUIDA';
};

const resolveBrokerOverride = (
  overrides: BrokerCommissionOverrides | undefined,
  tipoContrato: CommissionTipoContrato,
  estatusNave: CommissionEstatusNave,
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

export const resolveApplicableCommissionRate = (input: {
  hasBroker: boolean;
  brokerClasificacion?: string | null;
  esquemaComision?: string | null;
  tipoContratoOrOperacion?: string | null;
  naveEstatus?: string | null;
  brokerOverrides?: BrokerCommissionOverrides;
  // Explicit % already locked on the hoja (legacy path)
  hojaBrokerComisionPct?: number | null;
}): ResolvedCommissionRate => {
  const origen = resolveCommissionOrigen(input);
  const tipoContrato = resolveCommissionTipoContrato(
    input.tipoContratoOrOperacion,
  );
  const estatusNave = resolveCommissionEstatusNave(input.naveEstatus);
  const tipoPago = origen === 'DIRECTO' ? 'interno' : 'externo';
  const brokerTierSnapshot =
    origen === 'DIRECTO'
      ? 'DIRECTO'
      : origen === 'BROKER_TOP_10'
        ? 'TOP_10'
        : 'NO_TOP_10';

  if (
    origen !== 'DIRECTO' &&
    input.hojaBrokerComisionPct != null &&
    input.hojaBrokerComisionPct > 0
  ) {
    return {
      pctAplicado: input.hojaBrokerComisionPct,
      origen,
      tipoContrato,
      estatusNave,
      source: 'legacy_pct',
      tipoPago,
      brokerTierSnapshot,
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
      tipoPago,
      brokerTierSnapshot,
    };
  }

  const matrix = commissionRateMatrixStore.get();
  const pctAplicado = resolveMatrixRate(
    matrix,
    origen,
    tipoContrato,
    estatusNave,
  );

  return {
    pctAplicado,
    origen,
    tipoContrato,
    estatusNave,
    source: 'matrix',
    tipoPago,
    brokerTierSnapshot,
  };
};

export const calculateRentaTotalContrato = (
  precioUsdM2: number,
  m2: number,
  plazoMeses: number,
): number => precioUsdM2 * m2 * plazoMeses;
