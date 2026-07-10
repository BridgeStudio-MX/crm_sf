import { CREATE_INQUILINO, CREATE_OPPORTUNITY } from '../seed/demo-seed.mutations';
import {
  resolveCanalOrigenStorageValue,
  resolveLeadRecibidoStageValue,
} from '../utils/commercial-field-values.util';
import { toSelectValue } from '../utils/select-value.util';
import { brokerNotificationStore } from './broker-notification.store';
import { commercialDecisorService } from './commercial-decisor.service';
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
  ): Promise<{ opportunityId: string; inquilinoId: string }> => {
    if (!input.canalOrigen?.trim()) {
      throw new Error('canalOrigen is required');
    }

    if (!input.empresa?.trim()) {
      throw new Error('empresa is required');
    }

    const inquilinoResponse = await twentyClient.mutate<{
      createInquilino: { id: string; empresa: string };
    }>(CREATE_INQUILINO, {
      data: {
        empresa: input.empresa.trim(),
        contactoPrincipal: input.nombreCompleto.trim(),
        emailContacto: input.correo?.trim() || undefined,
        telefono: input.telefono?.trim() || undefined,
        sector: toSelectValue(input.giroEmpresa),
        estatus: toSelectValue('Prospecto'),
      },
    });

    const inquilinoId = inquilinoResponse.createInquilino.id;
    const opportunityName = `${input.empresa.trim()} — ${input.ubicacionDeseada} — ${input.metrosCuadradosRequeridos} m²`;

    const opportunityData: Record<string, unknown> = {
      name: opportunityName,
      stage: resolveLeadRecibidoStageValue(),
      tipoOperacion: toSelectValue(
        input.tipoOperacion ?? 'Arrendamiento nuevo',
      ),
      m2Requeridos: input.metrosCuadradosRequeridos,
      ubicacionDeseada: toSelectValue(input.ubicacionDeseada),
      giroEmpresa: toSelectValue(input.giroEmpresa),
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

    commercialDecisorService.createInitialFromLead({
      inquilinoId,
      opportunityId,
      nombreCompleto: input.nombreCompleto.trim(),
      correo: input.correo,
      telefono: input.telefono,
    });

    brokerNotificationStore.add({
      type: 'task',
      priority: 'high',
      title: `Lead nuevo sin asignar: ${input.empresa}`,
      body: `${input.nombreCompleto} · ${input.metrosCuadradosRequeridos} m² · ${input.ubicacionDeseada} · Canal: ${input.canalOrigen}`,
      area: 'CEM',
      opportunityId,
      opportunityName,
    });

    return { opportunityId, inquilinoId };
  },

  createOpportunityForInquilino: async (
    inquilinoId: string,
    input: CreateOpportunityForInquilinoInput,
  ): Promise<{ opportunityId: string; inquilinoId: string }> => {
    const inquilino = await twentyDataService.getInquilinoById(inquilinoId);

    if (!inquilino?.empresa) {
      throw new Error('Inquilino not found');
    }

    if (!input.canalOrigen?.trim()) {
      throw new Error('canalOrigen is required');
    }

    const contactoNombre =
      input.nombreCompleto?.trim() ||
      inquilino.contactoPrincipal?.trim() ||
      inquilino.empresa.trim();
    const opportunityName = `${inquilino.empresa.trim()} — ${input.ubicacionDeseada} — ${input.metrosCuadradosRequeridos} m²`;

    const opportunityData: Record<string, unknown> = {
      name: opportunityName,
      stage: resolveLeadRecibidoStageValue(),
      tipoOperacion: toSelectValue(
        input.tipoOperacion ?? 'Arrendamiento nuevo',
      ),
      m2Requeridos: input.metrosCuadradosRequeridos,
      ubicacionDeseada: toSelectValue(input.ubicacionDeseada),
      giroEmpresa: toSelectValue(input.giroEmpresa),
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

    commercialDecisorService.createInitialFromLead({
      inquilinoId,
      opportunityId,
      nombreCompleto: contactoNombre,
      correo: input.correo ?? inquilino.emailContacto,
      telefono: input.telefono ?? inquilino.telefono,
    });

    brokerNotificationStore.add({
      type: 'task',
      priority: 'normal',
      title: `Nueva oportunidad — ${inquilino.empresa}`,
      body: `${contactoNombre} · ${input.metrosCuadradosRequeridos} m² · ${input.ubicacionDeseada} · Cliente existente`,
      area: 'Comercial',
      opportunityId,
      opportunityName,
    });

    return { opportunityId, inquilinoId };
  },

  listUnassigned: async (): Promise<
    Array<{
      id: string;
      name?: string;
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
              { asignadoPor: { is: NULL } }
            ]
          }
          first: 50
          orderBy: [{ createdAt: AscNullsLast }]
        ) {
          edges {
            node {
              id
              name
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

    await twentyDataService.updateOpportunity(input.opportunityId, {
      asignadoPor: input.assignedBy,
      asignadoEn: today,
      pointOfContactId: undefined,
    });

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
      area: 'Broker',
      opportunityId: input.opportunityId,
    });

    // Persist assignee name for audit trail on opportunity
    await twentyDataService.updateOpportunity(input.opportunityId, {
      asignadoPor: `${input.assignedBy} → ${input.leasingOfficerName}`,
      asignadoEn: today,
    });

    return { opportunityId: input.opportunityId };
  },
};
