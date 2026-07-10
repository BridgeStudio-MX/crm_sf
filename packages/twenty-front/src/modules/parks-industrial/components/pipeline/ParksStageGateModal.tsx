import { styled } from '@linaria/react';
import { t } from '@lingui/core/macro';
import { useEffect } from 'react';
import { createPortal } from 'react-dom';
import { Key } from 'ts-key-enum';
import { IconAlertTriangle, IconX } from 'twenty-ui/icon';
import { Button } from 'twenty-ui/input';
import { themeCssVariables } from 'twenty-ui/theme-constants';

import { type ParksStageGateResult } from '@/parks-industrial/utils/parksStageGateUtil';
import { MODAL_CLICK_OUTSIDE_LISTENER_EXCLUDED_ID } from '@/ui/layout/modal/constants/ModalClickOutsideListenerExcludedClassName';
import { RootStackingContextZIndices } from '@/ui/layout/constants/RootStackingContextZIndices';
import { usePushFocusItemToFocusStack } from '@/ui/utilities/focus/hooks/usePushFocusItemToFocusStack';
import { useRemoveFocusItemFromFocusStackById } from '@/ui/utilities/focus/hooks/useRemoveFocusItemFromFocusStackById';
import { FocusComponentType } from '@/ui/utilities/focus/types/FocusComponentType';
import { useHotkeysOnFocusedElement } from '@/ui/utilities/hotkey/hooks/useHotkeysOnFocusedElement';

const STAGE_GATE_MODAL_FOCUS_ID = 'parks-stage-gate-modal';

const StyledOverlay = styled.div`
  align-items: center;
  background: ${themeCssVariables.background.overlayPrimary};
  display: flex;
  inset: 0;
  justify-content: center;
  padding: ${themeCssVariables.spacing[4]};
  position: fixed;
  z-index: ${RootStackingContextZIndices.RootModalBackDrop};
`;

const StyledModal = styled.div`
  background: ${themeCssVariables.background.primary};
  border: 1px solid ${themeCssVariables.color.red3};
  border-radius: ${themeCssVariables.border.radius.xl};
  box-shadow: ${themeCssVariables.boxShadow.strong};
  display: flex;
  flex-direction: column;
  max-width: 480px;
  overflow: hidden;
  width: 100%;
`;

const StyledHeader = styled.div`
  background: linear-gradient(
    135deg,
    ${themeCssVariables.color.red1} 0%,
    ${themeCssVariables.background.primary} 72%
  );
  border-bottom: 1px solid ${themeCssVariables.color.red3};
  display: flex;
  gap: ${themeCssVariables.spacing[3]};
  justify-content: space-between;
  padding: ${themeCssVariables.spacing[4]};
`;

const StyledHeaderMain = styled.div`
  display: flex;
  flex: 1;
  flex-direction: column;
  gap: ${themeCssVariables.spacing[2]};
`;

const StyledTitleRow = styled.div`
  align-items: flex-start;
  display: flex;
  gap: ${themeCssVariables.spacing[2]};
`;

const StyledTitle = styled.h2`
  color: ${themeCssVariables.color.red};
  font-size: ${themeCssVariables.font.size.md};
  font-weight: ${themeCssVariables.font.weight.semiBold};
  line-height: 1.4;
  margin: 0;
`;

const StyledSubtitle = styled.p`
  color: ${themeCssVariables.font.color.secondary};
  font-size: ${themeCssVariables.font.size.sm};
  line-height: 1.45;
  margin: 0;
`;

const StyledCloseButton = styled.button`
  align-items: center;
  background: ${themeCssVariables.background.transparent.light};
  border: 1px solid ${themeCssVariables.border.color.light};
  border-radius: ${themeCssVariables.border.radius.sm};
  color: ${themeCssVariables.font.color.secondary};
  cursor: pointer;
  display: flex;
  flex-shrink: 0;
  height: 32px;
  justify-content: center;
  width: 32px;

  &:hover {
    color: ${themeCssVariables.font.color.primary};
  }
`;

const StyledBody = styled.div`
  display: flex;
  flex-direction: column;
  gap: ${themeCssVariables.spacing[3]};
  padding: ${themeCssVariables.spacing[4]};
`;

const StyledRequirementsList = styled.ul`
  color: ${themeCssVariables.font.color.primary};
  font-size: ${themeCssVariables.font.size.sm};
  margin: 0;
  padding-left: ${themeCssVariables.spacing[4]};
`;

const StyledHintCard = styled.div`
  background: ${themeCssVariables.color.blue1};
  border: 1px solid ${themeCssVariables.color.blue3};
  border-radius: ${themeCssVariables.border.radius.sm};
  color: ${themeCssVariables.font.color.secondary};
  font-size: ${themeCssVariables.font.size.sm};
  line-height: 1.45;
  padding: ${themeCssVariables.spacing[3]};
`;

const StyledFooter = styled.div`
  border-top: 1px solid ${themeCssVariables.border.color.light};
  display: flex;
  justify-content: flex-end;
  padding: ${themeCssVariables.spacing[3]} ${themeCssVariables.spacing[4]};
`;

type ParksStageGateModalProps = {
  gateResult: Extract<ParksStageGateResult, { ok: false }>;
  dealName?: string;
  onClose: () => void;
};

export const ParksStageGateModal = ({
  gateResult,
  dealName,
  onClose,
}: ParksStageGateModalProps) => {
  const { pushFocusItemToFocusStack } = usePushFocusItemToFocusStack();
  const { removeFocusItemFromFocusStackById } =
    useRemoveFocusItemFromFocusStackById();

  useEffect(() => {
    pushFocusItemToFocusStack({
      focusId: STAGE_GATE_MODAL_FOCUS_ID,
      component: {
        type: FocusComponentType.MODAL,
        instanceId: STAGE_GATE_MODAL_FOCUS_ID,
      },
      globalHotkeysConfig: {
        enableGlobalHotkeysWithModifiers: false,
        enableGlobalHotkeysConflictingWithKeyboard: false,
      },
    });

    return () => {
      removeFocusItemFromFocusStackById({
        focusId: STAGE_GATE_MODAL_FOCUS_ID,
      });
    };
  }, [pushFocusItemToFocusStack, removeFocusItemFromFocusStackById]);

  useHotkeysOnFocusedElement({
    keys: [Key.Escape],
    focusId: STAGE_GATE_MODAL_FOCUS_ID,
    callback: onClose,
    dependencies: [onClose],
  });

  return createPortal(
    <StyledOverlay onClick={onClose}>
      <StyledModal
        id={MODAL_CLICK_OUTSIDE_LISTENER_EXCLUDED_ID}
        role="alertdialog"
        aria-modal="true"
        aria-labelledby="parks-stage-gate-title"
        onClick={(event) => {
          event.stopPropagation();
        }}
      >
        <StyledHeader>
          <StyledHeaderMain>
            <StyledTitleRow>
              <IconAlertTriangle size={20} color={themeCssVariables.color.red} />
              <StyledTitle id="parks-stage-gate-title">
                {t`No se puede cambiar de etapa`}
              </StyledTitle>
            </StyledTitleRow>
            <StyledSubtitle>
              {dealName
                ? t`${dealName} · destino: ${gateResult.targetStageLabel}`
                : t`Destino: ${gateResult.targetStageLabel}`}
            </StyledSubtitle>
          </StyledHeaderMain>
          <StyledCloseButton
            type="button"
            aria-label={t`Cerrar`}
            onClick={onClose}
          >
            <IconX size={16} />
          </StyledCloseButton>
        </StyledHeader>

        <StyledBody>
          <StyledSubtitle>{gateResult.error}</StyledSubtitle>

          {gateResult.missingRequirements.length > 0 ? (
            <div>
              <StyledSubtitle>{t`Falta completar:`}</StyledSubtitle>
              <StyledRequirementsList>
                {gateResult.missingRequirements.map((requirement) => (
                  <li key={requirement}>{requirement}</li>
                ))}
              </StyledRequirementsList>
            </div>
          ) : null}

          {gateResult.actionHint ? (
            <StyledHintCard>
              <strong>{t`Qué hacer:`}</strong> {gateResult.actionHint}
            </StyledHintCard>
          ) : null}
        </StyledBody>

        <StyledFooter>
          <Button title={t`Entendido`} variant="primary" onClick={onClose} />
        </StyledFooter>
      </StyledModal>
    </StyledOverlay>,
    document.body,
  );
};
