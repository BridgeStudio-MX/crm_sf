import { DragOverlay, useDragOperation } from '@dnd-kit/react';
import { styled } from '@linaria/react';

import { getParksPipelineStageColor } from '@/parks-industrial/constants/parks-industrial.constants';
import { type ParksOpportunityRecord } from '@/parks-industrial/hooks/useParksRecords';
import { ParksPipelineDealCardView } from '@/parks-industrial/components/pipeline/ParksPipelineDealCard';
import { getParksPipelineStageTheme } from '@/parks-industrial/utils/parks-format.util';

const StyledOverlay = styled.div`
  cursor: grabbing;
  width: 280px;
`;

type ParksPipelineDragOverlayProps = {
  dealsById: Map<string, ParksOpportunityRecord>;
};

export const ParksPipelineDragOverlay = ({
  dealsById,
}: ParksPipelineDragOverlayProps) => {
  const { source } = useDragOperation();
  const dealId = source?.id != null ? String(source.id) : null;
  const deal = dealId ? dealsById.get(dealId) : null;

  return (
    <DragOverlay>
      {deal ? (
        <StyledOverlay>
          <ParksPipelineDealCardView
            deal={deal}
            stageTheme={getParksPipelineStageTheme(
              getParksPipelineStageColor(deal.stage),
            )}
            isDragging={false}
            isSelected={false}
            isOverlayPreview
          />
        </StyledOverlay>
      ) : null}
    </DragOverlay>
  );
};
