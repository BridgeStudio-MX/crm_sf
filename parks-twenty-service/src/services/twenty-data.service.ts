import {
  CASO_LEGAL_ESTATUS_CANCELADO,
  CASO_LEGAL_ESTATUS_CERRADO,
  EXPEDIENTE_ESTATUS_ACTIVO,
  HOLDOVER_RESOLUCION_ACTIVO,
  TIPO_DOCUMENTO_RENOVACION,
} from '../constants/parks.constants';
import {
  CREATE_CASO_LEGAL,
  CREATE_COMISION,
  CREATE_DOCUMENTO_CHECKLIST,
  CREATE_EXPEDIENTE_CONTRATO,
  CREATE_FLUJO_FIRMAS,
  CREATE_HOLDOVER,
  CREATE_NOTE,
  CREATE_TASK,
  UPDATE_CASO_LEGAL,
  UPDATE_COMISION,
  UPDATE_EXPEDIENTE_CONTRATO,
  UPDATE_FLUJO_FIRMAS,
  UPDATE_INQUILINO,
  UPDATE_NAVE,
  UPDATE_OPPORTUNITY,
} from '../graphql/mutations';
import {
  FIND_HOJA_DE_ACUERDOS_FOR_HANDOFF,
  GET_CASO_LEGAL_BY_ID,
  GET_CASOS_LEGALES_ACTIVOS,
  GET_ALL_COMISIONES,
  GET_COMISIONES_BY_HOJA,
  COUNT_ACTIVE_RENOVACION_CASOS,
  FIND_OPPORTUNITY_BY_INQUILINO_NAVE,
  GET_DOCUMENTOS_CHECKLIST_BY_CASO,
  GET_EXPEDIENTE_BY_ID,
  GET_EXPEDIENTES_ACTIVOS,
  GET_EXPEDIENTES_BY_YEAR_PREFIX,
  GET_EXPEDIENTES_VENCIDOS,
  GET_FLUJOS_FIRMAS_BY_CASO,
  GET_HOJA_DE_ACUERDOS_BY_ID,
  GET_NAVE_BY_ID,
  GET_HOLDOVER_BY_EXPEDIENTE,
  GET_NAVES_DISPONIBLES,
  GET_OPPORTUNITY_BY_ID,
  GET_OPPORTUNITIES_SUMMARY,
} from '../graphql/queries';
import {
  type CasoLegalRecord,
  type ComisionRecord,
  type ExpedienteContratoRecord,
  type FlujoFirmasRecord,
  type GraphQlConnection,
  type HojaDeAcuerdosRecord,
  type HoldoverRecord,
  type NaveRecord,
  type OpportunityRecord,
} from '../types/parks.types';
import { toIsoDateString } from '../utils/business-days.util';
import { buildBlocknoteJson } from '../utils/blocknote.util';
import { toSelectValue } from '../utils/select-value.util';
import { twentyClient } from './twenty.client';

const logGraphQlError = (context: string, error: unknown): void => {
  const message = error instanceof Error ? error.message : String(error);
  console.error(`[twenty-data] ${context}:`, message);
};

const mapConnectionNodes = <TNode>(
  connection: GraphQlConnection<TNode> | null | undefined,
): TNode[] => connection?.edges.map((edge) => edge.node) ?? [];

const enrichCasoLegalRecord = (casoLegal: CasoLegalRecord): CasoLegalRecord => ({
  ...casoLegal,
  holdoverActivo: isSelectValueEqualInquilinoHoldover(casoLegal.inquilino?.estatus),
  clienteNoRenueva: false,
});

const isSelectValueEqualInquilinoHoldover = (
  inquilinoEstatus: string | undefined,
): boolean =>
  inquilinoEstatus === toSelectValue('En holdover') ||
  inquilinoEstatus === 'En holdover';

export const twentyDataService = {
  findCasosLegalesActivos: async (): Promise<CasoLegalRecord[]> => {
    try {
      const response = await twentyClient.query<{
        casosLegales: GraphQlConnection<CasoLegalRecord>;
      }>(GET_CASOS_LEGALES_ACTIVOS, {
        estatusCerrado: toSelectValue(CASO_LEGAL_ESTATUS_CERRADO),
        estatusCancelado: toSelectValue(CASO_LEGAL_ESTATUS_CANCELADO),
      });

      return mapConnectionNodes(response.casosLegales).map(enrichCasoLegalRecord);
    } catch (error) {
      logGraphQlError('findCasosLegalesActivos failed', error);
      return [];
    }
  },

  getCasoLegalById: async (
    casoLegalId: string,
  ): Promise<CasoLegalRecord | null> => {
    try {
      const response = await twentyClient.query<{
        casoLegal: CasoLegalRecord | null;
      }>(GET_CASO_LEGAL_BY_ID, { casoLegalId });

      if (!response.casoLegal) {
        return null;
      }

      return enrichCasoLegalRecord(response.casoLegal);
    } catch (error) {
      logGraphQlError(`getCasoLegalById(${casoLegalId}) failed`, error);
      return null;
    }
  },

  updateCasoLegal: async (
    casoLegalId: string,
    data: Record<string, unknown>,
  ): Promise<CasoLegalRecord | null> => {
    try {
      const response = await twentyClient.mutate<{
        updateCasoLegal: CasoLegalRecord;
      }>(UPDATE_CASO_LEGAL, { casoLegalId, data });

      return response.updateCasoLegal;
    } catch (error) {
      logGraphQlError(`updateCasoLegal(${casoLegalId}) failed`, error);
      return null;
    }
  },

  getHojaDeAcuerdosById: async (
    hojaDeAcuerdosId: string,
  ): Promise<HojaDeAcuerdosRecord | null> => {
    try {
      const response = await twentyClient.query<{
        hojaDeAcuerdos: HojaDeAcuerdosRecord | null;
      }>(GET_HOJA_DE_ACUERDOS_BY_ID, { hojaDeAcuerdosId });

      return response.hojaDeAcuerdos;
    } catch (error) {
      logGraphQlError(`getHojaDeAcuerdosById(${hojaDeAcuerdosId}) failed`, error);
      return null;
    }
  },

  getNaveById: async (naveId: string): Promise<NaveRecord | null> => {
    try {
      const response = await twentyClient.query<{
        nave: NaveRecord | null;
      }>(GET_NAVE_BY_ID, { naveId });

      return response.nave;
    } catch (error) {
      logGraphQlError(`getNaveById(${naveId}) failed`, error);
      return null;
    }
  },

  findDocumentosChecklistByCasoLegal: async (
    casoLegalId: string,
  ): Promise<
    {
      id: string;
      titulo?: string;
      tipoDocumento?: string;
      entregado?: boolean;
    }[]
  > => {
    try {
      const response = await twentyClient.query<{
        documentosChecklist: GraphQlConnection<{
          id: string;
          titulo?: string;
          tipoDocumento?: string;
          entregado?: boolean;
        }>;
      }>(GET_DOCUMENTOS_CHECKLIST_BY_CASO, { casoLegalId });

      return mapConnectionNodes(response.documentosChecklist);
    } catch (error) {
      logGraphQlError(
        `findDocumentosChecklistByCasoLegal(${casoLegalId}) failed`,
        error,
      );
      return [];
    }
  },

  findNavesDisponibles: async (): Promise<
    {
      id?: string;
      identificador?: string;
      m2?: number;
      parque?: { nombre?: string; ubicacion?: string };
    }[]
  > => {
    try {
      const response = await twentyClient.query<{
        naves: GraphQlConnection<{
          identificador?: string;
          m2?: number;
          parque?: { nombre?: string; ubicacion?: string };
        }>;
      }>(GET_NAVES_DISPONIBLES, {
        estatusDisponible: toSelectValue('Disponible'),
      });

      return mapConnectionNodes(response.naves);
    } catch (error) {
      logGraphQlError('findNavesDisponibles failed', error);
      return [];
    }
  },

  createDocumentoChecklist: async (
    data: Record<string, unknown>,
  ): Promise<{ id: string } | null> => {
    try {
      const response = await twentyClient.mutate<{
        createDocumentoChecklist: { id: string };
      }>(CREATE_DOCUMENTO_CHECKLIST, { data });

      return response.createDocumentoChecklist;
    } catch (error) {
      logGraphQlError('createDocumentoChecklist failed', error);
      return null;
    }
  },

  findExpedientesVencidos: async (
    referenceDate: Date = new Date(),
  ): Promise<ExpedienteContratoRecord[]> => {
    try {
      const response = await twentyClient.query<{
        expedientesContrato: GraphQlConnection<ExpedienteContratoRecord>;
      }>(GET_EXPEDIENTES_VENCIDOS, {
        hoy: referenceDate.toISOString(),
        estatusActivo: toSelectValue(EXPEDIENTE_ESTATUS_ACTIVO),
      });

      return mapConnectionNodes(response.expedientesContrato);
    } catch (error) {
      logGraphQlError('findExpedientesVencidos failed', error);
      return [];
    }
  },

  findExpedientesByYearPrefix: async (
    prefix: string,
  ): Promise<ExpedienteContratoRecord[]> => {
    try {
      const response = await twentyClient.query<{
        expedientesContrato: GraphQlConnection<ExpedienteContratoRecord>;
      }>(GET_EXPEDIENTES_BY_YEAR_PREFIX, { prefix });

      return mapConnectionNodes(response.expedientesContrato);
    } catch (error) {
      logGraphQlError(`findExpedientesByYearPrefix(${prefix}) failed`, error);
      return [];
    }
  },

  findActiveHoldoverForTenant: async (
    naveId: string,
    inquilinoId: string,
  ): Promise<HoldoverRecord | null> => {
    try {
      const response = await twentyClient.query<{
        holdovers: GraphQlConnection<HoldoverRecord>;
      }>(GET_HOLDOVER_BY_EXPEDIENTE, {
        naveId,
        inquilinoId,
        resolucionActivo: toSelectValue(HOLDOVER_RESOLUCION_ACTIVO),
      });

      return mapConnectionNodes(response.holdovers)[0] ?? null;
    } catch (error) {
      logGraphQlError('findActiveHoldoverForTenant failed', error);
      return null;
    }
  },

  createHoldover: async (
    data: Record<string, unknown>,
  ): Promise<HoldoverRecord | null> => {
    try {
      const response = await twentyClient.mutate<{
        createHoldover: HoldoverRecord;
      }>(CREATE_HOLDOVER, { data });

      return response.createHoldover;
    } catch (error) {
      logGraphQlError('createHoldover failed', error);
      return null;
    }
  },

  findComisionesByHojaDeAcuerdos: async (
    hojaDeAcuerdosId: string,
  ): Promise<ComisionRecord[]> => {
    try {
      const response = await twentyClient.query<{
        comisiones: GraphQlConnection<ComisionRecord>;
      }>(GET_COMISIONES_BY_HOJA, { hojaDeAcuerdosId });

      return mapConnectionNodes(response.comisiones);
    } catch (error) {
      logGraphQlError(
        `findComisionesByHojaDeAcuerdos(${hojaDeAcuerdosId}) failed`,
        error,
      );
      return [];
    }
  },

  createComision: async (
    data: Record<string, unknown>,
  ): Promise<ComisionRecord | null> => {
    try {
      const response = await twentyClient.mutate<{
        createComision: ComisionRecord;
      }>(CREATE_COMISION, { data });

      return response.createComision;
    } catch (error) {
      logGraphQlError('createComision failed', error);
      return null;
    }
  },

  updateComision: async (
    comisionId: string,
    data: Record<string, unknown>,
  ): Promise<ComisionRecord | null> => {
    try {
      const response = await twentyClient.mutate<{
        updateComision: ComisionRecord;
      }>(UPDATE_COMISION, { comisionId, data });

      return response.updateComision;
    } catch (error) {
      logGraphQlError(`updateComision(${comisionId}) failed`, error);
      return null;
    }
  },

  findAllComisiones: async (): Promise<ComisionRecord[]> => {
    try {
      const response = await twentyClient.query<{
        comisiones: GraphQlConnection<ComisionRecord>;
      }>(GET_ALL_COMISIONES, {});

      return mapConnectionNodes(response.comisiones);
    } catch (error) {
      logGraphQlError('findAllComisiones failed', error);
      return [];
    }
  },

  findOpportunitiesSummary: async (): Promise<OpportunityRecord[]> => {
    try {
      const response = await twentyClient.query<{
        opportunities: GraphQlConnection<OpportunityRecord>;
      }>(GET_OPPORTUNITIES_SUMMARY, {});

      return mapConnectionNodes(response.opportunities);
    } catch (error) {
      logGraphQlError('findOpportunitiesSummary failed', error);
      return [];
    }
  },

  createExpedienteContrato: async (
    data: Record<string, unknown>,
  ): Promise<ExpedienteContratoRecord | null> => {
    try {
      const response = await twentyClient.mutate<{
        createExpedienteContrato: ExpedienteContratoRecord;
      }>(CREATE_EXPEDIENTE_CONTRATO, { data });

      return response.createExpedienteContrato;
    } catch (error) {
      logGraphQlError('createExpedienteContrato failed', error);
      return null;
    }
  },

  updateExpedienteContrato: async (
    expedienteContratoId: string,
    data: Record<string, unknown>,
  ): Promise<ExpedienteContratoRecord | null> => {
    try {
      const response = await twentyClient.mutate<{
        updateExpedienteContrato: ExpedienteContratoRecord;
      }>(UPDATE_EXPEDIENTE_CONTRATO, { expedienteContratoId, data });

      return response.updateExpedienteContrato;
    } catch (error) {
      logGraphQlError(
        `updateExpedienteContrato(${expedienteContratoId}) failed`,
        error,
      );
      return null;
    }
  },

  updateInquilino: async (
    inquilinoId: string,
    data: Record<string, unknown>,
  ): Promise<void> => {
    try {
      await twentyClient.mutate(UPDATE_INQUILINO, { inquilinoId, data });
    } catch (error) {
      logGraphQlError(`updateInquilino(${inquilinoId}) failed`, error);
    }
  },

  updateNave: async (
    naveId: string,
    data: Record<string, unknown>,
  ): Promise<void> => {
    try {
      await twentyClient.mutate(UPDATE_NAVE, { naveId, data });
    } catch (error) {
      logGraphQlError(`updateNave(${naveId}) failed`, error);
    }
  },

  createNote: async (title: string, body: string): Promise<void> => {
    try {
      await twentyClient.mutate(CREATE_NOTE, {
        data: {
          title,
          bodyV2: {
            blocknote: buildBlocknoteJson(body),
            markdown: body,
          },
        },
      });
    } catch (error) {
      logGraphQlError('createNote failed', error);
    }
  },

  createTask: async (title: string, body: string): Promise<void> => {
    try {
      await twentyClient.mutate(CREATE_TASK, {
        data: {
          title,
          bodyV2: {
            blocknote: buildBlocknoteJson(body),
            markdown: body,
          },
        },
      });
    } catch (error) {
      logGraphQlError('createTask failed — falling back to note', error);
      await twentyDataService.createNote(title, body);
    }
  },

  getOpportunityById: async (
    opportunityId: string,
  ): Promise<OpportunityRecord | null> => {
    try {
      const response = await twentyClient.query<{
        opportunity: OpportunityRecord | null;
      }>(GET_OPPORTUNITY_BY_ID, { opportunityId });

      return response.opportunity;
    } catch (error) {
      logGraphQlError(`getOpportunityById(${opportunityId}) failed`, error);
      return null;
    }
  },

  updateOpportunity: async (
    opportunityId: string,
    data: Record<string, unknown>,
  ): Promise<void> => {
    try {
      await twentyClient.mutate(UPDATE_OPPORTUNITY, { opportunityId, data });
    } catch (error) {
      logGraphQlError(`updateOpportunity(${opportunityId}) failed`, error);
    }
  },

  findHojaDeAcuerdosForHandoff: async (
    inquilinoId: string,
    naveId: string,
  ): Promise<
    (HojaDeAcuerdosRecord & { tipoContrato?: string; nave?: NaveRecord }) | null
  > => {
    try {
      const response = await twentyClient.query<{
        hojasDeAcuerdos: GraphQlConnection<
          HojaDeAcuerdosRecord & {
            tipoContrato?: string;
            nave?: { esPropiedadFuno?: boolean };
          }
        >;
      }>(FIND_HOJA_DE_ACUERDOS_FOR_HANDOFF, { inquilinoId, naveId });

      const hojaDeAcuerdos = mapConnectionNodes(response.hojasDeAcuerdos)[0];

      if (!hojaDeAcuerdos) {
        return null;
      }

      return {
        ...hojaDeAcuerdos,
        nave: hojaDeAcuerdos.nave
          ? {
              id: naveId,
              esPropiedadFuno: hojaDeAcuerdos.nave.esPropiedadFuno ?? false,
            }
          : undefined,
      };
    } catch (error) {
      logGraphQlError('findHojaDeAcuerdosForHandoff failed', error);
      return null;
    }
  },

  createCasoLegal: async (
    data: Record<string, unknown>,
  ): Promise<CasoLegalRecord | null> => {
    try {
      const response = await twentyClient.mutate<{
        createCasoLegal: CasoLegalRecord;
      }>(CREATE_CASO_LEGAL, { data });

      return response.createCasoLegal;
    } catch (error) {
      logGraphQlError('createCasoLegal failed', error);
      return null;
    }
  },

  findFlujosFirmasByCasoLegal: async (
    casoLegalId: string,
  ): Promise<FlujoFirmasRecord[]> => {
    try {
      const response = await twentyClient.query<{
        flujosFirmas: GraphQlConnection<FlujoFirmasRecord>;
      }>(GET_FLUJOS_FIRMAS_BY_CASO, { casoLegalId });

      return mapConnectionNodes(response.flujosFirmas).sort(
        (first, second) => first.orden - second.orden,
      );
    } catch (error) {
      logGraphQlError(
        `findFlujosFirmasByCasoLegal(${casoLegalId}) failed`,
        error,
      );
      return [];
    }
  },

  createFlujoFirmas: async (
    data: Record<string, unknown>,
  ): Promise<FlujoFirmasRecord | null> => {
    try {
      const response = await twentyClient.mutate<{
        createFlujoFirmas: FlujoFirmasRecord;
      }>(CREATE_FLUJO_FIRMAS, { data });

      return response.createFlujoFirmas;
    } catch (error) {
      logGraphQlError('createFlujoFirmas failed', error);
      return null;
    }
  },

  updateFlujoFirmas: async (
    flujoFirmasId: string,
    data: Record<string, unknown>,
  ): Promise<void> => {
    try {
      await twentyClient.mutate(UPDATE_FLUJO_FIRMAS, { flujoFirmasId, data });
    } catch (error) {
      logGraphQlError(`updateFlujoFirmas(${flujoFirmasId}) failed`, error);
    }
  },

  getExpedienteById: async (
    expedienteContratoId: string,
  ): Promise<ExpedienteContratoRecord | null> => {
    try {
      const response = await twentyClient.query<{
        expedienteContrato: ExpedienteContratoRecord | null;
      }>(GET_EXPEDIENTE_BY_ID, { expedienteContratoId });

      return response.expedienteContrato;
    } catch (error) {
      logGraphQlError(
        `getExpedienteById(${expedienteContratoId}) failed`,
        error,
      );
      return null;
    }
  },

  todayIsoDate: (): string => toIsoDateString(new Date()),

  findExpedientesActivos: async (): Promise<ExpedienteContratoRecord[]> => {
    try {
      const response = await twentyClient.query<{
        expedientesContrato: GraphQlConnection<ExpedienteContratoRecord>;
      }>(GET_EXPEDIENTES_ACTIVOS, {
        estatusActivo: toSelectValue(EXPEDIENTE_ESTATUS_ACTIVO),
      });

      return mapConnectionNodes(response.expedientesContrato);
    } catch (error) {
      logGraphQlError('findExpedientesActivos failed', error);
      return [];
    }
  },

  findOpportunityByInquilinoAndNave: async (
    inquilinoId: string,
    naveId: string,
  ): Promise<OpportunityRecord | null> => {
    try {
      const response = await twentyClient.query<{
        opportunities: GraphQlConnection<OpportunityRecord>;
      }>(FIND_OPPORTUNITY_BY_INQUILINO_NAVE, { inquilinoId, naveId });

      return mapConnectionNodes(response.opportunities)[0] ?? null;
    } catch (error) {
      logGraphQlError('findOpportunityByInquilinoAndNave failed', error);
      return null;
    }
  },

  hasActiveRenovacionCaso: async (
    inquilinoId: string,
    naveId: string,
  ): Promise<boolean> => {
    try {
      const response = await twentyClient.query<{
        casosLegales: GraphQlConnection<{ id: string }>;
      }>(COUNT_ACTIVE_RENOVACION_CASOS, {
        inquilinoId,
        naveId,
        tipoRenovacion: toSelectValue(TIPO_DOCUMENTO_RENOVACION),
        estatusCerrado: toSelectValue(CASO_LEGAL_ESTATUS_CERRADO),
        estatusCancelado: toSelectValue(CASO_LEGAL_ESTATUS_CANCELADO),
      });

      return mapConnectionNodes(response.casosLegales).length > 0;
    } catch (error) {
      logGraphQlError('hasActiveRenovacionCaso failed', error);
      return false;
    }
  },
};
