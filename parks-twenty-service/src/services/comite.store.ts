import { envConfig } from '../config/env.config';
import { PARKS_DEMO_EMAIL } from '../metadata/parks-demo-users.constants';
import {
  type ComiteAutorizacion,
  type ComiteConfig,
  type ComiteDealSnapshot,
  type ComiteIaFlag,
  type ComiteMiembroSeat,
  type ComitePregunta,
  type ComiteSemaforoPrecio,
} from '../types/comite.types';

export const COMITE_MIN_GLA_M2 = 20_000;

export const requiresComiteByGla = (glaM2: number): boolean =>
  glaM2 > COMITE_MIN_GLA_M2;

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
    nombre: 'Director Comercial',
    rolEtiqueta: 'Director Comercial',
    email: PARKS_DEMO_EMAIL.directorComercial,
  },
  {
    memberId: 'comite-m2',
    seatIndex: 2,
    nombre: 'Director Financiero',
    rolEtiqueta: 'Director Financiero',
    email: PARKS_DEMO_EMAIL.cfo,
  },
  {
    memberId: 'comite-m3',
    seatIndex: 3,
    nombre: 'Director de Operaciones',
    rolEtiqueta: 'Director de Operaciones',
    email: PARKS_DEMO_EMAIL.directorOperaciones,
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
    portafolio: partial.portafolio ?? partial.parqueNombre ?? 'Parks Industrial',
    cotizacionReferencia:
      partial.cotizacionReferencia ??
      `${partial.clienteRazonSocial} — ${partial.naveNomenclatura} — ${partial.glaM2} m²`,
    parqueNombre: partial.parqueNombre ?? 'Parks Industrial',
    naveNomenclatura: partial.naveNomenclatura,
    pisos: partial.pisos ?? '',
    esPropiedadFuno: partial.esPropiedadFuno ?? false,
    nombreComercio: partial.nombreComercio ?? partial.clienteRazonSocial,
    clienteRazonSocial: partial.clienteRazonSocial,
    clienteGiro: partial.clienteGiro ?? 'Manufactura',
    clienteHistorialParks: partial.clienteHistorialParks ?? false,
    clienteAdeudosActivos: partial.clienteAdeudosActivos ?? false,
    glaClienteM2: partial.glaClienteM2 ?? partial.glaM2,
    glaM2: partial.glaM2,
    precioListaM2,
    precioAcordadoM2: partial.precioAcordadoM2,
    descuentoPorcentaje,
    rentaMensual,
    rentaVariablePct: partial.rentaVariablePct ?? null,
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
    adeudoSinIva: partial.adeudoSinIva ?? null,
    incrementoTipo: partial.incrementoTipo ?? 'INPC',
    incrementoValor: partial.incrementoValor ?? 0,
    rentaContratoAnterior: partial.rentaContratoAnterior,
    brokerNombre: partial.brokerNombre ?? 'Sin broker',
    brokerClasificacion: partial.brokerClasificacion ?? 'Sin broker',
    numeroGirosOperando: partial.numeroGirosOperando ?? null,
    condicionesEspeciales: partial.condicionesEspeciales ?? '',
    observacionesEntregaNave: partial.observacionesEntregaNave ?? '',
  };
};

// Motor de reglas que la IA usa para marcar condiciones fuera de la banda
// histórica del portafolio. Puramente derivado del snapshot del deal + config,
// para que se recalcule siempre que cambie el umbral.
const GRACIA_MESES_ESTANDAR = 2;
const DEPOSITO_MESES_ESTANDAR = 2;
const GUANTE_ALTO_USD = 250_000;
const INCREMENTO_FIJO_MINIMO_PCT = 4;
const PLAZO_MESES_ATIPICO = 120;

const toUsdApprox = (amount: number, moneda: 'MXN' | 'USD'): number =>
  moneda === 'MXN' ? amount / 17 : amount;

export const computeComiteIaFlags = (
  deal: ComiteDealSnapshot,
  config: ComiteConfig = DEFAULT_COMITE_CONFIG,
): ComiteIaFlag[] => {
  const flags: ComiteIaFlag[] = [];

  if (deal.descuentoPorcentaje > config.semaforoAmarilloMaxPct) {
    flags.push({
      id: 'descuento-fuera-banda',
      titulo: 'Descuento fuera de banda',
      detalle: `Descuento de ${deal.descuentoPorcentaje}% supera el umbral autorizado de ${config.semaforoAmarilloMaxPct}%.`,
      severidad: 'Alta',
    });
  } else if (deal.descuentoPorcentaje > config.semaforoVerdeMaxPct) {
    flags.push({
      id: 'descuento-en-alerta',
      titulo: 'Descuento en zona amarilla',
      detalle: `Descuento de ${deal.descuentoPorcentaje}% está por encima de la banda verde (${config.semaforoVerdeMaxPct}%).`,
      severidad: 'Media',
    });
  }

  if (deal.periodoGraciaMeses > GRACIA_MESES_ESTANDAR) {
    flags.push({
      id: 'gracia-extendida',
      titulo: 'Período de gracia extendido',
      detalle: `${deal.periodoGraciaMeses} meses de gracia contra ${GRACIA_MESES_ESTANDAR} del estándar del portafolio.`,
      severidad: deal.periodoGraciaMeses > 3 ? 'Alta' : 'Media',
    });
  }

  if (deal.guantePactado > 0) {
    const guanteUsd = toUsdApprox(deal.guantePactado, deal.moneda);
    flags.push({
      id: 'guante-pactado',
      titulo: 'Guante pactado',
      detalle: `Incentivo de ${deal.guantePactado.toLocaleString('es-MX')} ${deal.moneda} comprometido en el deal.`,
      severidad: guanteUsd > GUANTE_ALTO_USD ? 'Alta' : 'Media',
    });
  }

  if (deal.depositosGarantiaMeses < DEPOSITO_MESES_ESTANDAR) {
    flags.push({
      id: 'deposito-bajo',
      titulo: 'Depósito en garantía por debajo del estándar',
      detalle: `${deal.depositosGarantiaMeses} mes(es) de depósito contra ${DEPOSITO_MESES_ESTANDAR} del estándar.`,
      severidad: 'Media',
    });
  }

  if (deal.clienteAdeudosActivos) {
    flags.push({
      id: 'cliente-adeudos',
      titulo: 'Cliente con adeudos activos',
      detalle: 'El inquilino registra adeudos vigentes en cartera CxC.',
      severidad: 'Alta',
    });
  }

  if (
    typeof deal.rentaContratoAnterior === 'number' &&
    deal.rentaContratoAnterior > 0 &&
    deal.rentaMensual < deal.rentaContratoAnterior
  ) {
    flags.push({
      id: 'renta-a-la-baja',
      titulo: 'Renta a la baja vs. contrato anterior',
      detalle: `Renta mensual de ${deal.rentaMensual.toLocaleString('es-MX')} ${deal.moneda} es menor a la del contrato previo (${deal.rentaContratoAnterior.toLocaleString('es-MX')}).`,
      severidad: 'Alta',
    });
  }

  if (deal.rentasAdelantadasMeses === 0) {
    flags.push({
      id: 'sin-rentas-adelantadas',
      titulo: 'Sin rentas adelantadas',
      detalle: 'El deal no contempla rentas adelantadas.',
      severidad: 'Baja',
    });
  }

  if (
    deal.incrementoTipo === 'Porcentaje fijo' &&
    deal.incrementoValor > 0 &&
    deal.incrementoValor < INCREMENTO_FIJO_MINIMO_PCT
  ) {
    flags.push({
      id: 'incremento-bajo',
      titulo: 'Incremento anual bajo',
      detalle: `Incremento fijo de ${deal.incrementoValor}% por debajo del mínimo de referencia (${INCREMENTO_FIJO_MINIMO_PCT}%).`,
      severidad: 'Media',
    });
  }

  if (deal.plazoMeses >= PLAZO_MESES_ATIPICO) {
    flags.push({
      id: 'plazo-largo',
      titulo: 'Plazo forzoso atípico',
      detalle: `Plazo de ${deal.plazoMeses} meses fuera del rango habitual del portafolio.`,
      severidad: 'Baja',
    });
  }

  return flags;
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
      portafolio: 'Parks GDL Norte',
      cotizacionReferencia:
        'COT-2026-FEMSA — Coca-Cola FEMSA — BOD-GDL-N-04 — 24,500 m²',
      parqueNombre: 'Parks Guadalajara Norte',
      naveNomenclatura: 'BOD-GDL-N-04',
      pisos: '1',
      esPropiedadFuno: false,
      nombreComercio: 'Coca-Cola FEMSA',
      clienteRazonSocial: 'Coca-Cola FEMSA S.A. de C.V.',
      clienteGiro: 'Almacenamiento y Distribución',
      clienteHistorialParks: true,
      clienteAdeudosActivos: false,
      glaClienteM2: 24_500,
      glaM2: 24_500,
      precioListaM2: 95,
      precioAcordadoM2: 82,
      plazoMeses: 60,
      prorrogaMeses: 12,
      periodoGraciaMeses: 3,
      depositosGarantiaMeses: 2,
      rentasAdelantadasMeses: 2,
      guantePactado: 150_000,
      mantenimientoPactado: 24_500 * 82 * 0.08,
      rentaVariablePct: null,
      adeudoSinIva: null,
      numeroGirosOperando: 1,
      incrementoTipo: 'INPC',
      brokerNombre: 'Christian Lua',
      brokerClasificacion: 'Top 10',
      condicionesEspeciales:
        'Cliente requiere pintura epoxi en piso de almacén. Parks asume el costo estimado $45,000 USD',
      observacionesEntregaNave:
        'Entregar oficinas limpias.\nEntregar rampas, andenes, cortinas y baños funcionando.\nEntrega en 45 días hábiles.',
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

  const rawComites: Array<Omit<ComiteAutorizacion, 'flagsIaAtipicas'>> = [
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
        portafolio: 'Parks GDL Norte',
        cotizacionReferencia:
          'COT-2026-LOGIMEX — LogiMex — BOD-GDL-N-01 — 22,000 m²',
        parqueNombre: 'Parks Guadalajara Norte',
        naveNomenclatura: 'BOD-GDL-N-01',
        pisos: '1',
        nombreComercio: 'LogiMex',
        clienteRazonSocial: 'LogiMex S.A. de C.V.',
        clienteGiro: 'Logística',
        glaClienteM2: 22_000,
        glaM2: 22_000,
        precioListaM2: 85,
        precioAcordadoM2: 85,
        plazoMeses: 36,
        periodoGraciaMeses: 2,
        depositosGarantiaMeses: 2,
        rentasAdelantadasMeses: 2,
        mantenimientoPactado: 22_000 * 85 * 0.06,
        incrementoTipo: 'INPC',
        brokerNombre: 'Sin broker',
        brokerClasificacion: 'Sin broker',
        numeroGirosOperando: 1,
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
        portafolio: 'Parks MTY Sur',
        cotizacionReferencia:
          'COT-2026-XYZ — Empresa XYZ Manufactura — BOD-MTY-S-03 — 26,000 m²',
        parqueNombre: 'Parks Monterrey Sur',
        naveNomenclatura: 'BOD-MTY-S-03',
        pisos: '1',
        nombreComercio: 'Empresa XYZ Manufactura',
        clienteRazonSocial: 'Empresa XYZ Manufactura',
        clienteGiro: 'Manufactura',
        glaClienteM2: 26_000,
        glaM2: 26_000,
        precioListaM2: 87,
        precioAcordadoM2: 71,
        plazoMeses: 48,
        prorrogaMeses: 0,
        periodoGraciaMeses: 1,
        depositosGarantiaMeses: 2,
        rentasAdelantadasMeses: 2,
        guantePactado: 0,
        mantenimientoPactado: 26_000 * 71 * 0.05,
        rentaVariablePct: null,
        adeudoSinIva: null,
        numeroGirosOperando: null,
        incrementoTipo: 'INPC',
        rentaContratoAnterior: 87,
        brokerNombre: 'Broker Regional',
        brokerClasificacion: 'No top 10',
        condicionesEspeciales: '',
        observacionesEntregaNave:
          'Entregar Oficinas en Mezanine limpias en el estado que se encuentran.\nEntregar Rampas, Andenes, Cortinas y Baños Funcionando.\nCliente pidió entrega en 15 días.',
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
        portafolio: 'Parks MTY Sur · BTS',
        cotizacionReferencia:
          'COT-2026-SAMSUNG — Samsung Electronics México — BTS-MTY-S-02 — 32,000 m²',
        parqueNombre: 'Parks Monterrey Sur',
        naveNomenclatura: 'BTS-MTY-S-02',
        pisos: '1 + mezzanine',
        nombreComercio: 'Samsung Electronics México',
        clienteRazonSocial: 'Samsung Electronics México',
        clienteGiro: 'Electrónica / Build-to-suit',
        glaClienteM2: 32_000,
        glaM2: 32_000,
        precioListaM2: 110,
        precioAcordadoM2: 102,
        plazoMeses: 120,
        prorrogaMeses: 24,
        depositosGarantiaMeses: 3,
        rentasAdelantadasMeses: 2,
        guantePactado: 500_000,
        mantenimientoPactado: 32_000 * 102 * 0.07,
        incrementoTipo: 'Porcentaje fijo',
        incrementoValor: 3.5,
        numeroGirosOperando: 1,
        brokerNombre: 'Colliers',
        brokerClasificacion: 'Top 10',
        condicionesEspeciales: 'Build-to-suit con especificaciones Samsung',
        observacionesEntregaNave: 'Entrega conforme a programa BTS Samsung.',
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
        `${hoursAgo(8)} Notificación enviada a Charles El Mann Metta / CEO`,
      ],
      createdAt: hoursAgo(16),
      updatedAt: hoursAgo(8),
    },
  ];

  return rawComites.map((comite) => ({
    ...comite,
    flagsIaAtipicas: computeComiteIaFlags(comite.deal, config),
  }));
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
      flagsIaAtipicas: computeComiteIaFlags(comite.deal, configState),
      updatedAt: new Date().toISOString(),
    };
    comitesById.set(saved.id, saved);

    if (saved.hojaDeAcuerdosId) {
      hojaToComiteId.set(saved.hojaDeAcuerdosId, saved.id);
    }

    return saved;
  },

  clearAll: (): void => {
    comitesById.clear();
    hojaToComiteId.clear();
    seeded = true;
    sequence = 50;
  },
};
