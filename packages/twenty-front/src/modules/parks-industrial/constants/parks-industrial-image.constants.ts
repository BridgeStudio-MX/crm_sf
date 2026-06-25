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

export const PARKS_DEFAULT_PARQUE_ENTRANCE_IMAGES = [
  buildUnsplashUrl('1586528116311-ad8dd3c8310d'),
  buildUnsplashUrl('1565514020179-026b92b84bb6'),
  buildUnsplashUrl('1497366216548-37526070297c'),
  buildUnsplashUrl('1486406146926-c627a92ad1ab'),
  buildUnsplashUrl('1558618666-fcd25c85cd64'),
  buildUnsplashUrl('1448638181993-6442d570a0b4'),
] as const;

export const PARKS_DEFAULT_NAVE_PROPERTY_IMAGES = [
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

type ParksParqueImageRule = {
  keywords: string[];
  imageUrl: string;
};

export const PARKS_PARQUE_ENTRANCE_IMAGE_RULES: ParksParqueImageRule[] = [
  {
    keywords: ['bajío', 'bajio', 'silao', 'guanajuato'],
    imageUrl: buildUnsplashUrl('1595844730298-6cff2533fccc'),
  },
  {
    keywords: ['guadalajara park'],
    imageUrl: PARKS_GUADALAJARA_PARK_ENTRANCE_IMAGE,
  },
  {
    keywords: ['el salto park', 'el salto park iii'],
    imageUrl: PARKS_EL_SALTO_PARK_III_ENTRANCE_IMAGE,
  },
  {
    keywords: ['t-mexpark', 't-mex park', 'texcoco'],
    imageUrl: PARKS_T_MEXPARK_ENTRANCE_IMAGE,
  },
  {
    keywords: ['toluca parks', 'toluca parks iii', 'lerma'],
    imageUrl: PARKS_TOLUCA_PARKS_III_ENTRANCE_IMAGE,
  },
  {
    keywords: ['tultipark', 'tultipark ii', 'tultitlán', 'tultitlan'],
    imageUrl: PARKS_TULTIPARK_II_ENTRANCE_IMAGE,
  },
  {
    keywords: ['tlanepark', 'tlanepark iv', 'tlalnepantla'],
    imageUrl: PARKS_TLANEPARK_IV_ENTRANCE_IMAGE,
  },
  {
    keywords: ['guadalupepark', 'guadalupe park', 'guadalupe'],
    imageUrl: PARKS_GUADALUPE_PARK_I_ENTRANCE_IMAGE,
  },
  {
    keywords: ['monterrey', 'apodaca', 'nuevo león', 'nuevo leon', 'santa catarina'],
    imageUrl: PARKS_GUADALUPE_PARK_I_ENTRANCE_IMAGE,
  },
  {
    keywords: ['querétaro', 'queretaro', 'el marqués', 'el marques'],
    imageUrl: buildUnsplashUrl('1497366216548-37526070297c'),
  },
  {
    keywords: ['tijuana', 'baja california', 'tecate'],
    imageUrl: buildUnsplashUrl('1486406146926-c627a92ad1ab'),
  },
  {
    keywords: ['puebla', 'cuautlancingo'],
    imageUrl: buildUnsplashUrl('1558618666-fcd25c85cd64'),
  },
  {
    keywords: ['cdmx', 'ciudad de méxico', 'ciudad de mexico', 'vallejo'],
    imageUrl: buildUnsplashUrl('1448638181993-6442d570a0b4'),
  },
];

export const PARKS_KNOWN_PARQUE_ENTRANCE_IMAGES: Record<string, string> = {
  'Parques del Bajío - Silao': buildUnsplashUrl('1595844730298-6cff2533fccc'),
  'Guadalajara Park': PARKS_GUADALAJARA_PARK_ENTRANCE_IMAGE,
  'El Salto Park III': PARKS_EL_SALTO_PARK_III_ENTRANCE_IMAGE,
  'T-MexPark': PARKS_T_MEXPARK_ENTRANCE_IMAGE,
  'Toluca Parks III': PARKS_TOLUCA_PARKS_III_ENTRANCE_IMAGE,
  'TultiPark II': PARKS_TULTIPARK_II_ENTRANCE_IMAGE,
  'TlanePark IV': PARKS_TLANEPARK_IV_ENTRANCE_IMAGE,
  'GuadalupePark I': PARKS_GUADALUPE_PARK_I_ENTRANCE_IMAGE,
};
