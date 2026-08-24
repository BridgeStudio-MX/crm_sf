import { PARKS_INVENTORY_TOUR_TARGETS } from '@/parks-industrial/constants/parks-guided-tour.constants';
import {
  isParksParkUnderConstruction,
  type ParksPortfolioNaveItem,
  type ParksPortfolioParkRow,
} from '@/parks-industrial/utils/parks-portfolio-by-park.util';

export const pickParksInventoryTourPark = (
  parks: ParksPortfolioParkRow[],
): ParksPortfolioParkRow | null => {
  const constructionPark = parks.find((park) =>
    isParksParkUnderConstruction(park),
  );

  if (constructionPark) {
    return constructionPark;
  }

  const parkWithConstructionNave = parks.find(
    (park) => park.constructionNaveCount > 0,
  );

  return parkWithConstructionNave ?? parks[0] ?? null;
};

export const pickParksInventoryTourNave = (
  park: ParksPortfolioParkRow | null,
): ParksPortfolioNaveItem | null => {
  if (!park) {
    return null;
  }

  const constructionNaves = park.allNaves.filter(
    (nave) => nave.kind === 'construccion',
  );
  const constructionWithLeads = constructionNaves.find(
    (nave) => nave.leads.length > 0,
  );

  return (
    constructionWithLeads ??
    constructionNaves[0] ??
    park.allNaves[0] ??
    null
  );
};

export const resolveParksInventoryTourSelection = (
  parks: ParksPortfolioParkRow[],
  inventoryFocus:
    | (typeof PARKS_INVENTORY_TOUR_TARGETS)[keyof typeof PARKS_INVENTORY_TOUR_TARGETS]
    | undefined,
): {
  selectedParkId: string | null;
  selectedNaveId: string | null;
  parkView: 'pipeline' | 'naves';
} => {
  const tourPark = pickParksInventoryTourPark(parks);
  const tourNave = pickParksInventoryTourNave(tourPark);

  if (!inventoryFocus || inventoryFocus === PARKS_INVENTORY_TOUR_TARGETS.parks) {
    return {
      selectedParkId: null,
      selectedNaveId: null,
      parkView: 'pipeline',
    };
  }

  if (inventoryFocus === PARKS_INVENTORY_TOUR_TARGETS.nave) {
    return {
      selectedParkId: tourPark?.parqueId ?? null,
      selectedNaveId: tourNave?.id ?? null,
      parkView: 'naves',
    };
  }

  return {
    selectedParkId: tourPark?.parqueId ?? null,
    selectedNaveId: null,
    parkView:
      inventoryFocus === PARKS_INVENTORY_TOUR_TARGETS.naves
        ? 'naves'
        : 'pipeline',
  };
};
