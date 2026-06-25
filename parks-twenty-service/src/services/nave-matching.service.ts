import { DEMO_NAVE_DEFINITIONS } from '../seed/demo-seed-naves.constants';
import { type NaveMatchCandidate, type NaveMatchResult } from '../types/commercial.types';
import { twentyDataService } from './twenty-data.service';

type NaveCatalogItem = {
  id: string;
  identificador: string;
  m2: number;
  parqueNombre?: string;
  ubicacion?: string;
  precioUsdM2?: number;
};

const DEMO_PARQUE_NAMES: Record<string, { nombre: string; ubicacion: string }> =
  {
    parqueGuadalajaraPark: {
      nombre: 'Guadalajara Park',
      ubicacion: 'Guadalajara, Jalisco',
    },
    parqueElSaltoParkIII: {
      nombre: 'El Salto Park III',
      ubicacion: 'El Salto, Jalisco',
    },
    parqueMonterreyPark: {
      nombre: 'Monterrey Park',
      ubicacion: 'Monterrey, Nuevo León',
    },
    parqueQueretaroPark: {
      nombre: 'Querétaro Park',
      ubicacion: 'Querétaro, Qro.',
    },
    parqueTolucaPark: {
      nombre: 'Toluca Park',
      ubicacion: 'Toluca, Edo. Méx.',
    },
  };

const loadNaveCatalog = async (): Promise<NaveCatalogItem[]> => {
  const navesFromTwenty = await twentyDataService.findNavesDisponibles();

  if (navesFromTwenty.length > 0) {
    return navesFromTwenty
      .filter((nave) => nave.identificador)
      .map((nave, index) => ({
        id: nave.id ?? `nave-${index}`,
        identificador: nave.identificador ?? 'Nave',
        m2: nave.m2 ?? 0,
        parqueNombre: nave.parque?.nombre,
        ubicacion: nave.parque?.ubicacion,
        precioUsdM2: 0.95,
      }));
  }

  return DEMO_NAVE_DEFINITIONS.filter(
    (nave) => nave.estatus === 'Disponible',
  ).map((nave) => {
    const parque = DEMO_PARQUE_NAMES[nave.parqueKey];

    return {
      id: nave.key,
      identificador: nave.identificador,
      m2: nave.m2,
      parqueNombre: parque?.nombre,
      ubicacion: parque?.ubicacion,
      precioUsdM2: nave.precioBaseUsd,
    };
  });
};

const scoreM2Fit = (naveM2: number, requiredM2: number): number => {
  if (requiredM2 <= 0) {
    return 70;
  }

  const ratio = naveM2 / requiredM2;

  if (ratio >= 0.9 && ratio <= 1.15) {
    return 100;
  }

  if (ratio >= 0.75 && ratio <= 1.35) {
    return 85;
  }

  if (ratio >= 0.5 && ratio <= 1.6) {
    return 65;
  }

  return 40;
};

const scoreIndustryFit = (
  industry: string | undefined,
  ubicacion: string | undefined,
): { bonus: number; reason?: string } => {
  const normalizedIndustry = (industry ?? '').toLowerCase();
  const normalizedLocation = (ubicacion ?? '').toLowerCase();

  if (
    normalizedIndustry.includes('logistic') ||
    normalizedIndustry.includes('logística')
  ) {
    if (
      normalizedLocation.includes('guadalajara') ||
      normalizedLocation.includes('querétaro') ||
      normalizedLocation.includes('queretaro')
    ) {
      return { bonus: 12, reason: 'Corredor logístico del Bajío' };
    }
  }

  if (
    normalizedIndustry.includes('automotriz') ||
    normalizedIndustry.includes('auto')
  ) {
    if (
      normalizedLocation.includes('monterrey') ||
      normalizedLocation.includes('guadalajara')
    ) {
      return { bonus: 10, reason: 'Hub automotriz regional' };
    }
  }

  if (
    normalizedIndustry.includes('alimento') ||
    normalizedIndustry.includes('food')
  ) {
    if (normalizedLocation.includes('toluca')) {
      return { bonus: 8, reason: 'Cercanía a corredor alimentos CDMX' };
    }
  }

  return { bonus: 0 };
};

const buildMatchReasons = (
  nave: NaveCatalogItem,
  m2Score: number,
  industryReason?: string,
): string[] => {
  const reasons: string[] = [];

  if (m2Score >= 90) {
    reasons.push('Superficie alineada al requerimiento');
  } else if (m2Score >= 65) {
    reasons.push('Superficie aceptable con margen de negociación');
  }

  if (industryReason) {
    reasons.push(industryReason);
  }

  if (nave.precioUsdM2 && nave.precioUsdM2 <= 0.9) {
    reasons.push('Precio competitivo USD/m²');
  }

  if (reasons.length === 0) {
    reasons.push('Disponible en cartera Parks');
  }

  return reasons;
};

export const naveMatchingService = {
  match: async ({
    opportunityId,
    m2Requeridos,
    industry,
    cityFilter,
    limit = 3,
  }: {
    opportunityId?: string;
    m2Requeridos: number;
    industry?: string;
    cityFilter?: string;
    limit?: number;
  }): Promise<NaveMatchResult> => {
    const catalog = await loadNaveCatalog();
    const normalizedCity = (cityFilter ?? '').toLowerCase();

    const filteredCatalog =
      normalizedCity && normalizedCity !== 'all'
        ? catalog.filter((nave) =>
            (nave.ubicacion ?? nave.parqueNombre ?? '')
              .toLowerCase()
              .includes(normalizedCity),
          )
        : catalog;

    const scored: NaveMatchCandidate[] = filteredCatalog.map((nave) => {
      const m2Score = scoreM2Fit(nave.m2, m2Requeridos);
      const industryFit = scoreIndustryFit(industry, nave.ubicacion);
      const matchScore = Math.min(
        99,
        Math.round(m2Score * 0.75 + industryFit.bonus + 10),
      );

      return {
        naveId: nave.id,
        identificador: nave.identificador,
        m2: nave.m2,
        parqueNombre: nave.parqueNombre,
        ubicacion: nave.ubicacion,
        precioUsdM2: nave.precioUsdM2,
        matchScore,
        matchReasons: buildMatchReasons(nave, m2Score, industryFit.reason),
      };
    });

    const matches = scored
      .sort((left, right) => right.matchScore - left.matchScore)
      .slice(0, limit);

    return {
      opportunityId,
      m2Requeridos,
      industry,
      matches,
      totalDisponibles: filteredCatalog.length,
    };
  },
};
