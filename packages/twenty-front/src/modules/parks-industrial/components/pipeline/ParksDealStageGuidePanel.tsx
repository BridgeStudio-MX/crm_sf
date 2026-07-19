import { styled } from '@linaria/react';
import { t } from '@lingui/core/macro';
import { useEffect, useState } from 'react';
import {
  IconArrowRight,
  IconCheck,
  IconChevronDown,
  IconChevronUp,
  IconCircleDashed,
  IconFlag,
} from 'twenty-ui/icon';
import { themeCssVariables } from 'twenty-ui/theme-constants';

import { ParksActionButton } from '@/parks-industrial/components/ui/ParksActionButton';
import { PARKS_VISUAL_THEME } from '@/parks-industrial/constants/parks-theme.constants';
import {
  type ParksDealGuideChecklistItem,
  type ParksDealGuideTab,
  type ParksDealStageGuide,
} from '@/parks-industrial/utils/parks-stage-guide.util';

const StyledGuide = styled.div<{ isCollapsed: boolean }>`
  background: ${themeCssVariables.background.primary};
  border: 1px solid ${themeCssVariables.border.color.medium};
  border-radius: ${themeCssVariables.border.radius.md};
  box-shadow: ${themeCssVariables.boxShadow.light};
  display: flex;
  flex-direction: column;
  margin: ${themeCssVariables.spacing[3]} ${themeCssVariables.spacing[4]} 0;
  overflow: hidden;
  transition: padding 0.15s ease;
`;

const StyledHeader = styled.div`
  align-items: center;
  display: flex;
  flex-wrap: wrap;
  gap: ${themeCssVariables.spacing[2]};
  padding: ${themeCssVariables.spacing[2]} ${themeCssVariables.spacing[3]};
`;

const StyledHeaderToggle = styled.button`
  align-items: center;
  background: transparent;
  border: none;
  border-radius: ${themeCssVariables.border.radius.sm};
  cursor: pointer;
  display: flex;
  flex: 1;
  font: inherit;
  gap: ${themeCssVariables.spacing[2]};
  margin: 0;
  min-width: 0;
  padding: ${themeCssVariables.spacing[1]};
  text-align: left;

  &:hover {
    background: ${themeCssVariables.background.transparent.light};
  }
`;

const StyledCollapseButton = styled.button`
  align-items: center;
  background: transparent;
  border: none;
  border-radius: ${themeCssVariables.border.radius.sm};
  color: ${themeCssVariables.font.color.tertiary};
  cursor: pointer;
  display: flex;
  flex-shrink: 0;
  padding: ${themeCssVariables.spacing[1]};

  &:hover {
    background: ${themeCssVariables.background.transparent.light};
  }
`;

const StyledIconChip = styled.div<{ isDone: boolean }>`
  align-items: center;
  background: ${({ isDone }) =>
    isDone
      ? PARKS_VISUAL_THEME.accents.green.iconBackground
      : PARKS_VISUAL_THEME.accents.blue.iconBackground};
  border-radius: 50%;
  color: ${({ isDone }) =>
    isDone
      ? PARKS_VISUAL_THEME.accents.green.accent
      : PARKS_VISUAL_THEME.accents.blue.accent};
  display: flex;
  flex-shrink: 0;
  height: 28px;
  justify-content: center;
  width: 28px;
`;

const StyledTitleBlock = styled.div`
  display: flex;
  flex: 1;
  flex-direction: column;
  min-width: 0;
`;

const StyledTitleRow = styled.div`
  align-items: center;
  display: flex;
  gap: ${themeCssVariables.spacing[2]};
`;

const StyledTitle = styled.span`
  color: ${themeCssVariables.font.color.primary};
  font-size: ${themeCssVariables.font.size.sm};
  font-weight: ${themeCssVariables.font.weight.semiBold};
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
`;

const StyledProgressPill = styled.span<{ isDone: boolean }>`
  background: ${({ isDone }) =>
    isDone
      ? PARKS_VISUAL_THEME.accents.green.iconBackground
      : PARKS_VISUAL_THEME.accents.blue.iconBackground};
  border-radius: ${themeCssVariables.border.radius.rounded};
  color: ${({ isDone }) =>
    isDone
      ? PARKS_VISUAL_THEME.accents.green.accent
      : PARKS_VISUAL_THEME.accents.blue.accent};
  flex-shrink: 0;
  font-size: ${themeCssVariables.font.size.xs};
  font-weight: ${themeCssVariables.font.weight.medium};
  padding: 2px ${themeCssVariables.spacing[2]};
  white-space: nowrap;
`;

const StyledDescription = styled.p`
  color: ${themeCssVariables.font.color.secondary};
  font-size: ${themeCssVariables.font.size.xs};
  line-height: 1.4;
  margin: 2px 0 0;
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
`;

const StyledHeaderRight = styled.div`
  align-items: center;
  display: flex;
  flex-shrink: 0;
  gap: ${themeCssVariables.spacing[2]};
  margin-left: auto;
`;

const StyledBody = styled.div`
  border-top: 1px solid ${themeCssVariables.border.color.light};
  display: flex;
  flex-direction: column;
  gap: ${themeCssVariables.spacing[3]};
  max-height: 220px;
  overflow-y: auto;
  padding: ${themeCssVariables.spacing[3]};
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

const StyledFooterHint = styled.span`
  color: ${themeCssVariables.font.color.secondary};
  font-size: ${themeCssVariables.font.size.xs};
`;

type ParksDealStageGuidePanelProps = {
  guide: ParksDealStageGuide;
  onOpenTab: (tab: ParksDealGuideTab, scrollTarget?: string) => void;
  onAdvanceStage?: (nextStageId: string) => void;
};

export const ParksDealStageGuidePanel = ({
  guide,
  onOpenTab,
  onAdvanceStage,
}: ParksDealStageGuidePanelProps) => {
  // Collapsed by default once the checklist for this stage is complete, so
  // the guide doesn't push down the tabs where the actual work happens.
  const [isCollapsed, setIsCollapsed] = useState(guide.canAdvance);

  useEffect(() => {
    setIsCollapsed(guide.canAdvance);
  }, [guide.stageId, guide.canAdvance]);

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

  const toggleCollapsed = () => setIsCollapsed((previous) => !previous);

  return (
    <StyledGuide isCollapsed={isCollapsed}>
      <StyledHeader>
        <StyledHeaderToggle
          type="button"
          onClick={toggleCollapsed}
          aria-expanded={!isCollapsed}
        >
          <StyledIconChip isDone={guide.canAdvance}>
            {guide.canAdvance ? (
              <IconCheck size={14} />
            ) : (
              <IconFlag size={14} />
            )}
          </StyledIconChip>
          <StyledTitleBlock>
            <StyledTitleRow>
              <StyledTitle>{guide.title}</StyledTitle>
              <StyledProgressPill isDone={guide.canAdvance}>
                {guide.progressLabel}
              </StyledProgressPill>
            </StyledTitleRow>
            {isCollapsed ? null : (
              <StyledDescription>{guide.description}</StyledDescription>
            )}
          </StyledTitleBlock>
        </StyledHeaderToggle>
        <StyledHeaderRight>
          {isCollapsed && guide.primaryActionKind !== 'none' ? (
            <ParksActionButton
              variant="primary"
              size="sm"
              Icon={IconArrowRight}
              iconPosition="right"
              title={guide.primaryActionLabel}
              onClick={handlePrimaryAction}
            />
          ) : null}
          <StyledCollapseButton
            type="button"
            onClick={toggleCollapsed}
            aria-expanded={!isCollapsed}
            aria-label={isCollapsed ? t`Mostrar detalle` : t`Ocultar detalle`}
          >
            {isCollapsed ? (
              <IconChevronDown size={16} />
            ) : (
              <IconChevronUp size={16} />
            )}
          </StyledCollapseButton>
        </StyledHeaderRight>
      </StyledHeader>

      {isCollapsed ? null : (
        <StyledBody>
          {guide.checklist.length > 0 ? (
            <StyledChecklist>
              {guide.checklist.map((item) => {
                const isClickable = Boolean(
                  item.targetTab || item.scrollTarget,
                );

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
            <StyledFooterHint>
              {guide.nextStageLabel
                ? t`Siguiente etapa: ${guide.nextStageLabel}`
                : t`Sin más etapas comerciales`}
            </StyledFooterHint>
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
        </StyledBody>
      )}
    </StyledGuide>
  );
};
