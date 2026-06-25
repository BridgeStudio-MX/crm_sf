import { twentyClient } from '../services/twenty.client';
import {
  resolveParksNavePropertyImageUrl,
  resolveParksParqueEntranceImageUrl,
} from './parks-demo-image.constants';

const LIST_PARQUES = `
  query ListParquesForImagePatch {
    parques(first: 200) {
      edges {
        node {
          id
          nombre
          ubicacion
          fotoEntradaUrl
        }
      }
    }
  }
`;

const LIST_NAVES = `
  query ListNavesForImagePatch {
    naves(first: 500) {
      edges {
        node {
          id
          identificador
          fotoInmuebleUrl
        }
      }
    }
  }
`;

const UPDATE_PARQUE = `
  mutation UpdateParqueImage($id: UUID!, $data: ParqueUpdateInput!) {
    updateParque(id: $id, data: $data) {
      id
      nombre
      fotoEntradaUrl
    }
  }
`;

const UPDATE_NAVE = `
  mutation UpdateNaveImage($id: UUID!, $data: NaveUpdateInput!) {
    updateNave(id: $id, data: $data) {
      id
      identificador
      fotoInmuebleUrl
    }
  }
`;

type ParqueNode = {
  id: string;
  nombre?: string | null;
  ubicacion?: string | null;
  fotoEntradaUrl?: string | null;
};

type NaveNode = {
  id: string;
  identificador?: string | null;
  fotoInmuebleUrl?: string | null;
};

const hasImageUrl = (value?: string | null): boolean =>
  typeof value === 'string' && value.trim().length > 0;

export const patchPropertyImages = async (): Promise<void> => {
  const parquesResponse = await twentyClient.query<{
    parques: { edges: { node: ParqueNode }[] };
  }>(LIST_PARQUES);

  let parquesUpdated = 0;

  for (const edge of parquesResponse.parques.edges) {
    const parque = edge.node;

    if (hasImageUrl(parque.fotoEntradaUrl)) {
      continue;
    }

    const fotoEntradaUrl = resolveParksParqueEntranceImageUrl({
      fotoEntradaUrl: parque.fotoEntradaUrl,
      nombre: parque.nombre,
      ubicacion: parque.ubicacion,
      recordId: parque.id,
    });

    await twentyClient.mutate(UPDATE_PARQUE, {
      id: parque.id,
      data: { fotoEntradaUrl },
    });

    parquesUpdated += 1;
    console.log(`[patch:images] + parque ${parque.nombre ?? parque.id}`);
  }

  const navesResponse = await twentyClient.query<{
    naves: { edges: { node: NaveNode }[] };
  }>(LIST_NAVES);

  let navesUpdated = 0;

  for (const edge of navesResponse.naves.edges) {
    const nave = edge.node;

    if (hasImageUrl(nave.fotoInmuebleUrl)) {
      continue;
    }

    const fotoInmuebleUrl = resolveParksNavePropertyImageUrl({
      fotoInmuebleUrl: nave.fotoInmuebleUrl,
      identificador: nave.identificador,
      recordId: nave.id,
    });

    await twentyClient.mutate(UPDATE_NAVE, {
      id: nave.id,
      data: { fotoInmuebleUrl },
    });

    navesUpdated += 1;
    console.log(`[patch:images] + nave ${nave.identificador ?? nave.id}`);
  }

  console.log(
    `[patch:images] Done — ${parquesUpdated} parques, ${navesUpdated} naves actualizados`,
  );
};
