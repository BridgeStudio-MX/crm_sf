import { useDraggable } from '@dnd-kit/react';
import { styled } from '@linaria/react';
import { t } from '@lingui/core/macro';
import { IconGripVertical } from 'twenty-ui/icon';
import { themeCssVariables } from 'twenty-ui/theme-constants';

import { ParksStatusBadge } from '@/parks-industrial/components/ui/ParksStatusBadge';
import {
  formatParksUsd,
  getParksStackingStatusLabel,
  type ParksPipelineStageTheme,
} from '@/parks-industrial/utils/parks-format.util';
import {
  getParksRenovacionStackingStatus,
  type ParksRenovacionKanbanItem,
} from '@/parks-industrial/utils/parks-renovaciones.util';

const StyledCard = styled.div<{
  accentColor: string;
  backgroundTint: string;
  isDragging: boolean;
  isSelected: boolean;
  isOverlayPreview: boolean;
}>`
  background: ${({ backgroundTint, isOverlayPreview }) =>
    isOverlayPreview
      ? themeCssVariables.background.primary
      : backgroundTint};
  border: 1px solid
    ${({ isSelected, accentColor, isDragging, isOverlayPreview }) =>
      isDragging || isSelected || isOverlayPreview
        ? accentColor
        : themeCssVariables.border.color.medium};
  border-left: 4px solid ${({ accentColor }) => accentColor};
  border-radius: ${themeCssVariables.border.radius.md};
  box-shadow: ${({ isDragging, isSelected, isOverlayPreview }) => {
    if (isOverlayPreview || isDragging) {
      return themeCssVariables.boxShadow.strong;
    }

    if (isSelected) {
      return themeCssVariables.boxShadow.light;
    }

    return 'none';
  }};
  cursor: ${({ isOverlayPreview }) => (isOverlayPreview ? 'grabbing' : 'grab')};
  display: flex;
  gap: ${themeCssVariables.spacing[1]};
  margin-bottom: ${themeCssVariables.spacing[2]};
  opacity: ${({ isDragging, isOverlayPreview }) =>
    isDragging && !isOverlayPreview ? 0.35 : 1};
  padding: ${themeCssVariables.spacing[2]};
  touch-action: none;
  user-select: none;
`;

const StyledDragHandle = styled.div`
  color: ${themeCssVariables.font.color.tertiary};
  display: flex;
  padding-top: 2px;
`;

const StyledContent = styled.div`
  flex: 1;
  min-width: 0;
`;

const StyledTitle = styled.div`
  font-weight: ${themeCssVariables.font.weight.medium};
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
`;

const StyledMeta = styled.div`
  color: ${themeCssVariables.font.color.secondary};
  font-size: ${themeCssVariables.font.size.xs};
  margin-top: ${themeCssVariables.spacing[1]};
`;

const StyledFooter = styled.div`
  align-items: center;
  display: flex;
  flex-wrap: wrap;
  gap: ${themeCssVariables.spacing[2]};
  margin-top: ${themeCssVariables.spacing[2]};
`;

type ParksRenovacionesKanbanCardViewProps = {
  item: ParksRenovacionKanbanItem;
  stageTheme: ParksPipelineStageTheme;
  isDragging: boolean;
  isSelected: boolean;
  isOverlayPreview: boolean;
  onSelect?: (dragId: string) => void;
};

export const ParksRenovacionesKanbanCardView = ({
  item,
  stageTheme,
  isDragging,
  isSelected,
  isOverlayPreview,
  onSelect,
}: ParksRenovacionesKanbanCardViewProps) => {
  const stackingStatus = getParksRenovacionStackingStatus(item.diasRestantes);

  return (
    <StyledCard
      accentColor={stageTheme.accent}
      backgroundTint={stageTheme.background}
      isDragging={isDragging}
      isSelected={isSelected}
      isOverlayPreview={isOverlayPreview}
      onClick={() => {
        if (!isOverlayPreview) {
          onSelect?.(item.dragId);
        }
      }}
      role="button"
      tabIndex={isOverlayPreview ? -1 : 0}
    >
      <StyledDragHandle aria-hidden>
        <IconGripVertical size={16} />
      </StyledDragHandle>
      <StyledContent>
        <StyledTitle>{item.tenantLabel}</StyledTitle>
        <StyledMeta>
          {item.naveLabel}
          {item.parqueNombre ? ` · ${item.parqueNombre}` : ''}
        </StyledMeta>
        <StyledMeta>
          {formatParksUsd(item.ingresoMensualUsd)} / {t`mes`}
        </StyledMeta>
        <StyledFooter>
          <ParksStatusBadge
            color={stackingStatus.color}
            label={getParksStackingStatusLabel(stackingStatus.statusKey)}
          />
          {item.diasRestantes !== null ? (
            <StyledMeta>{t`${item.diasRestantes}d para vencer`}</StyledMeta>
          ) : null}
        </StyledFooter>
      </StyledContent>
    </StyledCard>
  );
};

type ParksRenovacionesKanbanCardProps = {
  item: ParksRenovacionKanbanItem;
  stageTheme: ParksPipelineStageTheme;
  isSelected: boolean;
  isOverlayPreview: boolean;
  onSelect?: (dragId: string) => void;
};

export const ParksRenovacionesKanbanCard = ({
  item,
  stageTheme,
  isSelected,
  isOverlayPreview,
  onSelect,
}: ParksRenovacionesKanbanCardProps) => {
  const { ref, isDragging } = useDraggable({
    id: item.dragId,
    data: {
      dragId: item.dragId,
      stageId: item.etapaRenovacionStageId,
    },
    feedback: 'move',
    disabled: isOverlayPreview,
  });

  return (
    <div ref={isOverlayPreview ? undefined : ref}>
      <ParksRenovacionesKanbanCardView
        item={item}
        stageTheme={stageTheme}
        isDragging={isDragging}
        isSelected={isSelected}
        isOverlayPreview={isOverlayPreview}
        onSelect={onSelect}
      />
    </div>
  );
};
