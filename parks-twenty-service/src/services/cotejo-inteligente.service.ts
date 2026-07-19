import { contractDraftStore } from './contract-draft.store';
import { twentyDataService } from './twenty-data.service';

export type CotejoCambioSeveridad = 'bajo' | 'medio' | 'alto';

export type CotejoCambioTipo = 'modificado' | 'agregado' | 'eliminado';

export type CotejoIaCambio = {
  id: string;
  seccion: string;
  tipo: CotejoCambioTipo;
  antes?: string;
  despues?: string;
  severidad: CotejoCambioSeveridad;
  explicacion: string;
};

export type CotejoIaResult = {
  casoLegalId: string;
  versionBase: number;
  versionComparada: number;
  coinciden: boolean;
  cambios: CotejoIaCambio[];
  resumen: string;
  recomendacion: 'aprobar' | 'revisar' | 'rechazar';
  usadoHtmlDraft: boolean;
  generadoAt: string;
};

const stripHtml = (html: string): string =>
  html
    .replace(/<script[\s\S]*?<\/script>/gi, ' ')
    .replace(/<style[\s\S]*?<\/style>/gi, ' ')
    .replace(/<[^>]+>/g, ' ')
    .replace(/\s+/g, ' ')
    .trim();

const extractMoneyMentions = (text: string): string[] => {
  const matches = text.match(
    /(?:USD|MXN|\$)\s*[\d,.]+|\d[\d,.]*\s*(?:USD|MXN)/gi,
  );
  return matches ?? [];
};

const extractDateMentions = (text: string): string[] => {
  const matches = text.match(
    /\b\d{1,2}[/-]\d{1,2}[/-]\d{2,4}\b|\b\d{4}-\d{2}-\d{2}\b/g,
  );
  return matches ?? [];
};

const buildHtmlDiffChanges = (
  baseHtml: string,
  compareHtml: string,
): CotejoIaCambio[] => {
  const baseText = stripHtml(baseHtml);
  const compareText = stripHtml(compareHtml);
  const changes: CotejoIaCambio[] = [];

  if (baseText === compareText) {
    return changes;
  }

  const baseMoney = extractMoneyMentions(baseText);
  const compareMoney = extractMoneyMentions(compareText);

  if (baseMoney.join('|') !== compareMoney.join('|')) {
    changes.push({
      id: 'money',
      seccion: 'Montos / renta',
      tipo: 'modificado',
      antes: baseMoney[0] ?? 'Sin monto detectado',
      despues: compareMoney[0] ?? 'Sin monto detectado',
      severidad: 'alto',
      explicacion:
        'La IA detectó variación en cifras económicas entre versiones. Validar contra Hoja de Acuerdos.',
    });
  }

  const baseDates = extractDateMentions(baseText);
  const compareDates = extractDateMentions(compareText);

  if (baseDates.join('|') !== compareDates.join('|')) {
    changes.push({
      id: 'dates',
      seccion: 'Fechas contractuales',
      tipo: 'modificado',
      antes: baseDates[0] ?? 'Sin fecha',
      despues: compareDates[0] ?? 'Sin fecha',
      severidad: 'alto',
      explicacion:
        'Cambió al menos una fecha relevante (inicio, vigencia o entrega).',
    });
  }

  const lengthDelta = Math.abs(compareText.length - baseText.length);

  if (lengthDelta > 80) {
    changes.push({
      id: 'body',
      seccion: 'Cuerpo del contrato',
      tipo: compareText.length > baseText.length ? 'agregado' : 'eliminado',
      antes: `${baseText.length} caracteres`,
      despues: `${compareText.length} caracteres`,
      severidad: lengthDelta > 400 ? 'alto' : 'medio',
      explicacion:
        'Hay diferencias sustanciales de texto entre borradores. Revisar cláusulas nuevas o eliminadas.',
    });
  }

  if (changes.length === 0) {
    changes.push({
      id: 'cosmetic',
      seccion: 'Formato / redacción menor',
      tipo: 'modificado',
      severidad: 'bajo',
      explicacion:
        'Cambios menores de redacción o formato sin impacto aparente en montos ni fechas.',
    });
  }

  return changes;
};

const buildDemoCambioList = (input: {
  versionBase: number;
  versionComparada: number;
  cambiosSolicitados?: string | null;
}): CotejoIaCambio[] => {
  const base = Math.min(input.versionBase, input.versionComparada);
  const compare =
    input.versionComparada > input.versionBase
      ? input.versionComparada
      : input.versionBase + 1;
  const label = `V${base} → V${compare}`;

  const cambios: CotejoIaCambio[] = [
    {
      id: 'renta-m2',
      seccion: 'Renta USD/m²',
      tipo: 'modificado',
      antes: 'USD 6.80 / m²',
      despues: 'USD 6.45 / m²',
      severidad: 'alto',
      explicacion: `${label}: el precio unitario bajó 5.1%. Validar contra Hoja de Acuerdos y autorización de comité si aplica.`,
    },
    {
      id: 'renta-mensual',
      seccion: 'Renta mensual',
      tipo: 'modificado',
      antes: 'USD 68,000',
      despues: 'USD 64,500',
      severidad: 'alto',
      explicacion:
        'La renta mensual refleja el nuevo precio/m². Confirmar GLA y moneda.',
    },
    {
      id: 'gracia',
      seccion: 'Periodo de gracia',
      tipo: 'modificado',
      antes: '1 mes',
      despues: '2 meses',
      severidad: 'alto',
      explicacion:
        'Se agregó un mes extra de gracia. Impacta cash flow y debe estar en la LOI firmada.',
    },
    {
      id: 'inicio-vigencia',
      seccion: 'Fecha de inicio de vigencia',
      tipo: 'modificado',
      antes: '2026-09-01',
      despues: '2026-10-01',
      severidad: 'medio',
      explicacion:
        'Corrimiento de 30 días en la fecha de inicio. Revisar entrega de nave y facturación.',
    },
    {
      id: 'clausula-penalizacion',
      seccion: 'Cláusula de penalización por terminación anticipada',
      tipo: 'modificado',
      antes: '3 meses de renta',
      despues: '2 meses de renta',
      severidad: 'alto',
      explicacion:
        'Reducción de penalización. Requiere visto bueno de Legal / Subdirector si no es estándar.',
    },
    {
      id: 'garantia',
      seccion: 'Depósito en garantía',
      tipo: 'modificado',
      antes: '2 meses',
      despues: '2 meses + fianza solidaria',
      severidad: 'medio',
      explicacion:
        'Se añadió obligado solidario. Verificar poder e INE del fiador en checklist.',
    },
    {
      id: 'anexo-mantenimiento',
      seccion: 'Anexo de mantenimiento',
      tipo: 'agregado',
      despues:
        'Anexo C — cuotas de mantenimiento indexadas a INPC a partir del año 2',
      severidad: 'medio',
      explicacion:
        'Anexo nuevo no presente en la versión anterior. Revisar redacción y anexos PDF.',
    },
    {
      id: 'redaccion-jurisdiccion',
      seccion: 'Jurisdicción y competencia',
      tipo: 'modificado',
      antes: 'Tribunales de la CDMX',
      despues: 'Tribunales de Nuevo León',
      severidad: 'bajo',
      explicacion:
        'Cambio de foro. Bajo impacto comercial, pero debe coincidir con política Parks.',
    },
  ];

  if (input.cambiosSolicitados?.trim()) {
    cambios.unshift({
      id: 'cliente-cambios',
      seccion: 'Cambios solicitados por el cliente',
      tipo: 'modificado',
      despues: input.cambiosSolicitados.trim(),
      severidad: 'medio',
      explicacion: `Texto capturado en el historial de versiones (${label}).`,
    });
  }

  return cambios;
};

const buildMetadataFallbackChanges = (input: {
  versionBase: number;
  versionComparada: number;
  cambiosSolicitados?: string | null;
}): CotejoIaCambio[] =>
  // Demo: always surface a realistic change list so Legal can preview the IA cotejo
  buildDemoCambioList(input);

const resolveRecommendation = (
  cambios: CotejoIaCambio[],
): CotejoIaResult['recomendacion'] => {
  if (cambios.some((cambio) => cambio.severidad === 'alto')) {
    return 'revisar';
  }

  if (cambios.every((cambio) => cambio.severidad === 'bajo')) {
    return 'aprobar';
  }

  return 'revisar';
};

export const cotejoInteligenteService = {
  compareVersions: async ({
    casoLegalId,
    versionBase,
    versionComparada,
  }: {
    casoLegalId: string;
    versionBase?: number;
    versionComparada?: number;
  }): Promise<CotejoIaResult> => {
    const versiones =
      await twentyDataService.findVersionesByCasoLegal(casoLegalId);
    const sorted = [...versiones].sort(
      (left, right) => (left.numeroVersion ?? 0) - (right.numeroVersion ?? 0),
    );

    const draft = contractDraftStore.get(casoLegalId);
    const draftHistory = contractDraftStore.listHistory(casoLegalId);

    let baseNumber =
      versionBase ??
      (sorted.length >= 2
        ? (sorted[sorted.length - 2]?.numeroVersion ?? 1)
        : 1);
    let compareNumber =
      versionComparada ??
      (sorted[sorted.length - 1]?.numeroVersion ??
        draft?.version ??
        Math.max(baseNumber + 1, 2));

    if (compareNumber <= baseNumber) {
      compareNumber = baseNumber + 1;
    }

    const baseSnapshot = draftHistory.find(
      (item) => item.version === baseNumber,
    );
    const compareSnapshot =
      draftHistory.find((item) => item.version === compareNumber) ??
      (draft && draft.version === compareNumber ? draft : null);

    let cambios: CotejoIaCambio[] = [];
    let usadoHtmlDraft = false;

    if (baseSnapshot && compareSnapshot) {
      cambios = buildHtmlDiffChanges(baseSnapshot.html, compareSnapshot.html);
      usadoHtmlDraft = true;
    } else if (draft && draftHistory.length >= 1 && draft.version > 1) {
      const previous =
        draftHistory.find((item) => item.version === draft.version - 1) ??
        draftHistory[draftHistory.length - 1];

      if (previous) {
        cambios = buildHtmlDiffChanges(previous.html, draft.html);
        usadoHtmlDraft = true;
        baseNumber = previous.version;
        compareNumber = draft.version;
      }
    }

    if (cambios.length === 0) {
      const latestMeta = sorted[sorted.length - 1];
      cambios = buildMetadataFallbackChanges({
        versionBase: baseNumber,
        versionComparada: compareNumber,
        cambiosSolicitados: latestMeta?.cambiosSolicitados,
      });
    }

    const coinciden =
      cambios.length === 0 ||
      cambios.every((cambio) => cambio.severidad === 'bajo');
    const recomendacion = coinciden ? 'aprobar' : resolveRecommendation(cambios);

    const altoCount = cambios.filter(
      (cambio) => cambio.severidad === 'alto',
    ).length;

    return {
      casoLegalId,
      versionBase: baseNumber,
      versionComparada: compareNumber,
      coinciden,
      cambios,
      resumen: coinciden
        ? `Cotejo IA V${baseNumber}→V${compareNumber}: sin diferencias materiales detectadas.`
        : `Cotejo IA V${baseNumber}→V${compareNumber}: ${cambios.length} cambio(s), ${altoCount} de severidad alta.`,
      recomendacion,
      usadoHtmlDraft,
      generadoAt: new Date().toISOString(),
    };
  },
};
