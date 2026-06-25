import { styled } from '@linaria/react';
import { t } from '@lingui/core/macro';
import { useState } from 'react';
import { AppPath } from 'twenty-shared/types';
import { Link } from 'react-router-dom';

import { ParksRenovacionesHoldovers } from '@/parks-industrial/components/renovaciones/ParksRenovacionesHoldovers';
import { ParksRenovacionesKanbanBoard } from '@/parks-industrial/components/renovaciones/ParksRenovacionesKanbanBoard';
import { ParksRenovacionesQueue } from '@/parks-industrial/components/renovaciones/ParksRenovacionesQueue';
import { ParksRenovacionesSummarySection } from '@/parks-industrial/components/renovaciones/ParksRenovacionesSummarySection';
import { ParksSegmentedControl } from '@/parks-industrial/components/ui/ParksSegmentedControl';
import { StyledParksPageStack } from '@/parks-industrial/components/ui/ParksSectionCard';
import { ParksLoadingSkeleton } from '@/parks-industrial/components/ui/ParksLoadingSkeleton';
import {
  useParksOpportunities,
  useParksRenovaciones,
} from '@/parks-industrial/hooks/useParksRecords';
import { type ParksRenovacionRiskBand } from '@/parks-industrial/utils/parks-renovaciones.util';
import { themeCssVariables } from 'twenty-ui/theme-constants';

type RenovacionesTab = 'queue' | 'kanban' | 'holdovers';

const StyledToolbar = styled.div`
  align-items: center;
  display: flex;
  flex-wrap: wrap;
  gap: ${themeCssVariables.spacing[3]};
  justify-content: space-between;
`;

const StyledPipelineLink = styled(Link)`
  color: ${themeCssVariables.color.blue};
  font-size: ${themeCssVariables.font.size.sm};
  text-decoration: none;

  &:hover {
    text-decoration: underline;
  }
`;

export const ParksRenovacionesContent = () => {
  const { queue, loading } = useParksRenovaciones();
  const { records: opportunities, loading: opportunitiesLoading } =
    useParksOpportunities();
  const [activeTab, setActiveTab] = useState<RenovacionesTab>('queue');
  const [riskFilter, setRiskFilter] = useState<
    ParksRenovacionRiskBand | 'all'
  >('all');

  if (loading || opportunitiesLoading) {
    return <ParksLoadingSkeleton variant="list" />;
  }

  return (
    <StyledParksPageStack>
      <ParksRenovacionesSummarySection queue={queue} />
      <StyledToolbar>
        <ParksSegmentedControl
          value={activeTab}
          onChange={setActiveTab}
          options={[
            { id: 'queue', label: t`Cola de renovación`, count: queue.length },
            { id: 'kanban', label: t`Kanban`, count: queue.length },
            {
              id: 'holdovers',
              label: t`Holdovers`,
            },
          ]}
        />
        <StyledPipelineLink to={AppPath.ParksPipeline}>
          {t`Ver pipeline comercial →`}
        </StyledPipelineLink>
      </StyledToolbar>
      {activeTab === 'queue' ? (
        <ParksRenovacionesQueue
          items={queue}
          activeRiskFilter={riskFilter}
          onRiskFilterChange={setRiskFilter}
        />
      ) : activeTab === 'kanban' ? (
        <ParksRenovacionesKanbanBoard
          queue={queue}
          opportunities={opportunities}
        />
      ) : (
        <ParksRenovacionesHoldovers />
      )}
    </StyledParksPageStack>
  );
};
