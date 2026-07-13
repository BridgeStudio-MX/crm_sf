import { GET_OPPORTUNITIES_FOR_DEMAND_SEARCH } from '../graphql/queries';
import { type DemandSearchFilters, type DemandSearchResult } from '../types/commercial.types';
import { type GraphQlConnection } from '../types/parks.types';
import { naveMatchingService } from './nave-matching.service';
import { twentyClient } from './twenty.client';

type OpportunityDemandNode = {
  id: string;
  name?: string;
  stage?: string;
  m2Requeridos?: number;
  ubicacionDeseada?: string;
  canalOrigen?: string;
  plazoContratoMeses?: number;
  updatedAt?: string;
  amount?: { amountMicros?: number; currencyCode?: string };
  inquilinoVinculado?: {
    id?: string;
    empresa?: string;
    sector?: string;
    rfc?: string;
  };
  naveVinculada?: {
    id?: string;
    identificador?: string;
  };
};

const ACTIVE_STAGE_BLOCKLIST = [
  'perdida',
  'perdido',
  'cancelado',
  'cerrado',
  'holdover',
];

const isActiveProspect = (stage: string | undefined): boolean => {
  if (!stage) {
    return true;
  }

  const normalizedStage = stage.toLowerCase();

  return !ACTIVE_STAGE_BLOCKLIST.some((blockedStage) =>
    normalizedStage.includes(blockedStage),
  );
};

const resolvePresupuestoUsd = (
  amountMicros: number | undefined,
): number | undefined => {
  if (!amountMicros) {
    return undefined;
  }

  return Math.round(amountMicros / 1_000_000);
};

const loadOpportunities = async (): Promise<OpportunityDemandNode[]> => {
  try {
    const response = await twentyClient.query<{
      opportunities: GraphQlConnection<OpportunityDemandNode>;
    }>(GET_OPPORTUNITIES_FOR_DEMAND_SEARCH);

    return (
      response.opportunities?.edges.map((edge) => edge.node) ?? []
    );
  } catch {
    return [];
  }
};

export const demandSearchService = {
  search: async (
    filters: DemandSearchFilters,
  ): Promise<DemandSearchResult> => {
    const opportunities = await loadOpportunities();
    const normalizedCity = (filters.cityFilter ?? '').toLowerCase().trim();
    const normalizedSector = (filters.sectorFilter ?? '').toLowerCase().trim();

    let filtered = opportunities.filter((opportunity) =>
      isActiveProspect(opportunity.stage),
    );

    if (typeof filters.m2Min === 'number' && filters.m2Min > 0) {
      filtered = filtered.filter(
        (opportunity) => (opportunity.m2Requeridos ?? 0) >= filters.m2Min!,
      );
    }

    if (typeof filters.m2Max === 'number' && filters.m2Max > 0) {
      filtered = filtered.filter(
        (opportunity) => (opportunity.m2Requeridos ?? 0) <= filters.m2Max!,
      );
    }

    if (normalizedCity && normalizedCity !== 'all') {
      filtered = filtered.filter((opportunity) =>
        (opportunity.ubicacionDeseada ?? '')
          .toLowerCase()
          .includes(normalizedCity),
      );
    }

    if (normalizedSector) {
      filtered = filtered.filter((opportunity) =>
        (opportunity.inquilinoVinculado?.sector ?? '')
          .toLowerCase()
          .includes(normalizedSector),
      );
    }

    if (filters.canalOrigen) {
      filtered = filtered.filter((opportunity) =>
        (opportunity.canalOrigen ?? '')
          .toLowerCase()
          .includes(filters.canalOrigen!.toLowerCase()),
      );
    }

    const limit = filters.limit ?? 50;

    const prospects = await Promise.all(
      filtered.slice(0, limit).map(async (opportunity) => {
        const m2Requeridos = opportunity.m2Requeridos ?? 0;
        const industry =
          opportunity.inquilinoVinculado?.sector ?? filters.sectorFilter;
        const matchResult =
          m2Requeridos > 0
            ? await naveMatchingService.match({
                opportunityId: opportunity.id,
                m2Requeridos,
                industry,
                cityFilter: filters.cityFilter,
                minAlturaLibre: filters.minAlturaLibre,
                minAndenes: filters.minAndenes,
                limit: 3,
              })
            : {
                opportunityId: opportunity.id,
                m2Requeridos: 0,
                industry,
                matches: [],
                totalDisponibles: 0,
              };

        return {
          opportunityId: opportunity.id,
          companyName:
            opportunity.inquilinoVinculado?.empresa ??
            opportunity.name ??
            'Prospecto',
          stage: opportunity.stage,
          m2Requeridos,
          ubicacionDeseada: opportunity.ubicacionDeseada,
          sector: opportunity.inquilinoVinculado?.sector,
          canalOrigen: opportunity.canalOrigen,
          plazoContratoMeses: opportunity.plazoContratoMeses,
          presupuestoMensualUsd: resolvePresupuestoUsd(
            opportunity.amount?.amountMicros,
          ),
          inquilinoId: opportunity.inquilinoVinculado?.id,
          naveVinculadaIdentificador: opportunity.naveVinculada?.identificador,
          updatedAt: opportunity.updatedAt,
          matchingNaves: matchResult.matches,
        };
      }),
    );

    return {
      filters,
      totalMatches: filtered.length,
      prospects,
      searchedAt: new Date().toISOString(),
    };
  },
};
