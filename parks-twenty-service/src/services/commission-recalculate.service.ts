import { toSelectValue } from '../utils/select-value.util';
import {
  type CommissionEstatusNave,
  type CommissionOrigen,
  type CommissionTipoContrato,
  commissionRateMatrixStore,
  resolveMatrixRate,
} from './commission-rate-matrix.store';
import { twentyDataService } from './twenty-data.service';

const resolveOrigenKey = (value?: string | null): CommissionOrigen | null => {
  const normalized = (value ?? '').toUpperCase();

  if (normalized.includes('DIRECTO')) {
    return 'DIRECTO';
  }

  if (normalized.includes('TOP 10') || normalized.includes('TOP_10')) {
    return 'BROKER_TOP_10';
  }

  if (
    normalized.includes('FUERA') ||
    normalized.includes('NO_TOP') ||
    normalized.includes('BROKER')
  ) {
    return 'BROKER_NO_TOP_10';
  }

  return null;
};

const resolveTipoContratoKey = (
  value?: string | null,
): CommissionTipoContrato => {
  const normalized = (value ?? '').toUpperCase();

  if (normalized.includes('RENOV')) {
    return 'RENOVACION';
  }

  return 'NUEVO';
};

const resolveEstatusNaveKey = (
  value?: string | null,
): CommissionEstatusNave => {
  const normalized = (value ?? '').toUpperCase();

  if (
    normalized.includes('POR CONSTRUIR') ||
    normalized.includes('POR_CONSTRUIR') ||
    normalized.includes('PREVENTA') ||
    normalized.includes('CONSTRUCCIÓN') ||
    normalized.includes('CONSTRUCCION')
  ) {
    return 'POR_CONSTRUIR';
  }

  return 'CONSTRUIDA';
};

const isRecalculableStatus = (estatus?: string | null): boolean => {
  if (!estatus) {
    return true;
  }

  const normalized = estatus.toUpperCase();

  if (
    normalized.includes('PAGADA') ||
    normalized.includes('APROBADA') ||
    normalized.includes('RECHAZADA') ||
    normalized.includes('DISPUTA') ||
    normalized.includes('PAGO')
  ) {
    return false;
  }

  return (
    normalized.includes('PENDIENTE') ||
    normalized.includes('CALCULADA') ||
    normalized.length === 0
  );
};

export const commissionRecalculateService = {
  // Re-applies the saved matrix to pending commissions that still use matrix rates.
  recalculatePendingFromMatrix: async (): Promise<{
    updated: number;
    skipped: number;
  }> => {
    const matrix = commissionRateMatrixStore.get();
    const comisiones = await twentyDataService.findAllComisiones();
    let updated = 0;
    let skipped = 0;

    for (const comision of comisiones) {
      if (!isRecalculableStatus(comision.estatus)) {
        skipped += 1;
        continue;
      }

      // Keep manual adjustments / broker overrides locked on the deal
      if (
        (comision.baseCalculo ?? '').toLowerCase().includes('broker_override') ||
        (comision.baseCalculo ?? '').toLowerCase().includes('legacy_pct') ||
        comision.ajusteMonto != null
      ) {
        skipped += 1;
        continue;
      }

      const origen = resolveOrigenKey(comision.origenDeal);
      const rentaTotal = comision.rentaTotalContrato;

      if (!origen || rentaTotal == null || rentaTotal <= 0) {
        skipped += 1;
        continue;
      }

      const tipoContrato = resolveTipoContratoKey(comision.tipoContratoComision);
      const estatusNave = resolveEstatusNaveKey(comision.estatusNaveComision);
      const pctAplicado = resolveMatrixRate(
        matrix,
        origen,
        tipoContrato,
        estatusNave,
      );
      const montoUsd = rentaTotal * (pctAplicado / 100);

      await twentyDataService.updateComision(comision.id, {
        pctAplicado,
        montoUsd,
        baseCalculo: `${rentaTotal.toFixed(2)} USD × ${pctAplicado}% (matrix)`,
        estatus: toSelectValue(comision.estatus ?? 'Pendiente'),
      });

      updated += 1;
    }

    return { updated, skipped };
  },
};
