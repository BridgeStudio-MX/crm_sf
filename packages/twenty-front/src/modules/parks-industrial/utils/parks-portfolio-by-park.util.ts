import { type ParksParqueRecord } from '@/parks-industrial/hooks/useParksParques';
import {
  type ParksNaveRecord,
  type ParksOpportunityRecord,
} from '@/parks-industrial/hooks/useParksRecords';
import {
  getParksAmountFromMicros,
  getParksParqueM2Disponibles,
} from '@/parks-industrial/utils/parks-format.util';
import { resolveParksMapCityFilterId } from '@/parks-industrial/utils/parks-map-city-filter.util';
import {
  getParksMapLeadRegionDefinition,
  isParksMapOpenLead,
  resolveParksMapLeadRegionId,
} from '@/parks-industrial/utils/parks-map-leads.util';
import {
  resolveParksNaveInventoryKind,
  type ParksNaveInventoryKind,
} from '@/parks-industrial/utils/parks-portfolio-metrics.util';
import { parseParksTourNavesMostradas } from '@/parks-industrial/utils/parks-tour-naves.util';

export type ParksPortfolioLeadMatchReason = 'nave' | 'tour' | 'ubicacion';

export type ParksPortfolioNaveItem = {
  id: string;
  identificador: string;
  m2: number;
  precioBaseUsd: number;
  daysVacant: number | null;
  interestCount: number;
  estatus: string;
  kind: ParksNaveInventoryKind;
  entregaEstimada: string | null;
  leads: ParksPortfolioLeadItem[];
};

export type ParksPortfolioLeadItem = {
  id: string;
  name: string;
  stage: string | undefined;
  m2Requeridos: number;
  pipelineValueUsd: number;
  leasingOfficer: string | null;
  naveId: string | null;
  naveIdentificador: string | null;
  matchReason: ParksPortfolioLeadMatchReason;
  updatedAt: string | null;
};

export type ParksPortfolioParkRow = {
  parqueId: string;
  nombre: string;
  ubicacion: string | null;
  ocupacion: number;
  m2Totales: number;
  m2Rentados: number;
  m2Disponibles: number;
  occupiedNaveCount: number;
  constructionNaveCount: number;
  constructionM2: number;
  totalNaveCount: number;
  availableNaves: ParksPortfolioNaveItem[];
  allNaves: ParksPortfolioNaveItem[];
  oldestVacantNave: ParksPortfolioNaveItem | null;
  daysSinceLastInterest: number | null;
  leads: ParksPortfolioLeadItem[];
  pipelineValueUsd: number;
};

export type ParksPortfolioByParkResult = {
  parks: ParksPortfolioParkRow[];
  unmatchedLeads: ParksPortfolioLeadItem[];
  parqueCount: number;
  availableNaveCount: number;
  availableM2: number;
  constructionNaveCount: number;
  leadCount: number;
  pipelineValueUsd: number;
};

const EMPTY_PORTFOLIO: ParksPortfolioByParkResult = {
  parks: [],
  unmatchedLeads: [],
  parqueCount: 0,
  availableNaveCount: 0,
  availableM2: 0,
  constructionNaveCount: 0,
  leadCount: 0,
  pipelineValueUsd: 0,
};

const normalizeMatchText = (value?: string | null): string =>
  (value ?? '')
    .trim()
    .toLowerCase()
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '');

const MS_PER_DAY = 86_400_000;

const getDaysSince = (isoDate?: string | null): number | null => {
  if (!isoDate) {
    return null;
  }

  const parsed = Date.parse(isoDate);

  if (!Number.isFinite(parsed)) {
    return null;
  }

  return Math.max(0, Math.floor((Date.now() - parsed) / MS_PER_DAY));
};

const getLeadOfficerName = (
  opportunity: ParksOpportunityRecord,
): string | null => {
  const assigned = opportunity.leasingOfficerAsignado?.trim();

  if (assigned) {
    return assigned;
  }

  const ownerName = [
    opportunity.owner?.name?.firstName,
    opportunity.owner?.name?.lastName,
  ]
    .filter(Boolean)
    .join(' ')
    .trim();

  return ownerName.length > 0 ? ownerName : null;
};

const getLinkedNaveId = (
  opportunity: ParksOpportunityRecord,
): string | undefined =>
  opportunity.naveVinculadaId ?? opportunity.naveVinculada?.id;

const toLeadItem = (
  opportunity: ParksOpportunityRecord,
  navesById: Map<string, ParksNaveRecord>,
  matchReason: ParksPortfolioLeadMatchReason,
): ParksPortfolioLeadItem => {
  const linkedNaveId = getLinkedNaveId(opportunity);
  const linkedNave = linkedNaveId ? navesById.get(linkedNaveId) : undefined;

  return {
    id: opportunity.id,
    name: opportunity.name?.trim() || opportunity.folio?.trim() || 'Lead',
    stage: opportunity.stage,
    m2Requeridos: opportunity.m2Requeridos ?? 0,
    pipelineValueUsd: getParksAmountFromMicros(
      opportunity.amount?.amountMicros,
    ),
    leasingOfficer: getLeadOfficerName(opportunity),
    naveId: linkedNaveId ?? linkedNave?.id ?? null,
    naveIdentificador:
      opportunity.naveVinculada?.identificador ??
      linkedNave?.identificador ??
      null,
    matchReason,
    updatedAt: opportunity.updatedAt ?? opportunity.createdAt ?? null,
  };
};

const scoreParkForUbicacion = (
  parque: ParksParqueRecord,
  opportunity: ParksOpportunityRecord,
): number => {
  const query = normalizeMatchText(opportunity.ubicacionDeseada);

  if (!query) {
    return 0;
  }

  const parkName = normalizeMatchText(parque.nombre);
  const parkLocation = normalizeMatchText(parque.ubicacion);

  if (parkName && (parkName.includes(query) || query.includes(parkName))) {
    return 90;
  }

  if (
    parkLocation &&
    (parkLocation.includes(query) || query.includes(parkLocation))
  ) {
    return 70;
  }

  const leadRegion = getParksMapLeadRegionDefinition(
    resolveParksMapLeadRegionId(opportunity.ubicacionDeseada),
  );
  const parkCityId = resolveParksMapCityFilterId(parque);

  if (
    leadRegion.cityFilterId &&
    parkCityId &&
    leadRegion.cityFilterId === parkCityId
  ) {
    return 50;
  }

  return 0;
};

const resolveLeadParkAssignment = (
  opportunity: ParksOpportunityRecord,
  parques: ParksParqueRecord[],
  navesById: Map<string, ParksNaveRecord>,
): { parqueId: string; matchReason: ParksPortfolioLeadMatchReason } | null => {
  const linkedNaveId = getLinkedNaveId(opportunity);
  const linkedNave = linkedNaveId ? navesById.get(linkedNaveId) : undefined;

  if (linkedNave?.parqueId) {
    return { parqueId: linkedNave.parqueId, matchReason: 'nave' };
  }

  const tourNaves = parseParksTourNavesMostradas(opportunity.tourNavesMostradas);
  const tourCounts = new Map<string, number>();

  for (const tourNave of tourNaves) {
    const catalogNave = navesById.get(tourNave.id);
    let parqueId = catalogNave?.parqueId;

    if (!parqueId && tourNave.parqueNombre) {
      const tourParkName = normalizeMatchText(tourNave.parqueNombre);
      const matchedPark = parques.find((parque) => {
        const parkName = normalizeMatchText(parque.nombre);

        return (
          parkName.length > 0 &&
          (parkName.includes(tourParkName) || tourParkName.includes(parkName))
        );
      });

      parqueId = matchedPark?.id;
    }

    if (!parqueId) {
      continue;
    }

    tourCounts.set(parqueId, (tourCounts.get(parqueId) ?? 0) + 1);
  }

  if (tourCounts.size > 0) {
    const [topParqueId] = [...tourCounts.entries()].sort(
      (left, right) => right[1] - left[1],
    )[0] ?? [];

    if (topParqueId) {
      return { parqueId: topParqueId, matchReason: 'tour' };
    }
  }

  const scoredParks = parques
    .map((parque) => ({
      parqueId: parque.id,
      score: scoreParkForUbicacion(parque, opportunity),
    }))
    .filter((entry) => entry.score > 0)
    .sort((left, right) => right.score - left.score);

  const topScore = scoredParks[0]?.score ?? 0;
  const uniqueWinners = scoredParks.filter((entry) => entry.score === topScore);

  if (uniqueWinners.length === 1 && uniqueWinners[0]) {
    return { parqueId: uniqueWinners[0].parqueId, matchReason: 'ubicacion' };
  }

  return null;
};

const PARKS_CONSTRUCTION_ENTREGA_BY_IDENTIFICADOR: Record<string, string> = {
  'Nave XC-01': 'Q1 2027',
  'Nave BT-GDL-A': 'Mar 2027',
  'Nave XL-MTY-1': 'Q2 2027',
  'Nave TOL-P1': 'Nov 2026',
};

const toNaveItem = (
  nave: ParksNaveRecord,
  leads: ParksPortfolioLeadItem[],
): ParksPortfolioNaveItem => {
  const kind = resolveParksNaveInventoryKind(nave.estatus);
  const identificador = nave.identificador?.trim() || nave.id;

  return {
    id: nave.id,
    identificador,
    m2: nave.m2 ?? 0,
    precioBaseUsd: nave.precioBaseUsd ?? 0,
    daysVacant:
      kind === 'disponible'
        ? getDaysSince(nave.updatedAt ?? nave.createdAt)
        : null,
    interestCount: leads.length,
    estatus: nave.estatus?.trim() || 'Disponible',
    kind,
    entregaEstimada:
      kind === 'construccion'
        ? (PARKS_CONSTRUCTION_ENTREGA_BY_IDENTIFICADOR[identificador] ??
          'Por confirmar')
        : null,
    leads,
  };
};

export const isParksParkUnderConstruction = (
  park: ParksPortfolioParkRow,
): boolean =>
  park.totalNaveCount > 0 &&
  park.constructionNaveCount === park.totalNaveCount;

const compareParkRows = (
  left: ParksPortfolioParkRow,
  right: ParksPortfolioParkRow,
): number => {
  if (right.leads.length !== left.leads.length) {
    return right.leads.length - left.leads.length;
  }

  if (right.availableNaves.length !== left.availableNaves.length) {
    return right.availableNaves.length - left.availableNaves.length;
  }

  return left.nombre.localeCompare(right.nombre, 'es');
};

const compareLeadItems = (
  left: ParksPortfolioLeadItem,
  right: ParksPortfolioLeadItem,
): number => {
  if (right.pipelineValueUsd !== left.pipelineValueUsd) {
    return right.pipelineValueUsd - left.pipelineValueUsd;
  }

  return left.name.localeCompare(right.name, 'es');
};

export const buildParksPortfolioByPark = ({
  parques,
  naves,
  opportunities,
}: {
  parques: ParksParqueRecord[];
  naves: ParksNaveRecord[];
  opportunities: ParksOpportunityRecord[];
}): ParksPortfolioByParkResult => {
  if (parques.length === 0) {
    return EMPTY_PORTFOLIO;
  }

  const navesById = new Map(naves.map((nave) => [nave.id, nave]));
  const navesByParqueId = new Map<string, ParksNaveRecord[]>();

  for (const nave of naves) {
    if (!nave.parqueId) {
      continue;
    }

    const parkNaves = navesByParqueId.get(nave.parqueId) ?? [];
    parkNaves.push(nave);
    navesByParqueId.set(nave.parqueId, parkNaves);
  }

  const leadsByParqueId = new Map<string, ParksPortfolioLeadItem[]>();
  const unmatchedLeads: ParksPortfolioLeadItem[] = [];

  for (const opportunity of opportunities) {
    if (!isParksMapOpenLead(opportunity)) {
      continue;
    }

    const assignment = resolveLeadParkAssignment(
      opportunity,
      parques,
      navesById,
    );

    if (!assignment) {
      unmatchedLeads.push(toLeadItem(opportunity, navesById, 'ubicacion'));
      continue;
    }

    const parkLeads = leadsByParqueId.get(assignment.parqueId) ?? [];
    parkLeads.push(
      toLeadItem(opportunity, navesById, assignment.matchReason),
    );
    leadsByParqueId.set(assignment.parqueId, parkLeads);
  }

  const parks = parques
    .map((parque): ParksPortfolioParkRow => {
      const parkNaves = navesByParqueId.get(parque.id) ?? [];
      const m2Totales = parque.m2Totales ?? 0;
      const m2Rentados = parque.m2Rentados ?? 0;
      const leads = (leadsByParqueId.get(parque.id) ?? []).sort(
        compareLeadItems,
      );
      const leadsByNaveId = new Map<string, ParksPortfolioLeadItem[]>();

      for (const lead of leads) {
        if (!lead.naveId) {
          continue;
        }

        const naveLeads = leadsByNaveId.get(lead.naveId) ?? [];
        naveLeads.push(lead);
        leadsByNaveId.set(lead.naveId, naveLeads);
      }

      const allNaves = parkNaves
        .map((nave) => toNaveItem(nave, leadsByNaveId.get(nave.id) ?? []))
        .sort((left, right) => {
          if (left.kind !== right.kind) {
            const kindOrder: Record<typeof left.kind, number> = {
              construccion: 0,
              disponible: 1,
              negociacion: 2,
              ocupada: 3,
            };

            return kindOrder[left.kind] - kindOrder[right.kind];
          }

          return (right.daysVacant ?? 0) - (left.daysVacant ?? 0);
        });
      const availableNaves = allNaves.filter(
        (nave) => nave.kind === 'disponible',
      );
      const constructionNaves = allNaves.filter(
        (nave) => nave.kind === 'construccion',
      );
      const occupiedNaveCount = allNaves.filter(
        (nave) => nave.kind === 'ocupada',
      ).length;
      const oldestVacantNave = availableNaves[0] ?? null;
      const latestLeadTimestamp = leads.reduce((latest, lead) => {
        const parsed = lead.updatedAt ? Date.parse(lead.updatedAt) : NaN;

        if (!Number.isFinite(parsed)) {
          return latest;
        }

        return parsed > latest ? parsed : latest;
      }, 0);
      const daysSinceLastInterest =
        latestLeadTimestamp > 0
          ? Math.max(
              0,
              Math.floor((Date.now() - latestLeadTimestamp) / MS_PER_DAY),
            )
          : (oldestVacantNave?.daysVacant ?? null);

      return {
        parqueId: parque.id,
        nombre: parque.nombre?.trim() || 'Parque',
        ubicacion: parque.ubicacion?.trim() || null,
        ocupacion:
          m2Totales > 0 ? Math.round((m2Rentados / m2Totales) * 100) : 0,
        m2Totales,
        m2Rentados,
        m2Disponibles: getParksParqueM2Disponibles(m2Totales, m2Rentados),
        occupiedNaveCount,
        constructionNaveCount: constructionNaves.length,
        constructionM2: constructionNaves.reduce(
          (total, nave) => total + nave.m2,
          0,
        ),
        totalNaveCount: parkNaves.length,
        availableNaves,
        allNaves,
        oldestVacantNave,
        daysSinceLastInterest,
        leads,
        pipelineValueUsd: leads.reduce(
          (total, lead) => total + lead.pipelineValueUsd,
          0,
        ),
      };
    })
    .sort(compareParkRows);

  const availableNaveCount = parks.reduce(
    (total, park) => total + park.availableNaves.length,
    0,
  );
  const availableM2 = parks.reduce(
    (total, park) =>
      total +
      park.availableNaves.reduce((parkTotal, nave) => parkTotal + nave.m2, 0),
    0,
  );
  const constructionNaveCount = parks.reduce(
    (total, park) => total + park.constructionNaveCount,
    0,
  );
  const assignedLeadCount = parks.reduce(
    (total, park) => total + park.leads.length,
    0,
  );
  const pipelineValueUsd =
    parks.reduce((total, park) => total + park.pipelineValueUsd, 0) +
    unmatchedLeads.reduce((total, lead) => total + lead.pipelineValueUsd, 0);

  return {
    parks,
    unmatchedLeads: unmatchedLeads.sort(compareLeadItems),
    parqueCount: parks.length,
    availableNaveCount,
    availableM2,
    constructionNaveCount,
    leadCount: assignedLeadCount + unmatchedLeads.length,
    pipelineValueUsd,
  };
};
