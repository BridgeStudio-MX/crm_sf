import { type ParksGuidedTourItemCopy } from '@/parks-industrial/constants/parks-guided-tour.constants';
import { PARKS_DASHBOARD_MARKETING_PATH } from '@/parks-industrial/constants/parks-routes.constants';

export const PARKS_MARKETING_DASHBOARD_TOUR_TARGETS = {
  metrics: 'dash-marketing-metrics',
  channels: 'dash-marketing-channels',
  campaigns: 'dash-marketing-campaigns',
  leads: 'dash-marketing-leads',
} as const;

export type ParksMarketingDashboardTourFocus =
  (typeof PARKS_MARKETING_DASHBOARD_TOUR_TARGETS)[keyof typeof PARKS_MARKETING_DASHBOARD_TOUR_TARGETS];

export const PARKS_MARKETING_DASHBOARD_TOUR_PAGE_COPY: Record<
  ParksMarketingDashboardTourFocus,
  ParksGuidedTourItemCopy
> = {
  [PARKS_MARKETING_DASHBOARD_TOUR_TARGETS.metrics]: {
    title: '1 · KPIs de demanda',
    body: 'Campañas activas, gasto vs presupuesto, leads, % de calificación, CPL y tours. Aquí decides si el funnel de marketing está sano.',
  },
  [PARKS_MARKETING_DASHBOARD_TOUR_TARGETS.channels]: {
    title: '2 · Canales y calidad IA',
    body: 'Leads por canal de origen y distribución Hot / Warm / Cold. Prioriza presupuesto en canales que califican y generan tours, no solo volumen.',
  },
  [PARKS_MARKETING_DASHBOARD_TOUR_TARGETS.campaigns]: {
    title: '3 · Campañas en curso',
    body: 'Gasto, CPL y % calificados por campaña. Desde aquí puedes ir a Campañas para el detalle completo de presupuesto.',
  },
  [PARKS_MARKETING_DASHBOARD_TOUR_TARGETS.leads]: {
    title: '4 · Leads y fit score',
    body: 'Últimos leads con canal, etapa y calificación IA. Ábrelos en pipeline para ver el deal; Nutrición vive en el menú de Marketing.',
  },
};

export const PARKS_MARKETING_DASHBOARD_TOUR_PATH =
  PARKS_DASHBOARD_MARKETING_PATH;
