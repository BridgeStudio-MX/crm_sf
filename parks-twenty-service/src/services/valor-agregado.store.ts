import { type OfertaRenovacionAnticipada } from '../types/valor-agregado.types';
import {
  type BrokerInactividad,
  type BrokerOutreachAlert,
  type ChecklistVigenciaResumen,
  type ConcentracionParque,
  type ExpansionOportunidad,
  type LeadResponseMetric,
  type MatchAutoResult,
  type RoiCanalFila,
} from '../types/valor-agregado.types';

const daysFromNow = (days: number): string => {
  const date = new Date();
  date.setDate(date.getDate() + days);
  return date.toISOString().slice(0, 10);
};

const daysAgo = (days: number): string => daysFromNow(-days);

const hoursAgoIso = (hours: number): string => {
  const date = new Date();
  date.setHours(date.getHours() - hours);
  return date.toISOString();
};

const buildDemoChecklist = (): ChecklistVigenciaResumen[] => [
  {
    casoLegalId: 'caso-vigencia-sat',
    empresa: 'LogiMex S.A. de C.V.',
    checklistDocumentosVigentes: false,
    documentosConAlerta:
      'Constancia obligaciones vence en 8 días, INE representante vencido',
    documentos: [
      {
        documentoChecklistId: 'doc-acta',
        tipoDocumento: 'Acta constitutiva',
        entregado: true,
        fechaEntrega: daysAgo(120),
        fechaVencimiento: null,
        vigenciaEstatus: 'Sin fecha',
      },
      {
        documentoChecklistId: 'doc-sat',
        tipoDocumento: 'Constancia obligaciones',
        entregado: true,
        fechaEntrega: daysAgo(22),
        fechaVencimiento: daysFromNow(8),
        vigenciaEstatus: 'Por vencer',
        diasParaVencer: 8,
      },
      {
        documentoChecklistId: 'doc-ine',
        tipoDocumento: 'INE representante',
        entregado: true,
        fechaEntrega: daysAgo(200),
        fechaVencimiento: daysAgo(5),
        vigenciaEstatus: 'Vencido',
        diasParaVencer: -5,
      },
      {
        documentoChecklistId: 'doc-csf',
        tipoDocumento: 'CSF',
        entregado: true,
        fechaEntrega: daysAgo(10),
        fechaVencimiento: daysFromNow(80),
        vigenciaEstatus: 'Vigente',
        diasParaVencer: 80,
      },
    ],
  },
  {
    casoLegalId: 'caso-vigencia-ok',
    empresa: 'Manufactura GDL S.A.',
    checklistDocumentosVigentes: true,
    documentosConAlerta: '',
    documentos: [
      {
        documentoChecklistId: 'doc-ok-sat',
        tipoDocumento: 'Constancia obligaciones',
        entregado: true,
        fechaEntrega: daysAgo(5),
        fechaVencimiento: daysFromNow(25),
        vigenciaEstatus: 'Vigente',
        diasParaVencer: 25,
      },
    ],
  },
];

const buildDemoExpansiones = (): ExpansionOportunidad[] => [
  {
    id: 'exp-nestle',
    inquilinoNombre: 'Nestlé México',
    naveActual: 'Nave 4',
    parqueNombre: 'Parks Bajío',
    mesesOcupado: 22,
    navesDisponibles: [
      { identificador: 'Nave 7', m2: 4_500, precioBaseUsd: 0.92 },
      { identificador: 'Nave 9', m2: 6_200, precioBaseUsd: 0.88 },
    ],
    taskCreated: true,
  },
];

const buildDemoConcentracion = (): ConcentracionParque[] => [
  {
    parqueNombre: 'Parks Guadalajara Norte',
    m2Totales: 120_000,
    umbralPct: 20,
    contratosProximos90d: 4,
    m2EnRiesgo: 35_000,
    porcentajeRiesgo: 29.2,
    alerta: true,
    contratos: [
      {
        empresa: 'Coca-Cola FEMSA',
        fechaVencimiento: daysFromNow(45),
        m2: 12_500,
      },
      {
        empresa: 'LogiMex',
        fechaVencimiento: daysFromNow(60),
        m2: 8_500,
      },
      {
        empresa: 'ColdChain MX',
        fechaVencimiento: daysFromNow(75),
        m2: 7_000,
      },
      {
        empresa: 'Autopartes GDL',
        fechaVencimiento: daysFromNow(88),
        m2: 7_000,
      },
    ],
  },
  {
    parqueNombre: 'Parks Monterrey',
    m2Totales: 95_000,
    umbralPct: 20,
    contratosProximos90d: 1,
    m2EnRiesgo: 6_000,
    porcentajeRiesgo: 6.3,
    alerta: false,
    contratos: [
      {
        empresa: 'YulLogisticas',
        fechaVencimiento: daysFromNow(40),
        m2: 6_000,
      },
    ],
  },
];

const buildDemoRoi = (): RoiCanalFila[] => [
  {
    canalOrigen: 'Referido',
    totalOportunidades: 18,
    dealsCerrados: 9,
    tasaCierrePct: 50,
    diasCicloPromedio: 42,
    rentaPromedioUsd: 38_500,
    costoComisionesUsd: 0,
    revenueAnualizadoUsd: 4_158_000,
  },
  {
    canalOrigen: 'Broker',
    totalOportunidades: 40,
    dealsCerrados: 12,
    tasaCierrePct: 30,
    diasCicloPromedio: 78,
    rentaPromedioUsd: 52_000,
    costoComisionesUsd: 186_000,
    revenueAnualizadoUsd: 7_488_000,
  },
  {
    canalOrigen: 'LinkedIn',
    totalOportunidades: 25,
    dealsCerrados: 5,
    tasaCierrePct: 20,
    diasCicloPromedio: 95,
    rentaPromedioUsd: 29_000,
    costoComisionesUsd: 0,
    revenueAnualizadoUsd: 1_740_000,
  },
  {
    canalOrigen: 'Página web',
    totalOportunidades: 32,
    dealsCerrados: 4,
    tasaCierrePct: 12.5,
    diasCicloPromedio: 110,
    rentaPromedioUsd: 24_000,
    costoComisionesUsd: 0,
    revenueAnualizadoUsd: 1_152_000,
  },
];

const buildDemoOfertas = (): OfertaRenovacionAnticipada[] => {
  const now = new Date().toISOString();

  return [
    {
      id: 'oferta-demo-1',
      casoLegalId: 'caso-renov-logimex',
      empresa: 'LogiMex S.A. de C.V.',
      loNombre: 'Tim Apple',
      tipoIncentivo: 'Días de gracia adicionales',
      diasGraciaAdicionales: 15,
      observaciones: 'Si renueva antes del vencimiento',
      fechaOferta: daysAgo(5),
      fechaVencimientoOferta: daysFromNow(25),
      estatus: 'Enviada al cliente',
      createdAt: now,
      updatedAt: now,
    },
    {
      id: 'oferta-demo-2',
      casoLegalId: 'caso-renov-femsa',
      empresa: 'Coca-Cola FEMSA',
      loNombre: 'Tim Apple',
      tipoIncentivo: 'Descuento en renta',
      descuentoPorcentaje: 3,
      fechaOferta: daysAgo(40),
      fechaVencimientoOferta: daysAgo(10),
      estatus: 'Expirada',
      createdAt: now,
      updatedAt: now,
    },
  ];
};

const buildDemoMatches = (): MatchAutoResult[] => [
  {
    opportunityId: 'opp-match-retail',
    opportunityName: 'DEMO-Opp — Cotización Retail',
    matchCount: 3,
    notified: true,
    matchNavesSugeridas: `🏭 BOD-GDL-N-04 — Parks Guadalajara Norte
8496 m² | $0.95 USD/m²/mes
Disponible: Inmediata
Match: 92%
———
🏭 BOD-GDL-N-07 — Parks Guadalajara Norte
7200 m² | $0.90 USD/m²/mes
Disponible: Inmediata
Match: 85%
———
🏭 BOD-SALTO-02 — El Salto Park III
9000 m² | $0.88 USD/m²/mes
Disponible: 45 días
Match: 78%`,
  },
];

const buildDemoLeadResponses = (): LeadResponseMetric[] => [
  {
    opportunityId: 'lead-resp-1',
    nombre: 'Traviata — Guadalajara',
    leasingOfficer: 'Tim Apple',
    createdAt: hoursAgoIso(6),
    fechaPrimeraActividad: hoursAgoIso(4),
    tiempoPrimeraRespuestaHoras: 2,
    semaforo: 'Excelente',
  },
  {
    opportunityId: 'lead-resp-2',
    nombre: 'Test Co — Monterrey',
    leasingOfficer: 'Tim Apple',
    createdAt: hoursAgoIso(30),
    fechaPrimeraActividad: hoursAgoIso(12),
    tiempoPrimeraRespuestaHoras: 18,
    semaforo: 'Regular',
  },
  {
    opportunityId: 'lead-resp-3',
    nombre: 'Prospecto sin contacto',
    leasingOfficer: 'Israel Ramírez',
    createdAt: hoursAgoIso(60),
    fechaPrimeraActividad: null,
    tiempoPrimeraRespuestaHoras: null,
    semaforo: 'Sin contacto',
  },
];

const buildDemoBrokerAlerts = (): BrokerOutreachAlert[] => [
  {
    id: 'broker-alert-1',
    brokerId: 'broker-newmark',
    brokerEmpresa: 'Newmark Parks Top',
    brokerEmail: 'broker@newmark.demo',
    naveIdentificador: 'BOD-GDL-N-12',
    parqueNombre: 'Parks Guadalajara Norte',
    m2: 5_400,
    precioBaseUsd: 0.95,
    sentAt: new Date().toISOString(),
    draftMailto:
      'mailto:broker@newmark.demo?subject=Disponibilidad%20exclusiva%20%E2%80%94%20BOD-GDL-N-12',
  },
];

const buildDemoBrokerInactivos = (): BrokerInactividad[] => [
  {
    brokerId: 'broker-jll-inactivo',
    empresa: 'JLL Industrial MX',
    clasificacion: 'Top 10',
    diasSinActividad: 52,
    ultimaActividadFecha: daysAgo(52),
    zonasOperacion: 'Guadalajara, Bajío',
  },
  {
    brokerId: 'broker-cbre',
    empresa: 'CBRE Parks',
    clasificacion: 'Top 10',
    diasSinActividad: 12,
    ultimaActividadFecha: daysAgo(12),
    zonasOperacion: 'Monterrey, Norte',
  },
];

type ValorAgregadoStoreState = {
  checklist: ChecklistVigenciaResumen[];
  expansiones: ExpansionOportunidad[];
  concentracion: ConcentracionParque[];
  roiCanal: RoiCanalFila[];
  ofertas: OfertaRenovacionAnticipada[];
  matches: MatchAutoResult[];
  leadResponses: LeadResponseMetric[];
  brokerAlerts: BrokerOutreachAlert[];
  brokerInactivos: BrokerInactividad[];
  // Runtime overlays keyed by real caso/doc ids
  vencimientosByDocId: Map<string, string>;
};

const createInitialState = (): ValorAgregadoStoreState => ({
  checklist: buildDemoChecklist(),
  expansiones: buildDemoExpansiones(),
  concentracion: buildDemoConcentracion(),
  roiCanal: buildDemoRoi(),
  ofertas: buildDemoOfertas(),
  matches: buildDemoMatches(),
  leadResponses: buildDemoLeadResponses(),
  brokerAlerts: buildDemoBrokerAlerts(),
  brokerInactivos: buildDemoBrokerInactivos(),
  vencimientosByDocId: new Map(),
});

let state = createInitialState();

export const valorAgregadoStore = {
  getState: (): ValorAgregadoStoreState => state,
  resetDemo: (): void => {
    state = createInitialState();
  },
  setVencimiento: (documentoChecklistId: string, fechaVencimiento: string) => {
    state.vencimientosByDocId.set(documentoChecklistId, fechaVencimiento);
  },
  getVencimiento: (documentoChecklistId: string): string | undefined =>
    state.vencimientosByDocId.get(documentoChecklistId),
  upsertOferta: (oferta: OfertaRenovacionAnticipada) => {
    const index = state.ofertas.findIndex((item) => item.id === oferta.id);

    if (index >= 0) {
      state.ofertas[index] = oferta;
    } else {
      state.ofertas = [oferta, ...state.ofertas];
    }
  },
  listOfertas: (): OfertaRenovacionAnticipada[] => [...state.ofertas],
  getOferta: (ofertaId: string): OfertaRenovacionAnticipada | undefined =>
    state.ofertas.find((item) => item.id === ofertaId),
  pushMatch: (match: MatchAutoResult) => {
    state.matches = [
      match,
      ...state.matches.filter((item) => item.opportunityId !== match.opportunityId),
    ];
  },
  pushBrokerAlert: (alert: BrokerOutreachAlert) => {
    state.brokerAlerts = [alert, ...state.brokerAlerts];
  },
  upsertLeadResponse: (metric: LeadResponseMetric) => {
    const index = state.leadResponses.findIndex(
      (item) => item.opportunityId === metric.opportunityId,
    );

    if (index >= 0) {
      state.leadResponses[index] = metric;
    } else {
      state.leadResponses = [metric, ...state.leadResponses];
    }
  },
  setChecklist: (items: ChecklistVigenciaResumen[]) => {
    state.checklist = items;
  },
};
