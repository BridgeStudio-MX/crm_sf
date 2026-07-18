import { Router } from 'express';

import { cxcDashboardService } from '../services/cxc-dashboard.service';
import { type CxcRiskLabel } from '../types/cxc.types';

export const cxcRouter = Router();

cxcRouter.get('/dashboard', (request, response) => {
  try {
    const ejecutivoId =
      typeof request.query.ejecutivoId === 'string'
        ? request.query.ejecutivoId
        : undefined;
    const riskLabel =
      typeof request.query.riskLabel === 'string'
        ? (request.query.riskLabel as CxcRiskLabel)
        : undefined;

    response.json(
      cxcDashboardService.getDashboard({ ejecutivoId, riskLabel }),
    );
  } catch (error) {
    const message = error instanceof Error ? error.message : 'Unknown error';
    response.status(500).json({ error: message });
  }
});

cxcRouter.get('/accounts/:accountId', (request, response) => {
  const account = cxcDashboardService.getAccount(request.params.accountId);

  if (!account) {
    response.status(404).json({ error: 'Cuenta CxC no encontrada' });
    return;
  }

  response.json(account);
});

cxcRouter.post('/accounts/:accountId/suggest-payment', (request, response) => {
  try {
    const body = request.body as { pagoMonto?: number };

    if (typeof body.pagoMonto !== 'number' || body.pagoMonto <= 0) {
      response.status(400).json({ error: 'pagoMonto debe ser un número > 0' });
      return;
    }

    response.json(
      cxcDashboardService.suggestPaymentApplication(
        request.params.accountId,
        body.pagoMonto,
      ),
    );
  } catch (error) {
    const message = error instanceof Error ? error.message : 'Unknown error';
    response.status(500).json({ error: message });
  }
});

cxcRouter.post('/accounts/:accountId/apply-payment', (request, response) => {
  try {
    const body = request.body as {
      pagoMonto?: number;
      invoiceIds?: string[];
      note?: string;
      appliedBy?: string;
    };

    if (typeof body.pagoMonto !== 'number' || body.pagoMonto <= 0) {
      response.status(400).json({ error: 'pagoMonto debe ser un número > 0' });
      return;
    }

    if (!Array.isArray(body.invoiceIds) || body.invoiceIds.length === 0) {
      response.status(400).json({ error: 'invoiceIds es requerido' });
      return;
    }

    response.json(
      cxcDashboardService.applyPayment(request.params.accountId, {
        pagoMonto: body.pagoMonto,
        invoiceIds: body.invoiceIds,
        note: body.note,
        appliedBy: body.appliedBy,
      }),
    );
  } catch (error) {
    const message = error instanceof Error ? error.message : 'Unknown error';
    response.status(500).json({ error: message });
  }
});

cxcRouter.post('/accounts/:accountId/actions', (request, response) => {
  try {
    const body = request.body as {
      type?: string;
      detail?: string;
      createdBy?: string;
      compromisoPagoFecha?: string;
      compromisoMonto?: number;
      proximaAccionFecha?: string;
      proximaAccionNota?: string;
    };

    const allowedTypes = new Set([
      'llamada',
      'email',
      'whatsapp',
      'nota',
      'compromiso_pago',
      'escalar_claudia',
      'recordatorio_oc',
      'pago_aplicado',
      'oc_registrada',
    ]);

    if (!body.type || !allowedTypes.has(body.type)) {
      response.status(400).json({ error: 'type de acción inválido' });
      return;
    }

    response.json(
      cxcDashboardService.addCobranzaAction(request.params.accountId, {
        type: body.type as
          | 'llamada'
          | 'email'
          | 'whatsapp'
          | 'nota'
          | 'compromiso_pago'
          | 'escalar_claudia'
          | 'recordatorio_oc'
          | 'pago_aplicado'
          | 'oc_registrada',
        detail: body.detail,
        createdBy: body.createdBy,
        compromisoPagoFecha: body.compromisoPagoFecha,
        compromisoMonto: body.compromisoMonto,
        proximaAccionFecha: body.proximaAccionFecha,
        proximaAccionNota: body.proximaAccionNota,
      }),
    );
  } catch (error) {
    const message = error instanceof Error ? error.message : 'Unknown error';
    response.status(500).json({ error: message });
  }
});

cxcRouter.post('/accounts/:accountId/oc-reminder', (request, response) => {
  try {
    const body = request.body as {
      escalate?: boolean;
      createdBy?: string;
    };

    response.json(
      cxcDashboardService.sendOcReminder(request.params.accountId, {
        escalate: body.escalate === true,
        createdBy: body.createdBy,
      }),
    );
  } catch (error) {
    const message = error instanceof Error ? error.message : 'Unknown error';
    response.status(500).json({ error: message });
  }
});

cxcRouter.post('/accounts/:accountId/register-oc', (request, response) => {
  try {
    const body = request.body as { numeroOc?: string };

    if (!body.numeroOc?.trim()) {
      response.status(400).json({ error: 'numeroOc es requerido' });
      return;
    }

    response.json(
      cxcDashboardService.registerOcReceived(
        request.params.accountId,
        body.numeroOc.trim(),
      ),
    );
  } catch (error) {
    const message = error instanceof Error ? error.message : 'Unknown error';
    response.status(500).json({ error: message });
  }
});

cxcRouter.post(
  '/accounts/:accountId/deposit-step',
  (request, response) => {
    try {
      const body = request.body as {
        step?: 'caratula' | 'carta' | 'firmas' | 'devolver';
      };

      if (
        !body.step ||
        !['caratula', 'carta', 'firmas', 'devolver'].includes(body.step)
      ) {
        response.status(400).json({ error: 'step inválido' });
        return;
      }

      response.json(
        cxcDashboardService.advanceDepositChecklist(
          request.params.accountId,
          body.step,
        ),
      );
    } catch (error) {
      const message = error instanceof Error ? error.message : 'Unknown error';
      response.status(500).json({ error: message });
    }
  },
);

cxcRouter.post('/anomalies/:anomalyId/resolve', (request, response) => {
  try {
    const body = request.body as { note?: string };

    response.json(
      cxcDashboardService.resolveAnomaly(
        request.params.anomalyId,
        body.note?.trim() || 'Resuelta desde dashboard CxC',
      ),
    );
  } catch (error) {
    const message = error instanceof Error ? error.message : 'Unknown error';
    response.status(500).json({ error: message });
  }
});
