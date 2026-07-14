import { ceoDashboardStore } from './ceo-dashboard.store';
import { ceoInboxService } from './ceo-inbox.service';
import { cxcStore } from './cxc.store';
import {
  type CeoBoardSection,
  type CeoDailyKpis,
  type CeoExecutiveDashboardResult,
  type CeoMonthlySnapshot,
  type CeoTrendPoint,
} from '../types/ceo-dashboard.types';

const MONTH_LABELS: Record<string, string> = {
  '01': 'Ene',
  '02': 'Feb',
  '03': 'Mar',
  '04': 'Abr',
  '05': 'May',
  '06': 'Jun',
  '07': 'Jul',
  '08': 'Ago',
  '09': 'Sep',
  '10': 'Oct',
  '11': 'Nov',
  '12': 'Dic',
};

const toMonthLabel = (mesAnio: string): string => {
  const [, month] = mesAnio.split('-');
  return MONTH_LABELS[month ?? ''] ?? mesAnio;
};

const trendFromSnapshots = (
  snapshots: CeoMonthlySnapshot[],
  pick: (snapshot: CeoMonthlySnapshot) => number,
): CeoTrendPoint[] =>
  snapshots.map((snapshot) => ({
    mesAnio: snapshot.mesAnio,
    label: toMonthLabel(snapshot.mesAnio),
    value: pick(snapshot),
  }));

const buildDaily = (
  latest: CeoMonthlySnapshot,
  previous: CeoMonthlySnapshot | undefined,
  live: {
    ocupacionLive?: number;
    mrrLiveUsd?: number;
    holdoversLive?: number;
    pipelineDealsLive?: number;
    pipelineValueLiveUsd?: number;
  },
): CeoDailyKpis => {
  const ocupacionPct = live.ocupacionLive ?? latest.porcentajeOcupacion;
  const mrrMxn =
    live.mrrLiveUsd != null
      ? Math.round(live.mrrLiveUsd * latest.tipoCambioUsado)
      : latest.mrrTotalMxn;
  const holdoversCount =
    live.holdoversLive ?? latest.contratosHoldoverActivos;

  const ocupacionDeltaPts = previous
    ? Number((ocupacionPct - previous.porcentajeOcupacion).toFixed(1))
    : 2.1;
  const mrrDeltaPct = previous
    ? Number(
        (((mrrMxn - previous.mrrTotalMxn) / previous.mrrTotalMxn) * 100).toFixed(
          1,
        ),
      )
    : 3.5;
  const cobranzaDeltaPts = previous
    ? Number(
        (latest.porcentajeCobranzaMes - previous.porcentajeCobranzaMes).toFixed(
          1,
        ),
      )
    : -0.8;

  return {
    ocupacionPct,
    ocupacionDeltaPts,
    mrrMxn,
    mrrDeltaPct,
    cobranzaMesPct: latest.porcentajeCobranzaMes,
    cobranzaDeltaPts,
    holdoversCount,
    holdoverMontoAcumulado: latest.montoHoldoverFacturadoMes,
    holdoverDiasPromedio: 52,
    carteraMas90: latest.carteraMas90,
    pipelineDeals: live.pipelineDealsLive ?? latest.pipelineDealsActivos,
    pipelineM2: latest.pipelineM2Total,
    pipelineMrrPonderado:
      live.pipelineValueLiveUsd != null
        ? Math.round(live.pipelineValueLiveUsd * latest.tipoCambioUsado * 0.65)
        : latest.pipelineMrrPonderado,
    vencimientos: [
      {
        dias: 30,
        contratos: 2,
        m2EnRiesgo: 1_800,
        revenueEnRiesgoAnual: 2_160_000,
      },
      {
        dias: 60,
        contratos: 5,
        m2EnRiesgo: 4_200,
        revenueEnRiesgoAnual: 5_040_000,
      },
      {
        dias: 90,
        contratos: 8,
        m2EnRiesgo: 7_100,
        revenueEnRiesgoAnual: 8_520_000,
      },
      {
        dias: 180,
        contratos: 14,
        m2EnRiesgo: 12_400,
        revenueEnRiesgoAnual: 14_880_000,
      },
    ],
    alertas: [
      {
        id: 'holdover',
        severity: 'critical',
        title: `${holdoversCount} contratos en holdover`,
        detail: `+52 días promedio · ${latest.montoHoldoverFacturadoMes.toLocaleString('es-MX')} MXN facturados`,
        actionPath: '/parks/renovaciones',
      },
      {
        id: 'vencimiento-30',
        severity: 'critical',
        title: '2 contratos vencen en <30 días sin acción',
        detail: '1,800 m² / $2.16M MXN revenue anual en riesgo',
        actionPath: '/parks/renovaciones',
      },
      {
        id: 'cartera-90',
        severity: 'warning',
        title: `Cartera +90 días: $${(latest.carteraMas90 / 1_000_000).toFixed(1)}M MXN`,
        detail: 'Priorizar cobranza y bloqueo de renovaciones con adeudo',
        actionPath: '/parks/cxc',
      },
    ],
  };
};

const buildBoard = (
  snapshots: CeoMonthlySnapshot[],
  latest: CeoMonthlySnapshot,
  previous: CeoMonthlySnapshot | undefined,
): CeoBoardSection => {
  const mrrTrend = trendFromSnapshots(snapshots, (snapshot) => snapshot.mrrTotalMxn);
  const last = mrrTrend[mrrTrend.length - 1];
  const mrrForecast: CeoTrendPoint[] = last
    ? [
        {
          mesAnio: '2026-07',
          label: 'Jul*',
          value: Math.round(last.value * 1.018),
        },
        {
          mesAnio: '2026-08',
          label: 'Ago*',
          value: Math.round(last.value * 1.032),
        },
        {
          mesAnio: '2026-09',
          label: 'Sep*',
          value: Math.round(last.value * 1.045),
        },
      ]
    : [];

  const notasCredito12m = snapshots.reduce(
    (total, snapshot) =>
      total +
      snapshot.montoNotasCreditoMes +
      snapshot.montoCondonacionesHoldoverMes,
    0,
  );
  const facturado12m = snapshots.reduce(
    (total, snapshot) => total + snapshot.montoFacturadoMes,
    0,
  );
  const cobrado12m = snapshots.reduce(
    (total, snapshot) => total + snapshot.montoCobradoMes,
    0,
  );
  const renovados = snapshots.reduce(
    (total, snapshot) => total + snapshot.contratosRenovadosMes,
    0,
  );
  const vencidos = snapshots.reduce(
    (total, snapshot) => total + snapshot.contratosVencidosMes,
    0,
  );

  return {
    ocupacionTrend: trendFromSnapshots(
      snapshots,
      (snapshot) => snapshot.porcentajeOcupacion,
    ),
    absorcionTrend: trendFromSnapshots(
      snapshots,
      (snapshot) => snapshot.absorcionNetaMes,
    ),
    ocupacionPorParque: [
      {
        parqueId: 'parque-gdl',
        parqueNombre: 'Parks Guadalajara',
        region: 'Occidente',
        metrosRentados: 92_400,
        metrosRentables: 102_000,
        porcentajeOcupacion: 90.6,
        variacionMensualPts: 1.2,
      },
      {
        parqueId: 'parque-qro',
        parqueNombre: 'Parks Querétaro',
        region: 'Bajío',
        metrosRentados: 118_200,
        metrosRentables: 135_000,
        porcentajeOcupacion: 87.6,
        variacionMensualPts: 0.4,
      },
      {
        parqueId: 'parque-mty',
        parqueNombre: 'Parks Monterrey',
        region: 'Norte',
        metrosRentados: 88_500,
        metrosRentables: 105_000,
        porcentajeOcupacion: 84.3,
        variacionMensualPts: -0.6,
      },
      {
        parqueId: 'parque-slp',
        parqueNombre: 'Parks San Luis',
        region: 'Bajío',
        metrosRentados: 76_290,
        metrosRentables: 88_000,
        porcentajeOcupacion: 86.7,
        variacionMensualPts: 0.8,
      },
    ],
    mrrTrend,
    mrrForecast,
    revenuePorM2: latest.revenuePorM2Rentado,
    revenuePorM2YoYPct: 4.2,
    ticketPromedioM2: latest.ticketPromedioM2,
    ticketDeltaPts: previous
      ? Number(
          (latest.ticketPromedioM2 - previous.ticketPromedioM2).toFixed(2),
        )
      : 0.02,
    noiPorM2: latest.noiPorM2,
    tasaRenovacionYtd:
      vencidos > 0 ? Number(((renovados / vencidos) * 100).toFixed(1)) : 86,
    metaRenovacion: 85,
    churnPorCausa: [
      {
        causa: 'No renovación — precio',
        m2Perdidos: 4_800,
        revenueAnualizado: 1_920_000,
        porcentajePortafolio: 1.3,
      },
      {
        causa: 'No renovación — competidor',
        m2Perdidos: 3_200,
        revenueAnualizado: 1_280_000,
        porcentajePortafolio: 0.9,
      },
      {
        causa: 'Cierre de operaciones del cliente',
        m2Perdidos: 5_100,
        revenueAnualizado: 2_040_000,
        porcentajePortafolio: 1.4,
      },
      {
        causa: 'Fin de contrato natural',
        m2Perdidos: 2_400,
        revenueAnualizado: 960_000,
        porcentajePortafolio: 0.6,
      },
      {
        causa: 'Expansión a otro parque Parks',
        m2Perdidos: 1_860,
        revenueAnualizado: 0,
        porcentajePortafolio: 0.5,
      },
    ],
    contratosPorVencer6m: [
      {
        mesAnio: '2026-07',
        contratos: 3,
        m2: 4_200,
        estatusRenovacionDominante: 'En negociación',
      },
      {
        mesAnio: '2026-08',
        contratos: 4,
        m2: 5_800,
        estatusRenovacionDominante: 'En contacto inicial',
      },
      {
        mesAnio: '2026-09',
        contratos: 2,
        m2: 3_100,
        estatusRenovacionDominante: 'Sin iniciar',
      },
      {
        mesAnio: '2026-10',
        contratos: 5,
        m2: 7_400,
        estatusRenovacionDominante: 'Hoja firmada',
      },
      {
        mesAnio: '2026-11',
        contratos: 3,
        m2: 4_900,
        estatusRenovacionDominante: 'En proceso legal',
      },
      {
        mesAnio: '2026-12',
        contratos: 4,
        m2: 6_200,
        estatusRenovacionDominante: 'Sin iniciar',
      },
    ],
    indiceCobranza12m:
      facturado12m > 0
        ? Number(((cobrado12m / facturado12m) * 100).toFixed(1))
        : 91,
    carteraAntiguedad: [
      { rango: '0-30 días', monto: latest.cartera0_30 },
      { rango: '31-60 días', monto: latest.cartera31_60 },
      { rango: '61-90 días', monto: latest.cartera61_90 },
      { rango: '+90 días', monto: latest.carteraMas90 },
    ],
    holdoversActivos: latest.contratosHoldoverActivos,
    holdoverMontoRiesgo: latest.montoHoldoverFacturadoMes,
    notasCredito12m,
    notasCreditoPctMrr: Number(
      ((notasCredito12m / (latest.mrrTotalMxn * 12)) * 100).toFixed(1),
    ),
    cicloVentaDias: latest.tiempoPromedioCicloVenta,
    slaCumplimientoPct: latest.porcentajeSlaCumplido,
    cicloLegalDias: latest.tiempoPromedioCicloLegal,
    slaLegalDias: 45,
    fuentesProspecto: [
      { canal: 'Broker', dealsCerrados: 11 },
      { canal: 'Directo / web', dealsCerrados: 6 },
      { canal: 'Referido', dealsCerrados: 4 },
      { canal: 'LoopNet / portales', dealsCerrados: 3 },
    ],
  };
};

export const ceoDashboardService = {
  getExecutiveDashboard: async (): Promise<CeoExecutiveDashboardResult> => {
    const snapshots = ceoDashboardStore.listSnapshots();
    const latest = ceoDashboardStore.getLatestSnapshot();
    const previous = ceoDashboardStore.getPreviousSnapshot();

    const cxcAccounts = cxcStore.listAccounts();
    const holdoversLive = cxcAccounts.filter(
      (account) =>
        account.holdover != null || account.cicloEstatus === 'Holdover',
    ).length;

    const daily = buildDaily(latest, previous, {
      holdoversLive: holdoversLive || undefined,
    });
    const board = buildBoard(snapshots, latest, previous);
    const inbox = await ceoInboxService.getInbox();

    if (inbox.total > 0) {
      daily.alertas = [
        {
          id: 'ceo-inbox',
          severity: 'critical',
          title:
            inbox.total === 1
              ? '1 acción pendiente de tu firma/aprobación'
              : `${inbox.total} acciones pendientes de tu firma/aprobación`,
          detail: `${inbox.aprobacionesComerciales} comerciales · ${inbox.condonaciones} condonaciones · ${inbox.firmas} firmas`,
          actionPath: '/parks/mis-pendientes',
        },
        ...daily.alertas.filter((alerta) => alerta.id !== 'ceo-inbox'),
      ];
    }

    return {
      generatedAt: new Date().toISOString(),
      asOfDate: latest.fechaSnapshot,
      currencyNote:
        'MRR consolidado en MXN con tipo de cambio de referencia del snapshot',
      daily,
      board,
      inbox,
      snapshots,
      kpisCatalog: [
        {
          id: 'kpi-1',
          name: '% Ocupación global',
          valueLabel: `${daily.ocupacionPct}%`,
          status: 'demo-snapshot',
        },
        {
          id: 'kpi-2',
          name: 'Absorción neta del mes',
          valueLabel: `${latest.absorcionNetaMes.toLocaleString('es-MX')} m²`,
          status: 'demo-snapshot',
        },
        {
          id: 'kpi-3',
          name: 'MRR',
          valueLabel: `$${(daily.mrrMxn / 1_000_000).toFixed(1)}M MXN`,
          status: 'demo-snapshot',
        },
        {
          id: 'kpi-4',
          name: 'Contratos en holdover',
          valueLabel: String(daily.holdoversCount),
          status: 'live',
        },
        {
          id: 'kpi-5',
          name: 'Contratos por vencer',
          valueLabel: `${daily.vencimientos[0].contratos} / 30d`,
          status: 'demo-snapshot',
        },
        {
          id: 'kpi-6',
          name: '% Cobranza del mes',
          valueLabel: `${daily.cobranzaMesPct}%`,
          status: 'demo-snapshot',
        },
        {
          id: 'kpi-7',
          name: 'Tasa de renovación',
          valueLabel: `${board.tasaRenovacionYtd}%`,
          status: 'demo-snapshot',
        },
        {
          id: 'kpi-8',
          name: 'Churn de m²',
          valueLabel: `${latest.m2ChurnMes.toLocaleString('es-MX')} m²`,
          status: 'demo-snapshot',
        },
        {
          id: 'kpi-9',
          name: 'Pipeline m² / MRR ponderado',
          valueLabel: `${daily.pipelineM2.toLocaleString('es-MX')} m²`,
          status: 'demo-snapshot',
        },
        {
          id: 'kpi-10',
          name: 'Ciclo de venta',
          valueLabel: `${board.cicloVentaDias} días`,
          status: 'demo-snapshot',
        },
        {
          id: 'kpi-11',
          name: 'Ticket promedio USD/m²',
          valueLabel: `$${board.ticketPromedioM2}`,
          status: 'demo-snapshot',
        },
        {
          id: 'kpi-12',
          name: 'Revenue por m² rentado',
          valueLabel: `$${board.revenuePorM2}`,
          status: 'demo-snapshot',
        },
        {
          id: 'kpi-13',
          name: 'Índice cobranza 12m',
          valueLabel: `${board.indiceCobranza12m}%`,
          status: 'demo-snapshot',
        },
        {
          id: 'kpi-14',
          name: 'Notas de crédito / condonaciones',
          valueLabel: `$${(board.notasCredito12m / 1_000_000).toFixed(1)}M`,
          status: 'demo-snapshot',
        },
        {
          id: 'kpi-15',
          name: 'SLA legal',
          valueLabel: `${board.slaCumplimientoPct}%`,
          status: 'demo-snapshot',
        },
        {
          id: 'kpi-16',
          name: 'NOI por m² (estimado)',
          valueLabel: `$${board.noiPorM2}`,
          status: 'demo-snapshot',
        },
      ],
    };
  },
};
