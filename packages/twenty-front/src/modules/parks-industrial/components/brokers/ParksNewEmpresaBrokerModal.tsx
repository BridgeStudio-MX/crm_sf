import { styled } from '@linaria/react';
import { t } from '@lingui/core/macro';
import { useEffect, useState } from 'react';
import { createPortal } from 'react-dom';
import { Key } from 'ts-key-enum';
import { IconBriefcase, IconX } from 'twenty-ui/icon';
import { Button } from 'twenty-ui/input';
import { MOBILE_VIEWPORT, themeCssVariables } from 'twenty-ui/theme-constants';

import {
  StyledParksInput,
  StyledParksSelect,
  StyledParksTextarea,
} from '@/parks-industrial/components/ui/parks-form-control.styles';
import {
  createParksEmpresaBroker,
  updateParksEmpresaBroker,
  type ParksEmpresaBroker,
  type ParksEmpresaBrokerInput,
} from '@/parks-industrial/services/parks-commercial.client';
import { MODAL_CLICK_OUTSIDE_LISTENER_EXCLUDED_ID } from '@/ui/layout/modal/constants/ModalClickOutsideListenerExcludedClassName';
import { RootStackingContextZIndices } from '@/ui/layout/constants/RootStackingContextZIndices';
import { usePushFocusItemToFocusStack } from '@/ui/utilities/focus/hooks/usePushFocusItemToFocusStack';
import { useRemoveFocusItemFromFocusStackById } from '@/ui/utilities/focus/hooks/useRemoveFocusItemFromFocusStackById';
import { FocusComponentType } from '@/ui/utilities/focus/types/FocusComponentType';
import { useHotkeysOnFocusedElement } from '@/ui/utilities/hotkey/hooks/useHotkeysOnFocusedElement';

const NEW_EMPRESA_BROKER_MODAL_FOCUS_ID = 'parks-new-empresa-broker-modal';

const CLASIFICACION_OPTIONS = ['Top 10', 'No top 10'] as const;

const DEFAULT_FORM: ParksEmpresaBrokerInput = {
  nombre: '',
  contactoPrincipal: '',
  email: '',
  telefono: '',
  comisionPct: undefined,
  comisionPctNuevo: undefined,
  comisionPctPreventa: undefined,
  comisionPctRenovacion: undefined,
  clasificacion: 'No top 10',
  sectores: '',
  zonasOperacion: '',
  documentacionUrl: '',
  notas: '',
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
  max-height: 90vh;
  max-width: 620px;
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
  flex-shrink: 0;
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
  overflow-y: auto;
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

const StyledFieldHint = styled.span`
  color: ${themeCssVariables.font.color.tertiary};
  font-size: ${themeCssVariables.font.size.xs};
`;

const StyledInput = styled(StyledParksInput)`
  padding: ${themeCssVariables.spacing[2]};
  width: 100%;
`;

const StyledSelect = styled(StyledParksSelect)`
  width: 100%;
`;

const StyledTextArea = styled(StyledParksTextarea)`
  min-height: 64px;
  padding: ${themeCssVariables.spacing[2]};
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
  flex-shrink: 0;
  gap: ${themeCssVariables.spacing[2]};
  justify-content: flex-end;
  padding: ${themeCssVariables.spacing[3]} ${themeCssVariables.spacing[4]};
`;

type ParksNewEmpresaBrokerModalProps = {
  onClose: () => void;
  onCreated: (empresaBroker: ParksEmpresaBroker) => void;
  initialEmpresa?: ParksEmpresaBroker;
};

export const ParksNewEmpresaBrokerModal = ({
  onClose,
  onCreated,
  initialEmpresa,
}: ParksNewEmpresaBrokerModalProps) => {
  const isEditMode = Boolean(initialEmpresa?.id);
  const [form, setForm] = useState<ParksEmpresaBrokerInput>(() =>
    initialEmpresa
      ? {
          nombre: initialEmpresa.nombre ?? '',
          contactoPrincipal: initialEmpresa.contactoPrincipal ?? '',
          email: initialEmpresa.email ?? '',
          telefono: initialEmpresa.telefono ?? '',
          comisionPct: initialEmpresa.comisionPct,
          comisionPctNuevo: initialEmpresa.comisionPctNuevo,
          comisionPctPreventa: initialEmpresa.comisionPctPreventa,
          comisionPctRenovacion: initialEmpresa.comisionPctRenovacion,
          clasificacion:
            initialEmpresa.clasificacion === 'TOP_10' ||
            initialEmpresa.clasificacion === 'Top 10'
              ? 'Top 10'
              : 'No top 10',
          sectores: initialEmpresa.sectores ?? '',
          zonasOperacion: initialEmpresa.zonasOperacion ?? '',
          documentacionUrl: initialEmpresa.documentacionUrl ?? '',
          notas: initialEmpresa.notas ?? '',
          activo: initialEmpresa.activo !== false,
        }
      : DEFAULT_FORM,
  );
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [showValidation, setShowValidation] = useState(false);
  const { pushFocusItemToFocusStack } = usePushFocusItemToFocusStack();
  const { removeFocusItemFromFocusStackById } =
    useRemoveFocusItemFromFocusStackById();

  const nombreError =
    showValidation && !form.nombre.trim()
      ? t`Indica el nombre de la empresa`
      : undefined;

  useEffect(() => {
    pushFocusItemToFocusStack({
      focusId: NEW_EMPRESA_BROKER_MODAL_FOCUS_ID,
      component: {
        type: FocusComponentType.MODAL,
        instanceId: NEW_EMPRESA_BROKER_MODAL_FOCUS_ID,
      },
      globalHotkeysConfig: {
        enableGlobalHotkeysWithModifiers: false,
        enableGlobalHotkeysConflictingWithKeyboard: false,
      },
    });

    return () => {
      removeFocusItemFromFocusStackById({
        focusId: NEW_EMPRESA_BROKER_MODAL_FOCUS_ID,
      });
    };
  }, [pushFocusItemToFocusStack, removeFocusItemFromFocusStackById]);

  useHotkeysOnFocusedElement({
    keys: [Key.Escape],
    focusId: NEW_EMPRESA_BROKER_MODAL_FOCUS_ID,
    callback: () => {
      if (!isSubmitting) {
        onClose();
      }
    },
    dependencies: [isSubmitting, onClose],
  });

  const handleSubmit = async () => {
    setShowValidation(true);

    if (!form.nombre.trim()) {
      return;
    }

    setIsSubmitting(true);
    setErrorMessage(null);

    try {
      const empresaBroker = isEditMode && initialEmpresa
        ? await updateParksEmpresaBroker(initialEmpresa.id, form)
        : await createParksEmpresaBroker(form);
      onCreated(empresaBroker);
      onClose();
    } catch (error) {
      setErrorMessage(
        error instanceof Error
          ? error.message
          : isEditMode
            ? t`No se pudo actualizar la empresa de brokers`
            : t`No se pudo crear la empresa de brokers`,
      );
    } finally {
      setIsSubmitting(false);
    }
  };

  return createPortal(
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
        aria-labelledby="parks-new-empresa-broker-title"
        onClick={(event) => {
          event.stopPropagation();
        }}
      >
        <StyledHeader>
          <StyledHeaderText>
            <StyledTitle id="parks-new-empresa-broker-title">
              {isEditMode
                ? t`Editar empresa de brokers`
                : t`Nueva empresa de brokers`}
            </StyledTitle>
            <StyledSubtitle>
              {isEditMode
                ? t`Actualiza tier Top 10, overrides de comisión y datos de contacto.`
                : t`Regístrala para poder dar de alta a sus brokers y llevar el control de su comisión pactada.`}
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
                <StyledFieldLabel htmlFor="empresa-broker-nombre">
                  {t`Nombre de la empresa`}
                  <StyledRequired>*</StyledRequired>
                </StyledFieldLabel>
                <StyledInput
                  id="empresa-broker-nombre"
                  autoFocus
                  placeholder={t`Ej. Newmark México`}
                  value={form.nombre}
                  onChange={(event) =>
                    setForm((current) => ({
                      ...current,
                      nombre: event.target.value,
                    }))
                  }
                />
                {nombreError ? (
                  <StyledFieldError>{nombreError}</StyledFieldError>
                ) : null}
              </StyledField>
            </StyledFieldFull>
            <StyledField>
              <StyledFieldLabel htmlFor="empresa-broker-contacto">
                {t`Contacto principal / Gerente`}
              </StyledFieldLabel>
              <StyledInput
                id="empresa-broker-contacto"
                placeholder={t`Ej. Ana García`}
                value={form.contactoPrincipal ?? ''}
                onChange={(event) =>
                  setForm((current) => ({
                    ...current,
                    contactoPrincipal: event.target.value,
                  }))
                }
              />
            </StyledField>
            <StyledField>
              <StyledFieldLabel htmlFor="empresa-broker-email">
                {t`Email`}
              </StyledFieldLabel>
              <StyledInput
                id="empresa-broker-email"
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
              <StyledFieldLabel htmlFor="empresa-broker-telefono">
                {t`Teléfono`}
              </StyledFieldLabel>
              <StyledInput
                id="empresa-broker-telefono"
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
            <StyledField>
              <StyledFieldLabel htmlFor="empresa-broker-clasificacion">
                {t`Tier actual`}
              </StyledFieldLabel>
              <StyledSelect
                id="empresa-broker-clasificacion"
                value={form.clasificacion}
                onChange={(event) =>
                  setForm((current) => ({
                    ...current,
                    clasificacion: event.target.value,
                  }))
                }
              >
                {CLASIFICACION_OPTIONS.map((option) => (
                  <option key={option} value={option}>
                    {option}
                  </option>
                ))}
              </StyledSelect>
            </StyledField>
            <StyledField>
              <StyledFieldLabel htmlFor="empresa-broker-comision-nuevo">
                {t`Override % — nuevo / construida`}
              </StyledFieldLabel>
              <StyledInput
                id="empresa-broker-comision-nuevo"
                type="number"
                min={0}
                max={100}
                step={0.25}
                placeholder={t`Vacío = matriz`}
                value={form.comisionPctNuevo ?? ''}
                onChange={(event) =>
                  setForm((current) => ({
                    ...current,
                    comisionPctNuevo: event.target.value
                      ? Number(event.target.value)
                      : undefined,
                  }))
                }
              />
            </StyledField>
            <StyledField>
              <StyledFieldLabel htmlFor="empresa-broker-comision-preventa">
                {t`Override % — preventa`}
              </StyledFieldLabel>
              <StyledInput
                id="empresa-broker-comision-preventa"
                type="number"
                min={0}
                max={100}
                step={0.25}
                placeholder={t`Vacío = matriz`}
                value={form.comisionPctPreventa ?? ''}
                onChange={(event) =>
                  setForm((current) => ({
                    ...current,
                    comisionPctPreventa: event.target.value
                      ? Number(event.target.value)
                      : undefined,
                  }))
                }
              />
            </StyledField>
            <StyledField>
              <StyledFieldLabel htmlFor="empresa-broker-comision-renovacion">
                {t`Override % — renovación`}
              </StyledFieldLabel>
              <StyledInput
                id="empresa-broker-comision-renovacion"
                type="number"
                min={0}
                max={100}
                step={0.25}
                placeholder={t`Vacío = matriz`}
                value={form.comisionPctRenovacion ?? ''}
                onChange={(event) =>
                  setForm((current) => ({
                    ...current,
                    comisionPctRenovacion: event.target.value
                      ? Number(event.target.value)
                      : undefined,
                  }))
                }
              />
            </StyledField>
            <StyledField>
              <StyledFieldLabel htmlFor="empresa-broker-comision">
                {t`Comisión legacy % (fallback)`}
              </StyledFieldLabel>
              <StyledInput
                id="empresa-broker-comision"
                type="number"
                min={0}
                max={100}
                step={0.5}
                placeholder={t`Solo si no hay override`}
                value={form.comisionPct ?? ''}
                onChange={(event) =>
                  setForm((current) => ({
                    ...current,
                    comisionPct: event.target.value
                      ? Number(event.target.value)
                      : undefined,
                  }))
                }
              />
            </StyledField>
            <StyledFieldFull>
              <StyledField>
                <StyledFieldLabel htmlFor="empresa-broker-sectores">
                  {t`Sectores / tipo de clientes que atiende`}
                </StyledFieldLabel>
                <StyledInput
                  id="empresa-broker-sectores"
                  placeholder={t`Ej. Logística, e-commerce, manufactura`}
                  value={form.sectores ?? ''}
                  onChange={(event) =>
                    setForm((current) => ({
                      ...current,
                      sectores: event.target.value,
                    }))
                  }
                />
              </StyledField>
            </StyledFieldFull>
            <StyledFieldFull>
              <StyledField>
                <StyledFieldLabel htmlFor="empresa-broker-zonas">
                  {t`Zonas de operación`}
                </StyledFieldLabel>
                <StyledInput
                  id="empresa-broker-zonas"
                  placeholder={t`Ej. Guadalajara, Bajío, CDMX`}
                  value={form.zonasOperacion ?? ''}
                  onChange={(event) =>
                    setForm((current) => ({
                      ...current,
                      zonasOperacion: event.target.value,
                    }))
                  }
                />
              </StyledField>
            </StyledFieldFull>
            <StyledFieldFull>
              <StyledField>
                <StyledFieldLabel htmlFor="empresa-broker-documentacion">
                  {t`Documentación (URL)`}
                </StyledFieldLabel>
                <StyledInput
                  id="empresa-broker-documentacion"
                  placeholder={t`https://…`}
                  value={form.documentacionUrl ?? ''}
                  onChange={(event) =>
                    setForm((current) => ({
                      ...current,
                      documentacionUrl: event.target.value,
                    }))
                  }
                />
                <StyledFieldHint>
                  {t`Convenio marco, expediente legal u otra documentación clave.`}
                </StyledFieldHint>
              </StyledField>
            </StyledFieldFull>
            <StyledFieldFull>
              <StyledField>
                <StyledFieldLabel htmlFor="empresa-broker-notas">
                  {t`Notas`}
                </StyledFieldLabel>
                <StyledTextArea
                  id="empresa-broker-notas"
                  placeholder={t`Información adicional relevante…`}
                  value={form.notas ?? ''}
                  onChange={(event) =>
                    setForm((current) => ({
                      ...current,
                      notas: event.target.value,
                    }))
                  }
                />
              </StyledField>
            </StyledFieldFull>
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
            title={
              isSubmitting
                ? isEditMode
                  ? t`Guardando…`
                  : t`Creando…`
                : isEditMode
                  ? t`Guardar cambios`
                  : t`Crear empresa`
            }
            onClick={() => {
              void handleSubmit();
            }}
            variant="primary"
            Icon={IconBriefcase}
            disabled={isSubmitting}
          />
        </StyledFooter>
      </StyledModal>
    </StyledOverlay>,
    document.body,
  );
};
