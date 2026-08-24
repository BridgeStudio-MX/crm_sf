import { styled } from '@linaria/react';
import { t } from '@lingui/core/macro';
import { IconChevronLeft, IconChevronRight, IconX } from 'twenty-ui/icon';
import { Button } from 'twenty-ui/input';
import { themeCssVariables } from 'twenty-ui/theme-constants';

import {
  PARKS_BRAND,
  PARKS_VIBE,
} from '@/parks-industrial/constants/parks-theme.constants';
import { type ParksGuidedTourStep } from '@/parks-industrial/utils/parks-guided-tour.util';

type ParksGuidedTourCardProps = {
  step: ParksGuidedTourStep;
  stepIndex: number;
  totalSteps: number;
  toolIndex: number | null;
  toolCount: number;
  groupLabel?: string;
  isLastStep: boolean;
  onSkip: () => void;
  onPrevious: () => void;
  onNext: () => void;
};

const StyledCard = styled.div`
  background: ${PARKS_VIBE.surface};
  border: 1px solid ${PARKS_BRAND.borderSoft};
  border-radius: ${PARKS_VIBE.radiusLg};
  box-shadow: ${PARKS_VIBE.shadowHover};
  display: flex;
  flex-direction: column;
  gap: ${PARKS_VIBE.space.md};
  max-width: min(380px, calc(100vw - 32px));
  min-width: min(320px, calc(100vw - 32px));
  padding: ${PARKS_VIBE.space.lg};
  pointer-events: auto;
`;

const StyledCardHeader = styled.div`
  align-items: flex-start;
  display: flex;
  gap: ${PARKS_VIBE.space.sm};
  justify-content: space-between;
`;

const StyledEyebrow = styled.div`
  color: ${PARKS_BRAND.primary};
  font-size: 11px;
  font-weight: ${themeCssVariables.font.weight.semiBold};
  letter-spacing: 0.06em;
  text-transform: uppercase;
`;

const StyledCounter = styled.div`
  background: ${PARKS_BRAND.primarySoft};
  border-radius: ${PARKS_VIBE.radiusPill};
  color: ${PARKS_BRAND.primary};
  flex-shrink: 0;
  font-size: ${themeCssVariables.font.size.xs};
  font-weight: ${themeCssVariables.font.weight.semiBold};
  padding: 4px 10px;
  white-space: nowrap;
`;

const StyledTitle = styled.h2`
  color: ${PARKS_VIBE.textPrimary};
  font-size: ${themeCssVariables.font.size.md};
  font-weight: ${themeCssVariables.font.weight.semiBold};
  line-height: 1.35;
  margin: 0;
`;

const StyledBody = styled.p`
  color: ${PARKS_VIBE.textSecondary};
  font-size: ${themeCssVariables.font.size.sm};
  line-height: 1.5;
  margin: 0;
`;

const StyledProgressTrack = styled.div`
  background: ${PARKS_VIBE.surfaceMuted};
  border-radius: ${PARKS_VIBE.radiusPill};
  height: 4px;
  overflow: hidden;
  width: 100%;
`;

const StyledProgressFill = styled.div`
  background: linear-gradient(
    90deg,
    ${PARKS_BRAND.primary} 0%,
    ${PARKS_BRAND.accent} 100%
  );
  border-radius: ${PARKS_VIBE.radiusPill};
  height: 100%;
  transition: width 0.25s ease;
`;

const StyledActions = styled.div`
  align-items: center;
  display: flex;
  gap: ${PARKS_VIBE.space.sm};
  justify-content: space-between;
`;

const StyledActionGroup = styled.div`
  display: flex;
  gap: ${PARKS_VIBE.space.xs};
`;

export const ParksGuidedTourCard = ({
  step,
  stepIndex,
  totalSteps,
  toolIndex,
  toolCount,
  groupLabel,
  isLastStep,
  onSkip,
  onPrevious,
  onNext,
}: ParksGuidedTourCardProps) => {
  const progressPercent =
    totalSteps <= 1 ? 100 : ((stepIndex + 1) / totalSteps) * 100;
  const counterLabel =
    toolIndex && toolCount > 0
      ? t`${toolIndex} de ${toolCount}`
      : t`${toolCount} en este demo`;
  const nextLabel = isLastStep
    ? t`Terminar`
    : step.kind === 'welcome'
      ? t`Ver mis herramientas`
      : t`Siguiente`;

  return (
    <StyledCard role="dialog" aria-labelledby="parks-guided-tour-title">
      <StyledCardHeader>
        <div>
          <StyledEyebrow>
            {groupLabel ??
              (step.kind === 'welcome'
                ? t`Tu área`
                : step.kind === 'page'
                  ? t`En pantalla`
                  : t`Herramienta`)}
          </StyledEyebrow>
          <StyledTitle id="parks-guided-tour-title">{step.title}</StyledTitle>
        </div>
        <StyledCounter>{counterLabel}</StyledCounter>
      </StyledCardHeader>
      <StyledProgressTrack aria-hidden="true">
        <StyledProgressFill style={{ width: `${progressPercent}%` }} />
      </StyledProgressTrack>
      <StyledBody>{step.body}</StyledBody>
      <StyledActions>
        <Button
          variant="tertiary"
          size="small"
          title={t`Saltar`}
          Icon={IconX}
          onClick={onSkip}
        />
        <StyledActionGroup>
          {stepIndex > 0 ? (
            <Button
              variant="secondary"
              size="small"
              title={t`Atrás`}
              Icon={IconChevronLeft}
              onClick={onPrevious}
            />
          ) : null}
          <Button
            variant="primary"
            size="small"
            title={nextLabel}
            Icon={isLastStep ? undefined : IconChevronRight}
            onClick={onNext}
          />
        </StyledActionGroup>
      </StyledActions>
    </StyledCard>
  );
};
