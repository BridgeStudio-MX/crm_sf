import { pointerIntersection } from '@dnd-kit/collision';
import { useDroppable } from '@dnd-kit/react';
import { styled } from '@linaria/react';
import { t } from '@lingui/core/macro';
import { Tag } from 'twenty-ui/data-display';
import { themeCssVariables } from 'twenty-ui/theme-constants';

import { ParksRenovacionesKanbanCard } from '@/parks-industrial/components/renovaciones/ParksRenovacionesKanbanCard';
import {
  getParksRenovacionStageColor,
  type ParksPipelineStageColor,
} from '@/parks-industrial/constants/parks-industrial.constants';
import { type ParksRenovacionKanbanItem } from '@/parks-industrial/utils/parks-renovaciones.util';
import {
  formatParksUsd,
  getParksRenovacionStageTheme,
  type ParksPipelineStageTheme,
} from '@/parks-industrial/utils/parks-format.util';

const StyledColumnWrapper = styled.div`
  flex-shrink: 0;
  min-width: 280px;
`;

const StyledColumnHeader = styled.div<{ accentColor: string }>`
  background: ${themeCssVariables.background.primary};
  border: 1px solid ${themeCssVariables.border.color.medium};
  border-radius: ${themeCssVariables.border.radius.md};
  border-top: 4px solid ${({ accentColor }) => accentColor};
  margin-bottom: ${themeCssVariables.spacing[2]};
  padding: ${themeCssVariables.spacing[3]};
`;

const StyledColumnTitleRow = styled.div`
  align-items: center;
  display: flex;
  gap: ${themeCssVariables.spacing[2]};
  justify-content: space-between;
`;

const StyledColumnTitle = styled.strong`
  color: ${themeCssVariables.font.color.secondary};
  font-size: ${themeCssVariables.font.size.sm};
  font-weight: ${themeCssVariables.font.weight.medium};
`;

const StyledColumnTotal = styled.div<{ accentColor: string }>`
  color: ${({ accentColor }) => accentColor};
  font-size: ${themeCssVariables.font.size.lg};
  font-weight: ${themeCssVariables.font.weight.semiBold};
  margin-top: ${themeCssVariables.spacing[2]};
`;

const StyledColumnTotalLabel = styled.div`
  color: ${themeCssVariables.font.color.tertiary};
  font-size: ${themeCssVariables.font.size.xs};
  margin-top: ${themeCssVariables.spacing[1]};
`;

const StyledColumnBody = styled.div<{
  backgroundColor: string;
  borderColor: string;
  isDropTarget: boolean;
}>`
  background: ${({ backgroundColor, isDropTarget }) =>
    isDropTarget ? backgroundColor : themeCssVariables.background.tertiary};
  border: 2px dashed
    ${({ borderColor, isDropTarget }) =>
      isDropTarget ? borderColor : themeCssVariables.border.color.medium};
  border-radius: ${themeCssVariables.border.radius.md};
  min-height: 360px;
  padding: ${themeCssVariables.spacing[2]};
  transition:
    background 0.15s ease,
    border-color 0.15s ease;
`;

const StyledEmptyColumnHint = styled.div<{ isDropTarget: boolean }>`
  color: ${({ isDropTarget }) =>
    isDropTarget
      ? themeCssVariables.font.color.primary
      : themeCssVariables.font.color.tertiary};
  font-size: ${themeCssVariables.font.size.xs};
  padding: ${themeCssVariables.spacing[4]} ${themeCssVariables.spacing[2]};
  text-align: center;
`;

export type ParksRenovacionKanbanColumnStage = {
  id: string;
  label: string;
  color: ParksPipelineStageColor | 'red';
};

type ParksRenovacionesKanbanColumnProps = {
  stage: ParksRenovacionKanbanColumnStage;
  items: ParksRenovacionKanbanItem[];
  selectedDragId: string | null;
  draggingDragId: string | null;
  onSelectItem: (dragId: string) => void;
};

const getStageTheme = (
  color: ParksPipelineStageColor | 'red',
): ParksPipelineStageTheme => getParksRenovacionStageTheme(color);

export const ParksRenovacionesKanbanColumn = ({
  stage,
  items,
  selectedDragId,
  draggingDragId,
  onSelectItem,
}: ParksRenovacionesKanbanColumnProps) => {
  const stageTheme = getStageTheme(stage.color);
  const { ref, isDropTarget } = useDroppable({
    id: stage.id,
    data: { stageId: stage.id },
    collisionDetector: pointerIntersection,
  });

  const stageTotal = items.reduce(
    (sum, item) => sum + item.ingresoMensualUsd,
    0,
  );
  const tagColor =
    stage.color === 'red' ? 'red' : (stage.color as ParksPipelineStageColor);

  return (
    <StyledColumnWrapper ref={ref}>
      <StyledColumnHeader accentColor={stageTheme.accent}>
        <StyledColumnTitleRow>
          <StyledColumnTitle>{stage.label}</StyledColumnTitle>
          <Tag
            color={tagColor}
            text={String(items.length)}
            variant="solid"
            weight="medium"
          />
        </StyledColumnTitleRow>
        <StyledColumnTotal accentColor={stageTheme.accent}>
          {formatParksUsd(stageTotal)}
        </StyledColumnTotal>
        <StyledColumnTotalLabel>{t`ingreso mensual`}</StyledColumnTotalLabel>
      </StyledColumnHeader>

      <StyledColumnBody
        backgroundColor={stageTheme.dragHighlight}
        borderColor={stageTheme.accent}
        isDropTarget={isDropTarget}
      >
        {items.length === 0 ? (
          <StyledEmptyColumnHint isDropTarget={isDropTarget}>
            {isDropTarget ? t`Suelta aquí` : t`Arrastra renovaciones aquí`}
          </StyledEmptyColumnHint>
        ) : (
          items.map((item) => (
            <ParksRenovacionesKanbanCard
              key={item.dragId}
              item={item}
              stageTheme={getStageTheme(
                getParksRenovacionStageColor(item.etapaRenovacionStageId),
              )}
              isSelected={selectedDragId === item.dragId}
              isOverlayPreview={false}
              onSelect={onSelectItem}
            />
          ))
        )}
      </StyledColumnBody>
    </StyledColumnWrapper>
  );
};
