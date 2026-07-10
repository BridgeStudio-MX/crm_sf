import { randomUUID } from 'node:crypto';

import {
  DECISOR_CLIENTE_MAX_COUNT,
  type DecisorClienteRol,
} from '../constants/decisor-cliente.constants';
import {
  type DecisorCliente,
  type UpsertDecisorClienteInput,
} from '../types/decisor-cliente.types';

const decisores = new Map<string, DecisorCliente>();

const matchesScope = (
  decisor: DecisorCliente,
  scope: { inquilinoId?: string; opportunityId?: string },
): boolean => {
  if (scope.opportunityId && decisor.opportunityId === scope.opportunityId) {
    return true;
  }

  if (scope.inquilinoId && decisor.inquilinoId === scope.inquilinoId) {
    return true;
  }

  return false;
};

const countInScope = (scope: {
  inquilinoId?: string;
  opportunityId?: string;
}): number =>
  Array.from(decisores.values()).filter((decisor) =>
    matchesScope(decisor, scope),
  ).length;

export const decisorClienteStore = {
  listByInquilino: (inquilinoId: string): DecisorCliente[] =>
    Array.from(decisores.values())
      .filter((decisor) => decisor.inquilinoId === inquilinoId)
      .sort(
        (left, right) =>
          new Date(left.createdAt).getTime() -
          new Date(right.createdAt).getTime(),
      ),

  listByOpportunity: (
    opportunityId: string,
    inquilinoId?: string,
  ): DecisorCliente[] => {
    const scoped = Array.from(decisores.values()).filter(
      (decisor) =>
        decisor.opportunityId === opportunityId ||
        (inquilinoId ? decisor.inquilinoId === inquilinoId : false),
    );

    const uniqueById = new Map<string, DecisorCliente>();

    for (const decisor of scoped) {
      uniqueById.set(decisor.id, decisor);
    }

    return Array.from(uniqueById.values()).sort(
      (left, right) =>
        new Date(left.createdAt).getTime() -
        new Date(right.createdAt).getTime(),
    );
  },

  getById: (decisorId: string): DecisorCliente | null =>
    decisores.get(decisorId) ?? null,

  upsert: (input: UpsertDecisorClienteInput): DecisorCliente => {
    const now = new Date().toISOString();
    const existing = input.id ? decisores.get(input.id) : undefined;

    if (!existing && countInScope(input) >= DECISOR_CLIENTE_MAX_COUNT) {
      throw new Error(
        `Máximo ${DECISOR_CLIENTE_MAX_COUNT} decisores por cuenta u oportunidad`,
      );
    }

    const record: DecisorCliente = {
      id: existing?.id ?? input.id ?? randomUUID(),
      inquilinoId: input.inquilinoId ?? existing?.inquilinoId,
      opportunityId: input.opportunityId ?? existing?.opportunityId,
      nombre: input.nombre.trim(),
      correo: input.correo?.trim() || undefined,
      telefono: input.telefono?.trim() || undefined,
      rol: input.rol,
      asistioTour: input.asistioTour ?? existing?.asistioTour ?? false,
      createdAt: existing?.createdAt ?? now,
      updatedAt: now,
    };

    decisores.set(record.id, record);

    return record;
  },

  remove: (decisorId: string): boolean => decisores.delete(decisorId),

  setTourAttendance: (
    opportunityId: string,
    attendedDecisorIds: string[],
  ): DecisorCliente[] => {
    const attendedSet = new Set(attendedDecisorIds);

    return Array.from(decisores.values())
      .filter((decisor) => decisor.opportunityId === opportunityId)
      .map((decisor) => {
        const updated: DecisorCliente = {
          ...decisor,
          asistioTour: attendedSet.has(decisor.id),
          updatedAt: new Date().toISOString(),
        };

        decisores.set(updated.id, updated);

        return updated;
      });
  },

  seedDemo: (records: Omit<DecisorCliente, 'createdAt' | 'updatedAt'>[]) => {
    const now = new Date().toISOString();

    for (const record of records) {
      decisores.set(record.id, {
        ...record,
        createdAt: now,
        updatedAt: now,
      });
    }
  },

  formatAsistentesLabel: (
    decisorRecords: DecisorCliente[],
    attendedDecisorIds?: string[],
  ): string => {
    const attendedSet = new Set(attendedDecisorIds);

    return decisorRecords
      .filter(
        (decisor) =>
          decisor.asistioTour ||
          (attendedDecisorIds ? attendedSet.has(decisor.id) : false),
      )
      .map(
        (decisor) =>
          `${decisor.nombre} (${decisor.rol.replaceAll('_', ' ').toLowerCase()})`,
      )
      .join(', ');
  },
};

export type { DecisorClienteRol };
