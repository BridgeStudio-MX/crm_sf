import { useMemo } from 'react';

import { ParksRenovacionesSummary } from '@/parks-industrial/components/renovaciones/ParksRenovacionesSummary';
import { useParksHoldovers } from '@/parks-industrial/hooks/useParksRecords';
import { useParksObjectMetadataItem } from '@/parks-industrial/hooks/useParksObjectMetadataItem';
import {
  buildParksRenovacionesSummary,
  type ParksRenovacionQueueItem,
} from '@/parks-industrial/utils/parks-renovaciones.util';

type ParksRenovacionesSummarySectionProps = {
  queue: ParksRenovacionQueueItem[];
};

const ParksRenovacionesSummaryWithHoldovers = ({
  queue,
}: ParksRenovacionesSummarySectionProps) => {
  const { records: holdovers } = useParksHoldovers();
  const summary = useMemo(
    () => buildParksRenovacionesSummary({ queue, holdovers }),
    [holdovers, queue],
  );

  return <ParksRenovacionesSummary summary={summary} />;
};

export const ParksRenovacionesSummarySection = ({
  queue,
}: ParksRenovacionesSummarySectionProps) => {
  const { isParksMetadataReady } = useParksObjectMetadataItem('holdover');
  const summaryWithoutHoldovers = useMemo(
    () => buildParksRenovacionesSummary({ queue, holdovers: [] }),
    [queue],
  );

  if (!isParksMetadataReady) {
    return <ParksRenovacionesSummary summary={summaryWithoutHoldovers} />;
  }

  return <ParksRenovacionesSummaryWithHoldovers queue={queue} />;
};
