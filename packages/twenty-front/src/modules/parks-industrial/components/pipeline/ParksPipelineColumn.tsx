import { pointerIntersection } from '@dnd-kit/collision';
import { useDroppable } from '@dnd-kit/react';
import { styled } from '@linaria/react';
import { t } from '@lingui/core/macro';
import { Tag } from 'twenty-ui/data-display';
import { themeCssVariables } from 'twenty-ui/theme-constants';

import { type ParksPipelineStageColor } from '@/parks-industrial/constants/parks-industrial.constants';
import { type ProspectScoreResult } from '@/parks-industrial/types/parks-commercial.types';
import { type ParksOpportunityRecord } from '@/parks-industrial/hooks/useParksRecords';
import { ParksPipelineDealCard } from '@/parks-industrial/components/pipeline/ParksPipelineDealCard';
import {
  formatParksUsd,
  getParksAmountFromMicros,
  getParksPipelineStageTheme,
} from '@/parks-industrial/utils/parks-format.util';

const StyledColumnWrapper = styled.div`
  flex-shrink: 0;
  min-width: 300px;
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
  font-size: ${themeCssVariables.font.size.xl};
  font-weight: ${themeCssVariables.font.weight.semiBold};
  letter-spacing: -0.02em;
  line-height: 1.1;
  margin-top: ${themeCssVariables.spacing[2]};
`;

const StyledColumnTotalLabel = styled.div`
  color: ${themeCssVariables.font.color.tertiary};
  font-size: ${themeCssVariables.font.size.xs};
  font-weight: ${themeCssVariables.font.weight.regular};
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
  min-height: 440px;
  padding: ${themeCssVariables.spacing[2]};
  transform: ${({ isDropTarget }) => (isDropTarget ? 'scale(1.01)' : 'none')};
  transition:
    background 0.15s ease,
    border-color 0.15s ease,
    transform 0.15s ease;
`;

const StyledEmptyColumnHint = styled.div<{ isDropTarget: boolean }>`
  color: ${({ isDropTarget }) =>
    isDropTarget
      ? themeCssVariables.font.color.primary
      : themeCssVariables.font.color.tertiary};
  font-size: ${themeCssVariables.font.size.xs};
  font-weight: ${({ isDropTarget }) =>
    isDropTarget
      ? themeCssVariables.font.weight.medium
      : themeCssVariables.font.weight.regular};
  padding: ${themeCssVariables.spacing[4]} ${themeCssVariables.spacing[2]};
  text-align: center;
`;

export type ParksPipelineColumnStage = {
  id: string;
  label: string;
  color: ParksPipelineStageColor;
};

type ParksPipelineColumnProps = {
  stage: ParksPipelineColumnStage;
  deals: ParksOpportunityRecord[];
  selectedDealId: string | null;
  draggingDealId: string | null;
  prospectScoresById: Record<string, ProspectScoreResult>;
  onSelectDeal: (dealId: string) => void;
  onOpenRecord: (dealId: string) => void;
};

export const ParksPipelineColumn = ({
  stage,
  deals,
  selectedDealId,
  draggingDealId,
  prospectScoresById,
  onSelectDeal,
  onOpenRecord,
}: ParksPipelineColumnProps) => {
  const stageTheme = getParksPipelineStageTheme(stage.color);
  const { ref, isDropTarget } = useDroppable({
    id: stage.id,
    data: { stageId: stage.id },
    collisionDetector: pointerIntersection,
  });

  const stageTotal = deals.reduce(
    (sum, deal) => sum + getParksAmountFromMicros(deal.amount?.amountMicros),
    0,
  );

  return (
    <StyledColumnWrapper ref={ref}>
      <StyledColumnHeader accentColor={stageTheme.accent}>
        <StyledColumnTitleRow>
          <StyledColumnTitle>{stage.label}</StyledColumnTitle>
          <Tag
            color={stage.color}
            text={String(deals.length)}
            variant="solid"
            weight="medium"
          />
        </StyledColumnTitleRow>
        <StyledColumnTotal accentColor={stageTheme.accent}>
          {formatParksUsd(stageTotal)}
        </StyledColumnTotal>
        <StyledColumnTotalLabel>{t`en etapa`}</StyledColumnTotalLabel>
      </StyledColumnHeader>

      <StyledColumnBody
        backgroundColor={stageTheme.dragHighlight}
        borderColor={stageTheme.accent}
        isDropTarget={isDropTarget}
      >
        {deals.length === 0 ? (
          <StyledEmptyColumnHint isDropTarget={isDropTarget}>
            {isDropTarget ? t`Suelta aquí` : t`Arrastra deals aquí`}
          </StyledEmptyColumnHint>
        ) : (
          deals.map((deal) => (
            <ParksPipelineDealCard
              key={deal.id}
              deal={deal}
              stageTheme={stageTheme}
              isSelected={selectedDealId === deal.id}
              isOverlayPreview={false}
              prospectScore={prospectScoresById[deal.id]}
              onSelect={onSelectDeal}
              onOpenRecord={onOpenRecord}
            />
          ))
        )}
        {draggingDealId !== null && deals.length > 0 && isDropTarget ? (
          <StyledEmptyColumnHint isDropTarget>
            {t`Suelta para mover a esta etapa`}
          </StyledEmptyColumnHint>
        ) : null}
      </StyledColumnBody>
    </StyledColumnWrapper>
  );
};
