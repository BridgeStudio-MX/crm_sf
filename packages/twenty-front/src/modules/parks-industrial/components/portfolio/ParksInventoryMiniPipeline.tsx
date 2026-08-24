import { styled } from '@linaria/react';
import { t } from '@lingui/core/macro';
import { themeCssVariables } from 'twenty-ui/theme-constants';

import { ParksStatusBadge } from '@/parks-industrial/components/ui/ParksStatusBadge';
import {
  PARKS_VISIBLE_PIPELINE_STAGES,
  getParksPipelineStageColor,
  getParksPipelineStageLabel,
} from '@/parks-industrial/constants/parks-industrial.constants';
import { PARKS_VIBE } from '@/parks-industrial/constants/parks-theme.constants';
import {
  formatParksNumber,
  formatParksUsd,
} from '@/parks-industrial/utils/parks-format.util';
import { type ParksPortfolioLeadItem } from '@/parks-industrial/utils/parks-portfolio-by-park.util';

type ParksInventoryMiniPipelineProps = {
  leads: ParksPortfolioLeadItem[];
  emptyLabel?: string;
};

const StyledBoard = styled.div`
  display: flex;
  gap: ${themeCssVariables.spacing[2]};
  overflow-x: auto;
  padding-bottom: ${themeCssVariables.spacing[1]};
`;

const StyledColumn = styled.div`
  background: ${themeCssVariables.background.secondary};
  border: 1px solid ${themeCssVariables.border.color.light};
  border-radius: ${PARKS_VIBE.radiusSm};
  flex: 0 0 176px;
  min-height: 120px;
  padding: ${themeCssVariables.spacing[2]};
`;

const StyledColumnTitle = styled.div`
  color: ${themeCssVariables.font.color.secondary};
  font-size: ${themeCssVariables.font.size.xs};
  font-weight: ${themeCssVariables.font.weight.semiBold};
  margin-bottom: ${themeCssVariables.spacing[2]};
`;

const StyledCard = styled.div`
  background: ${themeCssVariables.background.primary};
  border: 1px solid ${themeCssVariables.border.color.light};
  border-radius: ${PARKS_VIBE.radiusSm};
  margin-bottom: ${themeCssVariables.spacing[2]};
  padding: ${themeCssVariables.spacing[2]};
`;

const StyledCardName = styled.div`
  font-size: ${themeCssVariables.font.size.sm};
  font-weight: ${themeCssVariables.font.weight.medium};
`;

const StyledCardMeta = styled.div`
  color: ${themeCssVariables.font.color.secondary};
  font-size: ${themeCssVariables.font.size.xs};
  margin-top: 4px;
`;

const StyledBadgeWrap = styled.div`
  margin-top: 6px;
`;

const StyledEmpty = styled.p`
  color: ${themeCssVariables.font.color.tertiary};
  font-size: ${themeCssVariables.font.size.sm};
  margin: 0;
`;

export const ParksInventoryMiniPipeline = ({
  leads,
  emptyLabel,
}: ParksInventoryMiniPipelineProps) => {
  if (leads.length === 0) {
    return (
      <StyledEmpty>
        {emptyLabel ?? t`No hay leads en este pipeline.`}
      </StyledEmpty>
    );
  }

  return (
    <StyledBoard>
      {PARKS_VISIBLE_PIPELINE_STAGES.map((stage) => {
        const stageLeads = leads.filter((lead) => lead.stage === stage.id);

        return (
          <StyledColumn key={stage.id}>
            <StyledColumnTitle>
              {getParksPipelineStageLabel(stage.id)} · {stageLeads.length}
            </StyledColumnTitle>
            {stageLeads.map((lead) => (
              <StyledCard key={lead.id}>
                <StyledCardName>{lead.name}</StyledCardName>
                <StyledCardMeta>
                  {lead.m2Requeridos > 0
                    ? `${formatParksNumber(lead.m2Requeridos)} m²`
                    : t`Sin m²`}
                  {lead.pipelineValueUsd > 0
                    ? ` · ${formatParksUsd(lead.pipelineValueUsd)}`
                    : ''}
                </StyledCardMeta>
                <StyledCardMeta>
                  {lead.naveIdentificador ?? t`Sin nave`}
                  {lead.leasingOfficer ? ` · ${lead.leasingOfficer}` : ''}
                </StyledCardMeta>
                <StyledBadgeWrap>
                  <ParksStatusBadge
                    color={getParksPipelineStageColor(lead.stage)}
                    label={getParksPipelineStageLabel(lead.stage)}
                  />
                </StyledBadgeWrap>
              </StyledCard>
            ))}
          </StyledColumn>
        );
      })}
    </StyledBoard>
  );
};
