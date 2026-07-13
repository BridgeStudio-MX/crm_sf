import { toSelectValue } from '../utils/select-value.util';
import { brokerNotificationStore } from './broker-notification.store';
import { twentyDataService } from './twenty-data.service';

const addBusinessDays = (startDate: Date, businessDays: number): string => {
  const result = new Date(startDate);
  let remaining = businessDays;

  while (remaining > 0) {
    result.setDate(result.getDate() + 1);
    const dayOfWeek = result.getDay();

    if (dayOfWeek !== 0 && dayOfWeek !== 6) {
      remaining -= 1;
    }
  }

  return result.toISOString().slice(0, 10);
};

export type QuotationInput = {
  opportunityId: string;
  m2Ofertados: number;
  precioPorM2Usd: number;
  plazoContratoMeses?: number;
  periodoGraciaMeses?: number;
  depositoGarantiaMeses?: number;
  rentasAdelantadasMeses?: number;
  escalacionAnual?: string;
  porcentajeEscalacion?: number;
  companyName?: string;
  naveVinculadaId?: string;
};

export const commercialQuotationService = {
  preview: (input: {
    m2Ofertados: number;
    precioPorM2Usd: number;
  }): { rentaMensualCalculada: number } => ({
    rentaMensualCalculada:
      Math.round(input.m2Ofertados * input.precioPorM2Usd * 100) / 100,
  }),

  send: async (
    input: QuotationInput,
  ): Promise<{
    opportunityId: string;
    rentaMensualCalculada: number;
    cotizacionEnviadaEn: string;
    followUpDue: string;
  }> => {
    const rentaMensualCalculada =
      Math.round(input.m2Ofertados * input.precioPorM2Usd * 100) / 100;
    const today = twentyDataService.todayIsoDate();
    const followUpDue = addBusinessDays(new Date(), 5);

    const updateData: Record<string, unknown> = {
      m2Ofertados: input.m2Ofertados,
      precioPorM2Usd: input.precioPorM2Usd,
      rentaMensualCalculada,
      cotizacionEnviadaEn: today,
      stage: toSelectValue('Cotización enviada'),
    };

    if (input.naveVinculadaId) {
      updateData.naveVinculadaId = input.naveVinculadaId;
    }

    if (input.plazoContratoMeses !== undefined) {
      updateData.plazoContratoMeses = input.plazoContratoMeses;
    }

    if (input.periodoGraciaMeses !== undefined) {
      updateData.periodoGraciaMeses = input.periodoGraciaMeses;
    }

    if (input.depositoGarantiaMeses !== undefined) {
      updateData.depositoGarantiaMeses = input.depositoGarantiaMeses;
    }

    if (input.rentasAdelantadasMeses !== undefined) {
      updateData.rentasAdelantadasMeses = input.rentasAdelantadasMeses;
    }

    if (input.escalacionAnual) {
      updateData.escalacionAnual = input.escalacionAnual;
    }

    if (input.porcentajeEscalacion !== undefined) {
      updateData.porcentajeEscalacion = input.porcentajeEscalacion;
    }

    await twentyDataService.updateOpportunity(input.opportunityId, updateData);

    const companyName = input.companyName ?? 'prospecto';

    await twentyDataService.createTask(
      `[LO] Seguimiento de cotización — ${companyName}`,
      `Dar seguimiento a cotización enviada. Renta mensual: USD ${rentaMensualCalculada}. Vence: ${followUpDue}.`,
    );

    brokerNotificationStore.add({
      type: 'task',
      priority: 'normal',
      title: `Seguimiento cotización ${companyName}`,
      body: `Tarea automática a 5 días hábiles. Renta: USD ${rentaMensualCalculada}/mes.`,
      area: 'Comercial',
      opportunityId: input.opportunityId,
      opportunityName: companyName,
    });

    return {
      opportunityId: input.opportunityId,
      rentaMensualCalculada,
      cotizacionEnviadaEn: today,
      followUpDue,
    };
  },
};
