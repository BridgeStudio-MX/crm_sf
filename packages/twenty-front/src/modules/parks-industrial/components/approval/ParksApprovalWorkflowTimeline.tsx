import { styled } from '@linaria/react';
import { t } from '@lingui/core/macro';
import { IconCheck, IconCircle, IconClock } from 'twenty-ui/icon';
import { Button } from 'twenty-ui/input';
import { themeCssVariables } from 'twenty-ui/theme-constants';

import {
  type LegalTimelineStage,
  type LegalWorkflowActionTab,
} from '@/parks-industrial/constants/parks-legal-workflow.constants';
import { PARKS_BRAND } from '@/parks-industrial/constants/parks-theme.constants';

type ParksApprovalWorkflowTimelineProps = {
  timeline: LegalTimelineStage[];
  embedded?: boolean;
  onStageAction?: (tab: LegalWorkflowActionTab) => void;
};

const StyledRoot = styled.section<{ embedded: boolean }>`
  background: ${({ embedded }) =>
    embedded ? 'transparent' : themeCssVariables.background.primary};
  border: ${({ embedded }) =>
    embedded ? 'none' : `1px solid ${themeCssVariables.border.color.light}`};
  border-radius: ${({ embedded }) =>
    embedded ? '0' : themeCssVariables.border.radius.md};
  box-shadow: ${({ embedded }) =>
    embedded ? 'none' : themeCssVariables.boxShadow.light};
  overflow: hidden;
`;

const StyledHeader = styled.div<{ embedded: boolean }>`
  background: ${({ embedded }) =>
    embedded
      ? 'transparent'
      : `linear-gradient(
    180deg,
    ${PARKS_BRAND.primarySoft} 0%,
    ${themeCssVariables.background.primary} 100%
  )`};
  border-bottom: ${({ embedded }) =>
    embedded ? 'none' : `1px solid ${PARKS_BRAND.borderSoft}`};
  padding: ${({ embedded }) =>
    embedded
      ? `0 0 ${themeCssVariables.spacing[3]}`
      : `${themeCssVariables.spacing[4]} ${themeCssVariables.spacing[5]}`};
`;

const StyledTimeline = styled.ol<{ embedded: boolean }>`
  list-style: none;
  margin: 0;
  padding: ${({ embedded }) =>
    embedded
      ? '0'
      : `${themeCssVariables.spacing[4]} ${themeCssVariables.spacing[5]}`};
`;

const StyledTitle = styled.h3`
  color: ${themeCssVariables.font.color.primary};
  font-size: ${themeCssVariables.font.size.md};
  font-weight: ${themeCssVariables.font.weight.semiBold};
  margin: 0;
`;

const StyledSubtitle = styled.p`
  color: ${themeCssVariables.font.color.tertiary};
  font-size: ${themeCssVariables.font.size.sm};
  margin: ${themeCssVariables.spacing[1]} 0 0;
`;

const StyledTimelineItem = styled.li<{ status: LegalTimelineStage['status'] }>`
  display: grid;
  gap: ${themeCssVariables.spacing[3]};
  grid-template-columns: 36px 1fr;
  padding-bottom: ${themeCssVariables.spacing[4]};
  position: relative;

  &:not(:last-child)::before {
    background: ${({ status }) =>
      status === 'completed'
        ? PARKS_BRAND.primary
        : themeCssVariables.border.color.medium};
    content: '';
    height: calc(100% - 8px);
    left: 17px;
    position: absolute;
    top: 32px;
    width: 2px;
  }

  &:last-child {
    padding-bottom: 0;
  }
`;

const StyledNode = styled.div<{ status: LegalTimelineStage['status'] }>`
  align-items: center;
  background: ${({ status }) => {
    if (status === 'completed') return PARKS_BRAND.primary;
    if (status === 'active') return themeCssVariables.background.primary;
    return themeCssVariables.background.tertiary;
  }};
  border: 2px solid
    ${({ status }) => {
      if (status === 'completed') return PARKS_BRAND.primary;
      if (status === 'active') return PARKS_BRAND.accent;
      return themeCssVariables.border.color.medium;
    }};
  border-radius: 50%;
  box-shadow: ${({ status }) =>
    status === 'active' ? `0 0 0 4px ${PARKS_BRAND.accentSoft}` : 'none'};
  color: ${({ status }) =>
    status === 'completed'
      ? themeCssVariables.font.color.inverted
      : status === 'active'
        ? PARKS_BRAND.primary
        : themeCssVariables.font.color.tertiary};
  display: flex;
  flex-shrink: 0;
  height: 36px;
  justify-content: center;
  position: relative;
  width: 36px;
  z-index: 1;
`;

const StyledContent = styled.div<{ status: LegalTimelineStage['status'] }>`
  background: ${({ status }) =>
    status === 'active' ? PARKS_BRAND.primarySoft : 'transparent'};
  border: 1px solid
    ${({ status }) =>
      status === 'active' ? PARKS_BRAND.borderSoft : 'transparent'};
  border-radius: ${themeCssVariables.border.radius.md};
  min-width: 0;
  padding: ${({ status }) =>
    status === 'active'
      ? themeCssVariables.spacing[3]
      : `${themeCssVariables.spacing[1]} 0`};
`;

const StyledStageLabel = styled.div<{ status: LegalTimelineStage['status'] }>`
  color: ${({ status }) =>
    status === 'pending'
      ? themeCssVariables.font.color.tertiary
      : themeCssVariables.font.color.primary};
  font-size: ${themeCssVariables.font.size.sm};
  font-weight: ${({ status }) =>
    status === 'active'
      ? themeCssVariables.font.weight.semiBold
      : themeCssVariables.font.weight.medium};
`;

const StyledStageHint = styled.div`
  color: ${themeCssVariables.font.color.tertiary};
  font-size: ${themeCssVariables.font.size.xs};
  margin-top: 2px;
`;

const StyledStageAction = styled.div`
  margin-top: ${themeCssVariables.spacing[2]};
`;

const getStageHint = (status: LegalTimelineStage['status']) => {
  if (status === 'completed') return t`Completada`;
  if (status === 'active') return t`En curso`;
  return t`Pendiente`;
};

export const ParksApprovalWorkflowTimeline = ({
  timeline,
  embedded = false,
  onStageAction,
}: ParksApprovalWorkflowTimelineProps) => {
  const completedCount = timeline.filter(
    (stage) => stage.status === 'completed',
  ).length;

  return (
    <StyledRoot embedded={embedded}>
      <StyledHeader embedded={embedded}>
        <StyledTitle>{t`Etapas del workflow legal`}</StyledTitle>
        <StyledSubtitle>
          {t`${completedCount} de ${timeline.length} etapas completadas`}
        </StyledSubtitle>
      </StyledHeader>
      <StyledTimeline embedded={embedded}>
        {timeline.map((stage) => {
          const showAction =
            stage.status === 'active' &&
            Boolean(stage.actionTab) &&
            Boolean(stage.actionLabel) &&
            Boolean(onStageAction);

          return (
            <StyledTimelineItem key={stage.id} status={stage.status}>
              <StyledNode status={stage.status}>
                {stage.status === 'completed' ? (
                  <IconCheck size={16} />
                ) : stage.status === 'active' ? (
                  <IconClock size={16} />
                ) : (
                  <IconCircle size={10} />
                )}
              </StyledNode>
              <StyledContent status={stage.status}>
                <StyledStageLabel status={stage.status}>
                  {stage.label}
                </StyledStageLabel>
                <StyledStageHint>
                  {stage.status === 'active'
                    ? t`${getStageHint(stage.status)} · ${stage.responsable}`
                    : getStageHint(stage.status)}
                </StyledStageHint>
                {showAction && stage.actionTab && stage.actionLabel ? (
                  <StyledStageAction>
                    <Button
                      title={stage.actionLabel}
                      variant="secondary"
                      size="small"
                      onClick={() => {
                        if (!stage.actionTab) {
                          return;
                        }

                        onStageAction?.(stage.actionTab);
                      }}
                    />
                  </StyledStageAction>
                ) : null}
              </StyledContent>
            </StyledTimelineItem>
          );
        })}
      </StyledTimeline>
    </StyledRoot>
  );
};
