import { Router } from 'express';

import { ceoDashboardService } from '../services/ceo-dashboard.service';
import { ceoInboxService } from '../services/ceo-inbox.service';
import { commercialApprovalService } from '../services/commercial-approval.service';
import { holdoverCondonacionService } from '../services/holdover-condonacion.service';

export const ceoRouter = Router();

ceoRouter.get('/dashboard', async (_request, response) => {
  try {
    const result = await ceoDashboardService.getExecutiveDashboard();
    response.json(result);
  } catch (error) {
    const message = error instanceof Error ? error.message : 'Unknown error';
    response.status(500).json({ error: message });
  }
});

ceoRouter.get('/inbox', async (_request, response) => {
  try {
    const inbox = await ceoInboxService.getInbox();
    response.json(inbox);
  } catch (error) {
    const message = error instanceof Error ? error.message : 'Unknown error';
    response.status(500).json({ error: message });
  }
});

// Resuelve pendientes del CEO (comercial, condonación o ítems demo)
ceoRouter.post('/inbox/:itemId/resolve', async (request, response) => {
  try {
    const itemId = String(request.params.itemId ?? '');
    const decision = String(request.body?.decision ?? '');
    const resolvedBy = String(request.body?.resolvedBy ?? 'CEO');
    const comentario = String(request.body?.comentario ?? '').trim();
    const entityId = String(request.body?.entityId ?? '');
    const kind = String(request.body?.kind ?? '');
    const isDemo = request.body?.isDemo === true;

    if (decision !== 'Aprobada' && decision !== 'Rechazada') {
      response.status(400).json({
        error: 'decision debe ser Aprobada o Rechazada',
      });
      return;
    }

    if (isDemo || itemId.startsWith('demo-ceo-')) {
      const dismissed = ceoInboxService.dismissDemoItem(itemId);

      if (!dismissed) {
        response.status(404).json({ error: 'Ítem demo no encontrado' });
        return;
      }

      response.json({ ok: true, itemId, decision, source: 'demo' });
      return;
    }

    if (kind === 'aprobacion-comercial') {
      await commercialApprovalService.resolve({
        opportunityId: entityId || itemId.replace(/^approval-/, ''),
        decision,
        comentario: comentario || `${decision} desde Command Center CEO`,
        resolvedBy,
      });
      response.json({ ok: true, itemId, decision, source: 'comercial' });
      return;
    }

    if (kind === 'condonacion-holdover') {
      await holdoverCondonacionService.resolveCondonacion({
        holdoverId: entityId || itemId.replace(/^condonacion-/, ''),
        aprobada: decision === 'Aprobada',
        aprobadoPor: resolvedBy,
        comentario: comentario || undefined,
      });
      response.json({ ok: true, itemId, decision, source: 'holdover' });
      return;
    }

    response.status(400).json({
      error:
        'kind no soportado para resolve (use aprobacion-comercial o condonacion-holdover)',
    });
  } catch (error) {
    const message = error instanceof Error ? error.message : 'Unknown error';
    response.status(500).json({ error: message });
  }
});
