import { styled } from '@linaria/react';
import { t } from '@lingui/core/macro';
import { formatDistanceToNow, parseISO } from 'date-fns';
import { es } from 'date-fns/locale';
import { useState, useEffect, useMemo } from 'react';
import { Link } from 'react-router-dom';
import {
  IconArrowRight,
  IconBox,
  IconCalendar,
  IconCalendarEvent,
  IconCheck,
  IconClock,
  IconExternalLink,
  IconFileText,
  IconLayoutDashboard,
  IconMail,
  IconMessage,
  IconSend,
  IconSparkles,
  IconUser,
  IconUsers,
  IconX,
  type IconComponent,
} from 'twenty-ui/icon';
import {
  ParksActionBar,
  ParksActionButton,
} from '@/parks-industrial/components/ui/ParksActionButton';
import { MOBILE_VIEWPORT, themeCssVariables } from 'twenty-ui/theme-constants';
import { Tag } from 'twenty-ui/data-display';

import {
  getParksPipelineStageColor,
  getParksPipelineStageLabel,
  getNextParksPipelineStage,
} from '@/parks-industrial/constants/parks-industrial.constants';
import { getParksInquilino360Path } from '@/parks-industrial/constants/parks-routes.constants';
import { type ParksOpportunityRecord } from '@/parks-industrial/hooks/useParksRecords';
import { ParksActivityTimelinePanel } from '@/parks-industrial/components/pipeline/ParksActivityTimelinePanel';
import { ParksFirstContactPanel } from '@/parks-industrial/components/pipeline/ParksFirstContactPanel';
import { ParksAssignLeasingOfficerPanel } from '@/parks-industrial/components/pipeline/ParksAssignLeasingOfficerPanel';
import { ParksCommercialProposalSection } from '@/parks-industrial/components/pipeline/ParksCommercialProposalSection';
import { ParksCommercialWorkflowPanel } from '@/parks-industrial/components/pipeline/ParksCommercialWorkflowPanel';
import { ParksDealStageGuidePanel } from '@/parks-industrial/components/pipeline/ParksDealStageGuidePanel';
import { ParksDecisoresPanel } from '@/parks-industrial/components/pipeline/ParksDecisoresPanel';
import { ParksEmailSequencePanel } from '@/parks-industrial/components/pipeline/ParksEmailSequencePanel';
import { ParksPipelineDealStageStepper } from '@/parks-industrial/components/pipeline/ParksPipelineDealStageStepper';
import { ParksProspectEnrichmentPanel } from '@/parks-industrial/components/pipeline/ParksProspectEnrichmentPanel';
import { ParksSalesScriptPanel } from '@/parks-industrial/components/pipeline/ParksSalesScriptPanel';
import {
  ParksDetailField,
  ParksKpiTile,
} from '@/parks-industrial/components/ui/ParksDetailField';
import { ParksModalTabs } from '@/parks-industrial/components/ui/ParksModalTabs';
import { ParksStatusBadge } from '@/parks-industrial/components/ui/ParksStatusBadge';
import {
  formatParksDate,
  formatParksNumber,
  formatParksUsd,
  getParksAmountFromMicros,
  getParksDaysInStage,
  getParksDaysInStageColor,
  getParksOwnerInitials,
  getParksOwnerName,
  getParksPipelineStageTheme,
} from '@/parks-industrial/utils/parks-format.util';
import {
  formatParksTourNavesLabel,
  parseParksTourNavesMostradas,
} from '@/parks-industrial/utils/parks-tour-naves.util';
import {
  buildParksDealStageGuide,
  type ParksDealGuideTab,
} from '@/parks-industrial/utils/parks-stage-guide.util';
import { useOpenRecordInSidePanel } from '@/side-panel/hooks/useOpenRecordInSidePanel';

const StyledPanel = styled.div`
  display: flex;
  flex: 1;
  flex-direction: column;
  min-height: 0;
  overflow: hidden;
`;

const StyledHeroBand = styled.div<{ accentColor: string }>`
  background: linear-gradient(
    160deg,
    ${({ accentColor }) => accentColor}22 0%,
    ${themeCssVariables.background.primary} 72%
  );
  border-bottom: 1px solid ${themeCssVariables.border.color.light};
  padding: ${themeCssVariables.spacing[4]};

  @media (max-width: ${MOBILE_VIEWPORT}px) {
    padding: ${themeCssVariables.spacing[3]};
  }
`;

const StyledHeroTop = styled.div`
  align-items: flex-start;
  display: flex;
  gap: ${themeCssVariables.spacing[3]};
  justify-content: space-between;
`;

const StyledHeroMain = styled.div`
  display: flex;
  flex: 1;
  flex-direction: column;
  gap: ${themeCssVariables.spacing[2]};
  min-width: 0;
`;

const StyledPanelTitle = styled.h3`
  font-size: ${themeCssVariables.font.size.lg};
  font-weight: ${themeCssVariables.font.weight.semiBold};
  letter-spacing: -0.01em;
  line-height: 1.25;
  margin: 0;
`;

const StyledCompanyRow = styled.div`
  align-items: center;
  display: flex;
  flex-wrap: wrap;
  gap: ${themeCssVariables.spacing[2]};
`;

const StyledCompanyName = styled.span`
  color: ${themeCssVariables.font.color.secondary};
  font-size: ${themeCssVariables.font.size.sm};
`;

const StyledAccountLink = styled(Link)`
  color: ${themeCssVariables.color.blue};
  font-size: ${themeCssVariables.font.size.xs};
  font-weight: ${themeCssVariables.font.weight.medium};
  text-decoration: none;

  &:hover {
    text-decoration: underline;
  }
`;

const StyledKpiStrip = styled.div`
  display: grid;
  gap: ${themeCssVariables.spacing[2]};
  grid-template-columns: repeat(4, minmax(0, 1fr));
  margin-top: ${themeCssVariables.spacing[4]};

  @media (max-width: ${MOBILE_VIEWPORT}px) {
    grid-template-columns: repeat(2, minmax(0, 1fr));
  }
`;

const StyledDealBody = styled.div`
  display: flex;
  flex: 1;
  flex-direction: column;
  min-height: 0;
  overflow: hidden;
`;

const StyledGuideWrapper = styled.div`
  flex-shrink: 0;
`;

const StyledTabStack = styled.div`
  display: flex;
  flex-direction: column;
  gap: ${themeCssVariables.spacing[3]};
`;

const StyledResumenCard = styled.div`
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
  padding: ${themeCssVariables.spacing[1]};
`;

type DealDetailTab =
  | 'resumen'
  | 'prospecto'
  | 'propuesta'
  | 'actividad'
  | 'decisores'
  | 'guion'
  | 'cotizacion'
  | 'aprobacion'
  | 'hoja';

const SCROLLABLE_DEAL_TABS: DealDetailTab[] = [
  'cotizacion',
  'aprobacion',
  'hoja',
];

const StyledContextGrid = styled.div`
  display: grid;
  gap: ${themeCssVariables.spacing[2]};
  grid-template-columns: repeat(2, minmax(0, 1fr));

  @media (max-width: ${MOBILE_VIEWPORT}px) {
    grid-template-columns: 1fr;
  }
`;

const StyledOwnerRow = styled.div`
  align-items: center;
  background: linear-gradient(
    135deg,
    ${themeCssVariables.background.secondary} 0%,
    ${themeCssVariables.background.primary} 100%
  );
  border: 1px solid ${themeCssVariables.border.color.light};
  border-radius: ${themeCssVariables.border.radius.md};
  box-shadow: ${themeCssVariables.boxShadow.light};
  display: flex;
  gap: ${themeCssVariables.spacing[3]};
  padding: ${themeCssVariables.spacing[3]};
`;

const StyledOwnerAvatar = styled.div<{ avatarColor: string }>`
  align-items: center;
  background: ${({ avatarColor }) => avatarColor};
  border-radius: 50%;
  box-shadow: 0 0 0 3px ${({ avatarColor }) => `${avatarColor}33`};
  color: ${themeCssVariables.font.color.inverted};
  display: flex;
  flex-shrink: 0;
  font-size: ${themeCssVariables.font.size.sm};
  font-weight: ${themeCssVariables.font.weight.semiBold};
  height: 40px;
  justify-content: center;
  width: 40px;
`;

const StyledOwnerText = styled.div`
  display: flex;
  flex: 1;
  flex-direction: column;
  gap: 2px;
  min-width: 0;
`;

const StyledOwnerName = styled.span`
  font-size: ${themeCssVariables.font.size.sm};
  font-weight: ${themeCssVariables.font.weight.semiBold};
`;

const StyledOwnerRole = styled.span`
  color: ${themeCssVariables.font.color.tertiary};
  font-size: ${themeCssVariables.font.size.xs};
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

type ParksPipelineDealDetailProps = {
  deal: ParksOpportunityRecord;
  onClose: () => void;
  onMoveToStage?: (dealId: string, stageId: string) => void;
  onDealUpdated?: (
    dealId: string,
    update: Partial<ParksOpportunityRecord>,
  ) => void;
  initialTab?: ParksDealGuideTab;
  initialScrollTarget?: string;
};

export const ParksPipelineDealDetail = ({
  deal,
  onClose,
  onMoveToStage,
  onDealUpdated,
  initialTab,
  initialScrollTarget,
}: ParksPipelineDealDetailProps) => {
  const { openRecordInSidePanel } = useOpenRecordInSidePanel();
  const stageColor = getParksPipelineStageColor(deal.stage);
  const stageTheme = getParksPipelineStageTheme(stageColor);
  const nextStage = getNextParksPipelineStage(deal.stage);
  const daysInStage = getParksDaysInStage(deal.updatedAt);
  const daysColor = getParksDaysInStageColor(deal.updatedAt);
  const ownerName = getParksOwnerName(deal);
  const companyName =
    deal.inquilinoVinculado?.empresa ?? deal.name ?? t`Nuevo prospecto`;
  const [selectedTourDecisorIds, setSelectedTourDecisorIds] = useState<
    string[]
  >([]);
  const [activeTab, setActiveTab] = useState<DealDetailTab>('resumen');
  const [pendingScrollTarget, setPendingScrollTarget] = useState<string | null>(
    null,
  );

  const stageGuide = useMemo(() => buildParksDealStageGuide(deal), [deal]);

  const dealTabs = useMemo(() => {
    const tabs: Array<{
      id: DealDetailTab;
      label: string;
      icon: IconComponent;
      description: string;
    }> = [
      {
        id: 'resumen',
        label: t`Resumen`,
        icon: IconLayoutDashboard,
        description: t`Contexto operativo del deal, nave vinculada y responsable comercial.`,
      },
      // Kept visible across every stage (not just Lead recibido) so the AI
      // read on this prospect can always be revisited, not just at intake.
      {
        id: 'prospecto',
        label: t`Análisis IA`,
        icon: IconSparkles,
        description: t`Análisis inteligente de prospecto: enriquecimiento IA y secuencia de correos para calificar al lead. Disponible en cualquier etapa.`,
      },
      {
        id: 'actividad',
        label: t`Actividad`,
        icon: IconMail,
        description: t`Registra el primer contacto (llamada, videollamada o reunión) y consulta el timeline unificado de emails, llamadas y tareas (Gmail + CRM).`,
      },
      {
        id: 'propuesta',
        label: t`Propuesta`,
        icon: IconFileText,
        description: t`Elegir naves y agendar la visita.`,
      },
      {
        id: 'decisores',
        label: t`Decisores`,
        icon: IconUsers,
        description: t`Contactos clave del cliente que participan en la decisión de arrendamiento.`,
      },
      {
        id: 'guion',
        label: t`Guion`,
        icon: IconMessage,
        description: t`Guion de visita alineado a la nave y al perfil del prospecto.`,
      },
      {
        id: 'cotizacion',
        label: t`Cotización`,
        icon: IconSend,
        description: t`Feedback del tour, precios y envío de cotización.`,
      },
      {
        id: 'aprobacion',
        label: t`Aprobación`,
        icon: IconCheck,
        description: t`Solicitud y resolución de condiciones especiales.`,
      },
      {
        id: 'hoja',
        label: t`Hoja`,
        icon: IconCalendarEvent,
        description: t`Hoja de Acuerdos (LOI), firmas y cierre comercial.`,
      },
    ];

    return tabs;
  }, []);

  useEffect(() => {
    setSelectedTourDecisorIds([]);

    const recommendedTab = initialTab ?? stageGuide.recommendedTab;
    const hasRecommendedTab = dealTabs.some((tab) => tab.id === recommendedTab);

    setActiveTab(hasRecommendedTab ? recommendedTab : 'resumen');

    if (initialScrollTarget) {
      setPendingScrollTarget(initialScrollTarget);
    }
  }, [
    deal.id,
    deal.stage,
    dealTabs,
    initialScrollTarget,
    initialTab,
    stageGuide.recommendedTab,
  ]);

  useEffect(() => {
    if (!dealTabs.some((tab) => tab.id === activeTab)) {
      setActiveTab('resumen');
    }
  }, [activeTab, dealTabs]);

  useEffect(() => {
    if (!pendingScrollTarget) {
      return;
    }

    if (!SCROLLABLE_DEAL_TABS.includes(activeTab)) {
      return;
    }

    const timeoutId = window.setTimeout(() => {
      document.getElementById(pendingScrollTarget)?.scrollIntoView({
        behavior: 'smooth',
        block: 'start',
      });
      setPendingScrollTarget(null);
    }, 100);

    return () => window.clearTimeout(timeoutId);
  }, [activeTab, pendingScrollTarget]);

  const updatedAgo = deal.updatedAt
    ? formatDistanceToNow(parseISO(deal.updatedAt), {
        addSuffix: true,
        locale: es,
      })
    : null;

  const handleOpenFullRecord = () => {
    openRecordInSidePanel({
      recordId: deal.id,
      objectNameSingular: 'opportunity',
      resetNavigationStack: true,
    });
  };

  return (
    <StyledPanel>
      <StyledHeroBand accentColor={stageTheme.accent}>
        <StyledHeroTop>
          <StyledHeroMain>
            <StyledPanelTitle id="parks-deal-detail-title">
              {deal.name}
            </StyledPanelTitle>
            <StyledCompanyRow>
              {deal.folio ? (
                <Tag
                  color="gray"
                  text={deal.folio}
                  variant="solid"
                  weight="medium"
                />
              ) : null}
              <Tag
                color={stageColor}
                text={getParksPipelineStageLabel(deal.stage)}
                variant="solid"
                weight="medium"
              />
              <StyledCompanyName>{companyName}</StyledCompanyName>
              {deal.inquilinoVinculado?.id ? (
                <StyledAccountLink
                  to={getParksInquilino360Path(deal.inquilinoVinculado.id)}
                >
                  {t`Ver cuenta 360 →`}
                </StyledAccountLink>
              ) : null}
            </StyledCompanyRow>
          </StyledHeroMain>
          <StyledCloseButton
            type="button"
            onClick={onClose}
            aria-label={t`Cerrar detalle`}
          >
            <IconX size={16} />
          </StyledCloseButton>
        </StyledHeroTop>

        <StyledKpiStrip>
          <ParksKpiTile
            label={t`Valor`}
            value={formatParksUsd(
              getParksAmountFromMicros(deal.amount?.amountMicros),
            )}
            accent="blue"
          />
          <ParksKpiTile
            label={t`Espacio`}
            value={`${formatParksNumber(deal.m2Requeridos)} m²`}
            accent="purple"
          />
          <ParksKpiTile
            label={t`En etapa`}
            value={t`${daysInStage} días`}
            accent="yellow"
          />
          <ParksKpiTile
            label={t`Responsable`}
            value={ownerName}
            accent="default"
          />
        </StyledKpiStrip>
      </StyledHeroBand>

      <ParksPipelineDealStageStepper
        currentStageId={deal.stage}
        onSelectStage={(stageId) => onMoveToStage?.(deal.id, stageId)}
      />

      <div
        style={{
          margin: '12px 16px 0',
        }}
      >
        <ParksAssignLeasingOfficerPanel
          deal={deal}
          onAssigned={onDealUpdated}
        />
      </div>

      <StyledDealBody>
        <StyledGuideWrapper>
          <ParksDealStageGuidePanel
            guide={stageGuide}
            onOpenTab={(tab: ParksDealGuideTab, scrollTarget?: string) => {
              setActiveTab(tab as DealDetailTab);

              if (scrollTarget) {
                setPendingScrollTarget(scrollTarget);
              }
            }}
            onAdvanceStage={(nextStageId) =>
              onMoveToStage?.(deal.id, nextStageId)
            }
          />
        </StyledGuideWrapper>

        <ParksModalTabs
        tabs={dealTabs}
        activeTab={activeTab}
        onTabChange={setActiveTab}
        ariaLabel={t`Secciones del deal`}
      >
        {activeTab === 'resumen' ? (
          <StyledTabStack>
            <StyledResumenCard>
              <StyledContextGrid>
              <ParksDetailField
                label={t`Nave`}
                icon={IconBox}
                accent="blue"
                value={
                  deal.tourNavesMostradas
                    ? formatParksTourNavesLabel(
                        parseParksTourNavesMostradas(deal.tourNavesMostradas),
                      ) ||
                      (deal.naveVinculada?.identificador ??
                        t`Sin nave asignada`)
                    : (deal.naveVinculada?.identificador ??
                      t`Sin nave asignada`)
                }
              />
              <ParksDetailField
                label={t`Seguimiento`}
                icon={IconClock}
                accent="yellow"
                value={
                  <ParksStatusBadge
                    color={daysColor}
                    label={t`${daysInStage} días en etapa`}
                  />
                }
              />
              {updatedAgo ? (
                <ParksDetailField
                  label={t`Última actividad`}
                  icon={IconCalendar}
                  value={updatedAgo}
                />
              ) : null}
              {deal.createdAt ? (
                <ParksDetailField
                  label={t`Creado`}
                  icon={IconUser}
                  value={formatParksDate(deal.createdAt)}
                />
              ) : null}
            </StyledContextGrid>
            </StyledResumenCard>
            <StyledOwnerRow>
              <StyledOwnerAvatar avatarColor={stageTheme.accent}>
                {getParksOwnerInitials(deal)}
              </StyledOwnerAvatar>
              <StyledOwnerText>
                <StyledOwnerName>{ownerName}</StyledOwnerName>
                <StyledOwnerRole>{t`Responsable comercial`}</StyledOwnerRole>
              </StyledOwnerText>
            </StyledOwnerRow>
          </StyledTabStack>
        ) : null}

        {activeTab === 'prospecto' ? (
          <StyledTabStack>
            <ParksProspectEnrichmentPanel
              opportunityId={deal.id}
              companyName={companyName}
              m2Requeridos={deal.m2Requeridos}
              embedded
            />
            <ParksEmailSequencePanel
              opportunityId={deal.id}
              companyName={companyName}
            />
          </StyledTabStack>
        ) : null}

        {activeTab === 'propuesta' ? (
          <ParksCommercialProposalSection
            opportunityId={deal.id}
            companyName={companyName}
            m2Requeridos={deal.m2Requeridos}
            inquilinoId={deal.inquilinoVinculado?.id}
            linkedNaveId={deal.naveVinculada?.id ?? deal.naveVinculadaId}
            linkedNaveIdentificador={deal.naveVinculada?.identificador}
            tourNavesMostradas={deal.tourNavesMostradas}
            tourFecha={deal.tourFecha}
            onNaveLinked={(update) => onDealUpdated?.(deal.id, update)}
            onTourScheduled={(update) => onDealUpdated?.(deal.id, update)}
          />
        ) : null}

        {activeTab === 'actividad' ? (
          <StyledTabStack>
            <ParksFirstContactPanel
              opportunityId={deal.id}
              companyName={companyName}
              deal={deal}
              onContactRegistered={(update) => onDealUpdated?.(deal.id, update)}
            />
            <ParksActivityTimelinePanel opportunityId={deal.id} embedded />
          </StyledTabStack>
        ) : null}

        {activeTab === 'decisores' ? (
          <ParksDecisoresPanel
            opportunityId={deal.id}
            inquilinoId={deal.inquilinoVinculado?.id}
            showTourAttendance
            selectedTourDecisorIds={selectedTourDecisorIds}
            onTourSelectionChange={setSelectedTourDecisorIds}
            embedded
          />
        ) : null}

        {activeTab === 'guion' ? (
          <ParksSalesScriptPanel
            opportunityId={deal.id}
            companyName={companyName}
            m2Requeridos={deal.m2Requeridos}
            naveDestacada={deal.naveVinculada?.identificador}
            embedded
          />
        ) : null}

        {activeTab === 'cotizacion' ? (
          <ParksCommercialWorkflowPanel
            opportunity={deal}
            attendedDecisorIds={selectedTourDecisorIds}
            embedded
            sections={['tour', 'cotizacion']}
            title={t`Cotización`}
            hint={t`Registra el tour y arma o envía la cotización formal.`}
            onDealUpdated={(update) => onDealUpdated?.(deal.id, update)}
          />
        ) : null}

        {activeTab === 'aprobacion' ? (
          <ParksCommercialWorkflowPanel
            opportunity={deal}
            embedded
            sections={['aprobacion']}
            title={t`Aprobación`}
            hint={t`Solicita o resuelve condiciones especiales que requieren OK de Director Comercial/CEO.`}
            onDealUpdated={(update) => onDealUpdated?.(deal.id, update)}
          />
        ) : null}

        {activeTab === 'hoja' ? (
          <ParksCommercialWorkflowPanel
            opportunity={deal}
            embedded
            sections={['hoja', 'perdida']}
            title={t`Hoja de Acuerdos`}
            hint={t`Genera el borrador, firma con Director Comercial y cliente, o marca el deal como perdido.`}
            onDealUpdated={(update) => onDealUpdated?.(deal.id, update)}
          />
        ) : null}
      </ParksModalTabs>
      </StyledDealBody>

      <ParksActionBar
        hint={
          nextStage
            ? t`Siguiente etapa recomendada: ${getParksPipelineStageLabel(nextStage)}`
            : t`Revisa Hoja para cerrar el acuerdo comercial`
        }
      >
        {nextStage && onMoveToStage ? (
          <ParksActionButton
            variant="secondary"
            title={t`Avanzar etapa`}
            Icon={IconArrowRight}
            iconPosition="right"
            onClick={() => onMoveToStage(deal.id, nextStage)}
          />
        ) : null}
        <ParksActionButton
          variant="primary"
          title={t`Abrir registro`}
          Icon={IconExternalLink}
          iconPosition="right"
          onClick={handleOpenFullRecord}
        />
      </ParksActionBar>
    </StyledPanel>
  );
};
