import { styled } from '@linaria/react';
import { t } from '@lingui/core/macro';
import { useCallback, useContext, useEffect, useMemo, useState } from 'react';
import {
  IconAlertTriangle,
  IconBox,
  IconBuildingSkyscraper,
  IconChartBar,
  IconCurrencyDollar,
  IconMap,
} from 'twenty-ui/icon';
import { MOBILE_VIEWPORT, ThemeContext, themeCssVariables } from 'twenty-ui/theme-constants';

import { getParqueCoordinates } from '@/parks-industrial/constants/parks-industrial.constants';
import { type ParksNaveRecord } from '@/parks-industrial/hooks/useParksRecords';
import { type ParksParqueRecord } from '@/parks-industrial/hooks/useParksParques';
import { useParksMapMetrics } from '@/parks-industrial/hooks/useParksMapMetrics';
import {
  getParksGoogleMapsApiKey,
  isValidGoogleMapsApiKey,
  ParksGoogleMapPanel,
} from '@/parks-industrial/components/mapa/ParksGoogleMapPanel';
import { ParksParqueSidebarCard } from '@/parks-industrial/components/mapa/ParksParqueSidebarCard';
import { ParksAiQuickActions } from '@/parks-industrial/components/ai/ParksAiQuickActions';
import { ParksEmptyState } from '@/parks-industrial/components/ui/ParksEmptyState';
import { useParksAiAssistant } from '@/parks-industrial/hooks/useParksAiAssistant';
import { buildParksMapQuickActions } from '@/parks-industrial/utils/parks-ai-quick-actions.util';
import { ParksMetricCard } from '@/parks-industrial/components/ui/ParksMetricCard';
import {
  StyledParksInput,
  StyledParksSelect,
} from '@/parks-industrial/components/ui/parks-form-control.styles';
import {
  formatParksNumber,
  formatParksUsd,
  getParksOcupacionColor,
  getParksParqueOcupacion,
} from '@/parks-industrial/utils/parks-format.util';
import {
  filterParquesForMap,
  getParksMapCityFilterOptions,
  type ParksMapCityFilterId,
} from '@/parks-industrial/utils/parks-map-city-filter.util';

const StyledPageStack = styled.div`
  display: flex;
  flex-direction: column;
  gap: ${themeCssVariables.spacing[4]};
  min-height: 0;
`;

const StyledMetricsRow = styled.div`
  display: grid;
  gap: ${themeCssVariables.spacing[3]};
  grid-template-columns: repeat(auto-fit, minmax(170px, 1fr));
`;

const StyledRegionalRow = styled.div`
  display: flex;
  flex-wrap: wrap;
  gap: ${themeCssVariables.spacing[2]};
`;

const StyledRegionalChip = styled.button`
  background: ${themeCssVariables.background.primary};
  border: 1px solid ${themeCssVariables.border.color.medium};
  border-radius: ${themeCssVariables.border.radius.pill};
  color: ${themeCssVariables.font.color.secondary};
  cursor: pointer;
  font-size: ${themeCssVariables.font.size.xs};
  padding: ${themeCssVariables.spacing[1]} ${themeCssVariables.spacing[2]};
  transition: border-color 0.15s ease;

  &:hover {
    border-color: ${themeCssVariables.border.color.strong};
    color: ${themeCssVariables.font.color.primary};
  }
`;

const StyledMapLegend = styled.div`
  align-items: center;
  background: ${themeCssVariables.background.primary};
  border: 1px solid ${themeCssVariables.border.color.medium};
  border-radius: ${themeCssVariables.border.radius.sm};
  bottom: ${themeCssVariables.spacing[3]};
  color: ${themeCssVariables.font.color.secondary};
  display: flex;
  flex-wrap: wrap;
  font-size: ${themeCssVariables.font.size.xs};
  gap: ${themeCssVariables.spacing[3]};
  left: ${themeCssVariables.spacing[3]};
  padding: ${themeCssVariables.spacing[2]} ${themeCssVariables.spacing[3]};
  position: absolute;
  z-index: 2;
`;

const StyledLegendItem = styled.span`
  align-items: center;
  display: inline-flex;
  gap: 6px;
`;

const StyledLegendDot = styled.span<{ dotColor: string }>`
  background: ${({ dotColor }) => dotColor};
  border-radius: 50%;
  height: 10px;
  width: 10px;
`;

const StyledMapWorkspace = styled.div`
  background: ${themeCssVariables.background.primary};
  border: 1px solid ${themeCssVariables.border.color.medium};
  border-radius: ${themeCssVariables.border.radius.md};
  display: grid;
  min-height: clamp(480px, calc(100dvh - 320px), 720px);
  overflow: hidden;

  @media (min-width: ${MOBILE_VIEWPORT}px) {
    grid-template-columns: minmax(0, 1.65fr) minmax(300px, 380px);
  }
`;

const StyledMapPane = styled.div`
  height: 100%;
  min-height: 360px;
  min-width: 0;
  position: relative;
`;

const StyledSidebarPane = styled.aside`
  border-top: 1px solid ${themeCssVariables.border.color.medium};
  display: flex;
  flex-direction: column;
  min-height: 0;
  min-width: 0;

  @media (min-width: ${MOBILE_VIEWPORT}px) {
    border-left: 1px solid ${themeCssVariables.border.color.medium};
    border-top: none;
  }
`;

const StyledSidebarHeader = styled.div`
  background: ${themeCssVariables.background.primary};
  border-bottom: 1px solid ${themeCssVariables.border.color.light};
  flex-shrink: 0;
  padding: ${themeCssVariables.spacing[3]};
`;

const StyledSidebarTitle = styled.h3`
  color: ${themeCssVariables.font.color.primary};
  font-size: ${themeCssVariables.font.size.md};
  font-weight: ${themeCssVariables.font.weight.semiBold};
  margin: 0 0 ${themeCssVariables.spacing[2]};
`;

const StyledSidebarMeta = styled.p`
  color: ${themeCssVariables.font.color.tertiary};
  font-size: ${themeCssVariables.font.size.xs};
  margin: ${themeCssVariables.spacing[2]} 0 0;
`;

const StyledSearchInput = styled(StyledParksInput)`
  padding: ${themeCssVariables.spacing[2]};
  width: 100%;
`;

const StyledCitySelect = styled(StyledParksSelect)`
  width: 100%;
`;

const StyledFilterStack = styled.div`
  display: flex;
  flex-direction: column;
  gap: ${themeCssVariables.spacing[2]};
`;

const StyledSidebarList = styled.div`
  display: flex;
  flex: 1;
  flex-direction: column;
  gap: ${themeCssVariables.spacing[2]};
  min-height: 0;
  overflow-y: auto;
  padding: ${themeCssVariables.spacing[3]};

  > * {
    flex-shrink: 0;
  }
`;

const StyledFallbackMap = styled.div`
  background: linear-gradient(
    145deg,
    ${themeCssVariables.color.blue1} 0%,
    ${themeCssVariables.background.tertiary} 45%,
    ${themeCssVariables.color.green1} 100%
  );
  height: 100%;
  min-height: 360px;
  overflow: hidden;
  position: relative;
`;

const StyledFallbackGrid = styled.div`
  background-image:
    linear-gradient(${themeCssVariables.border.color.light} 1px, transparent 1px),
    linear-gradient(
      90deg,
      ${themeCssVariables.border.color.light} 1px,
      transparent 1px
    );
  background-size: 40px 40px;
  inset: 0;
  opacity: 0.35;
  position: absolute;
`;

const StyledMapDot = styled.button<{
  dotColor: string;
  left: number;
  top: number;
  isSelected: boolean;
}>`
  background: ${({ dotColor }) => dotColor};
  border: 3px solid ${themeCssVariables.background.primary};
  border-radius: 50%;
  box-shadow: ${themeCssVariables.boxShadow.light};
  cursor: pointer;
  height: ${({ isSelected }) => (isSelected ? 22 : 16)}px;
  left: ${({ left }) => `${left}%`};
  position: absolute;
  top: ${({ top }) => `${top}%`};
  transform: translate(-50%, -50%);
  transition:
    height 0.15s ease,
    width 0.15s ease;
  width: ${({ isSelected }) => (isSelected ? 22 : 16)}px;
  z-index: 1;

  &:hover {
    box-shadow: ${themeCssVariables.boxShadow.strong};
  }
`;

const StyledDotLabel = styled.div<{ left: number; top: number }>`
  background: ${themeCssVariables.background.primary};
  border: 1px solid ${themeCssVariables.border.color.medium};
  border-radius: ${themeCssVariables.border.radius.sm};
  color: ${themeCssVariables.font.color.primary};
  font-size: ${themeCssVariables.font.size.xs};
  left: ${({ left }) => `${left}%`};
  max-width: 140px;
  overflow: hidden;
  padding: 2px 6px;
  position: absolute;
  text-overflow: ellipsis;
  top: ${({ top }) => `calc(${top}% + 14px)`};
  transform: translateX(-50%);
  white-space: nowrap;
  z-index: 1;
`;

const StyledFallbackBanner = styled.div`
  background: ${themeCssVariables.background.primary};
  border: 1px solid ${themeCssVariables.border.color.medium};
  border-radius: ${themeCssVariables.border.radius.sm};
  bottom: ${themeCssVariables.spacing[3]};
  color: ${themeCssVariables.font.color.secondary};
  font-size: ${themeCssVariables.font.size.sm};
  left: ${themeCssVariables.spacing[3]};
  padding: ${themeCssVariables.spacing[2]} ${themeCssVariables.spacing[3]};
  position: absolute;
  right: ${themeCssVariables.spacing[3]};
`;

const projectLatLngToCanvas = (lat: number, lng: number) => {
  const left = ((lng + 118) / 12) * 100;
  const top = ((32 - lat) / 12) * 100;

  return {
    left: Math.min(Math.max(left, 8), 92),
    top: Math.min(Math.max(top, 8), 92),
  };
};

const syncSelectedParqueId = (
  filteredParques: ParksParqueRecord[],
  selectedParqueId: string | null,
): string | null => {
  const isSelectedParqueVisible = filteredParques.some(
    (parque) => parque.id === selectedParqueId,
  );

  if (isSelectedParqueVisible) {
    return selectedParqueId;
  }

  return filteredParques[0]?.id ?? null;
};

type ParksMapContentProps = {
  parques: ParksParqueRecord[];
  naves: ParksNaveRecord[];
};

const buildMapFilterSummaryLabel = ({
  isFiltered,
  visibleParqueCount,
  totalParqueCount,
  cityFilterId,
  cityFilterLabel,
  searchQuery,
}: {
  isFiltered: boolean;
  visibleParqueCount: number;
  totalParqueCount: number;
  cityFilterId: ParksMapCityFilterId;
  cityFilterLabel: string;
  searchQuery: string;
}): string => {
  if (!isFiltered) {
    return t`${totalParqueCount} parques en cartera`;
  }

  const filterParts: string[] = [];

  if (cityFilterId !== 'all') {
    filterParts.push(cityFilterLabel);
  }

  if (searchQuery.length > 0) {
    filterParts.push(t`“${searchQuery}”`);
  }

  const filterSuffix =
    filterParts.length > 0 ? ` · ${filterParts.join(' · ')}` : '';

  return t`${visibleParqueCount} de ${totalParqueCount} parques${filterSuffix}`;
};

export const ParksMapContent = ({ parques, naves }: ParksMapContentProps) => {
  const { colorScheme } = useContext(ThemeContext);
  const { setContextPatch } = useParksAiAssistant();
  const [selectedParqueId, setSelectedParqueId] = useState<string | null>(
    parques[0]?.id ?? null,
  );
  const [searchQuery, setSearchQuery] = useState('');
  const [cityFilterId, setCityFilterId] =
    useState<ParksMapCityFilterId>('all');
  const googleMapsApiKey = getParksGoogleMapsApiKey();
  const hasGoogleMapsApiKey = isValidGoogleMapsApiKey(googleMapsApiKey);

  const cityFilterOptions = useMemo(
    () => getParksMapCityFilterOptions(parques),
    [parques],
  );

  const filteredParques = useMemo(
    () =>
      filterParquesForMap({
        parques,
        searchQuery,
        cityFilterId,
      }),
    [parques, searchQuery, cityFilterId],
  );

  const mapMetrics = useParksMapMetrics({
    filteredParques,
    allParques: parques,
    cityFilterId,
    searchQuery,
  });

  useEffect(() => {
    setContextPatch({
      screen: 'map',
      cityFilterId,
      searchQuery,
    });
  }, [cityFilterId, searchQuery, setContextPatch]);

  const selectedParque =
    filteredParques.find((parque) => parque.id === selectedParqueId) ??
    filteredParques[0] ??
    null;

  const handleSearchQueryChange = useCallback(
    (nextSearchQuery: string) => {
      setSearchQuery(nextSearchQuery);

      const nextFilteredParques = filterParquesForMap({
        parques,
        searchQuery: nextSearchQuery,
        cityFilterId,
      });

      setSelectedParqueId((currentSelectedParqueId) =>
        syncSelectedParqueId(nextFilteredParques, currentSelectedParqueId),
      );
    },
    [parques, cityFilterId],
  );

  const handleCityFilterChange = useCallback(
    (nextCityFilterId: ParksMapCityFilterId) => {
      setCityFilterId(nextCityFilterId);

      const nextFilteredParques = filterParquesForMap({
        parques,
        searchQuery,
        cityFilterId: nextCityFilterId,
      });

      setSelectedParqueId((currentSelectedParqueId) =>
        syncSelectedParqueId(nextFilteredParques, currentSelectedParqueId),
      );
    },
    [parques, searchQuery],
  );

  if (parques.length === 0) {
    return (
      <ParksEmptyState
        title={t`No hay parques registrados`}
        description={t`Agrega parques industriales en Twenty para visualizarlos aquí.`}
      />
    );
  }

  return (
    <StyledPageStack>
      <StyledMetricsRow>
        <ParksMetricCard
          label={
            mapMetrics.filterContext.isFiltered
              ? t`Parques visibles`
              : t`Parques activos`
          }
          value={mapMetrics.portfolio.parqueCount}
          icon={IconMap}
          accent="blue"
          trend={
            mapMetrics.filterContext.isFiltered
              ? t`${mapMetrics.filterContext.totalParqueCount} en cartera total`
              : t`${formatParksNumber(mapMetrics.portfolio.m2Totales)} m² totales`
          }
        />
        <ParksMetricCard
          label={t`m² rentados / disponibles`}
          value={`${formatParksNumber(mapMetrics.portfolio.m2Rentados)} / ${formatParksNumber(mapMetrics.portfolio.m2Disponibles)}`}
          icon={IconBuildingSkyscraper}
          accent="gray"
          trend={
            mapMetrics.filterContext.isFiltered
              ? mapMetrics.filterContext.cityFilterLabel
              : t`Cartera consolidada`
          }
        />
        <ParksMetricCard
          label={t`Ocupación de cartera`}
          value={`${mapMetrics.portfolio.ocupacion}%`}
          icon={IconChartBar}
          accent={mapMetrics.ocupacionAccent}
          trend={t`Ponderada por m²`}
        />
        <ParksMetricCard
          label={t`Naves disponibles`}
          value={mapMetrics.naveDisponibilidad.navesDisponiblesCount}
          icon={IconBox}
          accent="blue"
          trend={t`${formatParksNumber(mapMetrics.naveDisponibilidad.m2CatalogoDisponible)} m² en catálogo`}
        />
        <ParksMetricCard
          label={t`Ingresos mensuales`}
          value={formatParksUsd(mapMetrics.operational.ingresosMensuales)}
          icon={IconCurrencyDollar}
          accent="gray"
          trend={
            mapMetrics.filterContext.isFiltered
              ? t`Expedientes activos filtrados`
              : t`Expedientes activos`
          }
        />
        <ParksMetricCard
          label={t`Contratos por vencer`}
          value={mapMetrics.operational.contratosPorVencer}
          icon={IconAlertTriangle}
          accent={
            mapMetrics.operational.contratosPorVencer > 0 ? 'red' : 'green'
          }
          trend={t`Próximos 90 días`}
        />
      </StyledMetricsRow>

      {cityFilterId === 'all' &&
      mapMetrics.regionalSummaries.length > 0 &&
      !mapMetrics.filterContext.searchQuery ? (
        <StyledRegionalRow>
          {mapMetrics.regionalSummaries.map((regionalSummary) => (
            <StyledRegionalChip
              key={regionalSummary.cityFilterId}
              type="button"
              onClick={() =>
                handleCityFilterChange(regionalSummary.cityFilterId)
              }
            >
              {regionalSummary.label} · {regionalSummary.parqueCount}{' '}
              {t`parques`} · {regionalSummary.ocupacion}% ·{' '}
              {formatParksNumber(regionalSummary.m2Disponibles)} m² {t`libres`}
            </StyledRegionalChip>
          ))}
        </StyledRegionalRow>
      ) : null}

      <ParksAiQuickActions actions={buildParksMapQuickActions()} />

      <StyledMapWorkspace>
        <StyledMapPane>
          {hasGoogleMapsApiKey ? (
            <>
              <ParksGoogleMapPanel
                parques={filteredParques}
                naves={naves}
                selectedParqueId={selectedParque?.id ?? null}
                colorScheme={colorScheme}
                onSelectParque={setSelectedParqueId}
              />
              <StyledMapLegend>
                <StyledLegendItem>
                  <StyledLegendDot
                    dotColor={getParksOcupacionColor(90)}
                  />
                  {t`Alta (≥85%)`}
                </StyledLegendItem>
                <StyledLegendItem>
                  <StyledLegendDot
                    dotColor={getParksOcupacionColor(70)}
                  />
                  {t`Media (60–84%)`}
                </StyledLegendItem>
                <StyledLegendItem>
                  <StyledLegendDot
                    dotColor={getParksOcupacionColor(40)}
                  />
                  {t`Baja (<60%)`}
                </StyledLegendItem>
              </StyledMapLegend>
            </>
          ) : (
            <StyledFallbackMap>
              <StyledFallbackGrid />
              {filteredParques.map((parque) => {
                const coords = getParqueCoordinates(
                  parque.nombre ?? '',
                  parque.ubicacion,
                );
                const position = projectLatLngToCanvas(coords.lat, coords.lng);
                const ocupacion = getParksParqueOcupacion(
                  parque.m2Totales,
                  parque.m2Rentados,
                );
                const isSelected = selectedParque?.id === parque.id;

                return (
                  <div key={parque.id}>
                    <StyledMapDot
                      type="button"
                      dotColor={getParksOcupacionColor(ocupacion)}
                      left={position.left}
                      top={position.top}
                      isSelected={isSelected}
                      onClick={() => setSelectedParqueId(parque.id)}
                      aria-label={parque.nombre ?? t`Parque`}
                    />
                    {isSelected ? (
                      <StyledDotLabel
                        left={position.left}
                        top={position.top}
                      >
                        {parque.nombre}
                      </StyledDotLabel>
                    ) : null}
                  </div>
                );
              })}
              <StyledFallbackBanner>
                {t`Configura REACT_APP_GOOGLE_MAPS_API_KEY en twenty-front/.env para el mapa interactivo.`}
                {selectedParque
                  ? ` · ${selectedParque.nombre} — ${selectedParque.ubicacion}`
                  : ''}
              </StyledFallbackBanner>
            </StyledFallbackMap>
          )}
        </StyledMapPane>

        <StyledSidebarPane>
          <StyledSidebarHeader>
            <StyledSidebarTitle>{t`Cartera de parques`}</StyledSidebarTitle>
            <StyledFilterStack>
              <StyledCitySelect
                value={cityFilterId}
                onChange={(event) =>
                  handleCityFilterChange(
                    event.target.value as ParksMapCityFilterId,
                  )
                }
                aria-label={t`Filtrar por ciudad`}
              >
                {cityFilterOptions.map((cityFilterOption) => (
                  <option
                    key={cityFilterOption.id}
                    value={cityFilterOption.id}
                  >
                    {cityFilterOption.label}
                  </option>
                ))}
              </StyledCitySelect>
              <StyledSearchInput
                type="search"
                placeholder={t`Buscar parque...`}
                value={searchQuery}
                onChange={(event) =>
                  handleSearchQueryChange(event.target.value)
                }
              />
            </StyledFilterStack>
            <StyledSidebarMeta>
              {buildMapFilterSummaryLabel({
                isFiltered: mapMetrics.filterContext.isFiltered,
                visibleParqueCount: mapMetrics.filterContext.visibleParqueCount,
                totalParqueCount: mapMetrics.filterContext.totalParqueCount,
                cityFilterId: mapMetrics.filterContext.cityFilterId,
                cityFilterLabel: mapMetrics.filterContext.cityFilterLabel,
                searchQuery: mapMetrics.filterContext.searchQuery,
              })}
              {hasGoogleMapsApiKey ? ` · ${t`Google Maps`}` : ` · ${t`Vista simplificada`}`}
            </StyledSidebarMeta>
          </StyledSidebarHeader>

          <StyledSidebarList>
            {filteredParques.length === 0 ? (
              <ParksEmptyState
                title={t`Ningún parque coincide con los filtros`}
              />
            ) : (
              filteredParques.map((parque) => (
                <ParksParqueSidebarCard
                  key={parque.id}
                  parque={parque}
                  isSelected={selectedParque?.id === parque.id}
                  onSelect={setSelectedParqueId}
                />
              ))
            )}
          </StyledSidebarList>
        </StyledSidebarPane>
      </StyledMapWorkspace>
    </StyledPageStack>
  );
};
