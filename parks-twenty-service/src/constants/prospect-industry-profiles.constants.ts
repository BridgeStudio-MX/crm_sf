export type ProspectIndustryProfile = {
  industry: string;
  fitScore: number;
  urgency: 'alta' | 'media' | 'baja';
  riskLevel: 'bajo' | 'medio' | 'alto';
};

export const PROSPECT_INDUSTRY_PROFILES: Record<
  string,
  ProspectIndustryProfile
> = {
  logistica: {
    industry: 'Logística y distribución',
    fitScore: 82,
    urgency: 'alta',
    riskLevel: 'bajo',
  },
  alimentos: {
    industry: 'Alimentos y bebidas',
    fitScore: 76,
    urgency: 'media',
    riskLevel: 'medio',
  },
  automotriz: {
    industry: 'Automotriz y autopartes',
    fitScore: 88,
    urgency: 'alta',
    riskLevel: 'bajo',
  },
  default: {
    industry: 'Manufactura general',
    fitScore: 68,
    urgency: 'media',
    riskLevel: 'medio',
  },
};

export const resolveProspectIndustryKey = (
  companyName: string,
  industryHint?: string,
): keyof typeof PROSPECT_INDUSTRY_PROFILES => {
  const normalized = `${companyName} ${industryHint ?? ''}`.toLowerCase();

  if (
    normalized.includes('logistic') ||
    normalized.includes('acme') ||
    normalized.includes('transport')
  ) {
    return 'logistica';
  }

  if (
    normalized.includes('food') ||
    normalized.includes('alimento') ||
    normalized.includes('nestle') ||
    normalized.includes('nestlé') ||
    normalized.includes('genomma')
  ) {
    return 'alimentos';
  }

  if (
    normalized.includes('auto') ||
    normalized.includes('part') ||
    normalized.includes('tier')
  ) {
    return 'automotriz';
  }

  return 'default';
};
