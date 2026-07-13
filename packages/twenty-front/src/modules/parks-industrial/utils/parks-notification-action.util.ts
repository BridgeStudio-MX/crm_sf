import { AppPath } from 'twenty-shared/types';

export const PARKS_NOTIFICATION_ACTION = {
  pipelineDeal: (opportunityId: string, options?: {
    tab?: string;
    section?: string;
  }) => {
    const params = new URLSearchParams({ dealId: opportunityId });

    if (options?.tab) {
      params.set('tab', options.tab);
    }

    if (options?.section) {
      params.set('section', options.section);
    }

    return `${AppPath.ParksPipeline}?${params.toString()}`;
  },
  contratos: () => AppPath.ParksContratos,
  legalPipeline: () => AppPath.ParksLegalPipeline,
  leadsCem: () => AppPath.ParksLeadsCem,
} as const;

export const resolveParksNotificationActionLabel = (actionPath?: string) => {
  if (!actionPath) {
    return null;
  }

  if (actionPath.includes('/parks/contratos/') && actionPath.includes('/aprobacion')) {
    return 'Abrir caso';
  }

  if (actionPath.includes('tab=hoja') || actionPath.includes('section=hoja')) {
    return 'Ir a firmar Hoja';
  }

  if (actionPath.includes('/parks/pipeline')) {
    return 'Abrir deal';
  }

  if (actionPath.includes('/parks/contratos')) {
    return 'Ver contratos';
  }

  if (actionPath.includes('/parks/legal-pipeline')) {
    return 'Ver pipeline legal';
  }

  if (actionPath.includes('/parks/leads-cem')) {
    return 'Ver cola CEM';
  }

  return 'Ir a la acción';
};
