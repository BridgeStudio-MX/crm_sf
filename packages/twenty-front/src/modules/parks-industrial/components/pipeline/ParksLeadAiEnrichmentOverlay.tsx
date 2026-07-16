import { styled } from '@linaria/react';
import { t } from '@lingui/core/macro';
import { useEffect, useMemo, useState } from 'react';
import { IconCheck, IconSparkles } from 'twenty-ui/icon';
import { themeCssVariables } from 'twenty-ui/theme-constants';

import { PARKS_BRAND } from '@/parks-industrial/constants/parks-theme.constants';

const ENRICHMENT_DURATION_MS = 6_200;
const COMPLETE_HOLD_MS = 900;

type EnrichmentStep = {
  id: string;
  label: string;
};

type ParksLeadAiEnrichmentOverlayProps = {
  companyName: string;
  fitScore?: number | null;
  onComplete: () => void;
};

const StyledPanel = styled.div`
  align-items: center;
  background: linear-gradient(
    165deg,
    rgba(0, 104, 55, 0.06) 0%,
    ${themeCssVariables.background.primary} 42%,
    rgba(141, 198, 63, 0.05) 100%
  );
  border: 1px solid ${PARKS_BRAND.borderSoft};
  border-radius: ${themeCssVariables.border.radius.xl};
  box-shadow: ${themeCssVariables.boxShadow.strong};
  display: flex;
  flex-direction: column;
  gap: ${themeCssVariables.spacing[4]};
  max-width: 440px;
  overflow: hidden;
  padding: ${themeCssVariables.spacing[6]} ${themeCssVariables.spacing[5]};
  position: relative;
  text-align: center;
  width: 100%;
`;

const StyledOrb = styled.div`
  animation: parks-lead-ai-orb-pulse 2.4s ease-in-out infinite;
  background: radial-gradient(
    circle,
    ${PARKS_BRAND.accentSoft} 0%,
    ${PARKS_BRAND.primarySoft} 48%,
    transparent 72%
  );
  height: 180px;
  left: 50%;
  pointer-events: none;
  position: absolute;
  top: -40px;
  transform: translateX(-50%);
  width: 180px;

  @keyframes parks-lead-ai-orb-pulse {
    0%,
    100% {
      opacity: 0.55;
      transform: translateX(-50%) scale(0.92);
    }

    50% {
      opacity: 1;
      transform: translateX(-50%) scale(1.08);
    }
  }
`;

const StyledIconRing = styled.div<{ isComplete: boolean }>`
  align-items: center;
  animation: ${({ isComplete }) =>
    isComplete
      ? 'parks-lead-ai-ring-done 0.45s ease forwards'
      : 'parks-lead-ai-ring-spin 2.8s linear infinite'};
  background: ${themeCssVariables.background.primary};
  border: 2px solid
    ${({ isComplete }) =>
      isComplete ? PARKS_BRAND.primary : PARKS_BRAND.borderSoft};
  border-radius: 50%;
  box-shadow: 0 0 0 6px ${PARKS_BRAND.primarySoft};
  color: ${PARKS_BRAND.primary};
  display: flex;
  height: 64px;
  justify-content: center;
  position: relative;
  width: 64px;
  z-index: 1;

  @keyframes parks-lead-ai-ring-spin {
    0% {
      box-shadow:
        0 0 0 6px ${PARKS_BRAND.primarySoft},
        0 0 0 0 rgba(141, 198, 63, 0.35);
    }

    70% {
      box-shadow:
        0 0 0 6px ${PARKS_BRAND.primarySoft},
        0 0 0 14px rgba(141, 198, 63, 0);
    }

    100% {
      box-shadow:
        0 0 0 6px ${PARKS_BRAND.primarySoft},
        0 0 0 0 rgba(141, 198, 63, 0);
    }
  }

  @keyframes parks-lead-ai-ring-done {
    0% {
      transform: scale(0.92);
    }

    60% {
      transform: scale(1.08);
    }

    100% {
      transform: scale(1);
    }
  }
`;

const StyledTitle = styled.h3`
  color: ${themeCssVariables.font.color.primary};
  font-size: ${themeCssVariables.font.size.lg};
  font-weight: ${themeCssVariables.font.weight.semiBold};
  margin: 0;
  position: relative;
  z-index: 1;
`;

const StyledCompany = styled.p`
  color: ${PARKS_BRAND.primary};
  font-size: ${themeCssVariables.font.size.md};
  font-weight: ${themeCssVariables.font.weight.medium};
  margin: 0;
  position: relative;
  z-index: 1;
`;

const StyledStatus = styled.p`
  animation: parks-lead-ai-status-fade 0.35s ease;
  color: ${themeCssVariables.font.color.secondary};
  font-size: ${themeCssVariables.font.size.sm};
  line-height: 1.45;
  margin: 0;
  min-height: 2.9em;
  position: relative;
  z-index: 1;

  @keyframes parks-lead-ai-status-fade {
    from {
      opacity: 0;
      transform: translateY(4px);
    }

    to {
      opacity: 1;
      transform: translateY(0);
    }
  }
`;

const StyledProgressTrack = styled.div`
  background: ${themeCssVariables.background.tertiary};
  border-radius: 999px;
  height: 8px;
  overflow: hidden;
  position: relative;
  width: 100%;
  z-index: 1;
`;

const StyledProgressFill = styled.div<{ percentage: number }>`
  background: linear-gradient(
    90deg,
    ${PARKS_BRAND.primary} 0%,
    ${PARKS_BRAND.accent} 100%
  );
  border-radius: 999px;
  height: 100%;
  transition: width 0.2s linear;
  width: ${({ percentage }) => `${Math.min(Math.max(percentage, 0), 100)}%`};
`;

const StyledSteps = styled.ul`
  display: flex;
  flex-direction: column;
  gap: ${themeCssVariables.spacing[2]};
  list-style: none;
  margin: 0;
  padding: 0;
  position: relative;
  text-align: left;
  width: 100%;
  z-index: 1;
`;

const StyledStep = styled.li<{ state: 'pending' | 'active' | 'done' }>`
  align-items: center;
  color: ${({ state }) =>
    state === 'pending'
      ? themeCssVariables.font.color.tertiary
      : state === 'active'
        ? PARKS_BRAND.primary
        : themeCssVariables.font.color.secondary};
  display: flex;
  font-size: ${themeCssVariables.font.size.sm};
  font-weight: ${({ state }) =>
    state === 'active'
      ? themeCssVariables.font.weight.medium
      : themeCssVariables.font.weight.regular};
  gap: ${themeCssVariables.spacing[2]};
  transition: color 0.2s ease;
`;

const StyledStepDot = styled.span<{ state: 'pending' | 'active' | 'done' }>`
  align-items: center;
  background: ${({ state }) =>
    state === 'done'
      ? PARKS_BRAND.primary
      : state === 'active'
        ? PARKS_BRAND.accentSoft
        : themeCssVariables.background.tertiary};
  border: 1px solid
    ${({ state }) =>
      state === 'pending' ? themeCssVariables.border.color.light : 'transparent'};
  border-radius: 50%;
  color: #ffffff;
  display: flex;
  flex-shrink: 0;
  height: 18px;
  justify-content: center;
  width: 18px;

  &[data-active='true'] {
    animation: parks-lead-ai-dot-pulse 1s ease-in-out infinite;
  }

  @keyframes parks-lead-ai-dot-pulse {
    0%,
    100% {
      opacity: 0.75;
      transform: scale(1);
    }

    50% {
      opacity: 1;
      transform: scale(1.12);
    }
  }
`;

const StyledScoreChip = styled.div`
  align-items: center;
  animation: parks-lead-ai-score-in 0.4s ease;
  background: ${PARKS_BRAND.primarySoft};
  border: 1px solid ${PARKS_BRAND.borderSoft};
  border-radius: ${themeCssVariables.border.radius.md};
  color: ${PARKS_BRAND.primary};
  display: flex;
  font-size: ${themeCssVariables.font.size.sm};
  font-weight: ${themeCssVariables.font.weight.semiBold};
  gap: ${themeCssVariables.spacing[2]};
  justify-content: center;
  padding: ${themeCssVariables.spacing[2]} ${themeCssVariables.spacing[3]};
  position: relative;
  z-index: 1;

  @keyframes parks-lead-ai-score-in {
    from {
      opacity: 0;
      transform: translateY(6px);
    }

    to {
      opacity: 1;
      transform: translateY(0);
    }
  }
`;

const getStepState = (
  stepIndex: number,
  activeIndex: number,
  isComplete: boolean,
): 'pending' | 'active' | 'done' => {
  if (isComplete || stepIndex < activeIndex) {
    return 'done';
  }

  if (stepIndex === activeIndex) {
    return 'active';
  }

  return 'pending';
};

export const ParksLeadAiEnrichmentOverlay = ({
  companyName,
  fitScore = null,
  onComplete,
}: ParksLeadAiEnrichmentOverlayProps) => {
  const steps = useMemo<EnrichmentStep[]>(
    () => [
      {
        id: 'linkedin',
        label: t`Buscando perfil y señales en LinkedIn`,
      },
      {
        id: 'web',
        label: t`Escaneando fuentes online de la empresa`,
      },
      {
        id: 'validate',
        label: t`Validando datos y giro del prospecto`,
      },
      {
        id: 'score',
        label: t`Calculando fit score comercial`,
      },
    ],
    [],
  );

  const [elapsedMs, setElapsedMs] = useState(0);
  const [isComplete, setIsComplete] = useState(false);

  useEffect(() => {
    const startedAt = Date.now();
    const tickId = window.setInterval(() => {
      const nextElapsed = Date.now() - startedAt;
      setElapsedMs(Math.min(nextElapsed, ENRICHMENT_DURATION_MS));

      if (nextElapsed >= ENRICHMENT_DURATION_MS) {
        window.clearInterval(tickId);
        setIsComplete(true);
      }
    }, 80);

    return () => {
      window.clearInterval(tickId);
    };
  }, []);

  useEffect(() => {
    if (!isComplete) {
      return;
    }

    const completeId = window.setTimeout(() => {
      onComplete();
    }, COMPLETE_HOLD_MS);

    return () => {
      window.clearTimeout(completeId);
    };
  }, [isComplete, onComplete]);

  const progressPercentage = Math.round(
    (elapsedMs / ENRICHMENT_DURATION_MS) * 100,
  );
  const activeStepIndex = Math.min(
    steps.length - 1,
    Math.floor((elapsedMs / ENRICHMENT_DURATION_MS) * steps.length),
  );
  const statusLabel = isComplete
    ? t`Prospecto nutrido y listo para calificación`
    : (steps[activeStepIndex]?.label ?? '');

  return (
    <StyledPanel role="status" aria-live="polite" aria-busy={!isComplete}>
      <StyledOrb aria-hidden />
      <StyledIconRing isComplete={isComplete}>
        {isComplete ? <IconCheck size={28} /> : <IconSparkles size={28} />}
      </StyledIconRing>
      <StyledTitle>
        {isComplete
          ? t`Análisis IA completado`
          : t`IA nutriendo el prospecto`}
      </StyledTitle>
      <StyledCompany>{companyName}</StyledCompany>
      <StyledStatus key={statusLabel}>{statusLabel}</StyledStatus>
      <StyledProgressTrack>
        <StyledProgressFill percentage={progressPercentage} />
      </StyledProgressTrack>
      <StyledSteps>
        {steps.map((step, stepIndex) => {
          const state = getStepState(stepIndex, activeStepIndex, isComplete);

          return (
            <StyledStep key={step.id} state={state}>
              <StyledStepDot
                state={state}
                data-active={state === 'active' ? 'true' : 'false'}
              >
                {state === 'done' ? <IconCheck size={11} /> : null}
              </StyledStepDot>
              {step.label}
            </StyledStep>
          );
        })}
      </StyledSteps>
      {isComplete && typeof fitScore === 'number' ? (
        <StyledScoreChip>
          {t`Fit score`} {fitScore}/100
        </StyledScoreChip>
      ) : null}
    </StyledPanel>
  );
};
