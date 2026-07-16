import { styled } from '@linaria/react';
import { t } from '@lingui/core/macro';
import { useCallback, useEffect, useMemo, useState } from 'react';
import { createPortal } from 'react-dom';
import { Key } from 'ts-key-enum';
import {
  IconBuildingSkyscraper,
  IconMap,
  IconPlus,
  IconTool,
  IconUser,
  IconWorld,
  IconX,
} from 'twenty-ui/icon';
import { Button } from 'twenty-ui/input';
import { MOBILE_VIEWPORT, themeCssVariables } from 'twenty-ui/theme-constants';

import { ParksNewBrokerModal } from '@/parks-industrial/components/brokers/ParksNewBrokerModal';
import { ParksLeadAiEnrichmentOverlay } from '@/parks-industrial/components/pipeline/ParksLeadAiEnrichmentOverlay';
import {
  StyledParksInput,
  StyledParksSelect,
} from '@/parks-industrial/components/ui/parks-form-control.styles';
import { ParksModalTabs } from '@/parks-industrial/components/ui/ParksModalTabs';
import { useParksLeasingOfficerOptions } from '@/parks-industrial/hooks/useParksLeasingOfficerOptions';
import {
  createParksLead,
  createParksOpportunityForInquilino,
  enrichParksProspect,
  fetchParksBrokers,
  type CreateParksLeadInput,
  type ParksBroker,
} from '@/parks-industrial/services/parks-commercial.client';
import { MODAL_CLICK_OUTSIDE_LISTENER_EXCLUDED_ID } from '@/ui/layout/modal/constants/ModalClickOutsideListenerExcludedClassName';
import { RootStackingContextZIndices } from '@/ui/layout/constants/RootStackingContextZIndices';
import { usePushFocusItemToFocusStack } from '@/ui/utilities/focus/hooks/usePushFocusItemToFocusStack';
import { useRemoveFocusItemFromFocusStackById } from '@/ui/utilities/focus/hooks/useRemoveFocusItemFromFocusStackById';
import { FocusComponentType } from '@/ui/utilities/focus/types/FocusComponentType';
import { useHotkeysOnFocusedElement } from '@/ui/utilities/hotkey/hooks/useHotkeysOnFocusedElement';

const PARKS_NEW_LEAD_MODAL_FOCUS_ID = 'parks-new-lead-modal';

const CANAL_OPTIONS = [
  'Página web',
  'LinkedIn',
  'Call Center',
  'CEM',
  'Broker',
  'Recomendación',
  'Evento',
  'Otro',
] as const;

import { PARKS_GIRO_INQUILINO_OPTIONS } from '@/parks-industrial/constants/parks-giro.constants';

const GIRO_OPTIONS = PARKS_GIRO_INQUILINO_OPTIONS;

const UBICACION_OPTIONS = [
  'Guadalajara',
  'Monterrey',
  'CDMX',
  'Bajío',
  'Norte',
  'Sur',
  'Otro',
] as const;

const M2_PRESETS = [2500, 5000, 10000, 20000] as const;
const PLAZO_PRESETS = [36, 60, 84, 120] as const;

const DEFAULT_FORM: CreateParksLeadInput = {
  nombreCompleto: '',
  empresa: '',
  correo: '',
  telefono: '',
  giroEmpresa: 'Logística',
  metrosCuadradosRequeridos: 5000,
  ubicacionDeseada: 'Guadalajara',
  plazoContratoMeses: 60,
  presupuestoMensualUsd: 4500,
  canalOrigen: 'Página web',
  tipoOperacion: 'Arrendamiento nuevo',
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
  max-height: min(92vh, 880px);
  max-width: 720px;
  min-height: 0;
  overflow: hidden;
  width: 100%;
`;

const StyledHeader = styled.div`
  background: linear-gradient(
    135deg,
    ${themeCssVariables.color.blue1} 0%,
    ${themeCssVariables.background.primary} 70%
  );
  border-bottom: 1px solid ${themeCssVariables.border.color.light};
  display: flex;
  flex-direction: column;
  gap: ${themeCssVariables.spacing[1]};
  padding: ${themeCssVariables.spacing[4]};
  position: relative;
`;

const StyledHeaderTop = styled.div`
  align-items: flex-start;
  display: flex;
  gap: ${themeCssVariables.spacing[3]};
  justify-content: space-between;
`;

const StyledHeaderText = styled.div`
  display: flex;
  flex: 1;
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
  line-height: 1.45;
  margin: 0;
  max-width: 520px;
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
    background: ${themeCssVariables.background.transparent.medium};
    color: ${themeCssVariables.font.color.primary};
  }
`;

const StyledBody = styled.div`
  display: flex;
  flex: 1;
  flex-direction: column;
  min-height: 0;
  overflow: hidden;
`;

const StyledSection = styled.section`
  display: flex;
  flex-direction: column;
  gap: ${themeCssVariables.spacing[3]};
`;

const StyledSectionCard = styled.div`
  background: linear-gradient(
    160deg,
    ${themeCssVariables.background.secondary} 0%,
    ${themeCssVariables.background.primary} 100%
  );
  border: 1px solid ${themeCssVariables.border.color.light};
  border-radius: ${themeCssVariables.border.radius.md};
  display: flex;
  flex-direction: column;
  gap: ${themeCssVariables.spacing[3]};
  padding: ${themeCssVariables.spacing[3]};
`;

const StyledSectionHeader = styled.div`
  align-items: center;
  display: flex;
  gap: ${themeCssVariables.spacing[2]};
`;

const StyledSectionIcon = styled.span`
  align-items: center;
  background: ${themeCssVariables.background.transparent.blue};
  border-radius: ${themeCssVariables.border.radius.sm};
  color: ${themeCssVariables.color.blue};
  display: flex;
  height: 28px;
  justify-content: center;
  width: 28px;
`;

const StyledSectionTitle = styled.h3`
  font-size: ${themeCssVariables.font.size.sm};
  font-weight: ${themeCssVariables.font.weight.semiBold};
  margin: 0;
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

const StyledFieldHint = styled.span`
  color: ${themeCssVariables.font.color.tertiary};
  font-size: ${themeCssVariables.font.size.xs};
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

const StyledTextarea = styled.textarea`
  background: ${themeCssVariables.background.primary};
  border: 1px solid ${themeCssVariables.border.color.medium};
  border-radius: ${themeCssVariables.border.radius.sm};
  color: ${themeCssVariables.font.color.primary};
  font-family: inherit;
  font-size: ${themeCssVariables.font.size.sm};
  min-height: 72px;
  padding: ${themeCssVariables.spacing[2]};
  resize: vertical;
  width: 100%;

  &::placeholder {
    color: ${themeCssVariables.font.color.tertiary};
  }
`;

const StyledChipRow = styled.div`
  display: flex;
  flex-wrap: wrap;
  gap: ${themeCssVariables.spacing[2]};
`;

const StyledChip = styled.button<{ isSelected: boolean }>`
  background: ${({ isSelected }) =>
    isSelected
      ? themeCssVariables.background.transparent.blue
      : themeCssVariables.background.secondary};
  border: 1px solid
    ${({ isSelected }) =>
      isSelected
        ? themeCssVariables.color.blue
        : themeCssVariables.border.color.medium};
  border-radius: 999px;
  color: ${({ isSelected }) =>
    isSelected
      ? themeCssVariables.color.blue
      : themeCssVariables.font.color.secondary};
  cursor: pointer;
  font-size: ${themeCssVariables.font.size.xs};
  font-weight: ${themeCssVariables.font.weight.medium};
  padding: 6px ${themeCssVariables.spacing[2]};

  &:hover {
    border-color: ${themeCssVariables.color.blue};
  }
`;

const StyledPresetChip = styled.button<{ isSelected: boolean }>`
  background: ${({ isSelected }) =>
    isSelected
      ? themeCssVariables.background.transparent.blue
      : themeCssVariables.background.secondary};
  border: 1px solid
    ${({ isSelected }) =>
      isSelected
        ? themeCssVariables.color.blue
        : themeCssVariables.border.color.medium};
  border-radius: ${themeCssVariables.border.radius.sm};
  color: ${({ isSelected }) =>
    isSelected
      ? themeCssVariables.color.blue
      : themeCssVariables.font.color.secondary};
  cursor: pointer;
  font-size: ${themeCssVariables.font.size.xs};
  font-weight: ${themeCssVariables.font.weight.medium};
  padding: 6px ${themeCssVariables.spacing[2]};

  &:hover {
    border-color: ${themeCssVariables.color.blue};
  }
`;

const StyledOperationGrid = styled.div`
  display: grid;
  gap: ${themeCssVariables.spacing[2]};
  grid-template-columns: 1fr 1fr;

  @media (max-width: ${MOBILE_VIEWPORT}px) {
    grid-template-columns: 1fr;
  }
`;

const StyledOperationCard = styled.button<{ isSelected: boolean }>`
  background: ${({ isSelected }) =>
    isSelected
      ? themeCssVariables.background.transparent.blue
      : themeCssVariables.background.secondary};
  border: 1px solid
    ${({ isSelected }) =>
      isSelected
        ? themeCssVariables.color.blue
        : themeCssVariables.border.color.medium};
  border-radius: ${themeCssVariables.border.radius.md};
  cursor: pointer;
  display: flex;
  flex-direction: column;
  gap: ${themeCssVariables.spacing[1]};
  padding: ${themeCssVariables.spacing[3]};
  text-align: left;

  &:hover {
    border-color: ${themeCssVariables.color.blue};
  }
`;

const StyledOperationTitle = styled.span`
  font-size: ${themeCssVariables.font.size.sm};
  font-weight: ${themeCssVariables.font.weight.semiBold};
`;

const StyledOperationHint = styled.span`
  color: ${themeCssVariables.font.color.tertiary};
  font-size: ${themeCssVariables.font.size.xs};
  line-height: 1.4;
`;

const StyledBtsPanel = styled.div`
  background: ${themeCssVariables.background.secondary};
  border: 1px solid ${themeCssVariables.border.color.light};
  border-radius: ${themeCssVariables.border.radius.md};
  display: flex;
  flex-direction: column;
  gap: ${themeCssVariables.spacing[3]};
  padding: ${themeCssVariables.spacing[3]};
`;

const StyledFooter = styled.div`
  align-items: center;
  background: linear-gradient(
    180deg,
    ${themeCssVariables.background.primary} 0%,
    ${themeCssVariables.background.secondary} 100%
  );
  border-top: 1px solid ${themeCssVariables.border.color.light};
  box-shadow: 0 -4px 16px ${themeCssVariables.background.transparent.medium};
  display: flex;
  flex-wrap: wrap;
  gap: ${themeCssVariables.spacing[2]};
  justify-content: space-between;
  padding: ${themeCssVariables.spacing[3]} ${themeCssVariables.spacing[4]};
`;

const StyledFooterHint = styled.span`
  color: ${themeCssVariables.font.color.tertiary};
  font-size: ${themeCssVariables.font.size.xs};
  max-width: 360px;
`;

const StyledFooterActions = styled.div`
  display: flex;
  gap: ${themeCssVariables.spacing[2]};
  margin-left: auto;
`;

const StyledFieldWithAction = styled.div`
  align-items: flex-end;
  display: flex;
  gap: ${themeCssVariables.spacing[2]};
`;

const StyledFieldWithActionInput = styled.div`
  flex: 1;
`;

const StyledInlineAddButton = styled.button`
  align-items: center;
  background: ${themeCssVariables.background.transparent.blue};
  border: 1px solid ${themeCssVariables.color.blue};
  border-radius: ${themeCssVariables.border.radius.sm};
  color: ${themeCssVariables.color.blue};
  cursor: pointer;
  display: flex;
  flex-shrink: 0;
  font-size: ${themeCssVariables.font.size.xs};
  font-weight: ${themeCssVariables.font.weight.medium};
  gap: 4px;
  height: 32px;
  padding: 0 ${themeCssVariables.spacing[2]};
  white-space: nowrap;

  &:hover {
    background: ${themeCssVariables.background.transparent.medium};
  }
`;

const StyledBannerError = styled.div`
  background: ${themeCssVariables.background.transparent.danger};
  border: 1px solid ${themeCssVariables.color.red3};
  border-radius: ${themeCssVariables.border.radius.sm};
  color: ${themeCssVariables.color.red};
  font-size: ${themeCssVariables.font.size.sm};
  padding: ${themeCssVariables.spacing[2]} ${themeCssVariables.spacing[3]};
`;

type FormErrors = Partial<
  Record<
    | 'nombreCompleto'
    | 'empresa'
    | 'canalOrigen'
    | 'metrosCuadradosRequeridos'
    | 'leasingOfficerAsignado'
    | 'recomendadoPor',
    string
  >
>;

const validateForm = (form: CreateParksLeadInput): FormErrors => {
  const errors: FormErrors = {};

  if (!form.nombreCompleto.trim()) {
    errors.nombreCompleto = t`Indica el nombre del contacto`;
  }

  if (!form.empresa.trim()) {
    errors.empresa = t`Indica la empresa`;
  }

  if (!form.canalOrigen) {
    errors.canalOrigen = t`Selecciona el canal de ingreso`;
  }

  if (!form.metrosCuadradosRequeridos || form.metrosCuadradosRequeridos <= 0) {
    errors.metrosCuadradosRequeridos = t`Los m² deben ser mayores a 0`;
  }

  // Every broker-sourced lead must carry a Leasing Officer: the LO owns the
  // internal negotiation for that deal from day one.
  if (form.brokerId && !form.leasingOfficerAsignado?.trim()) {
    errors.leasingOfficerAsignado = t`Selecciona el Leasing Officer que llevará la negociación`;
  }

  if (
    form.canalOrigen === 'Recomendación' &&
    !form.recomendadoPor?.trim()
  ) {
    errors.recomendadoPor = t`Indica quién recomendó este lead`;
  }

  return errors;
};

type LeadModalTab = 'contacto' | 'requerimientos' | 'operacion' | 'canal';

const LEAD_MODAL_TABS: LeadModalTab[] = [
  'contacto',
  'requerimientos',
  'operacion',
  'canal',
];

const getLeadTabLabel = (tab: LeadModalTab): string => {
  switch (tab) {
    case 'contacto':
      return t`Contacto`;
    case 'requerimientos':
      return t`Requerimientos`;
    case 'operacion':
      return t`Operación`;
    case 'canal':
      return t`Canal`;
  }
};

const getLeadTabDescription = (tab: LeadModalTab): string => {
  switch (tab) {
    case 'contacto':
      return t`Persona y empresa que originan la oportunidad comercial.`;
    case 'requerimientos':
      return t`Metros, ubicación y presupuesto para calificación y matching.`;
    case 'operacion':
      return t`Tipo de arrendamiento o build-to-suit con specs técnicas.`;
    case 'canal':
      return t`Origen del lead — broker, recomendación u otro canal.`;
  }
};

const getLeadTabIcon = (tab: LeadModalTab) => {
  switch (tab) {
    case 'contacto':
      return IconUser;
    case 'requerimientos':
      return IconMap;
    case 'operacion':
      return IconBuildingSkyscraper;
    case 'canal':
      return IconWorld;
  }
};

const getLeadTabErrors = (
  tab: LeadModalTab,
  form: CreateParksLeadInput,
): FormErrors => {
  const errors: FormErrors = {};

  if (tab === 'contacto') {
    if (!form.nombreCompleto.trim()) {
      errors.nombreCompleto = t`Indica el nombre del contacto`;
    }

    if (!form.empresa.trim()) {
      errors.empresa = t`Indica la empresa`;
    }
  }

  if (
    tab === 'requerimientos' &&
    (!form.metrosCuadradosRequeridos || form.metrosCuadradosRequeridos <= 0)
  ) {
    errors.metrosCuadradosRequeridos = t`Los m² deben ser mayores a 0`;
  }

  if (tab === 'canal' && !form.canalOrigen) {
    errors.canalOrigen = t`Selecciona el canal de ingreso`;
  }

  if (
    tab === 'canal' &&
    form.brokerId &&
    !form.leasingOfficerAsignado?.trim()
  ) {
    errors.leasingOfficerAsignado = t`Selecciona el Leasing Officer que llevará la negociación`;
  }

  if (
    tab === 'canal' &&
    form.canalOrigen === 'Recomendación' &&
    !form.recomendadoPor?.trim()
  ) {
    errors.recomendadoPor = t`Indica quién recomendó este lead`;
  }

  return errors;
};

const isLeadTabComplete = (
  tab: LeadModalTab,
  form: CreateParksLeadInput,
): boolean => Object.keys(getLeadTabErrors(tab, form)).length === 0;

export type ParksNewLeadPrefillInquilino = {
  inquilinoId: string;
  empresa: string;
  nombreCompleto?: string;
  correo?: string;
  telefono?: string;
  giroEmpresa?: string;
};

export type ParksNewLeadModalProps = {
  onClose: () => void;
  onCreated: (payload: {
    opportunityId: string;
    inquilinoId: string;
    folio?: string;
    lead: CreateParksLeadInput;
  }) => void;
  prefillInquilino?: ParksNewLeadPrefillInquilino;
};

export const ParksNewLeadModal = ({
  onClose,
  onCreated,
  prefillInquilino,
}: ParksNewLeadModalProps) => {
  const [form, setForm] = useState<CreateParksLeadInput>(() => ({
    ...DEFAULT_FORM,
    ...(prefillInquilino
      ? {
          empresa: prefillInquilino.empresa,
          nombreCompleto: prefillInquilino.nombreCompleto ?? '',
          correo: prefillInquilino.correo ?? '',
          telefono: prefillInquilino.telefono ?? '',
          giroEmpresa: prefillInquilino.giroEmpresa ?? DEFAULT_FORM.giroEmpresa,
          canalOrigen: 'Cliente existente',
        }
      : {}),
  }));
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [showValidation, setShowValidation] = useState(false);
  const [activeTab, setActiveTab] = useState<LeadModalTab>('contacto');
  const [brokers, setBrokers] = useState<ParksBroker[]>([]);
  const [isNewBrokerModalOpen, setIsNewBrokerModalOpen] = useState(false);
  const [aiEnrichment, setAiEnrichment] = useState<{
    companyName: string;
    fitScore: number | null;
    createdPayload: {
      opportunityId: string;
      inquilinoId: string;
      folio?: string;
      lead: CreateParksLeadInput;
    };
  } | null>(null);
  const leasingOfficerOptions = useParksLeasingOfficerOptions();
  const isBusy = isSubmitting || aiEnrichment !== null;

  useEffect(() => {
    let cancelled = false;

    fetchParksBrokers()
      .then((result) => {
        if (!cancelled) {
          setBrokers(result);
        }
      })
      .catch(() => {
        // Broker list is optional context for the "Broker" channel — silently
        // skip if the service is unreachable rather than blocking lead creation.
      });

    return () => {
      cancelled = true;
    };
  }, []);
  const { pushFocusItemToFocusStack } = usePushFocusItemToFocusStack();
  const { removeFocusItemFromFocusStackById } =
    useRemoveFocusItemFromFocusStackById();

  const formErrors = useMemo(() => validateForm(form), [form]);
  const isFormValid = Object.keys(formErrors).length === 0;
  const leadTabs = useMemo(
    () =>
      LEAD_MODAL_TABS.map((tab, index) => ({
        id: tab,
        label: getLeadTabLabel(tab),
        description: getLeadTabDescription(tab),
        icon: getLeadTabIcon(tab),
        stepIndex: index + 1,
        isComplete: isLeadTabComplete(tab, form),
      })),
    [form],
  );
  const activeTabIndex = LEAD_MODAL_TABS.indexOf(activeTab);
  const isFirstTab = activeTabIndex === 0;
  const isLastTab = activeTabIndex === LEAD_MODAL_TABS.length - 1;

  const updateForm = useCallback((patch: Partial<CreateParksLeadInput>) => {
    setForm((previous) => ({ ...previous, ...patch }));
  }, []);

  const handleClose = useCallback(() => {
    onClose();
  }, [onClose]);

  const handleAiEnrichmentComplete = useCallback(() => {
    if (!aiEnrichment) {
      return;
    }

    onCreated(aiEnrichment.createdPayload);
    onClose();
  }, [aiEnrichment, onClose, onCreated]);

  useEffect(() => {
    pushFocusItemToFocusStack({
      focusId: PARKS_NEW_LEAD_MODAL_FOCUS_ID,
      component: {
        type: FocusComponentType.MODAL,
        instanceId: PARKS_NEW_LEAD_MODAL_FOCUS_ID,
      },
      globalHotkeysConfig: {
        enableGlobalHotkeysWithModifiers: false,
        enableGlobalHotkeysConflictingWithKeyboard: false,
      },
    });

    return () => {
      removeFocusItemFromFocusStackById({
        focusId: PARKS_NEW_LEAD_MODAL_FOCUS_ID,
      });
    };
  }, [pushFocusItemToFocusStack, removeFocusItemFromFocusStackById]);

  useHotkeysOnFocusedElement({
    keys: [Key.Escape],
    focusId: PARKS_NEW_LEAD_MODAL_FOCUS_ID,
    callback: () => {
      if (!isBusy) {
        handleClose();
      }
    },
    dependencies: [handleClose, isBusy],
  });

  const handleSubmit = async () => {
    setShowValidation(true);
    setErrorMessage(null);

    if (!isFormValid) {
      const firstInvalidTab = LEAD_MODAL_TABS.find(
        (tab) => !isLeadTabComplete(tab, form),
      );

      if (firstInvalidTab) {
        setActiveTab(firstInvalidTab);
      }

      return;
    }

    setIsSubmitting(true);

    try {
      const result = prefillInquilino
        ? await createParksOpportunityForInquilino(
            prefillInquilino.inquilinoId,
            {
              correo: form.correo,
              telefono: form.telefono,
              giroEmpresa: form.giroEmpresa,
              metrosCuadradosRequeridos: form.metrosCuadradosRequeridos,
              ubicacionDeseada: form.ubicacionDeseada,
              plazoContratoMeses: form.plazoContratoMeses,
              presupuestoMensualUsd: form.presupuestoMensualUsd,
              canalOrigen: form.canalOrigen,
              brokerId: form.brokerId,
              leasingOfficerAsignado: form.leasingOfficerAsignado,
              recomendadoPor: form.recomendadoPor,
              tipoOperacion: form.tipoOperacion,
              alturaRequerida: form.alturaRequerida,
              andenesRequeridos: form.andenesRequeridos,
              potenciaRequerida: form.potenciaRequerida,
              cargaPisoRequerida: form.cargaPisoRequerida,
              especificacionesTecnicas: form.especificacionesTecnicas,
              nombreCompleto: form.nombreCompleto,
            },
          )
        : await createParksLead(form);

      const createdPayload = { ...result, lead: form };

      setAiEnrichment({
        companyName: form.empresa.trim() || t`Prospecto`,
        fitScore: null,
        createdPayload,
      });

      // Fire enrichment while the UI plays the 5–7s research animation.
      void enrichParksProspect({
        opportunityId: result.opportunityId,
        companyName: form.empresa,
        industryHint: form.giroEmpresa,
        m2Requeridos: form.metrosCuadradosRequeridos,
      })
        .then((enrichment) => {
          setAiEnrichment((current) =>
            current
              ? { ...current, fitScore: enrichment.fitScore }
              : current,
          );
        })
        .catch(() => {
          // Animation still completes; score chip is optional if enrich fails.
        });
    } catch (error) {
      const rawMessage =
        error instanceof Error ? error.message : t`No se pudo crear el lead`;
      setErrorMessage(
        rawMessage.length > 280 ? `${rawMessage.slice(0, 280)}…` : rawMessage,
      );
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleNextTab = () => {
    setShowValidation(true);
    const tabErrors = getLeadTabErrors(activeTab, form);

    if (Object.keys(tabErrors).length > 0) {
      return;
    }

    if (!isLastTab) {
      setActiveTab(LEAD_MODAL_TABS[activeTabIndex + 1]);
    }
  };

  const handlePreviousTab = () => {
    if (!isFirstTab) {
      setActiveTab(LEAD_MODAL_TABS[activeTabIndex - 1]);
    }
  };

  const footerHint = isFormValid
    ? t`El lead entrará a la cola CEM en Lead recibido`
    : t`Completa contacto, requerimientos y canal para continuar`;

  return createPortal(
    <>
      <StyledOverlay
        onClick={() => {
          if (!isBusy) {
            handleClose();
          }
        }}
      >
        {aiEnrichment ? (
          <div
            onClick={(event) => {
              event.stopPropagation();
            }}
          >
            <ParksLeadAiEnrichmentOverlay
              companyName={aiEnrichment.companyName}
              fitScore={aiEnrichment.fitScore}
              onComplete={handleAiEnrichmentComplete}
            />
          </div>
        ) : (
          <StyledModal
            id={MODAL_CLICK_OUTSIDE_LISTENER_EXCLUDED_ID}
            role="dialog"
            aria-modal="true"
            aria-labelledby="parks-new-lead-title"
            onClick={(event) => {
              event.stopPropagation();
            }}
          >
          <StyledHeader>
            <StyledHeaderTop>
              <StyledHeaderText>
                <StyledTitle id="parks-new-lead-title">
                  {prefillInquilino
                    ? t`Nueva oportunidad para cliente existente`
                    : t`Nuevo prospecto comercial`}
                </StyledTitle>
                <StyledSubtitle>
                  {prefillInquilino
                    ? t`Crea una oportunidad adicional vinculada a la misma cuenta sin perder el historial.`
                    : t`Captura el lead con los datos mínimos para calificación. Entrará a la cola del CEM para asignación al LO.`}
                </StyledSubtitle>
              </StyledHeaderText>
              <StyledCloseButton
                type="button"
                aria-label={t`Cerrar`}
                disabled={isBusy}
                onClick={handleClose}
              >
                <IconX size={16} />
              </StyledCloseButton>
            </StyledHeaderTop>
          </StyledHeader>

          <StyledBody>
            <ParksModalTabs
              tabs={leadTabs}
              activeTab={activeTab}
              onTabChange={setActiveTab}
              ariaLabel={t`Pasos del nuevo prospecto`}
            >
              {activeTab === 'contacto' ? (
                <StyledSection>
                  <StyledSectionCard>
                    <StyledFieldGrid>
                      <StyledField>
                        <StyledFieldLabel htmlFor="lead-nombre">
                          {t`Nombre completo`}
                          <StyledRequired>*</StyledRequired>
                        </StyledFieldLabel>
                        <StyledInput
                          id="lead-nombre"
                          autoFocus
                          placeholder={t`Ej. María López`}
                          value={form.nombreCompleto}
                          onChange={(event) =>
                            updateForm({ nombreCompleto: event.target.value })
                          }
                        />
                        {showValidation && formErrors.nombreCompleto && (
                          <StyledFieldError>
                            {formErrors.nombreCompleto}
                          </StyledFieldError>
                        )}
                      </StyledField>
                      <StyledField>
                        <StyledFieldLabel htmlFor="lead-empresa">
                          {t`Empresa`}
                          <StyledRequired>*</StyledRequired>
                        </StyledFieldLabel>
                        <StyledInput
                          id="lead-empresa"
                          placeholder={t`Ej. LogiMex S.A.`}
                          value={form.empresa}
                          disabled={!!prefillInquilino}
                          onChange={(event) =>
                            updateForm({ empresa: event.target.value })
                          }
                        />
                        {showValidation && formErrors.empresa && (
                          <StyledFieldError>
                            {formErrors.empresa}
                          </StyledFieldError>
                        )}
                      </StyledField>
                      <StyledField>
                        <StyledFieldLabel htmlFor="lead-correo">
                          {t`Correo`}
                        </StyledFieldLabel>
                        <StyledInput
                          id="lead-correo"
                          type="email"
                          placeholder={t`contacto@empresa.com`}
                          value={form.correo ?? ''}
                          onChange={(event) =>
                            updateForm({ correo: event.target.value })
                          }
                        />
                      </StyledField>
                      <StyledField>
                        <StyledFieldLabel htmlFor="lead-telefono">
                          {t`Teléfono`}
                        </StyledFieldLabel>
                        <StyledInput
                          id="lead-telefono"
                          type="tel"
                          placeholder={t`+52 81 0000 0000`}
                          value={form.telefono ?? ''}
                          onChange={(event) =>
                            updateForm({ telefono: event.target.value })
                          }
                        />
                      </StyledField>
                    </StyledFieldGrid>
                  </StyledSectionCard>
                </StyledSection>
              ) : null}

              {activeTab === 'canal' ? (
                <StyledSection>
                  <StyledSectionCard>
                    <StyledChipRow
                      role="group"
                      aria-label={t`Canal de ingreso`}
                    >
                      {CANAL_OPTIONS.map((canal) => (
                        <StyledChip
                          key={canal}
                          type="button"
                          isSelected={form.canalOrigen === canal}
                          onClick={() =>
                            updateForm({
                              canalOrigen: canal,
                              ...(canal !== 'Broker'
                                ? {
                                    brokerId: undefined,
                                    leasingOfficerAsignado: undefined,
                                  }
                                : {}),
                              ...(canal !== 'Recomendación'
                                ? { recomendadoPor: undefined }
                                : {}),
                            })
                          }
                        >
                          {canal}
                        </StyledChip>
                      ))}
                    </StyledChipRow>
                    {showValidation && formErrors.canalOrigen && (
                      <StyledFieldError>
                        {formErrors.canalOrigen}
                      </StyledFieldError>
                    )}
                    {form.canalOrigen === 'Recomendación' ? (
                      <StyledField>
                        <StyledFieldLabel htmlFor="lead-recomendado-por">
                          {t`¿Quién recomendó?`}
                          <StyledRequired>*</StyledRequired>
                        </StyledFieldLabel>
                        <StyledInput
                          id="lead-recomendado-por"
                          value={form.recomendadoPor ?? ''}
                          placeholder={t`Ej. Juan Pérez — cliente actual / broker / contacto`}
                          onChange={(event) =>
                            updateForm({
                              recomendadoPor: event.target.value,
                            })
                          }
                        />
                        <StyledFieldHint>
                          {t`Nombre de la persona o empresa que refirió este prospecto.`}
                        </StyledFieldHint>
                        {showValidation && formErrors.recomendadoPor && (
                          <StyledFieldError>
                            {formErrors.recomendadoPor}
                          </StyledFieldError>
                        )}
                      </StyledField>
                    ) : null}
                    {form.canalOrigen === 'Broker' ? (
                      <>
                        <StyledField>
                          <StyledFieldLabel htmlFor="lead-broker">
                            {t`Broker`}
                          </StyledFieldLabel>
                          <StyledFieldWithAction>
                            <StyledFieldWithActionInput>
                              <StyledSelect
                                id="lead-broker"
                                value={form.brokerId ?? ''}
                                onChange={(event) =>
                                  updateForm({
                                    brokerId: event.target.value || undefined,
                                  })
                                }
                              >
                                <option value="">{t`Selecciona un broker...`}</option>
                                {brokers.map((broker) => (
                                  <option key={broker.id} value={broker.id}>
                                    {broker.contacto ?? broker.empresa}
                                    {' · '}
                                    {broker.empresaBroker?.nombre ??
                                      broker.empresa}
                                    {broker.clasificacion === 'TOP_10'
                                      ? ' · Top 10'
                                      : ''}
                                  </option>
                                ))}
                              </StyledSelect>
                            </StyledFieldWithActionInput>
                            <StyledInlineAddButton
                              type="button"
                              onClick={() => setIsNewBrokerModalOpen(true)}
                            >
                              <IconPlus size={14} />
                              {t`Nuevo broker`}
                            </StyledInlineAddButton>
                          </StyledFieldWithAction>
                          <StyledFieldHint>
                            {t`Necesario para calcular la comisión del broker en la Hoja de Acuerdos`}
                          </StyledFieldHint>
                        </StyledField>

                        {form.brokerId ? (
                          <StyledField>
                            <StyledFieldLabel htmlFor="lead-leasing-officer">
                              {t`Leasing Officer asignado`}
                              <StyledRequired>*</StyledRequired>
                            </StyledFieldLabel>
                            <StyledSelect
                              id="lead-leasing-officer"
                              value={form.leasingOfficerAsignado ?? ''}
                              onChange={(event) =>
                                updateForm({
                                  leasingOfficerAsignado:
                                    event.target.value || undefined,
                                })
                              }
                            >
                              <option value="">{t`Selecciona un LO...`}</option>
                              {leasingOfficerOptions.map((leasingOfficer) => (
                                <option
                                  key={leasingOfficer}
                                  value={leasingOfficer}
                                >
                                  {leasingOfficer}
                                </option>
                              ))}
                            </StyledSelect>
                            <StyledFieldHint>
                              {t`Obligatorio: todo lead con broker lleva un LO que conduce la negociación interna.`}
                            </StyledFieldHint>
                            {showValidation &&
                              formErrors.leasingOfficerAsignado && (
                                <StyledFieldError>
                                  {formErrors.leasingOfficerAsignado}
                                </StyledFieldError>
                              )}
                          </StyledField>
                        ) : null}
                      </>
                    ) : null}
                  </StyledSectionCard>
                </StyledSection>
              ) : null}

              {activeTab === 'requerimientos' ? (
                <StyledSection>
                  <StyledSectionCard>
                    <StyledFieldGrid>
                      <StyledFieldFull>
                        <StyledFieldLabel htmlFor="lead-m2">
                          {t`Metros cuadrados requeridos`}
                          <StyledRequired>*</StyledRequired>
                        </StyledFieldLabel>
                        <StyledInput
                          id="lead-m2"
                          type="number"
                          min={1}
                          value={form.metrosCuadradosRequeridos}
                          onChange={(event) =>
                            updateForm({
                              metrosCuadradosRequeridos: Number(
                                event.target.value,
                              ),
                            })
                          }
                        />
                        <StyledChipRow>
                          {M2_PRESETS.map((preset) => (
                            <StyledPresetChip
                              key={preset}
                              type="button"
                              isSelected={
                                form.metrosCuadradosRequeridos === preset
                              }
                              onClick={() =>
                                updateForm({
                                  metrosCuadradosRequeridos: preset,
                                })
                              }
                            >
                              {preset.toLocaleString('es-MX')} m²
                            </StyledPresetChip>
                          ))}
                        </StyledChipRow>
                        {showValidation &&
                          formErrors.metrosCuadradosRequeridos && (
                            <StyledFieldError>
                              {formErrors.metrosCuadradosRequeridos}
                            </StyledFieldError>
                          )}
                      </StyledFieldFull>
                      <StyledField>
                        <StyledFieldLabel htmlFor="lead-ubicacion">
                          {t`Ubicación deseada`}
                        </StyledFieldLabel>
                        <StyledSelect
                          id="lead-ubicacion"
                          value={form.ubicacionDeseada}
                          onChange={(event) =>
                            updateForm({ ubicacionDeseada: event.target.value })
                          }
                        >
                          {UBICACION_OPTIONS.map((option) => (
                            <option key={option} value={option}>
                              {option}
                            </option>
                          ))}
                        </StyledSelect>
                      </StyledField>
                      <StyledField>
                        <StyledFieldLabel htmlFor="lead-giro">{t`Giro`}</StyledFieldLabel>
                        <StyledSelect
                          id="lead-giro"
                          value={form.giroEmpresa}
                          onChange={(event) =>
                            updateForm({ giroEmpresa: event.target.value })
                          }
                        >
                          {GIRO_OPTIONS.map((option) => (
                            <option key={option} value={option}>
                              {option}
                            </option>
                          ))}
                        </StyledSelect>
                      </StyledField>
                      <StyledField>
                        <StyledFieldLabel htmlFor="lead-plazo">
                          {t`Plazo de contrato (meses)`}
                        </StyledFieldLabel>
                        <StyledInput
                          id="lead-plazo"
                          type="number"
                          min={1}
                          value={form.plazoContratoMeses}
                          onChange={(event) =>
                            updateForm({
                              plazoContratoMeses: Number(event.target.value),
                            })
                          }
                        />
                        <StyledChipRow>
                          {PLAZO_PRESETS.map((preset) => (
                            <StyledPresetChip
                              key={preset}
                              type="button"
                              isSelected={form.plazoContratoMeses === preset}
                              onClick={() =>
                                updateForm({ plazoContratoMeses: preset })
                              }
                            >
                              {preset} {t`meses`}
                            </StyledPresetChip>
                          ))}
                        </StyledChipRow>
                      </StyledField>
                      <StyledField>
                        <StyledFieldLabel htmlFor="lead-presupuesto">
                          {t`Presupuesto mensual (USD)`}
                        </StyledFieldLabel>
                        <StyledInput
                          id="lead-presupuesto"
                          type="number"
                          min={0}
                          step={100}
                          value={form.presupuestoMensualUsd}
                          onChange={(event) =>
                            updateForm({
                              presupuestoMensualUsd: Number(event.target.value),
                            })
                          }
                        />
                        <StyledFieldHint>
                          {t`Referencia para calificación comercial`}
                        </StyledFieldHint>
                      </StyledField>
                    </StyledFieldGrid>
                  </StyledSectionCard>
                </StyledSection>
              ) : null}

              {activeTab === 'operacion' ? (
                <StyledSection>
                  <StyledSectionCard>
                    <StyledOperationGrid>
                      <StyledOperationCard
                        type="button"
                        isSelected={
                          form.tipoOperacion === 'Arrendamiento nuevo'
                        }
                        onClick={() =>
                          updateForm({ tipoOperacion: 'Arrendamiento nuevo' })
                        }
                      >
                        <StyledOperationTitle>{t`Nave disponible`}</StyledOperationTitle>
                        <StyledOperationHint>
                          {t`Arrendamiento de nave existente en parque industrial`}
                        </StyledOperationHint>
                      </StyledOperationCard>
                      <StyledOperationCard
                        type="button"
                        isSelected={form.tipoOperacion === 'Build-to-suit'}
                        onClick={() =>
                          updateForm({ tipoOperacion: 'Build-to-suit' })
                        }
                      >
                        <StyledOperationTitle>{t`Build-to-suit`}</StyledOperationTitle>
                        <StyledOperationHint>
                          {t`Construcción a la medida con specs técnicas`}
                        </StyledOperationHint>
                      </StyledOperationCard>
                    </StyledOperationGrid>

                    {form.tipoOperacion === 'Build-to-suit' && (
                      <StyledBtsPanel>
                        <StyledSectionHeader>
                          <StyledSectionIcon>
                            <IconTool size={16} />
                          </StyledSectionIcon>
                          <StyledSectionTitle>
                            {t`Especificaciones BTS`}
                          </StyledSectionTitle>
                        </StyledSectionHeader>
                        <StyledFieldGrid>
                          <StyledField>
                            <StyledFieldLabel htmlFor="lead-altura">
                              {t`Altura requerida (m)`}
                            </StyledFieldLabel>
                            <StyledInput
                              id="lead-altura"
                              type="number"
                              min={0}
                              placeholder="12"
                              value={form.alturaRequerida ?? ''}
                              onChange={(event) =>
                                updateForm({
                                  alturaRequerida:
                                    Number(event.target.value) || undefined,
                                })
                              }
                            />
                          </StyledField>
                          <StyledField>
                            <StyledFieldLabel htmlFor="lead-andenes">
                              {t`Andenes requeridos`}
                            </StyledFieldLabel>
                            <StyledInput
                              id="lead-andenes"
                              type="number"
                              min={0}
                              placeholder="4"
                              value={form.andenesRequeridos ?? ''}
                              onChange={(event) =>
                                updateForm({
                                  andenesRequeridos:
                                    Number(event.target.value) || undefined,
                                })
                              }
                            />
                          </StyledField>
                          <StyledFieldFull>
                            <StyledFieldLabel htmlFor="lead-specs">
                              {t`Especificaciones técnicas`}
                            </StyledFieldLabel>
                            <StyledTextarea
                              id="lead-specs"
                              placeholder={t`Ej. piso de concreto reforzado, rampa niveladora, oficinas en mezzanine…`}
                              value={form.especificacionesTecnicas ?? ''}
                              onChange={(event) =>
                                updateForm({
                                  especificacionesTecnicas: event.target.value,
                                })
                              }
                            />
                          </StyledFieldFull>
                        </StyledFieldGrid>
                      </StyledBtsPanel>
                    )}
                  </StyledSectionCard>
                </StyledSection>
              ) : null}

              {errorMessage && (
                <StyledBannerError>{errorMessage}</StyledBannerError>
              )}
            </ParksModalTabs>
          </StyledBody>

          <StyledFooter>
            <StyledFooterHint>{footerHint}</StyledFooterHint>
            <StyledFooterActions>
              <Button
                title={t`Cancelar`}
                onClick={handleClose}
                variant="secondary"
                disabled={isBusy}
              />
              {!isFirstTab ? (
                <Button
                  title={t`Anterior`}
                  onClick={handlePreviousTab}
                  variant="secondary"
                  disabled={isBusy}
                />
              ) : null}
              {!isLastTab ? (
                <Button
                  title={t`Siguiente`}
                  onClick={handleNextTab}
                  variant="primary"
                  disabled={isBusy}
                />
              ) : (
                <Button
                  title={
                    isSubmitting
                      ? t`Creando oportunidad…`
                      : prefillInquilino
                        ? t`Crear oportunidad`
                        : t`Crear lead`
                  }
                  onClick={() => {
                    void handleSubmit();
                  }}
                  variant="primary"
                  disabled={isBusy}
                />
              )}
            </StyledFooterActions>
          </StyledFooter>
        </StyledModal>
        )}
      </StyledOverlay>

      {isNewBrokerModalOpen ? (
        <ParksNewBrokerModal
          onClose={() => setIsNewBrokerModalOpen(false)}
          onCreated={(broker) => {
            setBrokers((current) => [broker, ...current]);
            updateForm({ brokerId: broker.id });
          }}
        />
      ) : null}
    </>,
    document.body,
  );
};
