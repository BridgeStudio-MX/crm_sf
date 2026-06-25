import { useDraggable } from '@dnd-kit/react';
import { styled } from '@linaria/react';
import { t } from '@lingui/core/macro';
import { IconGripVertical } from 'twenty-ui/icon';
import { themeCssVariables } from 'twenty-ui/theme-constants';

import { type ParksOpportunityRecord } from '@/parks-industrial/hooks/useParksRecords';
import { ParksStatusBadge } from '@/parks-industrial/components/ui/ParksStatusBadge';
import {
  formatParksNumber,
  formatParksUsd,
  getParksAmountFromMicros,
  getParksDaysInStage,
  getParksDaysInStageColor,
  getParksOwnerInitials,
  getParksOwnerName,
  type ParksPipelineStageTheme,
} from '@/parks-industrial/utils/parks-format.util';

const StyledDealCard = styled.div<{
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
  transition:
    box-shadow 0.15s ease,
    border-color 0.15s ease,
    opacity 0.15s ease;
  user-select: none;

  &:hover {
    box-shadow: ${themeCssVariables.boxShadow.light};
  }
`;

const StyledDragHandle = styled.div`
  align-items: center;
  color: ${themeCssVariables.font.color.tertiary};
  display: flex;
  flex-shrink: 0;
  padding-top: 2px;
`;

const StyledCardContent = styled.div`
  flex: 1;
  min-width: 0;
`;

const StyledDealHeader = styled.div`
  align-items: flex-start;
  display: flex;
  gap: ${themeCssVariables.spacing[2]};
  justify-content: space-between;
`;

const StyledDealTitle = styled.div`
  font-weight: ${themeCssVariables.font.weight.medium};
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
`;

const StyledOwnerAvatar = styled.div<{ avatarColor: string }>`
  align-items: center;
  background: ${({ avatarColor }) => avatarColor};
  border-radius: 50%;
  color: ${themeCssVariables.font.color.inverted};
  display: flex;
  flex-shrink: 0;
  font-size: ${themeCssVariables.font.size.xs};
  font-weight: ${themeCssVariables.font.weight.semiBold};
  height: 28px;
  justify-content: center;
  width: 28px;
`;

const StyledDealMeta = styled.div`
  color: ${themeCssVariables.font.color.secondary};
  font-size: ${themeCssVariables.font.size.xs};
  margin-top: ${themeCssVariables.spacing[1]};
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
`;

const StyledDealAmount = styled.div`
  color: ${themeCssVariables.font.color.primary};
  font-size: ${themeCssVariables.font.size.sm};
  font-weight: ${themeCssVariables.font.weight.semiBold};
  margin-top: ${themeCssVariables.spacing[2]};
`;

const StyledDealFooter = styled.div`
  align-items: center;
  display: flex;
  flex-wrap: wrap;
  gap: ${themeCssVariables.spacing[2]};
  margin-top: ${themeCssVariables.spacing[2]};
`;

export type ParksPipelineDealCardViewProps = {
  deal: ParksOpportunityRecord;
  stageTheme: ParksPipelineStageTheme;
  isDragging: boolean;
  isSelected: boolean;
  isOverlayPreview: boolean;
  onSelect?: (dealId: string) => void;
  onOpenRecord?: (dealId: string) => void;
};

export const ParksPipelineDealCardView = ({
  deal,
  stageTheme,
  isDragging,
  isSelected,
  isOverlayPreview,
  onSelect,
  onOpenRecord,
}: ParksPipelineDealCardViewProps) => {
  const daysColor = getParksDaysInStageColor(deal.updatedAt);
  const daysInStage = getParksDaysInStage(deal.updatedAt);

  return (
    <StyledDealCard
      accentColor={stageTheme.accent}
      backgroundTint={stageTheme.background}
      isDragging={isDragging}
      isSelected={isSelected}
      isOverlayPreview={isOverlayPreview}
      onClick={() => {
        if (!isOverlayPreview) {
          onSelect?.(deal.id);
        }
      }}
      onDoubleClick={(event) => {
        if (isOverlayPreview) {
          return;
        }

        event.preventDefault();
        onOpenRecord?.(deal.id);
      }}
      role="button"
      tabIndex={isOverlayPreview ? -1 : 0}
      onKeyDown={(event) => {
        if (isOverlayPreview) {
          return;
        }

        if (event.key === 'Enter' || event.key === ' ') {
          event.preventDefault();
          onSelect?.(deal.id);
        }
      }}
    >
      <StyledDragHandle aria-hidden>
        <IconGripVertical size={16} />
      </StyledDragHandle>

      <StyledCardContent>
        <StyledDealHeader>
          <StyledDealTitle>{deal.name}</StyledDealTitle>
          <StyledOwnerAvatar avatarColor={stageTheme.accent}>
            {getParksOwnerInitials(deal)}
          </StyledOwnerAvatar>
        </StyledDealHeader>
        <StyledDealMeta>
          {deal.inquilinoVinculado?.empresa ?? t`Prospecto`}
        </StyledDealMeta>
        <StyledDealAmount>
          {formatParksUsd(getParksAmountFromMicros(deal.amount?.amountMicros))}
        </StyledDealAmount>
        <StyledDealMeta>
          {deal.naveVinculada?.identificador ?? t`Sin nave`} ·{' '}
          {formatParksNumber(deal.m2Requeridos)} m²
        </StyledDealMeta>
        <StyledDealFooter>
          <ParksStatusBadge
            color={daysColor}
            label={t`${daysInStage}d en etapa`}
          />
          <StyledDealMeta>{getParksOwnerName(deal)}</StyledDealMeta>
        </StyledDealFooter>
      </StyledCardContent>
    </StyledDealCard>
  );
};

type ParksPipelineDealCardProps = {
  deal: ParksOpportunityRecord;
  stageTheme: ParksPipelineStageTheme;
  isSelected: boolean;
  isOverlayPreview: boolean;
  onSelect?: (dealId: string) => void;
  onOpenRecord?: (dealId: string) => void;
};

export const ParksPipelineDealCard = ({
  deal,
  stageTheme,
  isSelected,
  isOverlayPreview,
  onSelect,
  onOpenRecord,
}: ParksPipelineDealCardProps) => {
  const { ref, isDragging } = useDraggable({
    id: deal.id,
    data: {
      dealId: deal.id,
      stageId: deal.stage,
    },
    feedback: 'move',
    disabled: isOverlayPreview,
  });

  return (
    <div ref={isOverlayPreview ? undefined : ref}>
      <ParksPipelineDealCardView
        deal={deal}
        stageTheme={stageTheme}
        isDragging={isDragging}
        isSelected={isSelected}
        isOverlayPreview={isOverlayPreview}
        onSelect={onSelect}
        onOpenRecord={onOpenRecord}
      />
    </div>
  );
};
