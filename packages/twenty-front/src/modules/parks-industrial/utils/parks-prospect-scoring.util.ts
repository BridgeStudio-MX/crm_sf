import {
  PROSPECT_INDUSTRY_PROFILES,
  resolveProspectIndustryKey,
} from '@/parks-industrial/constants/parks-prospect-industry.constants';
import {
  type ProspectScoreResult,
  type ProspectScoreTier,
} from '@/parks-industrial/types/parks-commercial.types';

export type ProspectScoreInput = {
  companyName: string;
  industryHint?: string;
  m2Requeridos?: number;
  amountMicros?: number;
};

const resolveTier = (fitScore: number): ProspectScoreTier => {
  if (fitScore >= 80) {
    return 'hot';
  }

  if (fitScore >= 65) {
    return 'warm';
  }

  return 'cold';
};

const resolveScoreLabel = (tier: ProspectScoreTier): string => {
  if (tier === 'hot') {
    return 'Hot lead';
  }

  if (tier === 'warm') {
    return 'Warm lead';
  }

  return 'Cold lead';
};

const computeM2Boost = (m2Requeridos?: number): number => {
  if (!m2Requeridos || m2Requeridos <= 0) {
    return 0;
  }

  if (m2Requeridos >= 5000) {
    return 8;
  }

  if (m2Requeridos >= 2000) {
    return 4;
  }

  return 0;
};

const computeTicketBoost = (amountMicros?: number): number => {
  if (!amountMicros || amountMicros <= 0) {
    return 0;
  }

  const amountUsd = amountMicros / 1_000_000;

  if (amountUsd >= 500_000) {
    return 6;
  }

  if (amountUsd >= 200_000) {
    return 3;
  }

  return 0;
};

export const computeParksProspectScore = (
  input: ProspectScoreInput,
): ProspectScoreResult => {
  const profileKey = resolveProspectIndustryKey(
    input.companyName,
    input.industryHint,
  );
  const profile = PROSPECT_INDUSTRY_PROFILES[profileKey];
  const nameVariance = input.companyName.trim().length % 7;
  const fitScore = Math.min(
    99,
    profile.fitScore +
      computeM2Boost(input.m2Requeridos) +
      computeTicketBoost(input.amountMicros) +
      nameVariance,
  );
  const tier = resolveTier(fitScore);
  let urgency = profile.urgency;

  if (input.m2Requeridos && input.m2Requeridos >= 5000 && urgency !== 'alta') {
    urgency = 'alta';
  }

  return {
    fitScore,
    urgency,
    tier,
    industry: profile.industry,
    scoreLabel: resolveScoreLabel(tier),
  };
};

export const getParksProspectScoreBadgeColor = (
  tier: ProspectScoreTier,
): 'green' | 'yellow' | 'gray' => {
  if (tier === 'hot') {
    return 'green';
  }

  if (tier === 'warm') {
    return 'yellow';
  }

  return 'gray';
};

export const formatParksProspectUrgencyLabel = (
  urgency: ProspectScoreResult['urgency'],
): string => {
  if (urgency === 'alta') {
    return 'Alta';
  }

  if (urgency === 'baja') {
    return 'Baja';
  }

  return 'Media';
};
