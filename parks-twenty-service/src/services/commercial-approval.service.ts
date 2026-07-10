import { envConfig } from '../config/env.config';
import { toSelectValue } from '../utils/select-value.util';
import { brokerNotificationStore } from './broker-notification.store';
import { twentyDataService } from './twenty-data.service';

export type RequestApprovalInput = {
  opportunityId: string;
  companyName?: string;
  descuentoPct?: number;
  condicionSignificativa?: boolean;
  condicionesPropuestas: string;
};

export type ResolveApprovalInput = {
  opportunityId: string;
  decision: 'Aprobada' | 'Rechazada';
  comentario: string;
  resolvedBy: string;
};

const resolveApprovalLevel = (input: {
  descuentoPct?: number;
  condicionSignificativa?: boolean;
}): 'CEM' | 'CEO' => {
  if (input.condicionSignificativa) {
    return 'CEO';
  }

  if (
    typeof input.descuentoPct === 'number' &&
    input.descuentoPct > envConfig.aprobacionCemDescuentoPctMax
  ) {
    return 'CEO';
  }

  return 'CEM';
};

export const commercialApprovalService = {
  request: async (
    input: RequestApprovalInput,
  ): Promise<{
    opportunityId: string;
    nivelAprobacion: string;
    estatusAprobacion: string;
  }> => {
    const nivelAprobacion = resolveApprovalLevel({
      descuentoPct: input.descuentoPct,
      condicionSignificativa: input.condicionSignificativa,
    });

    await twentyDataService.updateOpportunity(input.opportunityId, {
      condicionesEspeciales: true,
      aprobacionRequerida: true,
      nivelAprobacion: toSelectValue(nivelAprobacion),
      estatusAprobacion: toSelectValue('Pendiente'),
      comentarioAprobacion: input.condicionesPropuestas,
    });

    brokerNotificationStore.add({
      type: 'alert',
      priority: 'high',
      title: `Aprobación ${nivelAprobacion} requerida`,
      body: `${input.companyName ?? 'Oportunidad'}: ${input.condicionesPropuestas}`,
      area: nivelAprobacion === 'CEO' ? 'CEO' : 'CEM',
      opportunityId: input.opportunityId,
      opportunityName: input.companyName,
    });

    return {
      opportunityId: input.opportunityId,
      nivelAprobacion,
      estatusAprobacion: 'Pendiente',
    };
  },

  resolve: async (
    input: ResolveApprovalInput,
  ): Promise<{ opportunityId: string; estatusAprobacion: string }> => {
    await twentyDataService.updateOpportunity(input.opportunityId, {
      estatusAprobacion: toSelectValue(input.decision),
      comentarioAprobacion: `${input.resolvedBy}: ${input.comentario}`,
      aprobacionRequerida: input.decision !== 'Aprobada',
    });

    brokerNotificationStore.add({
      type: 'alert',
      priority: input.decision === 'Aprobada' ? 'normal' : 'high',
      title: `Aprobación ${input.decision.toLowerCase()}`,
      body: `${input.resolvedBy}: ${input.comentario}`,
      area: 'Comercial',
      opportunityId: input.opportunityId,
    });

    return {
      opportunityId: input.opportunityId,
      estatusAprobacion: input.decision,
    };
  },
};
