import { useEffect, useMemo, useState } from 'react';

import { type ParksOpportunityRecord } from '@/parks-industrial/hooks/useParksRecords';
import { fetchParksProspectScores } from '@/parks-industrial/services/parks-commercial.client';
import { type ProspectScoreResult } from '@/parks-industrial/types/parks-commercial.types';
import { computeParksProspectScore } from '@/parks-industrial/utils/parks-prospect-scoring.util';

const buildScoreInput = (deal: ParksOpportunityRecord) => ({
  opportunityId: deal.id,
  companyName:
    deal.inquilinoVinculado?.empresa ?? deal.name ?? 'Prospecto',
  m2Requeridos: deal.m2Requeridos,
  amountMicros: deal.amount?.amountMicros,
});

export const useParksProspectScores = (
  opportunities: ParksOpportunityRecord[],
) => {
  const [scoresById, setScoresById] = useState<
    Record<string, ProspectScoreResult>
  >({});

  const scoreInputs = useMemo(
    () => opportunities.map((deal) => buildScoreInput(deal)),
    [opportunities],
  );

  const scoreInputsKey = useMemo(
    () =>
      scoreInputs
        .map(
          (input) =>
            `${input.opportunityId}:${input.companyName}:${input.m2Requeridos ?? 0}:${input.amountMicros ?? 0}`,
        )
        .join('|'),
    [scoreInputs],
  );

  useEffect(() => {
    if (scoreInputs.length === 0) {
      setScoresById({});
      return;
    }

    let cancelled = false;

    const loadScores = async () => {
      try {
        const response = await fetchParksProspectScores(scoreInputs);

        if (!cancelled) {
          setScoresById(response.scores);
        }
      } catch {
        if (!cancelled) {
          const fallbackScores = scoreInputs.reduce<
            Record<string, ProspectScoreResult>
          >((accumulator, input) => {
            accumulator[input.opportunityId] = computeParksProspectScore({
              companyName: input.companyName,
              m2Requeridos: input.m2Requeridos,
              amountMicros: input.amountMicros,
            });

            return accumulator;
          }, {});

          setScoresById(fallbackScores);
        }
      }
    };

    void loadScores();

    return () => {
      cancelled = true;
    };
  }, [scoreInputs, scoreInputsKey]);

  return scoresById;
};
