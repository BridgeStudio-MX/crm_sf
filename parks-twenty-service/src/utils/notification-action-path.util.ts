export const buildPipelineDealActionPath = (
  opportunityId: string,
  options?: { tab?: string; section?: string },
): string => {
  const params = new URLSearchParams({ dealId: opportunityId });

  if (options?.tab) {
    params.set('tab', options.tab);
  }

  if (options?.section) {
    params.set('section', options.section);
  }

  return `/parks/pipeline?${params.toString()}`;
};

export const PARKS_ACTION_PATH = {
  contratos: '/parks/contratos',
  legalPipeline: '/parks/legal-pipeline',
  leadsCem: '/parks/leads-cem',
} as const;

export const buildContratoAprobacionActionPath = (casoLegalId: string): string =>
  `/parks/contratos/${casoLegalId}/aprobacion`;
