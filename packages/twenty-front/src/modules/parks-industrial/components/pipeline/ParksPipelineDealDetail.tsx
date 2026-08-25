import { styled } from '@linaria/react';
import { t } from '@lingui/core/macro';
import { formatDistanceToNow, parseISO } from 'date-fns';
import { es } from 'date-fns/locale';
import { useEffect, useMemo, useState } from 'react';
import { Link } from 'react-router-dom';
import {
  IconArrowRight,
  IconBox,
  IconCalendar,
  IconCalendarEvent,
  IconClock,
  IconExternalLink,
  IconFileText,
  IconLayoutDashboard,
  IconMail,
  IconSend,
  IconSparkles,
  IconUser,
  IconX,
  type IconComponent,
} from 'twenty-ui/icon';
import { MOBILE_VIEWPORT, themeCssVariables } from 'twenty-ui/theme-constants';

import { ParksActivityTimelinePanel } from '@/parks-industrial/components/pipeline/ParksActivityTimelinePanel';
import { ParksAssignLeasingOfficerPanel } from '@/parks-industrial/components/pipeline/ParksAssignLeasingOfficerPanel';
import { ParksCommercialProposalSection } from '@/parks-industrial/components/pipeline/ParksCommercialProposalSection';
import { ParksCommercialWorkflowPanel } from '@/parks-industrial/components/pipeline/ParksCommercialWorkflowPanel';
import {
  ParksDealStageGuideChecklist,
  ParksDealStageGuidePanel,
} from '@/parks-industrial/components/pipeline/ParksDealStageGuidePanel';
import { ParksDecisoresPanel } from '@/parks-industrial/components/pipeline/ParksDecisoresPanel';
import { ParksEmailSequencePanel } from '@/parks-industrial/components/pipeline/ParksEmailSequencePanel';
import { ParksFirstContactPanel } from '@/parks-industrial/components/pipeline/ParksFirstContactPanel';
import { ParksPipelineDealStageStepper } from '@/parks-industrial/components/pipeline/ParksPipelineDealStageStepper';
import { ParksProspectEnrichmentPanel } from '@/parks-industrial/components/pipeline/ParksProspectEnrichmentPanel';
import { ParksSalesScriptPanel } from '@/parks-industrial/components/pipeline/ParksSalesScriptPanel';
import {
  ParksActionBar,
  ParksActionButton,
} from '@/parks-industrial/components/ui/ParksActionButton';
import { ParksDetailField } from '@/parks-industrial/components/ui/ParksDetailField';
import { ParksModalTabs } from '@/parks-industrial/components/ui/ParksModalTabs';
import { ParksStatusBadge } from '@/parks-industrial/components/ui/ParksStatusBadge';
import {
  getNextParksPipelineStage,
  getParksPipelineStageColor,
  getParksPipelineStageLabel,
} from '@/parks-industrial/constants/parks-industrial.constants';
import { getParksInquilino360Path } from '@/parks-industrial/constants/parks-routes.constants';
import {
  PARKS_BRAND,
  PARKS_VIBE,
  PARKS_VISUAL_THEME,
  type ParksVisualAccent,
} from '@/parks-industrial/constants/parks-theme.constants';
import { type ParksOpportunityRecord } from '@/parks-industrial/hooks/useParksRecords';
import {
  formatParksDate,
  formatParksNumber,
  formatParksUsd,
  getParksAmountFromMicros,
  getParksAssignedLeasingOfficerName,
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
  background: ${PARKS_VIBE.surface};
  display: flex;
  flex: 1;
  flex-direction: column;
  font-family: ${PARKS_VIBE.fontFamily};
  min-height: 0;
  overflow: hidden;
`;

const StyledHeroBand = styled.div<{ accentColor: string }>`
  background: linear-gradient(
    145deg,
    #ffffff 0%,
    ${PARKS_VIBE.surfaceMuted} 48%,
    ${({ accentColor }) => `${accentColor}12`} 100%
  );
  border-bottom: 1px solid ${PARKS_VIBE.border};
  padding: ${PARKS_VIBE.space.md} ${PARKS_VIBE.space.lg}
    ${PARKS_VIBE.space.md} calc(${PARKS_VIBE.space.lg} + 3px);
  position: relative;

  &::before {
    background: ${({ accentColor }) => accentColor};
    bottom: 0;
    content: '';
    left: 0;
    position: absolute;
    top: 0;
    width: 3px;
  }

  @media (max-width: ${MOBILE_VIEWPORT}px) {
    padding: ${PARKS_VIBE.space.sm} ${PARKS_VIBE.space.md}
      ${PARKS_VIBE.space.sm} calc(${PARKS_VIBE.space.md} + 3px);
  }
`;

const StyledHeroTop = styled.div`
  align-items: flex-start;
  display: flex;
  gap: ${PARKS_VIBE.space.md};
  justify-content: space-between;
`;

const StyledHeroMain = styled.div`
  display: flex;
  flex: 1;
  flex-direction: column;
  gap: 8px;
  min-width: 0;
`;

const StyledBadgeRow = styled.div`
  align-items: center;
  display: flex;
  flex-wrap: wrap;
  gap: 6px;
`;

const StyledFolioBadge = styled.span`
  background: rgba(50, 51, 56, 0.06);
  border: 1px solid ${PARKS_VIBE.border};
  border-radius: ${PARKS_VIBE.chipRadius};
  color: ${PARKS_VIBE.textSecondary};
  font-family: ${PARKS_VIBE.fontFamily};
  font-size: 11px;
  font-weight: ${themeCssVariables.font.weight.medium};
  letter-spacing: 0.02em;
  padding: 3px 7px;
`;

const StyledStageBadge = styled.span<{ accentColor: string }>`
  background: ${({ accentColor }) => `${accentColor}18`};
  border: 1px solid ${({ accentColor }) => `${accentColor}40`};
  border-radius: ${PARKS_VIBE.chipRadius};
  color: ${({ accentColor }) => accentColor};
  font-family: ${PARKS_VIBE.fontFamily};
  font-size: 11px;
  font-weight: ${themeCssVariables.font.weight.semiBold};
  padding: 3px 8px;
`;

const StyledPanelTitle = styled.h3`
  color: ${PARKS_VIBE.textPrimary};
  font-family: ${PARKS_VIBE.fontFamily};
  font-size: 1.25rem;
  font-weight: ${themeCssVariables.font.weight.semiBold};
  letter-spacing: -0.025em;
  line-height: 1.2;
  margin: 0;
`;

const StyledSubtitleRow = styled.div`
  align-items: center;
  display: flex;
  flex-wrap: wrap;
  gap: ${PARKS_VIBE.space.sm};
`;

const StyledCompanyName = styled.span`
  color: ${PARKS_VIBE.textSecondary};
  font-size: ${themeCssVariables.font.size.sm};
  font-weight: ${themeCssVariables.font.weight.medium};
`;

const StyledAccountLink = styled(Link)`
  color: ${PARKS_BRAND.primary};
  font-size: ${themeCssVariables.font.size.xs};
  font-weight: ${themeCssVariables.font.weight.semiBold};
  text-decoration: none;

  &:hover {
    text-decoration: underline;
  }
`;

const StyledStatsBar = styled.div`
  background: rgba(255, 255, 255, 0.82);
  border: 1px solid ${PARKS_VIBE.border};
  border-radius: ${PARKS_VIBE.radiusMd};
  box-shadow: ${PARKS_VIBE.shadowSoft};
  display: grid;
  gap: 0;
  grid-template-columns: repeat(4, minmax(0, 1fr));
  margin-top: ${PARKS_VIBE.space.sm};
  overflow: hidden;

  @media (max-width: ${MOBILE_VIEWPORT}px) {
    grid-template-columns: repeat(2, minmax(0, 1fr));
  }
`;

const StyledStatCell = styled.div<{ tone?: ParksVisualAccent }>`
  display: flex;
  flex-direction: column;
  gap: 2px;
  min-width: 0;
  padding: 10px 12px;
  position: relative;

  &:not(:last-child)::after {
    background: ${PARKS_VIBE.border};
    bottom: 10px;
    content: '';
    position: absolute;
    right: 0;
    top: 10px;
    width: 1px;
  }

  @media (max-width: ${MOBILE_VIEWPORT}px) {
    &:nth-child(2n)::after {
      display: none;
    }

    &:nth-child(-n + 2) {
      border-bottom: 1px solid ${PARKS_VIBE.border};
    }
  }
`;

const StyledStatLabel = styled.span`
  color: ${PARKS_VIBE.textMuted};
  font-family: ${PARKS_VIBE.fontFamily};
  font-size: 10px;
  font-weight: ${themeCssVariables.font.weight.semiBold};
  letter-spacing: 0.05em;
  text-transform: uppercase;
`;

const StyledStatValue = styled.span<{ tone?: ParksVisualAccent }>`
  color: ${({ tone }) =>
    tone
      ? PARKS_VISUAL_THEME.accents[tone].accent
      : PARKS_VIBE.textPrimary};
  font-family: ${PARKS_VIBE.fontFamily};
  font-size: ${themeCssVariables.font.size.sm};
  font-weight: ${themeCssVariables.font.weight.semiBold};
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
`;

const StyledDealBody = styled.div`
  display: flex;
  flex: 1;
  flex-direction: column;
  min-height: 0;
  overflow: hidden;
`;

const StyledGuideWrapper = styled.div`
  background: ${PARKS_VIBE.surfaceMuted};
  border-bottom: 1px solid ${PARKS_VIBE.border};
  flex-shrink: 0;
  padding: ${PARKS_VIBE.space.sm} ${PARKS_VIBE.space.lg};
`;

const StyledTabStack = styled.div`
  display: flex;
  flex-direction: column;
  gap: ${PARKS_VIBE.space.md};
`;

const StyledSectionTitle = styled.h4`
  color: ${PARKS_VIBE.textMuted};
  font-family: ${PARKS_VIBE.fontFamily};
  font-size: 11px;
  font-weight: ${themeCssVariables.font.weight.semiBold};
  letter-spacing: 0.06em;
  margin: ${PARKS_VIBE.space.sm} 0 0;
  text-transform: uppercase;
`;

const StyledResumenCard = styled.div`
  background: linear-gradient(
    160deg,
    ${PARKS_VIBE.surface} 0%,
    ${PARKS_VIBE.surfaceMuted} 100%
  );
  border: 1px solid ${PARKS_VIBE.border};
  border-radius: ${PARKS_VIBE.radiusMd};
  box-shadow: ${PARKS_VIBE.shadowSoft};
  display: flex;
  flex-direction: column;
  gap: ${PARKS_VIBE.space.md};
  padding: ${PARKS_VIBE.space.sm};
`;

type DealDetailTab =
  | 'contexto'
  | 'calificar'
  | 'visita'
  | 'negociar'
  | 'cerrar'
  | 'actividad';

const GUIDE_TAB_TO_DETAIL_TAB: Record<ParksDealGuideTab, DealDetailTab> = {
  resumen: 'contexto',
  prospecto: 'calificar',
  actividad: 'actividad',
  propuesta: 'visita',
  decisores: 'visita',
  guion: 'visita',
  cotizacion: 'negociar',
  aprobacion: 'negociar',
  hoja: 'cerrar',
};

const SCROLLABLE_DEAL_TABS: DealDetailTab[] = ['negociar', 'cerrar'];

const StyledContextGrid = styled.div`
  display: grid;
  gap: ${PARKS_VIBE.space.sm};
  grid-template-columns: repeat(2, minmax(0, 1fr));

  @media (max-width: ${MOBILE_VIEWPORT}px) {
    grid-template-columns: 1fr;
  }
`;

const StyledOwnerRow = styled.div`
  align-items: center;
  background: linear-gradient(
    135deg,
    ${PARKS_VIBE.surface} 0%,
    ${PARKS_VIBE.surfaceMuted} 100%
  );
  border: 1px solid ${PARKS_VIBE.border};
  border-radius: ${PARKS_VIBE.radiusMd};
  box-shadow: ${PARKS_VIBE.shadowSoft};
  display: flex;
  gap: ${PARKS_VIBE.space.md};
  padding: ${PARKS_VIBE.space.md};
`;

const StyledOwnerAvatar = styled.div<{ avatarColor: string }>`
  align-items: center;
  background: ${({ avatarColor }) => avatarColor};
  border-radius: 50%;
  box-shadow: 0 0 0 3px ${({ avatarColor }) => `${avatarColor}28`};
  color: #ffffff;
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
  color: ${PARKS_VIBE.textPrimary};
  font-size: ${themeCssVariables.font.size.sm};
  font-weight: ${themeCssVariables.font.weight.semiBold};
`;

const StyledOwnerRole = styled.span`
  color: ${PARKS_VIBE.textMuted};
  font-size: ${themeCssVariables.font.size.xs};
`;

const StyledCloseButton = styled.button`
  align-items: center;
  background: rgba(255, 255, 255, 0.9);
  border: 1px solid ${PARKS_VIBE.border};
  border-radius: 50%;
  box-shadow: ${PARKS_VIBE.shadowSoft};
  color: ${PARKS_VIBE.textSecondary};
  cursor: pointer;
  display: flex;
  flex-shrink: 0;
  height: 32px;
  justify-content: center;
  transition:
    background 0.15s ease,
    color 0.15s ease,
    border-color 0.15s ease;
  width: 32px;

  &:hover {
    background: ${PARKS_BRAND.primarySoft};
    border-color: ${PARKS_BRAND.borderSoft};
    color: ${PARKS_BRAND.primary};
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
  const stageTheme = getParksPipelineStageTheme(
    getParksPipelineStageColor(deal.stage),
  );
  const nextStage = getNextParksPipelineStage(deal.stage);
  const daysInStage = getParksDaysInStage(deal.updatedAt);
  const daysColor = getParksDaysInStageColor(deal.updatedAt);
  const ownerName = getParksOwnerName(deal);
  const leasingOfficerName = getParksAssignedLeasingOfficerName(deal);
  const companyName =
    deal.inquilinoVinculado?.empresa ?? deal.name ?? t`Nuevo prospecto`;
  const amountLabel = formatParksUsd(
    getParksAmountFromMicros(deal.amount?.amountMicros),
  );
  const spaceLabel = `${formatParksNumber(deal.m2Requeridos)} m²`;
  const daysLabel = t`${daysInStage} días`;
  const responsibleLabel = leasingOfficerName ?? ownerName;
  const [selectedTourDecisorIds, setSelectedTourDecisorIds] = useState<
    string[]
  >([]);
  const [activeTab, setActiveTab] = useState<DealDetailTab>('contexto');
  const [pendingScrollTarget, setPendingScrollTarget] = useState<string | null>(
    null,
  );

  const stageGuide = useMemo(() => buildParksDealStageGuide(deal), [deal]);
  const checklistBelongsInCalificar =
    GUIDE_TAB_TO_DETAIL_TAB[stageGuide.recommendedTab] === 'calificar';

  const dealTabs = useMemo(() => {
    const recommendedDetailTab =
      GUIDE_TAB_TO_DETAIL_TAB[stageGuide.recommendedTab];
    const workflowOrder: DealDetailTab[] = [
      'contexto',
      'calificar',
      'visita',
      'negociar',
      'cerrar',
    ];

    const tabs: Array<{
      id: DealDetailTab;
      label: string;
      icon: IconComponent;
      stepIndex?: number;
      isComplete?: boolean;
    }> = [
      {
        id: 'contexto',
        label: t`Contexto`,
        icon: IconLayoutDashboard,
        stepIndex: 1,
      },
      {
        id: 'calificar',
        label: t`Calificar`,
        icon: IconSparkles,
        stepIndex: 2,
      },
      {
        id: 'visita',
        label: t`Visita`,
        icon: IconFileText,
        stepIndex: 3,
      },
      {
        id: 'negociar',
        label: t`Negociar`,
        icon: IconSend,
        stepIndex: 4,
      },
      {
        id: 'cerrar',
        label: t`Cerrar`,
        icon: IconCalendarEvent,
        stepIndex: 5,
      },
      {
        id: 'actividad',
        label: t`Historial`,
        icon: IconMail,
      },
    ];

    return tabs.map((tab) => {
      const recommendedIndex = workflowOrder.indexOf(recommendedDetailTab);
      const tabIndex = workflowOrder.indexOf(tab.id);

      return {
        ...tab,
        isComplete:
          tab.stepIndex !== undefined &&
          recommendedIndex > -1 &&
          tabIndex > -1 &&
          tabIndex < recommendedIndex,
      };
    });
  }, [stageGuide.recommendedTab]);

  useEffect(() => {
    setSelectedTourDecisorIds([]);

    const recommendedTab =
      GUIDE_TAB_TO_DETAIL_TAB[initialTab ?? stageGuide.recommendedTab];
    const hasRecommendedTab = dealTabs.some((tab) => tab.id === recommendedTab);

    setActiveTab(hasRecommendedTab ? recommendedTab : 'contexto');

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
      setActiveTab('contexto');
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
            <StyledBadgeRow>
              {deal.folio ? (
                <StyledFolioBadge>{deal.folio}</StyledFolioBadge>
              ) : null}
              <StyledStageBadge accentColor={stageTheme.accent}>
                {getParksPipelineStageLabel(deal.stage)}
              </StyledStageBadge>
            </StyledBadgeRow>
            <StyledPanelTitle id="parks-deal-detail-title">
              {deal.name}
            </StyledPanelTitle>
            <StyledSubtitleRow>
              <StyledCompanyName>{companyName}</StyledCompanyName>
              {deal.inquilinoVinculado?.id ? (
                <StyledAccountLink
                  to={getParksInquilino360Path(deal.inquilinoVinculado.id)}
                >
                  {t`Ver cuenta 360 →`}
                </StyledAccountLink>
              ) : null}
            </StyledSubtitleRow>
          </StyledHeroMain>
          <StyledCloseButton
            type="button"
            onClick={onClose}
            aria-label={t`Cerrar detalle`}
          >
            <IconX size={16} />
          </StyledCloseButton>
        </StyledHeroTop>

        <StyledStatsBar>
          <StyledStatCell>
            <StyledStatLabel>{t`Valor`}</StyledStatLabel>
            <StyledStatValue>{amountLabel}</StyledStatValue>
          </StyledStatCell>
          <StyledStatCell>
            <StyledStatLabel>{t`Espacio`}</StyledStatLabel>
            <StyledStatValue>{spaceLabel}</StyledStatValue>
          </StyledStatCell>
          <StyledStatCell tone={daysColor}>
            <StyledStatLabel>{t`En etapa`}</StyledStatLabel>
            <StyledStatValue tone={daysColor}>{daysLabel}</StyledStatValue>
          </StyledStatCell>
          <StyledStatCell>
            <StyledStatLabel>
              {leasingOfficerName ? t`LO` : t`Responsable`}
            </StyledStatLabel>
            <StyledStatValue>{responsibleLabel}</StyledStatValue>
          </StyledStatCell>
        </StyledStatsBar>
      </StyledHeroBand>

      <ParksPipelineDealStageStepper
        currentStageId={deal.stage}
        onSelectStage={(stageId) => onMoveToStage?.(deal.id, stageId)}
      />

      <StyledDealBody>
        <StyledGuideWrapper>
          <ParksDealStageGuidePanel
            guide={stageGuide}
            hideChecklistBody={
              activeTab === 'calificar' && checklistBelongsInCalificar
            }
            onOpenTab={(tab: ParksDealGuideTab, scrollTarget?: string) => {
              setActiveTab(GUIDE_TAB_TO_DETAIL_TAB[tab]);

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
          ariaLabel={t`Flujo del deal`}
        >
          {activeTab === 'contexto' ? (
            <StyledTabStack>
              {deal.stage === 'LEAD_RECIBIDO' ||
              deal.stage === 'CALIFICADO' ? (
                <ParksProspectEnrichmentPanel
                  opportunityId={deal.id}
                  companyName={companyName}
                  m2Requeridos={deal.m2Requeridos}
                  embedded
                />
              ) : null}
              <StyledResumenCard>
                <StyledContextGrid>
                  <ParksDetailField
                    label={t`Nave`}
                    icon={IconBox}
                    accent="blue"
                    value={
                      deal.tourNavesMostradas
                        ? formatParksTourNavesLabel(
                            parseParksTourNavesMostradas(
                              deal.tourNavesMostradas,
                            ),
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

          {activeTab === 'calificar' ? (
            <StyledTabStack>
              <ParksProspectEnrichmentPanel
                opportunityId={deal.id}
                companyName={companyName}
                m2Requeridos={deal.m2Requeridos}
                embedded
              />
              <ParksAssignLeasingOfficerPanel
                deal={deal}
                onAssigned={onDealUpdated}
              />
              {checklistBelongsInCalificar ? (
                <ParksDealStageGuideChecklist
                  guide={stageGuide}
                  onOpenTab={(
                    tab: ParksDealGuideTab,
                    scrollTarget?: string,
                  ) => {
                    setActiveTab(GUIDE_TAB_TO_DETAIL_TAB[tab]);

                    if (scrollTarget) {
                      setPendingScrollTarget(scrollTarget);
                    }
                  }}
                />
              ) : null}
              <ParksEmailSequencePanel
                opportunityId={deal.id}
                companyName={companyName}
              />
            </StyledTabStack>
          ) : null}

          {activeTab === 'visita' ? (
            <StyledTabStack>
              <StyledSectionTitle>{t`Naves y agenda`}</StyledSectionTitle>
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
              <StyledSectionTitle>{t`Decisores`}</StyledSectionTitle>
              <ParksDecisoresPanel
                opportunityId={deal.id}
                inquilinoId={deal.inquilinoVinculado?.id}
                showTourAttendance
                selectedTourDecisorIds={selectedTourDecisorIds}
                onTourSelectionChange={setSelectedTourDecisorIds}
                embedded
              />
              <StyledSectionTitle>{t`Guion de visita`}</StyledSectionTitle>
              <ParksSalesScriptPanel
                opportunityId={deal.id}
                companyName={companyName}
                m2Requeridos={deal.m2Requeridos}
                naveDestacada={deal.naveVinculada?.identificador}
                embedded
              />
            </StyledTabStack>
          ) : null}

          {activeTab === 'negociar' ? (
            <StyledTabStack>
              <ParksCommercialWorkflowPanel
                opportunity={deal}
                attendedDecisorIds={selectedTourDecisorIds}
                embedded
                sections={['tour', 'cotizacion', 'aprobacion']}
                title={t`Negociación`}
                hint={t`Tour, cotización y condiciones especiales en un solo lugar.`}
                onDealUpdated={(update) => onDealUpdated?.(deal.id, update)}
              />
            </StyledTabStack>
          ) : null}

          {activeTab === 'cerrar' ? (
            <StyledTabStack>
              <ParksCommercialWorkflowPanel
                opportunity={deal}
                embedded
                sections={['hoja', 'perdida']}
                title={t`Hoja de Acuerdos`}
                hint={t`Genera el borrador, firma con Director Comercial y cliente, o marca el deal como perdido.`}
                onDealUpdated={(update) => onDealUpdated?.(deal.id, update)}
              />
            </StyledTabStack>
          ) : null}

          {activeTab === 'actividad' ? (
            <StyledTabStack>
              <ParksFirstContactPanel
                opportunityId={deal.id}
                companyName={companyName}
                deal={deal}
                onContactRegistered={(update) =>
                  onDealUpdated?.(deal.id, update)
                }
              />
              <ParksActivityTimelinePanel opportunityId={deal.id} embedded />
            </StyledTabStack>
          ) : null}
        </ParksModalTabs>
      </StyledDealBody>

      <ParksActionBar
        hint={
          stageGuide.nextStageLabel
            ? t`Siguiente etapa: ${stageGuide.nextStageLabel}`
            : t`Revisa Cerrar para firmar la Hoja de Acuerdos`
        }
      >
        <ParksActionButton
          variant="ghost"
          title={t`Abrir registro`}
          Icon={IconExternalLink}
          iconPosition="right"
          onClick={handleOpenFullRecord}
        />
        {stageGuide.primaryActionKind === 'advance-stage' &&
        stageGuide.nextStageId &&
        onMoveToStage ? (
          <ParksActionButton
            variant="primary"
            title={stageGuide.primaryActionLabel}
            Icon={IconArrowRight}
            iconPosition="right"
            onClick={() => {
              if (!stageGuide.nextStageId) {
                return;
              }

              onMoveToStage(deal.id, stageGuide.nextStageId);
            }}
          />
        ) : stageGuide.primaryActionKind === 'open-tab' ? (
          <ParksActionButton
            variant="primary"
            title={stageGuide.primaryActionLabel}
            Icon={IconArrowRight}
            iconPosition="right"
            onClick={() =>
              setActiveTab(
                GUIDE_TAB_TO_DETAIL_TAB[stageGuide.recommendedTab],
              )
            }
          />
        ) : nextStage && onMoveToStage ? (
          <ParksActionButton
            variant="primary"
            title={t`Avanzar etapa`}
            Icon={IconArrowRight}
            iconPosition="right"
            onClick={() => onMoveToStage(deal.id, nextStage)}
          />
        ) : null}
      </ParksActionBar>
    </StyledPanel>
  );
};
