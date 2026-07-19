import { styled } from '@linaria/react';
import { t } from '@lingui/core/macro';
import { IconCalendarEvent, IconPhone } from 'twenty-ui/icon';
import { themeCssVariables } from 'twenty-ui/theme-constants';

import { ParksEmptyState } from '@/parks-industrial/components/ui/ParksEmptyState';
import { getParksPipelineStageLabel } from '@/parks-industrial/constants/parks-industrial.constants';
import { PARKS_BRAND } from '@/parks-industrial/constants/parks-theme.constants';
import { type ParksOpportunityRecord } from '@/parks-industrial/hooks/useParksRecords';
import { getParksAssignedLeasingOfficerName } from '@/parks-industrial/utils/parks-format.util';
import {
  buildParksLoAgendaItems,
  type ParksLoAgendaItem,
} from '@/parks-industrial/utils/parks-lo-agenda.util';

type ParksLoCampoHoyTabProps = {
  deals: ParksOpportunityRecord[];
  tourReadyCount: number;
  handledCount: number;
  inVisitCount: number;
  onSelectDeal: (dealId: string) => void;
};

const StyledSummaryGrid = styled.div`
  display: grid;
  gap: ${themeCssVariables.spacing[2]};
  grid-template-columns: 1fr 1fr;
`;

const StyledSummaryCard = styled.div`
  background: ${PARKS_BRAND.primarySoft};
  border: 1px solid ${PARKS_BRAND.borderSoft};
  border-radius: ${themeCssVariables.border.radius.md};
  display: flex;
  flex-direction: column;
  gap: 4px;
  padding: ${themeCssVariables.spacing[3]};
`;

const StyledSummaryValue = styled.span`
  color: ${PARKS_BRAND.primary};
  font-size: ${themeCssVariables.font.size.xl};
  font-weight: ${themeCssVariables.font.weight.semiBold};
`;

const StyledSummaryLabel = styled.span`
  color: ${themeCssVariables.font.color.secondary};
  font-size: ${themeCssVariables.font.size.sm};
`;

const StyledDealList = styled.div`
  display: flex;
  flex-direction: column;
  gap: ${themeCssVariables.spacing[2]};
`;

const StyledDealButton = styled.button`
  background: ${themeCssVariables.background.secondary};
  border: 1px solid ${PARKS_BRAND.borderSoft};
  border-radius: ${themeCssVariables.border.radius.md};
  color: ${themeCssVariables.font.color.primary};
  cursor: pointer;
  display: flex;
  flex-direction: column;
  gap: 4px;
  padding: 14px;
  text-align: left;
  width: 100%;
`;

const StyledDealName = styled.span`
  font-size: ${themeCssVariables.font.size.md};
  font-weight: ${themeCssVariables.font.weight.semiBold};
`;

const StyledDealMeta = styled.span`
  color: ${themeCssVariables.font.color.tertiary};
  font-size: ${themeCssVariables.font.size.sm};
`;

const StyledAgendaSection = styled.section`
  display: flex;
  flex-direction: column;
  gap: ${themeCssVariables.spacing[2]};
`;

const StyledAgendaTitle = styled.h3`
  color: ${themeCssVariables.font.color.primary};
  font-size: ${themeCssVariables.font.size.sm};
  font-weight: ${themeCssVariables.font.weight.semiBold};
  margin: 0;
`;

const StyledAgendaList = styled.div`
  display: flex;
  flex-direction: column;
  gap: ${themeCssVariables.spacing[2]};
`;

const StyledAgendaButton = styled.button`
  align-items: flex-start;
  background: ${themeCssVariables.background.secondary};
  border: 1px solid ${PARKS_BRAND.borderSoft};
  border-radius: ${themeCssVariables.border.radius.md};
  color: ${themeCssVariables.font.color.primary};
  cursor: pointer;
  display: flex;
  gap: ${themeCssVariables.spacing[2]};
  padding: 12px;
  text-align: left;
  width: 100%;
`;

const StyledAgendaIcon = styled.span`
  color: ${PARKS_BRAND.primary};
  flex-shrink: 0;
  margin-top: 2px;
`;

const StyledAgendaText = styled.div`
  display: flex;
  flex: 1;
  flex-direction: column;
  gap: 2px;
  min-width: 0;
`;

const StyledAgendaDealName = styled.span`
  font-size: ${themeCssVariables.font.size.sm};
  font-weight: ${themeCssVariables.font.weight.semiBold};
`;

const StyledAgendaMeta = styled.span`
  color: ${themeCssVariables.font.color.tertiary};
  font-size: ${themeCssVariables.font.size.xs};
`;

const renderAgendaIcon = (item: ParksLoAgendaItem) =>
  item.kind === 'contacto' ? (
    <IconPhone size={16} />
  ) : (
    <IconCalendarEvent size={16} />
  );

export const ParksLoCampoHoyTab = ({
  deals,
  tourReadyCount,
  handledCount,
  inVisitCount,
  onSelectDeal,
}: ParksLoCampoHoyTabProps) => {
  const agendaItems = buildParksLoAgendaItems(deals);

  return (
    <>
      <StyledSummaryGrid>
      <StyledSummaryCard>
        <StyledSummaryValue>{deals.length}</StyledSummaryValue>
        <StyledSummaryLabel>{t`Deals activos`}</StyledSummaryLabel>
      </StyledSummaryCard>
      <StyledSummaryCard>
        <StyledSummaryValue>{tourReadyCount}</StyledSummaryValue>
        <StyledSummaryLabel>{t`Listos p/ tour`}</StyledSummaryLabel>
      </StyledSummaryCard>
      <StyledSummaryCard>
        <StyledSummaryValue>{handledCount}</StyledSummaryValue>
        <StyledSummaryLabel>{t`Con notas`}</StyledSummaryLabel>
      </StyledSummaryCard>
      <StyledSummaryCard>
        <StyledSummaryValue>{inVisitCount}</StyledSummaryValue>
        <StyledSummaryLabel>{t`En visita`}</StyledSummaryLabel>
      </StyledSummaryCard>
    </StyledSummaryGrid>

    {agendaItems.length > 0 ? (
      <StyledAgendaSection>
        <StyledAgendaTitle>{t`Tu agenda`}</StyledAgendaTitle>
        <StyledAgendaList>
          {agendaItems.map((item) => (
            <StyledAgendaButton
              key={item.id}
              type="button"
              onClick={() => onSelectDeal(item.dealId)}
            >
              <StyledAgendaIcon>{renderAgendaIcon(item)}</StyledAgendaIcon>
              <StyledAgendaText>
                <StyledAgendaDealName>{item.dealName}</StyledAgendaDealName>
                <StyledAgendaMeta>
                  {item.label} · {item.fecha}
                  {item.hora ? ` ${item.hora}` : ''}
                </StyledAgendaMeta>
              </StyledAgendaText>
            </StyledAgendaButton>
          ))}
        </StyledAgendaList>
      </StyledAgendaSection>
    ) : null}

    {deals.length === 0 ? (
      <ParksEmptyState
        title={t`Sin deals para campo`}
        description={t`Cuando CEM te asigne leads o tengas deals en tour, aparecerán aquí.`}
      />
    ) : (
      <StyledDealList>
        {deals.slice(0, 8).map((deal) => (
          <StyledDealButton
            key={deal.id}
            type="button"
            onClick={() => onSelectDeal(deal.id)}
          >
            <StyledDealName>{deal.name ?? t`Sin nombre`}</StyledDealName>
            <StyledDealMeta>
              {getParksPipelineStageLabel(deal.stage)}
              {deal.naveVinculada?.identificador
                ? ` · ${deal.naveVinculada.identificador}`
                : ''}
              {getParksAssignedLeasingOfficerName(deal) ? ` · LO` : ''}
            </StyledDealMeta>
          </StyledDealButton>
        ))}
      </StyledDealList>
    )}
    </>
  );
};
