'use client';

import {
  GoogleMap,
  InfoWindow,
  Marker,
  useJsApiLoader,
} from '@react-google-maps/api';
import Link from 'next/link';
import { useMemo, useState } from 'react';

import { Card } from '@/components/ui/primitives';
import { type ParqueRecord } from '@/lib/types';
import { getParqueCoordinates } from '@/lib/utils/parque-coordinates';

type ParksMapProps = {
  parques: ParqueRecord[];
};

const mapContainerStyle = { width: '100%', height: '520px' };

export const ParksMap = ({ parques }: ParksMapProps) => {
  const apiKey = process.env.NEXT_PUBLIC_GOOGLE_MAPS_API_KEY ?? '';
  const { isLoaded } = useJsApiLoader({
    googleMapsApiKey: apiKey,
    id: 'parks-dashboard-map',
  });
  const [selectedId, setSelectedId] = useState<string | null>(null);

  const markers = useMemo(
    () =>
      parques.map((parque) => ({
        parque,
        coords: getParqueCoordinates(parque.nombre, parque.ubicacion),
        ocupacion:
          parque.m2Totales && parque.m2Totales > 0
            ? Math.round(
                ((parque.m2Rentados ?? 0) / parque.m2Totales) * 100,
              )
            : 0,
      })),
    [parques],
  );

  const center = markers[0]?.coords ?? { lat: 23.6345, lng: -102.5528 };
  const selected = markers.find((marker) => marker.parque.id === selectedId);

  if (!apiKey) {
    return (
      <Card>
        <p className="text-sm text-slate-600">
          Configura <code>NEXT_PUBLIC_GOOGLE_MAPS_API_KEY</code> en .env.local
          para ver el mapa.
        </p>
        <div className="mt-4 space-y-2">
          {parques.map((parque) => {
            const ocupacion =
              parque.m2Totales && parque.m2Totales > 0
                ? Math.round(
                    ((parque.m2Rentados ?? 0) / parque.m2Totales) * 100,
                  )
                : 0;

            return (
              <div
                key={parque.id}
                className="rounded-lg border border-slate-200 p-3"
              >
                <p className="font-medium">{parque.nombre}</p>
                <p className="text-sm text-slate-600">
                  {parque.ubicacion ?? 'Sin dirección'} · {ocupacion}% ocupación
                </p>
                <Link
                  href={`/parque/${parque.id}/stacking-plan`}
                  className="mt-2 inline-block text-sm text-blue-600"
                >
                  Ver naves
                </Link>
              </div>
            );
          })}
        </div>
      </Card>
    );
  }

  if (!isLoaded) {
    return <Card>Cargando mapa...</Card>;
  }

  return (
    <div className="grid gap-6 lg:grid-cols-3">
      <Card className="overflow-hidden p-0 lg:col-span-2">
        <GoogleMap
          mapContainerStyle={mapContainerStyle}
          center={center}
          zoom={6}
        >
          {markers.map(({ parque, coords }) => (
            <Marker
              key={parque.id}
              position={coords}
              onClick={() => setSelectedId(parque.id)}
            />
          ))}

          {selected ? (
            <InfoWindow
              position={selected.coords}
              onCloseClick={() => setSelectedId(null)}
            >
              <div className="max-w-xs">
                <p className="font-semibold">{selected.parque.nombre}</p>
                <p className="text-sm">{selected.parque.ubicacion}</p>
                <p className="text-sm">{selected.ocupacion}% ocupación</p>
                <Link
                  href={`/parque/${selected.parque.id}/stacking-plan`}
                  className="mt-2 inline-block text-sm text-blue-600"
                >
                  Ver naves
                </Link>
              </div>
            </InfoWindow>
          ) : null}
        </GoogleMap>
      </Card>

      <Card>
        <h2 className="mb-4 text-lg font-semibold">Parques</h2>
        <div className="space-y-3">
          {markers.map(({ parque, coords, ocupacion }) => (
            <button
              key={parque.id}
              type="button"
              onClick={() => setSelectedId(parque.id)}
              className="w-full rounded-lg border border-slate-200 p-3 text-left hover:bg-slate-50"
            >
              <p className="font-medium">{parque.nombre}</p>
              <p className="text-sm text-slate-600">{ocupacion}% ocupación</p>
              <p className="text-xs text-slate-400">
                {coords.lat.toFixed(4)}, {coords.lng.toFixed(4)}
              </p>
            </button>
          ))}
        </div>
      </Card>
    </div>
  );
};
