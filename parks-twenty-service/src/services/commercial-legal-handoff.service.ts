import { envConfig } from '../config/env.config';
import {
  OPPORTUNITY_STAGE_EN_PROCESO_LEGAL,
  TIPO_CONTRATO_TO_TIPO_DOCUMENTO,
} from '../constants/parks.constants';
import { FIND_CASO_LEGAL_BY_HOJA } from '../graphql/queries';
import { toIsoDateString, parseLocalDate } from '../utils/business-days.util';
import { toSelectValue } from '../utils/select-value.util';
import { brokerNotificationStore } from './broker-notification.store';
import { PARKS_NOTIFICATION_LEGAL_ROLES } from './notification-audience.util';
import { slaService } from './sla.service';
import { twentyClient } from './twenty.client';
import { twentyDataService } from './twenty-data.service';

export type CommercialLegalHandoffResult = {
  created: boolean;
  skipped: boolean;
  reason?: string;
  casoLegalId?: string;
  referencia?: string;
};

const resolveTipoDocumento = (
  tipoContrato: string | undefined,
  tipoOperacion: string | undefined,
): string => {
  const sourceLabel = tipoContrato ?? tipoOperacion ?? 'Arrendamiento nuevo';

  return (
    TIPO_CONTRATO_TO_TIPO_DOCUMENTO[sourceLabel] ??
    TIPO_CONTRATO_TO_TIPO_DOCUMENTO['Arrendamiento nuevo']
  );
};

const findExistingCasoByHoja = async (
  hojaDeAcuerdosId: string,
): Promise<{ id: string; referencia?: string } | null> => {
  try {
    const response = await twentyClient.query<{
      casosLegales: {
        edges: Array<{ node: { id: string; referencia?: string } }>;
      };
    }>(FIND_CASO_LEGAL_BY_HOJA, { hojaDeAcuerdosId });

    return response.casosLegales?.edges?.[0]?.node ?? null;
  } catch {
    return null;
  }
};

export const commercialLegalHandoffService = {
  handoffFromOpportunity: async (
    opportunityId: string,
    hojaId?: string,
  ): Promise<CommercialLegalHandoffResult> => {
    if (!envConfig.parksLegalHandoffEnabled) {
      return {
        created: false,
        skipped: true,
        reason: 'PARKS_LEGAL_HANDOFF_ENABLED=false',
      };
    }

    const opportunity =
      await twentyDataService.getOpportunityById(opportunityId);

    if (!opportunity) {
      return {
        created: false,
        skipped: true,
        reason: 'Opportunity not found',
      };
    }

    if (!opportunity.inquilinoVinculadoId || !opportunity.naveVinculadaId) {
      return {
        created: false,
        skipped: true,
        reason: 'Opportunity missing inquilino or nave',
      };
    }

    const hojaDeAcuerdos = hojaId
      ? await twentyDataService.getHojaDeAcuerdosById(hojaId)
      : await twentyDataService.findHojaDeAcuerdosForHandoff(
          opportunity.inquilinoVinculadoId,
          opportunity.naveVinculadaId,
        );

    if (!hojaDeAcuerdos) {
      return {
        created: false,
        skipped: true,
        reason: 'Hoja de Acuerdos not found',
      };
    }

    const existing = await findExistingCasoByHoja(hojaDeAcuerdos.id);

    if (existing) {
      await twentyDataService.updateOpportunity(opportunity.id, {
        stage: toSelectValue(OPPORTUNITY_STAGE_EN_PROCESO_LEGAL),
      });

      brokerNotificationStore.add({
        type: 'alert',
        priority: 'high',
        title: `Deal → Legal — ${existing.referencia ?? hojaDeAcuerdos.referencia ?? opportunity.name ?? 'Caso'}`,
        body: 'Hoja firmada. El caso legal ya existía; revisa Contratos / Pipeline legal.',
        area: 'Legal',
        opportunityId: opportunity.id,
        opportunityName: opportunity.name,
        actionPath: '/parks/contratos',
        actionLabel: 'Abrir contratos',
        audienceRoleLabels: [...PARKS_NOTIFICATION_LEGAL_ROLES],
        audienceNames: ['Catalina Moreno', 'Catalina'],
      });

      return {
        created: false,
        skipped: true,
        reason: 'Caso legal already exists',
        casoLegalId: existing.id,
        referencia: existing.referencia,
      };
    }

    const folio =
      hojaDeAcuerdos.folio ??
      opportunity.folio ??
      null;
    const referencia =
      folio ??
      hojaDeAcuerdos.referencia ??
      `${opportunity.name ?? 'Oportunidad'} — Caso legal`;
    const tipoDocumento = resolveTipoDocumento(
      hojaDeAcuerdos.tipoContrato,
      opportunity.tipoOperacion,
    );
    const slaDiasHabiles = slaService.resolveSlaDiasHabiles(tipoDocumento);
    const fechaHojaAcuerdos = hojaDeAcuerdos.fechaFirma
      ? toIsoDateString(parseLocalDate(hojaDeAcuerdos.fechaFirma))
      : twentyDataService.todayIsoDate();

    const createdCasoLegal = await twentyDataService.createCasoLegal({
      referencia,
      folio: folio ?? undefined,
      tipoDocumento: toSelectValue(tipoDocumento),
      estatus: toSelectValue('Nuevo'),
      semaforo: 'AZUL',
      fechaHojaAcuerdos,
      slaDiasHabiles,
      diasTranscurridos: 0,
      documentacionCompleta: false,
      cotejoAprobado: false,
      esPropiedadFuno: hojaDeAcuerdos.nave?.esPropiedadFuno ?? false,
      hojaDeAcuerdosId: hojaDeAcuerdos.id,
      inquilinoId: opportunity.inquilinoVinculadoId,
      naveId: opportunity.naveVinculadaId,
    });

    if (!createdCasoLegal) {
      return {
        created: false,
        skipped: true,
        reason: 'Failed to create caso legal',
      };
    }

    await twentyDataService.updateNave(opportunity.naveVinculadaId, {
      estatus: toSelectValue('En negociación'),
    });

    await twentyDataService.updateOpportunity(opportunity.id, {
      stage: toSelectValue(OPPORTUNITY_STAGE_EN_PROCESO_LEGAL),
    });

    brokerNotificationStore.add({
      type: 'alert',
      priority: 'high',
      title: `Deal → Legal — ${referencia}`,
      body: `Caso legal creado. Visible en Contratos / Pipeline legal para Catalina.`,
      area: 'Legal',
      opportunityId: opportunity.id,
      opportunityName: opportunity.name,
      actionPath: '/parks/contratos',
      actionLabel: 'Abrir contratos',
      audienceRoleLabels: [...PARKS_NOTIFICATION_LEGAL_ROLES],
      audienceNames: ['Catalina Moreno', 'Catalina'],
    });

    await twentyDataService.createTask(
      '[Comercial] Entregar documentación cliente',
      `Entregar documentación del cliente en 5 días hábiles. Caso legal: ${referencia}`,
    );

    console.log(
      `[commercial-legal-handoff] Caso ${createdCasoLegal.id} created from opportunity ${opportunity.id}`,
    );

    return {
      created: true,
      skipped: false,
      casoLegalId: createdCasoLegal.id,
      referencia,
    };
  },
};
