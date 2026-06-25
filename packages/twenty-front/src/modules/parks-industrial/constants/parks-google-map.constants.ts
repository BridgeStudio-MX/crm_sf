type GoogleMapStyleRule = {
  elementType?: string;
  featureType?: string;
  stylers: Record<string, string | number>[];
};

export const PARKS_GOOGLE_MAP_LIGHT_STYLES: GoogleMapStyleRule[] = [
  {
    featureType: 'poi',
    elementType: 'labels',
    stylers: [{ visibility: 'off' }],
  },
  {
    featureType: 'transit',
    stylers: [{ visibility: 'off' }],
  },
];

export const PARKS_GOOGLE_MAP_DARK_STYLES: GoogleMapStyleRule[] = [
  { elementType: 'geometry', stylers: [{ color: '#1d1f24' }] },
  { elementType: 'labels.text.stroke', stylers: [{ color: '#1d1f24' }] },
  { elementType: 'labels.text.fill', stylers: [{ color: '#8f959e' }] },
  {
    featureType: 'administrative.locality',
    elementType: 'labels.text.fill',
    stylers: [{ color: '#c4c8ce' }],
  },
  {
    featureType: 'poi',
    elementType: 'labels',
    stylers: [{ visibility: 'off' }],
  },
  {
    featureType: 'poi.park',
    elementType: 'geometry',
    stylers: [{ color: '#23262d' }],
  },
  {
    featureType: 'road',
    elementType: 'geometry',
    stylers: [{ color: '#2b2f38' }],
  },
  {
    featureType: 'road',
    elementType: 'geometry.stroke',
    stylers: [{ color: '#1d1f24' }],
  },
  {
    featureType: 'road.highway',
    elementType: 'geometry',
    stylers: [{ color: '#3a404c' }],
  },
  {
    featureType: 'road.highway',
    elementType: 'geometry.stroke',
    stylers: [{ color: '#1d1f24' }],
  },
  {
    featureType: 'transit',
    stylers: [{ visibility: 'off' }],
  },
  {
    featureType: 'water',
    elementType: 'geometry',
    stylers: [{ color: '#14161a' }],
  },
  {
    featureType: 'water',
    elementType: 'labels.text.fill',
    stylers: [{ color: '#515862' }],
  },
];

export const getParksGoogleMapOptions = (
  colorScheme: 'light' | 'dark',
): google.maps.MapOptions => ({
  disableDefaultUI: false,
  fullscreenControl: true,
  mapTypeControl: false,
  streetViewControl: false,
  backgroundColor: colorScheme === 'dark' ? '#14161a' : '#f3f4f6',
  styles:
    colorScheme === 'dark'
      ? (PARKS_GOOGLE_MAP_DARK_STYLES as google.maps.MapTypeStyle[])
      : (PARKS_GOOGLE_MAP_LIGHT_STYLES as google.maps.MapTypeStyle[]),
});
