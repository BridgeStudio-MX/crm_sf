import { styled } from '@linaria/react';
import { t } from '@lingui/core/macro';
import { Link } from 'react-router-dom';
import { AppPath } from 'twenty-shared/types';
import { getAppPath } from 'twenty-shared/utils';
import { themeCssVariables } from 'twenty-ui/theme-constants';

import { ParksStatusBadge } from '@/parks-industrial/components/ui/ParksStatusBadge';
import {
  getParksPipelineStageColor,
  getParksPipelineStageLabel,
} from '@/parks-industrial/constants/parks-industrial.constants';
import { PARKS_BRAND, PARKS_VIBE } from '@/parks-industrial/constants/parks-theme.constants';
import {
  formatParksNumber,
  formatParksUsd,
} from '@/parks-industrial/utils/parks-format.util';
import { type ParksPortfolioParkRow } from '@/parks-industrial/utils/parks-portfolio-by-park.util';

type ParksCeoParkDetailPanelProps = {
  park: ParksPortfolioParkRow;
};

const StyledRoot = styled.div`
  display: flex;
  flex-direction: column;
  gap: ${themeCssVariables.spacing[4]};
  overflow: auto;
  padding: ${themeCssVariables.spacing[4]};
`;

const StyledHeader = styled.div`
  display: flex;
  flex-direction: column;
  gap: ${themeCssVariables.spacing[1]};
`;

const StyledTitle = styled.h2`
  font-size: ${themeCssVariables.font.size.lg};
  font-weight: ${themeCssVariables.font.weight.semiBold};
  margin: 0;
`;

const StyledMeta = styled.p`
  color: ${themeCssVariables.font.color.secondary};
  font-size: ${themeCssVariables.font.size.sm};
  margin: 0;
`;

const StyledStats = styled.div`
  display: flex;
  flex-wrap: wrap;
  gap: ${themeCssVariables.spacing[1]};
`;

const StyledColumns = styled.div`
  display: grid;
  gap: ${themeCssVariables.spacing[4]};
  grid-template-columns: 1fr;

  @media (min-width: 720px) {
    grid-template-columns: 1fr 1fr;
  }
`;

const StyledColumnTitle = styled.h3`
  font-size: ${themeCssVariables.font.size.sm};
  font-weight: ${themeCssVariables.font.weight.semiBold};
  margin: 0 0 ${themeCssVariables.spacing[2]} 0;
`;

const StyledItem = styled.div`
  background: ${PARKS_VIBE.surfaceMuted};
  border: 1px solid ${themeCssVariables.border.color.light};
  border-radius: ${PARKS_VIBE.radiusSm};
  margin-bottom: ${themeCssVariables.spacing[2]};
  padding: ${themeCssVariables.spacing[2]};
`;

const StyledItemHeader = styled.div`
  align-items: flex-start;
  display: flex;
  gap: ${themeCssVariables.spacing[2]};
  justify-content: space-between;
`;

const StyledItemName = styled.div`
  font-size: ${themeCssVariables.font.size.sm};
  font-weight: ${themeCssVariables.font.weight.medium};
`;

const StyledItemMeta = styled.div`
  color: ${themeCssVariables.font.color.secondary};
  font-size: ${themeCssVariables.font.size.xs};
  margin-top: 4px;
`;

const StyledHint = styled.p`
  color: ${themeCssVariables.font.color.tertiary};
  font-size: ${themeCssVariables.font.size.xs};
  margin: 0;
`;

const StyledLink = styled(Link)`
  color: ${PARKS_BRAND.primary};
  font-size: ${themeCssVariables.font.size.sm};
  font-weight: ${themeCssVariables.font.weight.medium};
  text-decoration: none;

  &:hover {
    text-decoration: underline;
  }
`;

const formatVacancyLabel = (daysVacant: number | null): string => {
  if (daysVacant === null) {
    return 'Sin fecha de vacancia';
  }

  if (daysVacant === 0) {
    return 'Disponible hoy';
  }

  return `${daysVacant} días sin rentar`;
};

export const ParksCeoParkDetailPanel = ({
  park,
}: ParksCeoParkDetailPanelProps) => {
  const stackingPath = getAppPath(AppPath.ParksStackingPlan, {
    parqueId: park.parqueId,
  });
  const hasLiveStackingPlan = !park.parqueId.startsWith('demo-');

  return (
    <StyledRoot>
      <StyledHeader>
        <StyledTitle>{park.nombre}</StyledTitle>
        <StyledMeta>
          {park.ubicacion ?? t`Sin ubicación`} · {park.ocupacion}%{' '}
          {t`ocupación`}
        </StyledMeta>
        <StyledStats>
          <ParksStatusBadge
            color="blue"
            label={t`${park.occupiedNaveCount}/${park.totalNaveCount} naves ocupadas`}
          />
          <ParksStatusBadge
            color="green"
            label={`${formatParksNumber(park.m2Rentados)} / ${formatParksNumber(park.m2Totales)} m²`}
          />
          <ParksStatusBadge
            color="orange"
            label={t`${park.leads.length} leads`}
          />
        </StyledStats>
        {park.oldestVacantNave ? (
          <StyledMeta>
            {t`Nave más vieja sin rentar:`} {park.oldestVacantNave.identificador}{' '}
            · {formatVacancyLabel(park.oldestVacantNave.daysVacant)}
          </StyledMeta>
        ) : null}
        {park.daysSinceLastInterest !== null ? (
          <StyledMeta>
            {t`Último interés comercial:`} {park.daysSinceLastInterest}{' '}
            {t`días`}
          </StyledMeta>
        ) : (
          <StyledMeta>{t`Sin leads ligados a este parque.`}</StyledMeta>
        )}
        {hasLiveStackingPlan ? (
          <StyledLink to={stackingPath}>{t`Ver plano de ocupación`}</StyledLink>
        ) : (
          <StyledMeta>
            {t`Datos ilustrativos de inventario para el demo CEO.`}
          </StyledMeta>
        )}
      </StyledHeader>

      <StyledColumns>
        <div>
          <StyledColumnTitle>{t`Naves disponibles`}</StyledColumnTitle>
          {park.availableNaves.length === 0 ? (
            <StyledHint>{t`No hay naves disponibles.`}</StyledHint>
          ) : (
            park.availableNaves.map((nave) => (
              <StyledItem key={nave.id}>
                <StyledItemHeader>
                  <StyledItemName>{nave.identificador}</StyledItemName>
                  <ParksStatusBadge
                    color={nave.interestCount > 0 ? 'blue' : 'orange'}
                    label={
                      nave.interestCount > 0
                        ? t`${nave.interestCount} interesados`
                        : t`Sin interés`
                    }
                  />
                </StyledItemHeader>
                <StyledItemMeta>
                  {formatParksNumber(nave.m2)} m² ·{' '}
                  {formatVacancyLabel(nave.daysVacant)}
                  {nave.precioBaseUsd > 0
                    ? ` · ${formatParksUsd(nave.precioBaseUsd)}`
                    : ''}
                </StyledItemMeta>
              </StyledItem>
            ))
          )}
        </div>
        <div>
          <StyledColumnTitle>{t`Quién está interesado`}</StyledColumnTitle>
          {park.leads.length === 0 ? (
            <StyledHint>
              {t`Nadie en pipeline está ligado a este parque ahora.`}
            </StyledHint>
          ) : (
            park.leads.map((lead) => (
              <StyledItem key={lead.id}>
                <StyledItemHeader>
                  <StyledItemName>{lead.name}</StyledItemName>
                  <ParksStatusBadge
                    color={getParksPipelineStageColor(lead.stage)}
                    label={getParksPipelineStageLabel(lead.stage)}
                  />
                </StyledItemHeader>
                <StyledItemMeta>
                  {lead.m2Requeridos > 0
                    ? `${formatParksNumber(lead.m2Requeridos)} m²`
                    : t`Sin m²`}
                  {lead.pipelineValueUsd > 0
                    ? ` · ${formatParksUsd(lead.pipelineValueUsd)}`
                    : ''}
                  {lead.naveIdentificador
                    ? ` · ${lead.naveIdentificador}`
                    : ''}
                  {lead.leasingOfficer ? ` · ${lead.leasingOfficer}` : ''}
                </StyledItemMeta>
              </StyledItem>
            ))
          )}
        </div>
      </StyledColumns>
    </StyledRoot>
  );
};
