import { Router } from 'express';

import { commissionApprovalService } from '../services/commission-approval.service';
import {
  commissionRateMatrixStore,
  type CommissionRateMatrix,
} from '../services/commission-rate-matrix.store';
import { commissionRecalculateService } from '../services/commission-recalculate.service';
import { folioBackfillService } from '../services/folio-backfill.service';
import { twentyDataService } from '../services/twenty-data.service';

export const commissionRouter = Router();

const buildDashboard = async () => {
  const comisiones = await twentyDataService.findAllComisiones();
  const now = new Date();
  const currentMonth = now.getMonth();
  const currentYear = now.getFullYear();

  const inCurrentPeriod = (fecha?: string) => {
    if (!fecha) {
      return false;
    }

    const parsed = new Date(fecha);
    return (
      parsed.getMonth() === currentMonth && parsed.getFullYear() === currentYear
    );
  };

  const sumBy = (
    predicate: (comision: (typeof comisiones)[number]) => boolean,
  ) =>
    comisiones
      .filter(predicate)
      .reduce((total, comision) => total + (comision.montoUsd ?? 0), 0);

  const byOrigen = {
    directo: sumBy((comision) =>
      (comision.origenDeal ?? '').toUpperCase().includes('DIRECTO'),
    ),
    top10: sumBy((comision) =>
      (comision.origenDeal ?? '').toUpperCase().includes('TOP_10') ||
      (comision.origenDeal ?? '').toUpperCase().includes('TOP 10'),
    ),
    noTop10: sumBy((comision) =>
      (comision.origenDeal ?? '').toUpperCase().includes('FUERA') ||
      (comision.origenDeal ?? '').toUpperCase().includes('NO_TOP'),
    ),
  };

  const byTipoPago = {
    interno: sumBy((comision) =>
      (comision.tipoPago ?? comision.tipo ?? '')
        .toUpperCase()
        .includes('INTERNO'),
    ),
    externo: sumBy((comision) =>
      (comision.tipoPago ?? comision.tipo ?? '')
        .toUpperCase()
        .includes('EXTERNO') ||
      (comision.tipo ?? '').toUpperCase().includes('BROKER'),
    ),
  };

  const byLo = new Map<string, number>();
  const byBroker = new Map<string, number>();

  for (const comision of comisiones) {
    const monto = comision.montoUsd ?? 0;

    if (comision.leasingOfficer) {
      byLo.set(
        comision.leasingOfficer,
        (byLo.get(comision.leasingOfficer) ?? 0) + monto,
      );
    }

    if (
      (comision.tipoPago ?? comision.tipo ?? '')
        .toUpperCase()
        .includes('EXTERNO') ||
      (comision.tipo ?? '').toUpperCase().includes('BROKER')
    ) {
      const brokerName = comision.beneficiario ?? 'Broker';
      byBroker.set(brokerName, (byBroker.get(brokerName) ?? 0) + monto);
    }
  }

  const pendienteValidacion = comisiones.filter((comision) => {
    const estatus = (comision.estatus ?? '').toUpperCase();
    return (
      (estatus.includes('PENDIENTE') || estatus.includes('CALCULADA')) &&
      !estatus.includes('PAGO')
    );
  });

  const staleDays = 7;
  const stalePendientes = pendienteValidacion.filter((comision) => {
    if (!comision.fechaCierre) {
      return false;
    }

    const closed = new Date(comision.fechaCierre).getTime();
    const ageDays = (Date.now() - closed) / (1000 * 60 * 60 * 24);

    return ageDays > staleDays;
  });

  return {
    totalPeriodo: sumBy((comision) => inCurrentPeriod(comision.fechaCierre)),
    byTipoPago,
    byOrigen,
    byLo: [...byLo.entries()].map(([name, total]) => ({ name, total })),
    byBroker: [...byBroker.entries()].map(([name, total]) => ({ name, total })),
    pendientesValidacion: pendienteValidacion.length,
    pendientesMonto: sumBy((comision) =>
      pendienteValidacion.some((item) => item.id === comision.id),
    ),
    stalePendientes: stalePendientes.length,
    totalComisiones: comisiones.length,
    comisiones,
  };
};

commissionRouter.get('/dashboard', async (_request, response) => {
  try {
    const dashboard = await buildDashboard();
    response.json(dashboard);
  } catch (error) {
    const message = error instanceof Error ? error.message : 'Unknown error';
    response.status(500).json({ error: message });
  }
});

commissionRouter.get('/rates', (_request, response) => {
  response.json({ matrix: commissionRateMatrixStore.get() });
});

commissionRouter.put('/rates', async (request, response) => {
  try {
    const body = request.body as { matrix?: CommissionRateMatrix };

    if (!body.matrix) {
      response.status(400).json({ error: 'matrix is required' });
      return;
    }

    const matrix = commissionRateMatrixStore.save(body.matrix);
    const recalculated =
      await commissionRecalculateService.recalculatePendingFromMatrix();
    const dashboard = await buildDashboard();

    response.json({
      matrix,
      recalculated,
      dashboard,
    });
  } catch (error) {
    const message = error instanceof Error ? error.message : 'Unknown error';
    response.status(500).json({ error: message });
  }
});

commissionRouter.post('/backfill-folios', async (_request, response) => {
  try {
    const result =
      await folioBackfillService.backfillMissingOpportunityFolios();
    response.json(result);
  } catch (error) {
    const message = error instanceof Error ? error.message : 'Unknown error';
    response.status(500).json({ error: message });
  }
});

commissionRouter.post('/rates/reset', (_request, response) => {
  response.json({ matrix: commissionRateMatrixStore.reset() });
});

commissionRouter.post('/:comisionId/approve', async (request, response) => {
  try {
    const body = request.body as {
      aprobadoPor?: string;
      ajusteMonto?: number;
      motivoAjuste?: string;
    };

    if (!body.aprobadoPor?.trim()) {
      response.status(400).json({ error: 'aprobadoPor is required' });
      return;
    }

    const updated = await commissionApprovalService.approve({
      comisionId: request.params.comisionId,
      aprobadoPor: body.aprobadoPor,
      ajusteMonto: body.ajusteMonto,
      motivoAjuste: body.motivoAjuste,
    });

    response.json({ comision: updated });
  } catch (error) {
    const message = error instanceof Error ? error.message : 'Unknown error';
    response.status(400).json({ error: message });
  }
});

commissionRouter.post('/:comisionId/reject', async (request, response) => {
  try {
    const body = request.body as {
      aprobadoPor?: string;
      motivoAjuste?: string;
    };

    if (!body.aprobadoPor?.trim() || !body.motivoAjuste?.trim()) {
      response
        .status(400)
        .json({ error: 'aprobadoPor and motivoAjuste are required' });
      return;
    }

    const updated = await commissionApprovalService.reject({
      comisionId: request.params.comisionId,
      aprobadoPor: body.aprobadoPor,
      motivoAjuste: body.motivoAjuste,
    });

    response.json({ comision: updated });
  } catch (error) {
    const message = error instanceof Error ? error.message : 'Unknown error';
    response.status(400).json({ error: message });
  }
});

commissionRouter.post('/:comisionId/pay', async (request, response) => {
  try {
    const body = request.body as { pagadoPor?: string };
    const updated = await commissionApprovalService.markPaid({
      comisionId: request.params.comisionId,
      pagadoPor: body.pagadoPor,
    });

    response.json({ comision: updated });
  } catch (error) {
    const message = error instanceof Error ? error.message : 'Unknown error';
    response.status(400).json({ error: message });
  }
});

commissionRouter.get('/export.csv', async (_request, response) => {
  try {
    const comisiones = await twentyDataService.findAllComisiones();
    const header = [
      'folio',
      'cliente',
      'beneficiario',
      'tipoPago',
      'origen',
      'tipoContrato',
      'estatusNave',
      'rentaTotal',
      'pct',
      'montoUsd',
      'estatus',
      'fechaCierre',
      'fechaPago',
      'aprobadoPor',
    ];

    const rows = comisiones.map((comision) =>
      [
        comision.folio ?? '',
        comision.clienteNombre ?? '',
        comision.beneficiario ?? '',
        comision.tipoPago ?? comision.tipo ?? '',
        comision.origenDeal ?? '',
        comision.tipoContratoComision ?? '',
        comision.estatusNaveComision ?? '',
        comision.rentaTotalContrato ?? '',
        comision.pctAplicado ?? '',
        comision.montoUsd ?? '',
        comision.estatus ?? '',
        comision.fechaCierre ?? '',
        comision.fechaPago ?? '',
        comision.aprobadoPor ?? '',
      ]
        .map((value) => `"${String(value).replace(/"/g, '""')}"`)
        .join(','),
    );

    const csv = [header.join(','), ...rows].join('\n');
    response.setHeader('Content-Type', 'text/csv; charset=utf-8');
    response.setHeader(
      'Content-Disposition',
      'attachment; filename="parks-comisiones.csv"',
    );
    response.send(csv);
  } catch (error) {
    const message = error instanceof Error ? error.message : 'Unknown error';
    response.status(500).json({ error: message });
  }
});
