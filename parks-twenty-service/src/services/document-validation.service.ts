import axios from 'axios';

import { envConfig } from '../config/env.config';
import { twentyDataService } from './twenty-data.service';
import {
  type DocumentValidationItem,
  type DocumentValidationResult,
  type SimulatedDocumentUpload,
} from '../types/legal.types';

const normalizeText = (value: string): string =>
  value
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '')
    .toLowerCase()
    .trim();

const buildMockExtraction = ({
  documentType,
  empresa,
  repLegalNombre,
  rfc,
  m2Acordados,
  simulateMismatch,
}: {
  documentType: string;
  empresa: string;
  repLegalNombre?: string;
  rfc?: string;
  m2Acordados?: number;
  simulateMismatch?: boolean;
}): Record<string, string> => {
  const mismatchSuffix = simulateMismatch ? ' Holdings S.A.' : '';

  if (documentType.includes('Acta')) {
    return {
      razonSocial: `${empresa}${mismatchSuffix}`,
      representanteLegal: repLegalNombre ?? 'Representante Legal',
      fechaConstitucion: '2018-03-15',
    };
  }

  if (documentType.includes('LOI') || documentType.includes('intención')) {
    const loiM2 = simulateMismatch
      ? String((m2Acordados ?? 0) + 1500)
      : String(m2Acordados ?? 0);

    return {
      razonSocial: empresa,
      m2Acordados: loiM2,
      plazoMeses: '36',
    };
  }

  if (documentType.includes('INE')) {
    return {
      nombre: simulateMismatch ? 'Persona Distinta' : (repLegalNombre ?? ''),
      vigencia: '2028-12-31',
    };
  }

  if (documentType.includes('CSF') || documentType.includes('fiscal')) {
    return {
      rfc: simulateMismatch ? 'XXX010101XXX' : (rfc ?? ''),
      razonSocial: empresa,
    };
  }

  return {
    razonSocial: empresa,
    documento: documentType,
  };
};

const compareField = ({
  field,
  expected,
  found,
  severity = 'error',
}: {
  field: string;
  expected: string;
  found: string;
  severity?: 'error' | 'warning';
}) => {
  if (normalizeText(expected) === normalizeText(found)) {
    return null;
  }

  return { field, expected, found, severity };
};

const validateItem = ({
  documentType,
  fileName,
  extractedFields,
  expectedEmpresa,
  expectedRfc,
  expectedRepLegal,
  expectedM2,
}: {
  documentType: string;
  fileName?: string;
  extractedFields: Record<string, string>;
  expectedEmpresa: string;
  expectedRfc?: string;
  expectedRepLegal?: string;
  expectedM2?: number;
}): DocumentValidationItem => {
  const mismatches = [];

  if (extractedFields.razonSocial) {
    const mismatch = compareField({
      field: 'Razón social',
      expected: expectedEmpresa,
      found: extractedFields.razonSocial,
    });

    if (mismatch) {
      mismatches.push(mismatch);
    }
  }

  if (extractedFields.rfc && expectedRfc) {
    const mismatch = compareField({
      field: 'RFC',
      expected: expectedRfc,
      found: extractedFields.rfc,
    });

    if (mismatch) {
      mismatches.push(mismatch);
    }
  }

  if (extractedFields.nombre && expectedRepLegal) {
    const mismatch = compareField({
      field: 'Representante legal',
      expected: expectedRepLegal,
      found: extractedFields.nombre,
    });

    if (mismatch) {
      mismatches.push(mismatch);
    }
  }

  if (extractedFields.m2Acordados && expectedM2) {
    const mismatch = compareField({
      field: 'm² en LOI',
      expected: String(expectedM2),
      found: extractedFields.m2Acordados,
      severity: 'error',
    });

    if (mismatch) {
      mismatches.push(mismatch);
    }
  }

  const status: DocumentValidationItem['status'] = mismatches.some(
    (item) => item.severity === 'error',
  )
    ? 'error'
    : mismatches.length > 0
      ? 'warning'
      : 'ok';

  return {
    documentType,
    fileName,
    status,
    extractedFields,
    mismatches,
  };
};

const resolveOverallStatus = (
  items: DocumentValidationItem[],
): DocumentValidationResult['overallStatus'] => {
  if (items.some((item) => item.status === 'error')) {
    return 'red';
  }

  if (items.some((item) => item.status === 'warning')) {
    return 'yellow';
  }

  return 'green';
};

const runValidation = async ({
  casoLegalId,
  uploads = [],
}: {
  casoLegalId: string;
  uploads?: SimulatedDocumentUpload[];
}): Promise<DocumentValidationResult> => {
  const casoLegal = await twentyDataService.getCasoLegalById(casoLegalId);
  const empresa = casoLegal?.inquilino?.empresa ?? 'Empresa Demo';
  const rfc = casoLegal?.inquilino?.rfc;
  const repLegal = casoLegal?.inquilino?.repLegalNombre;
  const m2Acordados = casoLegal?.hojaDeAcuerdos?.m2Acordados;

  const defaultUploads: SimulatedDocumentUpload[] =
    uploads.length > 0
      ? uploads
      : [
          { documentType: 'Acta constitutiva' },
          { documentType: 'Carta de intención (LOI)' },
          { documentType: 'INE representante' },
          { documentType: 'CSF' },
        ];

  const items = defaultUploads.map((upload) => {
    const extractedFields = buildMockExtraction({
      documentType: upload.documentType,
      empresa,
      repLegalNombre: repLegal,
      rfc,
      m2Acordados,
      simulateMismatch: upload.simulateMismatch,
    });

    return validateItem({
      documentType: upload.documentType,
      fileName: upload.fileName,
      extractedFields,
      expectedEmpresa: empresa,
      expectedRfc: rfc,
      expectedRepLegal: repLegal,
      expectedM2: m2Acordados,
    });
  });

  const overallStatus = resolveOverallStatus(items);
  const errorCount = items.filter((item) => item.status === 'error').length;
  const warningCount = items.filter((item) => item.status === 'warning').length;

  const summary =
    errorCount > 0
      ? `Se detectaron ${errorCount} conflicto(s) documental(es) que deben resolverse antes de generar contrato.`
      : warningCount > 0
        ? `Validación con ${warningCount} advertencia(s). Revisar antes de enviar a legal.`
        : 'Documentación consistente con el expediente del caso legal.';

  if (casoLegal) {
    const semaforo =
      overallStatus === 'red'
        ? 'ROJO'
        : overallStatus === 'yellow'
          ? 'AMARILLO'
          : 'VERDE';

    await twentyDataService.updateCasoLegal(casoLegalId, { semaforo });
  }

  return {
    casoLegalId,
    overallStatus,
    items,
    summary,
    usedLlm: false,
    validatedAt: new Date().toISOString(),
  };
};

export const documentValidationService = {
  validate: runValidation,

  validateWithLlm: async (
    params: Parameters<typeof runValidation>[0],
  ): Promise<DocumentValidationResult> => {
    const baseResult = await runValidation(params);

    if (
      envConfig.openAiApiKey.trim().length === 0 ||
      envConfig.parksAiMock
    ) {
      return baseResult;
    }

    try {
      const response = await axios.post<{
        choices: { message: { content: string } }[];
      }>(
        'https://api.openai.com/v1/chat/completions',
        {
          model: envConfig.openAiModel,
          temperature: 0.1,
          messages: [
            {
              role: 'system',
              content:
                'Eres auditor documental legal en México. Resume en 2 oraciones el resultado de validación.',
            },
            {
              role: 'user',
              content: JSON.stringify(baseResult),
            },
          ],
        },
        {
          headers: {
            Authorization: `Bearer ${envConfig.openAiApiKey}`,
            'Content-Type': 'application/json',
          },
          timeout: 30000,
        },
      );

      const llmSummary = response.data.choices[0]?.message?.content;

      return {
        ...baseResult,
        summary: llmSummary ?? baseResult.summary,
        usedLlm: true,
      };
    } catch {
      return baseResult;
    }
  },
};
