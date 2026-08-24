import { t } from '@lingui/core/macro';

import { ParksInventoryExplorer } from '@/parks-industrial/components/portfolio/ParksInventoryExplorer';

type ParksCeoParkCardsProps = {
  title?: string;
};

export const ParksCeoParkCards = ({ title }: ParksCeoParkCardsProps) => (
  <ParksInventoryExplorer title={title ?? t`Inventario por parque`} />
);
