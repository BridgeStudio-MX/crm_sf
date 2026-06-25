import { t } from '@lingui/core/macro';

import { type ParksAiQuickAction } from '@/parks-industrial/types/parks-ai.types';

export const buildParksApprovalQuickActions = (): ParksAiQuickAction[] => [
  {
    id: 'checklist',
    label: t`Verificar checklist`,
    message: t`Verifica el checklist documental de este caso y dime qué falta.`,
    action: 'checklist_review',
  },
  {
    id: 'summary',
    label: t`Resumir caso`,
    message: t`Resume este caso legal para revisión de Catalina.`,
    action: 'case_summary',
  },
];

export const buildParksMapQuickActions = (): ParksAiQuickAction[] => [
  {
    id: 'availability-cdmx',
    label: t`Disponible CDMX > 5,000 m²`,
    message: t`¿Qué naves tengo disponibles en CDMX arriba de 5,000 m²?`,
    action: 'availability_search',
  },
  {
    id: 'availability-all',
    label: t`Catálogo nacional`,
    message: t`Muéstrame las naves disponibles más grandes en cartera.`,
    action: 'availability_search',
  },
];

export const buildParksDashboardQuickActions = (): ParksAiQuickAction[] => [
  {
    id: 'briefing',
    label: t`Briefing ejecutivo`,
    message: t`Dame un briefing ejecutivo de la cartera Parks: ocupación, riesgos y oportunidades.`,
    action: 'general',
  },
];
