import { toSelectValue } from '../utils/select-value.util';
import { evaluateConsejoApproval } from '../utils/consejo-approval.util';
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

export type QuotationAdjacentCost = {
  concepto: string;
  monto: number;
  tipo: 'unica_vez' | 'recurrente';
};

export type QuotationHistoryEntry = {
  enviadaEn: string;
  m2Ofertados: number;
  precioPorM2: number;
  moneda: 'MXN' | 'USD';
  rentaMensualCalculada: number;
  plazoContratoMeses?: number;
  costosAledanos?: QuotationAdjacentCost[];
  naveIdentificador?: string;
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
  naveIdentificador?: string;
  moneda?: 'MXN' | 'USD';
  costosAledanos?: QuotationAdjacentCost[];
};

const parseQuotationHistory = (
  raw?: string | null,
): QuotationHistoryEntry[] => {
  if (!raw?.trim()) {
    return [];
  }

  try {
    const parsed = JSON.parse(raw) as QuotationHistoryEntry[];

    return Array.isArray(parsed) ? parsed : [];
  } catch {
    return [];
  }
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
    requiresConsejoApproval: boolean;
    consejoReasons: string[];
  }> => {
    const rentaMensualCalculada =
      Math.round(input.m2Ofertados * input.precioPorM2Usd * 100) / 100;
    const today = twentyDataService.todayIsoDate();
    const followUpDue = addBusinessDays(new Date(), 5);
    const moneda = input.moneda ?? 'USD';
    const consejoCheck = evaluateConsejoApproval({
      m2Ofertados: input.m2Ofertados,
      rentaMensualCalculada,
    });

    const existingOpportunity = await twentyDataService.getOpportunityById(
      input.opportunityId,
    );
    const history = parseQuotationHistory(
      existingOpportunity?.cotizacionHistorialJson as string | undefined,
    );

    const historyEntry: QuotationHistoryEntry = {
      enviadaEn: today,
      m2Ofertados: input.m2Ofertados,
      precioPorM2: input.precioPorM2Usd,
      moneda,
      rentaMensualCalculada,
      plazoContratoMeses: input.plazoContratoMeses,
      costosAledanos: input.costosAledanos,
      naveIdentificador: input.naveIdentificador,
    };

    const updateData: Record<string, unknown> = {
      m2Ofertados: input.m2Ofertados,
      precioPorM2Usd: input.precioPorM2Usd,
      rentaMensualCalculada,
      cotizacionEnviadaEn: today,
      monedaCotizacion: toSelectValue(moneda),
      costosAledanosJson: JSON.stringify(input.costosAledanos ?? []),
      cotizacionHistorialJson: JSON.stringify([historyEntry, ...history]),
      stage: toSelectValue('Cotización enviada'),
    };

    if (consejoCheck.requiresConsejo) {
      updateData.condicionesEspeciales = true;
      updateData.aprobacionRequerida = true;
      updateData.nivelAprobacion = toSelectValue('CEO');
      updateData.estatusAprobacion = toSelectValue('Pendiente');
      updateData.comentarioAprobacion = `Requiere aprobación de consejo: ${consejoCheck.reasons.join(' · ')}`;
    }

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
      `Dar seguimiento a cotización enviada. Renta mensual: ${moneda} ${rentaMensualCalculada}. Vence: ${followUpDue}.`,
    );

    brokerNotificationStore.add({
      type: 'task',
      priority: consejoCheck.requiresConsejo ? 'high' : 'normal',
      title: consejoCheck.requiresConsejo
        ? `Cotización ${companyName} — requiere consejo`
        : `Seguimiento cotización ${companyName}`,
      body: consejoCheck.requiresConsejo
        ? consejoCheck.reasons.join(' · ')
        : `Tarea automática a 5 días hábiles. Renta: ${moneda} ${rentaMensualCalculada}/mes.`,
      area: consejoCheck.requiresConsejo ? 'CEO' : 'Comercial',
      opportunityId: input.opportunityId,
      opportunityName: companyName,
    });

    return {
      opportunityId: input.opportunityId,
      rentaMensualCalculada,
      cotizacionEnviadaEn: today,
      followUpDue,
      requiresConsejoApproval: consejoCheck.requiresConsejo,
      consejoReasons: consejoCheck.reasons,
    };
  },
};
