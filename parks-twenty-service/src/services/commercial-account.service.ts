import { activityTimelineService } from './activity-timeline.service';
import { brokerNotificationStore } from './broker-notification.store';
import { commercialDecisorService } from './commercial-decisor.service';
import { cxcStore } from './cxc.store';
import { expansionSignalsStore } from './expansion-signals.store';
import { twentyDataService } from './twenty-data.service';
import {
  CASO_LEGAL_ESTATUS_CANCELADO,
  CASO_LEGAL_ESTATUS_CERRADO,
  EXPEDIENTE_ESTATUS_ACTIVO,
} from '../constants/parks.constants';
import {
  type Account360Actividad,
  type Account360CasoLegal,
  type Account360Contrato,
  type Account360CxcResumen,
  type Account360Documento,
  type Account360HojaDeAcuerdos,
  type Account360Interaccion,
  type Account360Oportunidad,
  type Account360Response,
} from '../types/commercial.types';
import { type CxcAccount } from '../types/cxc.types';
import { type DecisorCliente } from '../types/decisor-cliente.types';
import {
  type CasoLegalRecord,
  type ExpedienteContratoRecord,
  type HojaDeAcuerdosRecord,
  type OpportunityRecord,
} from '../types/parks.types';
import { isSelectValueEqual } from '../utils/select-value.util';

const CLOSED_OPPORTUNITY_STAGE_LABELS = [
  'Ganado — Contrato firmado',
  'Perdido',
] as const;

const isClosedOpportunityStage = (stage?: string | null): boolean =>
  CLOSED_OPPORTUNITY_STAGE_LABELS.some((label) =>
    isSelectValueEqual(stage, label),
  );

const OPEN_INVOICE_STATUSES = new Set([
  'Emitida',
  'OC_pendiente',
  'En_portal_cliente',
  'Pago_programado',
  'Vencida',
  'En_disputa',
]);

const MAX_CASOS_FOR_DOCS = 8;
const MAX_OPPS_FOR_ACTIVITY = 5;

const normalizeMatchKey = (value?: string): string =>
  (value ?? '')
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '')
    .toLowerCase()
    .replace(/[^a-z0-9]/g, '')
    .replace(/^(empresa|compania)/, '')
    .replace(/(sadecv|sacv|sade|sa|sc|cv)$/g, '');

const mapContrato = (
  expediente: ExpedienteContratoRecord,
): Account360Contrato => ({
  id: expediente.id,
  numeroExpediente: expediente.numeroExpediente,
  fechaApertura: expediente.fechaApertura,
  fechaVencimiento: expediente.fechaVencimiento,
  rentaMensualUsd: expediente.rentaMensualUsd,
  estatus: expediente.estatus,
  naveIdentificador: expediente.nave?.identificador,
  parqueNombre: expediente.nave?.parque?.nombre,
  m2: expediente.nave?.m2,
  casoLegalId: expediente.casoLegalId,
  esPropiedadFuno: expediente.nave?.esPropiedadFuno ?? false,
});

const mapOportunidad = (
  opportunity: OpportunityRecord,
): Account360Oportunidad => ({
  id: opportunity.id,
  name: opportunity.name,
  stage: opportunity.stage,
  tipoOperacion: opportunity.tipoOperacion,
  m2Requeridos: opportunity.m2Requeridos,
  ubicacionDeseada: opportunity.ubicacionDeseada,
  updatedAt: opportunity.updatedAt,
  createdAt: opportunity.createdAt,
  naveIdentificador: opportunity.naveVinculada?.identificador,
  enProceso: !isClosedOpportunityStage(opportunity.stage),
});

const mapCasoLegal = (casoLegal: CasoLegalRecord): Account360CasoLegal => ({
  id: casoLegal.id,
  referencia: casoLegal.referencia,
  tipoDocumento: casoLegal.tipoDocumento,
  estatus: casoLegal.estatus,
  semaforo:
    typeof casoLegal.semaforo === 'string' ? casoLegal.semaforo : undefined,
  abogadoAsignado: casoLegal.abogadoAsignado,
  diasTranscurridos: casoLegal.diasTranscurridos,
  slaDiasHabiles: casoLegal.slaDiasHabiles,
  documentacionCompleta: casoLegal.documentacionCompleta,
  slaPausado: casoLegal.slaPausado,
  naveIdentificador: casoLegal.nave?.identificador,
  parqueNombre: casoLegal.nave?.parque?.nombre,
  esPropiedadFuno: casoLegal.esPropiedadFuno,
  fechaHojaAcuerdos: casoLegal.fechaHojaAcuerdos,
  hojaDeAcuerdosId: casoLegal.hojaDeAcuerdosId,
});

const mapHojaDeAcuerdos = (
  hoja: HojaDeAcuerdosRecord,
): Account360HojaDeAcuerdos => {
  const rentaMensualEstimadaUsd =
    hoja.m2Acordados && hoja.precioUsdM2
      ? Number((hoja.m2Acordados * hoja.precioUsdM2).toFixed(2))
      : undefined;

  return {
    id: hoja.id,
    referencia: hoja.referencia,
    tipoContrato: hoja.tipoContrato,
    m2Acordados: hoja.m2Acordados,
    precioUsdM2: hoja.precioUsdM2,
    plazoMeses: hoja.plazoMeses,
    fechaInicio: hoja.fechaInicio,
    fechaFirma: hoja.fechaFirma,
    depositoMeses: hoja.depositoMeses,
    periodoGraciaMeses: hoja.periodoGraciaMeses,
    escalacionAnualPct: hoja.escalacionAnualPct,
    estatus: hoja.estatus,
    firmadaPorCliente: hoja.firmadaPorCliente,
    firmadaPorCem: hoja.firmadaPorCem,
    ejecutivoAsignado: hoja.ejecutivoAsignado,
    naveIdentificador: hoja.nave?.identificador,
    parqueNombre: hoja.nave?.parque?.nombre,
    oportunidadVinculadaId: hoja.oportunidadVinculadaId,
    rentaMensualEstimadaUsd,
  };
};

const mapCxcResumen = (account: CxcAccount): Account360CxcResumen => ({
  accountId: account.id,
  estatusPagos: account.estatusPagos,
  scoreRiesgo: account.scoreRiesgo,
  scoreLabel: account.scoreLabel,
  montoAdeudoTotal: account.montoAdeudoTotal,
  diasEnMora: account.diasEnMora,
  rentaMensual: account.rentaMensual,
  moneda: account.moneda,
  ultimaFechaPago: account.ultimaFechaPago,
  nave: account.nave,
  parque: account.parque,
  facturasPendientes: account.facturas.filter((factura) =>
    OPEN_INVOICE_STATUSES.has(factura.estatus),
  ).length,
  cicloEstatus: account.cicloEstatus,
});

const findMatchingCxcAccount = (params: {
  empresa?: string;
  rfc?: string;
}): CxcAccount | undefined => {
  const accounts = cxcStore.listAccounts();
  const rfcKey = normalizeMatchKey(params.rfc);
  const empresaKey = normalizeMatchKey(params.empresa);

  if (rfcKey) {
    const byRfc = accounts.find(
      (account) => normalizeMatchKey(account.rfc) === rfcKey,
    );
    if (byRfc) {
      return byRfc;
    }
  }

  if (!empresaKey) {
    return undefined;
  }

  return accounts.find((account) => {
    const accountEmpresaKey = normalizeMatchKey(account.empresa);
    return (
      accountEmpresaKey === empresaKey ||
      accountEmpresaKey.includes(empresaKey) ||
      empresaKey.includes(accountEmpresaKey)
    );
  });
};

const buildInteracciones = ({
  oportunidades,
  casosLegales,
  hojas,
  documentos,
  cxc,
  opportunityIds,
}: {
  oportunidades: Account360Oportunidad[];
  casosLegales: Account360CasoLegal[];
  hojas: Account360HojaDeAcuerdos[];
  documentos: Account360Documento[];
  cxc: Account360CxcResumen | undefined;
  opportunityIds: Set<string>;
}): Account360Interaccion[] => {
  const opportunityInteractions: Account360Interaccion[] = oportunidades.map(
    (oportunidad) => ({
      id: `opp-${oportunidad.id}`,
      titulo: oportunidad.name ?? 'Oportunidad comercial',
      descripcion: [
        oportunidad.stage,
        oportunidad.tipoOperacion,
        oportunidad.m2Requeridos
          ? `${oportunidad.m2Requeridos} m²`
          : undefined,
      ]
        .filter(Boolean)
        .join(' · '),
      fecha:
        oportunidad.updatedAt ??
        oportunidad.createdAt ??
        new Date().toISOString(),
      tipo: 'oportunidad',
      linkId: oportunidad.id,
    }),
  );

  const legalInteractions: Account360Interaccion[] = casosLegales.map(
    (casoLegal) => ({
      id: `legal-${casoLegal.id}`,
      titulo: casoLegal.referencia ?? 'Caso legal',
      descripcion: [
        casoLegal.estatus,
        casoLegal.tipoDocumento,
        casoLegal.abogadoAsignado
          ? `Abogado: ${casoLegal.abogadoAsignado}`
          : undefined,
      ]
        .filter(Boolean)
        .join(' · '),
      fecha: casoLegal.fechaHojaAcuerdos ?? new Date().toISOString(),
      tipo: 'legal' as const,
      linkId: casoLegal.id,
    }),
  );

  const hojaInteractions: Account360Interaccion[] = hojas.map((hoja) => ({
    id: `hoja-${hoja.id}`,
    titulo: hoja.referencia ?? 'Hoja de Acuerdos',
    descripcion: [
      hoja.estatus,
      hoja.tipoContrato,
      hoja.m2Acordados ? `${hoja.m2Acordados} m²` : undefined,
      hoja.firmadaPorCliente && hoja.firmadaPorCem
        ? 'Firmada'
        : 'Pendiente de firma',
    ]
      .filter(Boolean)
      .join(' · '),
    fecha: hoja.fechaFirma ?? hoja.fechaInicio ?? new Date().toISOString(),
    tipo: 'hoja' as const,
    linkId: hoja.id,
  }));

  const documentosEntregados = documentos.filter(
    (documento) => documento.entregado,
  );
  const documentoInteractions: Account360Interaccion[] =
    documentosEntregados.slice(0, 8).map((documento) => ({
      id: `doc-${documento.id}`,
      titulo: documento.titulo ?? documento.tipoDocumento ?? 'Documento',
      descripcion: [
        'Entregado',
        documento.casoReferencia,
        documento.tipoDocumento,
      ]
        .filter(Boolean)
        .join(' · '),
      fecha: new Date().toISOString(),
      tipo: 'documento' as const,
      linkId: documento.casoLegalId,
    }));

  const cxcInteractions: Account360Interaccion[] = cxc
    ? [
        {
          id: `cxc-${cxc.accountId}`,
          titulo: `CxC · ${cxc.estatusPagos}`,
          descripcion: [
            `Score ${cxc.scoreRiesgo} (${cxc.scoreLabel})`,
            cxc.montoAdeudoTotal > 0
              ? `Adeudo ${cxc.moneda} ${cxc.montoAdeudoTotal.toLocaleString('es-MX')}`
              : 'Sin adeudo',
            `${cxc.facturasPendientes} factura(s) pendientes`,
          ].join(' · '),
          fecha: cxc.ultimaFechaPago ?? new Date().toISOString(),
          tipo: 'cxc' as const,
          linkId: cxc.accountId,
        },
      ]
    : [];

  const notificationInteractions: Account360Interaccion[] =
    brokerNotificationStore
      .list()
      .filter(
        (notification) =>
          notification.opportunityId &&
          opportunityIds.has(notification.opportunityId),
      )
      .map((notification) => ({
        id: `notif-${notification.id}`,
        titulo: notification.title,
        descripcion: notification.body,
        fecha: notification.createdAt,
        tipo: 'notificacion' as const,
      }));

  return [
    ...opportunityInteractions,
    ...legalInteractions,
    ...hojaInteractions,
    ...documentoInteractions,
    ...cxcInteractions,
    ...notificationInteractions,
  ]
    .sort(
      (left, right) =>
        new Date(right.fecha).getTime() - new Date(left.fecha).getTime(),
    )
    .slice(0, 40);
};

const isCasoLegalActivo = (casoLegal: CasoLegalRecord): boolean =>
  !isSelectValueEqual(casoLegal.estatus, CASO_LEGAL_ESTATUS_CERRADO) &&
  !isSelectValueEqual(casoLegal.estatus, CASO_LEGAL_ESTATUS_CANCELADO);

const isExpedienteActivo = (expediente: ExpedienteContratoRecord): boolean =>
  isSelectValueEqual(expediente.estatus, EXPEDIENTE_ESTATUS_ACTIVO) ||
  expediente.estatus === EXPEDIENTE_ESTATUS_ACTIVO;

const loadDocumentosForCasos = async (
  casosLegales: CasoLegalRecord[],
): Promise<Account360Documento[]> => {
  const casosConDocs = casosLegales.slice(0, MAX_CASOS_FOR_DOCS);
  const documentosPorCaso = await Promise.all(
    casosConDocs.map(async (casoLegal) => {
      const checklist =
        await twentyDataService.findDocumentosChecklistByCasoLegal(
          casoLegal.id,
        );

      return checklist.map((documento) => ({
        id: documento.id,
        titulo: documento.titulo,
        tipoDocumento: documento.tipoDocumento,
        entregado: documento.entregado === true,
        validadoIa: documento.entregado === true,
        casoLegalId: casoLegal.id,
        casoReferencia: casoLegal.referencia,
      }));
    }),
  );

  return documentosPorCaso.flat();
};

const loadActividadesForOportunidades = async (
  oportunidades: Account360Oportunidad[],
): Promise<Account360Actividad[]> => {
  const selected = oportunidades.slice(0, MAX_OPPS_FOR_ACTIVITY);
  const timelines = await Promise.all(
    selected.map(async (oportunidad) => {
      const timeline = await activityTimelineService.getForOpportunity(
        oportunidad.id,
      );

      return timeline.entries.map((entry) => ({
        ...entry,
        opportunityId: oportunidad.id,
        opportunityName: oportunidad.name ?? timeline.companyName,
      }));
    }),
  );

  return timelines
    .flat()
    .sort(
      (left, right) =>
        new Date(right.occurredAt).getTime() -
        new Date(left.occurredAt).getTime(),
    )
    .slice(0, 40);
};

// Las cuentas mock de CxC usan ids con prefijo "cxc-" y no siempre existen
// como inquilinos en Twenty; el 360 se construye desde el expediente CxC.
const resolveCxcMockSector = (empresa: string): string => {
  const key = empresa.toLowerCase();

  if (key.includes('logi') || key.includes('norte') || key.includes('tramex')) {
    return 'Logística y distribución';
  }

  if (key.includes('agro')) {
    return 'Agroindustria / exportación';
  }

  if (key.includes('gdl') || key.includes('holdover')) {
    return 'Manufactura ligera';
  }

  return 'Industrial / warehousing';
};

const daysIso = (offsetDays: number): string => {
  const date = new Date();
  date.setUTCDate(date.getUTCDate() + offsetDays);
  return date.toISOString();
};

const buildCxcOnlyAccount360 = (account: CxcAccount): Account360Response => {
  const cxc = mapCxcResumen(account);
  const cxcHasRisk =
    cxc.montoAdeudoTotal > 0 ||
    cxc.diasEnMora > 0 ||
    cxc.estatusPagos !== 'Al corriente';

  const hoja = account.hojaAcuerdos;
  const contrato = account.contrato;
  const casoLegalId =
    contrato?.casoLegalId ?? account.casoLegalId ?? `legal-${account.id}`;
  const oportunidadId = `opp-${account.id}`;
  const hojaId = `hoja-${account.id}`;
  const expedienteId = `exp-${account.id}`;

  const rentaMensualUsd =
    hoja?.moneda === 'USD'
      ? hoja.rentaMensual
      : Number(((hoja?.rentaMensual ?? account.rentaMensual) / 17.2).toFixed(2));

  const contratos: Account360Contrato[] = [
    {
      id: expedienteId,
      numeroExpediente:
        contrato?.referenciaLegal ?? `EXP-${account.id.toUpperCase()}`,
      fechaApertura: contrato?.fechaInicio ?? account.recibidoDeLegalAt ?? undefined,
      fechaVencimiento: contrato?.fechaVencimiento ?? undefined,
      rentaMensualUsd,
      estatus: account.cicloEstatus === 'Terminado' ? 'Cerrado' : 'Activo',
      naveIdentificador: account.nave,
      parqueNombre: account.parque,
      m2: hoja?.m2Acordados,
      casoLegalId,
      esPropiedadFuno: contrato?.esPropiedadFuno ?? false,
    },
  ];

  const hojasDeAcuerdos: Account360HojaDeAcuerdos[] = hoja
    ? [
        {
          id: hojaId,
          referencia: hoja.folio ?? `HA-${account.id}`,
          tipoContrato: contrato?.tipoDocumento ?? 'Arrendamiento industrial',
          m2Acordados: hoja.m2Acordados,
          precioUsdM2: hoja.precioUsdM2,
          plazoMeses: hoja.plazoMeses,
          fechaInicio: contrato?.fechaInicio ?? undefined,
          fechaFirma: hoja.fechaFirma ?? undefined,
          depositoMeses: hoja.mesesDeposito,
          periodoGraciaMeses: hoja.mesesGracia,
          escalacionAnualPct: hoja.escalacionPct ?? undefined,
          estatus: 'Firmada',
          firmadaPorCliente: true,
          firmadaPorCem: true,
          ejecutivoAsignado: hoja.leasingOfficer ?? undefined,
          naveIdentificador: account.nave,
          parqueNombre: account.parque,
          oportunidadVinculadaId: oportunidadId,
          rentaMensualEstimadaUsd: rentaMensualUsd,
        },
      ]
    : [];

  const casosLegales: Account360CasoLegal[] = [
    {
      id: casoLegalId,
      referencia: contrato?.referenciaLegal ?? `LEG-${account.id}`,
      tipoDocumento: contrato?.tipoDocumento ?? 'Arrendamiento industrial',
      estatus: contrato?.estatusLegal ?? 'En cobranza',
      semaforo: cxcHasRisk ? 'rojo' : 'verde',
      abogadoAsignado: contrato?.abogadoAsignado ?? undefined,
      diasTranscurridos: account.recibidoDeLegalAt
        ? Math.max(
            1,
            Math.round(
              (Date.now() - new Date(account.recibidoDeLegalAt).getTime()) /
                86_400_000,
            ),
          )
        : 30,
      slaDiasHabiles: 15,
      documentacionCompleta: true,
      slaPausado: false,
      naveIdentificador: account.nave,
      parqueNombre: account.parque,
      esPropiedadFuno: contrato?.esPropiedadFuno ?? false,
      fechaHojaAcuerdos: hoja?.fechaFirma ?? undefined,
      hojaDeAcuerdosId: hoja ? hojaId : undefined,
    },
  ];

  const oportunidades: Account360Oportunidad[] = [
    {
      id: oportunidadId,
      name: `${account.empresa} · ${account.nave}`,
      stage: 'Ganado — Contrato firmado',
      tipoOperacion: 'Arrendamiento nuevo',
      m2Requeridos: hoja?.m2Acordados,
      ubicacionDeseada: account.parque,
      updatedAt: account.recibidoDeLegalAt ?? account.updatedAt,
      createdAt: daysIso(-280),
      naveIdentificador: account.nave,
      enProceso: false,
    },
  ];

  // Señal de expansión en clientes con buen historial o mora (upsell / renovación)
  if (account.cicloEstatus === 'Activo' || account.cicloEstatus === 'Holdover') {
    oportunidades.push({
      id: `${oportunidadId}-renov`,
      name: `Renovación / expansión · ${account.empresa}`,
      stage:
        account.cicloEstatus === 'Holdover'
          ? 'Negociación'
          : 'Prospección',
      tipoOperacion: 'Renovación',
      m2Requeridos: Math.round((hoja?.m2Acordados ?? 5_000) * 1.2),
      ubicacionDeseada: account.parque,
      updatedAt: daysIso(-12),
      createdAt: daysIso(-45),
      naveIdentificador: account.nave,
      enProceso: true,
    });
  }

  const documentos: Account360Documento[] = [
    {
      id: `doc-${account.id}-rfc`,
      titulo: 'Constancia de situación fiscal (RFC)',
      tipoDocumento: 'Identificación fiscal',
      entregado: true,
      validadoIa: true,
      casoLegalId,
      casoReferencia: contrato?.referenciaLegal,
    },
    {
      id: `doc-${account.id}-acta`,
      titulo: 'Acta constitutiva',
      tipoDocumento: 'Corporativo',
      entregado: true,
      validadoIa: true,
      casoLegalId,
      casoReferencia: contrato?.referenciaLegal,
    },
    {
      id: `doc-${account.id}-poder`,
      titulo: 'Poder notarial del representante legal',
      tipoDocumento: 'Legal',
      entregado: true,
      validadoIa: true,
      casoLegalId,
      casoReferencia: contrato?.referenciaLegal,
    },
    {
      id: `doc-${account.id}-hoja`,
      titulo: `Hoja de Acuerdos ${hoja?.folio ?? ''}`.trim(),
      tipoDocumento: 'Hoja de Acuerdos',
      entregado: Boolean(hoja),
      validadoIa: Boolean(hoja),
      casoLegalId,
      casoReferencia: contrato?.referenciaLegal,
    },
    {
      id: `doc-${account.id}-contrato`,
      titulo: `Contrato ${contrato?.referenciaLegal ?? 'firmado'}`,
      tipoDocumento: 'Contrato',
      entregado: Boolean(contrato),
      validadoIa: Boolean(contrato),
      casoLegalId,
      casoReferencia: contrato?.referenciaLegal,
    },
    {
      id: `doc-${account.id}-caratula`,
      titulo: 'Carátula bancaria cuenta Fibra Uno',
      tipoDocumento: 'Bancario',
      entregado: Boolean(account.cuentaBancaria),
      validadoIa: Boolean(account.cuentaBancaria),
      casoLegalId,
      casoReferencia: contrato?.referenciaLegal,
    },
    {
      id: `doc-${account.id}-oc`,
      titulo: 'Orden de compra (portal cliente)',
      tipoDocumento: 'OC / Portal',
      entregado:
        account.ordenCompra?.estatus === 'OC Recibida' ||
        account.ordenCompra?.estatus === 'Cargada en portal' ||
        account.ordenCompra?.estatus === 'Pagada',
      validadoIa: false,
      casoLegalId,
      casoReferencia: contrato?.referenciaLegal,
    },
  ];

  const nowIso = new Date().toISOString();
  const decisores: DecisorCliente[] = [
    {
      id: `dec-${account.id}-1`,
      inquilinoId: account.id,
      opportunityId: oportunidadId,
      nombre: account.contactoPagosNombre,
      correo: account.contactoPagosEmail,
      telefono: account.contactoPagosTelefono,
      rol: 'GERENTE_OPERACIONES',
      asistioTour: true,
      createdAt: daysIso(-300),
      updatedAt: nowIso,
    },
    {
      id: `dec-${account.id}-2`,
      inquilinoId: account.id,
      opportunityId: oportunidadId,
      nombre: 'María Elena Vargas',
      correo: `dg@${account.empresa
        .toLowerCase()
        .replace(/[^a-z0-9]+/g, '')
        .slice(0, 18)}.mx`,
      telefono: '+52 81 4000 2200',
      rol: 'DUENO_EMPRESA',
      asistioTour: true,
      createdAt: daysIso(-300),
      updatedAt: nowIso,
    },
    {
      id: `dec-${account.id}-3`,
      inquilinoId: account.id,
      opportunityId: oportunidadId,
      nombre: 'Ricardo Salinas',
      correo: `logistica@${account.empresa
        .toLowerCase()
        .replace(/[^a-z0-9]+/g, '')
        .slice(0, 18)}.mx`,
      telefono: '+52 81 4000 2210',
      rol: 'DIRECTOR_LOGISTICA',
      asistioTour: false,
      createdAt: daysIso(-290),
      updatedAt: nowIso,
    },
  ];

  const actividades: Account360Actividad[] = [
    {
      id: `act-${account.id}-1`,
      type: 'meeting',
      direction: 'outbound',
      subject: `Tour ${account.nave} · ${account.parque}`,
      summary: `Visita de site selection con decisor de operaciones. Espacio ${hoja?.m2Acordados?.toLocaleString('es-MX') ?? '—'} m².`,
      participant: decisores[0]?.nombre ?? account.contactoPagosNombre,
      occurredAt: daysIso(-260),
      source: 'crm',
      opportunityId: oportunidadId,
      opportunityName: oportunidades[0]?.name,
    },
    {
      id: `act-${account.id}-2`,
      type: 'email',
      direction: 'outbound',
      subject: 'Envío de Hoja de Acuerdos para firma',
      summary: `Folio ${hoja?.folio ?? 'HA'} enviado a representante legal y LO ${hoja?.leasingOfficer ?? 'asignado'}.`,
      participant: hoja?.leasingOfficer ?? 'Leasing Officer',
      occurredAt: hoja?.fechaFirma ?? daysIso(-220),
      source: 'gmail',
      opportunityId: oportunidadId,
      opportunityName: oportunidades[0]?.name,
    },
    {
      id: `act-${account.id}-3`,
      type: 'call',
      direction: 'outbound',
      subject: 'Seguimiento post-firma de contrato',
      summary: `Confirmación de handoff a CxC. Ejecutivo ${account.ejecutivoNombre}.`,
      participant: account.ejecutivoNombre,
      occurredAt: account.recibidoDeLegalAt ?? daysIso(-200),
      source: 'crm',
      opportunityId: oportunidadId,
      opportunityName: oportunidades[0]?.name,
    },
    ...account.actividadesCobranza.slice(0, 4).map((activity, index) => ({
      id: `act-${account.id}-cxc-${index}`,
      type: (activity.type === 'llamada'
        ? 'call'
        : activity.type === 'email' || activity.type === 'recordatorio_oc'
          ? 'email'
          : 'task') as Account360Actividad['type'],
      direction: 'outbound' as const,
      subject: activity.label,
      summary: activity.detail,
      participant: activity.createdBy,
      occurredAt: activity.createdAt,
      source: 'crm' as const,
      opportunityId: oportunidadId,
      opportunityName: oportunidades[0]?.name,
    })),
  ];

  const documentosEntregados = documentos.filter(
    (documento) => documento.entregado,
  ).length;
  const documentosPendientes = documentos.length - documentosEntregados;
  const oportunidadesEnProceso = oportunidades.filter(
    (oportunidad) => oportunidad.enProceso,
  ).length;

  return {
    inquilinoId: account.id,
    inquilino: {
      id: account.id,
      empresa: account.empresa,
      rfc: account.rfc,
      contactoPrincipal: account.contactoPagosNombre,
      emailContacto: account.contactoPagosEmail,
      telefono: account.contactoPagosTelefono,
      sector: resolveCxcMockSector(account.empresa),
      estatus: 'Activo',
      ultimoPagoFecha: account.ultimaFechaPago ?? undefined,
      pagosAlCorriente: !cxcHasRisk,
    },
    decisores,
    expedientesActivos: contratos.filter(
      (item) => item.estatus === 'Activo',
    ).length,
    contratos,
    oportunidades,
    oportunidadesEnProceso,
    casosLegales,
    casosLegalesActivos: casosLegales.length,
    hojasDeAcuerdos,
    documentos,
    documentosEntregados,
    documentosPendientes,
    actividades,
    cxc,
    interacciones: buildInteracciones({
      oportunidades,
      casosLegales,
      hojas: hojasDeAcuerdos,
      documentos,
      cxc,
      opportunityIds: new Set(oportunidades.map((item) => item.id)),
    }),
    estadoPagos: {
      alCorriente: !cxcHasRisk,
      ultimoPagoFecha: cxc.ultimaFechaPago ?? undefined,
      fuente: 'cxc' as const,
      montoAdeudoTotal: cxc.montoAdeudoTotal,
      diasEnMora: cxc.diasEnMora,
    },
    tieneContratosFuno: Boolean(contrato?.esPropiedadFuno),
    senalesExpansion: expansionSignalsStore.listByInquilinoNombre(
      account.empresa,
    ),
    note: 'Vista 360 con expediente mock derivado de CxC (inquilino Twenty pendiente de vincular)',
  };
};

export const commercialAccountService = {
  getAccount360: async (inquilinoId: string): Promise<Account360Response> => {
    if (inquilinoId.startsWith('cxc-')) {
      const cxcOnlyAccount = cxcStore.getAccount(inquilinoId);

      if (cxcOnlyAccount) {
        return buildCxcOnlyAccount360(cxcOnlyAccount);
      }
    }

    const [
      expedientes,
      inquilino,
      decisores,
      oportunidades,
      casosLegalesRaw,
      hojasRaw,
    ] = await Promise.all([
      twentyDataService.findExpedientesByInquilino(inquilinoId),
      twentyDataService.getInquilinoById(inquilinoId),
      commercialDecisorService.listForInquilino(inquilinoId),
      twentyDataService.findOpportunitiesByInquilino(inquilinoId),
      twentyDataService.findCasosLegalesByInquilino(inquilinoId),
      twentyDataService.findHojasDeAcuerdosByInquilino(inquilinoId),
    ]);

    const contratos = expedientes.map(mapContrato);
    const mappedOportunidades = oportunidades.map(mapOportunidad);
    const casosLegales = casosLegalesRaw.map(mapCasoLegal);
    const hojasDeAcuerdos = hojasRaw.map(mapHojaDeAcuerdos);
    const opportunityIds = new Set(mappedOportunidades.map((item) => item.id));

    const [documentos, actividades] = await Promise.all([
      loadDocumentosForCasos(casosLegalesRaw),
      loadActividadesForOportunidades(mappedOportunidades),
    ]);

    const documentosEntregados = documentos.filter(
      (documento) => documento.entregado,
    ).length;
    const documentosPendientes = documentos.length - documentosEntregados;

    const tieneContratosFuno =
      contratos.some((contrato) => contrato.esPropiedadFuno) ||
      casosLegales.some((casoLegal) => casoLegal.esPropiedadFuno);

    const cxcAccount = findMatchingCxcAccount({
      empresa: inquilino?.empresa,
      rfc: inquilino?.rfc,
    });
    const cxc = cxcAccount ? mapCxcResumen(cxcAccount) : undefined;

    const pagosOracle =
      inquilino?.pagosAlCorriente !== undefined ||
      inquilino?.ultimoPagoFecha !== undefined;

    const cxcHasRisk =
      !!cxc &&
      (cxc.montoAdeudoTotal > 0 ||
        cxc.diasEnMora > 0 ||
        cxc.estatusPagos !== 'Al corriente');

    const estadoPagos =
      cxc && cxcHasRisk
        ? {
            alCorriente: false,
            ultimoPagoFecha: cxc.ultimaFechaPago ?? inquilino?.ultimoPagoFecha,
            fuente: 'cxc' as const,
            montoAdeudoTotal: cxc.montoAdeudoTotal,
            diasEnMora: cxc.diasEnMora,
          }
        : pagosOracle
          ? {
              alCorriente: inquilino?.pagosAlCorriente,
              ultimoPagoFecha: inquilino?.ultimoPagoFecha,
              fuente: 'oracle' as const,
              montoAdeudoTotal: cxc?.montoAdeudoTotal,
              diasEnMora: cxc?.diasEnMora,
            }
          : cxc
            ? {
                alCorriente: true,
                ultimoPagoFecha: cxc.ultimaFechaPago ?? undefined,
                fuente: 'cxc' as const,
                montoAdeudoTotal: cxc.montoAdeudoTotal,
                diasEnMora: cxc.diasEnMora,
              }
            : {
                fuente: 'sin-datos' as const,
              };

    const noteParts = [
      'Vista 360 — empresa, docs, hojas, actividad, legal y CxC',
      cxcHasRisk
        ? 'pagos con señal de riesgo desde CxC'
        : pagosOracle
          ? 'pagos Oracle sincronizados'
          : cxc
            ? 'pagos estimados desde CxC (Oracle pendiente)'
            : 'pagos Oracle pendientes de integración',
    ];

    return {
      inquilinoId,
      inquilino: inquilino ?? undefined,
      decisores,
      expedientesActivos: expedientes.filter(isExpedienteActivo).length,
      contratos,
      oportunidades: mappedOportunidades,
      oportunidadesEnProceso: mappedOportunidades.filter(
        (oportunidad) => oportunidad.enProceso,
      ).length,
      casosLegales,
      casosLegalesActivos: casosLegalesRaw.filter(isCasoLegalActivo).length,
      hojasDeAcuerdos,
      documentos,
      documentosEntregados,
      documentosPendientes,
      actividades,
      cxc,
      interacciones: buildInteracciones({
        oportunidades: mappedOportunidades,
        casosLegales,
        hojas: hojasDeAcuerdos,
        documentos,
        cxc,
        opportunityIds,
      }),
      estadoPagos,
      tieneContratosFuno,
      senalesExpansion: expansionSignalsStore.listByInquilinoNombre(
        inquilino?.empresa,
      ),
      note: noteParts.join(' — '),
    };
  },
};
