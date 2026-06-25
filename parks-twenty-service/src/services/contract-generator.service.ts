import fs from 'fs';
import path from 'path';

import { contractDraftStore } from './contract-draft.store';
import { pdfService } from './pdf.service';
import { type ContractDraftRecord } from '../types/legal.types';
import { type PdfContext } from '../types/pdf.types';

const OUTPUT_DIR = path.join(process.cwd(), 'output/contracts');

const ensureOutputDirectory = (): void => {
  fs.mkdirSync(OUTPUT_DIR, { recursive: true });
};

const buildContextWithTipo = (
  context: PdfContext,
  tipoDocumento: string,
): PdfContext => ({
  ...context,
  casoLegal: {
    ...context.casoLegal,
    tipoDocumento,
  },
});

export const contractGeneratorService = {
  generateDraft: async ({
    casoLegalId,
    tipoDocumento,
  }: {
    casoLegalId: string;
    tipoDocumento: string;
  }): Promise<ContractDraftRecord | null> => {
    const context = await pdfService.buildPDFContext(casoLegalId);

    if (!context) {
      return null;
    }

    const typedContext = buildContextWithTipo(context, tipoDocumento);
    const html = pdfService.renderHtml(typedContext);

    return contractDraftStore.save({
      casoLegalId,
      tipoDocumento,
      html,
    });
  },

  getDraft: (casoLegalId: string): ContractDraftRecord | null =>
    contractDraftStore.get(casoLegalId),

  updateDraftHtml: (
    casoLegalId: string,
    html: string,
  ): ContractDraftRecord | null => contractDraftStore.updateHtml(casoLegalId, html),

  generatePdfFromDraft: async (
    casoLegalId: string,
  ): Promise<{ pdfPath: string } | null> => {
    const draft = contractDraftStore.get(casoLegalId);

    if (!draft) {
      return null;
    }

    ensureOutputDirectory();

    const fileName = `${casoLegalId}_v${draft.version}_${Date.now()}.pdf`;
    const outputPath = path.join(OUTPUT_DIR, fileName);

    const pdfBuffer = await pdfService.generateContratoFromHtml(draft.html);

    fs.writeFileSync(outputPath, pdfBuffer);
    contractDraftStore.setPdfPath(casoLegalId, outputPath);

    return { pdfPath: outputPath };
  },
};
