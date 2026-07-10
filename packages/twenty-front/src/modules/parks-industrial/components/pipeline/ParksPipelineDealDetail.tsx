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
  IconClock,
  IconExternalLink,
  IconFileText,
  IconLayoutDashboard,
  IconSparkles,
  IconUser,
  IconUsers,
  IconX,
  type IconComponent,
} from 'twenty-ui/icon';
import { Button } from 'twenty-ui/input';
import { MOBILE_VIEWPORT, themeCssVariables } from 'twenty-ui/theme-constants';
import { Tag } from 'twenty-ui/data-display';

import {
  getParksPipelineStageColor,
  getParksPipelineStageLabel,
  getNextParksPipelineStage,
} from '@/parks-industrial/constants/parks-industrial.constants';
import { getParksInquilino360Path } from '@/parks-industrial/constants/parks-routes.constants';
import { type ParksOpportunityRecord } from '@/parks-industrial/hooks/useParksRecords';
import { ParksCommercialProposalSection } from '@/parks-industrial/components/pipeline/ParksCommercialProposalSection';
import { ParksCommercialWorkflowPanel } from '@/parks-industrial/components/pipeline/ParksCommercialWorkflowPanel';
import { ParksDecisoresPanel } from '@/parks-industrial/components/pipeline/ParksDecisoresPanel';
import { ParksEmailSequencePanel } from '@/parks-industrial/components/pipeline/ParksEmailSequencePanel';
import { ParksPipelineDealStageStepper } from '@/parks-industrial/components/pipeline/ParksPipelineDealStageStepper';
import { ParksProspectEnrichmentPanel } from '@/parks-industrial/components/pipeline/ParksProspectEnrichmentPanel';
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
  | 'decisores'
  | 'flujo';

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

const StyledActions = styled.div`
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
  justify-content: flex-end;
  padding: ${themeCssVariables.spacing[3]} ${themeCssVariables.spacing[4]};

  @media (max-width: ${MOBILE_VIEWPORT}px) {
    flex-direction: column-reverse;
    padding: ${themeCssVariables.spacing[3]};
  }
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
};

export const ParksPipelineDealDetail = ({
  deal,
  onClose,
  onMoveToStage,
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
  const showEnrichment =
    !deal.stage ||
    deal.stage === 'LEAD_RECIBIDO' ||
    deal.stage === 'PROSPECTO_NUEVO';
  const [selectedTourDecisorIds, setSelectedTourDecisorIds] = useState<
    string[]
  >([]);
  const [activeTab, setActiveTab] = useState<DealDetailTab>('resumen');

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
    ];

    if (showEnrichment) {
      tabs.push({
        id: 'prospecto',
        label: t`Prospecto`,
        icon: IconSparkles,
        description: t`Enriquecimiento IA y secuencia de correos para calificar al prospecto.`,
      });
    }

    tabs.push(
      {
        id: 'propuesta',
        label: t`Propuesta`,
        icon: IconFileText,
        description: t`Matching de naves, ficha técnica compartible y guion comercial.`,
      },
      {
        id: 'decisores',
        label: t`Decisores`,
        icon: IconUsers,
        description: t`Contactos clave del cliente que participan en la decisión de arrendamiento.`,
      },
      {
        id: 'flujo',
        label: t`Flujo`,
        icon: IconCalendarEvent,
        description: t`Tour, cotización formal, aprobaciones internas y Hoja de Acuerdos.`,
      },
    );

    return tabs;
  }, [showEnrichment]);

  useEffect(() => {
    setActiveTab('resumen');
    setSelectedTourDecisorIds([]);
  }, [deal.id]);

  useEffect(() => {
    if (!dealTabs.some((tab) => tab.id === activeTab)) {
      setActiveTab('resumen');
    }
  }, [activeTab, dealTabs]);

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
                  deal.naveVinculada?.identificador ?? t`Sin nave asignada`
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

        {activeTab === 'prospecto' && showEnrichment ? (
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
          />
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

        {activeTab === 'flujo' ? (
          <ParksCommercialWorkflowPanel
            opportunity={deal}
            attendedDecisorIds={selectedTourDecisorIds}
            embedded
          />
        ) : null}
      </ParksModalTabs>

      <StyledActions>
        {nextStage && onMoveToStage ? (
          <Button
            variant="secondary"
            accent="default"
            title={t`Avanzar a ${getParksPipelineStageLabel(nextStage)}`}
            Icon={IconArrowRight}
            onClick={() => onMoveToStage(deal.id, nextStage)}
          />
        ) : null}
        <Button
          variant="primary"
          accent="blue"
          title={t`Abrir registro completo`}
          Icon={IconExternalLink}
          onClick={handleOpenFullRecord}
        />
      </StyledActions>
    </StyledPanel>
  );
};
