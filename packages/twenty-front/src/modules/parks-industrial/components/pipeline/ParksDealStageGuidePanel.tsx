import { styled } from '@linaria/react';
import { t } from '@lingui/core/macro';
import { useState } from 'react';
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
import {
  PARKS_BRAND,
  PARKS_VIBE,
} from '@/parks-industrial/constants/parks-theme.constants';
import {
  type ParksDealGuideChecklistItem,
  type ParksDealGuideTab,
  type ParksDealStageGuide,
} from '@/parks-industrial/utils/parks-stage-guide.util';

const StyledGuide = styled.div<{ isDone: boolean }>`
  background: ${({ isDone }) =>
    isDone
      ? `linear-gradient(135deg, #ffffff 0%, ${PARKS_BRAND.accentSoft} 100%)`
      : `linear-gradient(135deg, #ffffff 0%, ${PARKS_BRAND.primarySoft} 100%)`};
  border: 1px solid
    ${({ isDone }) =>
      isDone ? 'rgba(141, 198, 63, 0.35)' : PARKS_BRAND.borderSoft};
  border-radius: ${PARKS_VIBE.radiusMd};
  box-shadow: ${PARKS_VIBE.shadowSoft};
  display: flex;
  flex-direction: column;
  margin: 0;
  overflow: hidden;
  position: relative;

  &::before {
    background: ${({ isDone }) =>
      isDone ? PARKS_BRAND.accent : PARKS_BRAND.primary};
    content: '';
    bottom: 0;
    left: 0;
    position: absolute;
    top: 0;
    width: 3px;
  }
`;

const StyledHeader = styled.div`
  align-items: center;
  display: flex;
  flex-wrap: wrap;
  gap: ${PARKS_VIBE.space.sm};
  padding: ${PARKS_VIBE.space.sm} ${PARKS_VIBE.space.sm}
    ${PARKS_VIBE.space.sm} ${PARKS_VIBE.space.lg};
`;

const StyledHeaderToggle = styled.button`
  align-items: center;
  background: transparent;
  border: none;
  border-radius: ${PARKS_VIBE.radiusSm};
  cursor: pointer;
  display: flex;
  flex: 1;
  font: inherit;
  gap: ${PARKS_VIBE.space.sm};
  margin: 0;
  min-width: 0;
  padding: ${PARKS_VIBE.space.xs};
  text-align: left;

  &:hover:not(:disabled) {
    background: rgba(0, 104, 55, 0.06);
  }

  &:disabled {
    cursor: default;
  }
`;

const StyledCollapseButton = styled.button`
  align-items: center;
  background: transparent;
  border: none;
  border-radius: ${PARKS_VIBE.radiusSm};
  color: ${PARKS_VIBE.textMuted};
  cursor: pointer;
  display: flex;
  flex-shrink: 0;
  padding: ${PARKS_VIBE.space.xs};

  &:hover {
    background: rgba(0, 104, 55, 0.06);
    color: ${PARKS_BRAND.primary};
  }
`;

const StyledIconChip = styled.div<{ isDone: boolean }>`
  align-items: center;
  background: ${({ isDone }) =>
    isDone ? PARKS_BRAND.accentSoft : PARKS_BRAND.primarySoft};
  border-radius: 50%;
  color: ${({ isDone }) =>
    isDone ? PARKS_BRAND.primary : PARKS_BRAND.primary};
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
  gap: 4px;
  min-width: 0;
`;

const StyledTitleRow = styled.div`
  align-items: center;
  display: flex;
  flex-wrap: wrap;
  gap: ${PARKS_VIBE.space.sm};
  min-width: 0;
`;

const StyledEyebrow = styled.span<{ isDone: boolean }>`
  color: ${({ isDone }) =>
    isDone ? PARKS_BRAND.primary : PARKS_VIBE.textMuted};
  flex-shrink: 0;
  font-family: ${PARKS_VIBE.fontFamily};
  font-size: 10px;
  font-weight: ${themeCssVariables.font.weight.semiBold};
  letter-spacing: 0.06em;
  text-transform: uppercase;
`;

const StyledTitle = styled.span`
  color: ${PARKS_VIBE.textPrimary};
  font-family: ${PARKS_VIBE.fontFamily};
  font-size: ${themeCssVariables.font.size.sm};
  font-weight: ${themeCssVariables.font.weight.semiBold};
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
`;

const StyledProgressPill = styled.span<{ isDone: boolean }>`
  background: ${({ isDone }) =>
    isDone ? PARKS_BRAND.accentSoft : PARKS_BRAND.primarySoft};
  border-radius: ${PARKS_VIBE.radiusPill};
  color: ${PARKS_BRAND.primary};
  flex-shrink: 0;
  font-family: ${PARKS_VIBE.fontFamily};
  font-size: 11px;
  font-weight: ${themeCssVariables.font.weight.semiBold};
  padding: 2px 8px;
  white-space: nowrap;
`;

const StyledProgressTrack = styled.div`
  background: rgba(0, 104, 55, 0.1);
  border-radius: ${PARKS_VIBE.radiusPill};
  height: 3px;
  max-width: 160px;
  overflow: hidden;
  width: 100%;
`;

const StyledProgressFill = styled.div<{ progress: number; isDone: boolean }>`
  background: ${({ isDone }) =>
    isDone ? PARKS_BRAND.accent : PARKS_BRAND.primary};
  border-radius: ${PARKS_VIBE.radiusPill};
  height: 100%;
  transition: width 0.2s ease;
  width: ${({ progress }) => `${Math.round(progress * 100)}%`};
`;

const StyledHeaderRight = styled.div`
  align-items: center;
  display: flex;
  flex-shrink: 0;
  gap: ${PARKS_VIBE.space.sm};
  margin-left: auto;
`;

const StyledBody = styled.div`
  border-top: 1px solid ${PARKS_VIBE.border};
  display: flex;
  flex-direction: column;
  gap: ${PARKS_VIBE.space.sm};
  max-height: 200px;
  overflow-y: auto;
  padding: ${PARKS_VIBE.space.md} ${PARKS_VIBE.space.lg};
`;

const StyledChecklist = styled.ul`
  display: flex;
  flex-direction: column;
  gap: 4px;
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
  background: ${({ isDone }) =>
    isDone ? 'rgba(141, 198, 63, 0.08)' : PARKS_VIBE.surface};
  border: 1px solid
    ${({ isDone }) => (isDone ? 'rgba(141, 198, 63, 0.22)' : PARKS_VIBE.border)};
  border-radius: ${PARKS_VIBE.radiusSm};
  color: ${({ isDone }) =>
    isDone ? PARKS_VIBE.textSecondary : PARKS_VIBE.textPrimary};
  cursor: ${({ isClickable }) => (isClickable ? 'pointer' : 'default')};
  display: flex;
  font-family: ${PARKS_VIBE.fontFamily};
  font-size: ${themeCssVariables.font.size.sm};
  gap: ${PARKS_VIBE.space.sm};
  line-height: 1.35;
  padding: 8px 10px;
  text-align: left;
  text-decoration: ${({ isDone }) => (isDone ? 'line-through' : 'none')};
  text-decoration-color: rgba(50, 51, 56, 0.28);
  transition:
    border-color 0.15s ease,
    background 0.15s ease;
  width: 100%;

  ${({ isClickable }) =>
    isClickable
      ? `
    &:hover {
      background: ${PARKS_BRAND.primarySoft};
      border-color: ${PARKS_BRAND.borderSoft};
      color: ${PARKS_BRAND.primary};
      text-decoration: none;
    }
  `
      : ''}
`;

const StyledEmbeddedChecklist = styled.div`
  background: linear-gradient(
    160deg,
    ${PARKS_VIBE.surface} 0%,
    ${PARKS_VIBE.surfaceMuted} 100%
  );
  border: 1px solid ${PARKS_VIBE.border};
  border-radius: ${PARKS_VIBE.radiusMd};
  box-shadow: ${PARKS_VIBE.shadowSoft};
  display: flex;
  flex-direction: column;
  gap: ${PARKS_VIBE.space.md};
  overflow: hidden;
  padding: ${PARKS_VIBE.space.lg};
  position: relative;

  &::before {
    background: ${PARKS_BRAND.primary};
    content: '';
    height: ${PARKS_VIBE.accentBarHeight};
    left: 0;
    position: absolute;
    right: 0;
    top: 0;
  }
`;

const StyledEmbeddedHeader = styled.div`
  align-items: center;
  display: flex;
  flex-wrap: wrap;
  gap: ${PARKS_VIBE.space.sm};
  justify-content: space-between;
  padding-top: ${PARKS_VIBE.space.xs};
`;

const StyledEmbeddedTitle = styled.span`
  color: ${PARKS_VIBE.textPrimary};
  font-family: ${PARKS_VIBE.fontFamily};
  font-size: ${themeCssVariables.font.size.sm};
  font-weight: ${themeCssVariables.font.weight.semiBold};
`;

const getGuideProgress = (guide: ParksDealStageGuide): number => {
  if (guide.checklist.length === 0) {
    return guide.canAdvance ? 1 : 0;
  }

  const doneCount = guide.checklist.filter((item) => item.done).length;

  return doneCount / guide.checklist.length;
};

type ParksDealStageGuideChecklistProps = {
  guide: ParksDealStageGuide;
  onOpenTab: (tab: ParksDealGuideTab, scrollTarget?: string) => void;
};

export const ParksDealStageGuideChecklist = ({
  guide,
  onOpenTab,
}: ParksDealStageGuideChecklistProps) => {
  if (guide.checklist.length === 0) {
    return null;
  }

  const progress = getGuideProgress(guide);

  const handleChecklistItemClick = (item: ParksDealGuideChecklistItem) => {
    if (!item.targetTab && !item.scrollTarget) {
      return;
    }

    onOpenTab(item.targetTab ?? guide.recommendedTab, item.scrollTarget);
  };

  return (
    <StyledEmbeddedChecklist>
      <StyledEmbeddedHeader>
        <StyledEmbeddedTitle>{guide.title}</StyledEmbeddedTitle>
        <StyledProgressPill isDone={guide.canAdvance}>
          {guide.progressLabel}
        </StyledProgressPill>
      </StyledEmbeddedHeader>
      <StyledProgressTrack>
        <StyledProgressFill
          progress={progress}
          isDone={guide.canAdvance}
        />
      </StyledProgressTrack>
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
                  <IconCheck size={16} color={PARKS_BRAND.primary} />
                ) : (
                  <IconCircleDashed size={16} color={PARKS_VIBE.textMuted} />
                )}
                <span>{item.label}</span>
              </StyledChecklistButton>
            </StyledChecklistItem>
          );
        })}
      </StyledChecklist>
    </StyledEmbeddedChecklist>
  );
};

type ParksDealStageGuidePanelProps = {
  guide: ParksDealStageGuide;
  onOpenTab: (tab: ParksDealGuideTab, scrollTarget?: string) => void;
  onAdvanceStage?: (nextStageId: string) => void;
  // When true, hide the expandable checklist (shown inside the active tab instead)
  hideChecklistBody?: boolean;
};

export const ParksDealStageGuidePanel = ({
  guide,
  onOpenTab,
  onAdvanceStage,
  hideChecklistBody = false,
}: ParksDealStageGuidePanelProps) => {
  // Strip stays collapsed by default so tabs remain visible on small viewports
  const [isExpanded, setIsExpanded] = useState(false);
  const progress = getGuideProgress(guide);

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

  const toggleExpanded = () => setIsExpanded((previous) => !previous);
  const canExpand =
    !hideChecklistBody &&
    (guide.checklist.length > 0 || guide.primaryActionKind !== 'none');
  const showBody = isExpanded && canExpand;

  return (
    <StyledGuide isDone={guide.canAdvance}>
      <StyledHeader>
        <StyledHeaderToggle
          type="button"
          onClick={canExpand ? toggleExpanded : undefined}
          aria-expanded={showBody}
          disabled={!canExpand}
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
              <StyledEyebrow isDone={guide.canAdvance}>
                {guide.canAdvance ? t`Listo` : t`Siguiente`}
              </StyledEyebrow>
              <StyledTitle>{guide.title}</StyledTitle>
              <StyledProgressPill isDone={guide.canAdvance}>
                {guide.progressLabel}
              </StyledProgressPill>
            </StyledTitleRow>
            <StyledProgressTrack>
              <StyledProgressFill
                progress={progress}
                isDone={guide.canAdvance}
              />
            </StyledProgressTrack>
          </StyledTitleBlock>
        </StyledHeaderToggle>
        <StyledHeaderRight>
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
          {canExpand ? (
            <StyledCollapseButton
              type="button"
              onClick={toggleExpanded}
              aria-expanded={showBody}
              aria-label={showBody ? t`Ocultar detalle` : t`Mostrar detalle`}
            >
              {showBody ? (
                <IconChevronUp size={16} />
              ) : (
                <IconChevronDown size={16} />
              )}
            </StyledCollapseButton>
          ) : null}
        </StyledHeaderRight>
      </StyledHeader>

      {showBody ? (
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
                        <IconCheck size={16} color={PARKS_BRAND.primary} />
                      ) : (
                        <IconCircleDashed
                          size={16}
                          color={PARKS_VIBE.textMuted}
                        />
                      )}
                      <span>{item.label}</span>
                    </StyledChecklistButton>
                  </StyledChecklistItem>
                );
              })}
            </StyledChecklist>
          ) : null}
        </StyledBody>
      ) : null}
    </StyledGuide>
  );
};
