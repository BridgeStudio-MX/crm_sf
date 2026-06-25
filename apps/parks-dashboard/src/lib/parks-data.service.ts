import {
  GET_CASO_LEGAL,
  GET_CASOS_LEGALES,
  GET_COMISIONES,
  GET_EXPEDIENTES_ACTIVOS,
  GET_NAVES_BY_PARQUE,
  GET_OPPORTUNITIES,
  GET_PARQUE,
  GET_PARQUES,
} from './graphql/queries';
import { twentyQuery } from './twenty-api';
import {
  type CasoLegalRecord,
  type ComisionRecord,
  type ExpedienteContratoRecord,
  type GraphQlConnection,
  type NaveRecord,
  type OpportunityRecord,
  type ParqueRecord,
  type StackingPlanNave,
} from './types';
import { daysUntil, getStackingStatus } from './utils/format';

const mapConnection = <TNode>(
  connection?: GraphQlConnection<TNode>,
): TNode[] => connection?.edges.map((edge) => edge.node) ?? [];

export const parksDataService = {
  getParques: async (): Promise<ParqueRecord[]> => {
    const data = await twentyQuery<{
      parques: GraphQlConnection<ParqueRecord>;
    }>(GET_PARQUES, { first: 50 });

    return mapConnection(data.parques);
  },

  getParque: async (parqueId: string): Promise<ParqueRecord | null> => {
    const data = await twentyQuery<{ parque: ParqueRecord | null }>(
      GET_PARQUE,
      { id: parqueId },
    );

    return data.parque;
  },

  getNavesByParque: async (parqueId: string): Promise<NaveRecord[]> => {
    const data = await twentyQuery<{
      naves: GraphQlConnection<NaveRecord>;
    }>(GET_NAVES_BY_PARQUE, { parqueId, first: 100 });

    return mapConnection(data.naves);
  },

  getExpedientesActivos: async (): Promise<ExpedienteContratoRecord[]> => {
    const data = await twentyQuery<{
      expedientesContrato: GraphQlConnection<ExpedienteContratoRecord>;
    }>(GET_EXPEDIENTES_ACTIVOS, { first: 200 });

    return mapConnection(data.expedientesContrato);
  },

  getStackingPlan: async (parqueId: string): Promise<{
    parque: ParqueRecord | null;
    naves: StackingPlanNave[];
  }> => {
    const [parque, naves, expedientes] = await Promise.all([
      parksDataService.getParque(parqueId),
      parksDataService.getNavesByParque(parqueId),
      parksDataService.getExpedientesActivos(),
    ]);

    const expedienteByNaveId = new Map(
      expedientes
        .filter((expediente) => expediente.nave?.id)
        .map((expediente) => [expediente.nave!.id, expediente]),
    );

    const stackingNaves: StackingPlanNave[] = naves.map((nave) => {
      const expedienteActivo = expedienteByNaveId.get(nave.id) ?? null;
      const diasRestantes = daysUntil(expedienteActivo?.fechaVencimiento);
      const hasContract =
        Boolean(expedienteActivo) || nave.estatus === 'RENTADA';
      const status = getStackingStatus(diasRestantes, hasContract);

      return {
        ...nave,
        expedienteActivo,
        diasRestantes,
        statusColor: status.color,
        statusLabel: status.label,
      };
    });

    return { parque, naves: stackingNaves };
  },

  getOpportunities: async (): Promise<OpportunityRecord[]> => {
    const data = await twentyQuery<{
      opportunities: GraphQlConnection<OpportunityRecord>;
    }>(GET_OPPORTUNITIES, { first: 100 });

    return mapConnection(data.opportunities);
  },

  getCasosLegales: async (): Promise<CasoLegalRecord[]> => {
    const data = await twentyQuery<{
      casosLegales: GraphQlConnection<CasoLegalRecord>;
    }>(GET_CASOS_LEGALES, { first: 100 });

    return mapConnection(data.casosLegales);
  },

  getCasoLegal: async (casoLegalId: string): Promise<CasoLegalRecord | null> => {
    const data = await twentyQuery<{ casoLegal: CasoLegalRecord | null }>(
      GET_CASO_LEGAL,
      { id: casoLegalId },
    );

    return data.casoLegal;
  },

  getComisiones: async (): Promise<ComisionRecord[]> => {
    const data = await twentyQuery<{
      comisiones: GraphQlConnection<ComisionRecord>;
    }>(GET_COMISIONES, { first: 100 });

    return mapConnection(data.comisiones);
  },
};
