import { styled } from '@linaria/react';
import { t } from '@lingui/core/macro';
import L from 'leaflet';
import { useEffect, useMemo, useRef, useState } from 'react';
import { themeCssVariables } from 'twenty-ui/theme-constants';

import { ParksMapLeadClusterBalloon } from '@/parks-industrial/components/mapa/ParksMapLeadClusterBalloon';
import { ParksMapMarkerBalloon } from '@/parks-industrial/components/mapa/ParksMapMarkerBalloon';
import { ParksEmptyState } from '@/parks-industrial/components/ui/ParksEmptyState';
import { getParqueCoordinates } from '@/parks-industrial/constants/parks-industrial.constants';
import { type ParksParqueRecord } from '@/parks-industrial/hooks/useParksParques';
import { type ParksNaveRecord } from '@/parks-industrial/hooks/useParksRecords';
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

import 'leaflet/dist/leaflet.css';

const MAP_BALLOON_OFFSET_PX = 28;
const MEXICO_CENTER: L.LatLngExpression = [23.6345, -102.5528];

const OSM_LIGHT_TILE_URL =
  'https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png';
const OSM_DARK_TILE_URL =
  'https://{s}.basemaps.cartocdn.com/dark_all/{z}/{x}/{y}{r}.png';
const OSM_ATTRIBUTION =
  '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a>';

const StyledMapShell = styled.div`
  height: 100%;
  min-height: 360px;
  position: relative;
  width: 100%;

  .leaflet-container {
    background: ${themeCssVariables.background.tertiary};
    font: inherit;
    height: 100%;
    width: 100%;
    z-index: 0;
  }

  .leaflet-control-attribution {
    font-size: 10px;
  }
`;

const StyledMapCanvas = styled.div`
  height: 100%;
  width: 100%;
`;

const StyledBalloonLayer = styled.div`
  bottom: 0;
  left: 0;
  pointer-events: none;
  position: absolute;
  right: 0;
  top: 0;
  z-index: 500;

  & > * {
    pointer-events: auto;
  }
`;

const StyledBalloonAnchor = styled.div`
  position: absolute;
  transform: translate(-50%, calc(-100% - ${MAP_BALLOON_OFFSET_PX}px));
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
  z-index: 501;
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

type ParksMapMarker = {
  parque: ParksParqueRecord;
  coords: { lat: number; lng: number };
  ocupacion: number;
};

type ParksOsmMapPanelProps = {
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

type BalloonPixelPosition = {
  x: number;
  y: number;
};

const buildParqueDivIcon = (ocupacion: number, isSelected: boolean) => {
  const size = isSelected ? 28 : 22;
  const color = getParksOcupacionMarkerHex(ocupacion);
  const border = isSelected ? 3 : 2;

  return L.divIcon({
    className: 'parks-osm-marker',
    iconSize: [size, size],
    iconAnchor: [size / 2, size / 2],
    html: `<span style="display:block;width:${size}px;height:${size}px;border-radius:50%;background:${color};border:${border}px solid #fff;box-shadow:0 1px 4px rgba(0,0,0,.35);"></span>`,
  });
};

const buildLeadDivIcon = (leadCount: number, isSelected: boolean) => {
  const size = isSelected ? 30 : 26;
  const color = isSelected
    ? PARKS_MAP_LEAD_MARKER_SELECTED_COLOR
    : PARKS_MAP_LEAD_MARKER_COLOR;

  return L.divIcon({
    className: 'parks-osm-lead-marker',
    iconSize: [size, size],
    iconAnchor: [size / 2, size / 2],
    html: `<span style="align-items:center;background:${color};border:2px solid #fff;box-shadow:0 1px 4px rgba(0,0,0,.35);color:#fff;display:flex;font-size:11px;font-weight:700;height:${size}px;justify-content:center;transform:rotate(45deg);width:${size}px;"><span style="transform:rotate(-45deg);">${leadCount}</span></span>`,
  });
};

const fitMapToCoords = (
  map: L.Map,
  coords: Array<{ lat: number; lng: number }>,
) => {
  if (coords.length === 0) {
    return;
  }

  if (coords.length === 1) {
    map.setView([coords[0]!.lat, coords[0]!.lng], 10);
    return;
  }

  const bounds = L.latLngBounds(
    coords.map((coord) => [coord.lat, coord.lng] as L.LatLngTuple),
  );
  map.fitBounds(bounds, { padding: [48, 48] });
};

export const ParksOsmMapPanel = ({
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
}: ParksOsmMapPanelProps) => {
  const mapContainerRef = useRef<HTMLDivElement | null>(null);
  const mapRef = useRef<L.Map | null>(null);
  const tileLayerRef = useRef<L.TileLayer | null>(null);
  const markersLayerRef = useRef<L.LayerGroup | null>(null);
  const onSelectParqueRef = useRef(onSelectParque);
  const onSelectLeadRegionRef = useRef(onSelectLeadRegion);

  const [balloonPixel, setBalloonPixel] =
    useState<BalloonPixelPosition | null>(null);

  onSelectParqueRef.current = onSelectParque;
  onSelectLeadRegionRef.current = onSelectLeadRegion;

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

  const selectedMarker = markers.find(
    (marker) => marker.parque.id === selectedParqueId,
  );
  const selectedLeadMarker = visibleLeadMarkers.find(
    (marker) => marker.regionId === selectedLeadRegionId,
  );

  const balloonCoords = selectedMarker?.coords ?? selectedLeadMarker?.coords;

  useEffect(() => {
    if (!mapContainerRef.current || mapRef.current) {
      return;
    }

    const map = L.map(mapContainerRef.current, {
      center: MEXICO_CENTER,
      zoom: 5,
      zoomControl: true,
      attributionControl: true,
    });

    const tileLayer = L.tileLayer(OSM_LIGHT_TILE_URL, {
      attribution: OSM_ATTRIBUTION,
      maxZoom: 19,
    }).addTo(map);

    const markersLayer = L.layerGroup().addTo(map);

    map.on('click', () => {
      onSelectParqueRef.current(null);
      onSelectLeadRegionRef.current?.(null);
    });

    mapRef.current = map;
    tileLayerRef.current = tileLayer;
    markersLayerRef.current = markersLayer;

    requestAnimationFrame(() => {
      map.invalidateSize();
    });

    return () => {
      map.remove();
      mapRef.current = null;
      tileLayerRef.current = null;
      markersLayerRef.current = null;
    };
  }, []);

  useEffect(() => {
    const map = mapRef.current;
    const previousTileLayer = tileLayerRef.current;

    if (!map) {
      return;
    }

    const nextTileUrl =
      colorScheme === 'dark' ? OSM_DARK_TILE_URL : OSM_LIGHT_TILE_URL;

    if (previousTileLayer) {
      map.removeLayer(previousTileLayer);
    }

    const nextTileLayer = L.tileLayer(nextTileUrl, {
      attribution: OSM_ATTRIBUTION,
      maxZoom: 19,
    }).addTo(map);

    tileLayerRef.current = nextTileLayer;
  }, [colorScheme]);

  useEffect(() => {
    const map = mapRef.current;
    const markersLayer = markersLayerRef.current;

    if (!map || !markersLayer) {
      return;
    }

    markersLayer.clearLayers();

    for (const marker of markers) {
      const isSelected = selectedParqueId === marker.parque.id;
      const leafletMarker = L.marker(
        [marker.coords.lat, marker.coords.lng],
        {
          icon: buildParqueDivIcon(marker.ocupacion, isSelected),
          zIndexOffset: isSelected ? 200 : 100,
        },
      );

      leafletMarker.on('click', (event) => {
        L.DomEvent.stopPropagation(event);
        onSelectLeadRegionRef.current?.(null);
        onSelectParqueRef.current(marker.parque.id);
      });

      markersLayer.addLayer(leafletMarker);
    }

    for (const leadMarker of visibleLeadMarkers) {
      const isSelected = selectedLeadRegionId === leadMarker.regionId;
      const leafletMarker = L.marker(
        [leadMarker.coords.lat, leadMarker.coords.lng],
        {
          icon: buildLeadDivIcon(leadMarker.leadCount, isSelected),
          zIndexOffset: isSelected ? 300 : 150,
        },
      );

      leafletMarker.on('click', (event) => {
        L.DomEvent.stopPropagation(event);
        onSelectParqueRef.current(null);
        onSelectLeadRegionRef.current?.(leadMarker.regionId);
      });

      markersLayer.addLayer(leafletMarker);
    }
  }, [
    markers,
    selectedLeadRegionId,
    selectedParqueId,
    visibleLeadMarkers,
  ]);

  useEffect(() => {
    const map = mapRef.current;

    if (!map) {
      return;
    }

    fitMapToCoords(map, allCoords);
    requestAnimationFrame(() => {
      map.invalidateSize();
    });
  }, [allCoords]);

  useEffect(() => {
    const map = mapRef.current;

    if (!map || !selectedMarker) {
      return;
    }

    map.panTo([selectedMarker.coords.lat, selectedMarker.coords.lng]);
    if ((map.getZoom() ?? 6) < 9) {
      map.setZoom(9);
    }
  }, [selectedMarker]);

  useEffect(() => {
    const map = mapRef.current;

    if (!map || selectedMarker || !selectedLeadMarker) {
      return;
    }

    map.panTo([
      selectedLeadMarker.coords.lat,
      selectedLeadMarker.coords.lng,
    ]);
    if ((map.getZoom() ?? 6) < 8) {
      map.setZoom(8);
    }
  }, [selectedLeadMarker, selectedMarker]);

  useEffect(() => {
    const map = mapRef.current;

    if (!map || !balloonCoords) {
      setBalloonPixel(null);
      return;
    }

    const updateBalloonPixel = () => {
      const point = map.latLngToContainerPoint([
        balloonCoords.lat,
        balloonCoords.lng,
      ]);
      setBalloonPixel({ x: point.x, y: point.y });
    };

    updateBalloonPixel();
    map.on('move zoom moveend zoomend', updateBalloonPixel);

    return () => {
      map.off('move zoom moveend zoomend', updateBalloonPixel);
    };
  }, [balloonCoords]);

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
      <StyledMapCanvas ref={mapContainerRef} />

      {balloonPixel && selectedMarker ? (
        <StyledBalloonLayer>
          <StyledBalloonAnchor
            style={{ left: balloonPixel.x, top: balloonPixel.y }}
          >
            <ParksMapMarkerBalloon
              parque={selectedMarker.parque}
              naves={naves}
              onClose={() => onSelectParque(null)}
            />
          </StyledBalloonAnchor>
        </StyledBalloonLayer>
      ) : null}

      {balloonPixel && !selectedMarker && selectedLeadMarker ? (
        <StyledBalloonLayer>
          <StyledBalloonAnchor
            style={{ left: balloonPixel.x, top: balloonPixel.y }}
          >
            <ParksMapLeadClusterBalloon
              marker={selectedLeadMarker}
              onClose={() => onSelectLeadRegion?.(null)}
              onSelectRegionLeads={() =>
                onSelectRegionLeads?.(selectedLeadMarker.regionId)
              }
            />
          </StyledBalloonAnchor>
        </StyledBalloonLayer>
      ) : null}

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
