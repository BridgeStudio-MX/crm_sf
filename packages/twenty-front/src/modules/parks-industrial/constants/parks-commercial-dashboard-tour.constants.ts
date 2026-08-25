import { type ParksGuidedTourItemCopy } from '@/parks-industrial/constants/parks-guided-tour.constants';
import { PARKS_DASHBOARD_COMERCIAL_PATH } from '@/parks-industrial/constants/parks-routes.constants';

export const PARKS_COMMERCIAL_DASHBOARD_TOUR_TARGETS = {
  hero: 'dash-comercial-hero',
  metrics: 'dash-comercial-metrics',
  portfolio: 'dash-comercial-portfolio',
  cemQueue: 'dash-comercial-cem-queue',
  teamPulse: 'dash-comercial-team-pulse',
} as const;

export type ParksCommercialDashboardTourFocus =
  (typeof PARKS_COMMERCIAL_DASHBOARD_TOUR_TARGETS)[keyof typeof PARKS_COMMERCIAL_DASHBOARD_TOUR_TARGETS];

export const PARKS_COMMERCIAL_DASHBOARD_TOUR_PAGE_COPY: Record<
  ParksCommercialDashboardTourFocus,
  ParksGuidedTourItemCopy
> = {
  [PARKS_COMMERCIAL_DASHBOARD_TOUR_TARGETS.hero]: {
    title: '1 · Pulso de la cartera',
    body: 'Aquí ves ocupación global, parques activos, superficie, pipeline e ingreso estimado. Usa Pipeline, Mapa o Parques para bajar al detalle.',
  },
  [PARKS_COMMERCIAL_DASHBOARD_TOUR_TARGETS.metrics]: {
    title: '2 · Indicadores clave',
    body: 'Ocupación, naves disponibles y valor del pipeline. Te dicen si hay producto libre y cuánto negocio está en juego ahora.',
  },
  [PARKS_COMMERCIAL_DASHBOARD_TOUR_TARGETS.portfolio]: {
    title: '3 · Pipeline por parque',
    body: 'Cambia entre Parques, Lista y Mapa. Entra a un parque para ver leads y naves — incluida la pre-renta en construcción.',
  },
  [PARKS_COMMERCIAL_DASHBOARD_TOUR_TARGETS.cemQueue]: {
    title: '4 · Cola sin asignar',
    body: 'Leads nuevos esperando Director Comercial. Asígnalos a un LO desde aquí o abre la cola completa.',
  },
  [PARKS_COMMERCIAL_DASHBOARD_TOUR_TARGETS.teamPulse]: {
    title: '5 · Equipo y riesgos',
    body: 'Pipeline por LO, canales, deals en riesgo y renovaciones críticas. Prioriza al equipo y lo que no puede esperar.',
  },
};

export const PARKS_COMMERCIAL_DASHBOARD_TOUR_PATH =
  PARKS_DASHBOARD_COMERCIAL_PATH;
