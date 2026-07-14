import { Router } from 'express';

import { valorAgregadoService } from '../services/valor-agregado.service';
import {
  type OfertaRenovacionEstatus,
  type OfertaRenovacionIncentivo,
} from '../types/valor-agregado.types';

export const valorAgregadoRouter = Router();

valorAgregadoRouter.get('/dashboard', (_request, response) => {
  response.json(valorAgregadoService.getDashboard());
});

valorAgregadoRouter.get(
  '/checklist/:casoLegalId/vigencia',
  async (request, response) => {
    try {
      const resumen = await valorAgregadoService.evaluateChecklistVigencia(
        request.params.casoLegalId,
      );
      response.json(resumen);
    } catch (error) {
      const message = error instanceof Error ? error.message : 'Unknown error';
      response.status(404).json({ error: message });
    }
  },
);

valorAgregadoRouter.patch(
  '/checklist/:casoLegalId/documentos/:documentoChecklistId/vencimiento',
  async (request, response) => {
    try {
      const body = request.body as { fechaVencimiento?: string };

      if (!body.fechaVencimiento) {
        response.status(400).json({ error: 'fechaVencimiento is required' });
        return;
      }

      const resumen = await valorAgregadoService.setDocumentoVencimiento({
        casoLegalId: request.params.casoLegalId,
        documentoChecklistId: request.params.documentoChecklistId,
        fechaVencimiento: body.fechaVencimiento,
      });
      response.json(resumen);
    } catch (error) {
      const message = error instanceof Error ? error.message : 'Unknown error';
      response.status(400).json({ error: message });
    }
  },
);

valorAgregadoRouter.post(
  '/checklist/:casoLegalId/assert-vigente',
  async (request, response) => {
    try {
      await valorAgregadoService.assertChecklistVigenteOrThrow(
        request.params.casoLegalId,
      );
      response.json({ ok: true });
    } catch (error) {
      const message = error instanceof Error ? error.message : 'Unknown error';
      response.status(400).json({ error: message, ok: false });
    }
  },
);

valorAgregadoRouter.post('/match-auto', async (request, response) => {
  try {
    const body = request.body as {
      opportunityId?: string;
      opportunityName?: string;
      m2Requeridos?: number;
      ubicacionDeseada?: string;
      presupuestoMensualUsd?: number;
      leasingOfficerNombre?: string;
    };

    if (!body.opportunityId) {
      response.status(400).json({ error: 'opportunityId is required' });
      return;
    }

    const result = await valorAgregadoService.generateMatchForOpportunity({
      opportunityId: body.opportunityId,
      opportunityName: body.opportunityName,
      m2Requeridos: body.m2Requeridos,
      ubicacionDeseada: body.ubicacionDeseada,
      presupuestoMensualUsd: body.presupuestoMensualUsd,
      leasingOfficerNombre: body.leasingOfficerNombre,
    });
    response.status(201).json(result);
  } catch (error) {
    const message = error instanceof Error ? error.message : 'Unknown error';
    response.status(400).json({ error: message });
  }
});

valorAgregadoRouter.post('/ofertas', (request, response) => {
  try {
    const body = request.body as {
      casoLegalId?: string;
      empresa?: string;
      loNombre?: string;
      tipoIncentivo?: OfertaRenovacionIncentivo;
      diasGraciaAdicionales?: number;
      descuentoPorcentaje?: number;
      descripcionMejoras?: string;
      observaciones?: string;
      fechaVencimientoOferta?: string;
    };

    if (!body.casoLegalId || !body.empresa || !body.tipoIncentivo) {
      response.status(400).json({
        error: 'casoLegalId, empresa and tipoIncentivo are required',
      });
      return;
    }

    const oferta = valorAgregadoService.createOferta({
      casoLegalId: body.casoLegalId,
      empresa: body.empresa,
      loNombre: body.loNombre ?? 'Leasing Officer',
      tipoIncentivo: body.tipoIncentivo,
      diasGraciaAdicionales: body.diasGraciaAdicionales,
      descuentoPorcentaje: body.descuentoPorcentaje,
      descripcionMejoras: body.descripcionMejoras,
      observaciones: body.observaciones,
      fechaVencimientoOferta: body.fechaVencimientoOferta,
    });

    response.status(201).json(oferta);
  } catch (error) {
    const message = error instanceof Error ? error.message : 'Unknown error';
    response.status(400).json({ error: message });
  }
});

valorAgregadoRouter.patch('/ofertas/:ofertaId/estatus', async (request, response) => {
  try {
    const body = request.body as { estatus?: OfertaRenovacionEstatus };

    if (!body.estatus) {
      response.status(400).json({ error: 'estatus is required' });
      return;
    }

    const oferta = await valorAgregadoService.updateOfertaEstatus({
      ofertaId: request.params.ofertaId,
      estatus: body.estatus,
    });
    response.json(oferta);
  } catch (error) {
    const message = error instanceof Error ? error.message : 'Unknown error';
    response.status(message.includes('not found') ? 404 : 400).json({
      error: message,
    });
  }
});

valorAgregadoRouter.post('/lead-response', (request, response) => {
  try {
    const body = request.body as {
      opportunityId?: string;
      nombre?: string;
      leasingOfficer?: string;
      createdAt?: string;
      activityAt?: string;
    };

    if (
      !body.opportunityId ||
      !body.nombre ||
      !body.leasingOfficer ||
      !body.createdAt
    ) {
      response.status(400).json({
        error:
          'opportunityId, nombre, leasingOfficer and createdAt are required',
      });
      return;
    }

    const metric = valorAgregadoService.registerPrimeraActividad({
      opportunityId: body.opportunityId,
      nombre: body.nombre,
      leasingOfficer: body.leasingOfficer,
      createdAt: body.createdAt,
      activityAt: body.activityAt,
    });
    response.status(201).json(metric);
  } catch (error) {
    const message = error instanceof Error ? error.message : 'Unknown error';
    response.status(400).json({ error: message });
  }
});

valorAgregadoRouter.post('/broker-outreach', (request, response) => {
  try {
    const body = request.body as {
      naveIdentificador?: string;
      parqueNombre?: string;
      ubicacionEstado?: string;
      m2?: number;
      precioBaseUsd?: number;
    };

    if (!body.naveIdentificador || !body.parqueNombre || body.m2 == null) {
      response.status(400).json({
        error: 'naveIdentificador, parqueNombre and m2 are required',
      });
      return;
    }

    const result = valorAgregadoService.notifyBrokersOnNaveDisponible({
      naveIdentificador: body.naveIdentificador,
      parqueNombre: body.parqueNombre,
      ubicacionEstado: body.ubicacionEstado,
      m2: body.m2,
      precioBaseUsd: body.precioBaseUsd ?? 0.9,
    });
    response.status(201).json(result);
  } catch (error) {
    const message = error instanceof Error ? error.message : 'Unknown error';
    response.status(400).json({ error: message });
  }
});

valorAgregadoRouter.post('/jobs/daily', async (_request, response) => {
  try {
    response.json(await valorAgregadoService.runDailyJobs());
  } catch (error) {
    const message = error instanceof Error ? error.message : 'Unknown error';
    response.status(500).json({ error: message });
  }
});

valorAgregadoRouter.post('/jobs/weekly', async (_request, response) => {
  try {
    response.json(await valorAgregadoService.runWeeklyJobs());
  } catch (error) {
    const message = error instanceof Error ? error.message : 'Unknown error';
    response.status(500).json({ error: message });
  }
});

valorAgregadoRouter.post('/jobs/monthly', async (_request, response) => {
  try {
    response.json(await valorAgregadoService.runMonthlyJobs());
  } catch (error) {
    const message = error instanceof Error ? error.message : 'Unknown error';
    response.status(500).json({ error: message });
  }
});
