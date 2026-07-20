import { styled } from '@linaria/react';
import { t } from '@lingui/core/macro';
import {
  GoogleMap,
  Marker,
  OverlayView,
  useJsApiLoader,
} from '@react-google-maps/api';
import { useCallback, useEffect, useMemo, useState } from 'react';
import { themeCssVariables } from 'twenty-ui/theme-constants';

import {
  ParksMapMarkerBalloon,
} from '@/parks-industrial/components/mapa/ParksMapMarkerBalloon';
import { ParksMapLeadClusterBalloon } from '@/parks-industrial/components/mapa/ParksMapLeadClusterBalloon';
import { ParksEmptyState } from '@/parks-industrial/components/ui/ParksEmptyState';
import { ParksLoadingSkeleton } from '@/parks-industrial/components/ui/ParksLoadingSkeleton';
import { getParksGoogleMapOptions } from '@/parks-industrial/constants/parks-google-map.constants';
import { getParqueCoordinates } from '@/parks-industrial/constants/parks-industrial.constants';
import { type ParksNaveRecord } from '@/parks-industrial/hooks/useParksRecords';
import { type ParksParqueRecord } from '@/parks-industrial/hooks/useParksParques';
import {
  getParksOcupacionMarkerHex,
  getParksParqueOcupacion,
} from '@/parks-industrial/utils/parks-format.util';
import {
  PARKS_MAP_LEAD_MARKER_COLOR,
  PARKS_MAP_LEAD_MARKER_SELECTED_COLOR,
  type ParksMapLeadMarker,
  type ParksMapLeadRegionId,
} from '@/parks-industrial/utils/parks-map-leads.util';

const MAP_CONTAINER_STYLE = { width: '100%', height: '100%' };
const MAP_LOADER_ID = 'parks-industrial-google-map';
const MAP_BALLOON_OFFSET_PX = 28;

const StyledMapShell = styled.div`
  height: 100%;
  min-height: 360px;
  position: relative;
  width: 100%;
`;

const StyledMapLegendOverlay = styled.div`
  background: ${themeCssVariables.background.primary};
  border: 1px solid ${themeCssVariables.border.color.medium};
  border-radius: ${themeCssVariables.border.radius.sm};
  bottom: ${themeCssVariables.spacing[3]};
  box-shadow: ${themeCssVariables.boxShadow.light};
  display: flex;
  flex-wrap: wrap;
  gap: ${themeCssVariables.spacing[2]};
  left: ${themeCssVariables.spacing[3]};
  padding: ${themeCssVariables.spacing[2]};
  position: absolute;
  z-index: 1;
`;

const StyledLegendItem = styled.div`
  align-items: center;
  color: ${themeCssVariables.font.color.secondary};
  display: flex;
  font-size: ${themeCssVariables.font.size.xs};
  gap: 6px;
`;

const StyledLegendDot = styled.span<{
  dotColor: string;
  isDiamond?: boolean;
}>`
  background: ${({ dotColor }) => dotColor};
  border: 2px solid ${themeCssVariables.background.primary};
  border-radius: ${({ isDiamond }) => (isDiamond ? '2px' : '50%')};
  box-shadow: ${themeCssVariables.boxShadow.light};
  height: 10px;
  transform: ${({ isDiamond }) => (isDiamond ? 'rotate(45deg)' : 'none')};
  width: 10px;
`;

export type ParksMapMarker = {
  parque: ParksParqueRecord;
  coords: { lat: number; lng: number };
  ocupacion: number;
};

type ParksGoogleMapPanelProps = {
  apiKey: string;
  parques: ParksParqueRecord[];
  naves: ParksNaveRecord[];
  leadMarkers?: ParksMapLeadMarker[];
  showParques?: boolean;
  showLeads?: boolean;
  selectedParqueId: string | null;
  selectedLeadRegionId?: ParksMapLeadRegionId | null;
  colorScheme: 'light' | 'dark';
  onSelectParque: (parqueId: string | null) => void;
  onSelectLeadRegion?: (regionId: ParksMapLeadRegionId | null) => void;
  onSelectRegionLeads?: (regionId: ParksMapLeadRegionId) => void;
};

export {
  getParksGoogleMapsApiKeyFromEnv as getParksGoogleMapsApiKey,
  isValidGoogleMapsApiKey,
} from '@/parks-industrial/hooks/useParksGoogleMapsApiKey';

const buildMarkerIcon = (
  ocupacion: number,
  isSelected: boolean,
): google.maps.Symbol | undefined => {
  if (typeof google === 'undefined') {
    return undefined;
  }

  return {
    path: google.maps.SymbolPath.CIRCLE,
    scale: isSelected ? 14 : 11,
    fillColor: getParksOcupacionMarkerHex(ocupacion),
    fillOpacity: 1,
    strokeColor: '#ffffff',
    strokeWeight: isSelected ? 3 : 2,
  };
};

const buildLeadMarkerIcon = (
  isSelected: boolean,
): google.maps.Symbol | undefined => {
  if (typeof google === 'undefined') {
    return undefined;
  }

  return {
    path: 'M 0,-1.2 L 1.2,0 L 0,1.2 L -1.2,0 z',
    scale: isSelected ? 14 : 11,
    fillColor: isSelected
      ? PARKS_MAP_LEAD_MARKER_SELECTED_COLOR
      : PARKS_MAP_LEAD_MARKER_COLOR,
    fillOpacity: 1,
    strokeColor: '#ffffff',
    strokeWeight: isSelected ? 3 : 2,
  };
};

const getMapBalloonPixelOffset = (
  balloonWidth: number,
  balloonHeight: number,
) => ({
  x: -(balloonWidth / 2),
  y: -(balloonHeight + MAP_BALLOON_OFFSET_PX),
});

export const ParksGoogleMapPanel = ({
  apiKey,
  parques,
  naves,
  leadMarkers = [],
  showParques = true,
  showLeads = false,
  selectedParqueId,
  selectedLeadRegionId = null,
  colorScheme,
  onSelectParque,
  onSelectLeadRegion,
  onSelectRegionLeads,
}: ParksGoogleMapPanelProps) => {
  const [mapInstance, setMapInstance] = useState<google.maps.Map | null>(null);
  const mapOptions = useMemo(
    () => getParksGoogleMapOptions(colorScheme),
    [colorScheme],
  );
  const { isLoaded, loadError } = useJsApiLoader({
    googleMapsApiKey: apiKey,
    id: MAP_LOADER_ID,
  });

  const markers: ParksMapMarker[] = useMemo(
    () =>
      showParques
        ? parques.map((parque) => ({
            parque,
            coords: getParqueCoordinates(parque.nombre ?? '', parque.ubicacion),
            ocupacion: getParksParqueOcupacion(
              parque.m2Totales,
              parque.m2Rentados,
            ),
          }))
        : [],
    [parques, showParques],
  );

  const visibleLeadMarkers = showLeads ? leadMarkers : [];

  const allCoords = useMemo(
    () => [
      ...markers.map((marker) => marker.coords),
      ...visibleLeadMarkers.map((marker) => marker.coords),
    ],
    [markers, visibleLeadMarkers],
  );

  const center = allCoords[0] ?? { lat: 23.6345, lng: -102.5528 };
  const selectedMarker = markers.find(
    (marker) => marker.parque.id === selectedParqueId,
  );
  const selectedLeadMarker = visibleLeadMarkers.find(
    (marker) => marker.regionId === selectedLeadRegionId,
  );

  const fitMapToCoords = useCallback(
    (map: google.maps.Map, coords: Array<{ lat: number; lng: number }>) => {
      if (coords.length === 0) {
        return;
      }

      if (coords.length === 1) {
        map.setCenter(coords[0]!);
        map.setZoom(10);
        return;
      }

      const bounds = new google.maps.LatLngBounds();
      coords.forEach((coord) => bounds.extend(coord));
      map.fitBounds(bounds, 48);
    },
    [],
  );

  const handleMapLoad = useCallback(
    (map: google.maps.Map) => {
      setMapInstance(map);
      fitMapToCoords(map, allCoords);
    },
    [allCoords, fitMapToCoords],
  );

  useEffect(() => {
    if (!mapInstance) {
      return;
    }

    mapInstance.setOptions(mapOptions);
  }, [mapInstance, mapOptions]);

  useEffect(() => {
    if (!mapInstance) {
      return;
    }

    fitMapToCoords(mapInstance, allCoords);
  }, [mapInstance, allCoords, fitMapToCoords]);

  useEffect(() => {
    if (!mapInstance) {
      return;
    }

    if (selectedParqueId && selectedMarker) {
      mapInstance.panTo(selectedMarker.coords);
      const currentZoom = mapInstance.getZoom() ?? 6;

      if (currentZoom < 9) {
        mapInstance.setZoom(9);
      }

      return;
    }

    if (selectedLeadRegionId && selectedLeadMarker) {
      mapInstance.panTo(selectedLeadMarker.coords);
      const currentZoom = mapInstance.getZoom() ?? 6;

      if (currentZoom < 8) {
        mapInstance.setZoom(8);
      }
    }
  }, [
    mapInstance,
    selectedParqueId,
    selectedMarker,
    selectedLeadRegionId,
    selectedLeadMarker,
  ]);

  if (loadError) {
    return (
      <ParksEmptyState
        title={t`No se pudo cargar Google Maps`}
        description={loadError.message}
      />
    );
  }

  if (!isLoaded) {
    return <ParksLoadingSkeleton variant="map" />;
  }

  if (allCoords.length === 0) {
    return (
      <ParksEmptyState
        title={
          showLeads && !showParques
            ? t`Ningún lead coincide con los filtros`
            : t`Ningún parque coincide con la búsqueda`
        }
      />
    );
  }

  return (
    <StyledMapShell>
      <GoogleMap
        mapContainerStyle={MAP_CONTAINER_STYLE}
        center={center}
        zoom={6}
        options={mapOptions}
        onLoad={handleMapLoad}
        onClick={() => {
          onSelectParque(null);
          onSelectLeadRegion?.(null);
        }}
      >
        {markers.map(({ parque, coords, ocupacion }) => (
          <Marker
            key={`parque-${parque.id}`}
            position={coords}
            icon={buildMarkerIcon(
              ocupacion,
              selectedParqueId === parque.id,
            )}
            onClick={(mapMouseEvent) => {
              mapMouseEvent.domEvent.stopPropagation();
              onSelectLeadRegion?.(null);
              onSelectParque(parque.id);
            }}
            zIndex={selectedParqueId === parque.id ? 2 : 1}
          />
        ))}

        {visibleLeadMarkers.map((leadMarker) => (
          <Marker
            key={`lead-${leadMarker.regionId}`}
            position={leadMarker.coords}
            icon={buildLeadMarkerIcon(
              selectedLeadRegionId === leadMarker.regionId,
            )}
            label={{
              text: String(leadMarker.leadCount),
              color: '#ffffff',
              fontSize: '11px',
              fontWeight: '700',
            }}
            onClick={(mapMouseEvent) => {
              mapMouseEvent.domEvent.stopPropagation();
              onSelectParque(null);
              onSelectLeadRegion?.(leadMarker.regionId);
            }}
            zIndex={
              selectedLeadRegionId === leadMarker.regionId ? 3 : 2
            }
          />
        ))}

        {selectedMarker ? (
          <OverlayView
            position={selectedMarker.coords}
            mapPaneName={OverlayView.FLOAT_PANE}
            getPixelPositionOffset={getMapBalloonPixelOffset}
          >
            <ParksMapMarkerBalloon
              parque={selectedMarker.parque}
              naves={naves}
              onClose={() => onSelectParque(null)}
            />
          </OverlayView>
        ) : null}

        {!selectedMarker && selectedLeadMarker ? (
          <OverlayView
            position={selectedLeadMarker.coords}
            mapPaneName={OverlayView.FLOAT_PANE}
            getPixelPositionOffset={getMapBalloonPixelOffset}
          >
            <ParksMapLeadClusterBalloon
              marker={selectedLeadMarker}
              onClose={() => onSelectLeadRegion?.(null)}
              onSelectRegionLeads={() =>
                onSelectRegionLeads?.(selectedLeadMarker.regionId)
              }
            />
          </OverlayView>
        ) : null}
      </GoogleMap>

      <StyledMapLegendOverlay>
        {showParques ? (
          <>
            <StyledLegendItem>
              <StyledLegendDot dotColor={getParksOcupacionMarkerHex(90)} />
              {t`≥85%`}
            </StyledLegendItem>
            <StyledLegendItem>
              <StyledLegendDot dotColor={getParksOcupacionMarkerHex(70)} />
              {t`60–84%`}
            </StyledLegendItem>
            <StyledLegendItem>
              <StyledLegendDot dotColor={getParksOcupacionMarkerHex(40)} />
              {t`<60%`}
            </StyledLegendItem>
          </>
        ) : null}
        {showLeads ? (
          <StyledLegendItem>
            <StyledLegendDot
              dotColor={PARKS_MAP_LEAD_MARKER_COLOR}
              isDiamond
            />
            {t`Leads`}
          </StyledLegendItem>
        ) : null}
      </StyledMapLegendOverlay>
    </StyledMapShell>
  );
};
