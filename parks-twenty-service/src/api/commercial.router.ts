import { Router } from 'express';

import { commercialAccountService } from '../services/commercial-account.service';
import { commercialApprovalService } from '../services/commercial-approval.service';
import { commercialDecisorService } from '../services/commercial-decisor.service';
import { commercialHojaService } from '../services/commercial-hoja.service';
import { commercialLeadService } from '../services/commercial-lead.service';
import { commercialLostService } from '../services/commercial-lost.service';
import { commercialQuotationService } from '../services/commercial-quotation.service';
import { commercialTourService } from '../services/commercial-tour.service';
import { brokerNotificationStore } from '../services/broker-notification.store';
import { emailSequenceService } from '../services/email-sequence.service';
import { fichaTecnicaService } from '../services/ficha-tecnica.service';
import { naveMatchingService } from '../services/nave-matching.service';
import { prospectEnrichmentService } from '../services/prospect-enrichment.service';
import { prospectScoringService } from '../services/prospect-scoring.service';
import { salesScriptService } from '../services/sales-script.service';
import { twentyClient } from '../services/twenty.client';
import { twentyDataService } from '../services/twenty-data.service';
import { type FichaTecnicaSentVia } from '../types/commercial.types';
import { type DecisorClienteRol } from '../constants/decisor-cliente.constants';
import { validateCommercialStageTransition } from '../utils/commercial-stage-gates.util';
import { toSelectValue } from '../utils/select-value.util';

export const commercialRouter = Router();

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
  const notifications = brokerNotificationStore.list({ unreadOnly });

  response.json({
    notifications,
    unreadCount: brokerNotificationStore.getUnreadCount(),
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

  response.json({
    notification,
    unreadCount: brokerNotificationStore.getUnreadCount(),
  });
});

commercialRouter.post('/notifications/mark-all-read', (_request, response) => {
  const updatedCount = brokerNotificationStore.markAllRead();

  response.json({
    updatedCount,
    unreadCount: brokerNotificationStore.getUnreadCount(),
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
      limit: body.limit ?? 3,
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
    };

    if (
      !body.opportunityId ||
      !body.opportunityName ||
      !body.naveId ||
      !body.naveIdentificador ||
      !body.m2
    ) {
      response.status(400).json({
        error:
          'opportunityId, opportunityName, naveId, naveIdentificador and m2 are required',
      });
      return;
    }

    const link = await fichaTecnicaService.createLink({
      opportunityId: body.opportunityId,
      opportunityName: body.opportunityName,
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
