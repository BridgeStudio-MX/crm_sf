import { OPPORTUNITY_STAGE_HOJA_FIRMADA } from '../constants/parks.constants';
import { CREATE_HOJA_DE_ACUERDOS } from '../seed/demo-seed.mutations';
import { toSelectValue } from '../utils/select-value.util';
import { brokerNotificationStore } from './broker-notification.store';
import { twentyClient } from './twenty.client';
import { twentyDataService } from './twenty-data.service';

export type CreateHojaFromOpportunityInput = {
  opportunityId: string;
  ejecutivoAsignado?: string;
};

export type SignHojaInput = {
  hojaId: string;
  opportunityId: string;
  firmadaPorCliente?: boolean;
  firmadaPorCem?: boolean;
  fechaFirma?: string;
};

const resolveEsquemaComision = (brokerClasificacion?: string): string => {
  if (!brokerClasificacion) {
    return 'Recursos propios';
  }

  if (
    brokerClasificacion === 'TOP_10' ||
    brokerClasificacion.toLowerCase().includes('top 10')
  ) {
    return 'Broker top 10';
  }

  return 'Broker no top 10';
};

export const commercialHojaService = {
  createFromOpportunity: async (
    input: CreateHojaFromOpportunityInput,
  ): Promise<{ hojaId: string; esquemaComision: string }> => {
    const opportunity = await twentyDataService.getOpportunityById(
      input.opportunityId,
    );

    if (!opportunity) {
      throw new Error('Opportunity not found');
    }

    if (!opportunity.inquilinoVinculadoId || !opportunity.naveVinculadaId) {
      throw new Error(
        'Opportunity must have inquilino and nave linked before creating Hoja de Acuerdos',
      );
    }

    if (
      opportunity.aprobacionRequerida &&
      opportunity.estatusAprobacion !== 'APROBADA' &&
      !String(opportunity.estatusAprobacion ?? '')
        .toLowerCase()
        .includes('aprobada')
    ) {
      throw new Error(
        'Pending special-condition approval must be resolved before creating Hoja',
      );
    }

    let brokerClasificacion: string | undefined;
    let brokerId = opportunity.brokerVinculadoId;

    if (brokerId) {
      try {
        const brokerResponse = await twentyClient.query<{
          broker: { id: string; clasificacion?: string } | null;
        }>(
          `
          query GetBroker($brokerId: UUID!) {
            broker(filter: { id: { eq: $brokerId } }) {
              id
              clasificacion
            }
          }
        `,
          { brokerId },
        );
        brokerClasificacion = brokerResponse.broker?.clasificacion;
      } catch {
        brokerClasificacion = undefined;
      }
    }

    const esquemaComision = resolveEsquemaComision(brokerClasificacion);
    const m2 =
      opportunity.m2Ofertados ?? opportunity.m2Requeridos ?? 0;
    const precio =
      opportunity.precioPorM2Usd ?? 0;
    const referencia = `HOJA-${(opportunity.name ?? opportunity.id).slice(0, 40)}`;

    const response = await twentyClient.mutate<{
      createHojaDeAcuerdos: { id: string; referencia: string };
    }>(CREATE_HOJA_DE_ACUERDOS, {
      data: {
        referencia,
        fechaFirma: twentyDataService.todayIsoDate(),
        tipoContrato: toSelectValue(
          opportunity.tipoOperacion ?? 'Arrendamiento nuevo',
        ),
        m2Acordados: m2,
        precioUsdM2: precio,
        plazoMeses: opportunity.plazoContratoMeses ?? 60,
        periodoGraciaMeses: opportunity.periodoGraciaMeses ?? 0,
        depositoMeses: opportunity.depositoGarantiaMeses ?? 2,
        rentasAdelantadasMeses: opportunity.rentasAdelantadasMeses ?? 2,
        escalacionTipo: toSelectValue(
          opportunity.escalacionAnual ?? 'INPC',
        ),
        esquemaComision: toSelectValue(esquemaComision),
        firmadaPorCliente: false,
        firmadaPorCem: false,
        estatus: toSelectValue('Borrador'),
        ejecutivoAsignado: input.ejecutivoAsignado ?? 'LO',
        aprobacionRequerida: opportunity.aprobacionRequerida ?? false,
        aprobadoPor: toSelectValue('Pendiente'),
        inquilinoId: opportunity.inquilinoVinculadoId,
        naveId: opportunity.naveVinculadaId,
        brokerId: brokerId || undefined,
        oportunidadVinculadaId: input.opportunityId,
      },
    });

    await twentyDataService.updateOpportunity(input.opportunityId, {
      esquemaComision: toSelectValue(esquemaComision),
      stage: toSelectValue(OPPORTUNITY_STAGE_HOJA_FIRMADA),
    });

    brokerNotificationStore.add({
      type: 'alert',
      priority: 'normal',
      title: 'Hoja de Acuerdos creada (borrador)',
      body: `${referencia} · Esquema: ${esquemaComision}. Pendiente firma CEM y cliente.`,
      area: 'Comercial',
      opportunityId: input.opportunityId,
      opportunityName: opportunity.name,
    });

    return {
      hojaId: response.createHojaDeAcuerdos.id,
      esquemaComision,
    };
  },

  sign: async (
    input: SignHojaInput,
  ): Promise<{ hojaId: string; estatus: string; readyForLegal: boolean }> => {
    const updateData: Record<string, unknown> = {};

    if (input.firmadaPorCliente !== undefined) {
      updateData.firmadaPorCliente = input.firmadaPorCliente;
    }

    if (input.firmadaPorCem !== undefined) {
      updateData.firmadaPorCem = input.firmadaPorCem;
    }

    if (input.fechaFirma) {
      updateData.fechaFirma = input.fechaFirma;
    }

    const bothSigned =
      input.firmadaPorCliente === true && input.firmadaPorCem === true;

    if (bothSigned) {
      updateData.estatus = toSelectValue('Firmada');
    }

    await twentyClient.mutate(
      `
      mutation UpdateHoja($hojaId: UUID!, $data: HojaDeAcuerdosUpdateInput!) {
        updateHojaDeAcuerdos(id: $hojaId, data: $data) {
          id
          estatus
          firmadaPorCliente
          firmadaPorCem
        }
      }
    `,
      { hojaId: input.hojaId, data: updateData },
    );

    if (bothSigned) {
      brokerNotificationStore.add({
        type: 'alert',
        priority: 'high',
        title: 'Hoja de Acuerdos firmada — lista para Legal',
        body: 'CEM y cliente firmaron. Handoff a Legal desactivado en esta entrega (PARKS_LEGAL_HANDOFF_ENABLED=false).',
        area: 'Comercial',
        opportunityId: input.opportunityId,
      });
    }

    return {
      hojaId: input.hojaId,
      estatus: bothSigned ? 'Firmada' : 'Borrador',
      readyForLegal: bothSigned,
    };
  },
};
