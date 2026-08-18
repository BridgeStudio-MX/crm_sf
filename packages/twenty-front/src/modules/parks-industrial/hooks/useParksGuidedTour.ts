import { useCallback, useMemo } from 'react';
import { isDefined } from 'twenty-shared/utils';

import { PARKS_GUIDED_TOUR_NAV_SECTION_ID } from '@/parks-industrial/constants/parks-guided-tour.constants';
import {
  PARKS_ROUTE_ACCESS_BY_KEY,
  type ParksRouteAccessKey,
} from '@/parks-industrial/constants/parks-role-access.constants';
import { useParksAccess } from '@/parks-industrial/hooks/useParksAccess';
import {
  parksGuidedTourActiveState,
  parksGuidedTourCompletedEmailsState,
  parksGuidedTourStepIndexState,
} from '@/parks-industrial/states/parks-guided-tour.state';
import { parksNavigationInfoOpenIdState } from '@/parks-industrial/states/parks-navigation-info-open-id.state';
import { buildParksGuidedTourSteps } from '@/parks-industrial/utils/parks-guided-tour.util';
import { hasAnyParksRoleLabel } from '@/parks-industrial/utils/parks-role-access.util';
import { useNavigationSection } from '@/ui/navigation/navigation-drawer/hooks/useNavigationSection';
import { isNavigationDrawerExpandedState } from '@/ui/navigation/states/isNavigationDrawerExpanded';
import { useAtomState } from '@/ui/utilities/state/jotai/hooks/useAtomState';
import { useSetAtomState } from '@/ui/utilities/state/jotai/hooks/useSetAtomState';

export const useParksGuidedTour = () => {
  const {
    primaryParksRoleLabel,
    userEmail,
    hasAnyParksNavAccess,
    hasFullParksAccess,
    parksRoleLabels,
  } = useParksAccess();
  const [isActive, setIsActive] = useAtomState(parksGuidedTourActiveState);
  const [stepIndex, setStepIndex] = useAtomState(parksGuidedTourStepIndexState);
  const [completedEmails, setCompletedEmails] = useAtomState(
    parksGuidedTourCompletedEmailsState,
  );
  const setIsNavigationDrawerExpanded = useSetAtomState(
    isNavigationDrawerExpandedState,
  );
  const setOpenInfoId = useSetAtomState(parksNavigationInfoOpenIdState);
  const { openNavigationSection } = useNavigationSection(
    PARKS_GUIDED_TOUR_NAV_SECTION_ID,
  );

  const steps = useMemo(() => {
    const canAccessRoute = (accessKey: ParksRouteAccessKey): boolean => {
      if (hasFullParksAccess) {
        return true;
      }

      return hasAnyParksRoleLabel(
        parksRoleLabels,
        PARKS_ROUTE_ACCESS_BY_KEY[accessKey],
      );
    };

    return buildParksGuidedTourSteps({
      canAccessRoute,
      roleLabel: primaryParksRoleLabel,
    });
  }, [hasFullParksAccess, parksRoleLabels, primaryParksRoleLabel]);

  const currentStep = steps[stepIndex] ?? steps[0] ?? null;
  const isLastStep = stepIndex >= steps.length - 1;
  const normalizedEmail = userEmail?.trim().toLowerCase() ?? '';
  const hasCompletedTour =
    normalizedEmail.length > 0 &&
    completedEmails[normalizedEmail] === true;

  const prepareWorkspaceForTour = useCallback(() => {
    setIsNavigationDrawerExpanded(true);
    openNavigationSection();
    setOpenInfoId(null);
  }, [openNavigationSection, setIsNavigationDrawerExpanded, setOpenInfoId]);

  const markTourCompleted = useCallback(() => {
    if (!normalizedEmail) {
      return;
    }

    setCompletedEmails((current) => ({
      ...current,
      [normalizedEmail]: true,
    }));
  }, [normalizedEmail, setCompletedEmails]);

  const startTour = useCallback(() => {
    if (!hasAnyParksNavAccess || steps.length === 0) {
      return;
    }

    prepareWorkspaceForTour();
    setStepIndex(0);
    setIsActive(true);
  }, [
    hasAnyParksNavAccess,
    prepareWorkspaceForTour,
    setIsActive,
    setStepIndex,
    steps.length,
  ]);

  const stopTour = useCallback(
    (options?: { persistCompletion?: boolean }) => {
      setIsActive(false);
      setStepIndex(0);

      if (options?.persistCompletion) {
        markTourCompleted();
      }
    },
    [markTourCompleted, setIsActive, setStepIndex],
  );

  const skipTour = useCallback(() => {
    stopTour({ persistCompletion: true });
  }, [stopTour]);

  const completeTour = useCallback(() => {
    stopTour({ persistCompletion: true });
  }, [stopTour]);

  const goToNextStep = useCallback(() => {
    if (isLastStep) {
      completeTour();
      return;
    }

    prepareWorkspaceForTour();
    setStepIndex((current) => Math.min(current + 1, steps.length - 1));
  }, [
    completeTour,
    isLastStep,
    prepareWorkspaceForTour,
    setStepIndex,
    steps.length,
  ]);

  const goToPreviousStep = useCallback(() => {
    prepareWorkspaceForTour();
    setStepIndex((current) => Math.max(current - 1, 0));
  }, [prepareWorkspaceForTour, setStepIndex]);

  const shouldAutoStart =
    hasAnyParksNavAccess &&
    isDefined(userEmail) &&
    !hasCompletedTour &&
    !isActive &&
    steps.length > 1;

  return {
    isActive,
    stepIndex,
    steps,
    currentStep,
    isLastStep,
    hasCompletedTour,
    shouldAutoStart,
    startTour,
    skipTour,
    completeTour,
    goToNextStep,
    goToPreviousStep,
  };
};
