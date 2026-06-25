import { t } from '@lingui/core/macro';

import { type ParksParqueRecord } from '@/parks-industrial/hooks/useParksParques';

export type ParksMapCityFilterId =
  | 'all'
  | 'ciudad-de-mexico'
  | 'guadalajara'
  | 'monterrey'
  | 'bajio';

type ParksMapCityFilterDefinition = {
  id: ParksMapCityFilterId;
  label: string;
  keywords: string[];
};

const PARKS_MAP_CITY_FILTER_DEFINITIONS: ParksMapCityFilterDefinition[] = [
  {
    id: 'ciudad-de-mexico',
    label: 'Ciudad de México',
    keywords: [
      'estado de méxico',
      'estado de mexico',
      'edomex',
      'texcoco',
      'lerma',
      'tultitlán',
      'tultitlan',
      'tlalnepantla',
      'toluca',
      'cdmx',
      'ciudad de méxico',
      'ciudad de mexico',
      'naucalpan',
      'ecatepec',
      't-mexpark',
      'toluca parks',
      'tultipark',
      'tlanepark',
    ],
  },
  {
    id: 'guadalajara',
    label: 'Guadalajara',
    keywords: [
      'guadalajara park',
      'el salto park iii',
      'el salto park',
      'parque industrial guadalajara norte',
      'jalisco',
      'guadalajara',
      'tlaquepaque',
      'el salto',
      'zapopan',
      'tonalá',
      'tonala',
    ],
  },
  {
    id: 'monterrey',
    label: 'Monterrey',
    keywords: [
      'nuevo león',
      'nuevo leon',
      'monterrey',
      'guadalupe',
      'apodaca',
      'santa catarina',
      'san nicolás',
      'san nicolas',
      'guadalupepark',
    ],
  },
  {
    id: 'bajio',
    label: 'Bajío',
    keywords: [
      'guanajuato',
      'silao',
      'bajío',
      'bajio',
      'querétaro',
      'queretaro',
      'el marqués',
      'el marques',
    ],
  },
];

const buildParqueSearchText = (parque: ParksParqueRecord): string =>
  `${parque.nombre ?? ''} ${parque.ubicacion ?? ''}`.toLowerCase();

export const resolveParksMapCityFilterId = (
  parque: ParksParqueRecord,
): ParksMapCityFilterId | null => {
  const searchText = buildParqueSearchText(parque);

  for (const cityFilter of PARKS_MAP_CITY_FILTER_DEFINITIONS) {
    const matchesCity = cityFilter.keywords.some((keyword) =>
      searchText.includes(keyword),
    );

    if (matchesCity) {
      return cityFilter.id;
    }
  }

  return null;
};

export const getParksMapCityFilterLabel = (
  cityFilterId: ParksMapCityFilterId,
): string => {
  if (cityFilterId === 'all') {
    return t`Todas las ciudades`;
  }

  const cityFilter = PARKS_MAP_CITY_FILTER_DEFINITIONS.find(
    (definition) => definition.id === cityFilterId,
  );

  return cityFilter?.label ?? cityFilterId;
};

export const getParksMapCityFilterOptions = (
  parques: ParksParqueRecord[],
): Array<{ id: ParksMapCityFilterId; label: string }> => {
  const cityFilterIds = new Set<ParksMapCityFilterId>();

  for (const parque of parques) {
    const cityFilterId = resolveParksMapCityFilterId(parque);

    if (cityFilterId) {
      cityFilterIds.add(cityFilterId);
    }
  }

  const orderedCityFilters = PARKS_MAP_CITY_FILTER_DEFINITIONS.filter(
    (definition) => cityFilterIds.has(definition.id),
  );

  return [
    { id: 'all', label: getParksMapCityFilterLabel('all') },
    ...orderedCityFilters.map((definition) => ({
      id: definition.id,
      label: definition.label,
    })),
  ];
};

export const filterParquesByCity = (
  parques: ParksParqueRecord[],
  cityFilterId: ParksMapCityFilterId,
): ParksParqueRecord[] => {
  if (cityFilterId === 'all') {
    return parques;
  }

  return parques.filter(
    (parque) => resolveParksMapCityFilterId(parque) === cityFilterId,
  );
};

export const filterParquesForMap = ({
  parques,
  searchQuery,
  cityFilterId,
}: {
  parques: ParksParqueRecord[];
  searchQuery: string;
  cityFilterId: ParksMapCityFilterId;
}): ParksParqueRecord[] => {
  const normalizedQuery = searchQuery.trim().toLowerCase();
  const parquesInCity = filterParquesByCity(parques, cityFilterId);

  if (normalizedQuery.length === 0) {
    return parquesInCity;
  }

  return parquesInCity.filter((parque) => {
    const searchTarget = buildParqueSearchText(parque);

    return searchTarget.includes(normalizedQuery);
  });
};
