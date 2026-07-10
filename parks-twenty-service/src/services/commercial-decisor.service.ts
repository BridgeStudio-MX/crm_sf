import { DECISOR_CLIENTE_ROLE_LABELS } from '../constants/decisor-cliente.constants';
import { type UpsertDecisorClienteInput } from '../types/decisor-cliente.types';
import { decisorClienteStore } from './decisor-cliente.store';
import { twentyDataService } from './twenty-data.service';

export const commercialDecisorService = {
  listForOpportunity: async (
    opportunityId: string,
    inquilinoId?: string,
  ) => {
    let decisores = decisorClienteStore.listByOpportunity(
      opportunityId,
      inquilinoId,
    );

    if (decisores.length === 0 && inquilinoId) {
      decisores = await bootstrapDecisoresFromInquilino(
        opportunityId,
        inquilinoId,
      );
    }

    if (decisores.length > 0) {
      return decisores;
    }

    if (!inquilinoId) {
      return [];
    }

    return decisorClienteStore.listByInquilino(inquilinoId);
  },

  listForInquilino: (inquilinoId: string) =>
    decisorClienteStore.listByInquilino(inquilinoId),

  upsert: async (input: UpsertDecisorClienteInput) => {
    const record = decisorClienteStore.upsert(input);

    if (input.opportunityId) {
      await syncTourAsistentesField(
        input.opportunityId,
        input.inquilinoId ?? record.inquilinoId,
      );
    }

    return record;
  },

  remove: async (decisorId: string, opportunityId?: string) => {
    const existing = decisorClienteStore.getById(decisorId);

    if (!existing) {
      return false;
    }

    decisorClienteStore.remove(decisorId);

    if (opportunityId) {
      await syncTourAsistentesField(opportunityId, existing.inquilinoId);
    }

    return true;
  },

  setTourAttendance: async ({
    opportunityId,
    inquilinoId,
    attendedDecisorIds,
  }: {
    opportunityId: string;
    inquilinoId?: string;
    attendedDecisorIds: string[];
  }) => {
    const allDecisores = decisorClienteStore.listByOpportunity(
      opportunityId,
      inquilinoId,
    );
    const attendedSet = new Set(attendedDecisorIds);

    for (const decisor of allDecisores) {
      decisorClienteStore.upsert({
        ...decisor,
        asistioTour: attendedSet.has(decisor.id),
      });
    }

    const tourAsistentes = await syncTourAsistentesField(
      opportunityId,
      inquilinoId,
      attendedDecisorIds,
    );

    return {
      tourAsistentes,
      decisores: decisorClienteStore.listByOpportunity(
        opportunityId,
        inquilinoId,
      ),
    };
  },

  createInitialFromLead: ({
    inquilinoId,
    opportunityId,
    nombreCompleto,
    correo,
    telefono,
  }: {
    inquilinoId: string;
    opportunityId: string;
    nombreCompleto: string;
    correo?: string;
    telefono?: string;
  }) =>
    decisorClienteStore.upsert({
      inquilinoId,
      opportunityId,
      nombre: nombreCompleto,
      correo,
      telefono,
      rol: 'DUENO_EMPRESA',
    }),
};

const syncTourAsistentesField = async (
  opportunityId: string,
  inquilinoId?: string,
  attendedDecisorIds?: string[],
) => {
  const decisores = decisorClienteStore.listByOpportunity(
    opportunityId,
    inquilinoId,
  );
  const attended = decisores.filter((decisor) =>
    attendedDecisorIds
      ? attendedDecisorIds.includes(decisor.id)
      : decisor.asistioTour,
  );
  const tourAsistentes = attended
    .map(
      (decisor) =>
        `${decisor.nombre} (${DECISOR_CLIENTE_ROLE_LABELS[decisor.rol]})`,
    )
    .join(', ');

  await twentyDataService.updateOpportunity(opportunityId, {
    tourAsistentes,
  });

  return tourAsistentes;
};

const bootstrapDecisoresFromInquilino = async (
  opportunityId: string,
  inquilinoId: string,
) => {
  const inquilino = await twentyDataService.getInquilinoById(inquilinoId);

  if (!inquilino) {
    return [];
  }

  const records = [];

  if (inquilino.contactoPrincipal) {
    records.push(
      decisorClienteStore.upsert({
        inquilinoId,
        opportunityId,
        nombre: inquilino.contactoPrincipal,
        correo: inquilino.emailContacto,
        telefono: inquilino.telefono,
        rol: 'DUENO_EMPRESA',
      }),
    );
  }

  if (inquilino.repLegalNombre) {
    records.push(
      decisorClienteStore.upsert({
        inquilinoId,
        opportunityId,
        nombre: inquilino.repLegalNombre,
        correo: inquilino.repLegalEmail,
        rol: 'GERENTE_OPERACIONES',
      }),
    );
  }

  return records;
};
