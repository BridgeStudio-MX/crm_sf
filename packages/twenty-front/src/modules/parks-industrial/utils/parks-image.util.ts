import { isNonEmptyString } from '@sniptt/guards';

import {
  PARKS_DEFAULT_NAVE_PROPERTY_IMAGES,
  PARKS_DEFAULT_PARQUE_ENTRANCE_IMAGES,
  PARKS_KNOWN_PARQUE_ENTRANCE_IMAGES,
  PARKS_PARQUE_ENTRANCE_IMAGE_RULES,
} from '@/parks-industrial/constants/parks-industrial-image.constants';

export const getParksImageUrl = (imageUrl?: string | null): string | null => {
  if (!isNonEmptyString(imageUrl)) {
    return null;
  }

  if (imageUrl.startsWith('/')) {
    if (typeof window !== 'undefined') {
      return `${window.location.origin}${imageUrl}`;
    }

    return imageUrl;
  }

  try {
    const parsedUrl = new URL(imageUrl);

    if (parsedUrl.protocol !== 'http:' && parsedUrl.protocol !== 'https:') {
      return null;
    }

    return imageUrl;
  } catch {
    return null;
  }
};

const pickParksImageFromPool = (
  seed: string,
  imagePool: readonly string[],
): string => {
  let hash = 0;

  for (let index = 0; index < seed.length; index += 1) {
    hash = (hash + seed.charCodeAt(index) * (index + 1)) % 2147483647;
  }

  const imageIndex = Math.abs(hash) % imagePool.length;

  return imagePool[imageIndex] ?? imagePool[0]!;
};

const matchParqueEntranceImageByText = (
  nombre?: string | null,
  ubicacion?: string | null,
): string | null => {
  const normalizedNombre = nombre?.trim() ?? '';

  if (normalizedNombre.length > 0) {
    const knownImageUrl = PARKS_KNOWN_PARQUE_ENTRANCE_IMAGES[normalizedNombre];

    if (knownImageUrl) {
      return knownImageUrl;
    }
  }

  const searchText = `${nombre ?? ''} ${ubicacion ?? ''}`.toLowerCase();

  for (const rule of PARKS_PARQUE_ENTRANCE_IMAGE_RULES) {
    const matchesRule = rule.keywords.some((keyword) =>
      searchText.includes(keyword),
    );

    if (matchesRule) {
      return rule.imageUrl;
    }
  }

  return null;
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
  const imageUrlFromRecord = getParksImageUrl(fotoEntradaUrl);

  if (imageUrlFromRecord) {
    return imageUrlFromRecord;
  }

  const matchedImageUrl = matchParqueEntranceImageByText(nombre, ubicacion);

  if (matchedImageUrl) {
    return matchedImageUrl;
  }

  return pickParksImageFromPool(
    recordId ?? nombre ?? ubicacion ?? 'parks-parque',
    PARKS_DEFAULT_PARQUE_ENTRANCE_IMAGES,
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
  const imageUrlFromRecord = getParksImageUrl(fotoInmuebleUrl);

  if (imageUrlFromRecord) {
    return imageUrlFromRecord;
  }

  return pickParksImageFromPool(
    recordId ?? identificador ?? 'parks-nave',
    PARKS_DEFAULT_NAVE_PROPERTY_IMAGES,
  );
};

export const getParksImageFallbackInitials = (label: string): string => {
  const words = label
    .trim()
    .split(/\s+/)
    .filter((word) => word.length > 0);

  if (words.length === 0) {
    return '?';
  }

  if (words.length === 1) {
    return words[0]!.slice(0, 2).toUpperCase();
  }

  return `${words[0]![0] ?? ''}${words[1]![0] ?? ''}`.toUpperCase();
};
