import { styled } from '@linaria/react';
import { t } from '@lingui/core/macro';
import { type ReactNode, useEffect, useMemo, useState } from 'react';
import {
  IconCalendarEvent,
  IconCheck,
  IconFileText,
  IconSend,
  IconX,
  type IconComponent,
} from 'twenty-ui/icon';
import { ParksActionButton } from '@/parks-industrial/components/ui/ParksActionButton';
import { themeCssVariables } from 'twenty-ui/theme-constants';

import {
  StyledParksInput,
  StyledParksSelect,
  StyledParksTextarea,
} from '@/parks-industrial/components/ui/parks-form-control.styles';
import {
  ParksFormField,
  StyledParksFieldGrid,
} from '@/parks-industrial/components/ui/ParksFormField';
import { ParksComiteGateLegend } from '@/parks-industrial/components/comite/ParksComiteGateLegend';
import { ParksStatusBadge } from '@/parks-industrial/components/ui/ParksStatusBadge';
import { ParksToolSection } from '@/parks-industrial/components/ui/ParksToolSection';
import { ParksRoleLabel } from '@/parks-industrial/constants/parks-role-access.constants';
import { useParksAccess } from '@/parks-industrial/hooks/useParksAccess';
import { type ParksOpportunityRecord } from '@/parks-industrial/hooks/useParksRecords';
import { isParksLeasingOfficerRole } from '@/parks-industrial/utils/parks-role-access.util';
import {
  createParksHojaAcuerdos,
  fetchParksBrokers,
  fetchParksHojaByOpportunity,
  generateParksHojaCopy,
  markParksOpportunityLost,
  previewParksQuotation,
  registerParksTour,
  requestParksApproval,
  resolveParksApproval,
  sendParksQuotation,
  signParksHojaAcuerdos,
  updateParksHojaAcuerdos,
  type ParksBroker,
  type ParksHojaDeAcuerdosDraft,
  type ParksQuotationAdjacentCost,
  type ParksQuotationHistoryEntry,
} from '@/parks-industrial/services/parks-commercial.client';
import { fetchParksComiteByOpportunity } from '@/parks-industrial/services/parks-comite.client';
import { type ComiteAutorizacion } from '@/parks-industrial/types/parks-comite.types';
import { isParksComiteAwaitingAdjustments } from '@/parks-industrial/utils/parks-comite-pipeline.util';
import {
  fetchParksCommissionRates,
  type ParksCommissionRateMatrix,
} from '@/parks-industrial/services/parks-commission.client';
import {
  formatParksNumber,
  formatParksUsd,
} from '@/parks-industrial/utils/parks-format.util';
import {
  formatParksCommissionPrefillHint,
  resolveParksHojaCommissionPrefill,
} from '@/parks-industrial/utils/parks-commission-rate.util';
import {
  formatParksTourNavesLabel,
  parseParksTourNavesMostradas,
  type ParksTourNaveRef,
} from '@/parks-industrial/utils/parks-tour-naves.util';
import { PARKS_FLUJO_SECTION_IDS } from '@/parks-industrial/utils/parks-stage-guide.util';

const HOJA_TIPO_CONTRATO_OPTIONS = [
  'Arrendamiento nuevo',
  'Renovación',
  'Modificatorio',
  'Terminación anticipada',
  'Build-to-suit',
] as const;

const HOJA_ESQUEMA_OPTIONS = [
  'Recursos propios',
  'Broker top 10',
  'Broker no top 10',
] as const;

const normalizeHojaSelectLabel = (
  raw: string | undefined,
  options: readonly string[],
): string => {
  if (!raw) {
    return options[0];
  }

  const exact = options.find((option) => option === raw);

  if (exact) {
    return exact;
  }

  const compact = raw.toLowerCase().replace(/[\s_]+/g, '');

  return (
    options.find(
      (option) =>
        option
          .toLowerCase()
          .normalize('NFD')
          .replace(/[\u0300-\u036f]/g, '')
          .replace(/[\s_]+/g, '') ===
        compact.normalize('NFD').replace(/[\u0300-\u036f]/g, ''),
    ) ?? options[0]
  );
};

const isHojaSigned = (hoja: ParksHojaDeAcuerdosDraft | null): boolean => {
  if (!hoja) {
    return false;
  }

  if (hoja.firmadaPorCliente && hoja.firmadaPorCem) {
    return true;
  }

  const estatus = String(hoja.estatus ?? '').toLowerCase();

  return estatus.includes('firmada') || estatus.includes('enviada');
};

type HojaFormState = {
  tipoContrato: string;
  m2Acordados: number;
  precioUsdM2: number;
  plazoMeses: number;
  fechaInicio: string;
  periodoGraciaMeses: number;
  depositoMeses: number;
  escalacionAnualPct: number;
  condicionesEspeciales: string;
  esquemaComision: string;
  ejecutivoAsignado: string;
  brokerId: string;
  brokerComisionPct: number;
};

const buildHojaFormState = (hoja: ParksHojaDeAcuerdosDraft): HojaFormState => ({
  tipoContrato: normalizeHojaSelectLabel(
    hoja.tipoContrato,
    HOJA_TIPO_CONTRATO_OPTIONS,
  ),
  m2Acordados: hoja.m2Acordados ?? 0,
  precioUsdM2: hoja.precioUsdM2 ?? 0,
  plazoMeses: hoja.plazoMeses ?? 60,
  fechaInicio: hoja.fechaInicio?.slice(0, 10) ?? '',
  periodoGraciaMeses: hoja.periodoGraciaMeses ?? 0,
  depositoMeses: hoja.depositoMeses ?? 2,
  escalacionAnualPct: hoja.escalacionAnualPct ?? 0,
  condicionesEspeciales: hoja.condicionesEspeciales ?? '',
  esquemaComision: normalizeHojaSelectLabel(
    hoja.esquemaComision,
    HOJA_ESQUEMA_OPTIONS,
  ),
  ejecutivoAsignado: hoja.ejecutivoAsignado ?? '',
  brokerId: hoja.brokerId ?? hoja.broker?.id ?? '',
  brokerComisionPct: hoja.brokerComisionPct ?? 0,
});

const StyledWorkflowSubsection = styled.div`
  border-top: 1px solid ${themeCssVariables.border.color.light};
  display: flex;
  flex-direction: column;
  gap: ${themeCssVariables.spacing[3]};
  padding-top: ${themeCssVariables.spacing[3]};
  scroll-margin-top: ${themeCssVariables.spacing[4]};

  &:first-of-type {
    border-top: none;
    padding-top: 0;
  }
`;

const StyledSubsectionTitle = styled.h5`
  align-items: center;
  color: ${themeCssVariables.font.color.primary};
  display: flex;
  font-size: ${themeCssVariables.font.size.sm};
  font-weight: ${themeCssVariables.font.weight.semiBold};
  gap: ${themeCssVariables.spacing[2]};
  margin: 0;
`;

const StyledSubsectionIcon = styled.span`
  align-items: center;
  background: ${themeCssVariables.background.transparent.light};
  border-radius: ${themeCssVariables.border.radius.sm};
  color: ${themeCssVariables.font.color.secondary};
  display: flex;
  height: 24px;
  justify-content: center;
  width: 24px;
`;

const StyledActionsRow = styled.div`
  align-items: center;
  display: flex;
  flex-wrap: wrap;
  gap: ${themeCssVariables.spacing[2]};
  justify-content: flex-end;
  padding-top: ${themeCssVariables.spacing[1]};
`;

const StyledResultBanner = styled.div<{ isError?: boolean }>`
  background: ${({ isError }) =>
    isError ? themeCssVariables.color.red1 : themeCssVariables.color.green1};
  border: 1px solid
    ${({ isError }) =>
      isError ? themeCssVariables.color.red3 : themeCssVariables.color.green3};
  border-radius: ${themeCssVariables.border.radius.sm};
  color: ${({ isError }) =>
    isError
      ? themeCssVariables.color.red
      : themeCssVariables.font.color.primary};
  font-size: ${themeCssVariables.font.size.sm};
  padding: ${themeCssVariables.spacing[2]} ${themeCssVariables.spacing[3]};
`;

const StyledPreviewValue = styled.div`
  background: ${themeCssVariables.color.blue1};
  border: 1px solid ${themeCssVariables.color.blue3};
  border-radius: ${themeCssVariables.border.radius.sm};
  color: ${themeCssVariables.font.color.primary};
  font-size: ${themeCssVariables.font.size.sm};
  font-weight: ${themeCssVariables.font.weight.semiBold};
  padding: ${themeCssVariables.spacing[2]} ${themeCssVariables.spacing[3]};
`;

const StyledNaveCard = styled.div`
  background: ${themeCssVariables.background.secondary};
  border: 1px solid ${themeCssVariables.border.color.medium};
  border-radius: ${themeCssVariables.border.radius.md};
  display: flex;
  flex-direction: column;
  gap: ${themeCssVariables.spacing[1]};
  padding: ${themeCssVariables.spacing[3]};
`;

const StyledNaveTitle = styled.div`
  align-items: center;
  display: flex;
  flex-wrap: wrap;
  gap: ${themeCssVariables.spacing[2]};
  font-size: ${themeCssVariables.font.size.sm};
  font-weight: ${themeCssVariables.font.weight.semiBold};
`;

const StyledNaveMeta = styled.div`
  color: ${themeCssVariables.font.color.secondary};
  font-size: ${themeCssVariables.font.size.xs};
  line-height: 1.4;
`;

const StyledHistoryList = styled.ul`
  color: ${themeCssVariables.font.color.secondary};
  display: flex;
  flex-direction: column;
  font-size: ${themeCssVariables.font.size.sm};
  gap: ${themeCssVariables.spacing[2]};
  list-style: none;
  margin: 0;
  padding: 0;
`;

const StyledHistoryItem = styled.li`
  background: ${themeCssVariables.background.secondary};
  border: 1px solid ${themeCssVariables.border.color.light};
  border-radius: ${themeCssVariables.border.radius.sm};
  line-height: 1.45;
  padding: ${themeCssVariables.spacing[2]} ${themeCssVariables.spacing[3]};
`;

const StyledCostRow = styled.div`
  align-items: flex-end;
  display: grid;
  gap: ${themeCssVariables.spacing[2]};
  grid-template-columns: 1.4fr 0.8fr 0.9fr auto;
`;

const parseQuotationHistory = (
  raw?: string | null,
): ParksQuotationHistoryEntry[] => {
  if (!raw?.trim()) {
    return [];
  }

  try {
    const parsed = JSON.parse(raw) as ParksQuotationHistoryEntry[];

    return Array.isArray(parsed) ? parsed : [];
  } catch {
    return [];
  }
};

const parseAdjacentCosts = (
  raw?: string | null,
): ParksQuotationAdjacentCost[] => {
  if (!raw?.trim()) {
    return [];
  }

  try {
    const parsed = JSON.parse(raw) as ParksQuotationAdjacentCost[];

    return Array.isArray(parsed) ? parsed : [];
  } catch {
    return [];
  }
};

const StyledHint = styled.p`
  color: ${themeCssVariables.font.color.tertiary};
  font-size: ${themeCssVariables.font.size.sm};
  line-height: 1.4;
  margin: 0;
`;

const StyledSignatureGrid = styled.div`
  display: grid;
  gap: ${themeCssVariables.spacing[2]};
  grid-template-columns: repeat(2, minmax(0, 1fr));

  @media (max-width: 720px) {
    grid-template-columns: 1fr;
  }
`;

const StyledSignatureCard = styled.div<{ isDone: boolean }>`
  background: ${({ isDone }) =>
    isDone
      ? themeCssVariables.color.green1
      : themeCssVariables.background.secondary};
  border: 1px solid
    ${({ isDone }) =>
      isDone
        ? themeCssVariables.color.green3
        : themeCssVariables.border.color.medium};
  border-radius: ${themeCssVariables.border.radius.md};
  display: flex;
  flex-direction: column;
  gap: ${themeCssVariables.spacing[2]};
  padding: ${themeCssVariables.spacing[3]};
`;

const StyledSignatureTitle = styled.div`
  align-items: center;
  display: flex;
  flex-wrap: wrap;
  gap: ${themeCssVariables.spacing[2]};
  font-size: ${themeCssVariables.font.size.sm};
  font-weight: ${themeCssVariables.font.weight.semiBold};
`;

const StyledSignatureMeta = styled.p`
  color: ${themeCssVariables.font.color.secondary};
  font-size: ${themeCssVariables.font.size.xs};
  line-height: 1.4;
  margin: 0;
`;

type WorkflowSubsectionProps = {
  title: string;
  icon: IconComponent;
  sectionId?: string;
  children: ReactNode;
};

const WorkflowSubsection = ({
  title,
  icon: Icon,
  sectionId,
  children,
}: WorkflowSubsectionProps) => (
  <StyledWorkflowSubsection id={sectionId}>
    <StyledSubsectionTitle>
      <StyledSubsectionIcon>
        <Icon size={14} />
      </StyledSubsectionIcon>
      {title}
    </StyledSubsectionTitle>
    {children}
  </StyledWorkflowSubsection>
);

type ParksWorkflowSectionId =
  | 'tour'
  | 'cotizacion'
  | 'aprobacion'
  | 'hoja'
  | 'perdida';

type ParksCommercialWorkflowPanelProps = {
  opportunity: ParksOpportunityRecord;
  attendedDecisorIds?: string[];
  onUpdated?: () => void;
  onDealUpdated?: (update: Partial<ParksOpportunityRecord>) => void;
  embedded?: boolean;
  sections?: ParksWorkflowSectionId[];
  title?: string;
  hint?: string;
};

export const ParksCommercialWorkflowPanel = ({
  opportunity,
  attendedDecisorIds = [],
  onUpdated,
  onDealUpdated,
  embedded = false,
  sections,
  title,
  hint,
}: ParksCommercialWorkflowPanelProps) => {
  const visibleSections = sections ?? [
    'tour',
    'cotizacion',
    'aprobacion',
    'hoja',
    'perdida',
  ];
  const showSection = (sectionId: ParksWorkflowSectionId) =>
    visibleSections.includes(sectionId);
  const panelTitle = title ?? t`Flujo comercial`;
  const panelHint = hint;
  const { parksRoleLabels, hasFullParksAccess } = useParksAccess();
  const canSignAsCem =
    hasFullParksAccess ||
    parksRoleLabels.includes(ParksRoleLabel.DirectorComercial) ||
    parksRoleLabels.length === 0;
  const canRegisterClientSignature =
    hasFullParksAccess ||
    isParksLeasingOfficerRole(parksRoleLabels) ||
    parksRoleLabels.includes(ParksRoleLabel.DirectorComercial) ||
    parksRoleLabels.length === 0;

  const companyName =
    opportunity.inquilinoVinculado?.empresa ?? opportunity.name ?? 'Prospecto';

  const tourNaves = useMemo((): ParksTourNaveRef[] => {
    const parsed = parseParksTourNavesMostradas(opportunity.tourNavesMostradas);

    if (parsed.length > 0) {
      return parsed;
    }

    if (opportunity.naveVinculada?.id || opportunity.naveVinculadaId) {
      return [
        {
          id:
            opportunity.naveVinculada?.id ?? opportunity.naveVinculadaId ?? '',
          identificador:
            opportunity.naveVinculada?.identificador ?? t`Nave vinculada`,
          m2: opportunity.m2Ofertados ?? opportunity.m2Requeridos,
        },
      ];
    }

    return [];
  }, [opportunity]);

  const [quotedNaveId, setQuotedNaveId] = useState(
    () =>
      opportunity.naveVinculada?.id ??
      opportunity.naveVinculadaId ??
      tourNaves[0]?.id ??
      '',
  );
  const [tourFecha, setTourFecha] = useState(
    new Date().toISOString().slice(0, 10),
  );
  const [tourFeedback, setTourFeedback] = useState('');
  const [tourProximosPasos, setTourProximosPasos] = useState('');
  const [m2Ofertados, setM2Ofertados] = useState(
    opportunity.m2Ofertados ?? opportunity.m2Requeridos ?? 0,
  );
  const [precioPorM2, setPrecioPorM2] = useState(
    opportunity.precioPorM2Usd ?? 0.9,
  );
  const [plazoContratoMeses, setPlazoContratoMeses] = useState(
    opportunity.plazoContratoMeses ?? 60,
  );
  const [monedaCotizacion, setMonedaCotizacion] = useState<'MXN' | 'USD'>(
    opportunity.monedaCotizacion === 'MXN' ? 'MXN' : 'USD',
  );
  const [costosAledanos, setCostosAledanos] = useState<
    ParksQuotationAdjacentCost[]
  >(() => parseAdjacentCosts(opportunity.costosAledanosJson));
  const [nuevoCostoConcepto, setNuevoCostoConcepto] = useState('');
  const [nuevoCostoMonto, setNuevoCostoMonto] = useState(0);
  const [nuevoCostoTipo, setNuevoCostoTipo] = useState<
    ParksQuotationAdjacentCost['tipo']
  >('recurrente');
  const [rentaPreview, setRentaPreview] = useState<number | null>(null);
  const [condicionesPropuestas, setCondicionesPropuestas] = useState('');
  const [motivoPerdida, setMotivoPerdida] = useState('Pospuesto');
  const [competidor, setCompetidor] = useState('Prologis');
  const [fechaReactivacion, setFechaReactivacion] = useState('');
  const [hojaId, setHojaId] = useState<string | null>(null);
  const [hojaDraft, setHojaDraft] = useState<ParksHojaDeAcuerdosDraft | null>(
    null,
  );
  const [hojaForm, setHojaForm] = useState<HojaFormState | null>(null);
  const [comiteForDeal, setComiteForDeal] =
    useState<ComiteAutorizacion | null>(null);
  const [statusMessage, setStatusMessage] = useState<string | null>(null);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [isBusy, setIsBusy] = useState(false);
  const [brokers, setBrokers] = useState<ParksBroker[]>([]);
  const [commissionMatrix, setCommissionMatrix] =
    useState<ParksCommissionRateMatrix | null>(null);

  useEffect(() => {
    let cancelled = false;

    fetchParksBrokers()
      .then((result) => {
        if (!cancelled) {
          setBrokers(result);
        }
      })
      .catch(() => {
        // Broker picker is optional context here — the Hoja can stay on
        // "Recursos propios" if the broker directory is unreachable.
      });

    fetchParksCommissionRates()
      .then((matrix) => {
        if (!cancelled) {
          setCommissionMatrix(matrix);
        }
      })
      .catch(() => {
        // Matrix prefill falls back silently; LO can still type % manually.
      });

    return () => {
      cancelled = true;
    };
  }, []);

  const quotedNave =
    tourNaves.find((nave) => nave.id === quotedNaveId) ?? tourNaves[0] ?? null;

  const quotationHistory = useMemo(
    () => parseQuotationHistory(opportunity.cotizacionHistorialJson),
    [opportunity.cotizacionHistorialJson],
  );

  const linkedBroker = useMemo(() => {
    const brokerId =
      opportunity.brokerVinculadoId ?? opportunity.brokerVinculado?.id;

    if (!brokerId) {
      return null;
    }

    return (
      brokers.find((broker) => broker.id === brokerId) ??
      (opportunity.brokerVinculado
        ? ({
            id: brokerId,
            empresa: opportunity.brokerVinculado.empresa,
            contacto: opportunity.brokerVinculado.contacto,
            clasificacion: opportunity.brokerVinculado.empresaBroker
              ?.clasificacion,
            empresaBroker: opportunity.brokerVinculado.empresaBroker,
          } satisfies ParksBroker)
        : null)
    );
  }, [brokers, opportunity.brokerVinculado, opportunity.brokerVinculadoId]);

  const resolveBrokerPrefillPct = (
    broker: ParksBroker | null | undefined,
    tipoContratoOrOperacion?: string | null,
    esquemaComision?: string | null,
  ) => {
    if (!commissionMatrix || !broker?.id) {
      return null;
    }

    const isTop10 =
      broker.clasificacion === 'TOP_10' ||
      broker.clasificacion === 'Top 10' ||
      broker.empresaBroker?.clasificacion === 'TOP_10' ||
      broker.empresaBroker?.clasificacion === 'Top 10';

    return resolveParksHojaCommissionPrefill({
      matrix: commissionMatrix,
      hasBroker: true,
      brokerClasificacion:
        broker.clasificacion ?? broker.empresaBroker?.clasificacion,
      esquemaComision:
        esquemaComision ??
        (isTop10 ? 'Broker top 10' : 'Broker no top 10'),
      tipoContratoOrOperacion:
        tipoContratoOrOperacion ??
        opportunity.tipoOperacion ??
        'Arrendamiento nuevo',
      naveEstatus: opportunity.naveVinculada?.estatus,
      brokerOverrides: {
        comisionPct: broker.empresaBroker?.comisionPct,
        comisionPctNuevo: broker.empresaBroker?.comisionPctNuevo,
        comisionPctPreventa: broker.empresaBroker?.comisionPctPreventa,
        comisionPctRenovacion: broker.empresaBroker?.comisionPctRenovacion,
      },
    });
  };

  const linkedBrokerPrefill = useMemo(
    () =>
      resolveBrokerPrefillPct(
        linkedBroker,
        hojaForm?.tipoContrato ?? opportunity.tipoOperacion,
        hojaForm?.esquemaComision,
      ),
    // Prefill depends on matrix + deal context; helper closes over those.
    // eslint-disable-next-line react-hooks/exhaustive-deps
    [
      commissionMatrix,
      linkedBroker,
      hojaForm?.tipoContrato,
      hojaForm?.esquemaComision,
      opportunity.tipoOperacion,
      opportunity.naveVinculada?.estatus,
    ],
  );

  const linkedBrokerComisionPct = linkedBrokerPrefill?.pctAplicado ?? null;
  const linkedBrokerComisionHint = linkedBrokerPrefill
    ? formatParksCommissionPrefillHint(linkedBrokerPrefill)
    : null;

  const hydrateHoja = (hoja: ParksHojaDeAcuerdosDraft) => {
    setHojaId(hoja.id);
    setHojaDraft(hoja);
    setHojaForm(buildHojaFormState(hoja));
  };

  useEffect(() => {
    if (!quotedNave?.id) {
      return;
    }

    if (quotedNave.m2 && quotedNave.m2 > 0) {
      setM2Ofertados(quotedNave.m2);
    }
  }, [quotedNave?.id, quotedNave?.m2]);

  useEffect(() => {
    let cancelled = false;

    const loadExistingHoja = async () => {
      try {
        const hoja = await fetchParksHojaByOpportunity(opportunity.id);

        if (cancelled || !hoja) {
          return;
        }

        hydrateHoja(hoja);
      } catch {
        // Sin hoja previa: el usuario puede generar una nueva
      }

      try {
        const comite = await fetchParksComiteByOpportunity(opportunity.id);

        if (!cancelled) {
          setComiteForDeal(comite);
        }
      } catch {
        if (!cancelled) {
          setComiteForDeal(null);
        }
      }
    };

    void loadExistingHoja();

    return () => {
      cancelled = true;
    };
  }, [opportunity.id]);

  useEffect(() => {
    if (!linkedBroker?.id || !hojaForm || hojaForm.brokerId) {
      return;
    }

    const isTop10 =
      linkedBroker.clasificacion === 'TOP_10' ||
      linkedBroker.clasificacion === 'Top 10' ||
      linkedBroker.empresaBroker?.clasificacion === 'TOP_10' ||
      linkedBroker.empresaBroker?.clasificacion === 'Top 10';
    const esquemaComision = isTop10
      ? 'Broker top 10'
      : 'Broker no top 10';
    const prefill = resolveBrokerPrefillPct(
      linkedBroker,
      hojaForm.tipoContrato,
      esquemaComision,
    );

    setHojaForm((current) =>
      current
        ? {
            ...current,
            brokerId: linkedBroker.id,
            brokerComisionPct: prefill?.pctAplicado ?? 0,
            esquemaComision,
          }
        : current,
    );
    // Auto-fill once when deal broker is linked and hoja has no broker yet
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [linkedBroker?.id, hojaForm?.brokerId, commissionMatrix]);

  const liveRentaPreview =
    m2Ofertados > 0 && precioPorM2 > 0
      ? Math.round(m2Ofertados * precioPorM2 * 100) / 100
      : null;

  const hojaRentaMensual =
    hojaForm && hojaForm.m2Acordados > 0 && hojaForm.precioUsdM2 > 0
      ? Math.round(hojaForm.m2Acordados * hojaForm.precioUsdM2 * 100) / 100
      : null;

  const hojaIsSigned = isHojaSigned(hojaDraft);
  const hojaFirmadaPorCem = Boolean(hojaDraft?.firmadaPorCem);
  const hojaFirmadaPorCliente = Boolean(hojaDraft?.firmadaPorCliente);
  const waitingComiteAdjustments =
    isParksComiteAwaitingAdjustments(comiteForDeal);
  const latestComiteAdjustment =
    comiteForDeal?.ajustesSesion?.[
      (comiteForDeal.ajustesSesion?.length ?? 0) - 1
    ];
  const isHojaTermsLocked =
    (hojaIsSigned && !waitingComiteAdjustments) ||
    (!hojaIsSigned && hojaFirmadaPorCem);

  const persistHojaDraft = async () => {
    if (!hojaId || !hojaForm || isHojaTermsLocked) {
      return;
    }

    const updated = await updateParksHojaAcuerdos(hojaId, {
      tipoContrato: hojaForm.tipoContrato,
      m2Acordados: hojaForm.m2Acordados,
      precioUsdM2: hojaForm.precioUsdM2,
      plazoMeses: hojaForm.plazoMeses,
      fechaInicio: hojaForm.fechaInicio || null,
      periodoGraciaMeses: hojaForm.periodoGraciaMeses,
      depositoMeses: hojaForm.depositoMeses,
      escalacionAnualPct: hojaForm.escalacionAnualPct,
      condicionesEspeciales: hojaForm.condicionesEspeciales,
      esquemaComision: hojaForm.esquemaComision,
      ejecutivoAsignado: hojaForm.ejecutivoAsignado,
      brokerId: hojaForm.brokerId || null,
      brokerComisionPct: hojaForm.brokerComisionPct,
    });
    hydrateHoja(updated);
    const refreshedComite = await fetchParksComiteByOpportunity(
      opportunity.id,
    );
    setComiteForDeal(refreshedComite);
  };

  const applySignResult = (result: {
    firmadaPorCem?: boolean;
    firmadaPorCliente?: boolean;
    readyForLegal?: boolean;
    casoLegalId?: string;
    nextStage?: string;
  }) => {
    setHojaDraft((current) =>
      current
        ? {
            ...current,
            firmadaPorCem: result.firmadaPorCem ?? current.firmadaPorCem,
            firmadaPorCliente:
              result.firmadaPorCliente ?? current.firmadaPorCliente,
            estatus:
              result.firmadaPorCem && result.firmadaPorCliente
                ? 'Firmada'
                : current.estatus,
          }
        : current,
    );

    void fetchParksComiteByOpportunity(opportunity.id)
      .then(setComiteForDeal)
      .catch(() => {
        setComiteForDeal(null);
      });

    if (!result.readyForLegal) {
      return;
    }

    // Handoff moves the deal into legal; otherwise stay on LOI until Legal picks it up
    const nextStage =
      result.nextStage === 'EN_PROCESO_LEGAL' || result.casoLegalId
        ? 'EN_PROCESO_LEGAL'
        : 'HOJA_DE_ACUERDOS_FIRMADA';

    onDealUpdated?.({
      stage: nextStage,
    });
  };

  const runAction = async (action: () => Promise<void>, success: string) => {
    setIsBusy(true);
    setErrorMessage(null);
    setStatusMessage(null);

    try {
      await action();
      setStatusMessage(success);
      onUpdated?.();
    } catch (error) {
      setErrorMessage(
        error instanceof Error ? error.message : t`Error en la acción`,
      );
    } finally {
      setIsBusy(false);
    }
  };

  return (
    <ParksToolSection
      title={panelTitle}
      icon={IconCalendarEvent}
      hint={panelHint}
      embedded={embedded}
    >
      {showSection('tour') ? (
        <WorkflowSubsection
          title={t`Registrar tour`}
          icon={IconCalendarEvent}
          sectionId={PARKS_FLUJO_SECTION_IDS.tour}
        >
          <StyledParksFieldGrid>
            <ParksFormField label={t`Fecha del tour`} htmlFor="tour-fecha">
              <StyledParksInput
                id="tour-fecha"
                type="date"
                value={tourFecha}
                onChange={(event) => setTourFecha(event.target.value)}
              />
            </ParksFormField>
            <ParksFormField
              label={t`Naves del tour`}
              hint={t`Se toman del matching en Propuesta`}
            >
              <StyledParksInput
                readOnly
                value={
                  opportunity.tourNavesMostradas
                    ? formatParksTourNavesLabel(
                        parseParksTourNavesMostradas(
                          opportunity.tourNavesMostradas,
                        ),
                      ) || opportunity.naveVinculada?.identificador
                    : (opportunity.naveVinculada?.identificador ??
                      t`Sin naves asignadas`)
                }
              />
            </ParksFormField>
            <ParksFormField label={t`Feedback del cliente`} fullWidth>
              <StyledParksTextarea
                placeholder={t`Impresiones, objeciones, interés...`}
                value={tourFeedback}
                onChange={(event) => setTourFeedback(event.target.value)}
              />
            </ParksFormField>
            <ParksFormField label={t`Próximos pasos`} fullWidth>
              <StyledParksTextarea
                placeholder={t`Cotización, segunda visita, aprobación interna...`}
                value={tourProximosPasos}
                onChange={(event) => setTourProximosPasos(event.target.value)}
              />
            </ParksFormField>
          </StyledParksFieldGrid>
          <StyledActionsRow>
            <ParksActionButton
              title={t`Guardar tour`}
              size="sm"
              disabled={isBusy}
              onClick={() => {
                void runAction(
                  async () => {
                    await registerParksTour({
                      opportunityId: opportunity.id,
                      tourFecha,
                      tourFeedback,
                      tourProximosPasos,
                      tourParque: opportunity.naveVinculada?.identificador,
                      tourNavesMostradas:
                        opportunity.tourNavesMostradas ??
                        opportunity.naveVinculada?.identificador,
                      companyName,
                      inquilinoId: opportunity.inquilinoVinculado?.id,
                      attendedDecisorIds,
                    });
                    onDealUpdated?.({
                      tourFecha,
                      tourFeedback,
                      tourProximosPasos,
                      stage: 'TOUR_VISITA',
                    });
                  },
                  t`Tour registrado · tarea +48h creada`,
                );
              }}
            />
          </StyledActionsRow>
        </WorkflowSubsection>
      ) : null}

      {showSection('cotizacion') ? (
        <WorkflowSubsection
          title={t`Cotización formal`}
          icon={IconSend}
          sectionId={PARKS_FLUJO_SECTION_IDS.cotizacion}
        >
          {' '}
          {tourNaves.length === 0 ? (
            <StyledHint>
              {t`Primero vincula una nave en Propuesta para poder cotizar.`}
            </StyledHint>
          ) : (
            <>
              {tourNaves.length > 1 ? (
                <ParksFormField
                  label={t`Nave a cotizar`}
                  hint={t`Elige cuál de las naves del tour entra en esta propuesta`}
                  htmlFor="nave-cotizar"
                  fullWidth
                >
                  <StyledParksSelect
                    id="nave-cotizar"
                    value={quotedNave?.id ?? ''}
                    onChange={(event) => setQuotedNaveId(event.target.value)}
                  >
                    {tourNaves.map((nave) => (
                      <option key={nave.id} value={nave.id}>
                        {nave.identificador}
                        {nave.m2 ? ` · ${formatParksNumber(nave.m2)} m²` : ''}
                        {nave.parqueNombre ? ` · ${nave.parqueNombre}` : ''}
                      </option>
                    ))}
                  </StyledParksSelect>
                </ParksFormField>
              ) : null}

              {quotedNave ? (
                <StyledNaveCard>
                  <StyledNaveTitle>
                    {quotedNave.identificador}
                    <ParksStatusBadge color="blue" label={t`En cotización`} />
                  </StyledNaveTitle>
                  <StyledNaveMeta>
                    {quotedNave.parqueNombre
                      ? `${quotedNave.parqueNombre} · `
                      : ''}
                    {quotedNave.m2
                      ? t`${formatParksNumber(quotedNave.m2)} m² disponibles`
                      : t`Superficie por definir`}
                  </StyledNaveMeta>
                </StyledNaveCard>
              ) : null}

              {linkedBroker && linkedBrokerComisionPct !== null ? (
                <StyledPreviewValue>
                  {t`Comisión broker`}: {linkedBrokerComisionPct}%
                  {linkedBrokerComisionHint
                    ? ` · ${linkedBrokerComisionHint}`
                    : ''}{' '}
                  · {linkedBroker.empresaBroker?.nombre ?? linkedBroker.empresa}{' '}
                  · {t`Estimado`}: {monedaCotizacion}{' '}
                  {(
                    ((rentaPreview ?? liveRentaPreview ?? 0) *
                      linkedBrokerComisionPct) /
                    100
                  ).toLocaleString('es-MX')}
                </StyledPreviewValue>
              ) : null}

              {quotationHistory.length > 0 ? (
                <>
                  <StyledHint>{t`Historial de cotizaciones enviadas`}</StyledHint>
                  <StyledHistoryList>
                    {quotationHistory.map((entry) => (
                      <StyledHistoryItem key={`${entry.enviadaEn}-${entry.precioPorM2}`}>
                        <strong>{entry.enviadaEn}</strong> · {entry.naveIdentificador ?? t`Nave`} ·{' '}
                        {formatParksNumber(entry.m2Ofertados)} m² × {entry.moneda}{' '}
                        {entry.precioPorM2} = {entry.moneda}{' '}
                        {entry.rentaMensualCalculada.toLocaleString('es-MX')}
                      </StyledHistoryItem>
                    ))}
                  </StyledHistoryList>
                </>
              ) : null}

              <StyledParksFieldGrid>
                <ParksFormField label={t`m² ofertados`} htmlFor="m2-ofertados">
                  <StyledParksInput
                    id="m2-ofertados"
                    type="number"
                    min={0}
                    value={m2Ofertados}
                    onChange={(event) =>
                      setM2Ofertados(Number(event.target.value))
                    }
                  />
                </ParksFormField>
                <ParksFormField
                  label={t`Precio por m²`}
                  htmlFor="precio-m2"
                >
                  <StyledParksInput
                    id="precio-m2"
                    type="number"
                    step="0.01"
                    min={0}
                    value={precioPorM2}
                    onChange={(event) =>
                      setPrecioPorM2(Number(event.target.value))
                    }
                  />
                </ParksFormField>
                <ParksFormField label={t`Moneda`} htmlFor="moneda-cotizacion">
                  <StyledParksSelect
                    id="moneda-cotizacion"
                    value={monedaCotizacion}
                    onChange={(event) =>
                      setMonedaCotizacion(
                        event.target.value === 'MXN' ? 'MXN' : 'USD',
                      )
                    }
                  >
                    <option value="USD">USD</option>
                    <option value="MXN">MXN</option>
                  </StyledParksSelect>
                </ParksFormField>
                <ParksFormField
                  label={t`Plazo (meses)`}
                  htmlFor="plazo-cotizacion"
                >
                  <StyledParksInput
                    id="plazo-cotizacion"
                    type="number"
                    min={1}
                    value={plazoContratoMeses}
                    onChange={(event) =>
                      setPlazoContratoMeses(Number(event.target.value))
                    }
                  />
                </ParksFormField>
              </StyledParksFieldGrid>
              <ParksComiteGateLegend glaM2={m2Ofertados} />

              <ParksFormField
                label={t`Costos aledaños`}
                hint={t`Cobros únicos o recurrentes encima de la renta`}
                fullWidth
              >
                <StyledCostRow>
                  <StyledParksInput
                    placeholder={t`Concepto`}
                    value={nuevoCostoConcepto}
                    onChange={(event) =>
                      setNuevoCostoConcepto(event.target.value)
                    }
                  />
                  <StyledParksInput
                    type="number"
                    min={0}
                    step="0.01"
                    value={nuevoCostoMonto}
                    onChange={(event) =>
                      setNuevoCostoMonto(Number(event.target.value))
                    }
                  />
                  <StyledParksSelect
                    value={nuevoCostoTipo}
                    onChange={(event) =>
                      setNuevoCostoTipo(
                        event.target.value === 'unica_vez'
                          ? 'unica_vez'
                          : 'recurrente',
                      )
                    }
                  >
                    <option value="recurrente">{t`Recurrente`}</option>
                    <option value="unica_vez">{t`Única vez`}</option>
                  </StyledParksSelect>
                  <ParksActionButton
                    title={t`Agregar`}
                    size="sm"
                    variant="secondary"
                    disabled={!nuevoCostoConcepto.trim() || nuevoCostoMonto <= 0}
                    onClick={() => {
                      setCostosAledanos((current) => [
                        ...current,
                        {
                          concepto: nuevoCostoConcepto.trim(),
                          monto: nuevoCostoMonto,
                          tipo: nuevoCostoTipo,
                        },
                      ]);
                      setNuevoCostoConcepto('');
                      setNuevoCostoMonto(0);
                    }}
                  />
                </StyledCostRow>
                {costosAledanos.length > 0 ? (
                  <StyledHistoryList>
                    {costosAledanos.map((costo, index) => (
                      <StyledHistoryItem key={`${costo.concepto}-${index}`}>
                        {costo.concepto} · {monedaCotizacion}{' '}
                        {costo.monto.toLocaleString('es-MX')} ·{' '}
                        {costo.tipo === 'unica_vez' ? t`Única vez` : t`Recurrente`}
                      </StyledHistoryItem>
                    ))}
                  </StyledHistoryList>
                ) : null}
              </ParksFormField>

              <StyledPreviewValue>
                {t`Renta mensual`}: {monedaCotizacion}{' '}
                {(rentaPreview ?? liveRentaPreview ?? 0).toLocaleString(
                  'es-MX',
                )}
                {quotedNave ? (
                  <>
                    {' '}
                    · {quotedNave.identificador} ·{' '}
                    {formatParksNumber(m2Ofertados)} m² × {monedaCotizacion}{' '}
                    {precioPorM2}
                  </>
                ) : null}
              </StyledPreviewValue>

              <StyledActionsRow>
                <ParksActionButton
                  title={t`Preview renta`}
                  size="sm"
                  variant="secondary"
                  disabled={isBusy || !quotedNave}
                  onClick={() => {
                    void runAction(
                      async () => {
                        const preview = await previewParksQuotation({
                          m2Ofertados,
                          precioPorM2Usd: precioPorM2,
                        });
                        setRentaPreview(preview.rentaMensualCalculada);
                      },
                      t`Renta calculada`,
                    );
                  }}
                />
                <ParksActionButton
                  title={t`Enviar cotización`}
                  size="sm"
                  disabled={isBusy || !quotedNave || m2Ofertados <= 0}
                  onClick={() => {
                    void runAction(
                      async () => {
                        const result = await sendParksQuotation(
                          opportunity.id,
                          {
                            m2Ofertados,
                            precioPorM2Usd: precioPorM2,
                            plazoContratoMeses,
                            companyName,
                            naveVinculadaId: quotedNave?.id,
                            naveIdentificador: quotedNave?.identificador,
                            moneda: monedaCotizacion,
                            costosAledanos,
                          },
                        );
                        setRentaPreview(result.rentaMensualCalculada);
                        const statusSuffix = result.requiresConsejoApproval
                          ? t` · requiere aprobación de consejo`
                          : t` · seguimiento 5 días hábiles`;
                        onDealUpdated?.({
                          m2Ofertados,
                          precioPorM2Usd: precioPorM2,
                          plazoContratoMeses,
                          monedaCotizacion,
                          costosAledanosJson: JSON.stringify(costosAledanos),
                          naveVinculadaId: quotedNave?.id,
                          naveVinculada: quotedNave
                            ? ({
                                id: quotedNave.id,
                                identificador: quotedNave.identificador,
                              } as ParksOpportunityRecord['naveVinculada'])
                            : undefined,
                          cotizacionEnviadaEn: new Date()
                            .toISOString()
                            .slice(0, 10),
                          aprobacionRequerida: result.requiresConsejoApproval,
                          stage: 'COTIZACION_ENVIADA',
                        });
                        setStatusMessage(t`Cotización enviada${statusSuffix}`);
                      },
                      t`Cotización enviada`,
                    );
                  }}
                />
              </StyledActionsRow>
            </>
          )}
        </WorkflowSubsection>
      ) : null}

      {showSection('aprobacion') ? (
        <WorkflowSubsection
          title={t`Aprobación condiciones especiales`}
          icon={IconCheck}
          sectionId={PARKS_FLUJO_SECTION_IDS.aprobacion}
        >
          {opportunity.aprobacionRequerida ? (
            <StyledResultBanner>
              {opportunity.comentarioAprobacion ??
                t`Este deal requiere aprobación antes de avanzar a LOI / consejo.`}
            </StyledResultBanner>
          ) : null}
          <ParksFormField
            label={t`Condiciones propuestas`}
            hint={t`Descuentos, plazos, mejoras — requiere aprobación Director Comercial`}
            fullWidth
          >
            <StyledParksTextarea
              placeholder={t`Ej. 3% descuento año 1, 2 meses de gracia...`}
              value={condicionesPropuestas}
              onChange={(event) => setCondicionesPropuestas(event.target.value)}
            />
          </ParksFormField>
          <StyledActionsRow>
            <ParksActionButton
              title={t`Solicitar aprobación`}
              size="sm"
              disabled={isBusy || !condicionesPropuestas.trim()}
              onClick={() => {
                void runAction(
                  async () => {
                    await requestParksApproval({
                      opportunityId: opportunity.id,
                      companyName,
                      condicionesPropuestas,
                      descuentoPct: 3,
                    });
                  },
                  t`Aprobación solicitada al Director Comercial`,
                );
              }}
            />
            <ParksActionButton
              title={t`Aprobar (Director Comercial)`}
              size="sm"
              variant="secondary"
              disabled={isBusy}
              onClick={() => {
                void runAction(
                  async () => {
                    await resolveParksApproval({
                      opportunityId: opportunity.id,
                      decision: 'Aprobada',
                      comentario: 'Aprobado en demo',
                      resolvedBy: 'Héctor Montelongo',
                    });
                  },
                  t`Aprobación concedida`,
                );
              }}
            />
          </StyledActionsRow>
        </WorkflowSubsection>
      ) : null}

      {showSection('hoja') ? (
        <WorkflowSubsection
          title={t`Hoja de Acuerdos`}
          icon={IconFileText}
          sectionId={PARKS_FLUJO_SECTION_IDS.hoja}
        >
          {!hojaForm ? (
            <>
              <StyledHint>
                {t`Genera el borrador con los datos de la cotización. Luego puedes previsualizarlo, editar condiciones y firmar.`}
              </StyledHint>
              <StyledActionsRow>
                <ParksActionButton
                  title={t`Generar Hoja`}
                  size="sm"
                  disabled={isBusy}
                  onClick={() => {
                    void runAction(
                      async () => {
                        const result = await createParksHojaAcuerdos({
                          opportunityId: opportunity.id,
                          ejecutivoAsignado: 'LO demo',
                        });
                        hydrateHoja(result.hoja);
                      },
                      t`Hoja creada · revisa y edita el borrador`,
                    );
                  }}
                />
              </StyledActionsRow>
            </>
          ) : (
            <>
              <StyledNaveCard>
                <StyledNaveTitle>
                  {hojaDraft?.referencia ?? t`Borrador`}
                  <ParksStatusBadge
                    color={hojaIsSigned ? 'green' : 'blue'}
                    label={
                      hojaIsSigned
                        ? t`Firmada`
                        : (hojaDraft?.estatus ?? t`Borrador`)
                    }
                  />
                </StyledNaveTitle>
                <StyledNaveMeta>
                  {hojaDraft?.inquilino?.empresa ?? companyName}
                  {hojaDraft?.nave?.identificador
                    ? ` · ${hojaDraft.nave.identificador}`
                    : opportunity.naveVinculada?.identificador
                      ? ` · ${opportunity.naveVinculada.identificador}`
                      : ''}
                </StyledNaveMeta>
                {hojaRentaMensual !== null ? (
                  <StyledPreviewValue>
                    {t`Renta mensual: ${formatParksUsd(hojaRentaMensual)}`}
                  </StyledPreviewValue>
                ) : null}
              </StyledNaveCard>
              {waitingComiteAdjustments ? (
                <StyledResultBanner>
                  {t`El comité pidió ajustes y devolvió el deal a comercial. Cambia los términos de la Hoja y guarda: vuelve a sesión. Legal sigue sin verlo.`}
                  {latestComiteAdjustment
                    ? ` ${latestComiteAdjustment.texto}`
                    : ''}
                </StyledResultBanner>
              ) : null}

              <StyledParksFieldGrid>
                <ParksFormField label={t`Tipo de contrato`} htmlFor="hoja-tipo">
                  <StyledParksSelect
                    id="hoja-tipo"
                    disabled={isBusy || isHojaTermsLocked}
                    value={hojaForm.tipoContrato}
                    onChange={(event) => {
                      const nextTipoContrato = event.target.value;
                      setHojaForm((current) => {
                        if (!current) {
                          return current;
                        }

                        const selectedBroker = brokers.find(
                          (broker) => broker.id === current.brokerId,
                        );
                        const prefill = resolveBrokerPrefillPct(
                          selectedBroker,
                          nextTipoContrato,
                          current.esquemaComision,
                        );

                        return {
                          ...current,
                          tipoContrato: nextTipoContrato,
                          brokerComisionPct:
                            current.brokerId && prefill
                              ? prefill.pctAplicado
                              : current.brokerComisionPct,
                        };
                      });
                    }}
                  >
                    {HOJA_TIPO_CONTRATO_OPTIONS.map((option) => (
                      <option key={option} value={option}>
                        {option}
                      </option>
                    ))}
                  </StyledParksSelect>
                </ParksFormField>
                <ParksFormField
                  label={t`Esquema comisión`}
                  htmlFor="hoja-esquema"
                >
                  <StyledParksSelect
                    id="hoja-esquema"
                    disabled={isBusy || isHojaTermsLocked}
                    value={hojaForm.esquemaComision}
                    onChange={(event) => {
                      const nextEsquema = event.target.value;
                      setHojaForm((current) => {
                        if (!current) {
                          return current;
                        }

                        const selectedBroker = brokers.find(
                          (broker) => broker.id === current.brokerId,
                        );
                        const prefill = resolveBrokerPrefillPct(
                          selectedBroker,
                          current.tipoContrato,
                          nextEsquema,
                        );

                        return {
                          ...current,
                          esquemaComision: nextEsquema,
                          brokerComisionPct:
                            current.brokerId &&
                            nextEsquema !== 'Recursos propios' &&
                            prefill
                              ? prefill.pctAplicado
                              : nextEsquema === 'Recursos propios'
                                ? 0
                                : current.brokerComisionPct,
                        };
                      });
                    }}
                  >
                    {HOJA_ESQUEMA_OPTIONS.map((option) => (
                      <option key={option} value={option}>
                        {option}
                      </option>
                    ))}
                  </StyledParksSelect>
                </ParksFormField>
                <ParksFormField
                  label={t`Broker`}
                  htmlFor="hoja-broker"
                  hint={t`Requerido junto con el % para calcular la comisión externa`}
                >
                  <StyledParksSelect
                    id="hoja-broker"
                    disabled={isBusy || isHojaTermsLocked}
                    value={hojaForm.brokerId}
                    onChange={(event) => {
                      const selectedBrokerId = event.target.value;
                      const selectedBroker = brokers.find(
                        (broker) => broker.id === selectedBrokerId,
                      );
                      const isTop10 =
                        selectedBroker?.clasificacion === 'TOP_10' ||
                        selectedBroker?.clasificacion === 'Top 10' ||
                        selectedBroker?.empresaBroker?.clasificacion ===
                          'TOP_10' ||
                        selectedBroker?.empresaBroker?.clasificacion ===
                          'Top 10';
                      const nextEsquema = !selectedBroker
                        ? 'Recursos propios'
                        : isTop10
                          ? 'Broker top 10'
                          : 'Broker no top 10';
                      const prefill = resolveBrokerPrefillPct(
                        selectedBroker,
                        hojaForm.tipoContrato,
                        nextEsquema,
                      );

                      setHojaForm((current) =>
                        current
                          ? {
                              ...current,
                              brokerId: selectedBrokerId,
                              brokerComisionPct: prefill?.pctAplicado ?? 0,
                              esquemaComision: nextEsquema,
                            }
                          : current,
                      );
                    }}
                  >
                    <option value="">{t`Sin broker (recursos propios)`}</option>
                    {brokers.map((broker) => (
                      <option key={broker.id} value={broker.id}>
                        {broker.empresa}
                        {broker.clasificacion === 'TOP_10' ? ' · Top 10' : ''}
                      </option>
                    ))}
                  </StyledParksSelect>
                </ParksFormField>
                {hojaForm.brokerId ? (
                  <ParksFormField
                    label={t`Comisión broker (%)`}
                    htmlFor="hoja-broker-pct"
                    hint={
                      linkedBrokerComisionHint
                        ? t`Prellenado: ${linkedBrokerComisionHint}. Puedes ajustarlo para este folio.`
                        : t`Prellenado desde la matriz de comisiones`
                    }
                  >
                    <StyledParksInput
                      id="hoja-broker-pct"
                      type="number"
                      step="0.1"
                      min={0}
                      max={100}
                      disabled={isBusy || isHojaTermsLocked}
                      value={hojaForm.brokerComisionPct}
                      onChange={(event) =>
                        setHojaForm((current) =>
                          current
                            ? {
                                ...current,
                                brokerComisionPct: Number(event.target.value),
                              }
                            : current,
                        )
                      }
                    />
                  </ParksFormField>
                ) : null}
                <ParksFormField label={t`m² acordados`} htmlFor="hoja-m2">
                  <StyledParksInput
                    id="hoja-m2"
                    type="number"
                    min={0}
                    disabled={isBusy || isHojaTermsLocked}
                    value={hojaForm.m2Acordados}
                    onChange={(event) =>
                      setHojaForm((current) =>
                        current
                          ? {
                              ...current,
                              m2Acordados: Number(event.target.value),
                            }
                          : current,
                      )
                    }
                  />
                </ParksFormField>
                <ParksFormField label={t`Precio USD/m²`} htmlFor="hoja-precio">
                  <StyledParksInput
                    id="hoja-precio"
                    type="number"
                    step="0.01"
                    min={0}
                    disabled={isBusy || isHojaTermsLocked}
                    value={hojaForm.precioUsdM2}
                    onChange={(event) =>
                      setHojaForm((current) =>
                        current
                          ? {
                              ...current,
                              precioUsdM2: Number(event.target.value),
                            }
                          : current,
                      )
                    }
                  />
                </ParksFormField>
                <ParksFormField label={t`Plazo (meses)`} htmlFor="hoja-plazo">
                  <StyledParksInput
                    id="hoja-plazo"
                    type="number"
                    min={1}
                    disabled={isBusy || isHojaTermsLocked}
                    value={hojaForm.plazoMeses}
                    onChange={(event) =>
                      setHojaForm((current) =>
                        current
                          ? {
                              ...current,
                              plazoMeses: Number(event.target.value),
                            }
                          : current,
                      )
                    }
                  />
                </ParksFormField>
                <ParksFormField
                  label={t`Fecha de inicio`}
                  htmlFor="hoja-inicio"
                >
                  <StyledParksInput
                    id="hoja-inicio"
                    type="date"
                    disabled={isBusy || isHojaTermsLocked}
                    value={hojaForm.fechaInicio}
                    onChange={(event) =>
                      setHojaForm((current) =>
                        current
                          ? { ...current, fechaInicio: event.target.value }
                          : current,
                      )
                    }
                  />
                </ParksFormField>
                <ParksFormField
                  label={t`Periodo de gracia (meses)`}
                  htmlFor="hoja-gracia"
                >
                  <StyledParksInput
                    id="hoja-gracia"
                    type="number"
                    min={0}
                    disabled={isBusy || isHojaTermsLocked}
                    value={hojaForm.periodoGraciaMeses}
                    onChange={(event) =>
                      setHojaForm((current) =>
                        current
                          ? {
                              ...current,
                              periodoGraciaMeses: Number(event.target.value),
                            }
                          : current,
                      )
                    }
                  />
                </ParksFormField>
                <ParksFormField
                  label={t`Depósito (meses)`}
                  htmlFor="hoja-deposito"
                >
                  <StyledParksInput
                    id="hoja-deposito"
                    type="number"
                    min={0}
                    disabled={isBusy || isHojaTermsLocked}
                    value={hojaForm.depositoMeses}
                    onChange={(event) =>
                      setHojaForm((current) =>
                        current
                          ? {
                              ...current,
                              depositoMeses: Number(event.target.value),
                            }
                          : current,
                      )
                    }
                  />
                </ParksFormField>
                <ParksFormField
                  label={t`Escalación anual %`}
                  htmlFor="hoja-escalacion"
                >
                  <StyledParksInput
                    id="hoja-escalacion"
                    type="number"
                    step="0.1"
                    min={0}
                    disabled={isBusy || isHojaTermsLocked}
                    value={hojaForm.escalacionAnualPct}
                    onChange={(event) =>
                      setHojaForm((current) =>
                        current
                          ? {
                              ...current,
                              escalacionAnualPct: Number(event.target.value),
                            }
                          : current,
                      )
                    }
                  />
                </ParksFormField>
                <ParksFormField
                  label={t`Ejecutivo asignado`}
                  htmlFor="hoja-ejecutivo"
                >
                  <StyledParksInput
                    id="hoja-ejecutivo"
                    disabled={isBusy || isHojaTermsLocked}
                    value={hojaForm.ejecutivoAsignado}
                    onChange={(event) =>
                      setHojaForm((current) =>
                        current
                          ? {
                              ...current,
                              ejecutivoAsignado: event.target.value,
                            }
                          : current,
                      )
                    }
                  />
                </ParksFormField>
                <ParksFormField
                  label={t`Condiciones especiales`}
                  htmlFor="hoja-condiciones"
                  fullWidth
                >
                  <StyledParksTextarea
                    id="hoja-condiciones"
                    disabled={isBusy || isHojaTermsLocked}
                    placeholder={t`Descuentos, mejoras, cláusulas acordadas...`}
                    value={hojaForm.condicionesEspeciales}
                    onChange={(event) =>
                      setHojaForm((current) =>
                        current
                          ? {
                              ...current,
                              condicionesEspeciales: event.target.value,
                            }
                          : current,
                      )
                    }
                  />
                </ParksFormField>
              </StyledParksFieldGrid>
              <ParksComiteGateLegend glaM2={hojaForm.m2Acordados} />

              <StyledActionsRow>
                {!hojaIsSigned || waitingComiteAdjustments ? (
                  <ParksActionButton
                    title={
                      waitingComiteAdjustments
                        ? t`Guardar y reenviar a comité`
                        : t`Guardar cambios`
                    }
                    size="sm"
                    variant="secondary"
                    disabled={isBusy || !hojaId}
                    onClick={() => {
                      void runAction(
                        async () => {
                          await persistHojaDraft();
                        },
                        waitingComiteAdjustments
                          ? t`Términos reenviados a sesión de comité`
                          : t`Borrador actualizado`,
                      );
                    }}
                  />
                ) : null}
                <ParksActionButton
                  title={t`Generar copia`}
                  size="sm"
                  variant="secondary"
                  disabled={isBusy || !hojaId}
                  onClick={() => {
                    if (!hojaId) {
                      return;
                    }

                    void runAction(
                      async () => {
                        await persistHojaDraft();
                        const copy = await generateParksHojaCopy(hojaId);
                        const blob = new Blob([copy.html], {
                          type: 'text/html;charset=utf-8',
                        });
                        const url = URL.createObjectURL(blob);
                        window.open(url, '_blank', 'noopener,noreferrer');
                        window.setTimeout(
                          () => URL.revokeObjectURL(url),
                          60_000,
                        );
                      },
                      t`Copia abierta en nueva pestaña`,
                    );
                  }}
                />
              </StyledActionsRow>

              <StyledHint>
                {t`Comité es un candado comercial, no legal. Firmas CEM + cliente: si GLA > 20,000 m² el deal entra a sesión de comité y Legal no lo ve hasta que el CEO apruebe. Si GLA es menor, va directo a Legal. Pedir ajustes lo regresa a esta Hoja; rechazar lo manda a negociación.`}
              </StyledHint>

              <StyledSignatureGrid>
                <StyledSignatureCard isDone={hojaFirmadaPorCem}>
                  <StyledSignatureTitle>
                    {t`Firma Director Comercial`}
                    <ParksStatusBadge
                      color={hojaFirmadaPorCem ? 'green' : 'orange'}
                      label={hojaFirmadaPorCem ? t`Firmada` : t`Pendiente`}
                    />
                  </StyledSignatureTitle>
                  <StyledSignatureMeta>
                    {t`Director Comercial revisa y aprueba la Hoja de Acuerdos.`}
                  </StyledSignatureMeta>
                  {!hojaFirmadaPorCem ? (
                    <ParksActionButton
                      title={t`Firmar como Director Comercial`}
                      size="sm"
                      disabled={isBusy || !hojaId || !canSignAsCem}
                      onClick={() => {
                        if (!hojaId) {
                          return;
                        }

                        void runAction(
                          async () => {
                            await persistHojaDraft();
                            const result = await signParksHojaAcuerdos(hojaId, {
                              opportunityId: opportunity.id,
                              firmadaPorCem: true,
                              fechaFirma: new Date().toISOString().slice(0, 10),
                            });
                            applySignResult(result);
                          },
                          t`Director Comercial firmó · falta firma del cliente`,
                        );
                      }}
                    />
                  ) : null}
                </StyledSignatureCard>

                <StyledSignatureCard isDone={hojaFirmadaPorCliente}>
                  <StyledSignatureTitle>
                    {t`Firma cliente`}
                    <ParksStatusBadge
                      color={hojaFirmadaPorCliente ? 'green' : 'orange'}
                      label={hojaFirmadaPorCliente ? t`Firmada` : t`Pendiente`}
                    />
                  </StyledSignatureTitle>
                  <StyledSignatureMeta>
                    {t`El LO registra cuando el cliente ya firmó el documento.`}
                  </StyledSignatureMeta>
                  {!hojaFirmadaPorCliente ? (
                    <ParksActionButton
                      title={t`Registrar firma cliente`}
                      size="sm"
                      variant="secondary"
                      disabled={
                        isBusy ||
                        !hojaId ||
                        !canRegisterClientSignature ||
                        !hojaFirmadaPorCem
                      }
                      onClick={() => {
                        if (!hojaId) {
                          return;
                        }

                        void runAction(
                          async () => {
                            await persistHojaDraft();
                            const result = await signParksHojaAcuerdos(hojaId, {
                              opportunityId: opportunity.id,
                              firmadaPorCliente: true,
                              fechaFirma: new Date().toISOString().slice(0, 10),
                            });
                            applySignResult(result);
                          },
                          t`Hoja firmada · caso legal en camino`,
                        );
                      }}
                    />
                  ) : null}
                </StyledSignatureCard>
              </StyledSignatureGrid>
            </>
          )}
        </WorkflowSubsection>
      ) : null}

      {showSection('perdida') ? (
        <WorkflowSubsection
          title={t`Marcar como perdida`}
          icon={IconX}
          sectionId={PARKS_FLUJO_SECTION_IDS.perdida}
        >
          {' '}
          <StyledParksFieldGrid>
            <ParksFormField label={t`Motivo`} htmlFor="motivo-perdida">
              <StyledParksSelect
                id="motivo-perdida"
                value={motivoPerdida}
                onChange={(event) => setMotivoPerdida(event.target.value)}
              >
                <option value="Competencia">{t`Competencia`}</option>
                <option value="Pospuesto">{t`Pospuesto`}</option>
                <option value="Sin disponibilidad">{t`Sin disponibilidad`}</option>
                <option value="No calificado">{t`No calificado`}</option>
                <option value="Otro">{t`Otro`}</option>
              </StyledParksSelect>
            </ParksFormField>
            {motivoPerdida === 'Competencia' ? (
              <ParksFormField label={t`Competidor`} htmlFor="competidor">
                <StyledParksSelect
                  id="competidor"
                  value={competidor}
                  onChange={(event) => setCompetidor(event.target.value)}
                >
                  <option value="Prologis">Prologis</option>
                  <option value="Vesta">Vesta</option>
                  <option value="Finsa">Finsa</option>
                  <option value="Vynmsa">Vynmsa</option>
                  <option value="American Industries">
                    American Industries
                  </option>
                  <option value="Otro">Otro</option>
                </StyledParksSelect>
              </ParksFormField>
            ) : null}
            {motivoPerdida === 'Pospuesto' ? (
              <ParksFormField
                label={t`Fecha de reactivación`}
                htmlFor="fecha-reactivacion"
              >
                <StyledParksInput
                  id="fecha-reactivacion"
                  type="date"
                  value={fechaReactivacion}
                  onChange={(event) => setFechaReactivacion(event.target.value)}
                />
              </ParksFormField>
            ) : null}
          </StyledParksFieldGrid>
          <StyledActionsRow>
            <ParksActionButton
              title={t`Registrar pérdida`}
              size="sm"
              variant="secondary"
              disabled={isBusy}
              onClick={() => {
                void runAction(
                  async () => {
                    await markParksOpportunityLost({
                      opportunityId: opportunity.id,
                      motivoPerdida,
                      competidor:
                        motivoPerdida === 'Competencia'
                          ? competidor
                          : undefined,
                      fechaReactivacion:
                        motivoPerdida === 'Pospuesto'
                          ? fechaReactivacion
                          : undefined,
                      companyName,
                    });
                  },
                  t`Oportunidad marcada como perdida`,
                );
              }}
            />
          </StyledActionsRow>
        </WorkflowSubsection>
      ) : null}

      {statusMessage ? (
        <StyledResultBanner>{statusMessage}</StyledResultBanner>
      ) : null}
      {errorMessage ? (
        <StyledResultBanner isError>{errorMessage}</StyledResultBanner>
      ) : null}
    </ParksToolSection>
  );
};
