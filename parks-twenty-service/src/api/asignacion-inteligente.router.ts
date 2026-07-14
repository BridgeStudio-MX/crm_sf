import { Router } from 'express';

import { asignacionInteligenteService } from '../services/asignacion-inteligente.service';
import { type AsignacionConfig } from '../types/asignacion-inteligente.types';

export const asignacionInteligenteRouter = Router();

asignacionInteligenteRouter.get('/dashboard', (_request, response) => {
  response.json(asignacionInteligenteService.getDashboard());
});

asignacionInteligenteRouter.get('/config', (_request, response) => {
  response.json(asignacionInteligenteService.getConfig());
});

asignacionInteligenteRouter.patch('/config', (request, response) => {
  try {
    const body = request.body as Partial<AsignacionConfig> & {
      actualizadoPor?: string;
    };
    const { actualizadoPor, ...patch } = body;
    response.json(
      asignacionInteligenteService.updateConfig(patch, actualizadoPor),
    );
  } catch (error) {
    const message = error instanceof Error ? error.message : 'Unknown error';
    response.status(400).json({ error: message });
  }
});

asignacionInteligenteRouter.post('/seed-demo', (_request, response) => {
  const clasificaciones = asignacionInteligenteService.seedDemoScenarios();
  response.status(201).json({
    count: clasificaciones.length,
    clasificaciones,
    dashboard: asignacionInteligenteService.getDashboard(),
  });
});

asignacionInteligenteRouter.post('/clasificar', (request, response) => {
  try {
    const body = request.body as {
      opportunityId?: string;
      empresa?: string;
      m2Requeridos?: number;
      presupuestoMensualUsd?: number;
      canalOrigen?: string;
      brokerClasificacion?: string;
      giroEmpresa?: string;
      paisOrigen?: string;
      historialClienteParks?: boolean;
    };

    if (!body.opportunityId || !body.empresa) {
      response
        .status(400)
        .json({ error: 'opportunityId and empresa are required' });
      return;
    }

    const clasificacion = asignacionInteligenteService.clasificarLead({
      opportunityId: body.opportunityId,
      empresa: body.empresa,
      m2Requeridos: body.m2Requeridos,
      presupuestoMensualUsd: body.presupuestoMensualUsd,
      canalOrigen: body.canalOrigen,
      brokerClasificacion: body.brokerClasificacion,
      giroEmpresa: body.giroEmpresa,
      paisOrigen: body.paisOrigen,
      historialClienteParks: body.historialClienteParks,
    });

    response.status(201).json(clasificacion);
  } catch (error) {
    const message = error instanceof Error ? error.message : 'Unknown error';
    response.status(400).json({ error: message });
  }
});

asignacionInteligenteRouter.post(
  '/clasificar/:opportunityId',
  async (request, response) => {
    try {
      const clasificacion =
        await asignacionInteligenteService.clasificarOpportunity(
          request.params.opportunityId,
        );
      response.status(201).json(clasificacion);
    } catch (error) {
      const message = error instanceof Error ? error.message : 'Unknown error';
      response.status(404).json({ error: message });
    }
  },
);

asignacionInteligenteRouter.post(
  '/confirmar-asignacion',
  async (request, response) => {
    try {
      const body = request.body as {
        opportunityId?: string;
        leasingOfficerName?: string;
        assignedBy?: string;
        razonCambio?: string;
      };

      if (
        !body.opportunityId ||
        !body.leasingOfficerName ||
        !body.assignedBy
      ) {
        response.status(400).json({
          error:
            'opportunityId, leasingOfficerName and assignedBy are required',
        });
        return;
      }

      const clasificacion =
        await asignacionInteligenteService.confirmarAsignacion({
          opportunityId: body.opportunityId,
          leasingOfficerName: body.leasingOfficerName,
          assignedBy: body.assignedBy,
          razonCambio: body.razonCambio,
        });

      response.json(clasificacion);
    } catch (error) {
      const message = error instanceof Error ? error.message : 'Unknown error';
      response.status(400).json({ error: message });
    }
  },
);

asignacionInteligenteRouter.post('/jobs/escalation', async (_request, response) => {
  try {
    response.json(await asignacionInteligenteService.runEscalationScan());
  } catch (error) {
    const message = error instanceof Error ? error.message : 'Unknown error';
    response.status(500).json({ error: message });
  }
});
