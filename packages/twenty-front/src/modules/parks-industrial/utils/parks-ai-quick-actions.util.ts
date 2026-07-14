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

export const buildParksCeoQuickActions = (): ParksAiQuickAction[] => [
  {
    id: 'ceo-briefing',
    label: t`Briefing del día`,
    description: t`Ocupación, pipeline y alertas en 60 segundos`,
    message: t`Actúa como mi jefe de staff. Dame el briefing ejecutivo de hoy: ocupación, MRR, riesgos legales/SLA, cobranza en riesgo y lo que requiere mi decisión.`,
    visual: 'briefing',
    action: 'general',
  },
  {
    id: 'ceo-approvals',
    label: t`Qué requiere mi firma`,
    description: t`Aprobaciones, condonaciones y firmas DG`,
    message: t`Resume qué pendientes tengo como Director General: aprobaciones comerciales, condonaciones de holdover y firmas. Prioriza por impacto y urgencia.`,
    visual: 'approvals',
    action: 'general',
  },
  {
    id: 'ceo-risk',
    label: t`Riesgos a vigilar`,
    description: t`SLA rojo, renovaciones y holdovers`,
    message: t`Muéstrame los riesgos que deben preocuparme hoy: SLA legal en rojo, renovaciones críticas, holdovers activos y cuentas con mora grave. Incluye una recomendación por cada uno.`,
    visual: 'risk',
    action: 'general',
  },
  {
    id: 'ceo-cash',
    label: t`Cobranza y cash`,
    description: t`Forecast 7/30/90 y mora`,
    message: t`Dame una lectura ejecutiva de cobranza: forecast 7/30/90, monto en riesgo, anomalías y qué cuentas afectan el board. Sé concreto y accionable.`,
    visual: 'cash',
    action: 'general',
  },
  {
    id: 'ceo-pipeline',
    label: t`Pulso comercial`,
    description: t`Deals calientes y ingreso en riesgo`,
    message: t`Resume el pulso comercial: deals más calientes del pipeline, visitas/tours recientes, ingreso en riesgo por renovaciones y dónde debería enfocar al equipo esta semana.`,
    visual: 'pipeline',
    action: 'general',
  },
];
