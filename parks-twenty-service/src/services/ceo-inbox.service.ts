import {
  CASO_LEGAL_ESTATUS_FLUJO_FIRMAS,
  FLUJO_FIRMAS_ESTATUS_ENVIADO,
} from '../constants/parks.constants';
import {
  type CeoInboxItem,
  type CeoInboxSummary,
} from '../types/ceo-dashboard.types';
import { isSelectValueEqual, toSelectValue } from '../utils/select-value.util';
import { ceoInboxStore } from './ceo-inbox.store';
import { holdoverCondonacionService } from './holdover-condonacion.service';
import { twentyDataService } from './twenty-data.service';

const CEO_APPROVAL_LEVEL = 'CEO';
const PENDING_APPROVAL_STATUS = 'Pendiente';
const DIRECTOR_GENERAL_ROL = 'Director General';

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

const buildCommercialItems = async (): Promise<CeoInboxItem[]> => {
  const opportunities = await twentyDataService.findOpportunitiesSummary();

  return opportunities
    .filter(
      (opportunity) =>
        opportunity.aprobacionRequerida === true &&
        isSelectValueEqual(opportunity.nivelAprobacion, CEO_APPROVAL_LEVEL) &&
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
        subtitle: 'Aprobación CEO · condiciones especiales',
        detail:
          opportunity.comentarioAprobacion?.trim() ||
          'Condiciones especiales pendientes de autorización del Director General.',
        amountLabel: formatUsdCompact(amountUsd),
        priority: 'high' as const,
        actionPath: `/object/opportunity/${opportunity.id}`,
        canResolve: true,
        entityId: opportunity.id,
        createdAt: opportunity.updatedAt,
      };
    });
};

const buildCondonacionItems = async (): Promise<CeoInboxItem[]> => {
  const pending = await holdoverCondonacionService.listPendingCondonaciones();

  return pending.map((holdover) => {
    const holdoverRecord = holdover as {
      id: string;
      referencia?: string;
      condonacionMotivo?: string;
      montoCondonado?: number;
      inquilino?: { empresa?: string };
      nave?: { identificador?: string };
    };

    const empresa = holdoverRecord.inquilino?.empresa ?? 'Inquilino';
    const nave = holdoverRecord.nave?.identificador ?? '—';

    return {
      id: `condonacion-${holdoverRecord.id}`,
      kind: 'condonacion-holdover' as const,
      title: `${empresa} · ${nave}`,
      subtitle: `Condonación holdover${
        holdoverRecord.referencia ? ` · ${holdoverRecord.referencia}` : ''
      }`,
      detail:
        holdoverRecord.condonacionMotivo?.trim() ||
        'Legal solicita autorización de condonación.',
      amountLabel: formatUsdCompact(holdoverRecord.montoCondonado),
      priority: 'high' as const,
      actionPath: '/parks/renovaciones',
      canResolve: true,
      entityId: holdoverRecord.id,
    };
  });
};

const buildFirmaItems = async (): Promise<CeoInboxItem[]> => {
  const casosLegales = await twentyDataService.findCasosLegalesActivos();
  const casosEnFirmas = casosLegales.filter((casoLegal) =>
    isSelectValueEqual(casoLegal.estatus, CASO_LEGAL_ESTATUS_FLUJO_FIRMAS),
  );

  const items: CeoInboxItem[] = [];

  for (const casoLegal of casosEnFirmas) {
    const pasos = await twentyDataService.findFlujosFirmasByCasoLegal(
      casoLegal.id,
    );

    const pasoCeo = pasos.find(
      (paso) =>
        isSelectValueEqual(paso.rol, DIRECTOR_GENERAL_ROL) &&
        isSelectValueEqual(paso.estatus, FLUJO_FIRMAS_ESTATUS_ENVIADO),
    );

    if (!pasoCeo) {
      continue;
    }

    const empresa = casoLegal.inquilino?.empresa ?? 'Cliente';
    const nave = casoLegal.nave?.identificador ?? '—';

    items.push({
      id: `firma-${pasoCeo.id}`,
      kind: 'firma-contrato',
      title: `${casoLegal.referencia ?? casoLegal.id} — firma DG`,
      subtitle: `${empresa} · ${nave}`,
      detail: 'Tu turno en el flujo de firmas (Director General).',
      priority: 'normal',
      actionPath: `/parks/contratos/${casoLegal.id}/aprobacion`,
      canResolve: false,
      entityId: casoLegal.id,
    });
  }

  return items;
};

const sortInboxItems = (items: CeoInboxItem[]): CeoInboxItem[] =>
  [...items].sort((leftItem, rightItem) => {
    if (leftItem.priority !== rightItem.priority) {
      return leftItem.priority === 'high' ? -1 : 1;
    }

    return leftItem.title.localeCompare(rightItem.title, 'es');
  });

export const ceoInboxService = {
  getInbox: async (): Promise<CeoInboxSummary> => {
    const [commercialItems, condonacionItems, firmaItems] = await Promise.all([
      buildCommercialItems().catch((error) => {
        console.error('[ceo-inbox] commercial approvals failed', error);
        return [] as CeoInboxItem[];
      }),
      buildCondonacionItems().catch((error) => {
        console.error('[ceo-inbox] condonaciones failed', error);
        return [] as CeoInboxItem[];
      }),
      buildFirmaItems().catch((error) => {
        console.error('[ceo-inbox] firmas failed', error);
        return [] as CeoInboxItem[];
      }),
    ]);

    const liveItems = sortInboxItems([
      ...commercialItems,
      ...condonacionItems,
      ...firmaItems,
    ]);

    // Si no hay pendientes reales, mostrar demo para que el CEO vea la bandeja
    const items =
      liveItems.length > 0
        ? liveItems
        : sortInboxItems(ceoInboxStore.listDemoItems());

    return {
      total: items.length,
      aprobacionesComerciales: items.filter(
        (item) => item.kind === 'aprobacion-comercial',
      ).length,
      condonaciones: items.filter(
        (item) => item.kind === 'condonacion-holdover',
      ).length,
      firmas: items.filter((item) => item.kind === 'firma-contrato').length,
      items,
    };
  },

  dismissDemoItem: (itemId: string): boolean =>
    ceoInboxStore.dismissDemoItem(itemId),

  isPendingSelectValue: (value?: string | null): boolean =>
    isSelectValueEqual(value, PENDING_APPROVAL_STATUS) ||
    value === toSelectValue(PENDING_APPROVAL_STATUS),
};
