import { Router } from 'express';

import { commercialAccountService } from '../services/commercial-account.service';
import { commercialApprovalService } from '../services/commercial-approval.service';
import { commercialDecisorService } from '../services/commercial-decisor.service';
import { commercialHojaService } from '../services/commercial-hoja.service';
import { commercialLeadService } from '../services/commercial-lead.service';
import { commercialLostService } from '../services/commercial-lost.service';
import { commercialQuotationService } from '../services/commercial-quotation.service';
import { commercialTourService } from '../services/commercial-tour.service';
import { activityTimelineService } from '../services/activity-timeline.service';
import { brokerNotificationStore } from '../services/broker-notification.store';
import { cemInboxService } from '../services/cem-inbox.service';
import { composerService } from '../services/composer.service';
import { dealWinService } from '../services/deal-win.service';
import { demandSearchService } from '../services/demand-search.service';
import { emailSequenceService } from '../services/email-sequence.service';
import { fichaTecnicaService } from '../services/ficha-tecnica.service';
import { naveMatchingService } from '../services/nave-matching.service';
import { prospectEnrichmentService } from '../services/prospect-enrichment.service';
import { prospectScoringService } from '../services/prospect-scoring.service';
import { mapOutreachService } from '../services/map-outreach.service';
import { salesScriptService } from '../services/sales-script.service';
import { asignacionInteligenteService } from '../services/asignacion-inteligente.service';
import { twentyClient } from '../services/twenty.client';
import { twentyDataService } from '../services/twenty-data.service';
import { type FichaTecnicaSentVia } from '../types/commercial.types';
import { type DecisorClienteRol } from '../constants/decisor-cliente.constants';
import { validateCommercialStageTransition } from '../utils/commercial-stage-gates.util';
import { toSelectValue } from '../utils/select-value.util';

export const commercialRouter = Router();

commercialRouter.get('/inbox', async (_request, response) => {
  try {
    const inbox = await cemInboxService.getInbox();
    response.json(inbox);
  } catch (error) {
    const message = error instanceof Error ? error.message : 'Unknown error';
    response.status(500).json({ error: message });
  }
});

commercialRouter.post('/leads', async (request, response) => {
  try {
    const body = request.body as Parameters<
      typeof commercialLeadService.createLead
    >[0];

    if (!body?.empresa || !body?.canalOrigen || !body?.nombreCompleto) {
      response.status(400).json({
        error: 'nombreCompleto, empresa and canalOrigen are required',
      });
      return;
    }

    const result = await commercialLeadService.createLead(body);

    // Additive: intelligent assignment classification (does not alter createLead)
    try {
      const clasificacion = asignacionInteligenteService.clasificarLead({
        opportunityId: result.opportunityId,
        empresa: body.empresa,
        m2Requeridos: body.metrosCuadradosRequeridos,
        presupuestoMensualUsd: body.presupuestoMensualUsd,
        canalOrigen: body.canalOrigen,
        giroEmpresa: body.giroEmpresa,
        paisOrigen: (body as { paisOrigen?: string }).paisOrigen,
      });

      response.status(201).json({ ...result, clasificacion });
      return;
    } catch (classifyError) {
      console.error(
        '[commercial] Asignación inteligente classify skipped:',
        classifyError,
      );
    }

    response.status(201).json(result);
  } catch (error) {
    const message = error instanceof Error ? error.message : 'Unknown error';
    response.status(500).json({ error: message });
  }
});

commercialRouter.get('/leads/unassigned', async (_request, response) => {
  try {
    const leads = await commercialLeadService.listUnassigned();
    response.json({ leads });
  } catch (error) {
    const message = error instanceof Error ? error.message : 'Unknown error';
    response.status(500).json({ error: message });
  }
});

commercialRouter.post(
  '/leads/:opportunityId/assign',
  async (request, response) => {
    try {
      const body = request.body as {
        leasingOfficerName?: string;
        assignedBy?: string;
      };

      if (!body.leasingOfficerName || !body.assignedBy) {
        response.status(400).json({
          error: 'leasingOfficerName and assignedBy are required',
        });
        return;
      }

      const result = await commercialLeadService.assignLead({
        opportunityId: request.params.opportunityId,
        leasingOfficerName: body.leasingOfficerName,
        assignedBy: body.assignedBy,
      });

      response.json(result);
    } catch (error) {
      const message = error instanceof Error ? error.message : 'Unknown error';
      response.status(500).json({ error: message });
    }
  },
);

commercialRouter.post('/tour', async (request, response) => {
  try {
    const body = request.body as Parameters<
      typeof commercialTourService.register
    >[0];

    if (!body?.opportunityId || !body?.tourFecha) {
      response
        .status(400)
        .json({ error: 'opportunityId and tourFecha are required' });
      return;
    }

    const result = await commercialTourService.register(body);
    response.json(result);
  } catch (error) {
    const message = error instanceof Error ? error.message : 'Unknown error';
    response.status(500).json({ error: message });
  }
});

commercialRouter.post('/quotations/preview', (request, response) => {
  const body = request.body as {
    m2Ofertados?: number;
    precioPorM2Usd?: number;
  };

  if (!body.m2Ofertados || !body.precioPorM2Usd) {
    response
      .status(400)
      .json({ error: 'm2Ofertados and precioPorM2Usd are required' });
    return;
  }

  response.json(
    commercialQuotationService.preview({
      m2Ofertados: body.m2Ofertados,
      precioPorM2Usd: body.precioPorM2Usd,
    }),
  );
});

commercialRouter.post(
  '/quotations/:opportunityId/send',
  async (request, response) => {
    try {
      const body = request.body as Omit<
        Parameters<typeof commercialQuotationService.send>[0],
        'opportunityId'
      >;

      if (!body.m2Ofertados || !body.precioPorM2Usd) {
        response
          .status(400)
          .json({ error: 'm2Ofertados and precioPorM2Usd are required' });
        return;
      }

      const result = await commercialQuotationService.send({
        ...body,
        opportunityId: request.params.opportunityId,
      });

      response.json(result);
    } catch (error) {
      const message = error instanceof Error ? error.message : 'Unknown error';
      response.status(500).json({ error: message });
    }
  },
);

commercialRouter.post('/approvals/request', async (request, response) => {
  try {
    const body = request.body as Parameters<
      typeof commercialApprovalService.request
    >[0];

    if (!body?.opportunityId || !body?.condicionesPropuestas) {
      response.status(400).json({
        error: 'opportunityId and condicionesPropuestas are required',
      });
      return;
    }

    const result = await commercialApprovalService.request(body);
    response.json(result);
  } catch (error) {
    const message = error instanceof Error ? error.message : 'Unknown error';
    response.status(500).json({ error: message });
  }
});

commercialRouter.post('/approvals/resolve', async (request, response) => {
  try {
    const body = request.body as Parameters<
      typeof commercialApprovalService.resolve
    >[0];

    if (!body?.opportunityId || !body?.decision || !body?.resolvedBy) {
      response.status(400).json({
        error: 'opportunityId, decision and resolvedBy are required',
      });
      return;
    }

    const result = await commercialApprovalService.resolve(body);
    response.json(result);
  } catch (error) {
    const message = error instanceof Error ? error.message : 'Unknown error';
    response.status(500).json({ error: message });
  }
});

commercialRouter.post('/lost', async (request, response) => {
  try {
    const body = request.body as Parameters<
      typeof commercialLostService.markLost
    >[0];

    if (!body?.opportunityId || !body?.motivoPerdida) {
      response
        .status(400)
        .json({ error: 'opportunityId and motivoPerdida are required' });
      return;
    }

    const result = await commercialLostService.markLost(body);
    response.json(result);
  } catch (error) {
    const message = error instanceof Error ? error.message : 'Unknown error';
    response.status(400).json({ error: message });
  }
});

commercialRouter.post('/hoja-acuerdos', async (request, response) => {
  try {
    const body = request.body as {
      opportunityId?: string;
      ejecutivoAsignado?: string;
    };

    if (!body.opportunityId) {
      response.status(400).json({ error: 'opportunityId is required' });
      return;
    }

    const result = await commercialHojaService.createFromOpportunity({
      opportunityId: body.opportunityId,
      ejecutivoAsignado: body.ejecutivoAsignado,
    });

    response.status(201).json(result);
  } catch (error) {
    const message = error instanceof Error ? error.message : 'Unknown error';
    response.status(400).json({ error: message });
  }
});

commercialRouter.get(
  '/hoja-acuerdos/by-opportunity/:opportunityId',
  async (request, response) => {
    try {
      const hoja = await commercialHojaService.findByOpportunity(
        request.params.opportunityId,
      );

      response.json({ hoja });
    } catch (error) {
      const message = error instanceof Error ? error.message : 'Unknown error';
      response.status(500).json({ error: message });
    }
  },
);

commercialRouter.get('/hoja-acuerdos/:hojaId', async (request, response) => {
  try {
    const hoja = await commercialHojaService.getById(request.params.hojaId);

    response.json({ hoja });
  } catch (error) {
    const message = error instanceof Error ? error.message : 'Unknown error';
    response.status(404).json({ error: message });
  }
});

commercialRouter.patch(
  '/hoja-acuerdos/:hojaId',
  async (request, response) => {
    try {
      const body = request.body as {
        m2Acordados?: number;
        precioUsdM2?: number;
        plazoMeses?: number;
        fechaInicio?: string | null;
        periodoGraciaMeses?: number;
        depositoMeses?: number;
        escalacionAnualPct?: number;
        condicionesEspeciales?: string;
        tipoContrato?: string;
        esquemaComision?: string;
        ejecutivoAsignado?: string;
        brokerComisionPct?: number;
        brokerComisionMonto?: number;
      };

      const hoja = await commercialHojaService.updateDraft({
        hojaId: request.params.hojaId,
        ...body,
      });

      response.json({ hoja });
    } catch (error) {
      const message = error instanceof Error ? error.message : 'Unknown error';
      response.status(400).json({ error: message });
    }
  },
);

commercialRouter.post(
  '/hoja-acuerdos/:hojaId/generate-copy',
  async (request, response) => {
    try {
      const result = await commercialHojaService.generateCopy(
        request.params.hojaId,
      );

      response.json(result);
    } catch (error) {
      const message = error instanceof Error ? error.message : 'Unknown error';
      response.status(400).json({ error: message });
    }
  },
);

commercialRouter.post(
  '/hoja-acuerdos/:hojaId/sign',
  async (request, response) => {
    try {
      const body = request.body as {
        opportunityId?: string;
        firmadaPorCliente?: boolean;
        firmadaPorCem?: boolean;
        fechaFirma?: string;
      };

      if (!body.opportunityId) {
        response.status(400).json({ error: 'opportunityId is required' });
        return;
      }

      const result = await commercialHojaService.sign({
        hojaId: request.params.hojaId,
        opportunityId: body.opportunityId,
        firmadaPorCliente: body.firmadaPorCliente,
        firmadaPorCem: body.firmadaPorCem,
        fechaFirma: body.fechaFirma,
      });

      response.json(result);
    } catch (error) {
      const message = error instanceof Error ? error.message : 'Unknown error';
      response.status(500).json({ error: message });
    }
  },
);

commercialRouter.post('/stage-gate', (request, response) => {
  const body = request.body as {
    targetStage?: string;
    opportunity?: Parameters<typeof validateCommercialStageTransition>[1];
  };

  if (!body.targetStage || !body.opportunity) {
    response
      .status(400)
      .json({ error: 'targetStage and opportunity are required' });
    return;
  }

  const result = validateCommercialStageTransition(
    body.targetStage,
    body.opportunity,
  );

  if (!result.ok) {
    response.status(400).json(result);
    return;
  }

  response.json(result);
});

commercialRouter.post(
  '/inquilinos/:inquilinoId/opportunities',
  async (request, response) => {
    try {
      const inquilinoId = request.params.inquilinoId;
      const body = request.body as Parameters<
        typeof commercialLeadService.createOpportunityForInquilino
      >[1];

      if (!body?.canalOrigen || !body?.ubicacionDeseada) {
        response.status(400).json({
          error: 'canalOrigen and ubicacionDeseada are required',
        });
        return;
      }

      const result = await commercialLeadService.createOpportunityForInquilino(
        inquilinoId,
        body,
      );
      response.status(201).json(result);
    } catch (error) {
      const message = error instanceof Error ? error.message : 'Unknown error';
      response.status(500).json({ error: message });
    }
  },
);

commercialRouter.get(
  '/account-360/:inquilinoId',
  async (request, response) => {
    try {
      const inquilinoId = request.params.inquilinoId;
      const account360 =
        await commercialAccountService.getAccount360(inquilinoId);

      response.json(account360);
    } catch (error) {
      const message = error instanceof Error ? error.message : 'Unknown error';
      response.status(500).json({ error: message });
    }
  },
);

commercialRouter.get(
  '/decisores/opportunity/:opportunityId',
  async (request, response) => {
    try {
      const inquilinoId =
        typeof request.query.inquilinoId === 'string'
          ? request.query.inquilinoId
          : undefined;
      const decisores = await commercialDecisorService.listForOpportunity(
        request.params.opportunityId,
        inquilinoId,
      );

      response.json({ decisores });
    } catch (error) {
      const message = error instanceof Error ? error.message : 'Unknown error';
      response.status(500).json({ error: message });
    }
  },
);

commercialRouter.get(
  '/decisores/inquilino/:inquilinoId',
  async (request, response) => {
    try {
      const decisores = commercialDecisorService.listForInquilino(
        request.params.inquilinoId,
      );

      response.json({ decisores });
    } catch (error) {
      const message = error instanceof Error ? error.message : 'Unknown error';
      response.status(500).json({ error: message });
    }
  },
);

commercialRouter.post('/decisores', async (request, response) => {
  try {
    const body = request.body as {
      id?: string;
      inquilinoId?: string;
      opportunityId?: string;
      nombre?: string;
      correo?: string;
      telefono?: string;
      rol?: DecisorClienteRol;
    };

    if (!body.nombre?.trim() || !body.rol) {
      response.status(400).json({ error: 'nombre and rol are required' });
      return;
    }

    const decisor = await commercialDecisorService.upsert({
      id: body.id,
      inquilinoId: body.inquilinoId,
      opportunityId: body.opportunityId,
      nombre: body.nombre,
      correo: body.correo,
      telefono: body.telefono,
      rol: body.rol,
    });

    response.status(body.id ? 200 : 201).json({ decisor });
  } catch (error) {
    const message = error instanceof Error ? error.message : 'Unknown error';
    response.status(500).json({ error: message });
  }
});

commercialRouter.delete(
  '/decisores/:decisorId',
  async (request, response) => {
    try {
      const opportunityId =
        typeof request.query.opportunityId === 'string'
          ? request.query.opportunityId
          : undefined;
      const removed = await commercialDecisorService.remove(
        request.params.decisorId,
        opportunityId,
      );

      if (!removed) {
        response.status(404).json({ error: 'Decisor not found' });
        return;
      }

      response.json({ ok: true });
    } catch (error) {
      const message = error instanceof Error ? error.message : 'Unknown error';
      response.status(500).json({ error: message });
    }
  },
);

commercialRouter.post(
  '/decisores/tour-attendance',
  async (request, response) => {
    try {
      const body = request.body as {
        opportunityId?: string;
        inquilinoId?: string;
        attendedDecisorIds?: string[];
      };

      if (!body.opportunityId) {
        response.status(400).json({ error: 'opportunityId is required' });
        return;
      }

      const result = await commercialDecisorService.setTourAttendance({
        opportunityId: body.opportunityId,
        inquilinoId: body.inquilinoId,
        attendedDecisorIds: body.attendedDecisorIds ?? [],
      });

      response.json(result);
    } catch (error) {
      const message = error instanceof Error ? error.message : 'Unknown error';
      response.status(500).json({ error: message });
    }
  },
);

commercialRouter.post(
  '/brokers/:brokerId/reclassify',
  async (request, response) => {
    try {
      const body = request.body as {
        clasificacion?: string;
        changedBy?: string;
      };

      if (!body.clasificacion) {
        response.status(400).json({ error: 'clasificacion is required' });
        return;
      }

      await twentyClient.mutate(
        `
      mutation UpdateBroker($brokerId: UUID!, $data: BrokerUpdateInput!) {
        updateBroker(id: $brokerId, data: $data) {
          id
          clasificacion
        }
      }
    `,
        {
          brokerId: request.params.brokerId,
          data: {
            clasificacion: toSelectValue(body.clasificacion),
          },
        },
      );

      brokerNotificationStore.add({
        type: 'alert',
        priority: 'normal',
        title: 'Broker reclasificado',
        body: `Nueva clasificación: ${body.clasificacion}. Por: ${body.changedBy ?? 'CEM'}`,
        area: 'CEM',
      });

      response.json({
        brokerId: request.params.brokerId,
        clasificacion: body.clasificacion,
      });
    } catch (error) {
      const message = error instanceof Error ? error.message : 'Unknown error';
      response.status(500).json({ error: message });
    }
  },
);

commercialRouter.get('/notifications', (request, response) => {
  const unreadOnly = request.query.unreadOnly === 'true';
  const viewerName =
    typeof request.query.viewerName === 'string'
      ? request.query.viewerName
      : undefined;
  const viewerEmail =
    typeof request.query.viewerEmail === 'string'
      ? request.query.viewerEmail
      : undefined;
  const viewerRoleLabelsRaw = request.query.viewerRoleLabels;
  const viewerRoleLabels = Array.isArray(viewerRoleLabelsRaw)
    ? viewerRoleLabelsRaw.filter(
        (roleLabel): roleLabel is string => typeof roleLabel === 'string',
      )
    : typeof viewerRoleLabelsRaw === 'string'
      ? viewerRoleLabelsRaw
          .split(',')
          .map((roleLabel) => roleLabel.trim())
          .filter((roleLabel) => roleLabel.length > 0)
      : undefined;

  const viewer = { viewerName, viewerEmail, viewerRoleLabels };
  const notifications = brokerNotificationStore.list({
    unreadOnly,
    ...viewer,
  });

  response.json({
    notifications,
    unreadCount: brokerNotificationStore.getUnreadCount(viewer),
  });
});

commercialRouter.patch('/notifications/:notificationId/read', (request, response) => {
  const notification = brokerNotificationStore.markRead(
    request.params.notificationId,
  );

  if (!notification) {
    response.status(404).json({ error: 'Notification not found' });
    return;
  }

  const viewerName =
    typeof request.query.viewerName === 'string'
      ? request.query.viewerName
      : undefined;
  const viewerEmail =
    typeof request.query.viewerEmail === 'string'
      ? request.query.viewerEmail
      : undefined;
  const viewerRoleLabelsRaw = request.query.viewerRoleLabels;
  const viewerRoleLabels = Array.isArray(viewerRoleLabelsRaw)
    ? viewerRoleLabelsRaw.filter(
        (roleLabel): roleLabel is string => typeof roleLabel === 'string',
      )
    : typeof viewerRoleLabelsRaw === 'string'
      ? viewerRoleLabelsRaw
          .split(',')
          .map((roleLabel) => roleLabel.trim())
          .filter((roleLabel) => roleLabel.length > 0)
      : undefined;

  response.json({
    notification,
    unreadCount: brokerNotificationStore.getUnreadCount({
      viewerName,
      viewerEmail,
      viewerRoleLabels,
    }),
  });
});

commercialRouter.post('/notifications/mark-all-read', (request, response) => {
  const body = (request.body ?? {}) as {
    viewerName?: string;
    viewerEmail?: string;
    viewerRoleLabels?: string[];
  };
  const viewer = {
    viewerName: body.viewerName,
    viewerEmail: body.viewerEmail,
    viewerRoleLabels: body.viewerRoleLabels,
  };
  const updatedCount = brokerNotificationStore.markAllRead(viewer);

  response.json({
    updatedCount,
    unreadCount: brokerNotificationStore.getUnreadCount(viewer),
  });
});

commercialRouter.get(
  '/enrich-prospect/:opportunityId',
  (request, response) => {
    const cached = prospectEnrichmentService.getCached(
      request.params.opportunityId,
    );

    if (!cached) {
      response.status(404).json({ error: 'Enrichment not found' });
      return;
    }

    response.json(cached);
  },
);

commercialRouter.post('/prospect-scores', (request, response) => {
  const body = request.body as {
    opportunities?: Array<{
      opportunityId?: string;
      companyName?: string;
      industryHint?: string;
      m2Requeridos?: number;
      amountMicros?: number;
    }>;
  };

  if (!body.opportunities || body.opportunities.length === 0) {
    response.status(400).json({ error: 'opportunities array is required' });
    return;
  }

  const validItems = body.opportunities.filter(
    (item): item is {
      opportunityId: string;
      companyName: string;
      industryHint?: string;
      m2Requeridos?: number;
      amountMicros?: number;
    } =>
      typeof item.opportunityId === 'string' &&
      typeof item.companyName === 'string',
  );

  response.json({
    scores: prospectScoringService.computeBatch(validItems),
  });
});

commercialRouter.get(
  '/email-sequence/:opportunityId',
  (request, response) => {
    const companyName =
      typeof request.query.companyName === 'string'
        ? request.query.companyName
        : 'Prospecto';
    const industryHint =
      typeof request.query.industryHint === 'string'
        ? request.query.industryHint
        : undefined;

    const sequence = emailSequenceService.getForOpportunity({
      opportunityId: request.params.opportunityId,
      companyName,
      industryHint,
    });

    response.json(sequence);
  },
);

commercialRouter.post('/enrich-prospect', async (request, response) => {
  try {
    const body = request.body as {
      opportunityId?: string;
      companyName?: string;
      industryHint?: string;
      m2Requeridos?: number;
    };

    if (!body.opportunityId || !body.companyName) {
      response
        .status(400)
        .json({ error: 'opportunityId and companyName are required' });
      return;
    }

    const result = await prospectEnrichmentService.enrich({
      opportunityId: body.opportunityId,
      companyName: body.companyName.trim(),
      industryHint: body.industryHint,
      m2Requeridos: body.m2Requeridos,
    });

    response.json(result);
  } catch (error) {
    const message = error instanceof Error ? error.message : 'Unknown error';
    response.status(500).json({ error: message });
  }
});

commercialRouter.post('/match-naves', async (request, response) => {
  try {
    const body = request.body as {
      opportunityId?: string;
      m2Requeridos?: number;
      industry?: string;
      cityFilter?: string;
      minAlturaLibre?: number;
      minAndenes?: number;
      limit?: number;
    };

    const m2Requeridos = body.m2Requeridos ?? 0;

    if (m2Requeridos <= 0) {
      response.status(400).json({ error: 'm2Requeridos must be greater than 0' });
      return;
    }

    const result = await naveMatchingService.match({
      opportunityId: body.opportunityId,
      m2Requeridos,
      industry: body.industry,
      cityFilter: body.cityFilter,
      minAlturaLibre: body.minAlturaLibre,
      minAndenes: body.minAndenes,
      limit: body.limit ?? 50,
    });

    response.json(result);
  } catch (error) {
    const message = error instanceof Error ? error.message : 'Unknown error';
    response.status(500).json({ error: message });
  }
});

commercialRouter.post('/ficha-tecnica', async (request, response) => {
  try {
    const body = request.body as {
      opportunityId?: string;
      opportunityName?: string;
      naveId?: string;
      naveIdentificador?: string;
      parqueNombre?: string;
      ubicacion?: string;
      m2?: number;
      precioUsdM2?: number;
      source?: 'pipeline' | 'stacking-plan' | 'inventory';
    };

    if (!body.naveId || !body.naveIdentificador || !body.m2) {
      response.status(400).json({
        error: 'naveId, naveIdentificador and m2 are required',
      });
      return;
    }

    const opportunityId =
      body.opportunityId?.trim() || `inventario-${body.naveId}`;
    const opportunityName =
      body.opportunityName?.trim() ||
      (body.source === 'stacking-plan' || body.source === 'inventory'
        ? `Inventario · ${body.naveIdentificador}`
        : 'Prospecto Parks');

    const link = await fichaTecnicaService.createLink({
      opportunityId,
      opportunityName,
      naveId: body.naveId,
      naveIdentificador: body.naveIdentificador,
      parqueNombre: body.parqueNombre,
      ubicacion: body.ubicacion,
      m2: body.m2,
      precioUsdM2: body.precioUsdM2,
    });

    response.json(link);
  } catch (error) {
    const message = error instanceof Error ? error.message : 'Unknown error';
    response.status(500).json({ error: message });
  }
});

commercialRouter.get('/ficha/:token', (request, response) => {
  const acceptHeader = request.headers.accept ?? '';

  if (acceptHeader.includes('application/json')) {
    const link = fichaTecnicaService.getPublicJson(request.params.token);

    if (!link) {
      response.status(404).json({ error: 'Ficha not found' });
      return;
    }

    response.json(link);
    return;
  }

  const html = fichaTecnicaService.getPublicHtml(request.params.token);

  if (!html) {
    response.status(404).send('Ficha no encontrada');
    return;
  }

  response.type('html').send(html);
});

commercialRouter.post('/ficha/:token/view', (request, response) => {
  const link = fichaTecnicaService.recordView(request.params.token);

  if (!link) {
    response.status(404).json({ error: 'Ficha not found' });
    return;
  }

  response.json(link);
});

commercialRouter.post('/ficha/:token/sent', (request, response) => {
  const body = request.body as { sentVia?: FichaTecnicaSentVia };

  if (!body.sentVia) {
    response.status(400).json({ error: 'sentVia is required' });
    return;
  }

  const link = fichaTecnicaService.markSent(
    request.params.token,
    body.sentVia,
  );

  if (!link) {
    response.status(404).json({ error: 'Ficha not found' });
    return;
  }

  response.json(link);
});

commercialRouter.get('/ficha/:token/pdf', async (request, response) => {
  try {
    const pdfBuffer = await fichaTecnicaService.generatePdfBuffer(
      request.params.token,
    );

    if (!pdfBuffer) {
      response.status(404).json({ error: 'Ficha not found' });
      return;
    }

    response
      .type('application/pdf')
      .set(
        'Content-Disposition',
        `inline; filename="ficha-${request.params.token}.pdf"`,
      )
      .send(pdfBuffer);
  } catch (error) {
    const message = error instanceof Error ? error.message : 'Unknown error';
    response.status(500).json({ error: message });
  }
});

commercialRouter.get(
  '/ficha-tecnica/opportunity/:opportunityId',
  (request, response) => {
    const links = fichaTecnicaService.listByOpportunity(
      request.params.opportunityId,
    );

    response.json({ links });
  },
);

commercialRouter.post('/sales-script', async (request, response) => {
  try {
    const body = request.body as {
      opportunityId?: string;
      companyName?: string;
      industry?: string;
      m2Requeridos?: number;
      naveDestacada?: string;
    };

    if (!body.companyName) {
      response.status(400).json({ error: 'companyName is required' });
      return;
    }

    const result = await salesScriptService.generate({
      opportunityId: body.opportunityId,
      companyName: body.companyName,
      industry: body.industry ?? 'Manufactura',
      m2Requeridos: body.m2Requeridos,
      naveDestacada: body.naveDestacada,
    });

    response.json(result);
  } catch (error) {
    const message = error instanceof Error ? error.message : 'Unknown error';
    response.status(500).json({ error: message });
  }
});

commercialRouter.post('/demand-search', async (request, response) => {
  try {
    const body = request.body as Parameters<
      typeof demandSearchService.search
    >[0];

    const result = await demandSearchService.search(body ?? {});
    response.json(result);
  } catch (error) {
    const message = error instanceof Error ? error.message : 'Unknown error';
    response.status(500).json({ error: message });
  }
});

commercialRouter.post('/composer/generate', async (request, response) => {
  try {
    const body = request.body as Parameters<
      typeof composerService.generate
    >[0];

    if (!body.templateType || !body.naveIdentificador) {
      response.status(400).json({
        error: 'templateType and naveIdentificador are required',
      });
      return;
    }

    const result = await composerService.generate(body);
    response.json(result);
  } catch (error) {
    const message = error instanceof Error ? error.message : 'Unknown error';
    response.status(500).json({ error: message });
  }
});

commercialRouter.get(
  '/activity-timeline/:opportunityId',
  async (request, response) => {
    try {
      const result = await activityTimelineService.getForOpportunity(
        request.params.opportunityId,
      );

      response.json(result);
    } catch (error) {
      const message = error instanceof Error ? error.message : 'Unknown error';
      response.status(500).json({ error: message });
    }
  },
);

commercialRouter.get(
  '/deal-win-preview/:opportunityId',
  async (request, response) => {
    try {
      const result = await dealWinService.getPreview(
        request.params.opportunityId,
      );

      response.json(result);
    } catch (error) {
      const message = error instanceof Error ? error.message : 'Unknown error';
      response.status(500).json({ error: message });
    }
  },
);

commercialRouter.post('/bulk-follow-up', async (request, response) => {
  try {
    const body = request.body as {
      opportunityIds?: string[];
      actionLabel?: string;
    };

    if (!body.opportunityIds || body.opportunityIds.length === 0) {
      response.status(400).json({ error: 'opportunityIds array is required' });
      return;
    }

    for (const opportunityId of body.opportunityIds) {
      await twentyDataService.createTask(
        body.actionLabel ?? '[Comercial] Seguimiento prospecto',
        `Seguimiento masivo desde búsqueda de demanda. Opportunity: ${opportunityId}`,
      );

      brokerNotificationStore.add({
        type: 'task',
        priority: 'normal',
        title: 'Tarea de seguimiento creada',
        body: `Prospecto seleccionado en búsqueda de demanda.`,
        area: 'Comercial',
        opportunityId,
      });
    }

    response.json({
      tasksCreated: body.opportunityIds.length,
      message: `Se crearon ${body.opportunityIds.length} tareas de seguimiento.`,
    });
  } catch (error) {
    const message = error instanceof Error ? error.message : 'Unknown error';
    response.status(500).json({ error: message });
  }
});

commercialRouter.post('/map-outreach', async (request, response) => {
  try {
    const body = request.body as {
      leads?: Array<{
        opportunityId?: string;
        opportunityName?: string;
        companyName?: string;
        ubicacionDeseada?: string;
        m2Requeridos?: number;
        contactEmail?: string;
      }>;
      nave?: {
        naveId?: string;
        naveIdentificador?: string;
        parqueNombre?: string;
        ubicacion?: string;
        m2?: number;
        precioUsdM2?: number;
        availabilityLabel?: string;
      };
      personalNote?: string;
      senderName?: string;
    };

    if (!body.leads || body.leads.length === 0) {
      response.status(400).json({ error: 'leads array is required' });
      return;
    }

    if (!body.nave?.naveId || !body.nave.naveIdentificador) {
      response.status(400).json({
        error: 'nave.naveId and nave.naveIdentificador are required',
      });
      return;
    }

    const leads = body.leads
      .filter(
        (lead) =>
          Boolean(lead.opportunityId?.trim()) &&
          Boolean(lead.opportunityName?.trim()),
      )
      .map((lead) => ({
        opportunityId: lead.opportunityId!.trim(),
        opportunityName: lead.opportunityName!.trim(),
        companyName: lead.companyName,
        ubicacionDeseada: lead.ubicacionDeseada,
        m2Requeridos: lead.m2Requeridos,
        contactEmail: lead.contactEmail,
      }));

    if (leads.length === 0) {
      response.status(400).json({
        error: 'Each lead requires opportunityId and opportunityName',
      });
      return;
    }

    const result = await mapOutreachService.send({
      leads,
      nave: {
        naveId: body.nave.naveId,
        naveIdentificador: body.nave.naveIdentificador,
        parqueNombre: body.nave.parqueNombre,
        ubicacion: body.nave.ubicacion,
        m2: body.nave.m2,
        precioUsdM2: body.nave.precioUsdM2,
        availabilityLabel: body.nave.availabilityLabel,
      },
      personalNote: body.personalNote,
      senderName: body.senderName,
    });

    response.json(result);
  } catch (error) {
    const message = error instanceof Error ? error.message : 'Unknown error';
    response.status(500).json({ error: message });
  }
});
