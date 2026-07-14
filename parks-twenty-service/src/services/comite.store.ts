import { envConfig } from '../config/env.config';
import {
  type ComiteAutorizacion,
  type ComiteConfig,
  type ComiteDealSnapshot,
  type ComiteMiembroSeat,
  type ComitePregunta,
  type ComiteSemaforoPrecio,
} from '../types/comite.types';

export const DEFAULT_COMITE_CONFIG: ComiteConfig = {
  slaHorasHabiles: envConfig.parksComiteSlaHoras,
  semaforoVerdeMaxPct: envConfig.parksComiteSemaforoVerdeMaxPct,
  semaforoAmarilloMaxPct: envConfig.parksComiteSemaforoAmarilloMaxPct,
  recordatorioHorasAntes: 8,
};

export const DEFAULT_COMITE_MEMBERS: Array<
  Omit<ComiteMiembroSeat, 'voto' | 'fechaVoto' | 'comentario'>
> = [
  {
    memberId: 'comite-m1',
    seatIndex: 1,
    nombre: 'Héctor Montelongo',
    rolEtiqueta: 'Director Comercial',
    email: 'phil.schiler@apple.dev',
  },
  {
    memberId: 'comite-m2',
    seatIndex: 2,
    nombre: 'Laura Fernández',
    rolEtiqueta: 'Director Financiero',
    email: 'director.financiero@parksindustrial.com',
  },
  {
    memberId: 'comite-m3',
    seatIndex: 3,
    nombre: 'Ricardo Campos',
    rolEtiqueta: 'Director de Operaciones',
    email: 'director.operaciones@parksindustrial.com',
  },
];

const hoursFromNow = (hours: number): string => {
  const date = new Date();
  date.setHours(date.getHours() + hours);
  return date.toISOString();
};

const hoursAgo = (hours: number): string => hoursFromNow(-hours);

export const computeDescuentoPorcentaje = (
  precioListaM2: number,
  precioAcordadoM2: number,
): number => {
  if (precioListaM2 <= 0) {
    return 0;
  }

  return Number(
    (((precioListaM2 - precioAcordadoM2) / precioListaM2) * 100).toFixed(1),
  );
};

export const computeSemaforoPrecio = (
  descuentoPorcentaje: number,
  config: ComiteConfig = DEFAULT_COMITE_CONFIG,
): ComiteSemaforoPrecio => {
  if (descuentoPorcentaje <= config.semaforoVerdeMaxPct) {
    return 'Verde';
  }

  if (descuentoPorcentaje <= config.semaforoAmarilloMaxPct) {
    return 'Amarillo';
  }

  return 'Rojo';
};

export const hydrateDealSnapshot = (
  partial: Partial<ComiteDealSnapshot> & {
    clienteRazonSocial: string;
    naveNomenclatura: string;
    glaM2: number;
    precioAcordadoM2: number;
    plazoMeses: number;
  },
  config: ComiteConfig = DEFAULT_COMITE_CONFIG,
): ComiteDealSnapshot => {
  const precioListaM2 = partial.precioListaM2 ?? partial.precioAcordadoM2;
  const descuentoPorcentaje =
    partial.descuentoPorcentaje ??
    computeDescuentoPorcentaje(precioListaM2, partial.precioAcordadoM2);
  const rentaMensual =
    partial.rentaMensual ??
    Number((partial.glaM2 * partial.precioAcordadoM2).toFixed(2));

  return {
    parqueNombre: partial.parqueNombre ?? 'Parks Industrial',
    naveNomenclatura: partial.naveNomenclatura,
    esPropiedadFuno: partial.esPropiedadFuno ?? false,
    clienteRazonSocial: partial.clienteRazonSocial,
    clienteGiro: partial.clienteGiro ?? 'Manufactura',
    clienteHistorialParks: partial.clienteHistorialParks ?? false,
    clienteAdeudosActivos: partial.clienteAdeudosActivos ?? false,
    glaM2: partial.glaM2,
    precioListaM2,
    precioAcordadoM2: partial.precioAcordadoM2,
    descuentoPorcentaje,
    rentaMensual,
    moneda: partial.moneda ?? 'USD',
    semaforoPrecio:
      partial.semaforoPrecio ??
      computeSemaforoPrecio(descuentoPorcentaje, config),
    plazoMeses: partial.plazoMeses,
    periodoGraciaMeses: partial.periodoGraciaMeses ?? 0,
    depositosGarantiaMeses: partial.depositosGarantiaMeses ?? 2,
    rentasAdelantadasMeses: partial.rentasAdelantadasMeses ?? 1,
    prorrogaMeses: partial.prorrogaMeses ?? 0,
    guantePactado: partial.guantePactado ?? 0,
    mantenimientoPactado: partial.mantenimientoPactado ?? 0,
    incrementoTipo: partial.incrementoTipo ?? 'INPC',
    incrementoValor: partial.incrementoValor ?? 0,
    rentaContratoAnterior: partial.rentaContratoAnterior,
    brokerNombre: partial.brokerNombre ?? 'Sin broker',
    brokerClasificacion: partial.brokerClasificacion ?? 'Sin broker',
    condicionesEspeciales: partial.condicionesEspeciales ?? '',
    observacionesEntregaNave: partial.observacionesEntregaNave ?? '',
  };
};

const buildPendingMembers = (): [
  ComiteMiembroSeat,
  ComiteMiembroSeat,
  ComiteMiembroSeat,
] =>
  DEFAULT_COMITE_MEMBERS.map((member) => ({
    ...member,
    voto: 'Pendiente' as const,
  })) as [ComiteMiembroSeat, ComiteMiembroSeat, ComiteMiembroSeat];

export const buildDemoComites = (): ComiteAutorizacion[] => {
  const now = new Date().toISOString();
  const config = DEFAULT_COMITE_CONFIG;

  const femsaDeal = hydrateDealSnapshot(
    {
      parqueNombre: 'Parks Guadalajara Norte',
      naveNomenclatura: 'BOD-GDL-N-04',
      esPropiedadFuno: false,
      clienteRazonSocial: 'Coca-Cola FEMSA S.A. de C.V.',
      clienteGiro: 'Almacenamiento y Distribución',
      clienteHistorialParks: true,
      clienteAdeudosActivos: false,
      glaM2: 12_500,
      precioListaM2: 95,
      precioAcordadoM2: 82,
      plazoMeses: 60,
      periodoGraciaMeses: 3,
      depositosGarantiaMeses: 2,
      rentasAdelantadasMeses: 2,
      guantePactado: 150_000,
      brokerNombre: 'Christian Lua',
      brokerClasificacion: 'Top 10',
      condicionesEspeciales:
        'Cliente requiere pintura epoxi en piso de almacén. Parks asume el costo estimado $45,000 USD',
      observacionesEntregaNave: 'Entrega en 45 días hábiles',
    },
    config,
  );

  const femsaMembers = buildPendingMembers();
  femsaMembers[0] = {
    ...femsaMembers[0],
    voto: 'Aprueba',
    fechaVoto: hoursAgo(3),
    comentario: 'Condiciones comerciales alineadas con estrategia GDL Norte.',
  };

  const femsaPreguntas: ComitePregunta[] = [
    {
      id: 'preg-femsa-1',
      preguntaPorMemberId: 'comite-m2',
      preguntaPorNombre: 'Laura Fernández',
      fechaPregunta: hoursAgo(2),
      preguntaTexto:
        '¿El costo del epoxi está ya descontado de la renta o es un costo adicional para Parks?',
      resuelta: false,
    },
  ];

  const logimexMembers = buildPendingMembers();
  logimexMembers[0] = {
    ...logimexMembers[0],
    voto: 'Aprueba',
    fechaVoto: hoursAgo(26),
  };
  logimexMembers[1] = {
    ...logimexMembers[1],
    voto: 'Aprueba',
    fechaVoto: hoursAgo(20),
  };
  logimexMembers[2] = {
    ...logimexMembers[2],
    voto: 'Rechaza',
    fechaVoto: hoursAgo(18),
    comentario:
      'El período de gracia de 2 meses es el máximo aceptable. Recomendaría reducirlo a 1.',
  };

  const xyzMembers = buildPendingMembers();
  xyzMembers[0] = {
    ...xyzMembers[0],
    voto: 'Aprueba',
    fechaVoto: hoursAgo(30),
    comentario: 'El cliente es estratégico para el parque',
  };
  xyzMembers[1] = {
    ...xyzMembers[1],
    voto: 'Rechaza',
    fechaVoto: hoursAgo(28),
    comentario:
      'Descuento del 18% supera el umbral autorizado de 10%. El deal no es rentable a este precio.',
  };
  xyzMembers[2] = {
    ...xyzMembers[2],
    voto: 'Rechaza',
    fechaVoto: hoursAgo(27),
    comentario:
      'La entrega en 15 días no es viable. Necesitamos al menos 30 días para las adecuaciones solicitadas.',
  };

  const samsungMembers = buildPendingMembers();
  samsungMembers[0] = {
    ...samsungMembers[0],
    voto: 'Aprueba',
    fechaVoto: hoursAgo(12),
  };
  samsungMembers[1] = {
    ...samsungMembers[1],
    voto: 'Rechaza',
    fechaVoto: hoursAgo(10),
    comentario: 'El guante de $500K USD es muy alto',
  };
  samsungMembers[2] = {
    ...samsungMembers[2],
    voto: 'Se abstiene',
    fechaVoto: hoursAgo(8),
    comentario:
      'No tengo suficiente información sobre los requerimientos técnicos del build-to-suit',
  };

  return [
    {
      id: 'comite-demo-femsa',
      referencia: 'COM-2026-0047',
      opportunityId: 'opp-demo-femsa',
      opportunityName: 'Coca-Cola FEMSA — GDL Norte',
      hojaDeAcuerdosId: 'hoja-demo-femsa',
      leasingOfficerNombre: 'Israel Ramírez',
      cemQueFirmoNombre: 'Héctor Montelongo',
      fechaCreacion: hoursAgo(26),
      fechaLimiteResolucion: hoursFromNow(22),
      estatus: 'Abierto — en deliberación',
      deal: femsaDeal,
      miembros: femsaMembers,
      votosAprueba: 1,
      votosRechaza: 0,
      votosPendientes: 2,
      votosAbstiene: 0,
      resolucion: 'Pendiente',
      preguntas: femsaPreguntas,
      auditoria: [
        `${hoursAgo(26)} Comité abierto — notificación enviada a 3 miembros`,
        `${hoursAgo(3)} Héctor Montelongo votó: Aprueba`,
        `${hoursAgo(2)} Laura Fernández preguntó sobre costo de epoxi`,
      ],
      createdAt: hoursAgo(26),
      updatedAt: hoursAgo(2),
    },
    {
      id: 'comite-demo-logimex',
      referencia: 'COM-2026-0042',
      opportunityId: 'opp-demo-logimex',
      opportunityName: 'LogiMex — GDL Norte',
      hojaDeAcuerdosId: 'hoja-demo-logimex',
      leasingOfficerNombre: 'Tim Apple',
      cemQueFirmoNombre: 'Héctor Montelongo',
      fechaCreacion: hoursAgo(40),
      fechaLimiteResolucion: hoursFromNow(8),
      estatus: 'Resuelto — Aprobado con voto disidente',
      deal: hydrateDealSnapshot({
        parqueNombre: 'Parks Guadalajara Norte',
        naveNomenclatura: 'BOD-GDL-N-01',
        clienteRazonSocial: 'LogiMex S.A. de C.V.',
        clienteGiro: 'Logística',
        glaM2: 5_000,
        precioListaM2: 85,
        precioAcordadoM2: 85,
        plazoMeses: 36,
        periodoGraciaMeses: 2,
        brokerNombre: 'Sin broker',
        brokerClasificacion: 'Sin broker',
      }),
      miembros: logimexMembers,
      votosAprueba: 2,
      votosRechaza: 1,
      votosPendientes: 0,
      votosAbstiene: 0,
      resolucion: 'Aprobado — 2 de 3 (con voto disidente)',
      fechaResolucion: hoursAgo(18),
      casoLegalId: 'caso-demo-logimex',
      preguntas: [],
      auditoria: [
        `${hoursAgo(18)} Resuelto: Aprobado — 2 de 3 (con voto disidente)`,
        `${hoursAgo(18)} Objeción de Ricardo Campos registrada en expediente`,
      ],
      createdAt: hoursAgo(40),
      updatedAt: hoursAgo(18),
    },
    {
      id: 'comite-demo-xyz',
      referencia: 'COM-2026-0039',
      opportunityId: 'opp-demo-xyz',
      opportunityName: 'Empresa XYZ Manufactura — MTY Sur',
      hojaDeAcuerdosId: 'hoja-demo-xyz',
      leasingOfficerNombre: 'Israel Ramírez',
      cemQueFirmoNombre: 'Héctor Montelongo',
      fechaCreacion: hoursAgo(50),
      fechaLimiteResolucion: hoursAgo(2),
      estatus: 'Resuelto — Rechazado',
      deal: hydrateDealSnapshot({
        parqueNombre: 'Parks Monterrey Sur',
        naveNomenclatura: 'BOD-MTY-S-03',
        clienteRazonSocial: 'Empresa XYZ Manufactura',
        clienteGiro: 'Manufactura',
        glaM2: 8_000,
        precioListaM2: 87,
        precioAcordadoM2: 71,
        plazoMeses: 48,
        periodoGraciaMeses: 1,
        brokerNombre: 'Broker Regional',
        brokerClasificacion: 'No top 10',
        observacionesEntregaNave: 'Cliente pidió entrega en 15 días',
      }),
      miembros: xyzMembers,
      votosAprueba: 1,
      votosRechaza: 2,
      votosPendientes: 0,
      votosAbstiene: 0,
      resolucion: 'Rechazado — 2 de 3',
      fechaResolucion: hoursAgo(27),
      resumenRazonesRechazo:
        'Laura Fernández (Director Financiero):\n"Descuento del 18% supera el umbral autorizado de 10%. El deal no es rentable a este precio."\n\nRicardo Campos (Director de Operaciones):\n"La entrega en 15 días no es viable. Necesitamos al menos 30 días para las adecuaciones solicitadas."',
      preguntas: [],
      auditoria: [
        `${hoursAgo(27)} Resuelto: Rechazado — 2 de 3`,
        `${hoursAgo(27)} Deal regresado a negociación · LO notificado`,
      ],
      createdAt: hoursAgo(50),
      updatedAt: hoursAgo(27),
    },
    {
      id: 'comite-demo-samsung',
      referencia: 'COM-2026-0045',
      opportunityId: 'opp-demo-samsung',
      opportunityName: 'Samsung Electronics México — BTS MTY',
      hojaDeAcuerdosId: 'hoja-demo-samsung',
      leasingOfficerNombre: 'Tim Apple',
      cemQueFirmoNombre: 'Héctor Montelongo',
      fechaCreacion: hoursAgo(16),
      fechaLimiteResolucion: hoursAgo(1),
      estatus: 'Vencido sin resolución',
      deal: hydrateDealSnapshot({
        parqueNombre: 'Parks Monterrey Sur',
        naveNomenclatura: 'BTS-MTY-S-02',
        clienteRazonSocial: 'Samsung Electronics México',
        clienteGiro: 'Electrónica / Build-to-suit',
        glaM2: 20_000,
        precioListaM2: 110,
        precioAcordadoM2: 102,
        plazoMeses: 120,
        guantePactado: 500_000,
        brokerNombre: 'Colliers',
        brokerClasificacion: 'Top 10',
        condicionesEspeciales: 'Build-to-suit con especificaciones Samsung',
      }),
      miembros: samsungMembers,
      votosAprueba: 1,
      votosRechaza: 1,
      votosPendientes: 0,
      votosAbstiene: 1,
      resolucion: 'Empate — escalar',
      fechaResolucion: hoursAgo(8),
      preguntas: [],
      auditoria: [
        `${hoursAgo(8)} Empate — escalar a Director General`,
        `${hoursAgo(8)} Notificación enviada a Charlie / CEO`,
      ],
      createdAt: hoursAgo(16),
      updatedAt: hoursAgo(8),
    },
  ];
};

const comitesById = new Map<string, ComiteAutorizacion>();
const hojaToComiteId = new Map<string, string>();
let seeded = false;
let configState: ComiteConfig = { ...DEFAULT_COMITE_CONFIG };
let sequence = 50;

export const comiteStore = {
  ensureSeed: (): void => {
    if (seeded) {
      return;
    }

    for (const comite of buildDemoComites()) {
      comitesById.set(comite.id, comite);

      if (comite.hojaDeAcuerdosId) {
        hojaToComiteId.set(comite.hojaDeAcuerdosId, comite.id);
      }
    }

    seeded = true;
  },

  getConfig: (): ComiteConfig => ({ ...configState }),

  updateConfig: (patch: Partial<ComiteConfig>): ComiteConfig => {
    configState = { ...configState, ...patch };
    return { ...configState };
  },

  list: (): ComiteAutorizacion[] => {
    comiteStore.ensureSeed();
    return Array.from(comitesById.values()).sort((left, right) =>
      right.updatedAt.localeCompare(left.updatedAt),
    );
  },

  getById: (comiteId: string): ComiteAutorizacion | undefined => {
    comiteStore.ensureSeed();
    return comitesById.get(comiteId);
  },

  getByHojaId: (hojaId: string): ComiteAutorizacion | undefined => {
    comiteStore.ensureSeed();
    const comiteId = hojaToComiteId.get(hojaId);
    return comiteId ? comitesById.get(comiteId) : undefined;
  },

  getByOpportunityId: (
    opportunityId: string,
  ): ComiteAutorizacion | undefined => {
    comiteStore.ensureSeed();
    return comiteStore
      .list()
      .find((comite) => comite.opportunityId === opportunityId);
  },

  nextReferencia: (): string => {
    sequence += 1;
    return `COM-2026-${String(sequence).padStart(4, '0')}`;
  },

  upsert: (comite: ComiteAutorizacion): ComiteAutorizacion => {
    comiteStore.ensureSeed();
    const saved = {
      ...comite,
      updatedAt: new Date().toISOString(),
    };
    comitesById.set(saved.id, saved);

    if (saved.hojaDeAcuerdosId) {
      hojaToComiteId.set(saved.hojaDeAcuerdosId, saved.id);
    }

    return saved;
  },
};
