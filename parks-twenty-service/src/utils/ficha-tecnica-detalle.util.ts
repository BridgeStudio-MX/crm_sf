import { type NaveRecord } from '../types/parks.types';
import {
  type FichaDisponibilidadEstatus,
  type FichaTecnicaDetalle,
} from '../types/ficha-tecnica.types';

type CorridorProfile = {
  corredor: string;
  distanciaAutopistaKm: number;
  distanciaAeropuertoKm: number;
  distanciaPuertoKm: number | null;
  distanciaFronteraKm: number | null;
  inquilinos: string[];
  lat: number;
  lng: number;
};

const CORRIDOR_PROFILES: Array<{
  keywords: string[];
  profile: CorridorProfile;
}> = [
  {
    keywords: ['tijuana', 'tecate', 'baja california', 'mexicali'],
    profile: {
      corredor: 'Frontera Norte',
      distanciaAutopistaKm: 4,
      distanciaAeropuertoKm: 18,
      distanciaPuertoKm: 22,
      distanciaFronteraKm: 6,
      inquilinos: ['Toyota', 'Samsung', 'Plantronics'],
      lat: 32.5149,
      lng: -117.0382,
    },
  },
  {
    keywords: ['monterrey', 'apodaca', 'guadalupe', 'nuevo león', 'nuevo leon'],
    profile: {
      corredor: 'Norte',
      distanciaAutopistaKm: 3,
      distanciaAeropuertoKm: 22,
      distanciaPuertoKm: null,
      distanciaFronteraKm: 210,
      inquilinos: ['FEMSA', 'Whirlpool', 'Katcon'],
      lat: 25.6866,
      lng: -100.3161,
    },
  },
  {
    keywords: ['silao', 'bajío', 'bajio', 'guanajuato'],
    profile: {
      corredor: 'Bajío',
      distanciaAutopistaKm: 2,
      distanciaAeropuertoKm: 28,
      distanciaPuertoKm: null,
      distanciaFronteraKm: null,
      inquilinos: ['Honda', 'Pirelli', 'Nestlé'],
      lat: 20.9439,
      lng: -101.427,
    },
  },
  {
    keywords: ['querétaro', 'queretaro', 'el marqués', 'el marques'],
    profile: {
      corredor: 'Bajío',
      distanciaAutopistaKm: 3,
      distanciaAeropuertoKm: 32,
      distanciaPuertoKm: null,
      distanciaFronteraKm: null,
      inquilinos: ['Bombardier', 'Tremec', 'Samsung'],
      lat: 20.5888,
      lng: -100.3899,
    },
  },
  {
    keywords: ['el salto', 'guadalajara', 'jalisco', 'zapopan'],
    profile: {
      corredor: 'Occidente',
      distanciaAutopistaKm: 5,
      distanciaAeropuertoKm: 16,
      distanciaPuertoKm: 280,
      distanciaFronteraKm: null,
      inquilinos: ['Flex', 'HP', 'Jabil'],
      // El Salto / corredor GDL industrial
      lat: 20.5208,
      lng: -103.2502,
    },
  },
  {
    keywords: ['toluca', 'lerma'],
    profile: {
      corredor: 'Centro',
      distanciaAutopistaKm: 4,
      distanciaAeropuertoKm: 35,
      distanciaPuertoKm: null,
      distanciaFronteraKm: null,
      inquilinos: ['Palacio de Hierro', 'Liverpool', 'Walmart'],
      lat: 19.2826,
      lng: -99.6557,
    },
  },
  {
    keywords: ['tlalnepantla', 'tultitlán', 'tultitlan', 'texcoco', 'cdmx'],
    profile: {
      corredor: 'Centro',
      distanciaAutopistaKm: 5,
      distanciaAeropuertoKm: 28,
      distanciaPuertoKm: null,
      distanciaFronteraKm: null,
      inquilinos: ['Palacio de Hierro', 'Liverpool', 'Walmart'],
      lat: 19.5392,
      lng: -99.195,
    },
  },
];

const DEFAULT_CORRIDOR: CorridorProfile = {
  corredor: 'Nacional',
  distanciaAutopistaKm: 6,
  distanciaAeropuertoKm: 40,
  distanciaPuertoKm: null,
  distanciaFronteraKm: null,
  inquilinos: ['Operadores logísticos regionales'],
  lat: 23.6345,
  lng: -102.5528,
};

const hashSeed = (value: string): number => {
  let hash = 0;

  for (let index = 0; index < value.length; index += 1) {
    hash = (hash + value.charCodeAt(index) * (index + 1)) % 2147483647;
  }

  return Math.abs(hash);
};

const resolveCorridor = (
  ubicacion: string,
  parqueNombre: string,
): CorridorProfile => {
  const searchText = `${ubicacion} ${parqueNombre}`.toLowerCase();

  for (const rule of CORRIDOR_PROFILES) {
    if (rule.keywords.some((keyword) => searchText.includes(keyword))) {
      return rule.profile;
    }
  }

  return DEFAULT_CORRIDOR;
};

// OSM static map with pin — no API key, works in HTML and print.
const buildOsmStaticMapUrl = (lat: number, lng: number): string =>
  `https://staticmap.openstreetmap.de/staticmap.php?center=${lat},${lng}&zoom=12&size=900x480&maptype=mapnik&markers=${lat},${lng},red-pushpin`;

const buildOsmEmbedUrl = (lat: number, lng: number): string => {
  const delta = 0.07;

  return `https://www.openstreetmap.org/export/embed.html?bbox=${(
    lng - delta
  ).toFixed(5)}%2C${(lat - delta).toFixed(5)}%2C${(lng + delta).toFixed(
    5,
  )}%2C${(lat + delta).toFixed(5)}&layer=mapnik&marker=${lat.toFixed(
    5,
  )}%2C${lng.toFixed(5)}`;
};

const buildOsmLinkUrl = (lat: number, lng: number): string =>
  `https://www.openstreetmap.org/?mlat=${lat}&mlon=${lng}#map=13/${lat}/${lng}`;

const mapDisponibilidad = (
  estatus?: string | null,
): FichaDisponibilidadEstatus => {
  const normalized = (estatus ?? '').toLowerCase();

  if (normalized.includes('negoci')) {
    return 'En negociación';
  }

  if (normalized.includes('construc') || normalized.includes('bts')) {
    return 'Build-to-suit';
  }

  if (normalized.includes('fecha') || normalized.includes('próxim')) {
    return 'Disponible en fecha';
  }

  return 'Disponible inmediata';
};

const DAYLIGHT_INTERIOR =
  'https://images.unsplash.com/photo-1586528116311-ad8dd3c8310d?auto=format&fit=crop&w=1400&q=80';
const DAYLIGHT_AERIAL =
  'https://images.unsplash.com/photo-1504307651254-35680f356dfd?auto=format&fit=crop&w=1400&q=80';
const DAYLIGHT_EXTERIOR =
  'https://images.unsplash.com/photo-1558618666-fcd25c85cd64?auto=format&fit=crop&w=1400&q=80';

export const buildFichaTecnicaDetalle = (input: {
  naveIdentificador: string;
  parqueNombre: string;
  ubicacion: string;
  m2: number;
  precioUsdM2?: number;
  fotoInmuebleUrl?: string;
  fotoParqueUrl?: string;
  publicUrl: string;
  nave?: NaveRecord | null;
  preparedForCompany: string;
}): FichaTecnicaDetalle => {
  const corridor = resolveCorridor(input.ubicacion, input.parqueNombre);
  const hash = hashSeed(`${input.naveIdentificador}-${input.m2}`);
  // Slight jitter so two naves in same park don't share the exact same pin.
  const lat = Number((corridor.lat + ((hash % 17) - 8) * 0.004).toFixed(5));
  const lng = Number((corridor.lng + ((hash % 13) - 6) * 0.004).toFixed(5));
  const glaM2 = input.nave?.m2 ?? input.m2;
  const oficinasM2 =
    input.nave?.oficinasM2 ?? Math.max(80, Math.round(glaM2 * 0.04));
  const alturaLibreM = input.nave?.alturaLibreM ?? 12;
  const andenes = input.nave?.andenes ?? 8 + (hash % 6);
  const potenciaKva = input.nave?.potenciaKva ?? 500 + (hash % 8) * 125;
  const cargaPisoTonM2 = input.nave?.cargaPisoTon ?? 5;
  const precioUsdM2Mes =
    input.precioUsdM2 ?? input.nave?.precioBaseUsd ?? 0.95;
  const disponibilidadEstatus = mapDisponibilidad(input.nave?.estatus);
  const qrPayload = encodeURIComponent(
    `https://wa.me/525512345678?text=${encodeURIComponent(
      `Hola, me interesa la nave ${input.naveIdentificador} en ${input.parqueNombre} (ficha: ${input.publicUrl})`,
    )}`,
  );

  return {
    parqueNombre: input.parqueNombre,
    naveIdentificador: input.naveIdentificador,
    ciudadEstado: input.ubicacion,
    corredorIndustrial: corridor.corredor,
    distanciaAutopistaKm: corridor.distanciaAutopistaKm,
    distanciaAeropuertoKm: corridor.distanciaAeropuertoKm,
    distanciaPuertoKm: corridor.distanciaPuertoKm,
    distanciaFronteraKm: corridor.distanciaFronteraKm,
    lat,
    lng,
    mapaUbicacionUrl: buildOsmStaticMapUrl(lat, lng),
    mapaEmbedUrl: buildOsmEmbedUrl(lat, lng),
    mapaEnlaceUrl: buildOsmLinkUrl(lat, lng),

    glaM2,
    oficinasM2,
    alturaLibreM,
    andenes,
    andenesDetalle: `${andenes} andenes con dock levelers · 1.2 m altura estándar`,
    puertasNivelPiso: 2 + (hash % 3),
    cargaPisoTonM2,
    potenciaKva,
    cajonesAutos: 40 + (hash % 30),
    cajonesTrailers: Math.max(6, Math.round(andenes * 1.5)),
    profundidadPatioM: 35 + (hash % 15),
    iluminacion: 'LED industrial · 300–400 lux promedio',
    sistemaContraIncendios: 'Rociadores ESFR + detectores + gabinetes',
    tipoPiso: 'Concreto pulido / endurecido',
    skylights: hash % 2 === 0 ? 'Sí · 3% cobertura de cubierta' : 'No',
    gasNatural: hash % 3 !== 0,

    disponibilidadEstatus,
    fechaDisponibilidad:
      disponibilidadEstatus === 'Disponible inmediata'
        ? null
        : 'A convenir / según liberación',
    tipoOperacion:
      disponibilidadEstatus === 'Build-to-suit'
        ? 'Build-to-suit — construcción a medida'
        : 'Nave existente lista para ocupar',
    precioUsdM2Mes,
    plazoMinimoMeses: 60,
    monedaContrato: 'USD',
    periodoGraciaMeses: 2,

    accesoControlado24h: true,
    cctv: true,
    alumbradoPerimetral: true,
    vialidadesPavimentadas: true,
    areaCargaExclusiva: true,
    serviciosParque: [
      'Agua industrial',
      'Drenaje',
      'Telecomunicaciones de fibra',
      'Gas natural (según manzana)',
    ],
    certificaciones: ['ISO 9001 (operación parque)', 'CTPAT-ready (seguridad)'],
    serviciosOpcionales: [
      'Mantenimiento de áreas comunes',
      'Limpieza',
      'Cafetería / comedor para personal',
    ],
    inquilinosReferencia: corridor.inquilinos,

    fotoExteriorUrl: input.fotoInmuebleUrl ?? DAYLIGHT_EXTERIOR,
    fotoInteriorUrl: DAYLIGHT_INTERIOR,
    fotoAereaUrl: input.fotoParqueUrl ?? DAYLIGHT_AERIAL,
    planoPlantaNota: `Layout esquemático ${input.naveIdentificador} · GLA ${glaM2.toLocaleString('es-MX')} m²`,

    loNombre: 'Tim Apple · Leasing Officer',
    loTelefono: '+52 55 1234 5678',
    loWhatsapp: '+52 55 1234 5678',
    loEmail: 'tim@apple.dev',
    qrCodeUrl: `https://api.qrserver.com/v1/create-qr-code/?size=140x140&data=${qrPayload}`,
  };
};
