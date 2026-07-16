import { t } from '@lingui/core/macro';

import { type ParksOpportunityRecord } from '@/parks-industrial/hooks/useParksRecords';

export type ParksLoAgendaItemKind = 'contacto' | 'tour';

export type ParksLoAgendaItem = {
  id: string;
  dealId: string;
  dealName: string;
  kind: ParksLoAgendaItemKind;
  label: string;
  fecha: string;
  hora?: string;
  sortKey: string;
};

const buildSortKey = (fecha: string, hora?: string): string =>
  `${fecha}T${hora?.trim() || '00:00'}`;

const isUpcomingOrToday = (fecha: string): boolean => {
  const today = new Date().toISOString().slice(0, 10);

  return fecha >= today;
};

export const buildParksLoAgendaItems = (
  deals: ParksOpportunityRecord[],
): ParksLoAgendaItem[] => {
  const items: ParksLoAgendaItem[] = [];

  for (const deal of deals) {
    if (
      deal.primerContactoFecha &&
      deal.primerContactoRealizado !== true &&
      isUpcomingOrToday(deal.primerContactoFecha)
    ) {
      items.push({
        id: `${deal.id}-contacto`,
        dealId: deal.id,
        dealName: deal.name ?? t`Sin nombre`,
        kind: 'contacto',
        label: deal.primerContactoTipo ?? t`Primer contacto`,
        fecha: deal.primerContactoFecha,
        hora: deal.primerContactoHora,
        sortKey: buildSortKey(
          deal.primerContactoFecha,
          deal.primerContactoHora,
        ),
      });
    }

    if (deal.tourFecha && isUpcomingOrToday(deal.tourFecha)) {
      items.push({
        id: `${deal.id}-tour`,
        dealId: deal.id,
        dealName: deal.name ?? t`Sin nombre`,
        kind: 'tour',
        label: t`Visita a nave`,
        fecha: deal.tourFecha,
        hora: deal.tourHora,
        sortKey: buildSortKey(deal.tourFecha, deal.tourHora),
      });
    }
  }

  return items.sort((left, right) => left.sortKey.localeCompare(right.sortKey));
};
