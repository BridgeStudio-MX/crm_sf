import { Router } from 'express';
import fs from 'fs';

import { contractGeneratorService } from '../services/contract-generator.service';
import { documentValidationService } from '../services/document-validation.service';
import { legalHandoffService } from '../services/legal-handoff.service';
import {
  PARKS_CONTRACT_TYPE_OPTIONS,
  type SimulatedDocumentUpload,
} from '../types/legal.types';

export const legalRouter = Router();

legalRouter.get('/contract-types', (_request, response) => {
  response.json({ types: PARKS_CONTRACT_TYPE_OPTIONS });
});

legalRouter.post('/validate-documents', async (request, response) => {
  try {
    const body = request.body as {
      casoLegalId?: string;
      uploads?: SimulatedDocumentUpload[];
      useLlm?: boolean;
    };

    if (!body.casoLegalId) {
      response.status(400).json({ error: 'casoLegalId is required' });
      return;
    }

    const result = body.useLlm
      ? await documentValidationService.validateWithLlm({
          casoLegalId: body.casoLegalId,
          uploads: body.uploads,
        })
      : await documentValidationService.validate({
          casoLegalId: body.casoLegalId,
          uploads: body.uploads,
        });

    response.json(result);
  } catch (error) {
    const message = error instanceof Error ? error.message : 'Unknown error';
    response.status(500).json({ error: message });
  }
});

legalRouter.post('/generate-contract', async (request, response) => {
  try {
    const body = request.body as {
      casoLegalId?: string;
      tipoDocumento?: string;
    };

    if (!body.casoLegalId || !body.tipoDocumento) {
      response
        .status(400)
        .json({ error: 'casoLegalId and tipoDocumento are required' });
      return;
    }

    const draft = await contractGeneratorService.generateDraft({
      casoLegalId: body.casoLegalId,
      tipoDocumento: body.tipoDocumento,
    });

    if (!draft) {
      response.status(404).json({
        error: 'No se pudo generar borrador — verifica relaciones del caso',
      });
      return;
    }

    response.json(draft);
  } catch (error) {
    const message = error instanceof Error ? error.message : 'Unknown error';
    response.status(500).json({ error: message });
  }
});

legalRouter.get('/contract-draft/:casoLegalId', (request, response) => {
  const draft = contractGeneratorService.getDraft(request.params.casoLegalId);

  if (!draft) {
    response.status(404).json({ error: 'Draft not found' });
    return;
  }

  response.json(draft);
});

legalRouter.put('/contract-draft/:casoLegalId', (request, response) => {
  const body = request.body as { html?: string };

  if (!body.html) {
    response.status(400).json({ error: 'html is required' });
    return;
  }

  const draft = contractGeneratorService.updateDraftHtml(
    request.params.casoLegalId,
    body.html,
  );

  if (!draft) {
    response.status(404).json({ error: 'Draft not found' });
    return;
  }

  response.json(draft);
});

legalRouter.post(
  '/contract-draft/:casoLegalId/pdf',
  async (request, response) => {
    try {
      const result = await contractGeneratorService.generatePdfFromDraft(
        request.params.casoLegalId,
      );

      if (!result) {
        response.status(404).json({ error: 'Draft not found' });
        return;
      }

      response.json(result);
    } catch (error) {
      const message = error instanceof Error ? error.message : 'Unknown error';
      response.status(500).json({ error: message });
    }
  },
);

legalRouter.get(
  '/contract-draft/:casoLegalId/download',
  (request, response) => {
    const draft = contractGeneratorService.getDraft(request.params.casoLegalId);

    if (!draft?.pdfPath || !fs.existsSync(draft.pdfPath)) {
      response.status(404).json({ error: 'PDF not generated yet' });
      return;
    }

    response.download(draft.pdfPath);
  },
);

legalRouter.post('/pre-send-legal', async (request, response) => {
  try {
    const body = request.body as { casoLegalId?: string };

    if (!body.casoLegalId) {
      response.status(400).json({ error: 'casoLegalId is required' });
      return;
    }

    const result = await legalHandoffService.preSendToLegal(body.casoLegalId);
    response.json(result);
  } catch (error) {
    const message = error instanceof Error ? error.message : 'Unknown error';
    response.status(500).json({ error: message });
  }
});
