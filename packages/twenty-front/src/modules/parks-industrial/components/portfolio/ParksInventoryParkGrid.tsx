import { styled } from '@linaria/react';
import { t } from '@lingui/core/macro';
import { MOBILE_VIEWPORT, themeCssVariables } from 'twenty-ui/theme-constants';

import { ParksStatusBadge } from '@/parks-industrial/components/ui/ParksStatusBadge';
import { PARKS_BRAND, PARKS_VIBE } from '@/parks-industrial/constants/parks-theme.constants';
import {
  formatParksNumber,
  formatParksUsd,
} from '@/parks-industrial/utils/parks-format.util';
import {
  isParksParkUnderConstruction,
  type ParksPortfolioParkRow,
} from '@/parks-industrial/utils/parks-portfolio-by-park.util';
import { getParksOcupacionMetricAccent } from '@/parks-industrial/utils/parks-portfolio-metrics.util';

type ParksInventoryParkGridProps = {
  parks: ParksPortfolioParkRow[];
  onSelectPark: (parqueId: string) => void;
};

const StyledGrid = styled.div`
  display: grid;
  gap: ${themeCssVariables.spacing[3]};
  grid-template-columns: repeat(auto-fill, minmax(280px, 1fr));
`;

const StyledParkCard = styled.button`
  background: ${themeCssVariables.background.primary};
  border: 1px solid ${themeCssVariables.border.color.medium};
  border-radius: ${PARKS_VIBE.radiusMd};
  cursor: pointer;
  display: flex;
  flex-direction: column;
  gap: ${themeCssVariables.spacing[2]};
  padding: ${themeCssVariables.spacing[3]};
  text-align: left;
  transition: border-color 0.15s ease, box-shadow 0.15s ease;

  &:hover {
    border-color: ${PARKS_BRAND.borderSoft};
    box-shadow: ${PARKS_VIBE.shadowCard};
  }

  @media (max-width: ${MOBILE_VIEWPORT}px) {
    min-width: 0;
  }
`;

const StyledParkName = styled.span`
  font-size: ${themeCssVariables.font.size.md};
  font-weight: ${themeCssVariables.font.weight.semiBold};
`;

const StyledParkMeta = styled.span`
  color: ${themeCssVariables.font.color.secondary};
  font-size: ${themeCssVariables.font.size.xs};
`;

const StyledOccupancyTrack = styled.div`
  background: ${themeCssVariables.background.tertiary};
  border-radius: ${themeCssVariables.border.radius.pill};
  height: 8px;
  overflow: hidden;
`;

const StyledOccupancyFill = styled.div<{ widthPct: number; accent: string }>`
  background: ${({ accent }) => accent};
  height: 100%;
  width: ${({ widthPct }) => `${Math.min(100, Math.max(0, widthPct))}%`};
`;

const StyledBadgeRow = styled.div`
  display: flex;
  flex-wrap: wrap;
  gap: ${themeCssVariables.spacing[1]};
`;

const occupancyBarColor = (ocupacion: number, isConstruction: boolean) => {
  if (isConstruction) {
    return themeCssVariables.color.orange;
  }

  if (ocupacion >= 85) {
    return themeCssVariables.color.green;
  }

  if (ocupacion >= 70) {
    return themeCssVariables.color.yellow;
  }

  return themeCssVariables.color.orange;
};

export const ParksInventoryParkGrid = ({
  parks,
  onSelectPark,
}: ParksInventoryParkGridProps) => (
  <StyledGrid>
    {parks.map((park) => {
      const isConstruction = isParksParkUnderConstruction(park);

      return (
        <StyledParkCard
          key={park.parqueId}
          type="button"
          onClick={() => onSelectPark(park.parqueId)}
        >
          <StyledParkName>{park.nombre}</StyledParkName>
          <StyledParkMeta>{park.ubicacion ?? t`Sin ubicación`}</StyledParkMeta>
          <StyledOccupancyTrack>
            <StyledOccupancyFill
              widthPct={isConstruction ? 100 : park.ocupacion}
              accent={occupancyBarColor(park.ocupacion, isConstruction)}
            />
          </StyledOccupancyTrack>
          <StyledBadgeRow>
            {isConstruction ? (
              <ParksStatusBadge color="orange" label={t`En construcción`} />
            ) : (
              <ParksStatusBadge
                color={getParksOcupacionMetricAccent(park.ocupacion)}
                label={`${park.ocupacion}%`}
              />
            )}
            <ParksStatusBadge
              color="blue"
              label={t`${park.occupiedNaveCount}/${park.totalNaveCount} ocupadas`}
            />
            {park.constructionNaveCount > 0 ? (
              <ParksStatusBadge
                color="orange"
                label={t`${park.constructionNaveCount} en obra`}
              />
            ) : null}
            <ParksStatusBadge
              color="green"
              label={`${formatParksNumber(park.m2Rentados)} / ${formatParksNumber(park.m2Totales)} m²`}
            />
          </StyledBadgeRow>
          <StyledParkMeta>
            {t`${park.leads.length} leads en pipeline`}
            {park.pipelineValueUsd > 0
              ? ` · ${formatParksUsd(park.pipelineValueUsd)}`
              : ''}
          </StyledParkMeta>
          {isConstruction ? (
            <StyledParkMeta>
              {t`Pre-renta de naves antes de entrega`}
              {park.constructionM2 > 0
                ? ` · ${formatParksNumber(park.constructionM2)} m²`
                : ''}
            </StyledParkMeta>
          ) : (
            <StyledParkMeta>
              {park.oldestVacantNave
                ? t`Más tiempo vacía: ${park.oldestVacantNave.identificador} · ${park.oldestVacantNave.daysVacant ?? 0}d`
                : t`Sin naves disponibles`}
            </StyledParkMeta>
          )}
        </StyledParkCard>
      );
    })}
  </StyledGrid>
);
