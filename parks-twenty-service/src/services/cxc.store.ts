import {
  type CxcAccount,
  type CxcAnomaly,
  type CxcCalendarioPago,
  type CxcCalendarioPagoItem,
  type CxcHojaAcuerdosResumen,
  type CxcPortalPagoProceso,
  type CxcSeguimientoCobranza,
} from '../types/cxc.types';

const daysFromNow = (days: number): string => {
  const date = new Date();
  date.setDate(date.getDate() + days);
  return date.toISOString().slice(0, 10);
};

const daysAgo = (days: number): string => daysFromNow(-days);

const parseDiaPago = (diaPago: string): number => {
  const match = diaPago.match(/(\d{1,2})/);
  const day = match ? Number(match[1]) : 10;

  return Number.isFinite(day) ? Math.min(28, Math.max(1, day)) : 10;
};

const toDateOnly = (date: Date): string => date.toISOString().slice(0, 10);

const parseDateOnly = (value: string): Date => {
  const [year, month, day] = value.slice(0, 10).split('-').map(Number);
  return new Date(Date.UTC(year, (month ?? 1) - 1, day ?? 1));
};

const paymentDateAtOffset = (
  fechaInicio: string,
  monthOffset: number,
  dayOfMonth: number,
): string => {
  const base = parseDateOnly(fechaInicio);
  const date = new Date(
    Date.UTC(base.getUTCFullYear(), base.getUTCMonth() + monthOffset, dayOfMonth),
  );

  return toDateOnly(date);
};

const resolveItemStatus = (
  fecha: string,
  options?: { force?: CxcCalendarioPagoItem['estatus'] },
): CxcCalendarioPagoItem['estatus'] => {
  if (options?.force) {
    return options.force;
  }

  const today = toDateOnly(new Date());

  if (fecha < today) {
    return 'Pagada';
  }

  return 'Programada';
};

// Calendario completo: pagos iniciales + un renglón por mes del plazo contractual
export const buildCalendarioContrato = (input: {
  diaPago: string;
  renta: number;
  fechaInicio: string;
  plazoMeses: number;
  mesesGracia?: number;
  mesesDeposito?: number;
  mesesRentaAdelantada?: number;
  // Meses de renta ya cobrados (post-gracia) para marcar Pagada en cuentas maduras
  rentasPagadas?: number;
  // Forzar estatus de rentas futuras/pasadas (p.ej. Facturada / Vencida)
  overrideRentaEstatus?: Array<{
    mesContrato: number;
    estatus: CxcCalendarioPagoItem['estatus'];
    concepto?: string;
    monto?: number;
  }>;
}): CxcCalendarioPago => {
  const dayOfMonth = parseDiaPago(input.diaPago);
  const mesesGracia = input.mesesGracia ?? 0;
  const mesesDeposito = input.mesesDeposito ?? 0;
  const mesesRentaAdelantada = input.mesesRentaAdelantada ?? 0;
  const plazoMeses = Math.max(1, input.plazoMeses);
  const rentasPagadas = input.rentasPagadas ?? 0;
  const overrideByMes = new Map(
    (input.overrideRentaEstatus ?? []).map((item) => [item.mesContrato, item]),
  );

  const items: CxcCalendarioPagoItem[] = [];
  const fechaInicioPago = paymentDateAtOffset(input.fechaInicio, 0, dayOfMonth);

  if (mesesDeposito > 0) {
    items.push({
      fecha: fechaInicioPago,
      concepto: `Depósito en garantía (${mesesDeposito} ${mesesDeposito === 1 ? 'mes' : 'meses'})`,
      monto: input.renta * mesesDeposito,
      estatus: resolveItemStatus(fechaInicioPago),
    });
  }

  if (mesesRentaAdelantada > 0) {
    items.push({
      fecha: fechaInicioPago,
      concepto: `Renta adelantada (${mesesRentaAdelantada} ${mesesRentaAdelantada === 1 ? 'mes' : 'meses'})`,
      monto: input.renta * mesesRentaAdelantada,
      estatus: resolveItemStatus(fechaInicioPago),
    });
  }

  let rentasCobrablesIndex = 0;

  for (let mes = 1; mes <= plazoMeses; mes += 1) {
    const fecha = paymentDateAtOffset(input.fechaInicio, mes - 1, dayOfMonth);
    const override = overrideByMes.get(mes);

    if (mes <= mesesGracia) {
      items.push({
        fecha,
        concepto: `Mes ${mes} · Periodo de gracia`,
        monto: 0,
        estatus: resolveItemStatus(fecha, {
          force: fecha < toDateOnly(new Date()) ? 'Pagada' : 'Programada',
        }),
      });
      continue;
    }

    rentasCobrablesIndex += 1;
    const isPaid = rentasCobrablesIndex <= rentasPagadas;
    const concepto =
      override?.concepto ?? `Mes ${mes} · Renta mensual`;
    const monto = override?.monto ?? input.renta;
    const estatus =
      override?.estatus ??
      (isPaid
        ? 'Pagada'
        : resolveItemStatus(fecha, {
            force: fecha < toDateOnly(new Date()) ? 'Vencida' : 'Programada',
          }));

    items.push({
      fecha,
      concepto,
      monto,
      estatus,
    });
  }

  const proxima =
    items.find(
      (item) =>
        item.monto > 0 &&
        (item.estatus === 'Programada' || item.estatus === 'Facturada'),
    )?.fecha ?? null;

  return {
    proximaFechaPago: proxima,
    diaPagoAcordado: input.diaPago,
    items,
  };
};

const buildPortalSinOc = (): CxcPortalPagoProceso => ({
  requiereOc: false,
  portalUrl: null,
  portalNombre: null,
  instrucciones:
    'Cliente sin portal: Jesús emite factura → cliente paga por transferencia a cuenta Fibra Uno.',
  pasos: [
    {
      id: 'emitir',
      label: 'Emitir factura Oracle',
      done: true,
      detail: 'Jesús emite y notifica a CxC',
    },
    {
      id: 'enviar',
      label: 'Enviar factura a CxP',
      done: true,
      detail: 'Correo con PDF + datos bancarios',
    },
    {
      id: 'pago',
      label: 'Confirmar pago en cuenta',
      done: false,
      detail: 'Tesorería Fibra Uno (T+1)',
    },
  ],
});

const buildPortalConOc = (input: {
  portalNombre: string;
  portalUrl: string;
  ocRecibida: boolean;
  cargada: boolean;
  programada: boolean;
}): CxcPortalPagoProceso => ({
  requiereOc: true,
  portalUrl: input.portalUrl,
  portalNombre: input.portalNombre,
  instrucciones:
    'Cliente exige OC antes de facturar. Flujo: solicitar OC → registrar OC → Jesús emite → cargar XML/PDF al portal → pago programado.',
  pasos: [
    {
      id: 'solicitar-oc',
      label: 'Solicitar orden de compra',
      done: true,
      detail: 'Correo / portal al área de CxP del cliente',
    },
    {
      id: 'recibir-oc',
      label: 'Recibir y registrar OC',
      done: input.ocRecibida,
      detail: input.ocRecibida
        ? 'OC registrada en CRM'
        : 'Bloquea emisión de factura hasta tener OC',
    },
    {
      id: 'emitir',
      label: 'Emitir factura (Jesús / Oracle)',
      done: input.ocRecibida,
      detail: 'Solo después de OC válida',
    },
    {
      id: 'cargar-portal',
      label: 'Subir factura al portal del cliente',
      done: input.cargada,
      detail: input.portalUrl,
    },
    {
      id: 'pago-programado',
      label: 'Pago programado en portal',
      done: input.programada,
      detail: 'Seguir fecha de pago del portal (crédito típico 15–30d)',
    },
  ],
});

const hoja = (
  partial: Partial<CxcHojaAcuerdosResumen> &
    Pick<
      CxcHojaAcuerdosResumen,
      'folio' | 'm2Acordados' | 'precioUsdM2' | 'rentaMensual' | 'moneda'
    >,
): CxcHojaAcuerdosResumen => ({
  plazoMeses: 60,
  mesesGracia: 2,
  mesesDeposito: 2,
  mesesRentaAdelantada: 1,
  escalacionTipo: 'INPC',
  escalacionPct: null,
  fechaFirma: daysAgo(14),
  leasingOfficer: 'Bruyel',
  ...partial,
});

const seguimiento = (
  partial: Partial<CxcSeguimientoCobranza> &
    Pick<CxcSeguimientoCobranza, 'estado'>,
): CxcSeguimientoCobranza => ({
  compromisoPagoFecha: null,
  compromisoMonto: null,
  proximaAccionFecha: null,
  proximaAccionNota: null,
  ultimoContactoAt: null,
  ultimoContactoTipo: null,
  ...partial,
});

type CxcAccountDraft = Omit<CxcAccount, 'seguimientoCobranza'> & {
  seguimientoCobranza?: CxcSeguimientoCobranza | null;
};

const finalizeAccounts = (drafts: CxcAccountDraft[]): CxcAccount[] =>
  drafts.map((draft) => ({
    ...draft,
    seguimientoCobranza: draft.seguimientoCobranza ?? null,
  }));

const buildDemoAccounts = (): CxcAccount[] => {
  const now = new Date().toISOString();

  const drafts: CxcAccountDraft[] = [
    {
      id: 'cxc-logimex',
      empresa: 'LogiMex S.A. de C.V.',
      rfc: 'LMX120315AB1',
      contactoPagosNombre: 'Ana Torres',
      contactoPagosEmail: 'pagos@logimex.mx',
      contactoPagosTelefono: '+52 55 4000 1200',
      ejecutivoId: 'cxc-ej-1',
      ejecutivoNombre: 'Mariana López',
      estatusPagos: 'Al corriente',
      scoreRiesgo: 18,
      scoreLabel: 'Bajo',
      scoreFactores: [
        'Historial puntual 24 meses',
        'Sin adeudos activos',
        'Retraso promedio 0.4 días',
      ],
      tipoCliente: 'Sin portal',
      diaPagoAcordado: 'Día 10',
      moneda: 'MXN',
      rentaMensual: 425_000,
      montoAdeudoTotal: 0,
      diasEnMora: 0,
      ultimaFechaPago: daysAgo(8),
      nave: 'Nave 7',
      parque: 'Parks Toluca',
      contratosActivos: 1,
      requiereOc: false,
      cuentaBancaria: '012345678901234567',
      cicloEstatus: 'Activo',
      jesusContratoDadoAlta: true,
      facturas: [
        {
          id: 'inv-logimex-1',
          numeroFactura: 'FAC-2026-4412',
          tipo: 'Renta mensual',
          monto: 425_000,
          moneda: 'MXN',
          fechaEmision: daysAgo(12),
          fechaLimitePago: daysAgo(2),
          diasVencida: 0,
          estatus: 'Pagada',
        },
      ],
      ordenCompra: null,
      deposito: null,
      escalacionInpc: {
        fechaAplicacion: daysFromNow(30),
        rentaAnterior: 425_000,
        porcentajeInpc: 4.2,
        rentaNueva: 442_850,
        estatus: 'Pendiente',
        diasParaAplicacion: 30,
      },
      holdover: null,
      notasCobranza: 'Cliente demo puntual — INPC en 30 días.',
      actividadesCobranza: [],
      casoLegalId: 'legal-logimex-demo',
      pipelineStage: 'cobranza_activa',
      recibidoDeLegalAt: daysAgo(400),
      hojaAcuerdos: hoja({
        folio: 'HA-2024-1188',
        m2Acordados: 8_500,
        precioUsdM2: 5.2,
        rentaMensual: 425_000,
        moneda: 'MXN',
        leasingOfficer: 'Israel',
      }),
      contrato: {
        referenciaLegal: 'CTR-TOL-2024-088',
        tipoDocumento: 'Arrendamiento industrial',
        fechaInicio: daysAgo(400),
        fechaVencimiento: daysFromNow(1_400),
        abogadoAsignado: 'Miguel Soto',
        esPropiedadFuno: true,
        estatusLegal: 'En cobranza',
        casoLegalId: 'legal-logimex-demo',
      },
      calendarioPagos: buildCalendarioContrato({
        diaPago: 'Día 10',
        renta: 425_000,
        fechaInicio: daysAgo(400),
        plazoMeses: 60,
        mesesGracia: 2,
        mesesDeposito: 2,
        mesesRentaAdelantada: 1,
        rentasPagadas: 12,
        overrideRentaEstatus: [
          {
            mesContrato: 15,
            estatus: 'Programada',
            concepto: 'Mes 15 · Renta mensual + INPC',
            monto: 442_850,
          },
        ],
      }),
      portalPago: buildPortalSinOc(),
      createdAt: now,
      updatedAt: now,
    },
    {
      id: 'cxc-norte',
      empresa: 'Distribuciones Norte S.A.',
      rfc: 'DNS180922CD3',
      contactoPagosNombre: 'Luis Méndez',
      contactoPagosEmail: 'cxp@distribucionesnorte.mx',
      contactoPagosTelefono: '+52 81 3000 8800',
      ejecutivoId: 'cxc-ej-2',
      ejecutivoNombre: 'Carlos Ruiz',
      estatusPagos: 'Mora grave',
      scoreRiesgo: 87,
      scoreLabel: 'Crítico',
      scoreFactores: [
        'OC pendiente 8 días',
        'Retraso promedio histórico 11 días',
        'Factura del mes sin emitir',
      ],
      tipoCliente: 'Con portal',
      diaPagoAcordado: 'Día 15',
      moneda: 'MXN',
      rentaMensual: 318_000,
      montoAdeudoTotal: 318_000,
      diasEnMora: 8,
      ultimaFechaPago: daysAgo(42),
      nave: 'Nave 2',
      parque: 'Parks Monterrey',
      contratosActivos: 1,
      requiereOc: true,
      cuentaBancaria: '098765432109876543',
      cicloEstatus: 'Activo',
      jesusContratoDadoAlta: true,
      facturas: [
        {
          id: 'inv-norte-1',
          numeroFactura: 'FAC-PENDIENTE-OC',
          tipo: 'Renta mensual',
          monto: 318_000,
          moneda: 'MXN',
          fechaEmision: daysAgo(8),
          fechaLimitePago: daysFromNow(7),
          diasVencida: 0,
          estatus: 'OC_pendiente',
        },
      ],
      ordenCompra: {
        numeroOc: null,
        estatus: 'Esperando OC',
        diasSinOc: 8,
        intentosRecordatorio: 3,
        fechaPagoProgramada: null,
      },
      deposito: null,
      escalacionInpc: null,
      holdover: null,
      notasCobranza: 'Portal cliente — escalar a Claudia si no llega OC hoy.',
      actividadesCobranza: [
        {
          id: 'act-norte-1',
          type: 'email',
          label: 'Recordatorio OC #3',
          detail: 'Correo a CxP Luis Méndez — sin respuesta en 24h.',
          createdBy: 'Carlos Ruiz',
          createdAt: new Date(Date.now() - 86_400_000).toISOString(),
        },
        {
          id: 'act-norte-2',
          type: 'llamada',
          label: 'Llamada de cobranza',
          detail: 'CxP prometió enviar OC el viernes. Seguimiento marcado.',
          createdBy: 'Carlos Ruiz',
          createdAt: new Date(Date.now() - 36_000_000).toISOString(),
        },
      ],
      seguimientoCobranza: seguimiento({
        estado: 'En seguimiento',
        compromisoPagoFecha: daysFromNow(3),
        compromisoMonto: 318_000,
        proximaAccionFecha: daysFromNow(1),
        proximaAccionNota: 'Verificar si llegó la OC; si no, escalar a Claudia',
        ultimoContactoAt: new Date(Date.now() - 36_000_000).toISOString(),
        ultimoContactoTipo: 'llamada',
      }),
      casoLegalId: 'legal-norte-demo',
      pipelineStage: 'facturacion_portal',
      recibidoDeLegalAt: daysAgo(210),
      hojaAcuerdos: hoja({
        folio: 'HA-2025-0441',
        m2Acordados: 6_200,
        precioUsdM2: 4.8,
        rentaMensual: 318_000,
        moneda: 'MXN',
        mesesGracia: 1,
        leasingOfficer: 'UAE',
      }),
      contrato: {
        referenciaLegal: 'CTR-MTY-2025-041',
        tipoDocumento: 'Arrendamiento industrial',
        fechaInicio: daysAgo(200),
        fechaVencimiento: daysFromNow(1_600),
        abogadoAsignado: 'Patricia Núñez',
        esPropiedadFuno: true,
        estatusLegal: 'En cobranza',
        casoLegalId: 'legal-norte-demo',
      },
      calendarioPagos: buildCalendarioContrato({
        diaPago: 'Día 15',
        renta: 318_000,
        fechaInicio: daysAgo(200),
        plazoMeses: 60,
        mesesGracia: 1,
        mesesDeposito: 2,
        mesesRentaAdelantada: 1,
        rentasPagadas: 5,
        overrideRentaEstatus: [
          {
            mesContrato: 8,
            estatus: 'Facturada',
            concepto: 'Mes 8 · Renta mensual (bloqueada por OC)',
          },
        ],
      }),
      portalPago: buildPortalConOc({
        portalNombre: 'Ariba / SAP Norte',
        portalUrl: 'https://portal.distribucionesnorte.mx/ap',
        ocRecibida: false,
        cargada: false,
        programada: false,
      }),
      createdAt: now,
      updatedAt: now,
    },
    {
      id: 'cxc-gdl',
      empresa: 'Empresa Manufactura GDL',
      rfc: 'EMG150610EF7',
      contactoPagosNombre: 'Patricia Solís',
      contactoPagosEmail: 'tesoreria@manufacturagdl.mx',
      contactoPagosTelefono: '+52 33 2100 4500',
      ejecutivoId: 'cxc-ej-1',
      ejecutivoNombre: 'Mariana López',
      estatusPagos: 'Holdover',
      scoreRiesgo: 72,
      scoreLabel: 'Alto',
      scoreFactores: [
        '52 días en holdover',
        '2 facturas holdover pendientes',
        'Renovación sin firma',
      ],
      tipoCliente: 'Sin portal',
      diaPagoAcordado: 'Día 5',
      moneda: 'MXN',
      rentaMensual: 268_000,
      montoAdeudoTotal: 1_072_000,
      diasEnMora: 52,
      ultimaFechaPago: daysAgo(60),
      nave: 'Nave 11',
      parque: 'Parks Guadalajara',
      contratosActivos: 1,
      requiereOc: false,
      cuentaBancaria: '112233445566778899',
      cicloEstatus: 'Holdover',
      jesusContratoDadoAlta: true,
      facturas: [
        {
          id: 'inv-gdl-h1',
          numeroFactura: 'FAC-HO-2026-019',
          tipo: 'Holdover',
          monto: 536_000,
          moneda: 'MXN',
          fechaEmision: daysAgo(40),
          fechaLimitePago: daysAgo(30),
          diasVencida: 30,
          estatus: 'Vencida',
        },
        {
          id: 'inv-gdl-h2',
          numeroFactura: 'FAC-HO-2026-028',
          tipo: 'Holdover',
          monto: 536_000,
          moneda: 'MXN',
          fechaEmision: daysAgo(10),
          fechaLimitePago: daysFromNow(5),
          diasVencida: 0,
          estatus: 'Emitida',
        },
      ],
      ordenCompra: null,
      deposito: null,
      escalacionInpc: null,
      holdover: {
        diasEnHoldover: 52,
        facturasEmitidas: 2,
        montoAcumulado: 1_072_000,
        montoPendiente: 1_072_000,
      },
      notasCobranza: 'CEO debe decidir condonación al renovar.',
      actividadesCobranza: [],
      casoLegalId: 'legal-gdl-demo',
      pipelineStage: 'holdover',
      recibidoDeLegalAt: daysAgo(900),
      hojaAcuerdos: hoja({
        folio: 'HA-2023-0099',
        m2Acordados: 5_400,
        precioUsdM2: 4.5,
        rentaMensual: 268_000,
        moneda: 'MXN',
        plazoMeses: 36,
        mesesGracia: 0,
      }),
      contrato: {
        referenciaLegal: 'CTR-GDL-2023-012',
        tipoDocumento: 'Arrendamiento industrial',
        fechaInicio: daysAgo(1_100),
        fechaVencimiento: daysAgo(52),
        abogadoAsignado: 'Miguel Soto',
        esPropiedadFuno: false,
        estatusLegal: 'Vencido — holdover',
        casoLegalId: 'legal-gdl-demo',
      },
      calendarioPagos: buildCalendarioContrato({
        diaPago: 'Día 5',
        renta: 536_000,
        fechaInicio: daysAgo(900),
        plazoMeses: 36,
        mesesGracia: 0,
        mesesDeposito: 2,
        mesesRentaAdelantada: 1,
        rentasPagadas: 36,
        overrideRentaEstatus: [
          {
            mesContrato: 36,
            estatus: 'Vencida',
            concepto: 'Mes 36 · Holdover (doble renta)',
            monto: 536_000,
          },
        ],
      }),
      portalPago: buildPortalSinOc(),
      createdAt: now,
      updatedAt: now,
    },
    {
      id: 'cxc-salida',
      empresa: 'Almacenajes del Bajío',
      rfc: 'ADB090401GH9',
      contactoPagosNombre: 'Roberto Vega',
      contactoPagosEmail: 'finanzas@almacenajesbajio.mx',
      contactoPagosTelefono: '+52 477 150 3300',
      ejecutivoId: 'cxc-ej-3',
      ejecutivoNombre: 'Sofía Herrera',
      estatusPagos: 'Inactivo',
      scoreRiesgo: 35,
      scoreLabel: 'Medio',
      scoreFactores: [
        'Salida hace 3 semanas',
        'Sin adeudos de renta',
        'Depósito en devolución',
      ],
      tipoCliente: 'Sin portal',
      diaPagoAcordado: 'Día 10',
      moneda: 'MXN',
      rentaMensual: 318_000,
      montoAdeudoTotal: 0,
      diasEnMora: 0,
      ultimaFechaPago: daysAgo(35),
      nave: 'Nave 4',
      parque: 'Parks Querétaro',
      contratosActivos: 0,
      requiereOc: false,
      cuentaBancaria: '556677889900112233',
      cicloEstatus: 'Terminado',
      jesusContratoDadoAlta: true,
      facturas: [],
      ordenCompra: null,
      deposito: {
        montoOriginal: 636_000,
        montoADevolver: 477_000,
        estatus: 'En proceso de devolución',
        caratulaBancariaRecibida: true,
        cartaSolicitudRecibida: true,
        enProcesoFirmasInternas: true,
        razonRetencion: 'Desperfectos menores — retención 25%',
      },
      escalacionInpc: null,
      holdover: null,
      notasCobranza: 'Firmas internas en curso · Tesorería pendiente.',
      actividadesCobranza: [],
      casoLegalId: 'legal-bajio-demo',
      pipelineStage: 'salida',
      recibidoDeLegalAt: daysAgo(1_200),
      hojaAcuerdos: hoja({
        folio: 'HA-2022-0330',
        m2Acordados: 6_000,
        precioUsdM2: 4.9,
        rentaMensual: 318_000,
        moneda: 'MXN',
      }),
      contrato: {
        referenciaLegal: 'CTR-QRO-2022-055',
        tipoDocumento: 'Arrendamiento industrial',
        fechaInicio: daysAgo(1_400),
        fechaVencimiento: daysAgo(21),
        abogadoAsignado: 'Jane Austen',
        esPropiedadFuno: true,
        estatusLegal: 'Cerrado — salida',
        casoLegalId: 'legal-bajio-demo',
      },
      calendarioPagos: null,
      portalPago: buildPortalSinOc(),
      createdAt: now,
      updatedAt: now,
    },
    {
      id: 'cxc-funo',
      empresa: 'ColdChain Logistics MX',
      rfc: 'CLM210815JK2',
      contactoPagosNombre: 'Elena Prado',
      contactoPagosEmail: 'ap@coldchain.mx',
      contactoPagosTelefono: '+52 55 8888 0101',
      ejecutivoId: 'cxc-ej-2',
      ejecutivoNombre: 'Carlos Ruiz',
      estatusPagos: 'Mora leve',
      scoreRiesgo: 48,
      scoreLabel: 'Medio',
      scoreFactores: [
        'Pago 4 días tarde promedio',
        'Siempre liquida',
        'USD contract',
      ],
      tipoCliente: 'Con portal',
      diaPagoAcordado: 'Día 20',
      moneda: 'USD',
      rentaMensual: 42_500,
      montoAdeudoTotal: 42_500,
      diasEnMora: 3,
      ultimaFechaPago: daysAgo(28),
      nave: 'Nave 1',
      parque: 'Parks Toluca',
      contratosActivos: 2,
      requiereOc: true,
      cuentaBancaria: 'USD-FIBRA-8811',
      cicloEstatus: 'Activo',
      jesusContratoDadoAlta: true,
      facturas: [
        {
          id: 'inv-cold-1',
          numeroFactura: 'FAC-USD-1102',
          tipo: 'Renta mensual',
          monto: 42_500,
          moneda: 'USD',
          fechaEmision: daysAgo(18),
          fechaLimitePago: daysAgo(3),
          diasVencida: 3,
          estatus: 'Vencida',
        },
      ],
      ordenCompra: {
        numeroOc: 'OC-CCL-8891',
        estatus: 'Cargada en portal',
        diasSinOc: 0,
        intentosRecordatorio: 1,
        fechaPagoProgramada: daysFromNow(4),
      },
      deposito: null,
      escalacionInpc: null,
      holdover: null,
      notasCobranza: 'Portal aceptó factura · pago programado en 4 días. Verificar caída.',
      actividadesCobranza: [
        {
          id: 'act-cold-1',
          type: 'whatsapp',
          label: 'WhatsApp CxP',
          detail: 'Elena confirma que el portal programó pago para el viernes.',
          createdBy: 'Carlos Ruiz',
          createdAt: daysAgo(1),
        },
      ],
      seguimientoCobranza: seguimiento({
        estado: 'Pendiente verificación',
        compromisoPagoFecha: daysFromNow(4),
        compromisoMonto: 42_500,
        proximaAccionFecha: daysFromNow(5),
        proximaAccionNota: 'Confirmar depósito en cuenta Fibra Uno USD',
        ultimoContactoAt: daysAgo(1),
        ultimoContactoTipo: 'whatsapp',
      }),
      casoLegalId: 'legal-cold-demo',
      pipelineStage: 'facturacion_portal',
      recibidoDeLegalAt: daysAgo(320),
      hojaAcuerdos: hoja({
        folio: 'HA-2025-0201',
        m2Acordados: 9_100,
        precioUsdM2: 4.67,
        rentaMensual: 42_500,
        moneda: 'USD',
        mesesDeposito: 3,
        leasingOfficer: 'Bruyel',
      }),
      contrato: {
        referenciaLegal: 'CTR-TOL-2025-019',
        tipoDocumento: 'Arrendamiento industrial',
        fechaInicio: daysAgo(300),
        fechaVencimiento: daysFromNow(1_500),
        abogadoAsignado: 'Miguel Soto',
        esPropiedadFuno: true,
        estatusLegal: 'En cobranza',
        casoLegalId: 'legal-cold-demo',
      },
      calendarioPagos: buildCalendarioContrato({
        diaPago: 'Día 20',
        renta: 42_500,
        fechaInicio: daysAgo(180),
        plazoMeses: 48,
        mesesGracia: 1,
        mesesDeposito: 2,
        mesesRentaAdelantada: 1,
        rentasPagadas: 4,
        overrideRentaEstatus: [
          {
            mesContrato: 7,
            estatus: 'Vencida',
          },
          {
            mesContrato: 8,
            estatus: 'Facturada',
            concepto: 'Mes 8 · Pago programado portal',
          },
        ],
      }),
      portalPago: buildPortalConOc({
        portalNombre: 'Coupa ColdChain',
        portalUrl: 'https://coldchain.coupahost.com/invoices',
        ocRecibida: true,
        cargada: true,
        programada: true,
      }),
      createdAt: now,
      updatedAt: now,
    },
    {
      id: 'cxc-nuevo',
      empresa: 'AgroExport Pacífico',
      rfc: 'AEP240201LM4',
      contactoPagosNombre: 'Diana Cruz',
      contactoPagosEmail: 'pagos@agroexport.mx',
      contactoPagosTelefono: '+52 664 220 1100',
      ejecutivoId: 'cxc-ej-3',
      ejecutivoNombre: 'Sofía Herrera',
      estatusPagos: 'Al corriente',
      scoreRiesgo: 22,
      scoreLabel: 'Bajo',
      scoreFactores: ['Onboarding reciente', 'En período de gracia'],
      tipoCliente: 'Sin portal',
      diaPagoAcordado: 'Día 5',
      moneda: 'MXN',
      rentaMensual: 195_000,
      montoAdeudoTotal: 0,
      diasEnMora: 0,
      ultimaFechaPago: null,
      nave: 'Nave 9',
      parque: 'Parks Tijuana',
      contratosActivos: 1,
      requiereOc: false,
      cuentaBancaria: null,
      cicloEstatus: 'Gracia',
      jesusContratoDadoAlta: false,
      facturas: [],
      ordenCompra: null,
      deposito: {
        montoOriginal: 390_000,
        montoADevolver: 390_000,
        estatus: 'Retenido',
        caratulaBancariaRecibida: false,
        cartaSolicitudRecibida: false,
        enProcesoFirmasInternas: false,
        razonRetencion: null,
      },
      escalacionInpc: null,
      holdover: null,
      notasCobranza: 'Pendiente: cuenta Fibra Uno + alta Oracle con Jesús.',
      actividadesCobranza: [
        {
          id: 'act-nuevo-1',
          type: 'nota',
          label: 'Handoff Legal → CxC',
          detail:
            'Contrato firmado. Claudia asignó a Sofía Herrera. Solicitar cuenta bancaria Fibra Uno.',
          createdBy: 'Sistema',
          createdAt: daysAgo(1),
        },
      ],
      casoLegalId: 'legal-agro-demo',
      pipelineStage: 'recibido_legal',
      recibidoDeLegalAt: daysAgo(1),
      hojaAcuerdos: hoja({
        folio: 'HA-2026-0088',
        m2Acordados: 4_200,
        precioUsdM2: 4.4,
        rentaMensual: 195_000,
        moneda: 'MXN',
        mesesGracia: 3,
        mesesDeposito: 2,
        mesesRentaAdelantada: 1,
        fechaFirma: daysAgo(2),
        leasingOfficer: 'Israel',
      }),
      contrato: {
        referenciaLegal: 'CTR-TIJ-2026-007',
        tipoDocumento: 'Arrendamiento industrial',
        fechaInicio: daysFromNow(20),
        fechaVencimiento: daysFromNow(1_840),
        abogadoAsignado: 'Miguel Soto',
        esPropiedadFuno: true,
        estatusLegal: 'Firmado — enviado a CxC',
        casoLegalId: 'legal-agro-demo',
      },
      calendarioPagos: buildCalendarioContrato({
        diaPago: 'Día 5',
        renta: 195_000,
        fechaInicio: daysFromNow(5),
        plazoMeses: 60,
        mesesGracia: 3,
        mesesDeposito: 2,
        mesesRentaAdelantada: 1,
        rentasPagadas: 0,
      }),
      portalPago: buildPortalSinOc(),
      createdAt: now,
      updatedAt: now,
    },
    {
      id: 'cxc-tramex',
      empresa: 'Tramex Logistics México',
      rfc: 'TLM190511QR8',
      contactoPagosNombre: 'Marcela Ríos',
      contactoPagosEmail: 'cuentas.por.pagar@tramex.mx',
      contactoPagosTelefono: '+52 55 5123 7788',
      ejecutivoId: 'cxc-ej-1',
      ejecutivoNombre: 'Mariana López',
      estatusPagos: 'Al corriente',
      scoreRiesgo: 28,
      scoreLabel: 'Bajo',
      scoreFactores: [
        'Recién recibido de Legal (ayer)',
        'Cliente con portal Coupa — requiere OC',
        'Sin historial Parks',
      ],
      tipoCliente: 'Con portal',
      diaPagoAcordado: 'Día 10',
      moneda: 'USD',
      rentaMensual: 58_200,
      montoAdeudoTotal: 0,
      diasEnMora: 0,
      ultimaFechaPago: null,
      nave: 'Nave 3',
      parque: 'Parks Toluca',
      contratosActivos: 1,
      requiereOc: true,
      cuentaBancaria: null,
      cicloEstatus: 'Gracia',
      jesusContratoDadoAlta: false,
      facturas: [],
      ordenCompra: {
        numeroOc: null,
        estatus: 'Esperando OC',
        diasSinOc: 0,
        intentosRecordatorio: 0,
        fechaPagoProgramada: null,
      },
      deposito: {
        montoOriginal: 116_400,
        montoADevolver: 116_400,
        estatus: 'Retenido',
        caratulaBancariaRecibida: false,
        cartaSolicitudRecibida: false,
        enProcesoFirmasInternas: false,
        razonRetencion: null,
      },
      escalacionInpc: null,
      holdover: null,
      notasCobranza:
        'Handoff Legal → CxC hace 6h. Asignar cuenta Fibra Uno USD y coordinar OC de pagos iniciales con CxP.',
      actividadesCobranza: [
        {
          id: 'act-tramex-1',
          type: 'nota',
          label: 'Contrato firmado — handoff CxC',
          detail:
            'Legal (Miguel Soto) cerró CTR-TOL-2026-014. Renta USD 58,200 · gracia 2 meses · depósito 2 meses. Cliente requiere OC en Coupa.',
          createdBy: 'Sistema · Legal',
          createdAt: new Date(Date.now() - 6 * 3_600_000).toISOString(),
        },
      ],
      casoLegalId: 'legal-tramex-demo',
      pipelineStage: 'recibido_legal',
      recibidoDeLegalAt: new Date(Date.now() - 6 * 3_600_000).toISOString(),
      hojaAcuerdos: hoja({
        folio: 'HA-2026-0156',
        m2Acordados: 12_000,
        precioUsdM2: 4.85,
        rentaMensual: 58_200,
        moneda: 'USD',
        plazoMeses: 72,
        mesesGracia: 2,
        mesesDeposito: 2,
        mesesRentaAdelantada: 1,
        fechaFirma: daysAgo(1),
        leasingOfficer: 'Bruyel',
        escalacionTipo: 'INPC',
      }),
      contrato: {
        referenciaLegal: 'CTR-TOL-2026-014',
        tipoDocumento: 'Arrendamiento industrial',
        fechaInicio: daysFromNow(15),
        fechaVencimiento: daysFromNow(2_190),
        abogadoAsignado: 'Miguel Soto',
        esPropiedadFuno: true,
        estatusLegal: 'Firmado — enviado a CxC',
        casoLegalId: 'legal-tramex-demo',
      },
      calendarioPagos: buildCalendarioContrato({
        diaPago: 'Día 10',
        renta: 58_200,
        fechaInicio: daysFromNow(15),
        plazoMeses: 72,
        mesesGracia: 2,
        mesesDeposito: 2,
        mesesRentaAdelantada: 1,
        rentasPagadas: 0,
      }),
      portalPago: buildPortalConOc({
        portalNombre: 'Coupa Tramex',
        portalUrl: 'https://tramex.coupahost.com/suppliers',
        ocRecibida: false,
        cargada: false,
        programada: false,
      }),
      createdAt: now,
      updatedAt: now,
    },
    {
      id: 'cxc-oracle-pend',
      empresa: 'Nearshore Components MX',
      rfc: 'NCM220908AB2',
      contactoPagosNombre: 'Iván Campos',
      contactoPagosEmail: 'finance@nearshorecomp.mx',
      contactoPagosTelefono: '+52 442 180 9900',
      ejecutivoId: 'cxc-ej-2',
      ejecutivoNombre: 'Carlos Ruiz',
      estatusPagos: 'Al corriente',
      scoreRiesgo: 30,
      scoreLabel: 'Bajo',
      scoreFactores: ['Esperando alta Oracle de Jesús', 'Cuenta Fibra ya asignada'],
      tipoCliente: 'Sin portal',
      diaPagoAcordado: 'Día 15',
      moneda: 'USD',
      rentaMensual: 36_800,
      montoAdeudoTotal: 0,
      diasEnMora: 0,
      ultimaFechaPago: null,
      nave: 'Nave 5',
      parque: 'Parks Querétaro',
      contratosActivos: 1,
      requiereOc: false,
      cuentaBancaria: 'USD-FIBRA-4421',
      cicloEstatus: 'Gracia',
      jesusContratoDadoAlta: false,
      facturas: [],
      ordenCompra: null,
      deposito: {
        montoOriginal: 73_600,
        montoADevolver: 73_600,
        estatus: 'Retenido',
        caratulaBancariaRecibida: false,
        cartaSolicitudRecibida: false,
        enProcesoFirmasInternas: false,
        razonRetencion: null,
      },
      escalacionInpc: null,
      holdover: null,
      notasCobranza: 'Cuenta bancaria lista · falta alta Oracle para emitir depósito.',
      actividadesCobranza: [],
      casoLegalId: 'legal-nearshore-demo',
      pipelineStage: 'alta_oracle',
      recibidoDeLegalAt: daysAgo(4),
      hojaAcuerdos: hoja({
        folio: 'HA-2026-0140',
        m2Acordados: 7_800,
        precioUsdM2: 4.72,
        rentaMensual: 36_800,
        moneda: 'USD',
        fechaFirma: daysAgo(5),
        leasingOfficer: 'UAE',
      }),
      contrato: {
        referenciaLegal: 'CTR-QRO-2026-011',
        tipoDocumento: 'Arrendamiento industrial',
        fechaInicio: daysFromNow(10),
        fechaVencimiento: daysFromNow(1_830),
        abogadoAsignado: 'Patricia Núñez',
        esPropiedadFuno: true,
        estatusLegal: 'Firmado — enviado a CxC',
        casoLegalId: 'legal-nearshore-demo',
      },
      calendarioPagos: buildCalendarioContrato({
        diaPago: 'Día 15',
        renta: 36_800,
        fechaInicio: daysFromNow(12),
        plazoMeses: 60,
        mesesGracia: 2,
        mesesDeposito: 2,
        mesesRentaAdelantada: 1,
        rentasPagadas: 0,
      }),
      portalPago: buildPortalSinOc(),
      createdAt: now,
      updatedAt: now,
    },
    {
      id: 'cxc-steelmex',
      empresa: 'SteelMex Industrias',
      rfc: 'SMI150403XY9',
      contactoPagosNombre: 'Roberto Cárdenas',
      contactoPagosEmail: 'pagos@steelmex.mx',
      contactoPagosTelefono: '+52 81 8555 4400',
      ejecutivoId: 'cxc-ej-1',
      ejecutivoNombre: 'Mariana López',
      estatusPagos: 'Mora grave',
      scoreRiesgo: 82,
      scoreLabel: 'Crítico',
      scoreFactores: [
        '2 facturas vencidas sin pago',
        '22 días de mora acumulada',
        'Sin respuesta a últimos 2 correos',
      ],
      tipoCliente: 'Sin portal',
      diaPagoAcordado: 'Día 5',
      moneda: 'MXN',
      rentaMensual: 285_000,
      montoAdeudoTotal: 570_000,
      diasEnMora: 22,
      ultimaFechaPago: daysAgo(55),
      nave: 'Nave 8',
      parque: 'Parks Monterrey',
      contratosActivos: 1,
      requiereOc: false,
      cuentaBancaria: '012345678901112233',
      cicloEstatus: 'Activo',
      jesusContratoDadoAlta: true,
      facturas: [
        {
          id: 'inv-steel-1',
          numeroFactura: 'FAC-2026-5510',
          tipo: 'Renta mensual',
          monto: 285_000,
          moneda: 'MXN',
          fechaEmision: daysAgo(40),
          fechaLimitePago: daysAgo(22),
          diasVencida: 22,
          estatus: 'Vencida',
        },
        {
          id: 'inv-steel-2',
          numeroFactura: 'FAC-2026-5601',
          tipo: 'Renta mensual',
          monto: 285_000,
          moneda: 'MXN',
          fechaEmision: daysAgo(12),
          fechaLimitePago: daysAgo(2),
          diasVencida: 2,
          estatus: 'Vencida',
        },
      ],
      ordenCompra: null,
      deposito: null,
      escalacionInpc: null,
      holdover: null,
      notasCobranza:
        'Cliente dice problemas de flujo. Compromiso verbal de pagar media renta el martes.',
      actividadesCobranza: [
        {
          id: 'act-steel-1',
          type: 'llamada',
          label: 'Llamada de cobranza',
          detail:
            'Roberto: caja apretada por retraso de clientes finales. Ofrece $285k el martes.',
          createdBy: 'Mariana López',
          createdAt: daysAgo(2),
        },
        {
          id: 'act-steel-2',
          type: 'compromiso_pago',
          label: 'Compromiso de pago',
          detail: 'Compromiso $285,000 MXN para martes. Verificar cuenta Fibra.',
          createdBy: 'Mariana López',
          createdAt: daysAgo(2),
        },
      ],
      seguimientoCobranza: seguimiento({
        estado: 'Compromiso de pago',
        compromisoPagoFecha: daysFromNow(2),
        compromisoMonto: 285_000,
        proximaAccionFecha: daysFromNow(3),
        proximaAccionNota:
          'Si no cae el pago parcial, llamar y escalar a Claudia',
        ultimoContactoAt: daysAgo(2),
        ultimoContactoTipo: 'compromiso_pago',
      }),
      casoLegalId: 'legal-steel-demo',
      pipelineStage: 'cobranza_activa',
      recibidoDeLegalAt: daysAgo(400),
      hojaAcuerdos: hoja({
        folio: 'HA-2024-0888',
        m2Acordados: 5_400,
        precioUsdM2: 5.1,
        rentaMensual: 285_000,
        moneda: 'MXN',
        mesesGracia: 1,
        leasingOfficer: 'Bruyel',
      }),
      contrato: {
        referenciaLegal: 'CTR-MTY-2024-102',
        tipoDocumento: 'Arrendamiento industrial',
        fechaInicio: daysAgo(380),
        fechaVencimiento: daysFromNow(1_100),
        abogadoAsignado: 'Miguel Soto',
        esPropiedadFuno: true,
        estatusLegal: 'En cobranza',
        casoLegalId: 'legal-steel-demo',
      },
      calendarioPagos: buildCalendarioContrato({
        diaPago: 'Día 5',
        renta: 285_000,
        fechaInicio: daysAgo(380),
        plazoMeses: 60,
        mesesGracia: 1,
        mesesDeposito: 2,
        mesesRentaAdelantada: 1,
        rentasPagadas: 10,
      }),
      portalPago: buildPortalSinOc(),
      createdAt: now,
      updatedAt: now,
    },
    {
      id: 'cxc-packsur',
      empresa: 'PackSur Empaques',
      rfc: 'PSE180722HJ4',
      contactoPagosNombre: 'Diana Flores',
      contactoPagosEmail: 'cxp@packsur.mx',
      contactoPagosTelefono: '+52 33 3600 7788',
      ejecutivoId: 'cxc-ej-2',
      ejecutivoNombre: 'Carlos Ruiz',
      estatusPagos: 'Mora leve',
      scoreRiesgo: 55,
      scoreLabel: 'Medio',
      scoreFactores: [
        'Renta del mes sin pagar (7 días)',
        'Histórico puntual salvo 2 retrasos en 2025',
      ],
      tipoCliente: 'Sin portal',
      diaPagoAcordado: 'Día 10',
      moneda: 'MXN',
      rentaMensual: 198_000,
      montoAdeudoTotal: 198_000,
      diasEnMora: 7,
      ultimaFechaPago: daysAgo(37),
      nave: 'Nave 4',
      parque: 'Parks Guadalajara',
      contratosActivos: 1,
      requiereOc: false,
      cuentaBancaria: '014580001234567890',
      cicloEstatus: 'Activo',
      jesusContratoDadoAlta: true,
      facturas: [
        {
          id: 'inv-pack-1',
          numeroFactura: 'FAC-2026-4418',
          tipo: 'Renta mensual',
          monto: 198_000,
          moneda: 'MXN',
          fechaEmision: daysAgo(18),
          fechaLimitePago: daysAgo(7),
          diasVencida: 7,
          estatus: 'Vencida',
        },
      ],
      ordenCompra: null,
      deposito: null,
      escalacionInpc: null,
      holdover: null,
      notasCobranza: 'Diana pidió 5 días más por cierre de mes fiscal.',
      actividadesCobranza: [
        {
          id: 'act-pack-1',
          type: 'email',
          label: 'Correo de seguimiento',
          detail: 'Recordatorio de renta FAC-2026-4418 vencida.',
          createdBy: 'Carlos Ruiz',
          createdAt: daysAgo(5),
        },
        {
          id: 'act-pack-2',
          type: 'compromiso_pago',
          label: 'Compromiso de pago',
          detail: 'Compromiso de pago total $198,000 el viernes.',
          createdBy: 'Carlos Ruiz',
          createdAt: daysAgo(1),
        },
      ],
      seguimientoCobranza: seguimiento({
        estado: 'Compromiso de pago',
        compromisoPagoFecha: daysFromNow(2),
        compromisoMonto: 198_000,
        proximaAccionFecha: daysFromNow(2),
        proximaAccionNota: 'Confirmar pago PackSur; si no, segunda llamada',
        ultimoContactoAt: daysAgo(1),
        ultimoContactoTipo: 'compromiso_pago',
      }),
      casoLegalId: 'legal-pack-demo',
      pipelineStage: 'cobranza_activa',
      recibidoDeLegalAt: daysAgo(500),
      hojaAcuerdos: hoja({
        folio: 'HA-2024-0555',
        m2Acordados: 4_200,
        precioUsdM2: 4.55,
        rentaMensual: 198_000,
        moneda: 'MXN',
        leasingOfficer: 'UAE',
      }),
      contrato: {
        referenciaLegal: 'CTR-GDL-2024-077',
        tipoDocumento: 'Arrendamiento industrial',
        fechaInicio: daysAgo(480),
        fechaVencimiento: daysFromNow(900),
        abogadoAsignado: 'Jane Austen',
        esPropiedadFuno: false,
        estatusLegal: 'En cobranza',
        casoLegalId: 'legal-pack-demo',
      },
      calendarioPagos: buildCalendarioContrato({
        diaPago: 'Día 10',
        renta: 198_000,
        fechaInicio: daysAgo(480),
        plazoMeses: 48,
        mesesGracia: 2,
        mesesDeposito: 2,
        mesesRentaAdelantada: 1,
        rentasPagadas: 14,
      }),
      portalPago: buildPortalSinOc(),
      createdAt: now,
      updatedAt: now,
    },
    {
      id: 'cxc-autoparts',
      empresa: 'AutoParts Bajío',
      rfc: 'APB120918KL2',
      contactoPagosNombre: 'Héctor Núñez',
      contactoPagosEmail: 'tesoreria@autopartsbajio.mx',
      contactoPagosTelefono: '+52 442 215 3300',
      ejecutivoId: 'cxc-ej-1',
      ejecutivoNombre: 'Mariana López',
      estatusPagos: 'Mora grave',
      scoreRiesgo: 91,
      scoreLabel: 'Crítico',
      scoreFactores: [
        '45 días sin pago',
        '3 facturas vencidas',
        'Ya escalado a Gerente CxC',
      ],
      tipoCliente: 'Con portal',
      diaPagoAcordado: 'Día 15',
      moneda: 'USD',
      rentaMensual: 51_200,
      montoAdeudoTotal: 153_600,
      diasEnMora: 45,
      ultimaFechaPago: daysAgo(78),
      nave: 'Nave 6',
      parque: 'Parks Querétaro',
      contratosActivos: 1,
      requiereOc: true,
      cuentaBancaria: 'USD-FIBRA-2200',
      cicloEstatus: 'Activo',
      jesusContratoDadoAlta: true,
      facturas: [
        {
          id: 'inv-auto-1',
          numeroFactura: 'FAC-USD-2201',
          tipo: 'Renta mensual',
          monto: 51_200,
          moneda: 'USD',
          fechaEmision: daysAgo(70),
          fechaLimitePago: daysAgo(45),
          diasVencida: 45,
          estatus: 'Vencida',
        },
        {
          id: 'inv-auto-2',
          numeroFactura: 'FAC-USD-2210',
          tipo: 'Renta mensual',
          monto: 51_200,
          moneda: 'USD',
          fechaEmision: daysAgo(40),
          fechaLimitePago: daysAgo(15),
          diasVencida: 15,
          estatus: 'Vencida',
        },
        {
          id: 'inv-auto-3',
          numeroFactura: 'FAC-USD-2218',
          tipo: 'Renta mensual',
          monto: 51_200,
          moneda: 'USD',
          fechaEmision: daysAgo(12),
          fechaLimitePago: daysFromNow(3),
          diasVencida: 0,
          estatus: 'OC_pendiente',
        },
      ],
      ordenCompra: {
        numeroOc: null,
        estatus: 'Esperando OC',
        diasSinOc: 12,
        intentosRecordatorio: 4,
        fechaPagoProgramada: null,
      },
      deposito: null,
      escalacionInpc: null,
      holdover: null,
      notasCobranza:
        'Escalado a Claudia. Cliente no responde. Evaluar carta formal.',
      actividadesCobranza: [
        {
          id: 'act-auto-1',
          type: 'escalar_claudia',
          label: 'Escalado a Claudia',
          detail: '45d mora · 3 facturas · sin respuesta CxP.',
          createdBy: 'Mariana López',
          createdAt: daysAgo(3),
        },
      ],
      seguimientoCobranza: seguimiento({
        estado: 'Escalado',
        compromisoPagoFecha: null,
        compromisoMonto: null,
        proximaAccionFecha: daysFromNow(1),
        proximaAccionNota:
          'Claudia: decidir carta formal vs. llamada a DG del cliente',
        ultimoContactoAt: daysAgo(3),
        ultimoContactoTipo: 'escalar_claudia',
      }),
      casoLegalId: 'legal-auto-demo',
      pipelineStage: 'cobranza_activa',
      recibidoDeLegalAt: daysAgo(600),
      hojaAcuerdos: hoja({
        folio: 'HA-2023-0912',
        m2Acordados: 10_500,
        precioUsdM2: 4.88,
        rentaMensual: 51_200,
        moneda: 'USD',
        leasingOfficer: 'Bruyel',
      }),
      contrato: {
        referenciaLegal: 'CTR-QRO-2023-044',
        tipoDocumento: 'Arrendamiento industrial',
        fechaInicio: daysAgo(580),
        fechaVencimiento: daysFromNow(700),
        abogadoAsignado: 'Patricia Núñez',
        esPropiedadFuno: true,
        estatusLegal: 'En cobranza',
        casoLegalId: 'legal-auto-demo',
      },
      calendarioPagos: buildCalendarioContrato({
        diaPago: 'Día 15',
        renta: 51_200,
        fechaInicio: daysAgo(580),
        plazoMeses: 60,
        mesesGracia: 2,
        mesesDeposito: 2,
        mesesRentaAdelantada: 1,
        rentasPagadas: 16,
      }),
      portalPago: buildPortalConOc({
        portalNombre: 'Coupa AutoParts',
        portalUrl: 'https://autoparts.coupahost.com',
        ocRecibida: false,
        cargada: false,
        programada: false,
      }),
      createdAt: now,
      updatedAt: now,
    },
    {
      id: 'cxc-pharma',
      empresa: 'PharmaLog Centro',
      rfc: 'PLC190201AB7',
      contactoPagosNombre: 'Sofía Beltrán',
      contactoPagosEmail: 'ap@pharmalog.mx',
      contactoPagosTelefono: '+52 55 5000 6677',
      ejecutivoId: 'cxc-ej-2',
      ejecutivoNombre: 'Carlos Ruiz',
      estatusPagos: 'Mora leve',
      scoreRiesgo: 48,
      scoreLabel: 'Medio',
      scoreFactores: [
        'Sin pago este mes (11 días)',
        'Contacto CxP responde pero dilata',
      ],
      tipoCliente: 'Sin portal',
      diaPagoAcordado: 'Día 5',
      moneda: 'MXN',
      rentaMensual: 412_000,
      montoAdeudoTotal: 412_000,
      diasEnMora: 11,
      ultimaFechaPago: daysAgo(41),
      nave: 'Nave 2',
      parque: 'Parks Toluca',
      contratosActivos: 1,
      requiereOc: false,
      cuentaBancaria: '012345678909988776',
      cicloEstatus: 'Activo',
      jesusContratoDadoAlta: true,
      facturas: [
        {
          id: 'inv-pharma-1',
          numeroFactura: 'FAC-2026-6102',
          tipo: 'Renta mensual',
          monto: 412_000,
          moneda: 'MXN',
          fechaEmision: daysAgo(22),
          fechaLimitePago: daysAgo(11),
          diasVencida: 11,
          estatus: 'Vencida',
        },
      ],
      ordenCompra: null,
      deposito: null,
      escalacionInpc: null,
      holdover: null,
      notasCobranza: 'Sofía: pago en trámite de autorización de CFO.',
      actividadesCobranza: [
        {
          id: 'act-pharma-1',
          type: 'llamada',
          label: 'Llamada de cobranza',
          detail: 'Pago en autorización CFO. Pedir seguimiento mañana.',
          createdBy: 'Carlos Ruiz',
          createdAt: daysAgo(1),
        },
      ],
      seguimientoCobranza: seguimiento({
        estado: 'En seguimiento',
        compromisoPagoFecha: daysFromNow(2),
        compromisoMonto: 412_000,
        proximaAccionFecha: daysFromNow(1),
        proximaAccionNota: 'Llamar a Sofía para status de autorización CFO',
        ultimoContactoAt: daysAgo(1),
        ultimoContactoTipo: 'llamada',
      }),
      casoLegalId: 'legal-pharma-demo',
      pipelineStage: 'cobranza_activa',
      recibidoDeLegalAt: daysAgo(350),
      hojaAcuerdos: hoja({
        folio: 'HA-2025-0110',
        m2Acordados: 8_800,
        precioUsdM2: 4.95,
        rentaMensual: 412_000,
        moneda: 'MXN',
        leasingOfficer: 'UAE',
      }),
      contrato: {
        referenciaLegal: 'CTR-TOL-2025-019',
        tipoDocumento: 'Arrendamiento industrial',
        fechaInicio: daysAgo(330),
        fechaVencimiento: daysFromNow(1_200),
        abogadoAsignado: 'Miguel Soto',
        esPropiedadFuno: true,
        estatusLegal: 'En cobranza',
        casoLegalId: 'legal-pharma-demo',
      },
      calendarioPagos: buildCalendarioContrato({
        diaPago: 'Día 5',
        renta: 412_000,
        fechaInicio: daysAgo(330),
        plazoMeses: 60,
        mesesGracia: 2,
        mesesDeposito: 2,
        mesesRentaAdelantada: 1,
        rentasPagadas: 9,
      }),
      portalPago: buildPortalSinOc(),
      createdAt: now,
      updatedAt: now,
    },
  ];

  return finalizeAccounts(drafts);
};

const buildDemoAnomalies = (): CxcAnomaly[] => [
  {
    id: 'anom-1',
    severity: 'critical',
    accountId: 'cxc-norte',
    empresa: 'Distribuciones Norte S.A.',
    title: 'Factura no emitida por OC pendiente',
    detail: 'Sin OC desde hace 8 días · renta $318,000 MXN en riesgo.',
    suggestedAction:
      'Llamar CxP del cliente y escalar a Claudia si no responde hoy.',
    resolved: false,
    resolvedNote: null,
  },
  {
    id: 'anom-steel',
    severity: 'critical',
    accountId: 'cxc-steelmex',
    empresa: 'SteelMex Industrias',
    title: 'Dos rentas vencidas sin pago',
    detail:
      'Adeudo $570,000 MXN · 22 días de mora · compromiso parcial martes.',
    suggestedAction:
      'Verificar compromiso $285k; si no cae, escalar a Claudia.',
    resolved: false,
    resolvedNote: null,
  },
  {
    id: 'anom-auto',
    severity: 'critical',
    accountId: 'cxc-autoparts',
    empresa: 'AutoParts Bajío',
    title: 'Mora 45 días — ya escalado',
    detail: '3 facturas · $153,600 USD · sin respuesta CxP.',
    suggestedAction: 'Claudia: carta formal o llamada a DG.',
    resolved: false,
    resolvedNote: null,
  },
  {
    id: 'anom-pack',
    severity: 'warning',
    accountId: 'cxc-packsur',
    empresa: 'PackSur Empaques',
    title: 'Renta del mes sin pagar',
    detail: '7 días de mora · compromiso de pago el viernes.',
    suggestedAction: 'Confirmar depósito PackSur en fecha compromiso.',
    resolved: false,
    resolvedNote: null,
  },
  {
    id: 'anom-pharma',
    severity: 'warning',
    accountId: 'cxc-pharma',
    empresa: 'PharmaLog Centro',
    title: 'Pago en autorización CFO',
    detail: '11 días de mora · $412,000 MXN · CxP dilata.',
    suggestedAction: 'Seguimiento diario hasta autorización CFO.',
    resolved: false,
    resolvedNote: null,
  },
  {
    id: 'anom-2',
    severity: 'warning',
    accountId: 'cxc-funo',
    empresa: 'ColdChain Logistics MX',
    title: 'Pago vencido 3 días',
    detail: 'FAC-USD-1102 por $42,500 USD · portal ya programó pago.',
    suggestedAction: 'Verificar caída en cuenta Fibra Uno mañana.',
    resolved: false,
    resolvedNote: null,
  },
  {
    id: 'anom-3',
    severity: 'info',
    accountId: 'cxc-logimex',
    empresa: 'LogiMex S.A. de C.V.',
    title: 'INPC aplica en 30 días',
    detail: 'Renta sube de $425,000 a $442,850 MXN (+4.2%).',
    suggestedAction: 'Confirmar que Jesús actualice Oracle 5 días antes.',
    resolved: false,
    resolvedNote: null,
  },
  {
    id: 'anom-4',
    severity: 'warning',
    accountId: 'cxc-nuevo',
    empresa: 'AgroExport Pacífico',
    title: 'Alta Oracle sin confirmar',
    detail: 'Contrato en gracia · Jesús no marcó alta en Oracle.',
    suggestedAction: 'Crear tarea de seguimiento ≤ 3 días hábiles.',
    resolved: false,
    resolvedNote: null,
  },
  {
    id: 'anom-5',
    severity: 'critical',
    accountId: 'cxc-tramex',
    empresa: 'Tramex Logistics México',
    title: 'Nuevo handoff Legal → CxC',
    detail:
      'Contrato CTR-TOL-2026-014 firmado ayer. Requiere cuenta Fibra USD + OC Coupa para pagos iniciales.',
    suggestedAction:
      'Abrir expediente, asignar ejecutivo y solicitar OC de depósito + 1ra renta.',
    resolved: false,
    resolvedNote: null,
  },
];

const accountsById = new Map<string, CxcAccount>();
const anomaliesById = new Map<string, CxcAnomaly>();
let seeded = false;

const ensureSeed = (): void => {
  if (seeded) {
    return;
  }

  for (const account of buildDemoAccounts()) {
    accountsById.set(account.id, account);
  }

  for (const anomaly of buildDemoAnomalies()) {
    anomaliesById.set(anomaly.id, anomaly);
  }

  seeded = true;
};

export const cxcStore = {
  listAccounts: (): CxcAccount[] => {
    ensureSeed();
    return Array.from(accountsById.values()).sort(
      (left, right) => right.scoreRiesgo - left.scoreRiesgo,
    );
  },

  getAccount: (accountId: string): CxcAccount | undefined => {
    ensureSeed();
    return accountsById.get(accountId);
  },

  upsertAccount: (account: CxcAccount): CxcAccount => {
    ensureSeed();
    const next = {
      ...account,
      actividadesCobranza: account.actividadesCobranza ?? [],
      updatedAt: new Date().toISOString(),
    };
    accountsById.set(next.id, next);
    return next;
  },

  listAnomalies: (): CxcAnomaly[] => {
    ensureSeed();
    return Array.from(anomaliesById.values());
  },

  resolveAnomaly: (
    anomalyId: string,
    note: string,
  ): CxcAnomaly | undefined => {
    ensureSeed();
    const anomaly = anomaliesById.get(anomalyId);

    if (!anomaly) {
      return undefined;
    }

    const next = {
      ...anomaly,
      resolved: true,
      resolvedNote: note,
    };
    anomaliesById.set(anomalyId, next);
    return next;
  },
};
