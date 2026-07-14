import { type CxcAccount, type CxcAnomaly } from '../types/cxc.types';

const daysFromNow = (days: number): string => {
  const date = new Date();
  date.setDate(date.getDate() + days);
  return date.toISOString().slice(0, 10);
};

const daysAgo = (days: number): string => daysFromNow(-days);

const buildDemoAccounts = (): CxcAccount[] => {
  const now = new Date().toISOString();

  return [
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
      casoLegalId: null,
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
      ],
      casoLegalId: null,
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
      casoLegalId: null,
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
      casoLegalId: null,
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
      notasCobranza: 'Portal aceptó factura · pago programado en 4 días.',
      actividadesCobranza: [],
      casoLegalId: null,
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
      actividadesCobranza: [],
      casoLegalId: null,
      createdAt: now,
      updatedAt: now,
    },
  ];
};

const buildDemoAnomalies = (): CxcAnomaly[] => [
  {
    id: 'anom-1',
    severity: 'critical',
    accountId: 'cxc-norte',
    empresa: 'Distribuciones Norte S.A.',
    title: 'Factura no emitida por OC pendiente',
    detail: 'Sin OC desde hace 8 días · renta $318,000 MXN en riesgo.',
    suggestedAction: 'Llamar CxP del cliente y escalar a Claudia si no responde hoy.',
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
