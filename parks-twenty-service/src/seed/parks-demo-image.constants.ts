const buildUnsplashUrl = (photoId: string): string =>
  `https://images.unsplash.com/photo-${photoId}?auto=format&fit=crop&w=1200&q=80`;

export const PARKS_GUADALAJARA_PARK_ENTRANCE_IMAGE =
  '/images/parks-industrial/guadalajara-park-entrada.png';

export const PARKS_EL_SALTO_PARK_III_ENTRANCE_IMAGE =
  '/images/parks-industrial/el-salto-park-iii-entrada.png';

export const PARKS_GUADALUPE_PARK_I_ENTRANCE_IMAGE =
  '/images/parks-industrial/guadalupe-park-i-entrada.png';

export const PARKS_T_MEXPARK_ENTRANCE_IMAGE =
  '/images/parks-industrial/t-mexpark-entrada.png';

export const PARKS_TOLUCA_PARKS_III_ENTRANCE_IMAGE =
  '/images/parks-industrial/toluca-parks-iii-entrada.png';

export const PARKS_TULTIPARK_II_ENTRANCE_IMAGE =
  '/images/parks-industrial/tultipark-ii-entrada.png';

export const PARKS_TLANEPARK_IV_ENTRANCE_IMAGE =
  '/images/parks-industrial/tlanepark-iv-entrada.png';

export const PARKS_DEMO_PARQUE_ENTRANCE_IMAGES = {
  parqueBajio: buildUnsplashUrl('1595844730298-6cff2533fccc'),
  parqueGuadalajaraPark: PARKS_GUADALAJARA_PARK_ENTRANCE_IMAGE,
  parqueElSaltoParkIII: PARKS_EL_SALTO_PARK_III_ENTRANCE_IMAGE,
  parqueTMexPark: PARKS_T_MEXPARK_ENTRANCE_IMAGE,
  parqueTolucaParksIII: PARKS_TOLUCA_PARKS_III_ENTRANCE_IMAGE,
  parqueTultiParkII: PARKS_TULTIPARK_II_ENTRANCE_IMAGE,
  parqueTlaneParkIV: PARKS_TLANEPARK_IV_ENTRANCE_IMAGE,
  parqueGuadalupeParkI: PARKS_GUADALUPE_PARK_I_ENTRANCE_IMAGE,
  parqueQro: buildUnsplashUrl('1497366216548-37526070297c'),
  parqueTijuana: buildUnsplashUrl('1486406146926-c627a92ad1ab'),
} as const;

export const PARKS_DEMO_NAVE_PROPERTY_IMAGES = [
  buildUnsplashUrl('1581092160562-40aa08e78837'),
  buildUnsplashUrl('1504307651254-35680f356dfd'),
  buildUnsplashUrl('1541888946425-d81bb19240f5'),
  buildUnsplashUrl('1595844730298-6cff2533fccc'),
  buildUnsplashUrl('1503387762-592deb58ef4e'),
  buildUnsplashUrl('1581092160607-ee22621dd758'),
  buildUnsplashUrl('1497366811353-6870744d04b2'),
  buildUnsplashUrl('1565514020179-026b92b84bb6'),
  buildUnsplashUrl('1586528116311-ad8dd3c8310d'),
  buildUnsplashUrl('1486406146926-c627a92ad1ab'),
  buildUnsplashUrl('1558618666-fcd25c85cd64'),
  buildUnsplashUrl('1497366216548-37526070297c'),
] as const;

const PARKS_PARQUE_ENTRANCE_IMAGE_RULES: Array<{
  keywords: string[];
  imageUrl: string;
}> = [
  {
    keywords: ['bajío', 'bajio', 'silao', 'guanajuato'],
    imageUrl: PARKS_DEMO_PARQUE_ENTRANCE_IMAGES.parqueBajio,
  },
  {
    keywords: ['guadalajara park'],
    imageUrl: PARKS_DEMO_PARQUE_ENTRANCE_IMAGES.parqueGuadalajaraPark,
  },
  {
    keywords: ['el salto park', 'el salto park iii'],
    imageUrl: PARKS_DEMO_PARQUE_ENTRANCE_IMAGES.parqueElSaltoParkIII,
  },
  {
    keywords: ['t-mexpark', 't-mex park', 'texcoco'],
    imageUrl: PARKS_DEMO_PARQUE_ENTRANCE_IMAGES.parqueTMexPark,
  },
  {
    keywords: ['toluca parks', 'toluca parks iii', 'lerma'],
    imageUrl: PARKS_DEMO_PARQUE_ENTRANCE_IMAGES.parqueTolucaParksIII,
  },
  {
    keywords: ['tultipark', 'tultipark ii', 'tultitlán', 'tultitlan'],
    imageUrl: PARKS_DEMO_PARQUE_ENTRANCE_IMAGES.parqueTultiParkII,
  },
  {
    keywords: ['tlanepark', 'tlanepark iv', 'tlalnepantla'],
    imageUrl: PARKS_DEMO_PARQUE_ENTRANCE_IMAGES.parqueTlaneParkIV,
  },
  {
    keywords: ['guadalupepark', 'guadalupe park', 'guadalupe'],
    imageUrl: PARKS_DEMO_PARQUE_ENTRANCE_IMAGES.parqueGuadalupeParkI,
  },
  {
    keywords: ['monterrey', 'apodaca', 'nuevo león', 'nuevo leon'],
    imageUrl: PARKS_DEMO_PARQUE_ENTRANCE_IMAGES.parqueGuadalupeParkI,
  },
  {
    keywords: ['querétaro', 'queretaro', 'el marqués', 'el marques'],
    imageUrl: PARKS_DEMO_PARQUE_ENTRANCE_IMAGES.parqueQro,
  },
  {
    keywords: ['tijuana', 'baja california'],
    imageUrl: PARKS_DEMO_PARQUE_ENTRANCE_IMAGES.parqueTijuana,
  },
];

const PARKS_KNOWN_PARQUE_ENTRANCE_IMAGES: Record<string, string> = {
  'Parques del Bajío - Silao': PARKS_DEMO_PARQUE_ENTRANCE_IMAGES.parqueBajio,
  'Guadalajara Park': PARKS_DEMO_PARQUE_ENTRANCE_IMAGES.parqueGuadalajaraPark,
  'El Salto Park III': PARKS_DEMO_PARQUE_ENTRANCE_IMAGES.parqueElSaltoParkIII,
  'T-MexPark': PARKS_DEMO_PARQUE_ENTRANCE_IMAGES.parqueTMexPark,
  'Toluca Parks III': PARKS_DEMO_PARQUE_ENTRANCE_IMAGES.parqueTolucaParksIII,
  'TultiPark II': PARKS_DEMO_PARQUE_ENTRANCE_IMAGES.parqueTultiParkII,
  'TlanePark IV': PARKS_DEMO_PARQUE_ENTRANCE_IMAGES.parqueTlaneParkIV,
  'GuadalupePark I': PARKS_DEMO_PARQUE_ENTRANCE_IMAGES.parqueGuadalupeParkI,
};

const pickParksImageFromPool = (
  seed: string,
  imagePool: readonly string[],
): string => {
  let hash = 0;

  for (let index = 0; index < seed.length; index += 1) {
    hash = (hash + seed.charCodeAt(index) * (index + 1)) % 2147483647;
  }

  return imagePool[Math.abs(hash) % imagePool.length] ?? imagePool[0]!;
};

export const resolveParksParqueEntranceImageUrl = ({
  fotoEntradaUrl,
  nombre,
  ubicacion,
  recordId,
}: {
  fotoEntradaUrl?: string | null;
  nombre?: string | null;
  ubicacion?: string | null;
  recordId?: string | null;
}): string => {
  if (typeof fotoEntradaUrl === 'string' && fotoEntradaUrl.trim().length > 0) {
    return fotoEntradaUrl;
  }

  const normalizedNombre = nombre?.trim() ?? '';

  if (
    normalizedNombre.length > 0 &&
    PARKS_KNOWN_PARQUE_ENTRANCE_IMAGES[normalizedNombre]
  ) {
    return PARKS_KNOWN_PARQUE_ENTRANCE_IMAGES[normalizedNombre]!;
  }

  const searchText = `${nombre ?? ''} ${ubicacion ?? ''}`.toLowerCase();

  for (const rule of PARKS_PARQUE_ENTRANCE_IMAGE_RULES) {
    if (rule.keywords.some((keyword) => searchText.includes(keyword))) {
      return rule.imageUrl;
    }
  }

  return pickParksImageFromPool(
    recordId ?? nombre ?? ubicacion ?? 'parks-parque',
    Object.values(PARKS_DEMO_PARQUE_ENTRANCE_IMAGES),
  );
};

export const resolveParksNavePropertyImageUrl = ({
  fotoInmuebleUrl,
  identificador,
  recordId,
}: {
  fotoInmuebleUrl?: string | null;
  identificador?: string | null;
  recordId?: string | null;
}): string => {
  if (typeof fotoInmuebleUrl === 'string' && fotoInmuebleUrl.trim().length > 0) {
    return fotoInmuebleUrl;
  }

  return pickParksImageFromPool(
    recordId ?? identificador ?? 'parks-nave',
    PARKS_DEMO_NAVE_PROPERTY_IMAGES,
  );
};

export const getParksNavePropertyImageByIndex = (index: number): string =>
  PARKS_DEMO_NAVE_PROPERTY_IMAGES[index % PARKS_DEMO_NAVE_PROPERTY_IMAGES.length]!;
