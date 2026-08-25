import { styled } from '@linaria/react';
import { t } from '@lingui/core/macro';
import { useContext, useMemo, useState } from 'react';
import { isDefined } from 'twenty-shared/utils';
import { Button } from 'twenty-ui/input';
import {
  MOBILE_VIEWPORT,
  ThemeContext,
  themeCssVariables,
} from 'twenty-ui/theme-constants';

import { ParksOsmMapPanel } from '@/parks-industrial/components/mapa/ParksOsmMapPanel';
import { ParksEmptyState } from '@/parks-industrial/components/ui/ParksEmptyState';
import { ParksLoadingSkeleton } from '@/parks-industrial/components/ui/ParksLoadingSkeleton';
import { ParksStatusBadge } from '@/parks-industrial/components/ui/ParksStatusBadge';
import { PARKS_BRAND, PARKS_VIBE } from '@/parks-industrial/constants/parks-theme.constants';
import { useParksParques } from '@/parks-industrial/hooks/useParksParques';
import {
  formatParksNumber,
  formatParksUsd,
} from '@/parks-industrial/utils/parks-format.util';
import {
  isParksParkUnderConstruction,
  type ParksPortfolioParkRow,
} from '@/parks-industrial/utils/parks-portfolio-by-park.util';
import { getParksOcupacionMetricAccent } from '@/parks-industrial/utils/parks-portfolio-metrics.util';

type ParksInventoryParkMapProps = {
  parks: ParksPortfolioParkRow[];
  onSelectPark: (parqueId: string) => void;
};

const StyledMapWorkspace = styled.div`
  background: ${themeCssVariables.background.primary};
  border: 1px solid ${themeCssVariables.border.color.medium};
  border-radius: ${PARKS_VIBE.radiusMd};
  display: grid;
  height: clamp(420px, 55dvh, 640px);
  min-height: 420px;
  overflow: hidden;

  @media (min-width: ${MOBILE_VIEWPORT}px) {
    grid-template-columns: minmax(0, 1.65fr) minmax(280px, 320px);
  }
`;

const StyledMapPane = styled.div`
  height: 100%;
  min-height: 280px;
  min-width: 0;
  position: relative;
`;

const StyledSidebarPane = styled.aside`
  background: ${themeCssVariables.background.primary};
  border-top: 1px solid ${themeCssVariables.border.color.medium};
  display: flex;
  flex-direction: column;
  min-height: 0;
  min-width: 0;
  overflow: hidden;

  @media (min-width: ${MOBILE_VIEWPORT}px) {
    border-left: 1px solid ${themeCssVariables.border.color.medium};
    border-top: none;
  }
`;

const StyledSidebarHeader = styled.div`
  border-bottom: 1px solid ${themeCssVariables.border.color.light};
  display: flex;
  flex-direction: column;
  gap: ${themeCssVariables.spacing[1]};
  padding: ${themeCssVariables.spacing[3]};
`;

const StyledSidebarTitle = styled.h3`
  color: ${themeCssVariables.font.color.primary};
  font-size: ${themeCssVariables.font.size.md};
  font-weight: ${themeCssVariables.font.weight.semiBold};
  margin: 0;
`;

const StyledSidebarMeta = styled.p`
  color: ${themeCssVariables.font.color.secondary};
  font-size: ${themeCssVariables.font.size.xs};
  margin: 0;
`;

const StyledSidebarBody = styled.div`
  display: flex;
  flex: 1;
  flex-direction: column;
  gap: ${themeCssVariables.spacing[3]};
  min-height: 0;
  overflow-y: auto;
  padding: ${themeCssVariables.spacing[3]};
`;

const StyledStatGrid = styled.div`
  display: grid;
  gap: ${themeCssVariables.spacing[2]};
  grid-template-columns: 1fr 1fr;
`;

const StyledStat = styled.div`
  background: ${themeCssVariables.background.tertiary};
  border-radius: ${themeCssVariables.border.radius.sm};
  display: flex;
  flex-direction: column;
  gap: 2px;
  padding: ${themeCssVariables.spacing[2]};
`;

const StyledStatLabel = styled.span`
  color: ${themeCssVariables.font.color.tertiary};
  font-size: ${themeCssVariables.font.size.xs};
`;

const StyledStatValue = styled.span`
  color: ${themeCssVariables.font.color.primary};
  font-size: ${themeCssVariables.font.size.sm};
  font-weight: ${themeCssVariables.font.weight.semiBold};
`;

const StyledBadgeRow = styled.div`
  display: flex;
  flex-wrap: wrap;
  gap: ${themeCssVariables.spacing[1]};
`;

const StyledSidebarFooter = styled.div`
  border-top: 1px solid ${themeCssVariables.border.color.light};
  display: flex;
  flex-direction: column;
  gap: ${themeCssVariables.spacing[2]};
  padding: ${themeCssVariables.spacing[3]};
`;

const StyledEmptyHint = styled.p`
  color: ${themeCssVariables.font.color.secondary};
  font-size: ${themeCssVariables.font.size.sm};
  line-height: 1.45;
  margin: 0;
`;

const StyledParkNameAccent = styled.span`
  color: ${PARKS_BRAND.primary};
`;

export const ParksInventoryParkMap = ({
  parks,
  onSelectPark,
}: ParksInventoryParkMapProps) => {
  const { colorScheme } = useContext(ThemeContext);
  const { records: parques, loading } = useParksParques();
  const [selectedParqueId, setSelectedParqueId] = useState<string | null>(null);

  const portfolioParqueIds = useMemo(
    () => new Set(parks.map((park) => park.parqueId)),
    [parks],
  );

  const mapParques = useMemo(
    () => parques.filter((parque) => portfolioParqueIds.has(parque.id)),
    [parques, portfolioParqueIds],
  );

  const selectedPark =
    parks.find((park) => park.parqueId === selectedParqueId) ?? null;
  const isConstruction =
    isDefined(selectedPark) && isParksParkUnderConstruction(selectedPark);

  if (loading) {
    return <ParksLoadingSkeleton variant="list" />;
  }

  if (mapParques.length === 0) {
    return (
      <ParksEmptyState
        title={t`Sin parques en el mapa`}
        description={t`Cuando haya parques en cartera, aparecerán aquí. Usa Parques o Lista mientras tanto.`}
      />
    );
  }

  return (
    <StyledMapWorkspace>
      <StyledMapPane>
        <ParksOsmMapPanel
          parques={mapParques}
          naves={[]}
          showParques={true}
          showLeads={false}
          selectedParqueId={selectedParqueId}
          colorScheme={colorScheme}
          onSelectParque={setSelectedParqueId}
        />
      </StyledMapPane>
      <StyledSidebarPane>
        {isDefined(selectedPark) ? (
          <>
            <StyledSidebarHeader>
              <StyledSidebarTitle>
                <StyledParkNameAccent>{selectedPark.nombre}</StyledParkNameAccent>
              </StyledSidebarTitle>
              <StyledSidebarMeta>
                {selectedPark.ubicacion ?? t`Sin ubicación`}
              </StyledSidebarMeta>
              <StyledBadgeRow>
                {isConstruction ? (
                  <ParksStatusBadge
                    color="orange"
                    label={t`En construcción`}
                  />
                ) : (
                  <ParksStatusBadge
                    color={getParksOcupacionMetricAccent(
                      selectedPark.ocupacion,
                    )}
                    label={`${selectedPark.ocupacion}% ${t`ocupación`}`}
                  />
                )}
                {selectedPark.constructionNaveCount > 0 ? (
                  <ParksStatusBadge
                    color="orange"
                    label={t`${selectedPark.constructionNaveCount} en obra`}
                  />
                ) : null}
              </StyledBadgeRow>
            </StyledSidebarHeader>
            <StyledSidebarBody>
              <StyledStatGrid>
                <StyledStat>
                  <StyledStatLabel>{t`m² disponibles`}</StyledStatLabel>
                  <StyledStatValue>
                    {formatParksNumber(selectedPark.m2Disponibles)}
                  </StyledStatValue>
                </StyledStat>
                <StyledStat>
                  <StyledStatLabel>{t`m² totales`}</StyledStatLabel>
                  <StyledStatValue>
                    {formatParksNumber(selectedPark.m2Totales)}
                  </StyledStatValue>
                </StyledStat>
                <StyledStat>
                  <StyledStatLabel>{t`Naves`}</StyledStatLabel>
                  <StyledStatValue>
                    {`${selectedPark.availableNaves.length} / ${selectedPark.totalNaveCount}`}
                  </StyledStatValue>
                </StyledStat>
                <StyledStat>
                  <StyledStatLabel>{t`Leads`}</StyledStatLabel>
                  <StyledStatValue>{selectedPark.leads.length}</StyledStatValue>
                </StyledStat>
              </StyledStatGrid>
              {selectedPark.pipelineValueUsd > 0 ? (
                <StyledStat>
                  <StyledStatLabel>{t`Pipeline`}</StyledStatLabel>
                  <StyledStatValue>
                    {formatParksUsd(selectedPark.pipelineValueUsd)}
                  </StyledStatValue>
                </StyledStat>
              ) : null}
              {isConstruction ? (
                <StyledSidebarMeta>
                  {t`Pre-renta de naves antes de entrega`}
                  {selectedPark.constructionM2 > 0
                    ? ` · ${formatParksNumber(selectedPark.constructionM2)} m²`
                    : ''}
                </StyledSidebarMeta>
              ) : (
                <StyledSidebarMeta>
                  {selectedPark.oldestVacantNave
                    ? t`Más tiempo vacía: ${selectedPark.oldestVacantNave.identificador} · ${selectedPark.oldestVacantNave.daysVacant ?? 0}d`
                    : t`Sin naves disponibles`}
                </StyledSidebarMeta>
              )}
            </StyledSidebarBody>
            <StyledSidebarFooter>
              <Button
                title={t`Ver parque`}
                variant="primary"
                accent="blue"
                fullWidth
                onClick={() => onSelectPark(selectedPark.parqueId)}
              />
              <Button
                title={t`Cerrar`}
                variant="secondary"
                fullWidth
                onClick={() => setSelectedParqueId(null)}
              />
            </StyledSidebarFooter>
          </>
        ) : (
          <StyledSidebarBody>
            <StyledSidebarTitle>{t`Detalle del parque`}</StyledSidebarTitle>
            <StyledEmptyHint>
              {t`Haz clic en un marcador del mapa para ver ocupación, disponibilidad y pipeline aquí.`}
            </StyledEmptyHint>
          </StyledSidebarBody>
        )}
      </StyledSidebarPane>
    </StyledMapWorkspace>
  );
};
