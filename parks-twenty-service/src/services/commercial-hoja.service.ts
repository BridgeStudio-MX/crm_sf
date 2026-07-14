import fs from 'fs';
import path from 'path';

import Handlebars from 'handlebars';

import { envConfig } from '../config/env.config';
import { OPPORTUNITY_STAGE_EN_PROCESO_LEGAL, OPPORTUNITY_STAGE_HOJA_FIRMADA } from '../constants/parks.constants';
import { CREATE_HOJA_DE_ACUERDOS } from '../seed/demo-seed.mutations';
import { type HojaDeAcuerdosRecord } from '../types/parks.types';
import { toSelectValue } from '../utils/select-value.util';
import { brokerNotificationStore } from './broker-notification.store';
import { comiteService } from './comite.service';
import { commercialLegalHandoffService } from './commercial-legal-handoff.service';
import { twentyClient } from './twenty.client';
import { twentyDataService } from './twenty-data.service';
import {
  PARKS_NOTIFICATION_CEM_ROLES,
  PARKS_NOTIFICATION_COMMERCIAL_ROLES,
  PARKS_NOTIFICATION_LEGAL_ROLES,
  ParksNotificationRole,
} from './notification-audience.util';
import { buildPipelineDealActionPath } from '../utils/notification-action-path.util';

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

export type UpdateHojaDraftInput = {
  hojaId: string;
  m2Acordados?: number;
  precioUsdM2?: number;
  plazoMeses?: number;
  fechaInicio?: string | null;
  periodoGraciaMeses?: number;
  depositoMeses?: number;
  escalacionAnualPct?: number;
  condicionesEspeciales?: string;
  tipoContrato?: string;
  esquemaComision?: string;
  ejecutivoAsignado?: string;
  brokerComisionPct?: number;
  brokerComisionMonto?: number;
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

const assertDraftEditable = (hoja: HojaDeAcuerdosRecord): void => {
  if (hoja.firmadaPorCliente && hoja.firmadaPorCem) {
    throw new Error('No se puede editar una Hoja ya firmada');
  }

  const estatus = String(hoja.estatus ?? '');

  if (
    estatus === 'FIRMADA' ||
    estatus.toLowerCase().includes('firmada') ||
    estatus === 'ENVIADA_A_LEGAL' ||
    estatus.toLowerCase().includes('enviada')
  ) {
    throw new Error('No se puede editar una Hoja ya firmada o enviada a Legal');
  }
};

const resolveTemplatesDirectory = (): string => {
  const fromSource = path.join(process.cwd(), 'src/templates');
  const fromDist = path.join(__dirname, '../templates');

  if (fs.existsSync(fromSource)) {
    return fromSource;
  }

  return fromDist;
};

const registerHojaCopyHelpers = () => {
  Handlebars.registerHelper('rentaMensualTotal', (hojaAcuerdos: unknown) => {
    if (
      typeof hojaAcuerdos !== 'object' ||
      hojaAcuerdos === null ||
      !('precioUsdM2' in hojaAcuerdos) ||
      !('m2Acordados' in hojaAcuerdos)
    ) {
      return '0.00';
    }

    const record = hojaAcuerdos as {
      precioUsdM2?: number;
      m2Acordados?: number;
    };
    const total = (record.precioUsdM2 ?? 0) * (record.m2Acordados ?? 0);

    return total.toLocaleString('en-US', {
      minimumFractionDigits: 2,
      maximumFractionDigits: 2,
    });
  });
};

const formatGenerationDate = (): string =>
  new Date().toLocaleDateString('es-MX', {
    year: 'numeric',
    month: 'long',
    day: 'numeric',
  });

const humanizeSelectValue = (value?: string): string => {
  if (!value) {
    return '';
  }

  if (value.includes(' ') || /[a-záéíóúñ]/i.test(value)) {
    return value;
  }

  return value
    .toLowerCase()
    .split('_')
    .filter(Boolean)
    .map((part) => part.charAt(0).toUpperCase() + part.slice(1))
    .join(' ');
};

export const commercialHojaService = {
  getById: async (hojaId: string): Promise<HojaDeAcuerdosRecord> => {
    const hoja = await twentyDataService.getHojaDeAcuerdosById(hojaId);

    if (!hoja) {
      throw new Error('Hoja de Acuerdos not found');
    }

    return hoja;
  },

  findByOpportunity: async (
    opportunityId: string,
  ): Promise<HojaDeAcuerdosRecord | null> => {
    return twentyDataService.findHojaDeAcuerdosByOpportunity(opportunityId);
  },

  createFromOpportunity: async (
    input: CreateHojaFromOpportunityInput,
  ): Promise<{
    hojaId: string;
    esquemaComision: string;
    hoja: HojaDeAcuerdosRecord;
  }> => {
    const existing = await twentyDataService.findHojaDeAcuerdosByOpportunity(
      input.opportunityId,
    );

    if (existing && !existing.firmadaPorCliente && !existing.firmadaPorCem) {
      return {
        hojaId: existing.id,
        esquemaComision: existing.esquemaComision ?? 'Recursos propios',
        hoja: existing,
      };
    }

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
    const brokerId = opportunity.brokerVinculadoId;

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
    const m2 = opportunity.m2Ofertados ?? opportunity.m2Requeridos ?? 0;
    const precio = opportunity.precioPorM2Usd ?? 0;
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
        escalacionTipo: toSelectValue(opportunity.escalacionAnual ?? 'INPC'),
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
    });

    const hoja =
      (await twentyDataService.getHojaDeAcuerdosById(
        response.createHojaDeAcuerdos.id,
      )) ??
      ({
        id: response.createHojaDeAcuerdos.id,
        referencia,
        m2Acordados: m2,
        precioUsdM2: precio,
        plazoMeses: opportunity.plazoContratoMeses ?? 60,
        esquemaComision,
        estatus: 'Borrador',
        ejecutivoAsignado: input.ejecutivoAsignado ?? 'LO',
      } as HojaDeAcuerdosRecord);

    brokerNotificationStore.add({
      type: 'alert',
      priority: 'high',
      title: 'Hoja de Acuerdos lista para firma CEM',
      body: `${referencia} · Revisa y firma la Hoja en la pestaña Hoja.`,
      area: 'Comercial',
      opportunityId: input.opportunityId,
      opportunityName: opportunity.name,
      actionPath: buildPipelineDealActionPath(input.opportunityId, {
        tab: 'hoja',
      }),
      actionLabel: 'Firmar como CEM',
      audienceRoleLabels: [...PARKS_NOTIFICATION_CEM_ROLES],
    });

    return {
      hojaId: response.createHojaDeAcuerdos.id,
      esquemaComision,
      hoja,
    };
  },

  updateDraft: async (
    input: UpdateHojaDraftInput,
  ): Promise<HojaDeAcuerdosRecord> => {
    const existing = await twentyDataService.getHojaDeAcuerdosById(input.hojaId);

    if (!existing) {
      throw new Error('Hoja de Acuerdos not found');
    }

    assertDraftEditable(existing);

    const updateData: Record<string, unknown> = {};

    if (input.m2Acordados !== undefined) {
      updateData.m2Acordados = input.m2Acordados;
    }

    if (input.precioUsdM2 !== undefined) {
      updateData.precioUsdM2 = input.precioUsdM2;
    }

    if (input.plazoMeses !== undefined) {
      updateData.plazoMeses = input.plazoMeses;
    }

    if (input.fechaInicio !== undefined) {
      updateData.fechaInicio = input.fechaInicio;
    }

    if (input.periodoGraciaMeses !== undefined) {
      updateData.periodoGraciaMeses = input.periodoGraciaMeses;
    }

    if (input.depositoMeses !== undefined) {
      updateData.depositoMeses = input.depositoMeses;
    }

    if (input.escalacionAnualPct !== undefined) {
      updateData.escalacionAnualPct = input.escalacionAnualPct;
    }

    if (input.condicionesEspeciales !== undefined) {
      updateData.condicionesEspeciales = input.condicionesEspeciales;
    }

    if (input.tipoContrato !== undefined) {
      updateData.tipoContrato = toSelectValue(input.tipoContrato);
    }

    if (input.esquemaComision !== undefined) {
      updateData.esquemaComision = toSelectValue(input.esquemaComision);
    }

    if (input.ejecutivoAsignado !== undefined) {
      updateData.ejecutivoAsignado = input.ejecutivoAsignado;
    }

    if (input.brokerComisionPct !== undefined) {
      updateData.brokerComisionPct = input.brokerComisionPct;
    }

    if (input.brokerComisionMonto !== undefined) {
      updateData.brokerComisionMonto = input.brokerComisionMonto;
    }

    await twentyClient.mutate(
      `
      mutation UpdateHojaDraft($hojaId: UUID!, $data: HojaDeAcuerdosUpdateInput!) {
        updateHojaDeAcuerdos(id: $hojaId, data: $data) {
          id
        }
      }
    `,
      { hojaId: input.hojaId, data: updateData },
    );

    const updated = await twentyDataService.getHojaDeAcuerdosById(input.hojaId);

    if (!updated) {
      throw new Error('Hoja de Acuerdos not found after update');
    }

    return updated;
  },

  sign: async (
    input: SignHojaInput,
  ): Promise<{
    hojaId: string;
    estatus: string;
    readyForLegal: boolean;
    firmadaPorCem: boolean;
    firmadaPorCliente: boolean;
    casoLegalId?: string;
    nextStage?: string;
    handoffReason?: string;
  }> => {
    const existing = await twentyDataService.getHojaDeAcuerdosById(input.hojaId);

    if (!existing) {
      throw new Error('Hoja de Acuerdos not found');
    }

    const firmadaPorCem =
      input.firmadaPorCem === true || existing.firmadaPorCem === true;
    const firmadaPorCliente =
      input.firmadaPorCliente === true || existing.firmadaPorCliente === true;

    const updateData: Record<string, unknown> = {
      firmadaPorCem,
      firmadaPorCliente,
    };

    if (input.fechaFirma) {
      updateData.fechaFirma = input.fechaFirma;
    }

    const bothSigned = firmadaPorCem && firmadaPorCliente;

    if (bothSigned) {
      updateData.estatus = toSelectValue('Firmada');
    } else if (firmadaPorCem || firmadaPorCliente) {
      updateData.estatus = toSelectValue('Borrador');
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

    if (firmadaPorCem && !firmadaPorCliente) {
      brokerNotificationStore.add({
        type: 'alert',
        priority: 'normal',
        title: 'CEM firmó la Hoja de Acuerdos',
        body: 'Pendiente registrar la firma del cliente para enviar a Legal.',
        area: 'Comercial',
        opportunityId: input.opportunityId,
        actionPath: buildPipelineDealActionPath(input.opportunityId, {
          tab: 'hoja',
        }),
        actionLabel: 'Registrar firma del cliente',
        audienceRoleLabels: [
          ParksNotificationRole.EjecutivoComercial,
          ParksNotificationRole.DirectorComercial,
        ],
      });
    }

    if (firmadaPorCliente && !firmadaPorCem) {
      brokerNotificationStore.add({
        type: 'alert',
        priority: 'high',
        title: 'Cliente firmó — falta firma CEM',
        body: 'Abre el deal y firma la Hoja de Acuerdos como CEM.',
        area: 'Comercial',
        opportunityId: input.opportunityId,
        actionPath: buildPipelineDealActionPath(input.opportunityId, {
          tab: 'hoja',
        }),
        actionLabel: 'Firmar como CEM',
        audienceRoleLabels: [...PARKS_NOTIFICATION_CEM_ROLES],
      });
    }

    let casoLegalId: string | undefined;
    let nextStage = bothSigned
      ? toSelectValue(OPPORTUNITY_STAGE_HOJA_FIRMADA)
      : undefined;
    let handoffReason: string | undefined;

    if (bothSigned) {
      await twentyDataService.updateOpportunity(input.opportunityId, {
        stage: toSelectValue(OPPORTUNITY_STAGE_HOJA_FIRMADA),
      });

      try {
        if (envConfig.parksComiteEnabled) {
          const opportunity = await twentyDataService.getOpportunityById(
            input.opportunityId,
          );
          const updatedHoja =
            (await twentyDataService.getHojaDeAcuerdosById(input.hojaId)) ??
            existing;

          const comite = await comiteService.createFromHoja({
            opportunityId: input.opportunityId,
            opportunityName: opportunity?.name,
            hojaDeAcuerdosId: input.hojaId,
            leasingOfficerNombre:
              updatedHoja.ejecutivoAsignado ?? 'Leasing Officer',
            cemQueFirmoNombre: 'Héctor Montelongo',
            deal: {
              clienteRazonSocial:
                opportunity?.name?.split('—')[0]?.trim() ??
                opportunity?.name ??
                'Cliente Parks',
              naveNomenclatura:
                updatedHoja.nave?.identificador ??
                opportunity?.naveVinculada?.identificador ??
                'Nave',
              glaM2: updatedHoja.m2Acordados ?? opportunity?.m2Requeridos ?? 0,
              precioAcordadoM2:
                updatedHoja.precioUsdM2 ?? opportunity?.precioPorM2Usd ?? 0,
              plazoMeses:
                updatedHoja.plazoMeses ??
                opportunity?.plazoContratoMeses ??
                36,
              periodoGraciaMeses: updatedHoja.periodoGraciaMeses,
              depositosGarantiaMeses: updatedHoja.depositoMeses,
              condicionesEspeciales: updatedHoja.condicionesEspeciales ?? '',
            },
          });

          handoffReason = `Comité ${comite.referencia} abierto — pendiente de votación`;

          brokerNotificationStore.add({
            type: 'alert',
            priority: 'high',
            title: 'Hoja firmada — enviada al Comité de Autorización',
            body: `${comite.deal.clienteRazonSocial} · ${comite.deal.naveNomenclatura} · Vence en ${envConfig.parksComiteSlaHoras}h`,
            area: 'Comercial',
            opportunityId: input.opportunityId,
            actionPath: `/parks/comite/${comite.id}`,
            actionLabel: 'Ver comité',
            audienceRoleLabels: [...PARKS_NOTIFICATION_COMMERCIAL_ROLES],
          });
        } else {
          const handoff =
            await commercialLegalHandoffService.handoffFromOpportunity(
              input.opportunityId,
              input.hojaId,
            );

          casoLegalId = handoff.casoLegalId;
          handoffReason = handoff.reason;

          if (handoff.created || handoff.casoLegalId) {
            nextStage = toSelectValue(OPPORTUNITY_STAGE_EN_PROCESO_LEGAL);
          }

          if (!handoff.created) {
            const notifyLegal = Boolean(handoff.casoLegalId);

            brokerNotificationStore.add({
              type: 'alert',
              priority: 'high',
              title: 'Hoja de Acuerdos firmada por CEM y cliente',
              body:
                handoff.reason === 'PARKS_LEGAL_HANDOFF_ENABLED=false'
                  ? 'Handoff a Legal desactivado (PARKS_LEGAL_HANDOFF_ENABLED=false).'
                  : `Firmas completas. ${handoff.reason ?? 'Listo para Legal.'}`,
              area: notifyLegal ? 'Legal' : 'Comercial',
              opportunityId: input.opportunityId,
              actionPath: notifyLegal
                ? '/parks/contratos'
                : buildPipelineDealActionPath(input.opportunityId, {
                    tab: 'hoja',
                  }),
              actionLabel: notifyLegal ? 'Ver contratos' : 'Ver Hoja',
              audienceRoleLabels: notifyLegal
                ? [...PARKS_NOTIFICATION_LEGAL_ROLES]
                : [...PARKS_NOTIFICATION_COMMERCIAL_ROLES],
              audienceNames: notifyLegal
                ? ['Catalina Moreno', 'Catalina']
                : undefined,
            });
          }
        }
      } catch (error) {
        handoffReason =
          error instanceof Error ? error.message : 'Handoff failed';
        console.error(
          `[commercial-hoja] Legal/Comité handoff failed for opportunity ${input.opportunityId}:`,
          error,
        );
      }
    }

    return {
      hojaId: input.hojaId,
      estatus: bothSigned ? 'Firmada' : 'Borrador',
      readyForLegal: bothSigned,
      firmadaPorCem,
      firmadaPorCliente,
      casoLegalId,
      nextStage,
      handoffReason,
    };
  },

  generateCopy: async (
    hojaId: string,
  ): Promise<{ html: string; fileName: string; referencia: string }> => {
    const hoja = await twentyDataService.getHojaDeAcuerdosById(hojaId);

    if (!hoja) {
      throw new Error('Hoja de Acuerdos not found');
    }

    let nave = hoja.nave;
    let inquilino = hoja.inquilino;

    if (hoja.naveId && (!nave?.parque || !nave.identificador)) {
      const naveFull = await twentyDataService.getNaveById(hoja.naveId);

      if (naveFull) {
        nave = naveFull;
      }
    }

    if (hoja.inquilinoId && !inquilino?.empresa) {
      const inquilinoFull = await twentyDataService.getInquilinoById(
        hoja.inquilinoId,
      );

      if (inquilinoFull) {
        inquilino = inquilinoFull;
      }
    }

    const parque = nave?.parque;
    const firmada = Boolean(hoja.firmadaPorCliente && hoja.firmadaPorCem);
    const templatePath = path.join(
      resolveTemplatesDirectory(),
      'carta-intencion.hbs',
    );
    const templateSource = fs.readFileSync(templatePath, 'utf-8');

    registerHojaCopyHelpers();

    const template = Handlebars.compile(templateSource);
    const html = template({
      referencia: hoja.referencia ?? hoja.id,
      tipoContrato: humanizeSelectValue(hoja.tipoContrato) || 'arrendamiento',
      esquemaComision: humanizeSelectValue(hoja.esquemaComision),
      ejecutivoAsignado: hoja.ejecutivoAsignado,
      firmada,
      hojaAcuerdos: {
        m2Acordados: hoja.m2Acordados,
        precioUsdM2: hoja.precioUsdM2,
        plazoMeses: hoja.plazoMeses,
        fechaInicio: hoja.fechaInicio,
        fechaFirma: hoja.fechaFirma,
        periodoGraciaMeses: hoja.periodoGraciaMeses,
        depositoMeses: hoja.depositoMeses,
        escalacionAnualPct: hoja.escalacionAnualPct,
        condicionesEspeciales: hoja.condicionesEspeciales,
      },
      inquilino: {
        empresa: inquilino?.empresa ?? 'Cliente',
        rfc: inquilino?.rfc,
        repLegalNombre: inquilino?.repLegalNombre,
      },
      nave: {
        identificador: nave?.identificador ?? 'Nave por definir',
        m2: hoja.m2Acordados,
      },
      parque: {
        nombre: parque?.nombre ?? 'Parks Industrial',
        ubicacion: parque?.ubicacion ?? '',
      },
      fechaGeneracion: formatGenerationDate(),
      numeroVersion: 1,
    });

    const fileSlug = (hoja.referencia ?? hoja.id)
      .replace(/\s+/g, '-')
      .toLowerCase();
    const fileName = `hoja-acuerdos-${fileSlug}-${Date.now()}.html`;

    return {
      html,
      fileName,
      referencia: hoja.referencia ?? hoja.id,
    };
  },
};
