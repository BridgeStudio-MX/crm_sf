import { brokerNotificationStore } from './broker-notification.store';
import { twentyDataService } from './twenty-data.service';
import { type ActivityTimelineEntry } from '../types/commercial.types';

const buildMockTimeline = ({
  opportunityId,
  companyName,
  stage,
}: {
  opportunityId: string;
  companyName: string;
  stage?: string;
}): ActivityTimelineEntry[] => {
  const now = Date.now();
  const day = 24 * 60 * 60 * 1000;

  const entries: ActivityTimelineEntry[] = [
    {
      id: `${opportunityId}-email-1`,
      type: 'email',
      direction: 'inbound',
      subject: `Consulta de espacio industrial — ${companyName}`,
      summary:
        'Solicitan información sobre naves de 8,000–12,000 m² en corredor Bajío. Mencionan expansión para Q4.',
      participant: 'contacto@empresa.com',
      occurredAt: new Date(now - day * 2).toISOString(),
      source: 'gmail',
    },
    {
      id: `${opportunityId}-call-1`,
      type: 'call',
      direction: 'outbound',
      subject: 'Llamada de calificación comercial',
      summary:
        'Se confirmó presupuesto mensual, plazo de 36 meses y necesidad de 10 andenes de carga.',
      participant: 'Ejecutivo Comercial',
      occurredAt: new Date(now - day).toISOString(),
      source: 'crm',
    },
    {
      id: `${opportunityId}-email-2`,
      type: 'email',
      direction: 'outbound',
      subject: `Propuesta preliminar — ${companyName}`,
      summary:
        'Se envió ficha técnica con 3 opciones de naves. Cliente abrió el enlace 2 veces.',
      participant: 'broker@parksindustrial.com',
      occurredAt: new Date(now - day * 0.5).toISOString(),
      source: 'gmail',
    },
    {
      id: `${opportunityId}-task-1`,
      type: 'task',
      direction: 'internal',
      subject: 'Agendar tour en sitio',
      summary: 'Pendiente confirmar fecha con decisores de operaciones y legal.',
      participant: 'CEM',
      occurredAt: new Date(now - day * 0.25).toISOString(),
      source: 'crm',
    },
  ];

  if (stage?.toLowerCase().includes('negociación')) {
    entries.unshift({
      id: `${opportunityId}-email-inquiry`,
      type: 'email',
      direction: 'inbound',
      subject: 'Inquiry LoopNet — Nave industrial',
      summary:
        'Lead capturado desde portal. Interés en nave de 9,500 m². Parseado automáticamente al CRM.',
      participant: 'inquiry@loopnet.com',
      occurredAt: new Date(now - day * 5).toISOString(),
      source: 'email-parser',
    });
  }

  return entries.sort(
    (left, right) =>
      new Date(right.occurredAt).getTime() -
      new Date(left.occurredAt).getTime(),
  );
};

export const activityTimelineService = {
  getForOpportunity: async (
    opportunityId: string,
  ): Promise<{
    opportunityId: string;
    companyName: string;
    entries: ActivityTimelineEntry[];
    gmailConnected: boolean;
  }> => {
    const opportunity =
      await twentyDataService.getOpportunityById(opportunityId);

    let companyName = opportunity?.name ?? 'Prospecto';

    if (opportunity?.inquilinoVinculadoId) {
      const inquilino = await twentyDataService.getInquilinoById(
        opportunity.inquilinoVinculadoId,
      );

      if (inquilino?.empresa) {
        companyName = inquilino.empresa;
      }
    }

    return {
      opportunityId,
      companyName,
      entries: buildMockTimeline({
        opportunityId,
        companyName,
        stage: opportunity?.stage,
      }),
      gmailConnected: true,
    };
  },

  logParsedInquiry: ({
    opportunityId,
    companyName,
    source,
  }: {
    opportunityId: string;
    companyName: string;
    source: string;
  }): void => {
    brokerNotificationStore.add({
      type: 'email',
      priority: 'high',
      title: `Inquiry parseado — ${companyName}`,
      body: `Lead capturado desde ${source} y vinculado al deal.`,
      area: 'Comercial',
      opportunityId,
      opportunityName: companyName,
    });
  },
};
