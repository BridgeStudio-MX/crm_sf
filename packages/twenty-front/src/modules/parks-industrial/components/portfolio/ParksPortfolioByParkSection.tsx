import { t } from '@lingui/core/macro';

import { ParksInventoryExplorer } from '@/parks-industrial/components/portfolio/ParksInventoryExplorer';

type ParksPortfolioByParkSectionProps = {
  showIntro?: boolean;
};

export const ParksPortfolioByParkSection = (
  _props?: ParksPortfolioByParkSectionProps,
) => (
  <ParksInventoryExplorer
    title={t`Pipeline por parque`}
    showPipelineLink={true}
  />
);
