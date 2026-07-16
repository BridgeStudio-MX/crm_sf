import { twentyClient } from '../services/twenty.client';
import { toSelectValue } from '../utils/select-value.util';

type IdRecord = { id: string };

type NaveRecord = {
  id: string;
  identificador: string;
  estatus?: string;
  parqueId?: string;
  parque?: { id: string; nombre?: string };
};

type ParqueRecord = {
  id: string;
  nombre: string;
};

const KEEP_PARQUE_NOMBRE = 'Parques del Bajío - Silao';
const NAVES_TO_KEEP_COUNT = 2;
const DISPONIBLE_VALUE = toSelectValue('Disponible');

const GET_ALL_PARQUES = `
  query GetAllParquesForReset {
    parques(first: 200) {
      edges {
        node {
          id
          nombre
        }
      }
    }
  }
`;

const GET_ALL_NAVES = `
  query GetAllNavesForReset {
    naves(first: 500) {
      edges {
        node {
          id
          identificador
          estatus
          parqueId
          parque {
            id
            nombre
          }
        }
      }
    }
  }
`;

const UPDATE_NAVE = `
  mutation UpdateNaveForReset($naveId: UUID!, $data: NaveUpdateInput!) {
    updateNave(id: $naveId, data: $data) {
      id
      estatus
      parqueId
    }
  }
`;

// Mutation field names follow Twenty's auto-generated destroy<PluralName> convention
// for each custom object involved in a park/nave/legal/commission chain.
const DESTROY_ALL_MUTATIONS: Array<{
  label: string;
  mutation: string;
  mutationField: string;
}> = [
  {
    label: 'documentos checklist',
    mutation: `mutation { destroyDocumentosChecklist(filter: {}) { id } }`,
    mutationField: 'destroyDocumentosChecklist',
  },
  {
    label: 'versiones documento',
    mutation: `mutation { destroyVersionesDocumento(filter: {}) { id } }`,
    mutationField: 'destroyVersionesDocumento',
  },
  {
    label: 'flujos firmas',
    mutation: `mutation { destroyFlujosFirmas(filter: {}) { id } }`,
    mutationField: 'destroyFlujosFirmas',
  },
  {
    label: 'comisiones',
    mutation: `mutation { destroyComisiones(filter: {}) { id } }`,
    mutationField: 'destroyComisiones',
  },
  {
    label: 'actas de restitución',
    mutation: `mutation { destroyActasRestitucion(filter: {}) { id } }`,
    mutationField: 'destroyActasRestitucion',
  },
  {
    label: 'holdovers',
    mutation: `mutation { destroyHoldovers(filter: {}) { id } }`,
    mutationField: 'destroyHoldovers',
  },
  {
    label: 'expedientes de contrato',
    mutation: `mutation { destroyExpedientesContrato(filter: {}) { id } }`,
    mutationField: 'destroyExpedientesContrato',
  },
  {
    label: 'casos legales',
    mutation: `mutation { destroyCasosLegales(filter: {}) { id } }`,
    mutationField: 'destroyCasosLegales',
  },
  {
    label: 'hojas de acuerdos',
    mutation: `mutation { destroyHojasDeAcuerdos(filter: {}) { id } }`,
    mutationField: 'destroyHojasDeAcuerdos',
  },
  {
    label: 'oportunidades (leads/pipeline)',
    mutation: `mutation { destroyOpportunities(filter: {}) { id } }`,
    mutationField: 'destroyOpportunities',
  },
  {
    label: 'inquilinos',
    mutation: `mutation { destroyInquilinos(filter: {}) { id } }`,
    mutationField: 'destroyInquilinos',
  },
];

const destroyAllOf = async (
  label: string,
  mutation: string,
  mutationField: string,
): Promise<number> => {
  try {
    const response = await twentyClient.mutate<Record<string, IdRecord[]>>(
      mutation,
      {},
    );
    const deletedRecords = response[mutationField] ?? [];

    if (deletedRecords.length > 0) {
      console.log(
        `[reset:single-park] - ${label}: ${deletedRecords.length} eliminados`,
      );
    }

    return deletedRecords.length;
  } catch (error) {
    const message = error instanceof Error ? error.message : String(error);
    console.warn(`[reset:single-park] ${label} omitido: ${message}`);
    return 0;
  }
};

const destroyNavesByIds = async (naveIds: string[]): Promise<number> => {
  if (naveIds.length === 0) {
    return 0;
  }

  const response = await twentyClient.mutate<{
    destroyNaves: IdRecord[];
  }>(
    `
      mutation DestroyNavesForReset($filter: NaveFilterInput!) {
        destroyNaves(filter: $filter) {
          id
        }
      }
    `,
    { filter: { id: { in: naveIds } } },
  );

  return response.destroyNaves?.length ?? 0;
};

const destroyParquesByIds = async (parqueIds: string[]): Promise<number> => {
  if (parqueIds.length === 0) {
    return 0;
  }

  const response = await twentyClient.mutate<{
    destroyParques: IdRecord[];
  }>(
    `
      mutation DestroyParquesForReset($filter: ParqueFilterInput!) {
        destroyParques(filter: $filter) {
          id
        }
      }
    `,
    { filter: { id: { in: parqueIds } } },
  );

  return response.destroyParques?.length ?? 0;
};

const fetchAllParques = async (): Promise<ParqueRecord[]> => {
  const response = await twentyClient.query<{
    parques: { edges: { node: ParqueRecord }[] };
  }>(GET_ALL_PARQUES, {});

  return response.parques.edges.map((edge) => edge.node);
};

const fetchAllNaves = async (): Promise<NaveRecord[]> => {
  const response = await twentyClient.query<{
    naves: { edges: { node: NaveRecord }[] };
  }>(GET_ALL_NAVES, {});

  return response.naves.edges.map((edge) => edge.node);
};

const resolveNaveParqueId = (nave: NaveRecord): string | undefined =>
  nave.parqueId ?? nave.parque?.id;

// Picks the parque with the most "Disponible" naves so the final dataset always
// ends up with real available inventory, preferring the historic Bajío park when
// it already qualifies to keep the reset deterministic across runs.
const pickKeepParqueId = (
  parques: ParqueRecord[],
  naves: NaveRecord[],
): string => {
  const disponibleCountByParqueId = new Map<string, number>();

  for (const nave of naves) {
    if (nave.estatus !== DISPONIBLE_VALUE) {
      continue;
    }

    const parqueId = resolveNaveParqueId(nave);

    if (!parqueId) {
      continue;
    }

    disponibleCountByParqueId.set(
      parqueId,
      (disponibleCountByParqueId.get(parqueId) ?? 0) + 1,
    );
  }

  const preferredParque = parques.find(
    (parque) => parque.nombre === KEEP_PARQUE_NOMBRE,
  );

  if (
    preferredParque &&
    (disponibleCountByParqueId.get(preferredParque.id) ?? 0) >=
      NAVES_TO_KEEP_COUNT
  ) {
    return preferredParque.id;
  }

  const bestCandidate = [...disponibleCountByParqueId.entries()].sort(
    (first, second) => second[1] - first[1],
  )[0];

  if (bestCandidate && bestCandidate[1] >= NAVES_TO_KEEP_COUNT) {
    return bestCandidate[0];
  }

  if (!parques[0]) {
    throw new Error('No hay parques en el workspace para conservar');
  }

  return parques[0].id;
};

const pickNavesToKeep = (
  naves: NaveRecord[],
  keepParqueId: string,
): NaveRecord[] => {
  const navesInKeptParque = naves.filter(
    (nave) => resolveNaveParqueId(nave) === keepParqueId,
  );

  const disponibles = navesInKeptParque.filter(
    (nave) => nave.estatus === DISPONIBLE_VALUE,
  );

  if (disponibles.length >= NAVES_TO_KEEP_COUNT) {
    return disponibles.slice(0, NAVES_TO_KEEP_COUNT);
  }

  return navesInKeptParque.slice(0, NAVES_TO_KEEP_COUNT);
};

const ensureNavesAreDisponibles = async (
  naves: NaveRecord[],
): Promise<void> => {
  const navesToFix = naves.filter((nave) => nave.estatus !== DISPONIBLE_VALUE);

  for (const nave of navesToFix) {
    await twentyClient.mutate(UPDATE_NAVE, {
      naveId: nave.id,
      data: { estatus: DISPONIBLE_VALUE },
    });
    console.log(
      `[reset:single-park] + nave ${nave.identificador} marcada como Disponible`,
    );
  }
};

export const resetToSingleParkService = {
  run: async (): Promise<void> => {
    console.log(
      '[reset:single-park] Limpiando datos comerciales/legales/de comisiones...',
    );

    for (const step of DESTROY_ALL_MUTATIONS) {
      await destroyAllOf(step.label, step.mutation, step.mutationField);
    }

    console.log('[reset:single-park] Resolviendo parque y naves a conservar...');

    const [parques, naves] = await Promise.all([
      fetchAllParques(),
      fetchAllNaves(),
    ]);

    const keepParqueId = pickKeepParqueId(parques, naves);
    const keepParque = parques.find((parque) => parque.id === keepParqueId);
    const navesToKeep = pickNavesToKeep(naves, keepParqueId);
    const naveIdsToKeep = new Set(navesToKeep.map((nave) => nave.id));

    const naveIdsToDelete = naves
      .filter((nave) => !naveIdsToKeep.has(nave.id))
      .map((nave) => nave.id);
    const parqueIdsToDelete = parques
      .filter((parque) => parque.id !== keepParqueId)
      .map((parque) => parque.id);

    const deletedNaves = await destroyNavesByIds(naveIdsToDelete);
    console.log(`[reset:single-park] - naves eliminadas: ${deletedNaves}`);

    const deletedParques = await destroyParquesByIds(parqueIdsToDelete);
    console.log(`[reset:single-park] - parques eliminados: ${deletedParques}`);

    await ensureNavesAreDisponibles(navesToKeep);

    console.log(
      `[reset:single-park] Listo — parque conservado: ${keepParque?.nombre ?? keepParqueId}`,
    );
    for (const nave of navesToKeep) {
      console.log(`[reset:single-park]   + nave disponible: ${nave.identificador}`);
    }
  },
};
