import { styled } from '@linaria/react';
import { t } from '@lingui/core/macro';
import { useEffect, useState } from 'react';
import { createPortal } from 'react-dom';
import { Key } from 'ts-key-enum';
import { IconUsers, IconX } from 'twenty-ui/icon';
import { Button } from 'twenty-ui/input';
import { MOBILE_VIEWPORT, themeCssVariables } from 'twenty-ui/theme-constants';

import { ParksNewEmpresaBrokerModal } from '@/parks-industrial/components/brokers/ParksNewEmpresaBrokerModal';
import {
  StyledParksInput,
  StyledParksSelect,
} from '@/parks-industrial/components/ui/parks-form-control.styles';
import {
  createParksBroker,
  fetchParksEmpresasBroker,
  type ParksBroker,
  type ParksBrokerInput,
  type ParksEmpresaBroker,
} from '@/parks-industrial/services/parks-commercial.client';
import { MODAL_CLICK_OUTSIDE_LISTENER_EXCLUDED_ID } from '@/ui/layout/modal/constants/ModalClickOutsideListenerExcludedClassName';
import { RootStackingContextZIndices } from '@/ui/layout/constants/RootStackingContextZIndices';
import { usePushFocusItemToFocusStack } from '@/ui/utilities/focus/hooks/usePushFocusItemToFocusStack';
import { useRemoveFocusItemFromFocusStackById } from '@/ui/utilities/focus/hooks/useRemoveFocusItemFromFocusStackById';
import { FocusComponentType } from '@/ui/utilities/focus/types/FocusComponentType';
import { useHotkeysOnFocusedElement } from '@/ui/utilities/hotkey/hooks/useHotkeysOnFocusedElement';

const NEW_BROKER_MODAL_FOCUS_ID = 'parks-new-broker-modal';

const NEW_EMPRESA_OPTION_VALUE = '__new__';

const DEFAULT_FORM: ParksBrokerInput = {
  contacto: '',
  empresaBrokerId: '',
  email: '',
  telefono: '',
  activo: true,
};

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
  border: 1px solid ${themeCssVariables.border.color.medium};
  border-radius: ${themeCssVariables.border.radius.xl};
  box-shadow: ${themeCssVariables.boxShadow.strong};
  display: flex;
  flex-direction: column;
  max-width: 560px;
  overflow: hidden;
  width: 100%;
`;

const StyledHeader = styled.div`
  align-items: center;
  background: linear-gradient(
    135deg,
    ${themeCssVariables.color.blue1} 0%,
    ${themeCssVariables.background.primary} 70%
  );
  border-bottom: 1px solid ${themeCssVariables.border.color.light};
  display: flex;
  gap: ${themeCssVariables.spacing[3]};
  justify-content: space-between;
  padding: ${themeCssVariables.spacing[4]};
`;

const StyledHeaderText = styled.div`
  display: flex;
  flex-direction: column;
  gap: ${themeCssVariables.spacing[1]};
`;

const StyledTitle = styled.h2`
  font-size: ${themeCssVariables.font.size.lg};
  font-weight: ${themeCssVariables.font.weight.semiBold};
  margin: 0;
`;

const StyledSubtitle = styled.p`
  color: ${themeCssVariables.font.color.secondary};
  font-size: ${themeCssVariables.font.size.sm};
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

const StyledFieldGrid = styled.div`
  display: grid;
  gap: ${themeCssVariables.spacing[3]};
  grid-template-columns: 1fr 1fr;

  @media (max-width: ${MOBILE_VIEWPORT}px) {
    grid-template-columns: 1fr;
  }
`;

const StyledFieldFull = styled.div`
  grid-column: 1 / -1;
`;

const StyledField = styled.div`
  display: flex;
  flex-direction: column;
  gap: ${themeCssVariables.spacing[1]};
`;

const StyledFieldLabel = styled.label`
  color: ${themeCssVariables.font.color.secondary};
  font-size: ${themeCssVariables.font.size.xs};
  font-weight: ${themeCssVariables.font.weight.medium};
`;

const StyledRequired = styled.span`
  color: ${themeCssVariables.color.red};
  margin-left: 2px;
`;

const StyledFieldError = styled.span`
  color: ${themeCssVariables.color.red};
  font-size: ${themeCssVariables.font.size.xs};
`;

const StyledInput = styled(StyledParksInput)`
  padding: ${themeCssVariables.spacing[2]};
  width: 100%;
`;

const StyledSelect = styled(StyledParksSelect)`
  width: 100%;
`;

const StyledBannerError = styled.div`
  background: ${themeCssVariables.background.transparent.danger};
  border: 1px solid ${themeCssVariables.color.red3};
  border-radius: ${themeCssVariables.border.radius.sm};
  color: ${themeCssVariables.color.red};
  font-size: ${themeCssVariables.font.size.sm};
  padding: ${themeCssVariables.spacing[2]} ${themeCssVariables.spacing[3]};
`;

const StyledFooter = styled.div`
  align-items: center;
  border-top: 1px solid ${themeCssVariables.border.color.light};
  display: flex;
  gap: ${themeCssVariables.spacing[2]};
  justify-content: flex-end;
  padding: ${themeCssVariables.spacing[3]} ${themeCssVariables.spacing[4]};
`;

type ParksNewBrokerModalProps = {
  onClose: () => void;
  onCreated: (broker: ParksBroker) => void;
};

export const ParksNewBrokerModal = ({
  onClose,
  onCreated,
}: ParksNewBrokerModalProps) => {
  const [form, setForm] = useState<ParksBrokerInput>(DEFAULT_FORM);
  const [empresas, setEmpresas] = useState<ParksEmpresaBroker[]>([]);
  const [isNewEmpresaModalOpen, setIsNewEmpresaModalOpen] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [showValidation, setShowValidation] = useState(false);
  const { pushFocusItemToFocusStack } = usePushFocusItemToFocusStack();
  const { removeFocusItemFromFocusStackById } =
    useRemoveFocusItemFromFocusStackById();

  useEffect(() => {
    let cancelled = false;

    fetchParksEmpresasBroker()
      .then((result) => {
        if (!cancelled) {
          setEmpresas(result);
        }
      })
      .catch(() => {
        // Non-blocking: the empresa select just stays empty and the user
        // can still register a brand new empresa inline.
      });

    return () => {
      cancelled = true;
    };
  }, []);

  const contactoError =
    showValidation && !form.contacto.trim()
      ? t`Indica el nombre del broker`
      : undefined;
  const empresaError =
    showValidation && !form.empresaBrokerId?.trim()
      ? t`Selecciona la empresa de brokers`
      : undefined;

  useEffect(() => {
    pushFocusItemToFocusStack({
      focusId: NEW_BROKER_MODAL_FOCUS_ID,
      component: {
        type: FocusComponentType.MODAL,
        instanceId: NEW_BROKER_MODAL_FOCUS_ID,
      },
      globalHotkeysConfig: {
        enableGlobalHotkeysWithModifiers: false,
        enableGlobalHotkeysConflictingWithKeyboard: false,
      },
    });

    return () => {
      removeFocusItemFromFocusStackById({
        focusId: NEW_BROKER_MODAL_FOCUS_ID,
      });
    };
  }, [pushFocusItemToFocusStack, removeFocusItemFromFocusStackById]);

  useHotkeysOnFocusedElement({
    keys: [Key.Escape],
    focusId: NEW_BROKER_MODAL_FOCUS_ID,
    callback: () => {
      if (!isSubmitting) {
        onClose();
      }
    },
    dependencies: [isSubmitting, onClose],
  });

  const handleSubmit = async () => {
    setShowValidation(true);

    if (!form.contacto.trim() || !form.empresaBrokerId?.trim()) {
      return;
    }

    setIsSubmitting(true);
    setErrorMessage(null);

    try {
      const broker = await createParksBroker(form);
      onCreated(broker);
      onClose();
    } catch (error) {
      setErrorMessage(
        error instanceof Error ? error.message : t`No se pudo crear el broker`,
      );
    } finally {
      setIsSubmitting(false);
    }
  };

  return createPortal(
    <>
      <StyledOverlay
        onClick={() => {
          if (!isSubmitting) {
            onClose();
          }
        }}
      >
        <StyledModal
          id={MODAL_CLICK_OUTSIDE_LISTENER_EXCLUDED_ID}
          role="dialog"
          aria-modal="true"
          aria-labelledby="parks-new-broker-title"
          onClick={(event) => {
            event.stopPropagation();
          }}
        >
          <StyledHeader>
            <StyledHeaderText>
              <StyledTitle id="parks-new-broker-title">
                {t`Nuevo broker`}
              </StyledTitle>
              <StyledSubtitle>
                {t`Regístralo dentro de su empresa para poder vincularlo a leads y calcular su comisión.`}
              </StyledSubtitle>
            </StyledHeaderText>
            <StyledCloseButton
              type="button"
              aria-label={t`Cerrar`}
              disabled={isSubmitting}
              onClick={onClose}
            >
              <IconX size={16} />
            </StyledCloseButton>
          </StyledHeader>

          <StyledBody>
            <StyledFieldGrid>
              <StyledFieldFull>
                <StyledField>
                  <StyledFieldLabel htmlFor="broker-empresa">
                    {t`Empresa de brokers`}
                    <StyledRequired>*</StyledRequired>
                  </StyledFieldLabel>
                  <StyledSelect
                    id="broker-empresa"
                    value={form.empresaBrokerId || ''}
                    onChange={(event) => {
                      if (event.target.value === NEW_EMPRESA_OPTION_VALUE) {
                        setIsNewEmpresaModalOpen(true);
                        return;
                      }

                      setForm((current) => ({
                        ...current,
                        empresaBrokerId: event.target.value,
                      }));
                    }}
                  >
                    <option value="" disabled>
                      {t`Selecciona una empresa…`}
                    </option>
                    {empresas.map((empresa) => (
                      <option key={empresa.id} value={empresa.id}>
                        {empresa.nombre}
                        {empresa.clasificacion === 'TOP_10' ? ' · Top 10' : ''}
                      </option>
                    ))}
                    <option value={NEW_EMPRESA_OPTION_VALUE}>
                      {t`+ Registrar nueva empresa…`}
                    </option>
                  </StyledSelect>
                  {empresaError ? (
                    <StyledFieldError>{empresaError}</StyledFieldError>
                  ) : null}
                </StyledField>
              </StyledFieldFull>
              <StyledFieldFull>
                <StyledField>
                  <StyledFieldLabel htmlFor="broker-contacto">
                    {t`Nombre del broker`}
                    <StyledRequired>*</StyledRequired>
                  </StyledFieldLabel>
                  <StyledInput
                    id="broker-contacto"
                    autoFocus
                    placeholder={t`Ej. Ana García`}
                    value={form.contacto}
                    onChange={(event) =>
                      setForm((current) => ({
                        ...current,
                        contacto: event.target.value,
                      }))
                    }
                  />
                  {contactoError ? (
                    <StyledFieldError>{contactoError}</StyledFieldError>
                  ) : null}
                </StyledField>
              </StyledFieldFull>
              <StyledField>
                <StyledFieldLabel htmlFor="broker-email">
                  {t`Email`}
                </StyledFieldLabel>
                <StyledInput
                  id="broker-email"
                  type="email"
                  placeholder={t`contacto@broker.com`}
                  value={form.email ?? ''}
                  onChange={(event) =>
                    setForm((current) => ({
                      ...current,
                      email: event.target.value,
                    }))
                  }
                />
              </StyledField>
              <StyledField>
                <StyledFieldLabel htmlFor="broker-telefono">
                  {t`Teléfono`}
                </StyledFieldLabel>
                <StyledInput
                  id="broker-telefono"
                  type="tel"
                  placeholder={t`+52 33 0000 0000`}
                  value={form.telefono ?? ''}
                  onChange={(event) =>
                    setForm((current) => ({
                      ...current,
                      telefono: event.target.value,
                    }))
                  }
                />
              </StyledField>
            </StyledFieldGrid>

            {errorMessage ? (
              <StyledBannerError>{errorMessage}</StyledBannerError>
            ) : null}
          </StyledBody>

          <StyledFooter>
            <Button
              title={t`Cancelar`}
              onClick={onClose}
              variant="secondary"
              disabled={isSubmitting}
            />
            <Button
              title={isSubmitting ? t`Creando…` : t`Crear broker`}
              onClick={() => {
                void handleSubmit();
              }}
              variant="primary"
              Icon={IconUsers}
              disabled={isSubmitting}
            />
          </StyledFooter>
        </StyledModal>
      </StyledOverlay>

      {isNewEmpresaModalOpen ? (
        <ParksNewEmpresaBrokerModal
          onClose={() => setIsNewEmpresaModalOpen(false)}
          onCreated={(empresaBroker) => {
            setEmpresas((current) => [empresaBroker, ...current]);
            setForm((current) => ({
              ...current,
              empresaBrokerId: empresaBroker.id,
            }));
          }}
        />
      ) : null}
    </>,
    document.body,
  );
};
