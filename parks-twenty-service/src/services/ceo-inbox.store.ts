import { type CeoInboxItem } from '../types/ceo-dashboard.types';

const DEMO_INBOX_ITEMS: CeoInboxItem[] = [
  {
    id: 'demo-ceo-approval-1',
    kind: 'aprobacion-comercial',
    title: 'ColdChain Logistics — condición especial',
    subtitle: 'Aprobación CEO · Pipeline',
    detail:
      'Descuento 8% año 1 + 2 meses de gracia. Supera umbral CEM.',
    amountLabel: '$186K ARR',
    priority: 'high',
    actionPath: '/parks/pipeline',
    canResolve: true,
    entityId: 'demo-ceo-approval-1',
    isDemo: true,
  },
  {
    id: 'demo-ceo-condonacion-1',
    kind: 'condonacion-holdover',
    title: 'Holdover GDL-B14 — condonación',
    subtitle: 'Legal solicita autorización',
    detail: 'Cliente solicita condonar 45 días de holdover por retraso en mudanza.',
    amountLabel: '$28,500 USD',
    priority: 'high',
    actionPath: '/parks/renovaciones',
    canResolve: true,
    entityId: 'demo-ceo-condonacion-1',
    isDemo: true,
  },
  {
    id: 'demo-ceo-firma-1',
    kind: 'firma-contrato',
    title: 'CL-2026-041 — firma Director General',
    subtitle: 'Flujo de firmas · turno CEO',
    detail: 'Subdirector Legal ya firmó. Pendiente firma física / digital del DG.',
    priority: 'normal',
    actionPath: '/parks/contratos',
    canResolve: false,
    entityId: 'demo-ceo-firma-1',
    isDemo: true,
  },
];

const dismissedDemoIds = new Set<string>();

export const ceoInboxStore = {
  listDemoItems: (): CeoInboxItem[] =>
    DEMO_INBOX_ITEMS.filter((item) => !dismissedDemoIds.has(item.id)),

  dismissDemoItem: (itemId: string): boolean => {
    if (!DEMO_INBOX_ITEMS.some((item) => item.id === itemId)) {
      return false;
    }

    dismissedDemoIds.add(itemId);
    return true;
  },

  resetDemo: (): void => {
    dismissedDemoIds.clear();
  },

  dismissAllDemoItems: (): void => {
    for (const item of DEMO_INBOX_ITEMS) {
      dismissedDemoIds.add(item.id);
    }
  },
};
