export type BrokerNotificationType =
  | 'task'
  | 'enrichment'
  | 'alert'
  | 'email'
  | 'system';

export type BrokerNotificationPriority = 'high' | 'normal' | 'low';

export type BrokerNotification = {
  id: string;
  type: BrokerNotificationType;
  priority: BrokerNotificationPriority;
  title: string;
  body: string;
  area?: string;
  opportunityId?: string;
  opportunityName?: string;
  read: boolean;
  createdAt: string;
};

export type BrokerNotificationsResponse = {
  notifications: BrokerNotification[];
  unreadCount: number;
};

export type ProspectEnrichmentResult = {
  opportunityId: string;
  companyName: string;
  industry: string;
  employeeCountEstimate: string;
  revenueEstimateUsd: string;
  investmentSignals: string[];
  linkedInSignals: string[];
  fitScore: number;
  urgency: 'alta' | 'media' | 'baja';
  riskLevel: 'bajo' | 'medio' | 'alto';
  summary: string;
  suggestedActions: string[];
  usedLlm: boolean;
  enrichedAt: string;
};

export type NaveMatchCandidate = {
  naveId: string;
  identificador: string;
  m2: number;
  parqueNombre?: string;
  ubicacion?: string;
  precioUsdM2?: number;
  matchScore: number;
  matchReasons: string[];
};

export type NaveMatchResult = {
  opportunityId?: string;
  m2Requeridos: number;
  industry?: string;
  matches: NaveMatchCandidate[];
  totalDisponibles: number;
};

export type FichaTecnicaSentVia = 'email' | 'whatsapp' | 'link';

export type FichaTecnicaLink = {
  token: string;
  opportunityId: string;
  opportunityName: string;
  naveId: string;
  naveIdentificador: string;
  parqueNombre?: string;
  ubicacion?: string;
  m2: number;
  precioUsdM2?: number;
  publicUrl: string;
  viewCount: number;
  lastViewedAt?: string;
  sentVia: FichaTecnicaSentVia | null;
  sentAt?: string;
  createdAt: string;
};

export type SalesScriptResult = {
  opportunityId?: string;
  companyName: string;
  industry: string;
  scriptTitle: string;
  openingLine: string;
  discoveryQuestions: string[];
  valueProposition: string;
  visitAgenda: string[];
  closingLine: string;
  usedLlm: boolean;
  generatedAt: string;
};

export type ProspectScoreTier = 'hot' | 'warm' | 'cold';

export type ProspectScoreResult = {
  fitScore: number;
  urgency: 'alta' | 'media' | 'baja';
  tier: ProspectScoreTier;
  industry: string;
  scoreLabel: string;
};

export type ProspectScoresResponse = {
  scores: Record<string, ProspectScoreResult>;
};

export type EmailSequenceStep = {
  stepNumber: number;
  subject: string;
  scheduledIn: string;
  status: 'scheduled' | 'sent';
  preview: string;
};

export type EmailSequenceResult = {
  opportunityId: string;
  companyName: string;
  industry: string;
  steps: EmailSequenceStep[];
};
