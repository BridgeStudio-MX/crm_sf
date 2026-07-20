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
  IconUsers,
} from 'twenty-ui/icon';
import { Button } from 'twenty-ui/input';
import { MOBILE_VIEWPORT, ThemeContext, themeCssVariables } from 'twenty-ui/theme-constants';

import { getParqueCoordinates } from '@/parks-industrial/constants/parks-industrial.constants';
import {
  type ParksExpedienteRecord,
  type ParksNaveRecord,
  type ParksOpportunityRecord,
} from '@/parks-industrial/hooks/useParksRecords';
import { type ParksParqueRecord } from '@/parks-industrial/hooks/useParksParques';
import { useParksMapMetrics } from '@/parks-industrial/hooks/useParksMapMetrics';
import {
  ParksGoogleMapPanel,
} from '@/parks-industrial/components/mapa/ParksGoogleMapPanel';
import { ParksLeadSidebarCard } from '@/parks-industrial/components/mapa/ParksLeadSidebarCard';
import { ParksMapLeadOutreachPanel } from '@/parks-industrial/components/mapa/ParksMapLeadOutreachPanel';
import { useParksGoogleMapsApiKey } from '@/parks-industrial/hooks/useParksGoogleMapsApiKey';
import { ParksLoadingSkeleton } from '@/parks-industrial/components/ui/ParksLoadingSkeleton';
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
import {
  buildParksMapLeadMarkers,
  filterParksMapLeads,
  getParksMapLayerOptions,
  PARKS_MAP_LEAD_MARKER_COLOR,
  resolveParksMapLeadRegionId,
  type ParksMapLayerId,
  type ParksMapLeadRegionId,
} from '@/parks-industrial/utils/parks-map-leads.util';
import { buildParksMapOfferableNaves } from '@/parks-industrial/utils/parks-map-offerable-naves.util';

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

const StyledLayerToggle = styled.div`
  display: grid;
  gap: ${themeCssVariables.spacing[1]};
  grid-template-columns: repeat(3, minmax(0, 1fr));
`;

const StyledLayerButton = styled.button<{ isActive: boolean }>`
  background: ${({ isActive }) =>
    isActive
      ? themeCssVariables.background.transparent.medium
      : themeCssVariables.background.primary};
  border: 1px solid
    ${({ isActive }) =>
      isActive
        ? themeCssVariables.border.color.strong
        : themeCssVariables.border.color.medium};
  border-radius: ${themeCssVariables.border.radius.sm};
  color: ${({ isActive }) =>
    isActive
      ? themeCssVariables.font.color.primary
      : themeCssVariables.font.color.secondary};
  cursor: pointer;
  font-size: ${themeCssVariables.font.size.xs};
  font-weight: ${({ isActive }) =>
    isActive
      ? themeCssVariables.font.weight.semiBold
      : themeCssVariables.font.weight.regular};
  padding: ${themeCssVariables.spacing[1]} ${themeCssVariables.spacing[2]};
`;

const StyledSidebarSectionLabel = styled.p`
  color: ${themeCssVariables.font.color.tertiary};
  font-size: ${themeCssVariables.font.size.xs};
  font-weight: ${themeCssVariables.font.weight.semiBold};
  letter-spacing: 0.04em;
  margin: 0;
  text-transform: uppercase;
`;

const StyledSelectionToolbar = styled.div`
  align-items: center;
  border-bottom: 1px solid ${themeCssVariables.border.color.light};
  display: flex;
  flex-wrap: wrap;
  gap: ${themeCssVariables.spacing[2]};
  padding: ${themeCssVariables.spacing[2]} ${themeCssVariables.spacing[3]};
`;

const StyledSelectionCount = styled.span`
  color: ${themeCssVariables.font.color.secondary};
  flex: 1;
  font-size: ${themeCssVariables.font.size.xs};
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
  isDiamond?: boolean;
}>`
  background: ${({ dotColor }) => dotColor};
  border: 3px solid ${themeCssVariables.background.primary};
  border-radius: ${({ isDiamond }) => (isDiamond ? '2px' : '50%')};
  box-shadow: ${themeCssVariables.boxShadow.light};
  cursor: pointer;
  height: ${({ isSelected }) => (isSelected ? 22 : 16)}px;
  left: ${({ left }) => `${left}%`};
  position: absolute;
  top: ${({ top }) => `${top}%`};
  transform: ${({ isDiamond }) =>
    isDiamond
      ? 'translate(-50%, -50%) rotate(45deg)'
      : 'translate(-50%, -50%)'};
  transition:
    height 0.15s ease,
    width 0.15s ease;
  width: ${({ isSelected }) => (isSelected ? 22 : 16)}px;
  z-index: 1;

  &:hover {
    box-shadow: ${themeCssVariables.boxShadow.strong};
  }
`;

const StyledLeadCountBadge = styled.span<{ left: number; top: number }>`
  background: ${PARKS_MAP_LEAD_MARKER_COLOR};
  border: 2px solid ${themeCssVariables.background.primary};
  border-radius: ${themeCssVariables.border.radius.pill};
  color: ${themeCssVariables.font.color.inverted};
  font-size: 10px;
  font-weight: ${themeCssVariables.font.weight.semiBold};
  left: ${({ left }) => `${left}%`};
  padding: 0 5px;
  position: absolute;
  top: ${({ top }) => `calc(${top}% - 18px)`};
  transform: translateX(-50%);
  z-index: 2;
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
  opportunities: ParksOpportunityRecord[];
  expedientes: ParksExpedienteRecord[];
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

export const ParksMapContent = ({
  parques,
  naves,
  opportunities,
  expedientes,
}: ParksMapContentProps) => {
  const { colorScheme } = useContext(ThemeContext);
  const { setContextPatch } = useParksAiAssistant();
  const [selectedParqueId, setSelectedParqueId] = useState<string | null>(
    parques[0]?.id ?? null,
  );
  const [selectedLeadRegionId, setSelectedLeadRegionId] =
    useState<ParksMapLeadRegionId | null>(null);
  const [selectedLeadId, setSelectedLeadId] = useState<string | null>(null);
  const [checkedLeadIds, setCheckedLeadIds] = useState<string[]>([]);
  const [searchQuery, setSearchQuery] = useState('');
  const [cityFilterId, setCityFilterId] =
    useState<ParksMapCityFilterId>('all');
  const [mapLayerId, setMapLayerId] = useState<ParksMapLayerId>('ambos');
  const {
    apiKey: googleMapsApiKey,
    isReady: hasGoogleMapsApiKey,
    isLoading: isGoogleMapsApiKeyLoading,
  } = useParksGoogleMapsApiKey();
  const showParques = mapLayerId === 'inventario' || mapLayerId === 'ambos';
  const showLeads = mapLayerId === 'demanda' || mapLayerId === 'ambos';
  const mapLayerOptions = useMemo(() => getParksMapLayerOptions(), []);

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

  const filteredLeads = useMemo(
    () =>
      filterParksMapLeads({
        opportunities,
        cityFilterId,
        searchQuery,
      }),
    [opportunities, cityFilterId, searchQuery],
  );

  const leadMarkers = useMemo(
    () => buildParksMapLeadMarkers(filteredLeads),
    [filteredLeads],
  );

  const sidebarLeads = useMemo(() => {
    if (!selectedLeadRegionId) {
      return filteredLeads;
    }

    return filteredLeads.filter(
      (lead) =>
        resolveParksMapLeadRegionId(lead.ubicacionDeseada) ===
        selectedLeadRegionId,
    );
  }, [filteredLeads, selectedLeadRegionId]);

  const selectedLeadsForOutreach = useMemo(
    () =>
      filteredLeads.filter((lead) => checkedLeadIds.includes(lead.id)),
    [checkedLeadIds, filteredLeads],
  );

  const offerableNaves = useMemo(
    () =>
      buildParksMapOfferableNaves({
        naves,
        parques,
        expedientes,
        preferredRegionId: selectedLeadRegionId,
      }),
    [expedientes, naves, parques, selectedLeadRegionId],
  );

  const mapMetrics = useParksMapMetrics({
    filteredParques,
    allParques: parques,
    cityFilterId,
    searchQuery,
  });

  const totalLeadM2 = useMemo(
    () =>
      filteredLeads.reduce(
        (sum, lead) => sum + (lead.m2Requeridos ?? 0),
        0,
      ),
    [filteredLeads],
  );

  useEffect(() => {
    setContextPatch({
      screen: 'map',
      cityFilterId,
      searchQuery,
      mapLayerId,
    });
  }, [cityFilterId, searchQuery, mapLayerId, setContextPatch]);

  useEffect(() => {
    setCheckedLeadIds((currentCheckedLeadIds) =>
      currentCheckedLeadIds.filter((leadId) =>
        filteredLeads.some((lead) => lead.id === leadId),
      ),
    );
  }, [filteredLeads]);

  const selectedParque =
    filteredParques.find((parque) => parque.id === selectedParqueId) ??
    (showParques ? filteredParques[0] ?? null : null);

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
      setSelectedLeadRegionId(null);
      setSelectedLeadId(null);
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
      setSelectedLeadRegionId(null);
      setSelectedLeadId(null);
    },
    [parques, searchQuery],
  );

  const handleSelectLeadRegion = useCallback(
    (regionId: ParksMapLeadRegionId | null) => {
      setSelectedLeadRegionId(regionId);
      setSelectedLeadId(null);

      if (regionId) {
        setSelectedParqueId(null);
      }
    },
    [],
  );

  const handleSelectRegionLeads = useCallback(
    (regionId: ParksMapLeadRegionId) => {
      setSelectedLeadRegionId(regionId);
      setSelectedParqueId(null);
      setMapLayerId((currentLayer) =>
        currentLayer === 'inventario' ? 'ambos' : currentLayer,
      );

      const regionLeadIds = filteredLeads
        .filter(
          (lead) =>
            resolveParksMapLeadRegionId(lead.ubicacionDeseada) === regionId,
        )
        .map((lead) => lead.id);

      setCheckedLeadIds(regionLeadIds);
    },
    [filteredLeads],
  );

  const handleSelectLead = useCallback((leadId: string) => {
    setSelectedLeadId(leadId);
    const lead = opportunities.find(
      (opportunity) => opportunity.id === leadId,
    );

    if (!lead) {
      return;
    }

    setSelectedParqueId(null);
    setSelectedLeadRegionId(resolveParksMapLeadRegionId(lead.ubicacionDeseada));
  }, [opportunities]);

  const handleToggleLeadCheck = useCallback((leadId: string) => {
    setCheckedLeadIds((currentCheckedLeadIds) =>
      currentCheckedLeadIds.includes(leadId)
        ? currentCheckedLeadIds.filter((id) => id !== leadId)
        : [...currentCheckedLeadIds, leadId],
    );
  }, []);

  const handleSelectAllVisibleLeads = useCallback(() => {
    setCheckedLeadIds(sidebarLeads.map((lead) => lead.id));
  }, [sidebarLeads]);

  const handleClearLeadSelection = useCallback(() => {
    setCheckedLeadIds([]);
  }, []);

  const handleSelectParque = useCallback((parqueId: string | null) => {
    setSelectedParqueId(parqueId);
    setSelectedLeadRegionId(null);
    setSelectedLeadId(null);
  }, []);

  if (parques.length === 0 && opportunities.length === 0) {
    return (
      <ParksEmptyState
        title={t`No hay parques registrados`}
        description={t`Agrega parques industriales en Parks Industrial para visualizarlos aquí.`}
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
          label={t`Leads por ubicación`}
          value={filteredLeads.length}
          icon={IconUsers}
          accent="orange"
          trend={t`${formatParksNumber(totalLeadM2)} m² demandados`}
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
          {isGoogleMapsApiKeyLoading ? (
            <ParksLoadingSkeleton variant="map" />
          ) : hasGoogleMapsApiKey ? (
            <>
              <ParksGoogleMapPanel
                apiKey={googleMapsApiKey}
                parques={filteredParques}
                naves={naves}
                leadMarkers={leadMarkers}
                showParques={showParques}
                showLeads={showLeads}
                selectedParqueId={selectedParque?.id ?? null}
                selectedLeadRegionId={selectedLeadRegionId}
                colorScheme={colorScheme}
                onSelectParque={handleSelectParque}
                onSelectLeadRegion={handleSelectLeadRegion}
                onSelectRegionLeads={handleSelectRegionLeads}
              />
              <StyledMapLegend>
                {showParques ? (
                  <>
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
                  </>
                ) : null}
                {showLeads ? (
                  <StyledLegendItem>
                    <StyledLegendDot
                      dotColor={PARKS_MAP_LEAD_MARKER_COLOR}
                    />
                    {t`Leads por ubicación`}
                  </StyledLegendItem>
                ) : null}
              </StyledMapLegend>
            </>
          ) : (
            <StyledFallbackMap>
              <StyledFallbackGrid />
              {showParques
                ? filteredParques.map((parque) => {
                    const coords = getParqueCoordinates(
                      parque.nombre ?? '',
                      parque.ubicacion,
                    );
                    const position = projectLatLngToCanvas(
                      coords.lat,
                      coords.lng,
                    );
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
                          onClick={() => handleSelectParque(parque.id)}
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
                  })
                : null}
              {showLeads
                ? leadMarkers.map((leadMarker) => {
                    const position = projectLatLngToCanvas(
                      leadMarker.coords.lat,
                      leadMarker.coords.lng,
                    );
                    const isSelected =
                      selectedLeadRegionId === leadMarker.regionId;

                    return (
                      <div key={leadMarker.regionId}>
                        <StyledMapDot
                          type="button"
                          dotColor={PARKS_MAP_LEAD_MARKER_COLOR}
                          left={position.left}
                          top={position.top}
                          isSelected={isSelected}
                          isDiamond
                          onClick={() =>
                            handleSelectLeadRegion(leadMarker.regionId)
                          }
                          aria-label={leadMarker.label}
                        />
                        <StyledLeadCountBadge
                          left={position.left}
                          top={position.top}
                        >
                          {leadMarker.leadCount}
                        </StyledLeadCountBadge>
                        {isSelected ? (
                          <StyledDotLabel
                            left={position.left}
                            top={position.top}
                          >
                            {leadMarker.label}
                          </StyledDotLabel>
                        ) : null}
                      </div>
                    );
                  })
                : null}
              <StyledFallbackBanner>
                {t`Configura REACT_APP_GOOGLE_MAPS_API_KEY en twenty-front/.env para el mapa interactivo.`}
                {selectedParque
                  ? ` · ${selectedParque.nombre} — ${selectedParque.ubicacion}`
                  : selectedLeadRegionId
                    ? ` · ${t`Leads`} — ${selectedLeadRegionId}`
                    : ''}
              </StyledFallbackBanner>
            </StyledFallbackMap>
          )}
        </StyledMapPane>

        <StyledSidebarPane>
          <StyledSidebarHeader>
            <StyledSidebarTitle>
              {showLeads && !showParques
                ? t`Leads por ubicación`
                : showParques && !showLeads
                  ? t`Cartera de parques`
                  : t`Inventario y demanda`}
            </StyledSidebarTitle>
            <StyledFilterStack>
              <StyledLayerToggle role="group" aria-label={t`Capa del mapa`}>
                {mapLayerOptions.map((layerOption) => (
                  <StyledLayerButton
                    key={layerOption.id}
                    type="button"
                    isActive={mapLayerId === layerOption.id}
                    onClick={() => setMapLayerId(layerOption.id)}
                  >
                    {layerOption.label}
                  </StyledLayerButton>
                ))}
              </StyledLayerToggle>
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
                placeholder={
                  showLeads && !showParques
                    ? t`Buscar lead...`
                    : t`Buscar parque o lead...`
                }
                value={searchQuery}
                onChange={(event) =>
                  handleSearchQueryChange(event.target.value)
                }
              />
            </StyledFilterStack>
            <StyledSidebarMeta>
              {showParques
                ? buildMapFilterSummaryLabel({
                    isFiltered: mapMetrics.filterContext.isFiltered,
                    visibleParqueCount:
                      mapMetrics.filterContext.visibleParqueCount,
                    totalParqueCount:
                      mapMetrics.filterContext.totalParqueCount,
                    cityFilterId: mapMetrics.filterContext.cityFilterId,
                    cityFilterLabel:
                      mapMetrics.filterContext.cityFilterLabel,
                    searchQuery: mapMetrics.filterContext.searchQuery,
                  })
                : null}
              {showParques && showLeads ? ' · ' : null}
              {showLeads
                ? t`${filteredLeads.length} leads · ${leadMarkers.length} regiones`
                : null}
              {` · ${hasGoogleMapsApiKey ? t`Google Maps` : t`Vista simplificada`}`}
            </StyledSidebarMeta>
          </StyledSidebarHeader>

          {showLeads ? (
            <StyledSelectionToolbar>
              <StyledSelectionCount>
                {checkedLeadIds.length > 0
                  ? t`${checkedLeadIds.length} leads seleccionados`
                  : t`Marca leads o selecciona una zona en el mapa`}
              </StyledSelectionCount>
              <Button
                title={t`Seleccionar visibles`}
                variant="secondary"
                size="small"
                disabled={sidebarLeads.length === 0}
                onClick={handleSelectAllVisibleLeads}
              />
              <Button
                title={t`Limpiar`}
                variant="secondary"
                size="small"
                disabled={checkedLeadIds.length === 0}
                onClick={handleClearLeadSelection}
              />
            </StyledSelectionToolbar>
          ) : null}

          <StyledSidebarList>
            {showLeads ? (
              <>
                <StyledSidebarSectionLabel>
                  {selectedLeadRegionId
                    ? t`Leads en región`
                    : t`Leads activos`}
                </StyledSidebarSectionLabel>
                {sidebarLeads.length === 0 ? (
                  <ParksEmptyState
                    title={t`Ningún lead coincide con los filtros`}
                  />
                ) : (
                  sidebarLeads.map((lead) => (
                    <ParksLeadSidebarCard
                      key={lead.id}
                      lead={lead}
                      isSelected={selectedLeadId === lead.id}
                      isChecked={checkedLeadIds.includes(lead.id)}
                      onSelect={handleSelectLead}
                      onToggleCheck={handleToggleLeadCheck}
                    />
                  ))
                )}
              </>
            ) : null}

            {showParques ? (
              <>
                {showLeads ? (
                  <StyledSidebarSectionLabel>
                    {t`Parques`}
                  </StyledSidebarSectionLabel>
                ) : null}
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
                      onSelect={handleSelectParque}
                    />
                  ))
                )}
              </>
            ) : null}
          </StyledSidebarList>

          {showLeads ? (
            <ParksMapLeadOutreachPanel
              selectedLeads={selectedLeadsForOutreach}
              offerableNaves={offerableNaves}
              onClearSelection={handleClearLeadSelection}
            />
          ) : null}
        </StyledSidebarPane>
      </StyledMapWorkspace>
    </StyledPageStack>
  );
};
