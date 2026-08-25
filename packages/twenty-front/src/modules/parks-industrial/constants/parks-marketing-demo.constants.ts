export type ParksMarketingCampaignStatus =
  | 'activa'
  | 'pausada'
  | 'finalizada';

export type ParksMarketingCampaignChannel =
  | 'Digital'
  | 'LinkedIn'
  | 'Broker'
  | 'Evento'
  | 'Referido'
  | 'Directo';

export type ParksMarketingCampaign = {
  id: string;
  name: string;
  channel: ParksMarketingCampaignChannel;
  status: ParksMarketingCampaignStatus;
  objective: string;
  regionFocus: string;
  spendUsd: number;
  budgetUsd: number;
  leadsGenerated: number;
  qualifiedLeads: number;
  toursBooked: number;
  m2Prospectados: number;
  startDate: string;
  endDate: string | null;
};

export type ParksMarketingNurtureTemplate = {
  id: string;
  name: string;
  channel: ParksMarketingCampaignChannel | 'Todos';
  audience: string;
  stepsCount: number;
  activeSequences: number;
  openRatePct: number;
  replyRatePct: number;
  status: 'activa' | 'borrador';
  steps: Array<{
    stepNumber: number;
    subject: string;
    scheduledIn: string;
    preview: string;
  }>;
};

export const PARKS_MARKETING_CAMPAIGNS: ParksMarketingCampaign[] = [
  {
    id: 'camp-linkedin-q3',
    name: 'LinkedIn — Demanda logística Bajío',
    channel: 'LinkedIn',
    status: 'activa',
    objective: 'Leads B2B 3,000–8,000 m² en corredor Bajío',
    regionFocus: 'Bajío',
    spendUsd: 18500,
    budgetUsd: 25000,
    leadsGenerated: 42,
    qualifiedLeads: 28,
    toursBooked: 9,
    m2Prospectados: 186000,
    startDate: '2026-07-01',
    endDate: null,
  },
  {
    id: 'camp-google-search',
    name: 'Search — Naves industriales CDMX / GDL',
    channel: 'Digital',
    status: 'activa',
    objective: 'Captura inbound de búsqueda de naves clase A',
    regionFocus: 'Nacional',
    spendUsd: 22100,
    budgetUsd: 30000,
    leadsGenerated: 67,
    qualifiedLeads: 31,
    toursBooked: 11,
    m2Prospectados: 245000,
    startDate: '2026-06-15',
    endDate: null,
  },
  {
    id: 'camp-broker-top10',
    name: 'Activación brokers Top 10',
    channel: 'Broker',
    status: 'activa',
    objective: 'Pipeline co-brokerado con partners prioritarios',
    regionFocus: 'Nacional',
    spendUsd: 8400,
    budgetUsd: 12000,
    leadsGenerated: 19,
    qualifiedLeads: 15,
    toursBooked: 7,
    m2Prospectados: 98000,
    startDate: '2026-05-01',
    endDate: null,
  },
  {
    id: 'camp-expo-logistica',
    name: 'Expo Logística Norte 2026',
    channel: 'Evento',
    status: 'finalizada',
    objective: 'Leads de manufacturing y 3PL en Monterrey',
    regionFocus: 'Noreste',
    spendUsd: 32000,
    budgetUsd: 32000,
    leadsGenerated: 54,
    qualifiedLeads: 22,
    toursBooked: 8,
    m2Prospectados: 210000,
    startDate: '2026-03-10',
    endDate: '2026-03-14',
  },
  {
    id: 'camp-referidos',
    name: 'Programa referidos inquilinos',
    channel: 'Referido',
    status: 'activa',
    objective: 'Expansión de ocupantes actuales a naves adicionales',
    regionFocus: 'Nacional',
    spendUsd: 3500,
    budgetUsd: 6000,
    leadsGenerated: 11,
    qualifiedLeads: 9,
    toursBooked: 4,
    m2Prospectados: 42000,
    startDate: '2026-04-01',
    endDate: null,
  },
  {
    id: 'camp-directo-cem',
    name: 'Outbound Director Comercial',
    channel: 'Directo',
    status: 'pausada',
    objective: 'Cuentas estratégicas high-ticket > 10,000 m²',
    regionFocus: 'Centro',
    spendUsd: 6100,
    budgetUsd: 10000,
    leadsGenerated: 8,
    qualifiedLeads: 7,
    toursBooked: 3,
    m2Prospectados: 120000,
    startDate: '2026-02-01',
    endDate: null,
  },
];

export const PARKS_MARKETING_NURTURE_TEMPLATES: ParksMarketingNurtureTemplate[] =
  [
    {
      id: 'seq-inbound-digital',
      name: 'Nutrición inbound digital',
      channel: 'Digital',
      audience: 'Leads web / search sin tour agendado',
      stepsCount: 3,
      activeSequences: 34,
      openRatePct: 41,
      replyRatePct: 9,
      status: 'activa',
      steps: [
        {
          stepNumber: 1,
          subject: 'Bienvenida industrial — Parks',
          scheduledIn: 'Inmediato',
          preview:
            'Presentación de portafolio, corredores y CTA para agendar visita.',
        },
        {
          stepNumber: 2,
          subject: 'Caso de éxito en tu giro',
          scheduledIn: 'Día 3',
          preview:
            'Historia de cliente similar, ocupación y ahorro logístico.',
        },
        {
          stepNumber: 3,
          subject: 'Disponibilidad + ficha técnica',
          scheduledIn: 'Día 7',
          preview:
            'Shortlist de naves con m², energía y link a ficha rastreable.',
        },
      ],
    },
    {
      id: 'seq-linkedin-b2b',
      name: 'Nutrición LinkedIn B2B',
      channel: 'LinkedIn',
      audience: 'Leads LinkedIn con fit score ≥ 65',
      stepsCount: 4,
      activeSequences: 18,
      openRatePct: 48,
      replyRatePct: 12,
      status: 'activa',
      steps: [
        {
          stepNumber: 1,
          subject: 'Parques cerca de tu operación',
          scheduledIn: 'Inmediato',
          preview: 'Mapa de parques alineados a la región del prospecto.',
        },
        {
          stepNumber: 2,
          subject: 'Capacidad energética y clear height',
          scheduledIn: 'Día 2',
          preview: 'Specs técnicas que suelen bloquear deals AAA.',
        },
        {
          stepNumber: 3,
          subject: 'Pre-renta en obra — ventana 2026',
          scheduledIn: 'Día 5',
          preview: 'Naves en construcción con timeline de entrega.',
        },
        {
          stepNumber: 4,
          subject: 'Agenda una visita con tu LO',
          scheduledIn: 'Día 10',
          preview: 'CTA directo a calendario del leasing officer.',
        },
      ],
    },
    {
      id: 'seq-broker-enablement',
      name: 'Enablement brokers',
      channel: 'Broker',
      audience: 'Brokers Top 10 y partners activos',
      stepsCount: 2,
      activeSequences: 12,
      openRatePct: 55,
      replyRatePct: 21,
      status: 'activa',
      steps: [
        {
          stepNumber: 1,
          subject: 'Inventario liberado esta semana',
          scheduledIn: 'Lunes',
          preview: 'Naves disponibles / en obra con comisiones vigentes.',
        },
        {
          stepNumber: 2,
          subject: 'Kit de venta + fichas',
          scheduledIn: 'Miércoles',
          preview: 'One-pagers y renders para compartir con su cliente.',
        },
      ],
    },
    {
      id: 'seq-evento-followup',
      name: 'Follow-up post evento',
      channel: 'Evento',
      audience: 'Leads captados en ferias / expos',
      stepsCount: 3,
      activeSequences: 0,
      openRatePct: 36,
      replyRatePct: 7,
      status: 'borrador',
      steps: [
        {
          stepNumber: 1,
          subject: 'Gracias por visitarnos en la expo',
          scheduledIn: 'Inmediato',
          preview: 'Resumen de parques presentados en el stand.',
        },
        {
          stepNumber: 2,
          subject: 'Propuesta de visita a parque',
          scheduledIn: 'Día 4',
          preview: 'Opciones de tour según región declarada en el badge.',
        },
        {
          stepNumber: 3,
          subject: 'Última llamada — inventario limitado',
          scheduledIn: 'Día 12',
          preview: 'Urgencia suave sobre naves con alta demanda.',
        },
      ],
    },
  ];

export const getParksMarketingCampaignCpl = (
  campaign: ParksMarketingCampaign,
): number => {
  if (campaign.leadsGenerated <= 0) {
    return 0;
  }

  return Math.round(campaign.spendUsd / campaign.leadsGenerated);
};

export const getParksMarketingCampaignQualificationRate = (
  campaign: ParksMarketingCampaign,
): number => {
  if (campaign.leadsGenerated <= 0) {
    return 0;
  }

  return Math.round(
    (campaign.qualifiedLeads / campaign.leadsGenerated) * 100,
  );
};
