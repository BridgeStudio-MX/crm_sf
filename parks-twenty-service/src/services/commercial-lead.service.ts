import { CREATE_INQUILINO, CREATE_OPPORTUNITY } from '../seed/demo-seed.mutations';
import {
  resolveCanalOrigenStorageValue,
  resolveGiroEmpresaStorageValue,
  resolveInquilinoSectorStorageValue,
  resolveLeadRecibidoStageValue,
} from '../utils/commercial-field-values.util';
import { toSelectValue } from '../utils/select-value.util';
import { brokerNotificationStore } from './broker-notification.store';
import { commercialDecisorService } from './commercial-decisor.service';
import { allocateNextFolio } from './folio.store';
import { twentyClient } from './twenty.client';
import { twentyDataService } from './twenty-data.service';

export type CreateLeadInput = {
  nombreCompleto: string;
  empresa: string;
  correo?: string;
  telefono?: string;
  giroEmpresa: string;
  metrosCuadradosRequeridos: number;
  ubicacionDeseada: string;
  plazoContratoMeses: number;
  presupuestoMensualUsd: number;
  canalOrigen: string;
  brokerId?: string;
  // Required whenever brokerId is set: the LO handles the internal
  // negotiation for every lead that comes through a broker.
  leasingOfficerAsignado?: string;
  recomendadoPor?: string;
  tipoOperacion?: string;
  // Build-to-suit optional
  alturaRequerida?: number;
  andenesRequeridos?: number;
  potenciaRequerida?: number;
  cargaPisoRequerida?: number;
  especificacionesTecnicas?: string;
};

export type AssignLeadInput = {
  opportunityId: string;
  leasingOfficerName: string;
  assignedBy: string;
};

const addBusinessDays = (startDate: Date, businessDays: number): Date => {
  const result = new Date(startDate);
  let remaining = businessDays;

  while (remaining > 0) {
    result.setDate(result.getDate() + 1);
    const dayOfWeek = result.getDay();

    if (dayOfWeek !== 0 && dayOfWeek !== 6) {
      remaining -= 1;
    }
  }

  return result;
};

export type CreateOpportunityForInquilinoInput = Omit<
  CreateLeadInput,
  'empresa' | 'nombreCompleto'
> & {
  nombreCompleto?: string;
};

export const commercialLeadService = {
  createLead: async (
    input: CreateLeadInput,
  ): Promise<{ opportunityId: string; inquilinoId: string; folio: string }> => {
    if (!input.canalOrigen?.trim()) {
      throw new Error('canalOrigen is required');
    }

    if (!input.empresa?.trim()) {
      throw new Error('empresa is required');
    }

    if (input.brokerId && !input.leasingOfficerAsignado?.trim()) {
      throw new Error(
        'leasingOfficerAsignado is required when brokerId is set',
      );
    }

    const inquilinoResponse = await twentyClient.mutate<{
      createInquilino: { id: string; empresa: string };
    }>(CREATE_INQUILINO, {
      data: {
        empresa: input.empresa.trim(),
        contactoPrincipal: input.nombreCompleto.trim(),
        emailContacto: input.correo?.trim() || undefined,
        telefono: input.telefono?.trim() || undefined,
        sector: resolveInquilinoSectorStorageValue(input.giroEmpresa),
        estatus: toSelectValue('Prospecto'),
      },
    });

    const inquilinoId = inquilinoResponse.createInquilino.id;
    const folio = allocateNextFolio();
    const opportunityName = `${input.empresa.trim()} — ${input.ubicacionDeseada} — ${input.metrosCuadradosRequeridos} m²`;

    const opportunityData: Record<string, unknown> = {
      name: opportunityName,
      folio,
      stage: resolveLeadRecibidoStageValue(),
      tipoOperacion: toSelectValue(
        input.tipoOperacion ?? 'Arrendamiento nuevo',
      ),
      m2Requeridos: input.metrosCuadradosRequeridos,
      ubicacionDeseada: toSelectValue(input.ubicacionDeseada),
      giroEmpresa: resolveGiroEmpresaStorageValue(input.giroEmpresa),
      plazoContratoMeses: input.plazoContratoMeses,
      presupuestoMensualUsd: input.presupuestoMensualUsd,
      canalOrigen: resolveCanalOrigenStorageValue(input.canalOrigen),
      inquilinoVinculadoId: inquilinoId,
      depositoGarantiaMeses: 2,
      rentasAdelantadasMeses: 2,
      escalacionAnual: toSelectValue('INPC'),
      esquemaComision: input.brokerId
        ? undefined
        : toSelectValue('Recursos propios'),
    };

    if (input.brokerId) {
      opportunityData.brokerVinculadoId = input.brokerId;
      opportunityData.canalOrigen = resolveCanalOrigenStorageValue('Broker');
      // A broker-sourced lead is assigned to its LO right at creation time,
      // since the LO owns the internal negotiation from the start.
      opportunityData.leasingOfficerAsignado = input.leasingOfficerAsignado;
      opportunityData.asignadoPor = `Alta con broker → ${input.leasingOfficerAsignado}`;
      opportunityData.asignadoEn = twentyDataService.todayIsoDate();
    }

    if (input.tipoOperacion === 'Build-to-suit') {
      opportunityData.alturaRequerida = input.alturaRequerida;
      opportunityData.andenesRequeridos = input.andenesRequeridos;
      opportunityData.potenciaRequerida = input.potenciaRequerida;
      opportunityData.cargaPisoRequerida = input.cargaPisoRequerida;
      opportunityData.especificacionesTecnicas = input.especificacionesTecnicas;
    }

    const opportunityResponse = await twentyClient.mutate<{
      createOpportunity: { id: string; name: string };
    }>(CREATE_OPPORTUNITY, { data: opportunityData });

    const opportunityId = opportunityResponse.createOpportunity.id;

    // Persist referrer after create so missing metadata never blocks lead intake.
    if (
      input.canalOrigen === 'Recomendación' &&
      input.recomendadoPor?.trim()
    ) {
      try {
        await twentyDataService.updateOpportunity(opportunityId, {
          recomendadoPor: input.recomendadoPor.trim(),
        });
      } catch (error) {
        console.warn(
          '[commercial-lead] recomendadoPor not saved (run setup:opportunity):',
          error instanceof Error ? error.message : error,
        );
      }
    }

    commercialDecisorService.createInitialFromLead({
      inquilinoId,
      opportunityId,
      nombreCompleto: input.nombreCompleto.trim(),
      correo: input.correo,
      telefono: input.telefono,
    });

    if (input.brokerId && input.leasingOfficerAsignado) {
      brokerNotificationStore.add({
        type: 'task',
        priority: 'high',
        title: `Lead con broker asignado: ${input.empresa}`,
        body: `${input.nombreCompleto} · ${input.metrosCuadradosRequeridos} m² · ${input.ubicacionDeseada} · Contactar en máximo 24 horas.`,
        area: 'Comercial',
        opportunityId,
        opportunityName,
        audienceNames: [input.leasingOfficerAsignado],
        audienceRoleLabels: [],
      });
    } else {
      const recomendacionSuffix =
        input.canalOrigen === 'Recomendación' && input.recomendadoPor?.trim()
          ? ` · Recomendado por: ${input.recomendadoPor.trim()}`
          : '';

      brokerNotificationStore.add({
        type: 'task',
        priority: 'high',
        title: `Lead nuevo sin asignar: ${input.empresa}`,
        body: `${input.nombreCompleto} · ${input.metrosCuadradosRequeridos} m² · ${input.ubicacionDeseada} · Canal: ${input.canalOrigen}${recomendacionSuffix}`,
        area: 'CEM',
        opportunityId,
        opportunityName,
      });
    }

    return { opportunityId, inquilinoId, folio };
  },

  createOpportunityForInquilino: async (
    inquilinoId: string,
    input: CreateOpportunityForInquilinoInput,
  ): Promise<{ opportunityId: string; inquilinoId: string; folio: string }> => {
    const inquilino = await twentyDataService.getInquilinoById(inquilinoId);

    if (!inquilino?.empresa) {
      throw new Error('Inquilino not found');
    }

    if (!input.canalOrigen?.trim()) {
      throw new Error('canalOrigen is required');
    }

    if (input.brokerId && !input.leasingOfficerAsignado?.trim()) {
      throw new Error(
        'leasingOfficerAsignado is required when brokerId is set',
      );
    }

    const contactoNombre =
      input.nombreCompleto?.trim() ||
      inquilino.contactoPrincipal?.trim() ||
      inquilino.empresa.trim();
    const folio = allocateNextFolio();
    const opportunityName = `${inquilino.empresa.trim()} — ${input.ubicacionDeseada} — ${input.metrosCuadradosRequeridos} m²`;

    const opportunityData: Record<string, unknown> = {
      name: opportunityName,
      folio,
      stage: resolveLeadRecibidoStageValue(),
      tipoOperacion: toSelectValue(
        input.tipoOperacion ?? 'Arrendamiento nuevo',
      ),
      m2Requeridos: input.metrosCuadradosRequeridos,
      ubicacionDeseada: toSelectValue(input.ubicacionDeseada),
      giroEmpresa: resolveGiroEmpresaStorageValue(input.giroEmpresa),
      plazoContratoMeses: input.plazoContratoMeses,
      presupuestoMensualUsd: input.presupuestoMensualUsd,
      canalOrigen: resolveCanalOrigenStorageValue(input.canalOrigen),
      inquilinoVinculadoId: inquilinoId,
      depositoGarantiaMeses: 2,
      rentasAdelantadasMeses: 2,
      escalacionAnual: toSelectValue('INPC'),
      esquemaComision: input.brokerId
        ? undefined
        : toSelectValue('Recursos propios'),
    };

    if (input.brokerId) {
      opportunityData.brokerVinculadoId = input.brokerId;
      opportunityData.canalOrigen = resolveCanalOrigenStorageValue('Broker');
      opportunityData.leasingOfficerAsignado = input.leasingOfficerAsignado;
      opportunityData.asignadoPor = `Alta con broker → ${input.leasingOfficerAsignado}`;
      opportunityData.asignadoEn = twentyDataService.todayIsoDate();
    }

    if (input.tipoOperacion === 'Build-to-suit') {
      opportunityData.alturaRequerida = input.alturaRequerida;
      opportunityData.andenesRequeridos = input.andenesRequeridos;
      opportunityData.potenciaRequerida = input.potenciaRequerida;
      opportunityData.cargaPisoRequerida = input.cargaPisoRequerida;
      opportunityData.especificacionesTecnicas = input.especificacionesTecnicas;
    }

    const opportunityResponse = await twentyClient.mutate<{
      createOpportunity: { id: string; name: string };
    }>(CREATE_OPPORTUNITY, { data: opportunityData });

    const opportunityId = opportunityResponse.createOpportunity.id;

    if (
      input.canalOrigen === 'Recomendación' &&
      input.recomendadoPor?.trim()
    ) {
      try {
        await twentyDataService.updateOpportunity(opportunityId, {
          recomendadoPor: input.recomendadoPor.trim(),
        });
      } catch (error) {
        console.warn(
          '[commercial-lead] recomendadoPor not saved (run setup:opportunity):',
          error instanceof Error ? error.message : error,
        );
      }
    }

    commercialDecisorService.createInitialFromLead({
      inquilinoId,
      opportunityId,
      nombreCompleto: contactoNombre,
      correo: input.correo ?? inquilino.emailContacto,
      telefono: input.telefono ?? inquilino.telefono,
    });

    if (input.brokerId && input.leasingOfficerAsignado) {
      brokerNotificationStore.add({
        type: 'task',
        priority: 'normal',
        title: `Oportunidad con broker asignada — ${inquilino.empresa}`,
        body: `${contactoNombre} · ${input.metrosCuadradosRequeridos} m² · ${input.ubicacionDeseada} · Cliente existente`,
        area: 'Comercial',
        opportunityId,
        opportunityName,
        audienceNames: [input.leasingOfficerAsignado],
        audienceRoleLabels: [],
      });
    } else {
      const recomendacionSuffix =
        input.canalOrigen === 'Recomendación' && input.recomendadoPor?.trim()
          ? ` · Recomendado por: ${input.recomendadoPor.trim()}`
          : '';

      brokerNotificationStore.add({
        type: 'task',
        priority: 'normal',
        title: `Nueva oportunidad — ${inquilino.empresa}`,
        body: `${contactoNombre} · ${input.metrosCuadradosRequeridos} m² · ${input.ubicacionDeseada} · Cliente existente${recomendacionSuffix}`,
        area: 'Comercial',
        opportunityId,
        opportunityName,
      });
    }

    return { opportunityId, inquilinoId, folio };
  },

  listUnassigned: async (): Promise<
    Array<{
      id: string;
      name?: string;
      folio?: string;
      stage?: string;
      m2Requeridos?: number;
      canalOrigen?: string;
      ubicacionDeseada?: string;
      asignadoPor?: string;
      createdAt?: string;
    }>
  > => {
    const response = await twentyClient.query<{
      opportunities: {
        edges: Array<{
          node: {
            id: string;
            name?: string;
            folio?: string;
            stage?: string;
            m2Requeridos?: number;
            canalOrigen?: string;
            ubicacionDeseada?: string;
            asignadoPor?: string;
            createdAt?: string;
          };
        }>;
      };
    }>(
      `
      query ListUnassignedLeads {
        opportunities(
          filter: {
            and: [
              { stage: { eq: "LEAD_RECIBIDO" } }
              {
                or: [
                  { asignadoPor: { is: NULL } }
                  { asignadoPor: { eq: "" } }
                ]
              }
            ]
          }
          first: 50
          orderBy: [{ createdAt: AscNullsLast }]
        ) {
          edges {
            node {
              id
              name
              folio
              stage
              m2Requeridos
              canalOrigen
              ubicacionDeseada
              asignadoPor
              createdAt
            }
          }
        }
      }
    `,
    );

    return response.opportunities.edges.map((edge) => edge.node);
  },

  assignLead: async (
    input: AssignLeadInput,
  ): Promise<{ opportunityId: string }> => {
    const today = twentyDataService.todayIsoDate();
    // Keep asignadoPor as the durable signal ("CEM → LO") even if the
    // dedicated LO field is not yet in workspace metadata.
    const assignPayload: Record<string, unknown> = {
      asignadoPor: `${input.assignedBy} → ${input.leasingOfficerName}`,
      asignadoEn: today,
      leasingOfficerAsignado: input.leasingOfficerName,
    };

    await twentyDataService.updateOpportunity(
      input.opportunityId,
      assignPayload,
    );

    // Store LO name in ejecutivo-style text field via note + notification
    await twentyDataService.createTask(
      `[LO] Contactar prospecto en máximo 24 horas`,
      `Lead asignado a ${input.leasingOfficerName} por ${input.assignedBy}. Vence: ${addBusinessDays(new Date(), 1).toISOString().slice(0, 10)}. Oportunidad: ${input.opportunityId}`,
    );

    brokerNotificationStore.add({
      type: 'task',
      priority: 'high',
      title: `Lead asignado a ${input.leasingOfficerName}`,
      body: `Asignado por ${input.assignedBy}. Contactar en máximo 24 horas.`,
      area: 'Comercial',
      opportunityId: input.opportunityId,
      audienceNames: [input.leasingOfficerName],
      // Empty roles = only the named LO sees this (not all commercial / not Legal).
      audienceRoleLabels: [],
    });

    return { opportunityId: input.opportunityId };
  },
};
