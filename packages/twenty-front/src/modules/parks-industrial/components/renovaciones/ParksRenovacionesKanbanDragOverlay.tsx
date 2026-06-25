import { DragOverlay, useDragOperation } from '@dnd-kit/react';
import { styled } from '@linaria/react';

import { ParksRenovacionesKanbanCardView } from '@/parks-industrial/components/renovaciones/ParksRenovacionesKanbanCard';
import { getParksRenovacionStageColor } from '@/parks-industrial/constants/parks-industrial.constants';
import { type ParksRenovacionKanbanItem } from '@/parks-industrial/utils/parks-renovaciones.util';
import { getParksRenovacionStageTheme } from '@/parks-industrial/utils/parks-format.util';

const StyledOverlay = styled.div`
  cursor: grabbing;
  width: 280px;
`;

type ParksRenovacionesKanbanDragOverlayProps = {
  itemsByDragId: Map<string, ParksRenovacionKanbanItem>;
};

export const ParksRenovacionesKanbanDragOverlay = ({
  itemsByDragId,
}: ParksRenovacionesKanbanDragOverlayProps) => {
  const { source } = useDragOperation();
  const dragId = source?.id != null ? String(source.id) : null;
  const item = dragId ? itemsByDragId.get(dragId) : null;

  return (
    <DragOverlay>
      {item ? (
        <StyledOverlay>
          <ParksRenovacionesKanbanCardView
            item={item}
            stageTheme={getParksRenovacionStageTheme(
              getParksRenovacionStageColor(item.etapaRenovacionStageId),
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
