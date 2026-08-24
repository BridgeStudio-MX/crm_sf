import { AppPath } from 'twenty-shared/types';

import {
  PARKS_INVENTORY_TOUR_TARGETS,
  type ParksGuidedTourItemCopy,
} from '@/parks-industrial/constants/parks-guided-tour.constants';

export const PARKS_INVENTORY_TOUR_PAGE_COPY: Record<
  (typeof PARKS_INVENTORY_TOUR_TARGETS)[keyof typeof PARKS_INVENTORY_TOUR_TARGETS],
  ParksGuidedTourItemCopy
> = {
  [PARKS_INVENTORY_TOUR_TARGETS.parks]: {
    title: 'Nivel 1 · Los parques',
    body: 'Empiezas aquí: cada tarjeta es un parque. Ves ocupación, naves ocupadas y leads. Si dice En construcción, ese parque o esas naves se pueden pre-rentar antes de la entrega.',
  },
  [PARKS_INVENTORY_TOUR_TARGETS.parkPipeline]: {
    title: 'Nivel 2 · Pipeline del parque',
    body: 'Al entrar a un parque ves su pipeline: todos los leads de ese parque. No es el kanban del LO; es la foto comercial del parque, incluida la pre-renta.',
  },
  [PARKS_INVENTORY_TOUR_TARGETS.naves]: {
    title: 'Nivel 2 · Tarjetas de naves',
    body: 'Cambia a Naves para ver cada nave: disponible, ocupada o en construcción. Entra a una tarjeta para bajar al pipeline de esa nave.',
  },
  [PARKS_INVENTORY_TOUR_TARGETS.nave]: {
    title: 'Nivel 3 · Pipeline de la nave',
    body: 'Esta nave está en obra y ya tiene pipeline. El flujo importante es rentarla antes de que esté lista: el deal avanza mientras se construye.',
  },
};

export const PARKS_INVENTORY_TOUR_PATH = AppPath.ParksStackingPlanIndex;
