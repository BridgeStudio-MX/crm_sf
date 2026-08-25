import { useCallback, useEffect, useMemo } from 'react';
import { useNavigate } from 'react-router-dom';

import { PARKS_GUIDED_TOUR_NAV_SECTION_ID } from '@/parks-industrial/constants/parks-guided-tour.constants';
import { useParksAccess } from '@/parks-industrial/hooks/useParksAccess';
import {
  parksGuidedTourActiveState,
  parksGuidedTourAutoStartedEmailState,
  parksGuidedTourStepIndexState,
} from '@/parks-industrial/states/parks-guided-tour.state';
import { parksNavigationInfoOpenIdState } from '@/parks-industrial/states/parks-navigation-info-open-id.state';
import { buildParksGuidedTourSteps } from '@/parks-industrial/utils/parks-guided-tour.util';
import { useNavigationSection } from '@/ui/navigation/navigation-drawer/hooks/useNavigationSection';
import { isNavigationDrawerExpandedState } from '@/ui/navigation/states/isNavigationDrawerExpanded';
import { useAtomState } from '@/ui/utilities/state/jotai/hooks/useAtomState';
import { useSetAtomState } from '@/ui/utilities/state/jotai/hooks/useSetAtomState';

export const useParksGuidedTour = () => {
  const {
    primaryParksRoleLabel,
    userEmail,
    hasAnyParksNavAccess,
    canSeeNavItem,
  } = useParksAccess();
  const [isActive, setIsActive] = useAtomState(parksGuidedTourActiveState);
  const [stepIndex, setStepIndex] = useAtomState(parksGuidedTourStepIndexState);
  const [autoStartedEmail, setAutoStartedEmail] = useAtomState(
    parksGuidedTourAutoStartedEmailState,
  );
  const setIsNavigationDrawerExpanded = useSetAtomState(
    isNavigationDrawerExpandedState,
  );
  const setOpenInfoId = useSetAtomState(parksNavigationInfoOpenIdState);
  const navigate = useNavigate();
  const { openNavigationSection } = useNavigationSection(
    PARKS_GUIDED_TOUR_NAV_SECTION_ID,
  );

  const steps = useMemo(() => {
    return buildParksGuidedTourSteps({
      canAccessRoute: canSeeNavItem,
      roleLabel: primaryParksRoleLabel,
    });
  }, [canSeeNavItem, primaryParksRoleLabel]);

  const currentStep = useMemo(
    () => steps[stepIndex] ?? steps[0] ?? null,
    [stepIndex, steps],
  );
  const isLastStep = stepIndex >= steps.length - 1;
  const normalizedEmail = userEmail?.trim().toLowerCase() ?? '';

  // Logout / session clear → allow auto-start again on next login
  useEffect(() => {
    if (!normalizedEmail && autoStartedEmail !== null) {
      setAutoStartedEmail(null);
    }
  }, [autoStartedEmail, normalizedEmail, setAutoStartedEmail]);

  const markAutoStartedForCurrentUser = useCallback(() => {
    if (normalizedEmail) {
      setAutoStartedEmail(normalizedEmail);
    }
  }, [normalizedEmail, setAutoStartedEmail]);

  const prepareWorkspaceForTour = useCallback(() => {
    setIsNavigationDrawerExpanded(true);
    openNavigationSection();
    setOpenInfoId(null);
  }, [openNavigationSection, setIsNavigationDrawerExpanded, setOpenInfoId]);

  const startTour = useCallback(() => {
    if (!hasAnyParksNavAccess || steps.length === 0) {
      return;
    }

    prepareWorkspaceForTour();
    setStepIndex(0);
    setIsActive(true);
    markAutoStartedForCurrentUser();
  }, [
    hasAnyParksNavAccess,
    markAutoStartedForCurrentUser,
    prepareWorkspaceForTour,
    setIsActive,
    setStepIndex,
    steps.length,
  ]);

  const stopTour = useCallback(() => {
    setIsActive(false);
    setStepIndex(0);
    markAutoStartedForCurrentUser();
  }, [markAutoStartedForCurrentUser, setIsActive, setStepIndex]);

  const skipTour = useCallback(() => {
    stopTour();
  }, [stopTour]);

  const completeTour = useCallback(() => {
    stopTour();
  }, [stopTour]);

  const goToStep = useCallback(
    (nextIndex: number) => {
      const nextStep = steps[nextIndex];

      prepareWorkspaceForTour();

      if (nextStep?.path) {
        navigate(nextStep.path);
      }

      setStepIndex(nextIndex);
    },
    [navigate, prepareWorkspaceForTour, setStepIndex, steps],
  );

  const goToNextStep = useCallback(() => {
    if (isLastStep) {
      completeTour();
      return;
    }

    goToStep(Math.min(stepIndex + 1, steps.length - 1));
  }, [completeTour, goToStep, isLastStep, stepIndex, steps.length]);

  const goToPreviousStep = useCallback(() => {
    goToStep(Math.max(stepIndex - 1, 0));
  }, [goToStep, stepIndex]);

  const shouldAutoStart =
    hasAnyParksNavAccess &&
    normalizedEmail.length > 0 &&
    steps.length > 0 &&
    !isActive &&
    autoStartedEmail !== normalizedEmail;

  return {
    isActive,
    stepIndex,
    steps,
    currentStep,
    isLastStep,
    hasCompletedTour: false,
    shouldAutoStart,
    startTour,
    skipTour,
    completeTour,
    goToNextStep,
    goToPreviousStep,
  };
};
