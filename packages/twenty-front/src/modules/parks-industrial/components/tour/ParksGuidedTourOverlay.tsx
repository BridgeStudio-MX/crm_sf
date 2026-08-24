import { styled } from '@linaria/react';
import { t } from '@lingui/core/macro';
import { useEffect, useLayoutEffect, useState } from 'react';
import { createPortal } from 'react-dom';
import { isDefined } from 'twenty-shared/utils';

import { ParksGuidedTourCard } from '@/parks-industrial/components/tour/ParksGuidedTourCard';
import { PARKS_BRAND } from '@/parks-industrial/constants/parks-theme.constants';
import { useParksGuidedTour } from '@/parks-industrial/hooks/useParksGuidedTour';
import {
  countParksGuidedTourTools,
  resolveParksGuidedTourToolIndex,
} from '@/parks-industrial/utils/parks-guided-tour.util';

type SpotlightRect = {
  top: number;
  left: number;
  width: number;
  height: number;
};

type TooltipCoords = {
  top: number;
  left: number;
};

const SPOTLIGHT_PADDING_PX = 6;
const TOOLTIP_WIDTH_PX = 380;
const TOOLTIP_ESTIMATED_HEIGHT_PX = 280;
const TOOLTIP_GAP_PX = 16;

const StyledLayer = styled.div`
  inset: 0;
  pointer-events: none;
  position: fixed;
  z-index: 12000;
`;

const StyledCatcher = styled.div`
  inset: 0;
  pointer-events: auto;
  position: fixed;
`;

const StyledHole = styled.div`
  border-radius: 10px;
  box-shadow:
    0 0 0 2px ${PARKS_BRAND.accent},
    0 0 0 6px ${PARKS_BRAND.primarySoft},
    0 0 0 9999px rgba(12, 24, 18, 0.72);
  pointer-events: auto;
  position: fixed;
  transition:
    top 0.22s ease,
    left 0.22s ease,
    width 0.22s ease,
    height 0.22s ease;
  z-index: 12001;
`;

const StyledTooltipWrap = styled.div`
  pointer-events: auto;
  position: fixed;
  z-index: 12002;
`;

const holesMatch = (
  left: SpotlightRect | null,
  right: SpotlightRect | null,
): boolean => {
  if (!left || !right) {
    return left === right;
  }

  return (
    left.top === right.top &&
    left.left === right.left &&
    left.width === right.width &&
    left.height === right.height
  );
};

const resolveTooltipCoords = (
  hole: SpotlightRect,
  kind: 'welcome' | 'tool' | 'page',
): TooltipCoords => {
  if (kind === 'welcome' || kind === 'page') {
    return {
      top: Math.min(
        hole.top + hole.height + TOOLTIP_GAP_PX,
        window.innerHeight - TOOLTIP_ESTIMATED_HEIGHT_PX - 16,
      ),
      left: Math.max(
        16,
        Math.min(hole.left, window.innerWidth - TOOLTIP_WIDTH_PX - 16),
      ),
    };
  }

  const preferredLeft = hole.left + hole.width + TOOLTIP_GAP_PX;
  const fitsOnRight =
    preferredLeft + TOOLTIP_WIDTH_PX < window.innerWidth - 16;

  return {
    top: Math.max(
      16,
      Math.min(hole.top, window.innerHeight - TOOLTIP_ESTIMATED_HEIGHT_PX - 16),
    ),
    left: fitsOnRight
      ? preferredLeft
      : Math.max(16, hole.left - TOOLTIP_WIDTH_PX - TOOLTIP_GAP_PX),
  };
};

const measureTarget = (
  target: string,
  shouldScroll: boolean,
): SpotlightRect | null => {
  const element = document.querySelector(
    `[data-parks-tour-target="${target}"]`,
  );

  if (!element) {
    return null;
  }

  if (shouldScroll) {
    element.scrollIntoView({ block: 'nearest', inline: 'nearest' });
  }

  const boundingRect = element.getBoundingClientRect();

  if (boundingRect.width < 4 || boundingRect.height < 4) {
    return null;
  }

  return {
    top: Math.max(8, boundingRect.top - SPOTLIGHT_PADDING_PX),
    left: Math.max(8, boundingRect.left - SPOTLIGHT_PADDING_PX),
    width: boundingRect.width + SPOTLIGHT_PADDING_PX * 2,
    height: boundingRect.height + SPOTLIGHT_PADDING_PX * 2,
  };
};

export const ParksGuidedTourOverlay = () => {
  const {
    isActive,
    stepIndex,
    steps,
    currentStep,
    isLastStep,
    shouldAutoStart,
    startTour,
    skipTour,
    goToNextStep,
    goToPreviousStep,
  } = useParksGuidedTour();
  const [hole, setHole] = useState<SpotlightRect | null>(null);

  useEffect(() => {
    if (!shouldAutoStart) {
      return;
    }

    startTour();
  }, [shouldAutoStart, startTour]);

  useLayoutEffect(() => {
    if (!isActive || !currentStep) {
      setHole(null);
      return;
    }

    let animationFrame = 0;
    let attemptCount = 0;

    const syncHole = () => {
      const nextHole = measureTarget(currentStep.target, true);

      if (nextHole) {
        setHole((currentHole) =>
          holesMatch(currentHole, nextHole) ? currentHole : nextHole,
        );
        return;
      }

      attemptCount += 1;

      if (attemptCount < 90) {
        animationFrame = window.requestAnimationFrame(syncHole);
      }
    };

    syncHole();

    const handleViewportChange = () => {
      const nextHole = measureTarget(currentStep.target, false);

      if (nextHole) {
        setHole((currentHole) =>
          holesMatch(currentHole, nextHole) ? currentHole : nextHole,
        );
      }
    };

    window.addEventListener('resize', handleViewportChange);
    window.addEventListener('scroll', handleViewportChange, true);

    return () => {
      window.cancelAnimationFrame(animationFrame);
      window.removeEventListener('resize', handleViewportChange);
      window.removeEventListener('scroll', handleViewportChange, true);
    };
  }, [currentStep, isActive]);

  useEffect(() => {
    if (!isActive) {
      return;
    }

    const handleKeyDown = (event: KeyboardEvent) => {
      if (event.key === 'Escape') {
        event.preventDefault();
        skipTour();
        return;
      }

      if (event.key === 'ArrowRight') {
        event.preventDefault();
        goToNextStep();
        return;
      }

      if (event.key === 'ArrowLeft') {
        event.preventDefault();
        goToPreviousStep();
      }
    };

    document.addEventListener('keydown', handleKeyDown);

    return () => {
      document.removeEventListener('keydown', handleKeyDown);
    };
  }, [goToNextStep, goToPreviousStep, isActive, skipTour]);

  if (!isActive || !currentStep) {
    return null;
  }

  const toolCount = countParksGuidedTourTools(steps);
  const toolIndex = resolveParksGuidedTourToolIndex(steps, stepIndex);
  const groupLabels: Record<string, string> = {
    commercial: t`Comercial`,
    legal: t`Legal`,
    operations: t`Operaciones`,
  };
  const groupLabel =
    currentStep.kind === 'page'
      ? t`Inventario`
      : currentStep.kind === 'tool'
        ? currentStep.groupKey
          ? groupLabels[currentStep.groupKey]
          : t`Resumen`
        : undefined;
  const tooltipCoords = isDefined(hole)
    ? resolveTooltipCoords(hole, currentStep.kind)
    : { top: 96, left: 96 };

  return createPortal(
    <StyledLayer>
      <StyledCatcher />
      {hole ? (
        <StyledHole
          style={{
            top: hole.top,
            left: hole.left,
            width: hole.width,
            height: hole.height,
          }}
        />
      ) : null}
      <StyledTooltipWrap
        style={{ top: tooltipCoords.top, left: tooltipCoords.left }}
      >
        <ParksGuidedTourCard
          step={currentStep}
          stepIndex={stepIndex}
          totalSteps={steps.length}
          toolIndex={toolIndex}
          toolCount={toolCount}
          groupLabel={groupLabel}
          isLastStep={isLastStep}
          onSkip={skipTour}
          onPrevious={goToPreviousStep}
          onNext={goToNextStep}
        />
      </StyledTooltipWrap>
    </StyledLayer>,
    document.body,
  );
};
