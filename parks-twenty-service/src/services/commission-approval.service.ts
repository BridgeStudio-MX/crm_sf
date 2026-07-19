import { toSelectValue } from '../utils/select-value.util';
import { brokerNotificationStore } from './broker-notification.store';
import { twentyDataService } from './twenty-data.service';

const isPendingValidation = (estatus?: string | null): boolean => {
  if (!estatus) {
    return true;
  }

  const normalized = estatus.toUpperCase();

  return (
    normalized.includes('PENDIENTE') ||
    normalized.includes('CALCULADA')
  ) && !normalized.includes('PAGO');
};

const isApprovedPendingPayment = (estatus?: string | null): boolean => {
  if (!estatus) {
    return false;
  }

  const normalized = estatus.toUpperCase();

  return (
    normalized.includes('APROBADA') ||
    normalized.includes('PENDIENTE_DE_PAGO') ||
    normalized.includes('PENDIENTE DE PAGO')
  );
};

export const commissionApprovalService = {
  approve: async (input: {
    comisionId: string;
    aprobadoPor: string;
    ajusteMonto?: number;
    motivoAjuste?: string;
  }) => {
    const comisiones = await twentyDataService.findAllComisiones();
    const comision = comisiones.find((item) => item.id === input.comisionId);

    if (!comision) {
      throw new Error(`Comisión ${input.comisionId} no encontrada`);
    }

    if (!isPendingValidation(comision.estatus)) {
      throw new Error(
        `La comisión ${input.comisionId} no está pendiente de validación (estatus: ${comision.estatus})`,
      );
    }

    if (
      input.ajusteMonto != null &&
      input.ajusteMonto !== comision.montoUsd &&
      !input.motivoAjuste?.trim()
    ) {
      throw new Error(
        'motivoAjuste is required when adjusting the calculated amount',
      );
    }

    const montoFinal =
      input.ajusteMonto != null ? input.ajusteMonto : comision.montoUsd;

    // Live CRM enum: Pendiente | Calculada | Aprobada | Pagada
    // (Pendiente de pago is in metadata defs but not always synced yet)
    const updated = await twentyDataService.updateComision(input.comisionId, {
      estatus: toSelectValue('Aprobada'),
      aprobadoPor: input.aprobadoPor,
      fechaAprobacion: twentyDataService.todayIsoDate(),
      montoUsd: montoFinal,
      ...(input.ajusteMonto != null
        ? {
            ajusteMonto: input.ajusteMonto,
            motivoAjuste: input.motivoAjuste,
          }
        : {}),
    });

    brokerNotificationStore.add({
      type: 'task',
      priority: 'normal',
      title: `Comisión aprobada — ${comision.folio ?? comision.beneficiario}`,
      body: `${comision.beneficiario} · USD ${montoFinal ?? 0} · lista para pago`,
      area: 'Comercial',
      opportunityId: comision.opportunityId,
      opportunityName: comision.clienteNombre,
    });

    return updated;
  },

  reject: async (input: {
    comisionId: string;
    aprobadoPor: string;
    motivoAjuste: string;
  }) => {
    const comisiones = await twentyDataService.findAllComisiones();
    const comision = comisiones.find((item) => item.id === input.comisionId);

    if (!comision) {
      throw new Error(`Comisión ${input.comisionId} no encontrada`);
    }

    if (!isPendingValidation(comision.estatus)) {
      throw new Error(
        `La comisión ${input.comisionId} no está pendiente de validación`,
      );
    }

    return twentyDataService.updateComision(input.comisionId, {
      estatus: toSelectValue('Rechazada'),
      aprobadoPor: input.aprobadoPor,
      fechaAprobacion: twentyDataService.todayIsoDate(),
      motivoAjuste: input.motivoAjuste,
    });
  },

  markPaid: async (input: { comisionId: string; pagadoPor?: string }) => {
    const comisiones = await twentyDataService.findAllComisiones();
    const comision = comisiones.find((item) => item.id === input.comisionId);

    if (!comision) {
      throw new Error(`Comisión ${input.comisionId} no encontrada`);
    }

    if (!isApprovedPendingPayment(comision.estatus)) {
      throw new Error(
        'No se puede marcar como pagada sin aprobación previa registrada',
      );
    }

    return twentyDataService.updateComision(input.comisionId, {
      estatus: toSelectValue('Pagada'),
      fechaPago: twentyDataService.todayIsoDate(),
    });
  },
};
