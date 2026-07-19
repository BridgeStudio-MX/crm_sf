import { brokerNotificationStore } from './broker-notification.store';
import { commissionApprovalService } from './commission-approval.service';
import { twentyDataService } from './twenty-data.service';
import { type PaymentCommissionResult } from '../types/operations.types';

export const paymentCommissionService = {
  registerPayment: async (
    comisionId: string,
  ): Promise<PaymentCommissionResult> => {
    const comisiones = await twentyDataService.findAllComisiones();
    const comision = comisiones.find((item) => item.id === comisionId);

    if (!comision) {
      throw new Error('Comisión no encontrada');
    }

    const previousStatus = comision.estatus;
    const updated = await commissionApprovalService.markPaid({ comisionId });

    const referencia =
      comision.folio ??
      comision.hojaDeAcuerdos?.referencia ??
      comision.casoLegal?.referencia ??
      comisionId;

    brokerNotificationStore.add({
      type: 'alert',
      priority: 'high',
      title: `Pago registrado — comisión pagada`,
      body: `${comision.beneficiario ?? 'Broker'} · USD ${(comision.montoUsd ?? 0).toLocaleString('en-US')} · ${referencia}`,
      area: 'Comisiones',
    });

    await twentyDataService.createNote(
      '[Comisiones] Pago registrado',
      `Comisión pagada para ${comision.beneficiario ?? 'broker'} — USD ${comision.montoUsd ?? 0} (${referencia}).`,
    );

    return {
      comisionId,
      beneficiario: updated?.beneficiario ?? comision.beneficiario,
      montoUsd: updated?.montoUsd ?? comision.montoUsd,
      previousStatus,
      newStatus: 'PAGADA',
      message: `Pago registrado. Comisión pagada para ${comision.beneficiario ?? 'broker'}.`,
    };
  },
};
