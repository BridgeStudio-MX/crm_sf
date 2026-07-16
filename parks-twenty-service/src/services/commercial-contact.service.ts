import { toSelectValue } from '../utils/select-value.util';
import { brokerNotificationStore } from './broker-notification.store';
import { twentyDataService } from './twenty-data.service';

export type FirstContactInput = {
  opportunityId: string;
  tipo: string;
  fecha: string;
  hora?: string;
  notas?: string;
  realizado?: boolean;
  companyName?: string;
};

const buildDueAt = (fecha: string, hora?: string): string | undefined => {
  if (!fecha.trim()) {
    return undefined;
  }

  const timePart = hora?.trim() ? hora.trim() : '09:00';
  const dateTime = new Date(`${fecha}T${timePart}:00`);

  if (Number.isNaN(dateTime.getTime())) {
    return undefined;
  }

  return dateTime.toISOString();
};

export const commercialContactService = {
  register: async (
    input: FirstContactInput,
  ): Promise<{ opportunityId: string }> => {
    const realizado = input.realizado ?? true;

    await twentyDataService.updateOpportunity(input.opportunityId, {
      primerContactoTipo: toSelectValue(input.tipo),
      primerContactoFecha: input.fecha,
      primerContactoHora: input.hora,
      primerContactoNotas: input.notas,
      primerContactoRealizado: realizado,
    });

    const companyName = input.companyName ?? 'prospecto';

    if (realizado) {
      await twentyDataService.createTask(
        `[LO] Primer contacto registrado — ${companyName}`,
        `${input.tipo} el ${input.fecha}${input.hora ? ` ${input.hora}` : ''}. Notas: ${input.notas ?? 'N/A'}`,
      );

      brokerNotificationStore.add({
        type: 'task',
        priority: 'normal',
        title: `Primer contacto registrado — ${companyName}`,
        body: `${input.tipo} completada. Ya se puede agendar la visita a nave.`,
        area: 'Comercial',
        opportunityId: input.opportunityId,
        opportunityName: companyName,
      });
    } else {
      await twentyDataService.createTask(
        `[LO] ${input.tipo} — ${companyName}`,
        `Primer contacto agendado para ${input.fecha}${input.hora ? ` ${input.hora}` : ''}. Notas: ${input.notas ?? 'N/A'}. Oportunidad: ${input.opportunityId}`,
        { dueAt: buildDueAt(input.fecha, input.hora) },
      );

      brokerNotificationStore.add({
        type: 'task',
        priority: 'high',
        title: `${input.tipo} agendada — ${companyName}`,
        body: `${input.fecha}${input.hora ? ` ${input.hora}` : ''}. Revisa tu agenda en Campo LO.`,
        area: 'Comercial',
        opportunityId: input.opportunityId,
        opportunityName: companyName,
      });
    }

    return { opportunityId: input.opportunityId };
  },
};
