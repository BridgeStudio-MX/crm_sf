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
  animation: parks-lead-ai-panel-in 0.42s cubic-bezier(0.22, 1, 0.36, 1);
  background: ${themeCssVariables.background.primary};
  border: 1px solid ${themeCssVariables.border.color.medium};
  border-radius: ${themeCssVariables.border.radius.xl};
  box-shadow:
    0 24px 48px rgba(15, 23, 20, 0.28),
    0 0 0 1px rgba(0, 104, 55, 0.08);
  display: flex;
  flex-direction: column;
  max-width: 460px;
  overflow: hidden;
  position: relative;
  width: 100%;

  @keyframes parks-lead-ai-panel-in {
    from {
      opacity: 0;
      transform: translateY(14px) scale(0.97);
    }

    to {
      opacity: 1;
      transform: translateY(0) scale(1);
    }
  }
`;

const StyledHero = styled.div`
  align-items: center;
  background: linear-gradient(
    145deg,
    #004d29 0%,
    ${PARKS_BRAND.primary} 48%,
    #0a7a42 100%
  );
  display: flex;
  flex-direction: column;
  gap: ${themeCssVariables.spacing[3]};
  padding: ${themeCssVariables.spacing[5]} ${themeCssVariables.spacing[5]}
    ${themeCssVariables.spacing[6]};
  position: relative;
  text-align: center;
`;

const StyledHeroAccent = styled.div`
  background: linear-gradient(
    90deg,
    transparent 0%,
    ${PARKS_BRAND.accent} 50%,
    transparent 100%
  );
  bottom: 0;
  height: 3px;
  left: 0;
  position: absolute;
  right: 0;
`;

const StyledIconRing = styled.div<{ isComplete: boolean }>`
  align-items: center;
  animation: ${({ isComplete }) =>
    isComplete
      ? 'parks-lead-ai-ring-done 0.45s ease forwards'
      : 'parks-lead-ai-ring-pulse 2.2s ease-in-out infinite'};
  background: #ffffff;
  border: 2px solid
    ${({ isComplete }) => (isComplete ? PARKS_BRAND.accent : '#ffffff')};
  border-radius: 50%;
  box-shadow:
    0 8px 20px rgba(0, 0, 0, 0.18),
    0 0 0 8px rgba(255, 255, 255, 0.14);
  color: ${PARKS_BRAND.primary};
  display: flex;
  height: 72px;
  justify-content: center;
  width: 72px;

  @keyframes parks-lead-ai-ring-pulse {
    0%,
    100% {
      box-shadow:
        0 8px 20px rgba(0, 0, 0, 0.18),
        0 0 0 8px rgba(255, 255, 255, 0.14);
      transform: scale(1);
    }

    50% {
      box-shadow:
        0 10px 24px rgba(0, 0, 0, 0.2),
        0 0 0 14px rgba(141, 198, 63, 0.22);
      transform: scale(1.04);
    }
  }

  @keyframes parks-lead-ai-ring-done {
    0% {
      transform: scale(0.9);
    }

    55% {
      transform: scale(1.1);
    }

    100% {
      transform: scale(1);
    }
  }
`;

const StyledEyebrow = styled.span`
  background: rgba(255, 255, 255, 0.16);
  border: 1px solid rgba(255, 255, 255, 0.28);
  border-radius: ${themeCssVariables.border.radius.sm};
  color: #ffffff;
  font-size: ${themeCssVariables.font.size.xs};
  font-weight: ${themeCssVariables.font.weight.semiBold};
  letter-spacing: 0.06em;
  padding: ${themeCssVariables.spacing[1]} ${themeCssVariables.spacing[2]};
  text-transform: uppercase;
`;

const StyledTitle = styled.h3`
  color: #ffffff;
  font-size: ${themeCssVariables.font.size.xl};
  font-weight: ${themeCssVariables.font.weight.semiBold};
  letter-spacing: -0.02em;
  line-height: 1.2;
  margin: 0;
`;

const StyledCompany = styled.p`
  color: ${PARKS_BRAND.accent};
  font-size: ${themeCssVariables.font.size.md};
  font-weight: ${themeCssVariables.font.weight.semiBold};
  margin: 0;
`;

const StyledBody = styled.div`
  display: flex;
  flex-direction: column;
  gap: ${themeCssVariables.spacing[4]};
  padding: ${themeCssVariables.spacing[4]} ${themeCssVariables.spacing[5]}
    ${themeCssVariables.spacing[5]};
`;

const StyledStatusRow = styled.div`
  align-items: flex-start;
  display: flex;
  gap: ${themeCssVariables.spacing[3]};
  justify-content: space-between;
`;

const StyledStatus = styled.p`
  animation: parks-lead-ai-status-fade 0.35s ease;
  color: ${themeCssVariables.font.color.primary};
  flex: 1;
  font-size: ${themeCssVariables.font.size.sm};
  font-weight: ${themeCssVariables.font.weight.medium};
  line-height: 1.45;
  margin: 0;
  min-height: 2.6em;
  text-align: left;

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

const StyledPercent = styled.span`
  color: ${PARKS_BRAND.primary};
  font-size: ${themeCssVariables.font.size.lg};
  font-variant-numeric: tabular-nums;
  font-weight: ${themeCssVariables.font.weight.semiBold};
  line-height: 1;
`;

const StyledProgressTrack = styled.div`
  background: ${themeCssVariables.background.tertiary};
  border-radius: 999px;
  height: 10px;
  overflow: hidden;
  position: relative;
  width: 100%;
`;

const StyledProgressFill = styled.div<{ percentage: number }>`
  background: linear-gradient(
    90deg,
    ${PARKS_BRAND.primary} 0%,
    ${PARKS_BRAND.accent} 100%
  );
  border-radius: 999px;
  height: 100%;
  position: relative;
  transition: width 0.2s linear;
  width: ${({ percentage }) => `${Math.min(Math.max(percentage, 0), 100)}%`};

  &::after {
    animation: parks-lead-ai-shimmer 1.4s linear infinite;
    background: linear-gradient(
      90deg,
      transparent 0%,
      rgba(255, 255, 255, 0.45) 50%,
      transparent 100%
    );
    content: '';
    inset: 0;
    position: absolute;
  }

  @keyframes parks-lead-ai-shimmer {
    from {
      transform: translateX(-100%);
    }

    to {
      transform: translateX(100%);
    }
  }
`;

const StyledSteps = styled.ul`
  display: flex;
  flex-direction: column;
  gap: ${themeCssVariables.spacing[2]};
  list-style: none;
  margin: 0;
  padding: 0;
  width: 100%;
`;

const StyledStep = styled.li<{ state: 'pending' | 'active' | 'done' }>`
  align-items: center;
  background: ${({ state }) =>
    state === 'active'
      ? PARKS_BRAND.primarySoft
      : state === 'done'
        ? themeCssVariables.background.secondary
        : themeCssVariables.background.primary};
  border: 1px solid
    ${({ state }) =>
      state === 'active'
        ? PARKS_BRAND.borderSoft
        : state === 'done'
          ? themeCssVariables.border.color.light
          : themeCssVariables.border.color.light};
  border-radius: ${themeCssVariables.border.radius.md};
  color: ${({ state }) =>
    state === 'pending'
      ? themeCssVariables.font.color.tertiary
      : state === 'active'
        ? PARKS_BRAND.primary
        : themeCssVariables.font.color.primary};
  display: flex;
  font-size: ${themeCssVariables.font.size.sm};
  font-weight: ${({ state }) =>
    state === 'active'
      ? themeCssVariables.font.weight.semiBold
      : themeCssVariables.font.weight.medium};
  gap: ${themeCssVariables.spacing[2]};
  padding: ${themeCssVariables.spacing[2]} ${themeCssVariables.spacing[3]};
  transition:
    background 0.2s ease,
    border-color 0.2s ease,
    color 0.2s ease;
`;

const StyledStepDot = styled.span<{ state: 'pending' | 'active' | 'done' }>`
  align-items: center;
  background: ${({ state }) =>
    state === 'done'
      ? PARKS_BRAND.primary
      : state === 'active'
        ? PARKS_BRAND.accent
        : themeCssVariables.background.tertiary};
  border: 1px solid
    ${({ state }) =>
      state === 'pending' ? themeCssVariables.border.color.medium : 'transparent'};
  border-radius: 50%;
  color: #ffffff;
  display: flex;
  flex-shrink: 0;
  height: 22px;
  justify-content: center;
  width: 22px;

  &[data-active='true'] {
    animation: parks-lead-ai-dot-pulse 1s ease-in-out infinite;
  }

  @keyframes parks-lead-ai-dot-pulse {
    0%,
    100% {
      box-shadow: 0 0 0 0 rgba(141, 198, 63, 0.45);
      transform: scale(1);
    }

    50% {
      box-shadow: 0 0 0 6px rgba(141, 198, 63, 0);
      transform: scale(1.08);
    }
  }
`;

const StyledScoreChip = styled.div`
  align-items: center;
  animation: parks-lead-ai-score-in 0.4s ease;
  background: linear-gradient(
    135deg,
    ${PARKS_BRAND.primarySoft} 0%,
    ${PARKS_BRAND.accentSoft} 100%
  );
  border: 1px solid ${PARKS_BRAND.borderSoft};
  border-radius: ${themeCssVariables.border.radius.md};
  color: ${PARKS_BRAND.primary};
  display: flex;
  font-size: ${themeCssVariables.font.size.sm};
  font-weight: ${themeCssVariables.font.weight.semiBold};
  gap: ${themeCssVariables.spacing[2]};
  justify-content: center;
  padding: ${themeCssVariables.spacing[3]};

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

const StyledScoreValue = styled.span`
  color: ${PARKS_BRAND.primary};
  font-size: ${themeCssVariables.font.size.xl};
  font-variant-numeric: tabular-nums;
  font-weight: ${themeCssVariables.font.weight.semiBold};
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
      <StyledHero>
        <StyledIconRing isComplete={isComplete}>
          {isComplete ? <IconCheck size={30} /> : <IconSparkles size={30} />}
        </StyledIconRing>
        <StyledEyebrow>
          {isComplete ? t`Listo` : t`Análisis IA`}
        </StyledEyebrow>
        <StyledTitle>
          {isComplete
            ? t`Análisis IA completado`
            : t`IA nutriendo el prospecto`}
        </StyledTitle>
        <StyledCompany>{companyName}</StyledCompany>
        <StyledHeroAccent aria-hidden />
      </StyledHero>

      <StyledBody>
        <StyledStatusRow>
          <StyledStatus key={statusLabel}>{statusLabel}</StyledStatus>
          <StyledPercent>{progressPercentage}%</StyledPercent>
        </StyledStatusRow>

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
                  {state === 'done' ? <IconCheck size={12} /> : null}
                </StyledStepDot>
                {step.label}
              </StyledStep>
            );
          })}
        </StyledSteps>

        {isComplete && typeof fitScore === 'number' ? (
          <StyledScoreChip>
            {t`Fit score`}
            <StyledScoreValue>{fitScore}/100</StyledScoreValue>
          </StyledScoreChip>
        ) : null}
      </StyledBody>
    </StyledPanel>
  );
};
