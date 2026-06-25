import { brokerNotificationStore } from './broker-notification.store';
import { comisionService } from './comision.service';
import { twentyDataService } from './twenty-data.service';
import { type PaymentCommissionResult } from '../types/operations.types';
import { toSelectValue } from '../utils/select-value.util';

const isPendingStatus = (estatus?: string): boolean => {
  if (!estatus) {
    return true;
  }

  const normalized = estatus.toUpperCase();

  return (
    normalized.includes('PENDIENTE') ||
    normalized.includes('CALCULADA') ||
    normalized === 'PENDIENTE'
  );
};

export const paymentCommissionService = {
  registerPayment: async (
    comisionId: string,
  ): Promise<PaymentCommissionResult> => {
    const comisiones = await twentyDataService.findAllComisiones();
    const comision = comisiones.find((item) => item.id === comisionId);

    if (!comision) {
      throw new Error('Comisión no encontrada');
    }

    if (!isPendingStatus(comision.estatus)) {
      return {
        comisionId,
        beneficiario: comision.beneficiario,
        montoUsd: comision.montoUsd,
        previousStatus: comision.estatus,
        newStatus: comision.estatus ?? 'APROBADA',
        message: 'La comisión ya fue procesada.',
      };
    }

    if (comision.hojaDeAcuerdosId) {
      await comisionService.calculateForHojaAcuerdos(
        comision.hojaDeAcuerdosId,
      );
    }

    const updated = await twentyDataService.updateComision(comisionId, {
      estatus: toSelectValue('Aprobada'),
    });

    const referencia =
      comision.hojaDeAcuerdos?.referencia ??
      comision.casoLegal?.referencia ??
      comisionId;

    brokerNotificationStore.add({
      type: 'alert',
      priority: 'high',
      title: `Pago registrado — comisión aprobada`,
      body: `${comision.beneficiario ?? 'Broker'} · USD ${(comision.montoUsd ?? 0).toLocaleString('en-US')} · ${referencia}`,
      area: 'Comisiones',
    });

    await twentyDataService.createNote(
      '[Comisiones] Pago registrado',
      `Comisión aprobada para ${comision.beneficiario ?? 'broker'} — USD ${comision.montoUsd ?? 0} (${referencia}).`,
    );

    return {
      comisionId,
      beneficiario: updated?.beneficiario ?? comision.beneficiario,
      montoUsd: updated?.montoUsd ?? comision.montoUsd,
      previousStatus: comision.estatus,
      newStatus: 'APROBADA',
      message: `Pago registrado. Comisión aprobada para ${comision.beneficiario ?? 'broker'}.`,
    };
  },
};
