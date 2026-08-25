import { styled } from '@linaria/react';
import { type ReactNode, useEffect } from 'react';
import { createPortal } from 'react-dom';
import { Key } from 'ts-key-enum';
import { MOBILE_VIEWPORT } from 'twenty-ui/theme-constants';

import { MODAL_CLICK_OUTSIDE_LISTENER_EXCLUDED_ID } from '@/ui/layout/modal/constants/ModalClickOutsideListenerExcludedClassName';
import { RootStackingContextZIndices } from '@/ui/layout/constants/RootStackingContextZIndices';
import { usePushFocusItemToFocusStack } from '@/ui/utilities/focus/hooks/usePushFocusItemToFocusStack';
import { useRemoveFocusItemFromFocusStackById } from '@/ui/utilities/focus/hooks/useRemoveFocusItemFromFocusStackById';
import { FocusComponentType } from '@/ui/utilities/focus/types/FocusComponentType';
import { useHotkeysOnFocusedElement } from '@/ui/utilities/hotkey/hooks/useHotkeysOnFocusedElement';
import {
  PARKS_BRAND,
  PARKS_VIBE,
} from '@/parks-industrial/constants/parks-theme.constants';

const DEFAULT_FOCUS_ID = 'parks-responsive-sheet';

const StyledOverlay = styled.div`
  align-items: center;
  backdrop-filter: blur(6px);
  background: rgba(20, 28, 24, 0.42);
  display: flex;
  inset: 0;
  justify-content: center;
  padding: ${PARKS_VIBE.space.lg};
  position: fixed;
  z-index: ${RootStackingContextZIndices.RootModalBackDrop};

  @media (max-width: ${MOBILE_VIEWPORT}px) {
    align-items: flex-end;
    backdrop-filter: blur(4px);
    padding: 0;
  }
`;

const StyledSheet = styled.div<{ sheetSize: 'default' | 'wide' }>`
  animation: parks-sheet-enter 0.28s cubic-bezier(0.22, 1, 0.36, 1);
  background: ${PARKS_VIBE.surface};
  border: 1px solid ${PARKS_VIBE.borderStrong};
  border-radius: ${PARKS_VIBE.radiusLg};
  box-shadow:
    0 24px 64px rgba(20, 28, 24, 0.18),
    0 4px 16px rgba(20, 28, 24, 0.08);
  display: flex;
  flex-direction: column;
  max-height: ${({ sheetSize }) =>
    sheetSize === 'wide' ? 'min(96vh, 980px)' : 'min(92vh, 920px)'};
  max-width: ${({ sheetSize }) =>
    sheetSize === 'wide' ? 'min(1180px, 96vw)' : '880px'};
  overflow: hidden;
  width: 100%;
  z-index: ${RootStackingContextZIndices.RootModal};

  @media (max-width: ${MOBILE_VIEWPORT}px) {
    border-bottom: none;
    border-radius: ${PARKS_VIBE.radiusLg} ${PARKS_VIBE.radiusLg} 0 0;
    max-height: 94vh;
    max-width: 100%;
  }

  @keyframes parks-sheet-enter {
    from {
      opacity: 0;
      transform: translateY(16px) scale(0.985);
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
  padding: ${PARKS_VIBE.space.sm} 0 ${PARKS_VIBE.space.xs};

  @media (max-width: ${MOBILE_VIEWPORT}px) {
    display: flex;
  }
`;

const StyledSheetHandle = styled.span`
  background: rgba(50, 51, 56, 0.22);
  border-radius: ${PARKS_VIBE.radiusPill};
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

const StyledBrandRail = styled.div`
  background: linear-gradient(
    90deg,
    ${PARKS_BRAND.primary} 0%,
    ${PARKS_BRAND.accent} 100%
  );
  flex-shrink: 0;
  height: 3px;
  width: 100%;
`;

type ParksResponsiveSheetProps = {
  isOpen: boolean;
  onClose: () => void;
  children: ReactNode;
  focusId?: string;
  ariaLabelledBy?: string;
  size?: 'default' | 'wide';
};

export const ParksResponsiveSheet = ({
  isOpen,
  onClose,
  children,
  focusId = DEFAULT_FOCUS_ID,
  ariaLabelledBy,
  size = 'default',
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
  }, [
    focusId,
    isOpen,
    pushFocusItemToFocusStack,
    removeFocusItemFromFocusStackById,
  ]);

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
        sheetSize={size}
        id={MODAL_CLICK_OUTSIDE_LISTENER_EXCLUDED_ID}
        role="dialog"
        aria-modal="true"
        aria-labelledby={ariaLabelledBy}
        onClick={(event) => {
          event.stopPropagation();
        }}
      >
        <StyledBrandRail />
        <StyledSheetHandleRow aria-hidden="true">
          <StyledSheetHandle />
        </StyledSheetHandleRow>
        <StyledSheetContent>{children}</StyledSheetContent>
      </StyledSheet>
    </StyledOverlay>,
    document.body,
  );
};
