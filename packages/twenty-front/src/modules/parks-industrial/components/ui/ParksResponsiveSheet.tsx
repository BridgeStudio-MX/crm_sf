import { styled } from '@linaria/react';
import { type ReactNode, useEffect } from 'react';
import { createPortal } from 'react-dom';
import { Key } from 'ts-key-enum';
import { MOBILE_VIEWPORT, themeCssVariables } from 'twenty-ui/theme-constants';

import { MODAL_CLICK_OUTSIDE_LISTENER_EXCLUDED_ID } from '@/ui/layout/modal/constants/ModalClickOutsideListenerExcludedClassName';
import { RootStackingContextZIndices } from '@/ui/layout/constants/RootStackingContextZIndices';
import { usePushFocusItemToFocusStack } from '@/ui/utilities/focus/hooks/usePushFocusItemToFocusStack';
import { useRemoveFocusItemFromFocusStackById } from '@/ui/utilities/focus/hooks/useRemoveFocusItemFromFocusStackById';
import { FocusComponentType } from '@/ui/utilities/focus/types/FocusComponentType';
import { useHotkeysOnFocusedElement } from '@/ui/utilities/hotkey/hooks/useHotkeysOnFocusedElement';

const DEFAULT_FOCUS_ID = 'parks-responsive-sheet';

const StyledOverlay = styled.div`
  align-items: center;
  background: ${themeCssVariables.background.overlayPrimary};
  display: flex;
  inset: 0;
  justify-content: center;
  padding: ${themeCssVariables.spacing[4]};
  position: fixed;
  z-index: ${RootStackingContextZIndices.RootModalBackDrop};

  @media (max-width: ${MOBILE_VIEWPORT}px) {
    align-items: flex-end;
    padding: 0;
  }
`;

const StyledSheet = styled.div`
  animation: parks-sheet-enter 0.24s ease;
  background: ${themeCssVariables.background.primary};
  border: 1px solid ${themeCssVariables.border.color.medium};
  border-radius: ${themeCssVariables.border.radius.xl};
  box-shadow: ${themeCssVariables.boxShadow.strong};
  display: flex;
  flex-direction: column;
  max-height: min(92vh, 920px);
  max-width: 880px;
  overflow: hidden;
  width: 100%;
  z-index: ${RootStackingContextZIndices.RootModal};

  @media (max-width: ${MOBILE_VIEWPORT}px) {
    border-bottom: none;
    border-radius: ${themeCssVariables.border.radius.xl}
      ${themeCssVariables.border.radius.xl} 0 0;
    max-height: 94vh;
    max-width: 100%;
  }

  @keyframes parks-sheet-enter {
    from {
      opacity: 0;
      transform: translateY(12px) scale(0.98);
    }

    to {
      opacity: 1;
      transform: translateY(0) scale(1);
    }
  }
`;

const StyledSheetHandleRow = styled.div`
  display: none;
  justify-content: center;
  padding: ${themeCssVariables.spacing[2]} 0 ${themeCssVariables.spacing[1]};

  @media (max-width: ${MOBILE_VIEWPORT}px) {
    display: flex;
  }
`;

const StyledSheetHandle = styled.span`
  background: ${themeCssVariables.border.color.medium};
  border-radius: 999px;
  height: 4px;
  width: 40px;
`;

const StyledSheetContent = styled.div`
  display: flex;
  flex: 1;
  flex-direction: column;
  min-height: 0;
  overflow: hidden;
`;

type ParksResponsiveSheetProps = {
  isOpen: boolean;
  onClose: () => void;
  children: ReactNode;
  focusId?: string;
  ariaLabelledBy?: string;
};

export const ParksResponsiveSheet = ({
  isOpen,
  onClose,
  children,
  focusId = DEFAULT_FOCUS_ID,
  ariaLabelledBy,
}: ParksResponsiveSheetProps) => {
  const { pushFocusItemToFocusStack } = usePushFocusItemToFocusStack();
  const { removeFocusItemFromFocusStackById } =
    useRemoveFocusItemFromFocusStackById();

  useEffect(() => {
    if (!isOpen) {
      return;
    }

    pushFocusItemToFocusStack({
      focusId,
      component: {
        type: FocusComponentType.MODAL,
        instanceId: focusId,
      },
      globalHotkeysConfig: {
        enableGlobalHotkeysWithModifiers: false,
        enableGlobalHotkeysConflictingWithKeyboard: false,
      },
    });

    return () => {
      removeFocusItemFromFocusStackById({ focusId });
    };
  }, [focusId, isOpen, pushFocusItemToFocusStack, removeFocusItemFromFocusStackById]);

  useHotkeysOnFocusedElement({
    keys: [Key.Escape],
    focusId,
    callback: onClose,
    dependencies: [onClose],
  });

  if (!isOpen) {
    return null;
  }

  return createPortal(
    <StyledOverlay
      role="presentation"
      onClick={onClose}
    >
      <StyledSheet
        id={MODAL_CLICK_OUTSIDE_LISTENER_EXCLUDED_ID}
        role="dialog"
        aria-modal="true"
        aria-labelledby={ariaLabelledBy}
        onClick={(event) => {
          event.stopPropagation();
        }}
      >
        <StyledSheetHandleRow aria-hidden="true">
          <StyledSheetHandle />
        </StyledSheetHandleRow>
        <StyledSheetContent>{children}</StyledSheetContent>
      </StyledSheet>
    </StyledOverlay>,
    document.body,
  );
};
