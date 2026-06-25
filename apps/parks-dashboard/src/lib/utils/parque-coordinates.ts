export const PARQUE_COORDINATES: Record<
  string,
  { lat: number; lng: number; label?: string }
> = {
  'Parques del Bajío - Silao': { lat: 20.9356, lng: -101.4456 },
  'Guadalajara Park': { lat: 20.4597, lng: -103.3126 },
  'El Salto Park III': { lat: 20.5318, lng: -103.1789 },
  'T-MexPark': { lat: 19.5139, lng: -98.8829 },
  'Toluca Parks III': { lat: 19.285, lng: -99.61 },
  'TultiPark II': { lat: 19.647, lng: -99.1685 },
  'TlanePark IV': { lat: 19.539, lng: -99.1955 },
  'GuadalupePark I': { lat: 25.6769, lng: -100.2565 },
  'Parque Industrial Apodaca': { lat: 25.7819, lng: -100.1884 },
  DEMO_EL_SALTO: { lat: 20.6597, lng: -103.3496, label: 'El Salto' },
  DEMO_APODACA: { lat: 25.7819, lng: -100.1884, label: 'Apodaca' },
};

export const getParqueCoordinates = (
  nombre: string,
  ubicacion?: string,
): { lat: number; lng: number } => {
  if (PARQUE_COORDINATES[nombre]) {
    return PARQUE_COORDINATES[nombre]!;
  }

  for (const [key, coords] of Object.entries(PARQUE_COORDINATES)) {
    if (ubicacion?.includes(key) || nombre.includes(key)) {
      return coords;
    }
  }

  return { lat: 23.6345, lng: -102.5528 };
};
