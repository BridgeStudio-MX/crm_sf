import { type ContractDraftRecord } from '../types/legal.types';

const drafts = new Map<string, ContractDraftRecord>();

export const contractDraftStore = {
  get: (casoLegalId: string): ContractDraftRecord | null =>
    drafts.get(casoLegalId) ?? null,

  save: (
    draft: Omit<ContractDraftRecord, 'createdAt' | 'updatedAt' | 'version'> & {
      version?: number;
    },
  ): ContractDraftRecord => {
    const existing = drafts.get(draft.casoLegalId);
    const record: ContractDraftRecord = {
      ...draft,
      version: draft.version ?? (existing ? existing.version + 1 : 1),
      createdAt: existing?.createdAt ?? new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    };

    drafts.set(draft.casoLegalId, record);

    return record;
  },

  updateHtml: (
    casoLegalId: string,
    html: string,
  ): ContractDraftRecord | null => {
    const existing = drafts.get(casoLegalId);

    if (!existing) {
      return null;
    }

    const updated: ContractDraftRecord = {
      ...existing,
      html,
      version: existing.version + 1,
      updatedAt: new Date().toISOString(),
    };

    drafts.set(casoLegalId, updated);

    return updated;
  },

  setPdfPath: (
    casoLegalId: string,
    pdfPath: string,
  ): ContractDraftRecord | null => {
    const existing = drafts.get(casoLegalId);

    if (!existing) {
      return null;
    }

    const updated: ContractDraftRecord = {
      ...existing,
      pdfPath,
      updatedAt: new Date().toISOString(),
    };

    drafts.set(casoLegalId, updated);

    return updated;
  },
};
