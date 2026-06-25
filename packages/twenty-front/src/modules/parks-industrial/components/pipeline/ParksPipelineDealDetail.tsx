import { styled } from '@linaria/react';
import { t } from '@lingui/core/macro';
import { formatDistanceToNow, parseISO } from 'date-fns';
import { es } from 'date-fns/locale';
import {
  IconArrowRight,
  IconBox,
  IconCalendar,
  IconExternalLink,
  IconUser,
  IconX,
} from 'twenty-ui/icon';
import { Button } from 'twenty-ui/input';
import { themeCssVariables } from 'twenty-ui/theme-constants';
import { Tag } from 'twenty-ui/data-display';

import {
  getNextParksPipelineStage,
  getParksPipelineStageColor,
  getParksPipelineStageLabel,
  PARKS_VISIBLE_PIPELINE_STAGES,
} from '@/parks-industrial/constants/parks-industrial.constants';
import { type ParksOpportunityRecord } from '@/parks-industrial/hooks/useParksRecords';
import { ParksCommercialProposalSection } from '@/parks-industrial/components/pipeline/ParksCommercialProposalSection';
import { ParksEmailSequencePanel } from '@/parks-industrial/components/pipeline/ParksEmailSequencePanel';
import { ParksProspectEnrichmentPanel } from '@/parks-industrial/components/pipeline/ParksProspectEnrichmentPanel';
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

const StyledPanel = styled.aside<{ accentColor: string }>`
  background: ${themeCssVariables.background.primary};
  border: 1px solid ${themeCssVariables.border.color.medium};
  border-radius: ${themeCssVariables.border.radius.md};
  border-top: 4px solid ${({ accentColor }) => accentColor};
  display: flex;
  flex: 1;
  flex-direction: column;
  height: 100%;
  min-height: 0;
  overflow: hidden;
`;

const StyledPanelHeader = styled.div`
  align-items: flex-start;
  border-bottom: 1px solid ${themeCssVariables.border.color.light};
  display: flex;
  gap: ${themeCssVariables.spacing[2]};
  justify-content: space-between;
  padding: ${themeCssVariables.spacing[3]};
`;

const StyledPanelTitle = styled.h3`
  font-size: ${themeCssVariables.font.size.lg};
  font-weight: ${themeCssVariables.font.weight.semiBold};
  margin: 0;
`;

const StyledPanelBody = styled.div`
  display: flex;
  flex: 1;
  flex-direction: column;
  gap: ${themeCssVariables.spacing[3]};
  overflow-y: auto;
  padding: ${themeCssVariables.spacing[3]};
`;

const StyledAmount = styled.div`
  color: ${themeCssVariables.font.color.primary};
  font-size: ${themeCssVariables.font.size.xl};
  font-weight: ${themeCssVariables.font.weight.semiBold};
`;

const StyledSectionLabel = styled.div`
  color: ${themeCssVariables.font.color.tertiary};
  font-size: ${themeCssVariables.font.size.xs};
  font-weight: ${themeCssVariables.font.weight.medium};
  letter-spacing: 0.04em;
  margin-bottom: ${themeCssVariables.spacing[1]};
  text-transform: uppercase;
`;

const StyledInfoRow = styled.div`
  align-items: center;
  display: flex;
  gap: ${themeCssVariables.spacing[2]};
`;

const StyledInfoValue = styled.div`
  font-size: ${themeCssVariables.font.size.sm};
`;

const StyledOwnerBlock = styled.div`
  align-items: center;
  background: ${themeCssVariables.background.tertiary};
  border-radius: ${themeCssVariables.border.radius.sm};
  display: flex;
  gap: ${themeCssVariables.spacing[2]};
  padding: ${themeCssVariables.spacing[2]};
`;

const StyledOwnerAvatar = styled.div<{ avatarColor: string }>`
  align-items: center;
  background: ${({ avatarColor }) => avatarColor};
  border-radius: 50%;
  color: ${themeCssVariables.font.color.inverted};
  display: flex;
  flex-shrink: 0;
  font-size: ${themeCssVariables.font.size.sm};
  font-weight: ${themeCssVariables.font.weight.semiBold};
  height: 36px;
  justify-content: center;
  width: 36px;
`;

const StyledActions = styled.div`
  border-top: 1px solid ${themeCssVariables.border.color.light};
  display: flex;
  flex-direction: column;
  gap: ${themeCssVariables.spacing[2]};
  padding: ${themeCssVariables.spacing[3]};
`;

const StyledCloseButton = styled.button`
  background: transparent;
  border: none;
  color: ${themeCssVariables.font.color.secondary};
  cursor: pointer;
  padding: ${themeCssVariables.spacing[1]};

  &:hover {
    color: ${themeCssVariables.font.color.primary};
  }
`;

const StyledStageStrip = styled.div`
  display: flex;
  flex-wrap: wrap;
  gap: ${themeCssVariables.spacing[1]};
`;

const StyledStageButton = styled.button<{ isActive: boolean }>`
  background: ${({ isActive }) =>
    isActive
      ? themeCssVariables.background.transparent.light
      : themeCssVariables.background.tertiary};
  border: 1px solid
    ${({ isActive }) =>
      isActive
        ? themeCssVariables.border.color.strong
        : themeCssVariables.border.color.medium};
  border-radius: ${themeCssVariables.border.radius.sm};
  cursor: pointer;
  font-size: ${themeCssVariables.font.size.xs};
  padding: 4px 8px;

  &:hover {
    border-color: ${themeCssVariables.border.color.strong};
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
  const stageLabel = getParksPipelineStageLabel(deal.stage);
  const nextStage = getNextParksPipelineStage(deal.stage);
  const daysInStage = getParksDaysInStage(deal.updatedAt);
  const daysColor = getParksDaysInStageColor(deal.updatedAt);
  const ownerName = getParksOwnerName(deal);
  const companyName =
    deal.inquilinoVinculado?.empresa ?? deal.name ?? t`Nuevo prospecto`;
  const showEnrichment =
    !deal.stage || deal.stage === 'LEAD_RECIBIDO' || deal.stage === 'PROSPECTO_NUEVO';

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
    <StyledPanel accentColor={stageTheme.accent}>
      <StyledPanelHeader>
        <div>
          <StyledPanelTitle>{deal.name}</StyledPanelTitle>
          <Tag
            color={stageColor}
            text={stageLabel}
            variant="solid"
            weight="medium"
          />
        </div>
        <StyledCloseButton
          type="button"
          onClick={onClose}
          aria-label={t`Cerrar detalle`}
        >
          <IconX size={18} />
        </StyledCloseButton>
      </StyledPanelHeader>

      <StyledPanelBody>
        <div>
          <StyledAmount>
            {formatParksUsd(getParksAmountFromMicros(deal.amount?.amountMicros))}
          </StyledAmount>
          <StyledInfoValue>
            {deal.inquilinoVinculado?.empresa ?? t`Sin prospecto vinculado`}
          </StyledInfoValue>
        </div>

        {showEnrichment ? (
          <ParksProspectEnrichmentPanel
            opportunityId={deal.id}
            companyName={companyName}
            m2Requeridos={deal.m2Requeridos}
          />
        ) : null}

        {showEnrichment ? (
          <ParksEmailSequencePanel
            opportunityId={deal.id}
            companyName={companyName}
          />
        ) : null}

        <ParksCommercialProposalSection
          opportunityId={deal.id}
          companyName={companyName}
          m2Requeridos={deal.m2Requeridos}
        />

        <div>
          <StyledSectionLabel>{t`Mover a etapa`}</StyledSectionLabel>
          <StyledStageStrip>
            {PARKS_VISIBLE_PIPELINE_STAGES.map((stage) => {
              const isActive = deal.stage === stage.id;

              return (
                <StyledStageButton
                  key={stage.id}
                  type="button"
                  isActive={isActive}
                  disabled={isActive}
                  onClick={() => onMoveToStage?.(deal.id, stage.id)}
                >
                  {stage.label}
                </StyledStageButton>
              );
            })}
          </StyledStageStrip>
        </div>

        <div>
          <StyledSectionLabel>{t`Espacio`}</StyledSectionLabel>
          <StyledInfoRow>
            <IconBox size={16} />
            <StyledInfoValue>
              {deal.naveVinculada?.identificador ?? t`Sin nave asignada`} ·{' '}
              {formatParksNumber(deal.m2Requeridos)} m²
            </StyledInfoValue>
          </StyledInfoRow>
        </div>

        <div>
          <StyledSectionLabel>{t`Responsable`}</StyledSectionLabel>
          <StyledOwnerBlock>
            <StyledOwnerAvatar avatarColor={stageTheme.accent}>
              {getParksOwnerInitials(deal)}
            </StyledOwnerAvatar>
            <div>
              <StyledInfoValue>{ownerName}</StyledInfoValue>
              <StyledInfoValue
                style={{ color: themeCssVariables.font.color.tertiary }}
              >
                {t`Owner del deal`}
              </StyledInfoValue>
            </div>
          </StyledOwnerBlock>
        </div>

        <div>
          <StyledSectionLabel>{t`Seguimiento`}</StyledSectionLabel>
          <StyledInfoRow>
            <ParksStatusBadge
              color={daysColor}
              label={t`${daysInStage} días en etapa`}
            />
          </StyledInfoRow>
          {updatedAgo ? (
            <StyledInfoRow style={{ marginTop: themeCssVariables.spacing[2] }}>
              <IconCalendar size={16} />
              <StyledInfoValue>
                {t`Actualizado`} {updatedAgo}
              </StyledInfoValue>
            </StyledInfoRow>
          ) : null}
          {deal.createdAt ? (
            <StyledInfoRow style={{ marginTop: themeCssVariables.spacing[1] }}>
              <IconUser size={16} />
              <StyledInfoValue>
                {t`Creado`} {formatParksDate(deal.createdAt)}
              </StyledInfoValue>
            </StyledInfoRow>
          ) : null}
        </div>
      </StyledPanelBody>

      <StyledActions>
        <Button
          variant="primary"
          accent="blue"
          title={t`Abrir registro completo`}
          Icon={IconExternalLink}
          onClick={handleOpenFullRecord}
        />
        {nextStage && onMoveToStage ? (
          <Button
            variant="secondary"
            accent="default"
            title={t`Avanzar a ${getParksPipelineStageLabel(nextStage)}`}
            Icon={IconArrowRight}
            onClick={() => onMoveToStage(deal.id, nextStage)}
          />
        ) : null}
      </StyledActions>
    </StyledPanel>
  );
};
