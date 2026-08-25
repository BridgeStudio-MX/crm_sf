import { styled } from '@linaria/react';
import { t } from '@lingui/core/macro';
import { themeCssVariables } from 'twenty-ui/theme-constants';

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

type ParksInventoryParkListProps = {
  parks: ParksPortfolioParkRow[];
  onSelectPark: (parqueId: string) => void;
};

const StyledTableShell = styled.div`
  border: 1px solid ${themeCssVariables.border.color.medium};
  border-radius: ${PARKS_VIBE.radiusMd};
  overflow: hidden;
`;

const StyledTableScroll = styled.div`
  overflow-x: auto;
`;

const StyledTable = styled.table`
  border-collapse: collapse;
  min-width: 880px;
  width: 100%;
`;

const StyledTableHeadCell = styled.th`
  background: ${themeCssVariables.background.tertiary};
  border-bottom: 1px solid ${themeCssVariables.border.color.medium};
  color: ${themeCssVariables.font.color.secondary};
  font-size: ${themeCssVariables.font.size.xs};
  font-weight: ${themeCssVariables.font.weight.semiBold};
  padding: ${themeCssVariables.spacing[2]} ${themeCssVariables.spacing[3]};
  text-align: left;
  white-space: nowrap;
`;

const StyledTableRow = styled.tr`
  cursor: pointer;
  transition: background 0.12s ease;

  &:hover {
    background: ${themeCssVariables.background.transparent.light};
  }

  &:not(:last-child) td {
    border-bottom: 1px solid ${themeCssVariables.border.color.light};
  }
`;

const StyledTableCell = styled.td`
  color: ${themeCssVariables.font.color.primary};
  font-size: ${themeCssVariables.font.size.sm};
  padding: ${themeCssVariables.spacing[2]} ${themeCssVariables.spacing[3]};
  vertical-align: middle;
`;

const StyledParkName = styled.span`
  color: ${PARKS_BRAND.primary};
  font-weight: ${themeCssVariables.font.weight.semiBold};
`;

const StyledMeta = styled.span`
  color: ${themeCssVariables.font.color.secondary};
`;

export const ParksInventoryParkList = ({
  parks,
  onSelectPark,
}: ParksInventoryParkListProps) => (
  <StyledTableShell>
    <StyledTableScroll>
      <StyledTable>
        <thead>
          <tr>
            <StyledTableHeadCell>{t`Parque`}</StyledTableHeadCell>
            <StyledTableHeadCell>{t`Ubicación`}</StyledTableHeadCell>
            <StyledTableHeadCell>{t`Ocupación`}</StyledTableHeadCell>
            <StyledTableHeadCell>{t`m² disponibles`}</StyledTableHeadCell>
            <StyledTableHeadCell>{t`Naves`}</StyledTableHeadCell>
            <StyledTableHeadCell>{t`En obra`}</StyledTableHeadCell>
            <StyledTableHeadCell>{t`Leads`}</StyledTableHeadCell>
            <StyledTableHeadCell>{t`Pipeline`}</StyledTableHeadCell>
          </tr>
        </thead>
        <tbody>
          {parks.map((park) => {
            const isConstruction = isParksParkUnderConstruction(park);
            const availableNaveCount = park.availableNaves.length;

            return (
              <StyledTableRow
                key={park.parqueId}
                onClick={() => onSelectPark(park.parqueId)}
              >
                <StyledTableCell>
                  <StyledParkName>{park.nombre}</StyledParkName>
                </StyledTableCell>
                <StyledTableCell>
                  <StyledMeta>{park.ubicacion ?? t`Sin ubicación`}</StyledMeta>
                </StyledTableCell>
                <StyledTableCell>
                  {isConstruction ? (
                    <ParksStatusBadge
                      color="orange"
                      label={t`En construcción`}
                    />
                  ) : (
                    <ParksStatusBadge
                      color={getParksOcupacionMetricAccent(park.ocupacion)}
                      label={`${park.ocupacion}%`}
                    />
                  )}
                </StyledTableCell>
                <StyledTableCell>
                  {formatParksNumber(park.m2Disponibles)}
                </StyledTableCell>
                <StyledTableCell>
                  {`${availableNaveCount} / ${park.totalNaveCount}`}
                </StyledTableCell>
                <StyledTableCell>
                  {park.constructionNaveCount > 0 ? (
                    <ParksStatusBadge
                      color="orange"
                      label={String(park.constructionNaveCount)}
                    />
                  ) : (
                    <StyledMeta>—</StyledMeta>
                  )}
                </StyledTableCell>
                <StyledTableCell>{park.leads.length}</StyledTableCell>
                <StyledTableCell>
                  {park.pipelineValueUsd > 0
                    ? formatParksUsd(park.pipelineValueUsd)
                    : '—'}
                </StyledTableCell>
              </StyledTableRow>
            );
          })}
        </tbody>
      </StyledTable>
    </StyledTableScroll>
  </StyledTableShell>
);
