import { brokerNotificationStore } from './broker-notification.store';
import { commercialDecisorService } from './commercial-decisor.service';
import { twentyDataService } from './twenty-data.service';
import {
  type Account360Contrato,
  type Account360Interaccion,
  type Account360Oportunidad,
  type Account360Response,
} from '../types/commercial.types';
import { type ExpedienteContratoRecord, type OpportunityRecord } from '../types/parks.types';

const CLOSED_OPPORTUNITY_STAGES = new Set([
  'GANADO_CONTRATO_FIRMADO',
  'PERDIDO',
]);

const mapContrato = (
  expediente: ExpedienteContratoRecord,
): Account360Contrato => ({
  id: expediente.id,
  numeroExpediente: expediente.numeroExpediente,
  fechaVencimiento: expediente.fechaVencimiento,
  rentaMensualUsd: expediente.rentaMensualUsd,
  estatus: expediente.estatus,
  naveIdentificador: expediente.nave?.identificador,
  parqueNombre: expediente.nave?.parque?.nombre,
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
  enProceso: !CLOSED_OPPORTUNITY_STAGES.has(opportunity.stage ?? ''),
});

const buildInteracciones = (
  oportunidades: Account360Oportunidad[],
  opportunityIds: Set<string>,
): Account360Interaccion[] => {
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
      fecha: oportunidad.updatedAt ?? oportunidad.createdAt ?? new Date().toISOString(),
      tipo: 'oportunidad',
    }),
  );

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

  return [...opportunityInteractions, ...notificationInteractions]
    .sort(
      (left, right) =>
        new Date(right.fecha).getTime() - new Date(left.fecha).getTime(),
    )
    .slice(0, 20);
};

export const commercialAccountService = {
  getAccount360: async (inquilinoId: string): Promise<Account360Response> => {
    const [expedientes, inquilino, decisores, oportunidades] =
      await Promise.all([
        twentyDataService.findExpedientesActivos(),
        twentyDataService.getInquilinoById(inquilinoId),
        commercialDecisorService.listForInquilino(inquilinoId),
        twentyDataService.findOpportunitiesByInquilino(inquilinoId),
      ]);

    const relatedExpedientes = expedientes.filter(
      (expediente) => expediente.inquilinoId === inquilinoId,
    );
    const contratos = relatedExpedientes.map(mapContrato);
    const mappedOportunidades = oportunidades.map(mapOportunidad);
    const opportunityIds = new Set(mappedOportunidades.map((item) => item.id));
    const tieneContratosFuno = contratos.some(
      (contrato) => contrato.esPropiedadFuno,
    );
    const pagosConocidos =
      inquilino?.pagosAlCorriente !== undefined ||
      inquilino?.ultimoPagoFecha !== undefined;

    return {
      inquilinoId,
      inquilino: inquilino ?? undefined,
      decisores,
      expedientesActivos: relatedExpedientes.length,
      contratos,
      oportunidades: mappedOportunidades,
      oportunidadesEnProceso: mappedOportunidades.filter(
        (oportunidad) => oportunidad.enProceso,
      ).length,
      interacciones: buildInteracciones(mappedOportunidades, opportunityIds),
      estadoPagos: {
        alCorriente: inquilino?.pagosAlCorriente,
        ultimoPagoFecha: inquilino?.ultimoPagoFecha,
        fuente: pagosConocidos ? 'oracle' : 'sin-datos',
      },
      tieneContratosFuno,
      note: pagosConocidos
        ? 'Vista 360 comercial — pagos sincronizados desde Oracle'
        : 'Vista 360 comercial — pagos Oracle pendientes de integración real',
    };
  },
};
