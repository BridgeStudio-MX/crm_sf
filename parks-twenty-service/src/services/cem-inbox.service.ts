import {
  type CemInboxItem,
  type CemInboxSummary,
} from '../types/cem-inbox.types';
import { isSelectValueEqual } from '../utils/select-value.util';
import { commercialLeadService } from './commercial-lead.service';
import { twentyClient } from './twenty.client';
import { twentyDataService } from './twenty-data.service';

const CEM_APPROVAL_LEVEL = 'CEM';
const PENDING_APPROVAL_STATUS = 'Pendiente';

const formatUsdCompact = (amountUsd?: number): string | undefined => {
  if (amountUsd == null || Number.isNaN(amountUsd)) {
    return undefined;
  }

  if (Math.abs(amountUsd) >= 1_000) {
    return `$${(amountUsd / 1_000).toFixed(0)}K USD`;
  }

  return `$${amountUsd.toFixed(0)} USD`;
};

const microsToUsd = (amountMicros?: number): number | undefined => {
  if (typeof amountMicros !== 'number') {
    return undefined;
  }

  return amountMicros / 1_000_000;
};

const buildLeadItems = async (): Promise<CemInboxItem[]> => {
  const leads = await commercialLeadService.listUnassigned();

  return leads.map((lead) => {
    const m2Label =
      typeof lead.m2Requeridos === 'number'
        ? `${lead.m2Requeridos.toLocaleString('es-MX')} m²`
        : 'm² n/d';
    const canal = lead.canalOrigen?.trim() || 'Sin canal';
    const ubicacion = lead.ubicacionDeseada?.trim() || 'Sin ubicación';

    return {
      id: `lead-${lead.id}`,
      kind: 'lead-sin-asignar' as const,
      title: lead.name ?? 'Lead sin nombre',
      subtitle: 'Cola CEM · asignación a LO',
      detail: `${canal} · ${m2Label} · ${ubicacion}`,
      priority: 'high' as const,
      actionPath: '/parks/leads-cem',
      canResolve: false,
      entityId: lead.id,
      createdAt: lead.createdAt,
    };
  });
};

const buildApprovalItems = async (): Promise<CemInboxItem[]> => {
  const opportunities = await twentyDataService.findOpportunitiesSummary();

  return opportunities
    .filter(
      (opportunity) =>
        opportunity.aprobacionRequerida === true &&
        isSelectValueEqual(opportunity.nivelAprobacion, CEM_APPROVAL_LEVEL) &&
        isSelectValueEqual(
          opportunity.estatusAprobacion,
          PENDING_APPROVAL_STATUS,
        ),
    )
    .map((opportunity) => {
      const amountUsd = microsToUsd(opportunity.amount?.amountMicros);

      return {
        id: `approval-${opportunity.id}`,
        kind: 'aprobacion-comercial' as const,
        title: opportunity.name ?? 'Oportunidad sin nombre',
        subtitle: 'Aprobación CEM · condiciones especiales',
        detail:
          opportunity.comentarioAprobacion?.trim() ||
          'Condiciones especiales pendientes de autorización del Director Comercial.',
        amountLabel: formatUsdCompact(amountUsd),
        priority: 'high' as const,
        actionPath: `/object/opportunity/${opportunity.id}`,
        canResolve: true,
        entityId: opportunity.id,
        createdAt: opportunity.updatedAt,
      };
    });
};

const buildHojaFirmaItems = async (): Promise<CemInboxItem[]> => {
  try {
    const response = await twentyClient.query<{
      hojasDeAcuerdos: {
        edges: Array<{
          node: {
            id: string;
            referencia?: string;
            firmadaPorCem?: boolean;
            firmadaPorCliente?: boolean;
            estatus?: string;
            oportunidadVinculadaId?: string;
            inquilino?: { empresa?: string };
            updatedAt?: string;
          };
        }>;
      };
    }>(
      `
      query ListHojasPendingCemFirma {
        hojasDeAcuerdos(
          filter: { firmadaPorCem: { eq: false } }
          first: 50
          orderBy: [{ updatedAt: DescNullsLast }]
        ) {
          edges {
            node {
              id
              referencia
              firmadaPorCem
              firmadaPorCliente
              estatus
              oportunidadVinculadaId
              updatedAt
              inquilino {
                empresa
              }
            }
          }
        }
      }
    `,
    );

    return response.hojasDeAcuerdos.edges
      .map((edge) => edge.node)
      .filter((hoja) => {
        const estatus = (hoja.estatus ?? '').toLowerCase();
        return !estatus.includes('cancel') && !estatus.includes('rechaz');
      })
      .map((hoja) => {
        const empresa = hoja.inquilino?.empresa ?? 'Cliente';
        const opportunityPath = hoja.oportunidadVinculadaId
          ? `/object/opportunity/${hoja.oportunidadVinculadaId}`
          : '/parks/pipeline';
        const clienteStatus = hoja.firmadaPorCliente
          ? 'Cliente ya firmó'
          : 'Pendiente firma cliente';

        return {
          id: `hoja-${hoja.id}`,
          kind: 'firma-hoja' as const,
          title: hoja.referencia ?? `Hoja ${hoja.id.slice(0, 8)}`,
          subtitle: `Firma CEM · ${empresa}`,
          detail: `${clienteStatus}. Abre el deal y firma la Hoja de Acuerdos como CEM.`,
          priority: hoja.firmadaPorCliente
            ? ('high' as const)
            : ('normal' as const),
          actionPath: opportunityPath,
          canResolve: false,
          entityId: hoja.id,
          createdAt: hoja.updatedAt,
        };
      });
  } catch (error) {
    console.error('[cem-inbox] hojas pending CEM failed', error);
    return [];
  }
};

const sortInboxItems = (items: CemInboxItem[]): CemInboxItem[] =>
  [...items].sort((leftItem, rightItem) => {
    if (leftItem.priority !== rightItem.priority) {
      return leftItem.priority === 'high' ? -1 : 1;
    }

    return leftItem.title.localeCompare(rightItem.title, 'es');
  });

export const cemInboxService = {
  getInbox: async (): Promise<CemInboxSummary> => {
    const [leadItems, approvalItems, hojaItems] = await Promise.all([
      buildLeadItems().catch((error) => {
        console.error('[cem-inbox] leads failed', error);
        return [] as CemInboxItem[];
      }),
      buildApprovalItems().catch((error) => {
        console.error('[cem-inbox] approvals failed', error);
        return [] as CemInboxItem[];
      }),
      buildHojaFirmaItems().catch((error) => {
        console.error('[cem-inbox] firmas hoja failed', error);
        return [] as CemInboxItem[];
      }),
    ]);

    const items = sortInboxItems([
      ...leadItems,
      ...approvalItems,
      ...hojaItems,
    ]);

    return {
      total: items.length,
      leadsSinAsignar: items.filter((item) => item.kind === 'lead-sin-asignar')
        .length,
      aprobacionesComerciales: items.filter(
        (item) => item.kind === 'aprobacion-comercial',
      ).length,
      firmasHoja: items.filter((item) => item.kind === 'firma-hoja').length,
      items,
    };
  },
};
