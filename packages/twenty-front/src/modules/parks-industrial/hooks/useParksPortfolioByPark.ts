import { useMemo } from 'react';

import { useParksParques } from '@/parks-industrial/hooks/useParksParques';
import {
  useParksNaves,
  useParksOpportunities,
} from '@/parks-industrial/hooks/useParksRecords';
import {
  buildParksCeoDemoPortfolio,
  withParksConstructionDemoExamples,
} from '@/parks-industrial/utils/parks-ceo-demo-portfolio.util';
import { buildParksPortfolioByPark } from '@/parks-industrial/utils/parks-portfolio-by-park.util';

const EMPTY_PARQUES: ReturnType<typeof useParksParques>['records'] = [];
const EMPTY_NAVES: ReturnType<typeof useParksNaves>['records'] = [];
const EMPTY_OPPORTUNITIES: ReturnType<
  typeof useParksOpportunities
>['records'] = [];

export const useParksPortfolioByPark = () => {
  const { records: parques, loading: parquesLoading } = useParksParques();
  const { records: naves, loading: navesLoading } = useParksNaves();
  const { records: opportunities, loading: opportunitiesLoading } =
    useParksOpportunities();

  const portfolio = useMemo(() => {
    const livePortfolio = buildParksPortfolioByPark({
      parques: parques ?? EMPTY_PARQUES,
      naves: naves ?? EMPTY_NAVES,
      opportunities: opportunities ?? EMPTY_OPPORTUNITIES,
    });

    return withParksConstructionDemoExamples(
      livePortfolio.parqueCount > 0
        ? livePortfolio
        : buildParksCeoDemoPortfolio(),
    );
  }, [naves, opportunities, parques]);

  return {
    portfolio,
    loading: parquesLoading || navesLoading || opportunitiesLoading,
  };
};
