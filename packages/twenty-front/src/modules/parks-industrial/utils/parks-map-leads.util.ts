import { t } from '@lingui/core/macro';

import {
  getParksPipelineStageLabel,
} from '@/parks-industrial/constants/parks-industrial.constants';
import { type ParksOpportunityRecord } from '@/parks-industrial/hooks/useParksRecords';
import { type ParksMapCityFilterId } from '@/parks-industrial/utils/parks-map-city-filter.util';
import { formatParksUbicacionDeseadaLabel } from '@/parks-industrial/utils/parks-unassigned-leads.util';

export type ParksMapLayerId = 'inventario' | 'demanda' | 'ambos';

export type ParksMapLeadRegionId =
  | 'guadalajara'
  | 'monterrey'
  | 'ciudad-de-mexico'
  | 'bajio'
  | 'norte'
  | 'sur'
  | 'otro';

export type ParksMapLeadMarker = {
  regionId: ParksMapLeadRegionId;
  label: string;
  coords: { lat: number; lng: number };
  cityFilterId: ParksMapCityFilterId | null;
  leads: ParksOpportunityRecord[];
  leadCount: number;
  totalM2: number;
};

type ParksMapLeadRegionDefinition = {
  regionId: ParksMapLeadRegionId;
  label: string;
  cityFilterId: ParksMapCityFilterId | null;
  coords: { lat: number; lng: number };
  matchValues: string[];
};

const CLOSED_PIPELINE_STAGES = new Set([
  'PERDIDO',
  'GANADO_CONTRATO_FIRMADO',
]);

const PARKS_MAP_LEAD_REGION_DEFINITIONS: ParksMapLeadRegionDefinition[] = [
  {
    regionId: 'guadalajara',
    label: 'Guadalajara',
    cityFilterId: 'guadalajara',
    coords: { lat: 20.6597, lng: -103.3496 },
    matchValues: ['guadalajara', 'gdl', 'jalisco'],
  },
  {
    regionId: 'monterrey',
    label: 'Monterrey',
    cityFilterId: 'monterrey',
    coords: { lat: 25.6866, lng: -100.3161 },
    matchValues: ['monterrey', 'mty', 'nuevo leon', 'nuevo león'],
  },
  {
    regionId: 'ciudad-de-mexico',
    label: 'CDMX',
    cityFilterId: 'ciudad-de-mexico',
    coords: { lat: 19.4326, lng: -99.1332 },
    matchValues: [
      'cdmx',
      'ciudad de mexico',
      'ciudad de méxico',
      'estado de mexico',
      'estado de méxico',
      'edomex',
    ],
  },
  {
    regionId: 'bajio',
    label: 'Bajío',
    cityFilterId: 'bajio',
    coords: { lat: 20.9356, lng: -101.4456 },
    matchValues: ['bajio', 'bajío', 'silao', 'guanajuato', 'queretaro', 'querétaro'],
  },
  {
    regionId: 'norte',
    label: 'Norte',
    cityFilterId: null,
    coords: { lat: 28.6353, lng: -106.0889 },
    matchValues: ['norte', 'chihuahua', 'saltillo', 'torreon', 'torreón'],
  },
  {
    regionId: 'sur',
    label: 'Sur',
    cityFilterId: null,
    coords: { lat: 19.0414, lng: -98.2063 },
    matchValues: ['sur', 'puebla', 'veracruz', 'oaxaca'],
  },
  {
    regionId: 'otro',
    label: 'Otra ubicación',
    cityFilterId: null,
    coords: { lat: 23.6345, lng: -102.5528 },
    matchValues: ['otro', 'otra', 'otra ubicacion', 'otra ubicación'],
  },
];

const normalizeUbicacionValue = (value?: string | null): string =>
  (value ?? '')
    .trim()
    .toLowerCase()
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '');

export const resolveParksMapLeadRegionId = (
  ubicacionDeseada?: string | null,
): ParksMapLeadRegionId => {
  const normalized = normalizeUbicacionValue(ubicacionDeseada);

  if (!normalized) {
    return 'otro';
  }

  for (const region of PARKS_MAP_LEAD_REGION_DEFINITIONS) {
    const matchesRegion = region.matchValues.some((matchValue) =>
      normalized.includes(normalizeUbicacionValue(matchValue)),
    );

    if (matchesRegion) {
      return region.regionId;
    }
  }

  return 'otro';
};

export const getParksMapLeadRegionDefinition = (
  regionId: ParksMapLeadRegionId,
): ParksMapLeadRegionDefinition =>
  PARKS_MAP_LEAD_REGION_DEFINITIONS.find(
    (region) => region.regionId === regionId,
  ) ?? PARKS_MAP_LEAD_REGION_DEFINITIONS[PARKS_MAP_LEAD_REGION_DEFINITIONS.length - 1]!;

export const isParksMapOpenLead = (
  opportunity: ParksOpportunityRecord,
): boolean => {
  const stageId = opportunity.stage ?? '';

  return !CLOSED_PIPELINE_STAGES.has(stageId);
};

export const filterParksMapLeads = ({
  opportunities,
  cityFilterId,
  searchQuery,
}: {
  opportunities: ParksOpportunityRecord[];
  cityFilterId: ParksMapCityFilterId;
  searchQuery: string;
}): ParksOpportunityRecord[] => {
  const normalizedQuery = searchQuery.trim().toLowerCase();

  return opportunities.filter((opportunity) => {
    if (!isParksMapOpenLead(opportunity)) {
      return false;
    }

    const regionId = resolveParksMapLeadRegionId(opportunity.ubicacionDeseada);
    const region = getParksMapLeadRegionDefinition(regionId);

    if (
      cityFilterId !== 'all' &&
      region.cityFilterId !== null &&
      region.cityFilterId !== cityFilterId
    ) {
      return false;
    }

    if (cityFilterId !== 'all' && region.cityFilterId === null) {
      return false;
    }

    if (normalizedQuery.length === 0) {
      return true;
    }

    const searchTarget = [
      opportunity.name,
      opportunity.giroEmpresa,
      opportunity.ubicacionDeseada,
      formatParksUbicacionDeseadaLabel(opportunity.ubicacionDeseada),
      getParksPipelineStageLabel(opportunity.stage),
      opportunity.leasingOfficerAsignado,
    ]
      .filter(Boolean)
      .join(' ')
      .toLowerCase();

    return searchTarget.includes(normalizedQuery);
  });
};

export const buildParksMapLeadMarkers = (
  leads: ParksOpportunityRecord[],
): ParksMapLeadMarker[] => {
  const leadsByRegionId = new Map<
    ParksMapLeadRegionId,
    ParksOpportunityRecord[]
  >();

  for (const lead of leads) {
    const regionId = resolveParksMapLeadRegionId(lead.ubicacionDeseada);
    const regionLeads = leadsByRegionId.get(regionId) ?? [];
    regionLeads.push(lead);
    leadsByRegionId.set(regionId, regionLeads);
  }

  return PARKS_MAP_LEAD_REGION_DEFINITIONS.flatMap((region) => {
    const regionLeads = leadsByRegionId.get(region.regionId) ?? [];

    if (regionLeads.length === 0) {
      return [];
    }

    const totalM2 = regionLeads.reduce(
      (sum, lead) => sum + (lead.m2Requeridos ?? 0),
      0,
    );

    return [
      {
        regionId: region.regionId,
        label: region.label,
        coords: region.coords,
        cityFilterId: region.cityFilterId,
        leads: regionLeads,
        leadCount: regionLeads.length,
        totalM2,
      },
    ];
  });
};

export const getParksMapLayerOptions = (): Array<{
  id: ParksMapLayerId;
  label: string;
}> => [
  { id: 'inventario', label: t`Inventario` },
  { id: 'demanda', label: t`Leads` },
  { id: 'ambos', label: t`Ambos` },
];

export const PARKS_MAP_LEAD_MARKER_COLOR = '#ea580c';
export const PARKS_MAP_LEAD_MARKER_SELECTED_COLOR = '#c2410c';
