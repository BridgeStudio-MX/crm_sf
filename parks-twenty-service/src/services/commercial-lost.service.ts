import { toSelectValue } from '../utils/select-value.util';
import { brokerNotificationStore } from './broker-notification.store';
import { twentyClient } from './twenty.client';
import { twentyDataService } from './twenty-data.service';

export type MarkLostInput = {
  opportunityId: string;
  motivoPerdida: string;
  competidor?: string;
  fechaReactivacion?: string;
  razonPerdidaDetalle?: string;
  companyName?: string;
};

export const commercialLostService = {
  markLost: async (
    input: MarkLostInput,
  ): Promise<{ opportunityId: string }> => {
    if (!input.motivoPerdida) {
      throw new Error('motivoPerdida is required');
    }

    if (input.motivoPerdida === 'Competencia' && !input.competidor) {
      throw new Error('competidor is required when motivo is Competencia');
    }

    if (input.motivoPerdida === 'Pospuesto' && !input.fechaReactivacion) {
      throw new Error(
        'fechaReactivacion is required when motivo is Pospuesto',
      );
    }

    await twentyDataService.updateOpportunity(input.opportunityId, {
      stage: toSelectValue('Perdido'),
      motivoPerdida: toSelectValue(input.motivoPerdida),
      competidor: input.competidor
        ? toSelectValue(input.competidor)
        : undefined,
      fechaReactivacion: input.fechaReactivacion,
      razonPerdidaDetalle: input.razonPerdidaDetalle,
    });

    if (input.motivoPerdida === 'Pospuesto' && input.fechaReactivacion) {
      await twentyDataService.createTask(
        `[LO] Recontactar ${input.companyName ?? 'prospecto'}`,
        `Oportunidad pospuesta. Reactivar el ${input.fechaReactivacion}. Motivo: ${input.razonPerdidaDetalle ?? 'N/A'}`,
      );

      brokerNotificationStore.add({
        type: 'task',
        priority: 'normal',
        title: `Reactivación programada ${input.fechaReactivacion}`,
        body: `${input.companyName ?? 'Prospecto'} pospuso. Tarea de recontacto creada.`,
        area: 'Comercial',
        opportunityId: input.opportunityId,
        opportunityName: input.companyName,
      });
    }

    return { opportunityId: input.opportunityId };
  },

  matchDisponibleNave: async (nave: {
    id: string;
    identificador?: string;
    m2?: number;
    ubicacion?: string;
    parqueNombre?: string;
  }): Promise<number> => {
    if (!nave.m2 || nave.m2 <= 0) {
      return 0;
    }

    const minM2 = nave.m2 * 0.8;
    const maxM2 = nave.m2 * 1.2;

    let opportunities: Array<{
      id: string;
      name?: string;
      m2Requeridos?: number;
      ubicacionDeseada?: string;
      motivoPerdida?: string;
    }> = [];

    try {
      const response = await twentyClient.query<{
        opportunities: {
          edges: Array<{
            node: {
              id: string;
              name?: string;
              m2Requeridos?: number;
              ubicacionDeseada?: string;
              motivoPerdida?: string;
            };
          }>;
        };
      }>(
        `
        query LostWithoutAvailability {
          opportunities(
            filter: {
              and: [
                { stage: { eq: "PERDIDO" } }
                { motivoPerdida: { eq: "SIN_DISPONIBILIDAD" } }
              ]
            }
            first: 100
          ) {
            edges {
              node {
                id
                name
                m2Requeridos
                ubicacionDeseada
                motivoPerdida
              }
            }
          }
        }
      `,
      );
      opportunities = response.opportunities.edges.map((edge) => edge.node);
    } catch {
      return 0;
    }

    const ubicacionHint = (
      nave.ubicacion ??
      nave.parqueNombre ??
      ''
    ).toLowerCase();

    let matchCount = 0;

    for (const opportunity of opportunities) {
      const requiredM2 = opportunity.m2Requeridos ?? 0;

      if (requiredM2 < minM2 || requiredM2 > maxM2) {
        continue;
      }

      const desiredLocation = (opportunity.ubicacionDeseada ?? '').toLowerCase();

      if (
        ubicacionHint &&
        desiredLocation &&
        !ubicacionHint.includes(desiredLocation.replace(/_/g, ' ')) &&
        !desiredLocation.includes(ubicacionHint.split(',')[0] ?? '')
      ) {
        // Soft match: still notify if m² fits and location unknown
        if (desiredLocation.length > 0) {
          continue;
        }
      }

      matchCount += 1;

      brokerNotificationStore.add({
        type: 'alert',
        priority: 'high',
        title: `Nave disponible coincide con prospecto perdido`,
        body: `${nave.identificador ?? 'Nave'} (${nave.m2} m²) coincide con ${opportunity.name ?? opportunity.id}. Recontactar.`,
        area: 'Comercial',
        opportunityId: opportunity.id,
        opportunityName: opportunity.name,
      });

      await twentyDataService.createTask(
        `[LO] Recontactar — nave liberada`,
        `La nave ${nave.identificador ?? nave.id} está disponible y coincide con oportunidad perdida ${opportunity.name ?? opportunity.id}.`,
      );
    }

    return matchCount;
  },
};
