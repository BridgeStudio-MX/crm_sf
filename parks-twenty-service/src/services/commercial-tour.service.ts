import { toSelectValue } from '../utils/select-value.util';
import { brokerNotificationStore } from './broker-notification.store';
import { commercialDecisorService } from './commercial-decisor.service';
import { twentyDataService } from './twenty-data.service';

export type TourResultInput = {
  opportunityId: string;
  tourFecha: string;
  tourParque?: string;
  tourNavesMostradas?: string;
  tourAsistentes?: string;
  attendedDecisorIds?: string[];
  inquilinoId?: string;
  tourFeedback?: string;
  tourProximosPasos?: string;
  companyName?: string;
};

export const commercialTourService = {
  register: async (
    input: TourResultInput,
  ): Promise<{ opportunityId: string; followUpDueHours: number }> => {
    let tourAsistentes = input.tourAsistentes;

    if (input.attendedDecisorIds && input.attendedDecisorIds.length > 0) {
      const attendance = await commercialDecisorService.setTourAttendance({
        opportunityId: input.opportunityId,
        inquilinoId: input.inquilinoId,
        attendedDecisorIds: input.attendedDecisorIds,
      });
      tourAsistentes = attendance.tourAsistentes;
    }

    await twentyDataService.updateOpportunity(input.opportunityId, {
      tourFecha: input.tourFecha,
      tourParque: input.tourParque,
      tourNavesMostradas: input.tourNavesMostradas,
      tourAsistentes,
      tourFeedback: input.tourFeedback,
      tourProximosPasos: input.tourProximosPasos,
      stage: toSelectValue('Tour / Visita'),
    });

    const companyName = input.companyName ?? 'prospecto';

    await twentyDataService.createTask(
      `[LO] Seguimiento post-tour — ${companyName}`,
      `Dar seguimiento al prospecto en 48 horas. Feedback: ${input.tourFeedback ?? 'N/A'}. Próximos pasos: ${input.tourProximosPasos ?? 'N/A'}`,
    );

    brokerNotificationStore.add({
      type: 'task',
      priority: 'high',
      title: `Seguimiento post-tour ${companyName}`,
      body: 'Tarea automática a 48 horas tras registrar el tour.',
      area: 'Comercial',
      opportunityId: input.opportunityId,
      opportunityName: companyName,
    });

    return { opportunityId: input.opportunityId, followUpDueHours: 48 };
  },
};
