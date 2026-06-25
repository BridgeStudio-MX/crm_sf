import { randomUUID } from 'node:crypto';

import { type CxcHandoffRecord } from '../types/operations.types';

const handoffs = new Map<string, CxcHandoffRecord>();

export const cxcHandoffStore = {
  save: (
    record: Omit<CxcHandoffRecord, 'id' | 'createdAt'>,
  ): CxcHandoffRecord => {
    const existing = Array.from(handoffs.values()).find(
      (item) => item.casoLegalId === record.casoLegalId,
    );

    if (existing) {
      return existing;
    }

    const handoff: CxcHandoffRecord = {
      ...record,
      id: randomUUID(),
      createdAt: new Date().toISOString(),
    };

    handoffs.set(handoff.id, handoff);

    return handoff;
  },

  getByCasoLegalId: (casoLegalId: string): CxcHandoffRecord | null =>
    Array.from(handoffs.values()).find(
      (item) => item.casoLegalId === casoLegalId,
    ) ?? null,

  list: (): CxcHandoffRecord[] =>
    Array.from(handoffs.values()).sort(
      (left, right) =>
        new Date(right.createdAt).getTime() -
        new Date(left.createdAt).getTime(),
    ),
};
