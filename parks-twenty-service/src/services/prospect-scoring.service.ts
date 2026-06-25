import {
  PROSPECT_INDUSTRY_PROFILES,
  resolveProspectIndustryKey,
} from '../constants/prospect-industry-profiles.constants';

export type ProspectScoreTier = 'hot' | 'warm' | 'cold';

export type ProspectScoreResult = {
  fitScore: number;
  urgency: 'alta' | 'media' | 'baja';
  tier: ProspectScoreTier;
  industry: string;
  scoreLabel: string;
};

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

const bumpUrgency = (
  urgency: 'alta' | 'media' | 'baja',
  m2Requeridos?: number,
): 'alta' | 'media' | 'baja' => {
  if (m2Requeridos && m2Requeridos >= 5000 && urgency !== 'alta') {
    return 'alta';
  }

  return urgency;
};

export const prospectScoringService = {
  compute: (input: ProspectScoreInput): ProspectScoreResult => {
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

    return {
      fitScore,
      urgency: bumpUrgency(profile.urgency, input.m2Requeridos),
      tier,
      industry: profile.industry,
      scoreLabel: resolveScoreLabel(tier),
    };
  },

  computeBatch: (
    items: Array<{ opportunityId: string } & ProspectScoreInput>,
  ): Record<string, ProspectScoreResult> => {
    const scores: Record<string, ProspectScoreResult> = {};

    for (const item of items) {
      scores[item.opportunityId] = prospectScoringService.compute({
        companyName: item.companyName,
        industryHint: item.industryHint,
        m2Requeridos: item.m2Requeridos,
        amountMicros: item.amountMicros,
      });
    }

    return scores;
  },
};
