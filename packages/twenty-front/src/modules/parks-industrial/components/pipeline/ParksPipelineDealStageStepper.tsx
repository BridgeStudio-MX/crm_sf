import { styled } from '@linaria/react';
import { t } from '@lingui/core/macro';
import { Fragment } from 'react';

import {
  getParksPipelineStageColor,
  getParksPipelineStageLabel,
  PARKS_VISIBLE_PIPELINE_STAGES,
} from '@/parks-industrial/constants/parks-industrial.constants';
import {
  PARKS_BRAND,
  PARKS_VIBE,
} from '@/parks-industrial/constants/parks-theme.constants';
import { getParksPipelineStageTheme } from '@/parks-industrial/utils/parks-format.util';
import { normalizeParksPipelineStageId } from '@/parks-industrial/utils/parksStageGateUtil';

type StageNodeStatus = 'past' | 'current' | 'future';

const StyledStepperSection = styled.div`
  align-items: center;
  background: ${PARKS_VIBE.surfaceMuted};
  border-bottom: 1px solid ${PARKS_VIBE.border};
  display: grid;
  gap: ${PARKS_VIBE.space.md};
  grid-template-columns: minmax(0, 140px) 1fr;
  padding: 10px ${PARKS_VIBE.space.lg};

  @media (max-width: 640px) {
    grid-template-columns: 1fr;
    gap: 6px;
    padding: 8px ${PARKS_VIBE.space.md};
  }
`;

const StyledStageCaption = styled.div`
  display: flex;
  flex-direction: column;
  gap: 2px;
  min-width: 0;
`;

const StyledStageCaptionLabel = styled.span`
  color: ${PARKS_VIBE.textMuted};
  font-family: ${PARKS_VIBE.fontFamily};
  font-size: 10px;
  font-weight: 600;
  letter-spacing: 0.05em;
  text-transform: uppercase;
`;

const StyledStageCaptionValue = styled.span`
  color: ${PARKS_VIBE.textPrimary};
  font-family: ${PARKS_VIBE.fontFamily};
  font-size: 12px;
  font-weight: 600;
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
`;

const StyledTrackBlock = styled.div`
  display: flex;
  flex-direction: column;
  gap: 4px;
  min-width: 0;
`;

const StyledTrack = styled.div`
  align-items: center;
  display: flex;
  justify-content: center;
  width: 100%;
`;

const StyledConnector = styled.div<{ isPast: boolean; accentColor: string }>`
  background: ${({ isPast, accentColor }) =>
    isPast ? accentColor : 'rgba(50, 51, 56, 0.14)'};
  flex: 1;
  height: 2px;
  max-width: 40px;
  transition: background 0.2s ease;
`;

const StyledNode = styled.button<{
  status: StageNodeStatus;
  accentColor: string;
}>`
  background: ${({ status, accentColor }) => {
    if (status === 'current' || status === 'past') {
      return accentColor;
    }

    return PARKS_VIBE.surface;
  }};
  border: 2px solid
    ${({ status, accentColor }) =>
      status === 'future' ? 'rgba(50, 51, 56, 0.18)' : accentColor};
  border-radius: 50%;
  cursor: pointer;
  flex-shrink: 0;
  height: ${({ status }) => (status === 'current' ? 12 : 8)}px;
  opacity: ${({ status }) => (status === 'future' ? 0.7 : 1)};
  padding: 0;
  transition:
    transform 0.15s ease,
    box-shadow 0.15s ease;
  width: ${({ status }) => (status === 'current' ? 12 : 8)}px;

  &:hover {
    transform: scale(1.25);
  }

  &:focus-visible {
    outline: 2px solid ${PARKS_BRAND.accent};
    outline-offset: 2px;
  }

  ${({ status, accentColor }) =>
    status === 'current'
      ? `
    box-shadow: 0 0 0 3px ${accentColor}28;
  `
      : ''}
`;

const StyledStepperHint = styled.p`
  color: ${PARKS_VIBE.textMuted};
  font-family: ${PARKS_VIBE.fontFamily};
  font-size: 10px;
  letter-spacing: 0.02em;
  margin: 0;
  text-align: right;

  @media (max-width: 640px) {
    text-align: center;
  }
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
      <StyledStageCaption>
        <StyledStageCaptionLabel>{t`Etapa actual`}</StyledStageCaptionLabel>
        <StyledStageCaptionValue>
          {getParksPipelineStageLabel(currentStageId)}
        </StyledStageCaptionValue>
      </StyledStageCaption>
      <StyledTrackBlock>
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
          {t`Clic en un paso · LOI / Legal / Ganado solo en Cerrar`}
        </StyledStepperHint>
      </StyledTrackBlock>
    </StyledStepperSection>
  );
};
