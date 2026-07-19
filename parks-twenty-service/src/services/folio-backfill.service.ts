import { allocateNextFolio, isValidFolio } from './folio.store';
import { twentyClient } from './twenty.client';
import { twentyDataService } from './twenty-data.service';

type OpportunityFolioNode = {
  id: string;
  name?: string;
  folio?: string | null;
};

export const folioBackfillService = {
  backfillMissingOpportunityFolios: async (): Promise<{
    updated: number;
    skipped: number;
    folios: string[];
  }> => {
    const response = await twentyClient.query<{
      opportunities: {
        edges: Array<{ node: OpportunityFolioNode }>;
      };
    }>(
      `
      query ListOpportunitiesForFolioBackfill {
        opportunities(first: 500, orderBy: [{ createdAt: AscNullsLast }]) {
          edges {
            node {
              id
              name
              folio
            }
          }
        }
      }
    `,
    );

    const opportunities = response.opportunities.edges.map(
      (edge) => edge.node,
    );
    const casos = await twentyDataService.findAllCasosLegales();
    let updated = 0;
    let skipped = 0;
    const folios: string[] = [];

    for (const opportunity of opportunities) {
      if (isValidFolio(opportunity.folio)) {
        skipped += 1;
        continue;
      }

      const folio = allocateNextFolio();

      await twentyDataService.updateOpportunity(opportunity.id, { folio });

      const hoja = await twentyDataService.findHojaDeAcuerdosByOpportunity(
        opportunity.id,
      );

      if (hoja?.id) {
        try {
          await twentyClient.mutate(
            `
            mutation UpdateHojaFolio($hojaId: UUID!, $data: HojaDeAcuerdosUpdateInput!) {
              updateHojaDeAcuerdos(id: $hojaId, data: $data) {
                id
                folio
              }
            }
          `,
            {
              hojaId: hoja.id,
              data: {
                folio,
                referencia: `${folio} · Hoja de Acuerdos`,
              },
            },
          );
        } catch (error) {
          console.warn(
            `[folio-backfill] Could not update hoja for opportunity ${opportunity.id}`,
            error,
          );
        }
      }

      const caso = casos.find(
        (item) =>
          item.hojaDeAcuerdosId === hoja?.id ||
          (item.referencia &&
            opportunity.name &&
            item.referencia.includes(opportunity.name.slice(0, 20))),
      );

      if (caso?.id && !isValidFolio(caso.folio)) {
        try {
          await twentyDataService.updateCasoLegal(caso.id, {
            folio,
            referencia: folio,
          });
        } catch (error) {
          console.warn(
            `[folio-backfill] Could not update caso legal ${caso.id}`,
            error,
          );
        }
      }

      folios.push(folio);
      updated += 1;
    }

    return { updated, skipped, folios };
  },
};
