import { styled } from '@linaria/react';
import { type ReactNode, useEffect } from 'react';
import { createPortal } from 'react-dom';
import { MOBILE_VIEWPORT, themeCssVariables } from 'twenty-ui/theme-constants';

import { isSidePanelOpenedState } from '@/side-panel/states/isSidePanelOpenedState';
import { RootStackingContextZIndices } from '@/ui/layout/constants/RootStackingContextZIndices';
import { useAtomStateValue } from '@/ui/utilities/state/jotai/hooks/useAtomStateValue';

export const PARKS_DETAIL_DRAWER_WIDTH_PX = 420;

export const PARKS_MAIN_APP_CONTENT_SELECTOR = '[data-main-app-content]';

type DrawerPortalTarget = {
  element: HTMLElement;
  isAnchoredToMainContent: boolean;
};

const resolveDrawerPortalTarget = (): DrawerPortalTarget => {
  const mainAppContentElement = document.querySelector(
    PARKS_MAIN_APP_CONTENT_SELECTOR,
  );

  if (mainAppContentElement instanceof HTMLElement) {
    return {
      element: mainAppContentElement,
      isAnchoredToMainContent: true,
    };
  }

  return {
    element: document.body,
    isAnchoredToMainContent: false,
  };
};

const StyledBackdrop = styled.div<{ isAnchoredToMainContent: boolean }>`
  animation: parks-detail-fade-in 0.2s ease;
  backdrop-filter: ${themeCssVariables.blur.medium};
  background: ${themeCssVariables.background.overlayPrimary};
  bottom: 0;
  box-sizing: border-box;
  inset: 0;
  position: ${({ isAnchoredToMainContent }) =>
    isAnchoredToMainContent ? 'absolute' : 'fixed'};
  z-index: ${({ isAnchoredToMainContent }) =>
    isAnchoredToMainContent
      ? 1
      : RootStackingContextZIndices.RootModalBackDrop};

  @keyframes parks-detail-fade-in {
    from {
      opacity: 0;
    }

    to {
      opacity: 1;
    }
  }
`;

const StyledDrawer = styled.aside<{ isAnchoredToMainContent: boolean }>`
  animation: parks-detail-slide-in 0.25s ease;
  background: ${themeCssVariables.background.primary};
  border-left: 1px solid ${themeCssVariables.border.color.medium};
  bottom: 0;
  box-shadow: ${themeCssVariables.boxShadow.strong};
  box-sizing: border-box;
  display: flex;
  flex-direction: column;
  max-width: 100%;
  padding: ${themeCssVariables.spacing[3]};
  position: ${({ isAnchoredToMainContent }) =>
    isAnchoredToMainContent ? 'absolute' : 'fixed'};
  right: 0;
  top: 0;
  width: ${PARKS_DETAIL_DRAWER_WIDTH_PX}px;
  z-index: ${({ isAnchoredToMainContent }) =>
    isAnchoredToMainContent ? 2 : RootStackingContextZIndices.RootModal};

  @keyframes parks-detail-slide-in {
    from {
      opacity: 0;
      transform: translateX(16px);
    }

    to {
      opacity: 1;
      transform: translateX(0);
    }
  }

  @media (max-width: ${MOBILE_VIEWPORT}px) {
    padding: ${themeCssVariables.spacing[2]};
    width: 100%;
  }
`;

const StyledDrawerContent = styled.div`
  display: flex;
  flex: 1;
  flex-direction: column;
  min-height: 0;
  overflow: hidden;
`;

type ParksDetailDrawerProps = {
  isOpen: boolean;
  onClose: () => void;
  children: ReactNode;
};

export const ParksDetailDrawer = ({
  isOpen,
  onClose,
  children,
}: ParksDetailDrawerProps) => {
  const isSidePanelOpened = useAtomStateValue(isSidePanelOpenedState);

  useEffect(() => {
    if (!isOpen) {
      return;
    }

    const handleKeyDown = (event: KeyboardEvent) => {
      if (event.key === 'Escape' && !isSidePanelOpened) {
        onClose();
      }
    };

    document.addEventListener('keydown', handleKeyDown);

    return () => {
      document.removeEventListener('keydown', handleKeyDown);
    };
  }, [isOpen, isSidePanelOpened, onClose]);

  if (!isOpen) {
    return null;
  }

  const portalTarget = resolveDrawerPortalTarget();

  return createPortal(
    <>
      <StyledBackdrop
        isAnchoredToMainContent={portalTarget.isAnchoredToMainContent}
        role="presentation"
        onClick={onClose}
        aria-hidden
      />
      <StyledDrawer
        isAnchoredToMainContent={portalTarget.isAnchoredToMainContent}
        role="dialog"
        aria-modal="true"
        onClick={(event) => event.stopPropagation()}
      >
        <StyledDrawerContent>{children}</StyledDrawerContent>
      </StyledDrawer>
    </>,
    portalTarget.element,
  );
};
