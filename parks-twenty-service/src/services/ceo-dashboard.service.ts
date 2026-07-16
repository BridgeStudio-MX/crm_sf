import {
  PARKS_LEGAL_SLA_DAYS,
  PARKS_LEGAL_SLA_META_PCT,
  PARKS_OCUPACION_METAS,
  PARKS_RENOVACION_INCREMENTO_META_PCT,
  type ParksPortfolioSegment,
} from '../constants/parks-executive.constants';
import { ceoDashboardStore } from './ceo-dashboard.store';
import { ceoInboxService } from './ceo-inbox.service';
import { cxcStore } from './cxc.store';
import { performanceWeightsStore } from './performance-weights.store';
import {
  type CeoBoardSection,
  type CeoDailyKpis,
  type CeoExecutiveDashboardResult,
  type CeoExecutiveIndicators,
  type CeoMonthlySnapshot,
  type CeoPortfolioSegment,
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

const resolveSnapshotForFilters = (
  snapshots: CeoMonthlySnapshot[],
  year?: number,
  month?: number,
): { latest: CeoMonthlySnapshot; previous?: CeoMonthlySnapshot } => {
  if (!year || !month) {
    const latest = snapshots[snapshots.length - 1];
    const previous =
      snapshots.length > 1 ? snapshots[snapshots.length - 2] : undefined;

    return { latest, previous };
  }

  const mesAnio = `${year}-${String(month).padStart(2, '0')}`;
  const index = snapshots.findIndex((snapshot) => snapshot.mesAnio === mesAnio);

  if (index >= 0) {
    return {
      latest: snapshots[index],
      previous: index > 0 ? snapshots[index - 1] : undefined,
    };
  }

  const latest = snapshots[snapshots.length - 1];
  const previous =
    snapshots.length > 1 ? snapshots[snapshots.length - 2] : undefined;

  return { latest, previous };
};

const buildIndicators = (
  latest: CeoMonthlySnapshot,
  previous: CeoMonthlySnapshot | undefined,
  filters: {
    year: number;
    month: number;
    segmento: CeoPortfolioSegment;
  },
): CeoExecutiveIndicators => {
  // Segment filter reserved for TOTAL | INDUSTRIAL — seed data is TOTAL-shaped.
  const segmentFactor = filters.segmento === 'INDUSTRIAL' ? 0.92 : 1;
  const weights = performanceWeightsStore.get();

  const ocupacionTerminados = latest.porcentajeOcupacion * segmentFactor;
  const ocupacionConstruccion = Math.min(
    100,
    (latest.metrosEnConstruccion > 0
      ? (latest.metrosRentados * 0.18) / latest.metrosEnConstruccion
      : 0.42) *
      100 *
      segmentFactor,
  );
  const ocupacionProyectados = 18 * segmentFactor;

  const comercialScore = Math.min(
    100,
    ocupacionTerminados * 0.4 +
      latest.tasaRenovacionMes * 0.3 +
      Math.max(0, 50 + (previous
        ? ((latest.contratosNuevosMes - previous.contratosNuevosMes) /
            Math.max(previous.contratosNuevosMes, 1)) *
          50
        : 10)) *
        0.3,
  );
  const cxcScore = latest.porcentajeCobranzaMes;
  const legalScore = latest.porcentajeSlaCumplido;
  const marketingScore = Math.min(
    100,
    latest.tasaConversionLeadContrato * 100,
  );
  const direccionScore = 72;

  const performanceAreas = [
    {
      area: 'Comercial',
      ponderacionPct: weights.COMERCIAL,
      scorePct: Number(comercialScore.toFixed(1)),
    },
    {
      area: 'CxC',
      ponderacionPct: weights.CXC,
      scorePct: Number(cxcScore.toFixed(1)),
    },
    {
      area: 'Legal',
      ponderacionPct: weights.LEGAL,
      scorePct: Number(legalScore.toFixed(1)),
    },
    {
      area: 'Marketing',
      ponderacionPct: weights.MARKETING,
      scorePct: Number(marketingScore.toFixed(1)),
    },
    {
      area: 'Dirección',
      ponderacionPct: weights.DIRECCION,
      scorePct: direccionScore,
    },
  ];

  const performanceConsolidadoPct = Number(
    (
      performanceAreas.reduce(
        (sum, area) => sum + (area.scorePct * area.ponderacionPct) / 100,
        0,
      )
    ).toFixed(1),
  );

  const m2AnteriorTerminados = previous?.metrosRentablesTotales ?? latest.metrosRentablesTotales;
  const varTerminados =
    m2AnteriorTerminados > 0
      ? Number(
          (
            ((latest.metrosRentablesTotales - m2AnteriorTerminados) /
              m2AnteriorTerminados) *
            100
          ).toFixed(1),
        )
      : 0;

  const litigiosBase = [
    { categoria: 'Extrajudicial', enProceso: 2 },
    { categoria: 'De 0 a 6 meses', enProceso: 3 },
    { categoria: 'De 6 a 12 meses', enProceso: 1 },
    { categoria: 'De 12 a 24 meses', enProceso: 1 },
    { categoria: 'Más de 24 meses', enProceso: 0 },
  ];
  const litigiosTotal = litigiosBase.reduce(
    (sum, row) => sum + row.enProceso,
    0,
  );

  const contratosNoRenovados = Math.max(
    0,
    latest.contratosVencidosMes - latest.contratosRenovadosMes,
  );
  const m2NoRenovados = latest.m2ChurnMes;
  const baseRenovables = Math.max(
    latest.contratosRenovadosMes + contratosNoRenovados,
    1,
  );

  return {
    filters,
    performanceConsolidadoPct,
    performanceAreas,
    performanceFormulaNote:
      'Fórmula ilustrativa de Performance — pendiente validar el cálculo real',
    ocupacion: [
      {
        key: 'terminados',
        label: 'M² Terminados',
        ocupacionPct: Number(ocupacionTerminados.toFixed(1)),
        metaPct: PARKS_OCUPACION_METAS.M2_TERMINADOS,
        m2Totales: Math.round(latest.metrosRentablesTotales * segmentFactor),
        m2Rentados: Math.round(latest.metrosRentados * segmentFactor),
        m2Disponibles: Math.round(latest.metrosDisponibles * segmentFactor),
        m2Anterior: Math.round(m2AnteriorTerminados * segmentFactor),
        variacionPct: varTerminados,
      },
      {
        key: 'construccion',
        label: 'M² en Construcción',
        ocupacionPct: Number(ocupacionConstruccion.toFixed(1)),
        metaPct: PARKS_OCUPACION_METAS.M2_CONSTRUCCION,
        m2Totales: Math.round(latest.metrosEnConstruccion * segmentFactor),
        m2Rentados: Math.round(latest.metrosEnConstruccion * 0.42 * segmentFactor),
        m2Disponibles: Math.round(
          latest.metrosEnConstruccion * 0.58 * segmentFactor,
        ),
        m2Anterior: Math.round(
          (previous?.metrosEnConstruccion ?? latest.metrosEnConstruccion) *
            segmentFactor,
        ),
        variacionPct: previous
          ? Number(
              (
                ((latest.metrosEnConstruccion - previous.metrosEnConstruccion) /
                  Math.max(previous.metrosEnConstruccion, 1)) *
                100
              ).toFixed(1),
            )
          : 0,
      },
      {
        key: 'proyectados',
        label: 'M² Proyectados',
        ocupacionPct: Number(ocupacionProyectados.toFixed(1)),
        metaPct: PARKS_OCUPACION_METAS.M2_PROYECTADOS,
        m2Totales: Math.round(12_000 * segmentFactor),
        m2Rentados: Math.round(2_160 * segmentFactor),
        m2Disponibles: Math.round(9_840 * segmentFactor),
        m2Anterior: Math.round(11_500 * segmentFactor),
        variacionPct: 4.3,
      },
    ],
    ocupacionMetaTerminados: PARKS_OCUPACION_METAS.M2_TERMINADOS,
    litigios: litigiosBase.map((row) => ({
      ...row,
      porcentaje:
        litigiosTotal > 0
          ? Number(((row.enProceso / litigiosTotal) * 100).toFixed(2))
          : 0,
    })),
    contratosNoRenovados,
    m2NoRenovados,
    pctNoRenovados: Number(
      ((contratosNoRenovados / baseRenovables) * 100).toFixed(1),
    ),
    renovacionIncrementoPct: Number(
      (latest.tasaRenovacionMes * 0.18).toFixed(1),
    ),
    renovacionIncrementoMetaPct: PARKS_RENOVACION_INCREMENTO_META_PCT,
    renovacionesFirmadasAntesVencerPct: Number(
      (latest.tasaRenovacionMes * 0.9).toFixed(1),
    ),
    renovacionesFirmadasMetaPct: PARKS_LEGAL_SLA_META_PCT,
    hojasAcuerdoNuevos: latest.contratosNuevosMes + 2,
    hojasAcuerdoRenovacion: latest.contratosRenovadosMes + 1,
    varContratosNuevosPct: previous
      ? Number(
          (
            ((latest.contratosNuevosMes - previous.contratosNuevosMes) /
              Math.max(previous.contratosNuevosMes, 1)) *
            100
          ).toFixed(1),
        )
      : 0,
    varM2RentadosPct: previous
      ? Number(
          (
            ((latest.metrosNuevosMes - previous.metrosNuevosMes) /
              Math.max(previous.metrosNuevosMes, 1)) *
            100
          ).toFixed(1),
        )
      : 0,
    varValorM2MxnPct: 1.8,
    varValorM2UsdPct: 0.6,
    varAnosPromedioRentaPct: -2.1,
    legalSla: [
      {
        key: 'nuevos-terminadas',
        label: 'Contratos nuevos · naves terminadas',
        cumplimientoPct: Number((legalScore * 0.95).toFixed(1)),
        metaPct: PARKS_LEGAL_SLA_META_PCT,
        diasPromedioCierre: 38,
        metaDiasCierre: PARKS_LEGAL_SLA_DAYS.CONTRATOS_NUEVOS_NAVES_TERMINADAS,
        abiertos: 4,
        fueraDeTiempo: 1,
      },
      {
        key: 'nuevos-construccion',
        label: 'Contratos nuevos · naves en construcción',
        cumplimientoPct: Number((legalScore * 0.88).toFixed(1)),
        metaPct: PARKS_LEGAL_SLA_META_PCT,
        diasPromedioCierre: 71,
        metaDiasCierre:
          PARKS_LEGAL_SLA_DAYS.CONTRATOS_NUEVOS_NAVES_EN_CONSTRUCCION,
        abiertos: 2,
        fueraDeTiempo: 0,
      },
      {
        key: 'renovaciones',
        label: 'Renovaciones',
        cumplimientoPct: Number((legalScore * 0.92).toFixed(1)),
        metaPct: PARKS_LEGAL_SLA_META_PCT,
        diasPromedioCierre: 41,
        metaDiasCierre: PARKS_LEGAL_SLA_DAYS.RENOVACIONES,
        abiertos: 5,
        fueraDeTiempo: 2,
      },
      {
        key: 'post-contrato',
        label: 'Documentos post contrato',
        cumplimientoPct: Number((legalScore * 0.97).toFixed(1)),
        metaPct: PARKS_LEGAL_SLA_META_PCT,
        diasPromedioCierre: 22,
        metaDiasCierre: PARKS_LEGAL_SLA_DAYS.DOCUMENTOS_POST_CONTRATO,
        abiertos: 3,
        fueraDeTiempo: 0,
      },
    ],
    ultimaActualizacionLabel: latest.fechaSnapshot,
  };
};

export const ceoDashboardService = {
  getExecutiveDashboard: async (input?: {
    year?: number;
    month?: number;
    segmento?: ParksPortfolioSegment;
  }): Promise<CeoExecutiveDashboardResult> => {
    const snapshots = ceoDashboardStore.listSnapshots();
    const now = new Date();
    const year = input?.year ?? now.getFullYear();
    const month = input?.month ?? now.getMonth() + 1;
    const segmento: CeoPortfolioSegment = input?.segmento ?? 'TOTAL';

    const { latest, previous } = resolveSnapshotForFilters(
      snapshots,
      year,
      month,
    );

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
    const indicators = buildIndicators(latest, previous, {
      year,
      month,
      segmento,
    });

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
      indicators,
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
