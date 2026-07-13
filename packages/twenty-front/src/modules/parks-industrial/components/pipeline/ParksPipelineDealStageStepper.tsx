import { styled } from '@linaria/react';
import { t } from '@lingui/core/macro';
import { Fragment } from 'react';
import { themeCssVariables } from 'twenty-ui/theme-constants';

import {
  getParksPipelineStageColor,
  getParksPipelineStageLabel,
  PARKS_VISIBLE_PIPELINE_STAGES,
} from '@/parks-industrial/constants/parks-industrial.constants';
import { getParksPipelineStageTheme } from '@/parks-industrial/utils/parks-format.util';
import { normalizeParksPipelineStageId } from '@/parks-industrial/utils/parksStageGateUtil';

type StageNodeStatus = 'past' | 'current' | 'future';

const StyledStepperSection = styled.div`
  border-bottom: 1px solid ${themeCssVariables.border.color.light};
  display: flex;
  flex-direction: column;
  gap: ${themeCssVariables.spacing[2]};
  padding: ${themeCssVariables.spacing[2]} ${themeCssVariables.spacing[4]}
    ${themeCssVariables.spacing[3]};
`;

const StyledCurrentStageLabel = styled.div`
  color: ${themeCssVariables.font.color.primary};
  font-size: ${themeCssVariables.font.size.sm};
  font-weight: ${themeCssVariables.font.weight.semiBold};
  text-align: center;
`;

const StyledTrack = styled.div`
  align-items: center;
  display: flex;
  justify-content: center;
  width: 100%;
`;

const StyledConnector = styled.div<{ isPast: boolean; accentColor: string }>`
  background: ${({ isPast, accentColor }) =>
    isPast ? accentColor : themeCssVariables.border.color.medium};
  flex: 1;
  height: 2px;
  max-width: 48px;
`;

const StyledNode = styled.button<{
  status: StageNodeStatus;
  accentColor: string;
}>`
  background: ${({ status, accentColor }) => {
    if (status === 'current') {
      return accentColor;
    }

    if (status === 'past') {
      return accentColor;
    }

    return themeCssVariables.background.primary;
  }};
  border: 2px solid
    ${({ status, accentColor }) =>
      status === 'future'
        ? themeCssVariables.border.color.medium
        : accentColor};
  border-radius: 50%;
  cursor: pointer;
  flex-shrink: 0;
  height: ${({ status }) => (status === 'current' ? 14 : 10)}px;
  opacity: ${({ status }) => (status === 'future' ? 0.85 : 1)};
  padding: 0;
  transition: transform 0.15s ease;
  width: ${({ status }) => (status === 'current' ? 14 : 10)}px;

  &:hover {
    transform: scale(1.2);
  }

  ${({ status, accentColor }) =>
    status === 'current'
      ? `
    box-shadow: 0 0 0 4px ${accentColor}33;
  `
      : ''}
`;

const StyledStepperHint = styled.p`
  color: ${themeCssVariables.font.color.tertiary};
  font-size: ${themeCssVariables.font.size.xs};
  margin: 0;
  text-align: center;
`;

type ParksPipelineDealStageStepperProps = {
  currentStageId?: string | null;
  onSelectStage: (stageId: string) => void;
};

export const ParksPipelineDealStageStepper = ({
  currentStageId,
  onSelectStage,
}: ParksPipelineDealStageStepperProps) => {
  const normalizedStageId = normalizeParksPipelineStageId(currentStageId);
  const currentIndex = PARKS_VISIBLE_PIPELINE_STAGES.findIndex(
    (stage) => stage.id === normalizedStageId,
  );
  const resolvedIndex = currentIndex >= 0 ? currentIndex : 0;
  const activeAccent = getParksPipelineStageTheme(
    getParksPipelineStageColor(
      PARKS_VISIBLE_PIPELINE_STAGES[resolvedIndex]?.id ?? currentStageId,
    ),
  ).accent;

  return (
    <StyledStepperSection>
      <StyledCurrentStageLabel>
        {getParksPipelineStageLabel(currentStageId)}
      </StyledCurrentStageLabel>
      <StyledTrack>
        {PARKS_VISIBLE_PIPELINE_STAGES.map((stage, index) => {
          const stageTheme = getParksPipelineStageTheme(
            getParksPipelineStageColor(stage.id),
          );
          const status: StageNodeStatus =
            index < resolvedIndex
              ? 'past'
              : index === resolvedIndex
                ? 'current'
                : 'future';

          return (
            <Fragment key={stage.id}>
              {index > 0 ? (
                <StyledConnector
                  isPast={index <= resolvedIndex}
                  accentColor={activeAccent}
                />
              ) : null}
              <StyledNode
                type="button"
                status={status}
                accentColor={stageTheme.accent}
                title={stage.label}
                aria-label={stage.label}
                aria-current={status === 'current' ? 'step' : undefined}
                onClick={() => onSelectStage(stage.id)}
              />
            </Fragment>
          );
        })}
      </StyledTrack>
      <StyledStepperHint>
        {t`Clic en un paso para cambiar de etapa · LOI, Legal y Ganado solo vía tab Hoja`}
      </StyledStepperHint>
    </StyledStepperSection>
  );
};
