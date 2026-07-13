import { Router } from 'express';
import fs from 'fs';

import { actaRestitucionService } from '../services/acta-restitucion.service';
import { contractGeneratorService } from '../services/contract-generator.service';
import { documentExtractionService } from '../services/document-extraction.service';
import { documentValidationService } from '../services/document-validation.service';
import { holdoverCondonacionService } from '../services/holdover-condonacion.service';
import { legalDashboardService } from '../services/legal-dashboard.service';
import { legalHandoffService } from '../services/legal-handoff.service';
import { legalMetricsService } from '../services/legal-metrics.service';
import { legalReportService } from '../services/legal-report.service';
import { legalWorkloadService } from '../services/legal-workload.service';
import { legalWorkflowService } from '../services/legal-workflow.service';
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

legalRouter.post('/extract-document', async (request, response) => {
  try {
    const body = request.body as {
      casoLegalId?: string;
      documentType?: string;
      fileName?: string;
    };

    if (!body.casoLegalId || !body.documentType) {
      response.status(400).json({
        error: 'casoLegalId and documentType are required',
      });
      return;
    }

    const result = await documentExtractionService.extract({
      casoLegalId: body.casoLegalId,
      documentType: body.documentType,
      fileName: body.fileName,
    });

    response.json(result);
  } catch (error) {
    const message = error instanceof Error ? error.message : 'Unknown error';
    response.status(500).json({ error: message });
  }
});

legalRouter.post('/apply-extraction', async (request, response) => {
  try {
    const body = request.body as {
      casoLegalId?: string;
      extractedFields?: Record<string, string>;
    };

    if (!body.casoLegalId || !body.extractedFields) {
      response.status(400).json({
        error: 'casoLegalId and extractedFields are required',
      });
      return;
    }

    const result = await documentExtractionService.applyToExpediente({
      casoLegalId: body.casoLegalId,
      extractedFields: body.extractedFields,
    });

    response.json(result);
  } catch (error) {
    const message = error instanceof Error ? error.message : 'Unknown error';
    response.status(400).json({ error: message });
  }
});

legalRouter.get('/workflow/:casoLegalId', async (request, response) => {
  try {
    const workflow = await legalWorkflowService.getWorkflow(
      request.params.casoLegalId,
    );

    if (!workflow) {
      response.status(404).json({ error: 'Caso legal not found' });
      return;
    }

    response.json(workflow);
  } catch (error) {
    const message = error instanceof Error ? error.message : 'Unknown error';
    response.status(500).json({ error: message });
  }
});

legalRouter.post(
  '/workflow/:casoLegalId/assign-lawyer',
  async (request, response) => {
    try {
      const body = request.body as { abogadoAsignado?: string };

      if (!body.abogadoAsignado) {
        response.status(400).json({ error: 'abogadoAsignado is required' });
        return;
      }

      const casoLegal = await legalWorkflowService.assignLawyer(
        request.params.casoLegalId,
        body.abogadoAsignado,
      );

      response.json({ casoLegal });
    } catch (error) {
      const message = error instanceof Error ? error.message : 'Unknown error';
      response.status(500).json({ error: message });
    }
  },
);

legalRouter.post(
  '/workflow/:casoLegalId/ensure-checklist',
  async (request, response) => {
    try {
      await legalWorkflowService.ensureChecklist(request.params.casoLegalId);
      const workflow = await legalWorkflowService.getWorkflow(
        request.params.casoLegalId,
      );
      response.json(workflow);
    } catch (error) {
      const message = error instanceof Error ? error.message : 'Unknown error';
      response.status(500).json({ error: message });
    }
  },
);

legalRouter.patch('/checklist/:documentoChecklistId', async (request, response) => {
  try {
    const body = request.body as {
      casoLegalId?: string;
      entregado?: boolean;
    };

    if (!body.casoLegalId || body.entregado === undefined) {
      response
        .status(400)
        .json({ error: 'casoLegalId and entregado are required' });
      return;
    }

    const result = await legalWorkflowService.updateChecklistItem({
      casoLegalId: body.casoLegalId,
      documentoChecklistId: request.params.documentoChecklistId,
      entregado: body.entregado,
    });

    response.json(result);
  } catch (error) {
    const message = error instanceof Error ? error.message : 'Unknown error';
    response.status(500).json({ error: message });
  }
});

legalRouter.post(
  '/workflow/:casoLegalId/advance-estatus',
  async (request, response) => {
    try {
      const body = request.body as { estatus?: string };

      if (!body.estatus) {
        response.status(400).json({ error: 'estatus is required' });
        return;
      }

      const casoLegal = await legalWorkflowService.advanceEstatus(
        request.params.casoLegalId,
        body.estatus,
      );

      response.json({ casoLegal });
    } catch (error) {
      const message = error instanceof Error ? error.message : 'Unknown error';
      response.status(500).json({ error: message });
    }
  },
);

legalRouter.post('/workflow/:casoLegalId/versions', async (request, response) => {
  try {
    const body = request.body as {
      enviadoPor?: string;
      dirigidoA?: string;
      respuestaCliente?: string;
      cambiosSolicitados?: string;
      esVersionFinal?: boolean;
    };

    if (!body.enviadoPor || !body.dirigidoA) {
      response
        .status(400)
        .json({ error: 'enviadoPor and dirigidoA are required' });
      return;
    }

    const version = await legalWorkflowService.createVersion({
      casoLegalId: request.params.casoLegalId,
      enviadoPor: body.enviadoPor,
      dirigidoA: body.dirigidoA,
      respuestaCliente: body.respuestaCliente,
      cambiosSolicitados: body.cambiosSolicitados,
      esVersionFinal: body.esVersionFinal,
    });

    response.json({ version });
  } catch (error) {
    const message = error instanceof Error ? error.message : 'Unknown error';
    response.status(500).json({ error: message });
  }
});

legalRouter.patch('/versions/:versionDocumentoId', async (request, response) => {
  try {
    const body = request.body as {
      casoLegalId?: string;
      respuestaCliente?: string;
      cambiosSolicitados?: string;
      esVersionFinal?: boolean;
    };

    if (!body.casoLegalId || !body.respuestaCliente) {
      response.status(400).json({
        error: 'casoLegalId and respuestaCliente are required',
      });
      return;
    }

    await legalWorkflowService.updateVersionResponse({
      versionDocumentoId: request.params.versionDocumentoId,
      casoLegalId: body.casoLegalId,
      respuestaCliente: body.respuestaCliente,
      cambiosSolicitados: body.cambiosSolicitados,
      esVersionFinal: body.esVersionFinal,
    });

    const workflow = await legalWorkflowService.getWorkflow(body.casoLegalId);
    response.json(workflow);
  } catch (error) {
    const message = error instanceof Error ? error.message : 'Unknown error';
    response.status(500).json({ error: message });
  }
});

legalRouter.post('/firmas/:flujoFirmasId/sign', async (request, response) => {
  try {
    const body = request.body as { casoLegalId?: string; fechaFirma?: string };

    if (!body.casoLegalId) {
      response.status(400).json({ error: 'casoLegalId is required' });
      return;
    }

    await legalWorkflowService.markSignatureSigned({
      casoLegalId: body.casoLegalId,
      flujoFirmasId: request.params.flujoFirmasId,
      fechaFirma: body.fechaFirma,
    });

    const workflow = await legalWorkflowService.getWorkflow(body.casoLegalId);
    response.json(workflow);
  } catch (error) {
    const message = error instanceof Error ? error.message : 'Unknown error';
    response.status(500).json({ error: message });
  }
});

legalRouter.get('/dashboard', async (request, response) => {
  try {
    const filters = {
      abogadoAsignado: request.query.abogadoAsignado as string | undefined,
      tipoDocumento: request.query.tipoDocumento as string | undefined,
      parque: request.query.parque as string | undefined,
      slaVencido: request.query.slaVencido === 'true',
    };
    const dashboard = await legalDashboardService.getDashboard(filters);
    response.json(dashboard);
  } catch (error) {
    const message = error instanceof Error ? error.message : 'Unknown error';
    response.status(500).json({ error: message });
  }
});

legalRouter.get('/workload', async (_request, response) => {
  try {
    const workload = await legalWorkloadService.getWorkload();
    response.json({ workload });
  } catch (error) {
    const message = error instanceof Error ? error.message : 'Unknown error';
    response.status(500).json({ error: message });
  }
});

legalRouter.get('/metrics', async (_request, response) => {
  try {
    const metrics = await legalMetricsService.getTeamMetrics();
    response.json({ metrics });
  } catch (error) {
    const message = error instanceof Error ? error.message : 'Unknown error';
    response.status(500).json({ error: message });
  }
});

legalRouter.get('/report/quincenal', async (_request, response) => {
  try {
    const report = await legalReportService.generateQuincenalReport();
    response.json(report);
  } catch (error) {
    const message = error instanceof Error ? error.message : 'Unknown error';
    response.status(500).json({ error: message });
  }
});

legalRouter.post('/workflow/:casoLegalId/pause-sla', async (request, response) => {
  try {
    const body = request.body as { motivoPausa?: string };

    if (!body.motivoPausa) {
      response.status(400).json({ error: 'motivoPausa is required' });
      return;
    }

    await legalWorkflowService.pauseSla({
      casoLegalId: request.params.casoLegalId,
      motivoPausa: body.motivoPausa,
    });

    const workflow = await legalWorkflowService.getWorkflow(
      request.params.casoLegalId,
    );
    response.json(workflow);
  } catch (error) {
    const message = error instanceof Error ? error.message : 'Unknown error';
    response.status(500).json({ error: message });
  }
});

legalRouter.post(
  '/workflow/:casoLegalId/resume-sla',
  async (request, response) => {
    try {
      await legalWorkflowService.resumeSla(request.params.casoLegalId);
      const workflow = await legalWorkflowService.getWorkflow(
        request.params.casoLegalId,
      );
      response.json(workflow);
    } catch (error) {
      const message = error instanceof Error ? error.message : 'Unknown error';
      response.status(500).json({ error: message });
    }
  },
);

legalRouter.post('/workflow/:casoLegalId/nda-signed', async (request, response) => {
  try {
    await legalWorkflowService.registerNdaSigned(request.params.casoLegalId);
    const workflow = await legalWorkflowService.getWorkflow(
      request.params.casoLegalId,
    );
    response.json(workflow);
  } catch (error) {
    const message = error instanceof Error ? error.message : 'Unknown error';
    response.status(500).json({ error: message });
  }
});

legalRouter.get(
  '/workflow/:casoLegalId/client-history',
  async (request, response) => {
    try {
      const history = await legalWorkflowService.getClientHistory(
        request.params.casoLegalId,
      );
      response.json({ history });
    } catch (error) {
      const message = error instanceof Error ? error.message : 'Unknown error';
      response.status(500).json({ error: message });
    }
  },
);

legalRouter.post('/workflow/:casoLegalId/cotejo', async (request, response) => {
  try {
    const body = request.body as {
      aprobado?: boolean;
      discrepancia?: string;
      realizadoPor?: string;
    };

    if (body.aprobado === undefined) {
      response.status(400).json({ error: 'aprobado is required' });
      return;
    }

    await legalWorkflowService.registerCotejo({
      casoLegalId: request.params.casoLegalId,
      aprobado: body.aprobado,
      discrepancia: body.discrepancia,
      realizadoPor: body.realizadoPor,
    });

    const workflow = await legalWorkflowService.getWorkflow(
      request.params.casoLegalId,
    );

    response.json(workflow);
  } catch (error) {
    const message = error instanceof Error ? error.message : 'Unknown error';
    response.status(500).json({ error: message });
  }
});

legalRouter.post('/acta-restitucion', async (request, response) => {
  try {
    const body = request.body as {
      casoLegalId?: string;
      inquilinoId?: string;
      naveId?: string;
      fechaSalidaCliente?: string;
      estadoNave?: string;
      decisionDeposito?: string;
      montoDepositoOriginal?: number;
      porcentajeDevolucion?: number;
      descripcionDesperfectos?: string;
      justificacionRetencion?: string;
    };

    if (
      !body.casoLegalId ||
      !body.inquilinoId ||
      !body.naveId ||
      !body.fechaSalidaCliente ||
      !body.estadoNave ||
      !body.decisionDeposito ||
      body.montoDepositoOriginal === undefined
    ) {
      response.status(400).json({ error: 'Missing required acta fields' });
      return;
    }

    const acta = await actaRestitucionService.create({
      casoLegalId: body.casoLegalId,
      inquilinoId: body.inquilinoId,
      naveId: body.naveId,
      fechaSalidaCliente: body.fechaSalidaCliente,
      estadoNave: body.estadoNave,
      decisionDeposito: body.decisionDeposito,
      montoDepositoOriginal: body.montoDepositoOriginal,
      porcentajeDevolucion: body.porcentajeDevolucion,
      descripcionDesperfectos: body.descripcionDesperfectos,
      justificacionRetencion: body.justificacionRetencion,
    });

    response.json({ acta });
  } catch (error) {
    const message = error instanceof Error ? error.message : 'Unknown error';
    response.status(500).json({ error: message });
  }
});

legalRouter.post(
  '/acta-restitucion/:actaRestitucionId/approve-comercial',
  async (request, response) => {
    try {
      const body = request.body as { aprobadoPor?: string };

      if (!body.aprobadoPor) {
        response.status(400).json({ error: 'aprobadoPor is required' });
        return;
      }

      await actaRestitucionService.approveComercial({
        actaRestitucionId: request.params.actaRestitucionId,
        aprobadoPor: body.aprobadoPor,
      });

      response.json({ success: true });
    } catch (error) {
      const message = error instanceof Error ? error.message : 'Unknown error';
      response.status(500).json({ error: message });
    }
  },
);

legalRouter.post(
  '/acta-restitucion/:actaRestitucionId/finalize',
  async (request, response) => {
    try {
      const body = request.body as { naveId?: string; montoADevolver?: number };

      if (!body.naveId || body.montoADevolver === undefined) {
        response.status(400).json({ error: 'naveId and montoADevolver required' });
        return;
      }

      await actaRestitucionService.finalize({
        actaRestitucionId: request.params.actaRestitucionId,
        naveId: body.naveId,
        montoADevolver: body.montoADevolver,
      });

      response.json({ success: true });
    } catch (error) {
      const message = error instanceof Error ? error.message : 'Unknown error';
      response.status(500).json({ error: message });
    }
  },
);

legalRouter.get(
  '/acta-restitucion/caso/:casoLegalId',
  async (request, response) => {
    try {
      const actas = await actaRestitucionService.findByCasoLegal(
        request.params.casoLegalId,
      );
      response.json({ actas });
    } catch (error) {
      const message = error instanceof Error ? error.message : 'Unknown error';
      response.status(500).json({ error: message });
    }
  },
);

legalRouter.post('/holdover/:holdoverId/condonacion', async (request, response) => {
  try {
    const body = request.body as { motivo?: string; montoSolicitado?: number };

    if (!body.motivo || body.montoSolicitado === undefined) {
      response.status(400).json({ error: 'motivo and montoSolicitado required' });
      return;
    }

    await holdoverCondonacionService.requestCondonacion({
      holdoverId: request.params.holdoverId,
      motivo: body.motivo,
      montoSolicitado: body.montoSolicitado,
    });

    response.json({ success: true });
  } catch (error) {
    const message = error instanceof Error ? error.message : 'Unknown error';
    response.status(500).json({ error: message });
  }
});

legalRouter.post(
  '/holdover/:holdoverId/condonacion/resolve',
  async (request, response) => {
    try {
      const body = request.body as {
        aprobada?: boolean;
        aprobadoPor?: string;
        comentario?: string;
      };

      if (body.aprobada === undefined || !body.aprobadoPor) {
        response
          .status(400)
          .json({ error: 'aprobada and aprobadoPor are required' });
        return;
      }

      await holdoverCondonacionService.resolveCondonacion({
        holdoverId: request.params.holdoverId,
        aprobada: body.aprobada,
        aprobadoPor: body.aprobadoPor,
        comentario: body.comentario,
      });

      response.json({ success: true });
    } catch (error) {
      const message = error instanceof Error ? error.message : 'Unknown error';
      response.status(500).json({ error: message });
    }
  },
);

legalRouter.get('/holdover/condonaciones-pendientes', async (_request, response) => {
  try {
    const pending = await holdoverCondonacionService.listPendingCondonaciones();
    response.json({ pending });
  } catch (error) {
    const message = error instanceof Error ? error.message : 'Unknown error';
    response.status(500).json({ error: message });
  }
});
