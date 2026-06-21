import { CHECKLIST_DOCUMENT_TYPES } from '../constants/parks.constants';
import { type CasoLegalRecord } from '../types/parks.types';
import { toSelectValue } from '../utils/select-value.util';
import { twentyDataService } from './twenty-data.service';

export const checklistService = {
  generateForCasoLegal: async (casoLegalId: string): Promise<void> => {
    await checklistService.generarChecklist({ id: casoLegalId });
  },

  generarChecklist: async (
    casoLegal: Pick<CasoLegalRecord, 'id' | 'referencia'>,
  ): Promise<void> => {
    const existingDocuments =
      await twentyDataService.findDocumentosChecklistByCasoLegal(casoLegal.id);

    if (existingDocuments.length >= CHECKLIST_DOCUMENT_TYPES.length) {
      console.log(
        `[checklist.service] Checklist already exists for ${casoLegal.id}`,
      );
      return;
    }

    const existingTypes = new Set(
      existingDocuments.map((document) => document.tipoDocumento),
    );

    for (const tipoDocumento of CHECKLIST_DOCUMENT_TYPES) {
      if (existingTypes.has(toSelectValue(tipoDocumento))) {
        continue;
      }

      if (existingTypes.has(tipoDocumento)) {
        continue;
      }

      const createdDocument = await twentyDataService.createDocumentoChecklist({
        titulo: tipoDocumento,
        tipoDocumento: toSelectValue(tipoDocumento),
        entregado: false,
        casoLegalId: casoLegal.id,
      });

      if (createdDocument) {
        console.log(
          `[checklist.service] + ${tipoDocumento} → caso ${casoLegal.referencia ?? casoLegal.id}`,
        );
      }
    }
  },
};
