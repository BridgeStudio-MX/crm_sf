import { styled } from '@linaria/react';
import { t } from '@lingui/core/macro';
import { IconArrowRight, IconCheck, IconCircleDashed } from 'twenty-ui/icon';
import { themeCssVariables } from 'twenty-ui/theme-constants';

import { ParksActionButton } from '@/parks-industrial/components/ui/ParksActionButton';
import { ParksStatusBadge } from '@/parks-industrial/components/ui/ParksStatusBadge';
import { PARKS_BRAND } from '@/parks-industrial/constants/parks-theme.constants';
import {
  type ParksDealGuideChecklistItem,
  type ParksDealGuideTab,
  type ParksDealStageGuide,
} from '@/parks-industrial/utils/parks-stage-guide.util';

const StyledGuide = styled.div`
  background: linear-gradient(
    145deg,
    ${PARKS_BRAND.primarySoft} 0%,
    ${themeCssVariables.background.secondary} 55%
  );
  border: 1px solid ${PARKS_BRAND.borderSoft};
  border-left: 4px solid ${PARKS_BRAND.primary};
  border-radius: ${themeCssVariables.border.radius.md};
  display: flex;
  flex-direction: column;
  gap: ${themeCssVariables.spacing[3]};
  margin: ${themeCssVariables.spacing[3]} ${themeCssVariables.spacing[4]} 0;
  padding: ${themeCssVariables.spacing[3]};
`;

const StyledHeader = styled.div`
  align-items: flex-start;
  display: flex;
  flex-wrap: wrap;
  gap: ${themeCssVariables.spacing[2]};
  justify-content: space-between;
`;

const StyledTitleBlock = styled.div`
  display: flex;
  flex: 1;
  flex-direction: column;
  gap: ${themeCssVariables.spacing[1]};
  min-width: 0;
`;

const StyledTitle = styled.div`
  font-size: ${themeCssVariables.font.size.md};
  font-weight: ${themeCssVariables.font.weight.semiBold};
`;

const StyledDescription = styled.p`
  color: ${themeCssVariables.font.color.secondary};
  font-size: ${themeCssVariables.font.size.sm};
  line-height: 1.45;
  margin: 0;
`;

const StyledChecklist = styled.ul`
  display: flex;
  flex-direction: column;
  gap: ${themeCssVariables.spacing[1]};
  list-style: none;
  margin: 0;
  padding: 0;
`;

const StyledChecklistItem = styled.li`
  list-style: none;
  margin: 0;
  padding: 0;
`;

const StyledChecklistButton = styled.button<{
  isDone: boolean;
  isClickable: boolean;
}>`
  align-items: center;
  background: transparent;
  border: none;
  border-radius: ${themeCssVariables.border.radius.sm};
  color: ${({ isDone }) =>
    isDone
      ? themeCssVariables.font.color.secondary
      : themeCssVariables.font.color.primary};
  cursor: ${({ isClickable }) => (isClickable ? 'pointer' : 'default')};
  display: flex;
  font: inherit;
  font-size: ${themeCssVariables.font.size.sm};
  gap: ${themeCssVariables.spacing[2]};
  line-height: 1.35;
  margin: 0 -${themeCssVariables.spacing[1]};
  padding: ${themeCssVariables.spacing[1]};
  text-align: left;
  width: calc(100% + ${themeCssVariables.spacing[2]});

  ${({ isClickable, isDone }) =>
    isClickable
      ? `
    &:hover {
      background: ${themeCssVariables.background.transparent.light};
      color: ${
        isDone
          ? themeCssVariables.font.color.primary
          : themeCssVariables.color.blue
      };
    }
  `
      : ''}
`;


const StyledFooter = styled.div`
  align-items: center;
  display: flex;
  flex-wrap: wrap;
  gap: ${themeCssVariables.spacing[2]};
  justify-content: space-between;
`;

type ParksDealStageGuideProps = {
  guide: ParksDealStageGuide;
  onOpenTab: (tab: ParksDealGuideTab, scrollTarget?: string) => void;
  onAdvanceStage?: (nextStageId: string) => void;
};

export const ParksDealStageGuidePanel = ({
  guide,
  onOpenTab,
  onAdvanceStage,
}: ParksDealStageGuideProps) => {
  const handlePrimaryAction = () => {
    if (guide.primaryActionKind === 'advance-stage' && guide.nextStageId) {
      onAdvanceStage?.(guide.nextStageId);
      return;
    }

    if (guide.primaryActionKind === 'open-tab') {
      onOpenTab(guide.recommendedTab, guide.primaryScrollTarget);
    }
  };

  const handleChecklistItemClick = (item: ParksDealGuideChecklistItem) => {
    if (!item.targetTab && !item.scrollTarget) {
      return;
    }

    onOpenTab(item.targetTab ?? guide.recommendedTab, item.scrollTarget);
  };

  return (
    <StyledGuide>
      <StyledHeader>
        <StyledTitleBlock>
          <StyledTitle>{guide.title}</StyledTitle>
          <StyledDescription>{guide.description}</StyledDescription>
        </StyledTitleBlock>
        <ParksStatusBadge color="blue" label={guide.progressLabel} />
      </StyledHeader>

      {guide.checklist.length > 0 ? (
        <StyledChecklist>
          {guide.checklist.map((item) => {
            const isClickable = Boolean(item.targetTab || item.scrollTarget);

            return (
              <StyledChecklistItem key={item.id}>
                <StyledChecklistButton
                  type="button"
                  isDone={item.done}
                  isClickable={isClickable}
                  disabled={!isClickable}
                  onClick={() => handleChecklistItemClick(item)}
                >
                  {item.done ? (
                    <IconCheck
                      size={16}
                      color={themeCssVariables.color.green}
                    />
                  ) : (
                    <IconCircleDashed
                      size={16}
                      color={themeCssVariables.font.color.tertiary}
                    />
                  )}
                  <span>{item.label}</span>
                </StyledChecklistButton>
              </StyledChecklistItem>
            );
          })}
        </StyledChecklist>
      ) : null}

      <StyledFooter>
        <StyledDescription>
          {guide.nextStageLabel
            ? t`Siguiente etapa: ${guide.nextStageLabel}`
            : t`Sin más etapas comerciales`}
        </StyledDescription>
        {guide.primaryActionKind !== 'none' ? (
          <ParksActionButton
            variant="primary"
            size="sm"
            Icon={IconArrowRight}
            iconPosition="right"
            title={guide.primaryActionLabel}
            onClick={handlePrimaryAction}
          />
        ) : null}
      </StyledFooter>
    </StyledGuide>
  );
};
