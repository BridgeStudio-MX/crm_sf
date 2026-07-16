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

export const commercialAccountService = {
  getAccount360: async (inquilinoId: string): Promise<Account360Response> => {
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
