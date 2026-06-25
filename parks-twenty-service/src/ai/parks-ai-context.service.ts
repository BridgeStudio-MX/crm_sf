import { CHECKLIST_DOCUMENT_TYPES } from '../constants/parks.constants';
import { twentyDataService } from '../services/twenty-data.service';
import {
  type ParksAiChecklistDocument,
  type ParksAiNaveSnapshot,
  type ParksAiRouteContext,
} from './parks-ai.types';

const normalizeSelectLabel = (value?: string | null): string =>
  (value ?? '')
    .replace(/_/g, ' ')
    .replace(/\s+/g, ' ')
    .trim();

export const parksAiContextService = {
  loadCasoLegalBundle: async (casoLegalId: string) => {
    const casoLegal = await twentyDataService.getCasoLegalById(casoLegalId);

    if (!casoLegal) {
      return null;
    }

    const checklistRaw =
      await twentyDataService.findDocumentosChecklistByCasoLegal(casoLegalId);

    const checklist: ParksAiChecklistDocument[] = checklistRaw.map(
      (document) => ({
        id: document.id,
        titulo: document.titulo,
        tipoDocumento: document.tipoDocumento,
        entregado: document.entregado,
      }),
    );

    return { casoLegal, checklist };
  },

  loadDisponibleNaves: async (): Promise<ParksAiNaveSnapshot[]> => {
    const naves = await twentyDataService.findNavesDisponibles();

    return naves.map((nave) => ({
      identificador: nave.identificador ?? 'Nave',
      m2: nave.m2,
      parqueNombre: nave.parque?.nombre,
      ubicacion: nave.parque?.ubicacion,
    }));
  },

  buildScreenHint: (context?: ParksAiRouteContext): string => {
    if (!context) {
      return 'Pantalla Parks Industrial (sin contexto específico).';
    }

    const parts = [`Pantalla: ${context.screen}`];

    if (context.casoLegalId) {
      parts.push(`casoLegalId=${context.casoLegalId}`);
    }

    if (context.parqueId) {
      parts.push(`parqueId=${context.parqueId}`);
    }

    if (context.cityFilterId) {
      parts.push(`filtroCiudad=${context.cityFilterId}`);
    }

    if (context.searchQuery) {
      parts.push(`búsqueda="${context.searchQuery}"`);
    }

    return parts.join(' · ');
  },

  getExpectedChecklistTypes: (): string[] => [...CHECKLIST_DOCUMENT_TYPES],

  normalizeChecklistType: normalizeSelectLabel,
};
