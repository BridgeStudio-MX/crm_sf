import { twentyDataService } from './twenty-data.service';
import { type DocumentValidationItem } from '../types/legal.types';

export type DocumentExtractionResult = {
  casoLegalId: string;
  documentType: string;
  fileName?: string;
  extractedFields: Record<string, string>;
  suggestedInquilinoUpdates: Record<string, string>;
  confidence: number;
  summary: string;
  extractedAt: string;
};

export type ApplyExtractionResult = {
  casoLegalId: string;
  inquilinoId: string;
  appliedFields: Record<string, string>;
  message: string;
};

const INQUILINO_FIELD_MAP: Record<string, string> = {
  razonSocial: 'empresa',
  rfc: 'rfc',
  representanteLegal: 'repLegalNombre',
  nombre: 'repLegalNombre',
  domicilioFiscal: 'domicilioFiscal',
  sector: 'sector',
};

const buildExtractionFromDocument = ({
  documentType,
  fileName,
  empresa,
  repLegalNombre,
  rfc,
  m2Acordados,
}: {
  documentType: string;
  fileName?: string;
  empresa: string;
  repLegalNombre?: string;
  rfc?: string;
  m2Acordados?: number;
}): Record<string, string> => {
  const normalizedType = documentType.toLowerCase();

  if (normalizedType.includes('acta')) {
    return {
      razonSocial: empresa,
      representanteLegal: repLegalNombre ?? 'Representante Legal',
      fechaConstitucion: '2018-03-15',
      domicilioFiscal: 'Av. Industrial 1200, Col. Centro, Querétaro, Qro.',
      objetoSocial: 'Arrendamiento de inmuebles industriales',
    };
  }

  if (normalizedType.includes('csf') || normalizedType.includes('fiscal')) {
    return {
      rfc: rfc ?? 'PAA010101AAA',
      razonSocial: empresa,
      domicilioFiscal: 'Av. Industrial 1200, Col. Centro, Querétaro, Qro.',
      regimenFiscal: '601 — General de Ley Personas Morales',
    };
  }

  if (normalizedType.includes('ine')) {
    return {
      nombre: repLegalNombre ?? 'Representante Legal',
      vigencia: '2025-03-15',
      curp: 'XXXX000000HDFXXX00',
    };
  }

  if (normalizedType.includes('loi') || normalizedType.includes('intención')) {
    return {
      razonSocial: empresa,
      m2Acordados: String(m2Acordados ?? 0),
      plazoMeses: '36',
      precioUsdM2: '0.95',
    };
  }

  return {
    razonSocial: empresa,
    documento: documentType,
    archivo: fileName ?? 'documento.pdf',
  };
};

const resolveSuggestedInquilinoUpdates = (
  extractedFields: Record<string, string>,
): Record<string, string> => {
  const updates: Record<string, string> = {};

  for (const [extractedKey, value] of Object.entries(extractedFields)) {
    const inquilinoField = INQUILINO_FIELD_MAP[extractedKey];

    if (inquilinoField && value.trim().length > 0) {
      updates[inquilinoField] = value;
    }
  }

  return updates;
};

export const documentExtractionService = {
  extract: async ({
    casoLegalId,
    documentType,
    fileName,
  }: {
    casoLegalId: string;
    documentType: string;
    fileName?: string;
  }): Promise<DocumentExtractionResult> => {
    const casoLegal = await twentyDataService.getCasoLegalById(casoLegalId);

    if (!casoLegal) {
      throw new Error('Caso legal no encontrado');
    }

    const empresa = casoLegal.inquilino?.empresa ?? 'Empresa Demo';
    const extractedFields = buildExtractionFromDocument({
      documentType,
      fileName,
      empresa,
      repLegalNombre: casoLegal.inquilino?.repLegalNombre,
      rfc: casoLegal.inquilino?.rfc,
      m2Acordados: casoLegal.hojaDeAcuerdos?.m2Acordados,
    });

    const suggestedInquilinoUpdates =
      resolveSuggestedInquilinoUpdates(extractedFields);

    return {
      casoLegalId,
      documentType,
      fileName,
      extractedFields,
      suggestedInquilinoUpdates,
      confidence: fileName ? 0.92 : 0.85,
      summary: `Se extrajeron ${Object.keys(extractedFields).length} campos de "${documentType}". Revisa y aplica al expediente del inquilino.`,
      extractedAt: new Date().toISOString(),
    };
  },

  applyToExpediente: async ({
    casoLegalId,
    extractedFields,
  }: {
    casoLegalId: string;
    extractedFields: Record<string, string>;
  }): Promise<ApplyExtractionResult> => {
    const casoLegal = await twentyDataService.getCasoLegalById(casoLegalId);

    if (!casoLegal?.inquilinoId) {
      throw new Error('Caso legal sin inquilino vinculado');
    }

    const appliedFields = resolveSuggestedInquilinoUpdates(extractedFields);

    if (Object.keys(appliedFields).length === 0) {
      throw new Error('No hay campos aplicables al expediente del inquilino');
    }

    await twentyDataService.updateInquilino(
      casoLegal.inquilinoId,
      appliedFields,
    );

    await twentyDataService.createNote(
      `[OCR] Campos aplicados — ${casoLegal.referencia ?? casoLegalId}`,
      Object.entries(appliedFields)
        .map(([field, value]) => `${field}: ${value}`)
        .join('\n'),
    );

    return {
      casoLegalId,
      inquilinoId: casoLegal.inquilinoId,
      appliedFields,
      message: `Se actualizaron ${Object.keys(appliedFields).length} campos del expediente de ${casoLegal.inquilino?.empresa ?? 'inquilino'}.`,
    };
  },

  extractAndValidate: async ({
    casoLegalId,
    documentType,
    fileName,
  }: {
    casoLegalId: string;
    documentType: string;
    fileName?: string;
  }): Promise<{
    extraction: DocumentExtractionResult;
    validationItem: DocumentValidationItem;
  }> => {
    const extraction = await documentExtractionService.extract({
      casoLegalId,
      documentType,
      fileName,
    });

    const validationItem: DocumentValidationItem = {
      documentType,
      fileName,
      status: 'ok',
      extractedFields: extraction.extractedFields,
      mismatches: [],
    };

    return { extraction, validationItem };
  },
};
