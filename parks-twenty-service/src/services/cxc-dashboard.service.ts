import { cxcStore } from './cxc.store';
import {
  type CxcAccount,
  type CxcCobranzaActionType,
  type CxcCobranzaActivity,
  type CxcDashboardResult,
  type CxcEjecutivoLoad,
  type CxcPaymentSuggestion,
  type CxcRiskLabel,
} from '../types/cxc.types';

const RISK_ORDER: CxcRiskLabel[] = ['Crítico', 'Alto', 'Medio', 'Bajo'];

const scoreToLabel = (score: number): CxcRiskLabel => {
  if (score <= 30) {
    return 'Bajo';
  }

  if (score <= 60) {
    return 'Medio';
  }

  if (score <= 80) {
    return 'Alto';
  }

  return 'Crítico';
};

const appendActivity = (
  account: CxcAccount,
  activity: Omit<CxcCobranzaActivity, 'id' | 'createdAt'> & {
    id?: string;
    createdAt?: string;
  },
): CxcCobranzaActivity[] => {
  const entry: CxcCobranzaActivity = {
    id: activity.id ?? `act-${Date.now()}-${Math.random().toString(36).slice(2, 7)}`,
    type: activity.type,
    label: activity.label,
    detail: activity.detail,
    createdBy: activity.createdBy,
    createdAt: activity.createdAt ?? new Date().toISOString(),
  };

  return [entry, ...(account.actividadesCobranza ?? [])].slice(0, 40);
};

const ACTION_LABELS: Record<CxcCobranzaActionType, string> = {
  llamada: 'Llamada de cobranza',
  email: 'Correo de seguimiento',
  whatsapp: 'WhatsApp CxP',
  nota: 'Nota operativa',
  escalar_claudia: 'Escalado a Claudia',
  recordatorio_oc: 'Recordatorio OC',
  pago_aplicado: 'Pago aplicado',
  oc_registrada: 'OC registrada',
};

const isVencida = (account: CxcAccount): boolean =>
  account.montoAdeudoTotal > 0 &&
  (account.estatusPagos === 'Mora leve' ||
    account.estatusPagos === 'Mora grave' ||
    account.estatusPagos === 'Holdover' ||
    account.diasEnMora > 0);

const buildEjecutivoLoads = (accounts: CxcAccount[]): CxcEjecutivoLoad[] => {
  const byEjecutivo = new Map<string, CxcEjecutivoLoad>();

  for (const account of accounts) {
    const current = byEjecutivo.get(account.ejecutivoId) ?? {
      ejecutivoId: account.ejecutivoId,
      ejecutivoNombre: account.ejecutivoNombre,
      cuentas: 0,
      enMora: 0,
      montoVencido: 0,
      ocPendientes: 0,
    };

    current.cuentas += 1;

    if (isVencida(account)) {
      current.enMora += 1;
      current.montoVencido += account.montoAdeudoTotal;
    }

    if (account.ordenCompra?.estatus === 'Esperando OC') {
      current.ocPendientes += 1;
    }

    byEjecutivo.set(account.ejecutivoId, current);
  }

  return Array.from(byEjecutivo.values()).sort(
    (left, right) => right.montoVencido - left.montoVencido,
  );
};

const buildRiskDistribution = (accounts: CxcAccount[]) =>
  RISK_ORDER.map((label) => {
    const matching = accounts.filter((account) => account.scoreLabel === label);

    return {
      label,
      count: matching.length,
      monto: matching.reduce(
        (sum, account) => sum + account.montoAdeudoTotal,
        0,
      ),
    };
  });

const buildForecast = (accounts: CxcAccount[]) => {
  const rentaEsperada = accounts
    .filter((account) => account.cicloEstatus === 'Activo')
    .reduce((sum, account) => sum + account.rentaMensual, 0);

  const enRiesgo = accounts
    .filter(
      (account) =>
        account.scoreLabel === 'Alto' || account.scoreLabel === 'Crítico',
    )
    .reduce((sum, account) => sum + Math.max(account.rentaMensual, account.montoAdeudoTotal), 0);

  const probabilidadPct = Math.max(
    55,
    Math.min(96, Math.round(100 - (enRiesgo / Math.max(rentaEsperada, 1)) * 40)),
  );

  return {
    d7: {
      esperado: Math.round(rentaEsperada * 0.28),
      enRiesgo: Math.round(enRiesgo * 0.22),
      probabilidadPct: Math.min(98, probabilidadPct + 4),
    },
    d30: {
      esperado: Math.round(rentaEsperada * 1.05),
      enRiesgo: Math.round(enRiesgo),
      probabilidadPct,
    },
    d90: {
      esperado: Math.round(rentaEsperada * 3.1),
      enRiesgo: Math.round(enRiesgo * 2.4),
      probabilidadPct: Math.max(50, probabilidadPct - 6),
    },
  };
};

export const cxcDashboardService = {
  getDashboard: (filters?: {
    ejecutivoId?: string;
    riskLabel?: CxcRiskLabel;
  }): CxcDashboardResult => {
    let accounts = cxcStore.listAccounts();

    if (filters?.ejecutivoId) {
      accounts = accounts.filter(
        (account) => account.ejecutivoId === filters.ejecutivoId,
      );
    }

    if (filters?.riskLabel) {
      accounts = accounts.filter(
        (account) => account.scoreLabel === filters.riskLabel,
      );
    }

    const allAccounts = cxcStore.listAccounts();
    const carteraTotal = allAccounts.reduce(
      (sum, account) =>
        sum +
        (account.cicloEstatus === 'Activo' || account.cicloEstatus === 'Holdover'
          ? account.rentaMensual
          : 0) +
        account.montoAdeudoTotal,
      0,
    );
    const carteraVencida = allAccounts
      .filter(isVencida)
      .reduce((sum, account) => sum + account.montoAdeudoTotal, 0);
    const carteraCorriente = Math.max(0, carteraTotal - carteraVencida);

    const priorityAccounts = [...accounts]
      .sort((left, right) => {
        if (right.scoreRiesgo !== left.scoreRiesgo) {
          return right.scoreRiesgo - left.scoreRiesgo;
        }

        return right.diasEnMora - left.diasEnMora;
      })
      .slice(0, 8);

    return {
      generatedAt: new Date().toISOString(),
      kpis: {
        carteraTotal,
        carteraVencida,
        carteraCorriente,
        cuentasActivas: allAccounts.filter(
          (account) =>
            account.cicloEstatus === 'Activo' ||
            account.cicloEstatus === 'Holdover' ||
            account.cicloEstatus === 'Gracia',
        ).length,
        moraGraveCount: allAccounts.filter(
          (account) =>
            account.estatusPagos === 'Mora grave' ||
            account.estatusPagos === 'Holdover',
        ).length,
        ocPendientes: allAccounts.filter(
          (account) => account.ordenCompra?.estatus === 'Esperando OC',
        ).length,
        holdoversActivos: allAccounts.filter(
          (account) => account.holdover != null,
        ).length,
        depositosEnProceso: allAccounts.filter(
          (account) =>
            account.deposito?.estatus === 'En proceso de devolución',
        ).length,
        notasCreditoPendientes: 1,
      },
      forecast: buildForecast(allAccounts),
      riskDistribution: buildRiskDistribution(allAccounts),
      ejecutivos: buildEjecutivoLoads(allAccounts),
      anomalies: cxcStore.listAnomalies().filter((anomaly) => !anomaly.resolved),
      priorityAccounts,
      accounts,
    };
  },

  getAccount: (accountId: string): CxcAccount | undefined =>
    cxcStore.getAccount(accountId),

  suggestPaymentApplication: (
    accountId: string,
    pagoMonto: number,
  ): CxcPaymentSuggestion => {
    const account = cxcStore.getAccount(accountId);

    if (!account) {
      throw new Error('Cuenta CxC no encontrada');
    }

    const pending = account.facturas.filter(
      (invoice) =>
        invoice.estatus !== 'Pagada' && invoice.estatus !== 'Cancelada',
    );

    const exact = pending.find((invoice) => invoice.monto === pagoMonto);

    if (exact) {
      return {
        accountId,
        pagoMonto,
        moneda: account.moneda,
        suggestion: `Aplicar a ${exact.numeroFactura}`,
        justification: 'El monto coincide exactamente con una factura pendiente.',
        invoiceIds: [exact.id],
        options: [
          {
            label: `Aplicar a ${exact.numeroFactura}`,
            invoiceIds: [exact.id],
            detail: `${exact.tipo} · ${exact.monto.toLocaleString('es-MX')} ${exact.moneda}`,
          },
        ],
      };
    }

    const oldestFirst = [...pending].sort(
      (left, right) =>
        new Date(left.fechaLimitePago).getTime() -
        new Date(right.fechaLimitePago).getTime(),
    );

    return {
      accountId,
      pagoMonto,
      moneda: account.moneda,
      suggestion: 'Revisar opciones — monto no coincide exactamente',
      justification:
        'La IA sugiere orden contable (más antigua primero) o maximizar cobertura.',
      invoiceIds: oldestFirst.slice(0, 1).map((invoice) => invoice.id),
      options: [
        {
          label: 'Opción A — Factura más antigua',
          invoiceIds: oldestFirst.slice(0, 1).map((invoice) => invoice.id),
          detail: 'Criterio contable estándar',
        },
        {
          label: 'Opción B — Factura de mayor monto',
          invoiceIds: [...pending]
            .sort((left, right) => right.monto - left.monto)
            .slice(0, 1)
            .map((invoice) => invoice.id),
          detail: 'Maximiza % de cobertura inmediata',
        },
      ],
    };
  },

  registerOcReceived: (accountId: string, numeroOc: string): CxcAccount => {
    const account = cxcStore.getAccount(accountId);

    if (!account) {
      throw new Error('Cuenta CxC no encontrada');
    }

    const next: CxcAccount = {
      ...account,
      ordenCompra: {
        numeroOc,
        estatus: 'OC Recibida',
        diasSinOc: 0,
        intentosRecordatorio: account.ordenCompra?.intentosRecordatorio ?? 0,
        fechaPagoProgramada: null,
      },
      facturas: account.facturas.map((invoice) =>
        invoice.estatus === 'OC_pendiente'
          ? { ...invoice, estatus: 'Emitida' as const }
          : invoice,
      ),
      scoreRiesgo: Math.max(20, account.scoreRiesgo - 25),
      scoreLabel: scoreToLabel(Math.max(20, account.scoreRiesgo - 25)),
      notasCobranza: `OC ${numeroOc} recibida — solicitar factura a Jesús y cargar al portal.`,
      actividadesCobranza: appendActivity(account, {
        type: 'oc_registrada',
        label: ACTION_LABELS.oc_registrada,
        detail: `OC ${numeroOc} registrada. Pedir factura a Jesús y cargar al portal.`,
        createdBy: account.ejecutivoNombre,
      }),
      updatedAt: new Date().toISOString(),
    };

    return cxcStore.upsertAccount(next);
  },

  applyPayment: (
    accountId: string,
    input: {
      pagoMonto: number;
      invoiceIds: string[];
      note?: string;
      appliedBy?: string;
    },
  ): CxcAccount => {
    const account = cxcStore.getAccount(accountId);

    if (!account) {
      throw new Error('Cuenta CxC no encontrada');
    }

    if (!input.invoiceIds.length) {
      throw new Error('invoiceIds es requerido');
    }

    const invoiceIdSet = new Set(input.invoiceIds);
    let appliedAmount = 0;

    const facturas = account.facturas.map((invoice) => {
      if (!invoiceIdSet.has(invoice.id) || invoice.estatus === 'Pagada') {
        return invoice;
      }

      appliedAmount += invoice.monto;

      return {
        ...invoice,
        estatus: 'Pagada' as const,
        diasVencida: 0,
      };
    });

    if (appliedAmount <= 0) {
      throw new Error('No hay facturas pendientes en la selección');
    }

    const montoAdeudoTotal = Math.max(0, account.montoAdeudoTotal - appliedAmount);
    const hasPending = facturas.some(
      (invoice) =>
        invoice.estatus !== 'Pagada' && invoice.estatus !== 'Cancelada',
    );
    const nextScore = Math.max(
      8,
      account.scoreRiesgo - (montoAdeudoTotal === 0 ? 35 : 18),
    );
    const appliedBy = input.appliedBy?.trim() || account.ejecutivoNombre;
    const noteDetail =
      input.note?.trim() ||
      `Aplicó $${input.pagoMonto.toLocaleString('es-MX')} ${account.moneda} a ${input.invoiceIds.length} factura(s).`;

    const next: CxcAccount = {
      ...account,
      facturas,
      montoAdeudoTotal,
      diasEnMora: montoAdeudoTotal === 0 ? 0 : account.diasEnMora,
      estatusPagos:
        montoAdeudoTotal === 0 && account.estatusPagos !== 'Holdover'
          ? 'Al corriente'
          : account.estatusPagos === 'Mora grave' && !hasPending
            ? 'Al corriente'
            : account.estatusPagos,
      ultimaFechaPago: new Date().toISOString().slice(0, 10),
      scoreRiesgo: nextScore,
      scoreLabel: scoreToLabel(nextScore),
      notasCobranza: noteDetail,
      actividadesCobranza: appendActivity(account, {
        type: 'pago_aplicado',
        label: ACTION_LABELS.pago_aplicado,
        detail: noteDetail,
        createdBy: appliedBy,
      }),
    };

    return cxcStore.upsertAccount(next);
  },

  addCobranzaAction: (
    accountId: string,
    input: {
      type: CxcCobranzaActionType;
      detail?: string;
      createdBy?: string;
    },
  ): CxcAccount => {
    const account = cxcStore.getAccount(accountId);

    if (!account) {
      throw new Error('Cuenta CxC no encontrada');
    }

    const createdBy = input.createdBy?.trim() || account.ejecutivoNombre;
    const label = ACTION_LABELS[input.type] ?? 'Acción CxC';
    const detail =
      input.detail?.trim() ||
      `${label} registrada sobre ${account.empresa}.`;

    const next: CxcAccount = {
      ...account,
      notasCobranza: detail,
      actividadesCobranza: appendActivity(account, {
        type: input.type,
        label,
        detail,
        createdBy,
      }),
      scoreRiesgo:
        input.type === 'escalar_claudia'
          ? Math.min(99, account.scoreRiesgo + 5)
          : account.scoreRiesgo,
      scoreLabel:
        input.type === 'escalar_claudia'
          ? scoreToLabel(Math.min(99, account.scoreRiesgo + 5))
          : account.scoreLabel,
    };

    return cxcStore.upsertAccount(next);
  },

  sendOcReminder: (
    accountId: string,
    input?: { escalate?: boolean; createdBy?: string },
  ): CxcAccount => {
    const account = cxcStore.getAccount(accountId);

    if (!account?.ordenCompra) {
      throw new Error('Esta cuenta no tiene flujo de OC');
    }

    if (account.ordenCompra.estatus !== 'Esperando OC') {
      throw new Error('La OC ya no está pendiente');
    }

    const createdBy = input?.createdBy?.trim() || account.ejecutivoNombre;
    const intentos = account.ordenCompra.intentosRecordatorio + 1;
    const escalate = input?.escalate === true || intentos >= 4;
    const detail = escalate
      ? `Recordatorio OC #${intentos} — escalado a Claudia (Gerente CxC).`
      : `Recordatorio OC #${intentos} enviado a ${account.contactoPagosEmail}.`;

    const next: CxcAccount = {
      ...account,
      ordenCompra: {
        ...account.ordenCompra,
        intentosRecordatorio: intentos,
      },
      notasCobranza: detail,
      actividadesCobranza: appendActivity(account, {
        type: escalate ? 'escalar_claudia' : 'recordatorio_oc',
        label: escalate
          ? ACTION_LABELS.escalar_claudia
          : ACTION_LABELS.recordatorio_oc,
        detail,
        createdBy,
      }),
      scoreRiesgo: escalate
        ? Math.min(99, account.scoreRiesgo + 8)
        : Math.min(99, account.scoreRiesgo + 2),
      scoreLabel: scoreToLabel(
        escalate
          ? Math.min(99, account.scoreRiesgo + 8)
          : Math.min(99, account.scoreRiesgo + 2),
      ),
    };

    return cxcStore.upsertAccount(next);
  },

  advanceDepositChecklist: (
    accountId: string,
    step: 'caratula' | 'carta' | 'firmas' | 'devolver',
  ): CxcAccount => {
    const account = cxcStore.getAccount(accountId);

    if (!account?.deposito) {
      throw new Error('Depósito no encontrado para esta cuenta');
    }

    const deposito = { ...account.deposito };

    if (step === 'caratula') {
      deposito.caratulaBancariaRecibida = true;
    }

    if (step === 'carta') {
      deposito.cartaSolicitudRecibida = true;
    }

    if (step === 'firmas') {
      deposito.enProcesoFirmasInternas = true;
      deposito.estatus = 'En proceso de devolución';
    }

    if (step === 'devolver') {
      deposito.estatus = 'Devuelto parcial';
      deposito.enProcesoFirmasInternas = false;
    }

    return cxcStore.upsertAccount({
      ...account,
      deposito,
      notasCobranza:
        step === 'devolver'
          ? `Depósito devuelto parcial: $${deposito.montoADevolver.toLocaleString('es-MX')} MXN`
          : account.notasCobranza,
    });
  },

  resolveAnomaly: (anomalyId: string, note: string) => {
    const anomaly = cxcStore.resolveAnomaly(anomalyId, note);

    if (!anomaly) {
      throw new Error('Anomalía no encontrada');
    }

    return anomaly;
  },

  onboardFromLegal: (input: {
    casoLegalId: string;
    empresa: string;
    rfc?: string;
    nave?: string;
    parque?: string;
    rentaMensualUsd: number;
    depositoEstimadoUsd: number;
    contactoPagosNombre?: string;
    contactoPagosEmail?: string;
    contactoPagosTelefono?: string;
  }): CxcAccount => {
    const accountId = `cxc-legal-${input.casoLegalId}`;
    const existing = cxcStore.getAccount(accountId);

    if (existing) {
      return existing;
    }

    const now = new Date().toISOString();
    const account: CxcAccount = {
      id: accountId,
      empresa: input.empresa,
      rfc: input.rfc ?? 'PENDIENTE',
      contactoPagosNombre: input.contactoPagosNombre ?? 'Por confirmar',
      contactoPagosEmail: input.contactoPagosEmail ?? 'pagos@pendiente.mx',
      contactoPagosTelefono: input.contactoPagosTelefono ?? '—',
      ejecutivoId: 'cxc-ej-1',
      ejecutivoNombre: 'Mariana López',
      estatusPagos: 'Al corriente',
      scoreRiesgo: 25,
      scoreLabel: 'Bajo',
      scoreFactores: ['Onboarding desde Legal', 'Sin historial de mora'],
      tipoCliente: 'Sin portal',
      diaPagoAcordado: 'Día 10',
      moneda: 'USD',
      rentaMensual: input.rentaMensualUsd,
      montoAdeudoTotal: 0,
      diasEnMora: 0,
      ultimaFechaPago: null,
      nave: input.nave ?? 'N/A',
      parque: input.parque ?? 'N/A',
      contratosActivos: 1,
      requiereOc: false,
      cuentaBancaria: null,
      cicloEstatus: 'Gracia',
      jesusContratoDadoAlta: false,
      facturas: [],
      ordenCompra: null,
      deposito:
        input.depositoEstimadoUsd > 0
          ? {
              montoOriginal: input.depositoEstimadoUsd,
              montoADevolver: input.depositoEstimadoUsd,
              estatus: 'Retenido',
              caratulaBancariaRecibida: false,
              cartaSolicitudRecibida: false,
              enProcesoFirmasInternas: false,
              razonRetencion: null,
            }
          : null,
      escalacionInpc: null,
      holdover: null,
      notasCobranza:
        'Onboarding automático desde Legal — solicitar cuenta Fibra Uno y confirmar alta Oracle.',
      actividadesCobranza: [],
      casoLegalId: input.casoLegalId,
      createdAt: now,
      updatedAt: now,
    };

    return cxcStore.upsertAccount(account);
  },
};
