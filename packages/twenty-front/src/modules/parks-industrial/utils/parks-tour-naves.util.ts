import { isDefined } from 'twenty-shared/utils';

export type ParksTourNaveRef = {
  id: string;
  identificador: string;
  m2?: number;
  parqueNombre?: string;
};

export const serializeParksTourNavesMostradas = (
  naves: ParksTourNaveRef[],
): string => {
  if (naves.length === 0) {
    return '';
  }

  return JSON.stringify(
    naves.map((nave) => ({
      id: nave.id,
      identificador: nave.identificador,
      m2: nave.m2,
      parqueNombre: nave.parqueNombre,
    })),
  );
};

export const parseParksTourNavesMostradas = (
  value?: string | null,
): ParksTourNaveRef[] => {
  if (!value || value.trim().length === 0) {
    return [];
  }

  const trimmed = value.trim();

  if (trimmed.startsWith('[')) {
    try {
      const parsed = JSON.parse(trimmed) as unknown;

      if (!Array.isArray(parsed)) {
        return [];
      }

      return parsed
        .map((item) => {
          if (!item || typeof item !== 'object') {
            return null;
          }

          const record = item as Record<string, unknown>;
          const id =
            typeof record.id === 'string'
              ? record.id
              : typeof record.naveId === 'string'
                ? record.naveId
                : null;
          const identificador =
            typeof record.identificador === 'string'
              ? record.identificador
              : null;

          if (!id || !identificador) {
            return null;
          }

          return {
            id,
            identificador,
            m2: typeof record.m2 === 'number' ? record.m2 : undefined,
            parqueNombre:
              typeof record.parqueNombre === 'string'
                ? record.parqueNombre
                : undefined,
          } satisfies ParksTourNaveRef;
        })
        .filter(isDefined);
    } catch {
      // Fall through to delimiter parsing
    }
  }

  return trimmed
    .split(/[·|,;]/)
    .map((part) => part.trim())
    .filter((part) => part.length > 0)
    .map((identificador) => ({
      id: identificador,
      identificador,
    }));
};

export const formatParksTourNavesLabel = (
  naves: ParksTourNaveRef[],
): string => {
  if (naves.length === 0) {
    return '';
  }

  return naves.map((nave) => nave.identificador).join(' · ');
};
