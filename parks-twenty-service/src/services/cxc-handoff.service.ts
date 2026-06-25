import { brokerNotificationStore } from './broker-notification.store';
import { cxcHandoffStore } from './cxc-handoff.store';
import { twentyDataService } from './twenty-data.service';
import { type CxcHandoffResult } from '../types/operations.types';
import { toSelectValue } from '../utils/select-value.util';

export const cxcHandoffService = {
  triggerHandoff: async (casoLegalId: string): Promise<CxcHandoffResult> => {
    const casoLegal = await twentyDataService.getCasoLegalById(casoLegalId);

    if (!casoLegal) {
      throw new Error('Caso legal no encontrado');
    }

    const empresa = casoLegal.inquilino?.empresa ?? 'Cliente';
    const referencia = casoLegal.referencia ?? casoLegalId;
    const naveIdentificador =
      casoLegal.nave?.identificador ?? casoLegal.naveId ?? 'N/A';
    const hoja = casoLegal.hojaDeAcuerdos;
    const rentaMensualUsd =
      (hoja?.precioUsdM2 ?? 0) * (hoja?.m2Acordados ?? 0);
    const depositoEstimadoUsd = rentaMensualUsd * 2;

    const tickets = [
      {
        title: `[CxC] Alta de cliente — ${empresa}`,
        body: `Registrar cliente en cartera. RFC: ${casoLegal.inquilino?.rfc ?? 'pendiente'}. Caso: ${referencia}`,
      },
      {
        title: `[CxC] Facturar pagos iniciales — ${empresa}`,
        body: `Depósito estimado USD ${depositoEstimadoUsd.toLocaleString('en-US')} + 1ra renta USD ${rentaMensualUsd.toLocaleString('en-US')}. Nave: ${naveIdentificador}`,
      },
      {
        title: `[CxC] Configurar domiciliación / calendario de rentas`,
        body: `Renta mensual USD ${rentaMensualUsd.toLocaleString('en-US')} · Plazo ${hoja?.plazoMeses ?? '—'} meses`,
      },
    ];

    for (const ticket of tickets) {
      await twentyDataService.createTask(ticket.title, ticket.body);
    }

    await twentyDataService.createNote(
      `[CxC] Handoff — ${referencia}`,
      `Handoff a Cuentas por Cobrar completado para ${empresa}. Renta mensual USD ${rentaMensualUsd.toLocaleString('en-US')}.`,
    );

    await twentyDataService.updateCasoLegal(casoLegalId, {
      estatus: toSelectValue('En cobranza'),
    });

    const handoff = cxcHandoffStore.save({
      casoLegalId,
      referencia,
      empresa,
      naveIdentificador,
      rentaMensualUsd,
      depositoEstimadoUsd,
      status: 'pending',
    });

    brokerNotificationStore.add({
      type: 'task',
      priority: 'high',
      title: `Handoff CxC — ${empresa}`,
      body: `Ticket creado para facturación inicial y calendario de rentas (${naveIdentificador}).`,
      area: 'CxC',
      opportunityName: empresa,
    });

    return {
      handoff,
      ticketsCreated: tickets.length,
      message: `Handoff a CxC registrado para ${empresa}.`,
    };
  },

  getHandoffByCasoLegal: (casoLegalId: string) =>
    cxcHandoffStore.getByCasoLegalId(casoLegalId),
};
