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

const StyledLegendDot = styled.span<{ dotColor: string }>`
  background: ${({ dotColor }) => dotColor};
  border: 2px solid ${themeCssVariables.background.primary};
  border-radius: 50%;
  box-shadow: ${themeCssVariables.boxShadow.light};
  height: 10px;
  width: 10px;
`;

export type ParksMapMarker = {
  parque: ParksParqueRecord;
  coords: { lat: number; lng: number };
  ocupacion: number;
};

type ParksGoogleMapPanelProps = {
  parques: ParksParqueRecord[];
  naves: ParksNaveRecord[];
  selectedParqueId: string | null;
  colorScheme: 'light' | 'dark';
  onSelectParque: (parqueId: string | null) => void;
};

export const getParksGoogleMapsApiKey = (): string =>
  import.meta.env.REACT_APP_GOOGLE_MAPS_API_KEY ?? '';

export const isValidGoogleMapsApiKey = (apiKey: string): boolean =>
  apiKey.startsWith('AIza');

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

const getMapBalloonPixelOffset = (
  balloonWidth: number,
  balloonHeight: number,
) => ({
  x: -(balloonWidth / 2),
  y: -(balloonHeight + MAP_BALLOON_OFFSET_PX),
});

export const ParksGoogleMapPanel = ({
  parques,
  naves,
  selectedParqueId,
  colorScheme,
  onSelectParque,
}: ParksGoogleMapPanelProps) => {
  const apiKey = getParksGoogleMapsApiKey();
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
      parques.map((parque) => ({
        parque,
        coords: getParqueCoordinates(parque.nombre ?? '', parque.ubicacion),
        ocupacion: getParksParqueOcupacion(
          parque.m2Totales,
          parque.m2Rentados,
        ),
      })),
    [parques],
  );

  const center = markers[0]?.coords ?? { lat: 23.6345, lng: -102.5528 };
  const selectedMarker = markers.find(
    (marker) => marker.parque.id === selectedParqueId,
  );

  const handleMapLoad = useCallback(
    (map: google.maps.Map) => {
      setMapInstance(map);

      if (markers.length === 0) {
        return;
      }

      if (markers.length === 1) {
        map.setCenter(markers[0]!.coords);
        map.setZoom(10);
        return;
      }

      const bounds = new google.maps.LatLngBounds();
      markers.forEach((marker) => bounds.extend(marker.coords));
      map.fitBounds(bounds, 48);
    },
    [markers],
  );

  useEffect(() => {
    if (!mapInstance) {
      return;
    }

    mapInstance.setOptions(mapOptions);
  }, [mapInstance, mapOptions]);

  useEffect(() => {
    if (!mapInstance || markers.length === 0) {
      return;
    }

    if (markers.length === 1) {
      mapInstance.setCenter(markers[0]!.coords);
      mapInstance.setZoom(10);
      return;
    }

    const bounds = new google.maps.LatLngBounds();
    markers.forEach((marker) => bounds.extend(marker.coords));
    mapInstance.fitBounds(bounds, 48);
  }, [mapInstance, markers]);

  useEffect(() => {
    if (!mapInstance || !selectedParqueId) {
      return;
    }

    const marker = markers.find(
      (markerItem) => markerItem.parque.id === selectedParqueId,
    );

    if (!marker) {
      return;
    }

    mapInstance.panTo(marker.coords);

    const currentZoom = mapInstance.getZoom() ?? 6;

    if (currentZoom < 9) {
      mapInstance.setZoom(9);
    }
  }, [mapInstance, markers, selectedParqueId]);

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

  if (markers.length === 0) {
    return (
      <ParksEmptyState title={t`Ningún parque coincide con la búsqueda`} />
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
        onClick={() => onSelectParque(null)}
      >
        {markers.map(({ parque, coords, ocupacion }) => (
          <Marker
            key={parque.id}
            position={coords}
            icon={buildMarkerIcon(
              ocupacion,
              selectedParqueId === parque.id,
            )}
            onClick={(mapMouseEvent) => {
              mapMouseEvent.domEvent.stopPropagation();
              onSelectParque(parque.id);
            }}
            zIndex={selectedParqueId === parque.id ? 2 : 1}
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
      </GoogleMap>

      <StyledMapLegendOverlay>
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
      </StyledMapLegendOverlay>
    </StyledMapShell>
  );
};
